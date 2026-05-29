"""
Three-stage matching pipeline:

Stage 1 — Weighted n-gram voting
  Fine match (step-1)   → weight 4
  Coarse match (step-1) → weight 2
  Fine match (step-2)   → weight 2   (user skipped notes)
  Coarse match (step-2) → weight 1
  Votes are bucketed by (song_id, position_offset) — same offset from
  multiple n-grams is strong evidence of a real match.

Stage 2 — Contour pre-filter
  Reject candidates with melodic contour similarity < 0.50.
  This is O(n) and eliminates false-positive vote leaders instantly.

Stage 3 — DTW with sliding window + chromagram verification
  Dynamic Time Warping with Sakoe-Chiba band handles tempo drift,
  missed notes, slightly wrong intervals.
  Slides query over full song → user can start singing anywhere.
  Chromagram similarity is the final sanity check — an independent
  harmonic-content comparison that flags false-positive DTW wins.
"""

from collections import defaultdict
import numpy as np

from .fingerprinter import IntervalFingerprint, contour_match_score

MIN_VOTES           = 3
CONTOUR_MIN         = 0.50
DTW_BAND            = 0.20
CONFIDENCE_CUTOFF   = 0.28
CHROMA_MIN          = 0.35    # chromagram sanity check floor

# Vote weights by (resolution, step_size)
VOTE_WEIGHTS = {
    ("fine",   1): 4,
    ("coarse", 1): 2,
    ("fine",   2): 2,
    ("coarse", 2): 1,
}


# ---------------------------------------------------------------------------
# Stage 1 — Voting
# ---------------------------------------------------------------------------

def vote_candidates(
    query_fp: IntervalFingerprint,
    db_rows: list[dict],
) -> dict[str, dict]:
    """
    db_rows: [{song_id, position, ngram_hash, resolution, step_size}]
    Returns: {song_id: {vote_count, fine_votes, coarse_votes, skip_votes, offset}}
    """
    query_lookup: dict[int, int] = {}
    for ng in query_fp.ngrams:
        query_lookup[ng.hash_fine]   = ng.position
        query_lookup[ng.hash_coarse] = ng.position

    # {song_id: {offset: weighted_count}}
    offset_votes: dict[str, dict[int, float]] = defaultdict(lambda: defaultdict(float))
    detail: dict[str, dict] = defaultdict(lambda: {"fine": 0, "coarse": 0, "skip": 0})

    for row in db_rows:
        h        = row["ngram_hash"]
        song_id  = row["song_id"]
        db_pos   = row["position"]
        res      = row.get("resolution", "fine")
        step     = row.get("step_size", 1)

        if h not in query_lookup:
            continue

        offset = db_pos - query_lookup[h]
        weight = VOTE_WEIGHTS.get((res, step), 1)
        offset_votes[song_id][offset] += weight

        d = detail[song_id]
        if step == 2:
            d["skip"] += 1
        elif res == "fine":
            d["fine"] += 1
        else:
            d["coarse"] += 1

    candidates = {}
    for song_id, offset_map in offset_votes.items():
        best_offset = max(offset_map, key=offset_map.get)
        best_weight = offset_votes[song_id][best_offset]

        if best_weight >= MIN_VOTES:
            d = detail[song_id]
            candidates[song_id] = {
                "vote_count":   best_weight,
                "fine_votes":   d["fine"],
                "coarse_votes": d["coarse"],
                "skip_votes":   d["skip"],
                "offset":       best_offset,
            }

    return candidates


# ---------------------------------------------------------------------------
# Stage 2 — Contour pre-filter (free)
# ---------------------------------------------------------------------------

def _passes_contour(query_fp: IntervalFingerprint, song_contour: list[int]) -> tuple[bool, float]:
    score = contour_match_score(query_fp.contour, song_contour)
    return score >= CONTOUR_MIN, score


# ---------------------------------------------------------------------------
# Stage 3a — DTW
# ---------------------------------------------------------------------------

