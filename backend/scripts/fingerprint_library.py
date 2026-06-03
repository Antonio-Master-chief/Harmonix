#!/usr/bin/env python3
"""
fingerprint_library.py
Fingerprints every song in the Supabase library that has no n-grams yet.

Usage (from the backend/ directory):
    py -3 scripts/fingerprint_library.py              # all pending
    py -3 scripts/fingerprint_library.py --limit 5   # first 5 only
    py -3 scripts/fingerprint_library.py --dry-run   # list without processing
"""

import os, sys, time, argparse, tempfile, subprocess
import librosa
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from db import get_client
from algorithm import extract_pitch_frames, segment_notes, build_fingerprint, extract_chroma
from algorithm.preprocessor import (
    normalize, highpass_filter, reduce_noise,
    isolate_harmonic, trim_silence, preemphasis,
)

SAMPLE_RATE   = 22050
CLIP_OFFSET   = 20.0    # start 20 s in — skip intros
CLIP_DURATION = 75.0    # grab 75 s — covers first chorus and beyond


# ---------------------------------------------------------------------------
# DB helpers
# ---------------------------------------------------------------------------

def get_pending(db, limit=None):
    """Songs that have no rows in the fingerprints table yet."""
    done_ids = {r["song_id"] for r in
                db.table("fingerprints").select("song_id").execute().data}
    all_songs = (db.table("songs")
                   .select("id, title, artist")
                   .order("created_at")
                   .execute().data)
    pending = [s for s in all_songs if s["id"] not in done_ids]
    return pending[:limit] if limit else pending


def store_fingerprint(db, song_id, fp, chroma_mean):
    """Update the songs row and insert all n-gram rows into fingerprints."""
    db.table("songs").update({
        "intervals_s1": fp.intervals_s1,
        "intervals_s2": fp.intervals_s2,
        "contour":      fp.contour,
        "chroma_mean":  chroma_mean,
        "note_count":   fp.note_count,
    }).eq("id", song_id).execute()

    rows = []
    for ng in fp.ngrams:
        rows.append({"song_id": song_id, "ngram_hash": ng.hash_fine,
                     "position": ng.position, "resolution": "fine",
                     "step_size": ng.step_size})
        rows.append({"song_id": song_id, "ngram_hash": ng.hash_coarse,
                     "position": ng.position, "resolution": "coarse",
                     "step_size": ng.step_size})

    BATCH = 500
    for i in range(0, len(rows), BATCH):
        db.table("fingerprints").insert(rows[i:i + BATCH]).execute()

    return len(rows)


# ---------------------------------------------------------------------------
# Download
# ---------------------------------------------------------------------------

def download_audio(title, artist, out_dir):
    """
    Download the full audio of the best YouTube match via yt-dlp (as Python module).
    Returns the local path to the MP3 file, or None on failure.
    We download full audio then trim in Python — avoids the ffmpeg 403 stream-seek bug
    that occurs when using --download-sections.
    """
    query   = f"{artist} {title} official audio"
    out_tpl = os.path.join(out_dir, "audio.%(ext)s")

    cmd = [
        sys.executable, "-m", "yt_dlp",
        f"ytsearch1:{query}",
        "--extract-audio",
        "--audio-format", "mp3",
        "--audio-quality", "5",      # ~128 kbps — fine for pitch detection
        "--no-playlist",
        "--max-downloads", "1",
        "--output", out_tpl,
        "--quiet", "--no-warnings",
    ]

    try:
        r = subprocess.run(cmd, timeout=180, capture_output=True, text=True)
        # 0 = success, 101 = --max-downloads limit reached (expected when using --max-downloads 1)
        if r.returncode not in (0, 101):
            return None
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return None

    files = [f for f in os.listdir(out_dir) if f.startswith("audio.")]
    return os.path.join(out_dir, files[0]) if files else None


# ---------------------------------------------------------------------------
# Fingerprint pipeline
# ---------------------------------------------------------------------------

def fingerprint_file(path):
    """
    Load CLIP_OFFSET .. CLIP_OFFSET+CLIP_DURATION from the audio file,
    run the preprocessing + pitch + notes + fingerprint chain,
    return (IntervalFingerprint, chroma_mean).
    Raises ValueError with a descriptive message on failure.
    """
    # Load only the chorus region — avoids downloading/processing full 4-min song
    try:
        audio, _ = librosa.load(
            path, sr=SAMPLE_RATE, mono=True,
            offset=CLIP_OFFSET, duration=CLIP_DURATION,
        )
    except Exception as e:
        raise ValueError(f"librosa could not load file: {e}")

    if len(audio) < SAMPLE_RATE * 5:
        raise ValueError("loaded clip shorter than 5 s")

    # Preprocessing chain (mirrors preprocess() but skips the file-decode step)
    audio = normalize(audio)
    audio = highpass_filter(audio)
    audio = reduce_noise(audio)
    audio = isolate_harmonic(audio)
    audio = normalize(audio)
    audio = trim_silence(audio, top_db=35)
    audio = preemphasis(audio)

    frames = extract_pitch_frames(audio)
    if len(frames) < 10:
        raise ValueError(f"only {len(frames)} voiced frames — melody too sparse")

    notes = segment_notes(frames)
    if len(notes) < 5:
        raise ValueError(f"only {len(notes)} notes detected")

    fp = build_fingerprint(notes)
    if fp is None:
        raise ValueError("fingerprint returned None")

    try:
        chroma      = extract_chroma(audio)
        chroma_mean = chroma.mean(axis=1).tolist() if chroma is not None else None
    except Exception:
        chroma_mean = None

    return fp, chroma_mean


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description="Fingerprint the Harmonix song library")
    ap.add_argument("--limit",   type=int, default=None, help="Max songs to process")
    ap.add_argument("--dry-run", action="store_true",    help="List without processing")
    args = ap.parse_args()

    db      = get_client()
    pending = get_pending(db, limit=args.limit)

    print(f"\nHarmonix Library Fingerprinter")
    print(f"{len(pending)} song(s) to process\n")

    if args.dry_run:
        for s in pending:
            print(f"  {s['artist']} -- {s['title']}")
        print()
        return

    ok = fail = 0

    for idx, song in enumerate(pending, 1):
        title  = song["title"]
        artist = song["artist"]
        sid    = song["id"]

        print(f"[{idx:3}/{len(pending)}]  {artist} -- {title}")

        with tempfile.TemporaryDirectory() as tmp:
            sys.stdout.write("          > downloading ...  ")
            sys.stdout.flush()

            path = download_audio(title, artist, tmp)
            if not path:
                print("SKIP (not found on YouTube / timeout)")
                fail += 1
                continue

            kb = os.path.getsize(path) // 1024
            sys.stdout.write(f"OK ({kb} KB)   processing ...  ")
            sys.stdout.flush()

            try:
                fp, chroma_mean = fingerprint_file(path)
                n = store_fingerprint(db, sid, fp, chroma_mean)
                print(f"DONE -- {fp.note_count} notes, {n} n-grams")
                ok += 1
            except Exception as e:
                print(f"FAIL ({e})")
                fail += 1

        time.sleep(0.3)

    print(f"\n{'-' * 54}")
    print(f"Done -- {ok} fingerprinted   {fail} skipped/failed")
    print(f"{'-' * 54}\n")


if __name__ == "__main__":
    main()
