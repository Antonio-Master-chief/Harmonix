"""
Krumhansl-Schmuckler key-finding algorithm.

Maps the pitch class distribution of detected notes against
major and minor key profiles (from Krumhansl 1990 music cognition research).
Returns the most likely key (e.g. "A minor", "C major").

This is informational output for the frontend — not used in matching.
"""

import numpy as np
from .note_segmenter import Note

# Krumhansl-Schmuckler profiles (1990)
_MAJOR = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09,
                   2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
_MINOR = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53,
                   2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

_NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F",
               "F#", "G", "G#", "A", "A#", "B"]


def _pitch_class_distribution(notes: list[Note]) -> np.ndarray:
    dist = np.zeros(12)
    for n in notes:
        pc = int(round(n.semitone)) % 12
        dist[pc] += n.duration * n.confidence   # weight by duration × confidence
    total = dist.sum()
    return dist / total if total > 0 else dist


def _best_key(dist: np.ndarray) -> tuple[str, str, float]:
    """Returns (root_name, mode, correlation_score)."""
    best_score = -np.inf
    best_root  = 0
    best_mode  = "major"

    for shift in range(12):
        shifted_dist = np.roll(dist, -shift)
        for mode, profile in [("major", _MAJOR), ("minor", _MINOR)]:
            # Pearson correlation
            score = float(np.corrcoef(shifted_dist, profile)[0, 1])
            if score > best_score:
                best_score = score
                best_root  = shift
                best_mode  = mode

    return _NOTE_NAMES[best_root], best_mode, round(best_score, 3)


def estimate_key(notes: list[Note]) -> dict:
    if len(notes) < 4:
        return {"key": "Unknown", "confidence": 0.0}

    dist = _pitch_class_distribution(notes)
    root, mode, score = _best_key(dist)
    key_name = f"{root} {mode}"

    # Map correlation (-1 to 1) to a 0–1 confidence
    conf = round(max(0.0, (score + 1) / 2), 3)

    return {
        "key":        key_name,
        "root":       root,
        "mode":       mode,
        "confidence": conf,
    }
