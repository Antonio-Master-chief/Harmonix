import os
import logging
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.requests import Request

from algorithm import (
    preprocess,
    extract_pitch_frames,
    segment_notes,
    build_fingerprint,
    vote_candidates,
    rank_candidates,
    pick_best,
    extract_chroma,
    estimate_key,
    check_audio_quality,
    separate_vocals,
    notes_from_midi,
)
from algorithm.fingerprinter import contour_match_score
from db import get_client
from middleware.auth import require_auth, optional_auth, require_admin

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
)
log = logging.getLogger("harmonix")

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Harmonix API starting up")
    yield
    log.info("Harmonix API shutting down")


app = FastAPI(title="Harmonix API", version="2.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Shared audio pipeline
# ---------------------------------------------------------------------------

def _run_pipeline(file_bytes: bytes, is_polyphonic: bool = False):
    """
    Preprocesses audio through the full pipeline.
    is_polyphonic: run Demucs vocal separation first (for library ingestion).
    Returns (notes, fingerprint, processed_audio, chroma).
    """
    try:
        audio = preprocess(file_bytes)
    except Exception as e:
        raise HTTPException(400, f"Cannot decode audio: {e}. "
                                  "Supported formats: WAV, MP3, OGG, WebM, FLAC.")

    quality = check_audio_quality(audio)   # raises HTTPException with friendly msg if bad
    log.info("Audio quality: %s", quality)

    if is_polyphonic:
        log.info("Running vocal separation (polyphonic mode)")
        audio = separate_vocals(audio)

    frames = extract_pitch_frames(audio)
    if len(frames) < 15:
        raise HTTPException(422,
            "Not enough pitched audio detected. "
            "Sing, hum, or whistle clearly for at least 3 seconds.")

    notes = segment_notes(frames)
    if len(notes) < 6:
        raise HTTPException(422,
            f"Only {len(notes)} note(s) detected. "
            "Please sing at least 6 distinct notes.")

    fp = build_fingerprint(notes)
    if fp is None:
        raise HTTPException(422,
            "Could not build fingerprint. Sing a bit louder and more clearly.")

    try:
        chroma = extract_chroma(audio)
    except Exception:
        chroma = None

    return notes, fp, audio, chroma


# ---------------------------------------------------------------------------
# POST /identify
# ---------------------------------------------------------------------------

@app.post("/identify")
@limiter.limit("20/minute")
async def identify(
    request: Request,
    audio: UploadFile = File(...),
    user: Optional[dict] = Depends(optional_auth),
):
    """
    Identify a song from microphone input, humming, whistling, or audio file.

    Accepts: WAV, MP3, OGG, WebM, FLAC
    Returns: best match with confidence, key detected, debug info
    """
    file_bytes = await audio.read()
    log.info("Identify request — file: %s, size: %d bytes", audio.filename, len(file_bytes))

    notes, fp, audio_arr, query_chroma = _run_pipeline(file_bytes)

    key_info = estimate_key(notes)
    log.info("Detected key: %s (conf %.2f)", key_info["key"], key_info["confidence"])

    db = get_client()

    # Collect all n-gram hashes from both step sizes and both resolutions
    all_hashes = list({ng.hash_fine for ng in fp.ngrams} |
                      {ng.hash_coarse for ng in fp.ngrams})

    resp = (
        db.table("fingerprints")
        .select("song_id, position, ngram_hash, resolution, step_size")
        .in_("ngram_hash", all_hashes)
        .execute()
    )
    db_rows = resp.data
    log.info("DB returned %d matching fingerprint rows from %d query hashes",
             len(db_rows), len(all_hashes))

    if not db_rows:
        return _no_match(notes, fp, key_info)

    # Stage 1: vote
    candidates = vote_candidates(fp, db_rows)
    log.info("Candidates after voting: %d", len(candidates))

    if not candidates:
        return _no_match(notes, fp, key_info)

    # Fetch full data for top 5 candidates
    top_ids = sorted(candidates, key=lambda x: -candidates[x]["vote_count"])[:5]
    songs_resp = (
        db.table("songs")
        .select("id, title, artist, album, genre, intervals_s1, intervals_s2, contour, chroma_mean")
        .in_("id", top_ids)
        .execute()
    )

    song_data = {}
    for s in songs_resp.data:
        song_data[s["id"]] = {
            "intervals_s1": s.get("intervals_s1") or [],
            "intervals_s2": s.get("intervals_s2") or [],
            "contour":      s.get("contour") or [],
            "chroma":       _chroma_from_mean(s.get("chroma_mean")),
            "title":        s["title"],
            "artist":       s["artist"],
            "album":        s.get("album"),
            "genre":        s.get("genre"),
        }

    # Stage 2+3: contour filter → DTW → chromagram
    ranked = rank_candidates(fp, candidates, song_data, query_chroma=query_chroma)
    best   = pick_best(ranked)

    if best is None:
        log.info("No confident match after ranking (best: %s)", ranked[0] if ranked else None)
        return _no_match(notes, fp, key_info)

    meta = song_data[best["song_id"]]
    log.info("Match found: %s — %s (conf %.3f)", meta["artist"], meta["title"], best["confidence"])

    # Log to history (non-blocking)
    _log_history(db, user, best["song_id"], best["confidence"], len(notes), matched=True)

    return {
        "match": {
            "song_id":       best["song_id"],
            "title":         meta["title"],
            "artist":        meta["artist"],
            "album":         meta.get("album"),
            "genre":         meta.get("genre"),
            "confidence":    best["confidence"],
            "dtw_distance":  best["dtw_distance"],
            "votes":         best["vote_count"],
            "fine_votes":    best["fine_votes"],
            "skip_votes":    best["skip_votes"],
            "contour_score": best["contour_score"],
            "chroma_score":  best["chroma_score"],
        },
        "key_detected":       key_info,
        "notes_detected":     len(notes),
        "intervals_detected": len(fp.intervals_s1),
        "debug": {
            "candidates_voted":  len(candidates),
            "candidates_ranked": len(ranked),
        },
    }


def _no_match(notes, fp, key_info):
    return {
        "match":              None,
        "message":            "No match found in library",
        "key_detected":       key_info,
        "notes_detected":     len(notes),
        "intervals_detected": len(fp.intervals_s1),
    }


def _chroma_from_mean(mean_list) -> Optional[object]:
    if not mean_list:
        return None
    import numpy as np
    return np.array(mean_list).reshape(12, 1)


def _log_history(db, user, song_id, confidence, note_count, matched):
    try:
        row = {
            "song_id":    song_id,
            "confidence": confidence,
            "matched":    matched,
            "note_count": note_count,
        }
        if user:
            row["user_id"] = user.get("sub")
        db.table("search_history").insert(row).execute()
    except Exception as e:
        log.warning("Failed to log history: %s", e)


# ---------------------------------------------------------------------------
# POST /library/add   (admin only)
# ---------------------------------------------------------------------------

@app.post("/library/add")
async def add_song(
    audio:        UploadFile = File(...),
    title:        str = "",
    artist:       str = "",
    album:        Optional[str] = None,
    genre:        Optional[str] = None,
    is_polyphonic: bool = False,
    _admin: None  = Depends(require_admin),
):
    """
    Add a song to the recognition library.
    Set is_polyphonic=true for full-band recordings (runs Demucs vocal separation).
    Set is_polyphonic=false for clean vocal/instrument recordings.
    """
    if not title or not artist:
        raise HTTPException(400, "title and artist are required")

    file_bytes = await audio.read()
    log.info("Adding song: %s — %s (%s, polyphonic=%s)", artist, title, audio.filename, is_polyphonic)

    notes, fp, audio_arr, chroma = _run_pipeline(file_bytes, is_polyphonic=is_polyphonic)

    # Check for duplicates (same interval fingerprint)
    _check_duplicate(fp, title, artist)

    db = get_client()

    # Store mean chromagram vector (12 floats) for fast comparison
    chroma_mean = chroma.mean(axis=1).tolist() if chroma is not None else None

    song_resp = (
        db.table("songs")
        .insert({
            "title":        title,
            "artist":       artist,
            "album":        album,
            "genre":        genre,
            "intervals_s1": fp.intervals_s1,
            "intervals_s2": fp.intervals_s2,
            "contour":      fp.contour,
            "chroma_mean":  chroma_mean,
            "note_count":   fp.note_count,
            "duration":     notes[-1].end if notes else 0,
        })
        .execute()
    )

    song_id = song_resp.data[0]["id"]
    log.info("Created song record: %s", song_id)

    # Insert all n-gram rows (both step-sizes, both resolutions)
    rows = []
    for ng in fp.ngrams:
        rows.append({
            "song_id":    song_id,
            "ngram_hash": ng.hash_fine,
            "position":   ng.position,
            "resolution": "fine",
            "step_size":  ng.step_size,
        })
        rows.append({
            "song_id":    song_id,
            "ngram_hash": ng.hash_coarse,
            "position":   ng.position,
            "resolution": "coarse",
            "step_size":  ng.step_size,
        })

    BATCH = 500
    for i in range(0, len(rows), BATCH):
        db.table("fingerprints").insert(rows[i : i + BATCH]).execute()

    log.info("Stored %d fingerprint rows for song %s", len(rows), song_id)

    return {
        "song_id":         song_id,
        "title":           title,
        "artist":          artist,
        "notes_extracted": fp.note_count,
        "ngrams_stored":   len(rows),
        "step1_ngrams":    sum(1 for ng in fp.ngrams if ng.step_size == 1),
        "step2_ngrams":    sum(1 for ng in fp.ngrams if ng.step_size == 2),
    }


# ---------------------------------------------------------------------------
# POST /library/add-midi   (admin only)
# ---------------------------------------------------------------------------

@app.post("/library/add-midi")
async def add_song_from_midi(
    midi: UploadFile = File(...),
    title:  str = "",
    artist: str = "",
    album:  Optional[str] = None,
    genre:  Optional[str] = None,
    _admin: None = Depends(require_admin),
):
    """
    Add a song using a MIDI file — perfect-accuracy reference, no pitch extraction uncertainty.
    Ideal for building the initial test library.
    """
    if not title or not artist:
        raise HTTPException(400, "title and artist are required")

    import tempfile, os as _os
    file_bytes = await midi.read()
    with tempfile.NamedTemporaryFile(suffix=".mid", delete=False) as f:
        f.write(file_bytes)
        tmp_path = f.name

    try:
        notes = notes_from_midi(tmp_path)
    except ImportError:
        raise HTTPException(501, "mido not installed. Run: pip install mido")
    finally:
        _os.unlink(tmp_path)

    if len(notes) < 6:
        raise HTTPException(422, f"Only {len(notes)} notes in MIDI file.")

    fp = build_fingerprint(notes)
    if fp is None:
        raise HTTPException(422, "Could not build fingerprint from MIDI.")

    db = get_client()

    song_resp = (
        db.table("songs")
        .insert({
            "title":        title,
            "artist":       artist,
            "album":        album,
            "genre":        genre,
            "intervals_s1": fp.intervals_s1,
            "intervals_s2": fp.intervals_s2,
            "contour":      fp.contour,
            "chroma_mean":  None,
            "note_count":   fp.note_count,
            "duration":     notes[-1].end if notes else 0,
        })
        .execute()
    )
    song_id = song_resp.data[0]["id"]

    rows = []
    for ng in fp.ngrams:
        rows.append({"song_id": song_id, "ngram_hash": ng.hash_fine,   "position": ng.position, "resolution": "fine",   "step_size": ng.step_size})
        rows.append({"song_id": song_id, "ngram_hash": ng.hash_coarse, "position": ng.position, "resolution": "coarse", "step_size": ng.step_size})

    BATCH = 500
    for i in range(0, len(rows), BATCH):
        db.table("fingerprints").insert(rows[i : i + BATCH]).execute()

    return {
        "song_id":         song_id,
        "title":           title,
        "artist":          artist,
        "notes_extracted": fp.note_count,
        "ngrams_stored":   len(rows),
        "source":          "midi",
    }


# ---------------------------------------------------------------------------
# GET /library
# ---------------------------------------------------------------------------

@app.get("/library")
async def list_library(
    limit:  int = Query(50, le=200),
    offset: int = Query(0, ge=0),
):
    db = get_client()
    resp = (
        db.table("songs")
        .select("id, title, artist, album, genre, duration, note_count, created_at")
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return {"songs": resp.data, "count": len(resp.data)}


# ---------------------------------------------------------------------------
# GET /songs/{id}
# ---------------------------------------------------------------------------

@app.get("/songs/{song_id}")
async def get_song(song_id: str):
    db = get_client()
    resp = (
        db.table("songs")
        .select("id, title, artist, album, genre, duration, note_count, created_at")
        .eq("id", song_id)
        .single()
        .execute()
    )
    if not resp.data:
        raise HTTPException(404, "Song not found")
    return resp.data


# ---------------------------------------------------------------------------
# DELETE /library/{song_id}   (admin only)
# ---------------------------------------------------------------------------

@app.delete("/library/{song_id}")
async def remove_song(
    song_id: str,
    _admin: None = Depends(require_admin),
):
    db = get_client()
    db.table("songs").delete().eq("id", song_id).execute()
    log.info("Deleted song: %s", song_id)
    return {"deleted": song_id}


# ---------------------------------------------------------------------------
# GET /user/history   (auth required)
# ---------------------------------------------------------------------------

@app.get("/user/history")
@limiter.limit("30/minute")
async def user_history(
    request: Request,
    limit:   int = Query(20, le=100),
    user:    dict = Depends(require_auth),
):
    db = get_client()
    resp = (
        db.table("search_history")
        .select("id, song_id, confidence, matched, note_count, searched_at, songs(title, artist)")
        .eq("user_id", user["sub"])
        .order("searched_at", desc=True)
        .limit(limit)
        .execute()
    )
    return {"history": resp.data}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _check_duplicate(fp, title: str, artist: str):
    """Log a warning if a very similar song already exists. Non-blocking."""
    try:
        db = get_client()
        resp = (
            db.table("songs")
            .select("id, title, artist")
            .ilike("title", f"%{title}%")
            .ilike("artist", f"%{artist}%")
            .execute()
        )
        if resp.data:
            log.warning("Possible duplicate: %s already has %d similar entry/entries",
                        f"{artist} — {title}", len(resp.data))
    except Exception:
        pass


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "version": "2.0.0"}


@app.get("/health/detailed")
async def health_detailed():
    try:
        db = get_client()
        db.table("songs").select("id").limit(1).execute()
        db_status = "ok"
    except Exception as e:
        db_status = f"error: {e}"

    return {
        "status":   "ok" if db_status == "ok" else "degraded",
        "version":  "2.0.0",
        "database": db_status,
    }
