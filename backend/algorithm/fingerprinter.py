"""
Harmonix Interval Fingerprint — core algorithm.

SEMITONE INTERVALS, not Hz differences:
  semitone_interval = 12 × log2(f2 / f1)
  A major third is always 4 semitones regardless of octave.
  Hz differences change per octave (C4→E4 = 68 Hz, C5→E5 = 136 Hz).

THREE FINGERPRINT LAYERS per song:
  1. Step-1 n-grams  — consecutive intervals. Standard match.
  2. Step-2 n-grams  — every-other-note intervals. Matches users who
     skip ornamental notes or hum a simplified melody.
  3. Contour         — up/same/down shape. Ultra-fast pre-filter.

TWO QUANTIZATION RESOLUTIONS:
  Fine   (0.5 st) — catches accurate singers, high confidence match.
  Coarse (1.0 st) — catches off-pitch singers, lower confidence match.

HOW STEP-2 SKIPS WORK:
  Song:  A  B  C  D  E      Step-1: +2 +2 +2 +2
                             Step-2: +4 +4 +4        (A→C, B→D, C→E)
  User hums:  A  C  E       Their step-1: +4 +4
  → User step-1 hash == Song step-2 hash at consistent offset → match.
"""

import hashlib
from dataclasses import dataclass, field
import numpy as np
from .note_segmenter import Note

NGRAM_SIZE         = 5
MIN_NOTES          = 6
CONTOUR_THRESHOLD  = 0.75
QUANT_FINE         = 0.5
QUANT_COARSE       = 1.0


@dataclass
class Ngram:
    hash_fine:     int
    hash_coarse:   int
    position:      int    # index in the interval sequence (for offset voting)
    step_size:     int    # 1 = consecutive, 2 = skip-one-note
    raw_intervals: tuple


@dataclass
class IntervalFingerprint:
    intervals_s1:  list[float]   # step-1 intervals (consecutive)
    intervals_s2:  list[float]   # step-2 intervals (skip-1)
    rhythm_ratios: list[float]
    contour:       list[int]
    ngrams:        list[Ngram]
    note_count:    int


# ---------------------------------------------------------------------------
# Interval extraction
# ---------------------------------------------------------------------------

def _intervals_at_step(notes: list[Note], step: int) -> list[float]:
    """Semitone difference between note[i+step] and note[i]."""
    return [notes[i + step].semitone - notes[i].semitone
            for i in range(len(notes) - step)]


def _rhythm_ratios(notes: list[Note]) -> list[float]:
    ratios = []
    for i in range(len(notes) - 1):
        d = notes[i].duration
        r = notes[i + 1].duration / d if d > 0 else 1.0
        ratios.append(float(np.clip(r, 0.1, 10.0)))
    return ratios


def _contour(intervals: list[float]) -> list[int]:
    out = []
    for iv in intervals:
        if   iv >  CONTOUR_THRESHOLD: out.append(1)
        elif iv < -CONTOUR_THRESHOLD: out.append(-1)
        else:                         out.append(0)
    return out


# ---------------------------------------------------------------------------
# Hashing
# ---------------------------------------------------------------------------

def _quantize(v: float, step: float) -> float:
    return round(v / step) * step


def _hash(pitch_tuple: tuple) -> int:
    return int(hashlib.sha256(str(pitch_tuple).encode()).hexdigest()[:16], 16)


def _build_ngrams(intervals: list[float],
                  step_size: int,
                  window: int = NGRAM_SIZE) -> list[Ngram]:
    ngrams = []
    n = len(intervals)
    if n < window:
        return ngrams

    for i in range(n - window + 1):
        win = intervals[i : i + window]
        fine_t   = tuple(_quantize(iv, QUANT_FINE)   for iv in win)
        coarse_t = tuple(_quantize(iv, QUANT_COARSE) for iv in win)
        ngrams.append(Ngram(
            hash_fine=_hash(fine_t),
            hash_coarse=_hash(coarse_t),
            position=i,
            step_size=step_size,
            raw_intervals=tuple(win),
        ))

    return ngrams


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def build_fingerprint(notes: list[Note]) -> "IntervalFingerprint | None":
    if len(notes) < MIN_NOTES:
        return None

    ivs1 = _intervals_at_step(notes, step=1)
    ivs2 = _intervals_at_step(notes, step=2) if len(notes) > MIN_NOTES else []

    ngrams  = _build_ngrams(ivs1, step_size=1)
    ngrams += _build_ngrams(ivs2, step_size=2) if ivs2 else []

    if not ngrams:
        return None

    return IntervalFingerprint(
        intervals_s1=ivs1,
        intervals_s2=ivs2,
        rhythm_ratios=_rhythm_ratios(notes),
        contour=_contour(ivs1),
        ngrams=ngrams,
        note_count=len(notes),
    )


def contour_match_score(c1: list[int], c2: list[int], hint_offset: int = 0) -> float:
    """
    Best contour overlap sliding c1 over c2.
    hint_offset (from voting) is checked first so the common case is O(1);
    full slide follows so mid-song queries still match even if the hint
    is slightly off.
    """
    if not c1 or not c2:
        return 0.0
    qlen  = len(c1)
    n_pos = max(1, len(c2) - qlen + 1)

    def _score_at(start: int) -> float:
        window = c2[start : start + qlen]
        ml = min(qlen, len(window))
        if ml == 0:
            return 0.0
        return sum(a == b for a, b in zip(c1[:ml], window)) / ml

    # Check voted offset first (fast path for beginning-of-song queries)
    best = _score_at(max(0, min(hint_offset, n_pos - 1)))

    # Slide over the full song — essential for mid-song queries
    for start in range(n_pos):
        sc = _score_at(start)
        if sc > best:
            best = sc

    return best