def _dtw(seq1: list[float], seq2: list[float]) -> float:
    n, m = len(seq1), len(seq2)
    if n == 0 or m == 0:
        return float("inf")

    band = max(1, int(max(n, m) * DTW_BAND))
    dtw  = np.full((n + 1, m + 1), np.inf)
    dtw[0, 0] = 0.0

    for i in range(1, n + 1):
        j_lo = max(1, i - band)
        j_hi = min(m, i + band)
        for j in range(j_lo, j_hi + 1):
            cost     = abs(seq1[i - 1] - seq2[j - 1])
            dtw[i,j] = cost + min(dtw[i-1,j], dtw[i,j-1], dtw[i-1,j-1])

    return float(dtw[n, m]) / max(n, m)


def _sliding_dtw(query: list[float], song: list[float]) -> float:
    """Best DTW over all windows — user can start singing mid-song."""
    qlen = len(query)
    slen = len(song)
    if slen < qlen:
        return _dtw(query, song)

    best = float("inf")
    for start in range(0, slen - qlen + 1, 2):  # step 2 for speed
        d = _dtw(query, song[start : start + qlen])
        if d < best:
            best = d
    return best


# ---------------------------------------------------------------------------
# Stage 3b — Chromagram verification (imported lazily to avoid circular)
# ---------------------------------------------------------------------------

def _chroma_ok(query_chroma, song_chroma) -> tuple[bool, float]:
    if query_chroma is None or song_chroma is None:
        return True, 1.0    # no chroma data → skip check, don't block
    from .chromagram import chroma_similarity
    score = chroma_similarity(query_chroma, song_chroma)
    return score >= CHROMA_MIN, score


# ---------------------------------------------------------------------------
# Ranking
# ---------------------------------------------------------------------------

def rank_candidates(
    query_fp:      IntervalFingerprint,
    candidates:    dict[str, dict],
    song_data:     dict[str, dict],
    query_chroma=None,
) -> list[dict]:
    """
    song_data: {song_id: {intervals_s1, intervals_s2, contour, chroma (opt), ...}}
    """
    ranked = []

    for song_id, cand in candidates.items():
        if song_id not in song_data:
            continue

        song = song_data[song_id]

        # Stage 2 — contour
        ok, contour_score = _passes_contour(query_fp, song.get("contour", []))
        if not ok:
            continue

        # Stage 3a — DTW (try both step-1 and step-2 song sequences)
        dtw_s1 = _sliding_dtw(query_fp.intervals_s1, song.get("intervals_s1", []))
        dtw_s2 = _sliding_dtw(query_fp.intervals_s1, song.get("intervals_s2", []))
        dtw_d  = min(dtw_s1, dtw_s2)

        # Stage 3b — chromagram
        chroma_ok, chroma_score = _chroma_ok(query_chroma, song.get("chroma"))
        if not chroma_ok and cand["fine_votes"] < 4:
            # Only block on chromagram if vote evidence is weak
            continue

        conf = _confidence(dtw_d, cand["vote_count"], contour_score, chroma_score)

        ranked.append({
            "song_id":       song_id,
            "dtw_distance":  round(dtw_d,         4),
            "vote_count":    cand["vote_count"],
            "fine_votes":    cand["fine_votes"],
            "coarse_votes":  cand["coarse_votes"],
            "skip_votes":    cand["skip_votes"],
            "contour_score": round(contour_score,  3),
            "chroma_score":  round(chroma_score,   3),
            "confidence":    conf,
            "combined":      round(_combined(dtw_d, cand["vote_count"], contour_score), 4),
        })

    ranked.sort(key=lambda x: x["combined"])
    return ranked


def _combined(dtw: float, votes: float, contour: float) -> float:
    vote_factor    = max(0.05, 1.0 - votes / 40.0)
    contour_factor = 1.0 - contour * 0.12
    return dtw * vote_factor * contour_factor


def _confidence(dtw: float, votes: float, contour: float, chroma: float) -> float:
    dtw_c     = max(0.0, 1.0 - dtw / 2.5)
    vote_c    = min(1.0, (votes - MIN_VOTES) / 18.0)
    contour_c = contour
    chroma_c  = max(0.0, chroma)
    raw = dtw_c * 0.50 + vote_c * 0.28 + contour_c * 0.12 + chroma_c * 0.10
    return round(raw, 3)


def pick_best(ranked: list[dict]) -> "dict | None":
    if not ranked:
        return None
    best = ranked[0]
    return best if best["confidence"] >= CONFIDENCE_CUTOFF else None
