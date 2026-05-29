"""
Chromagram secondary verification.

After the interval pipeline finds a top candidate, chromagram correlation
provides a second, independent opinion on key/harmonic similarity.
It won't catch transposed versions on its own (it's not interval-based),
but it catches interval-fingerprint false positives where two songs happen
to share a similar interval pattern but differ harmonically.
"""

import librosa
import numpy as np


def extract_chroma(audio: np.ndarray, sr: int = 22050) -> np.ndarray:
    harmonic, _ = librosa.effects.hpss(audio)
    # CQT chroma is more pitch-accurate than STFT chroma
    chroma = librosa.feature.chroma_cqt(y=harmonic, sr=sr, bins_per_octave=36)
    return chroma


def chroma_self_similarity(chroma: np.ndarray) -> np.ndarray:
    """Internal structure fingerprint — useful for debugging."""
    norm = chroma / (np.linalg.norm(chroma, axis=0, keepdims=True) + 1e-8)
    return norm.T @ norm


def chroma_similarity(chroma1: np.ndarray, chroma2: np.ndarray) -> float:
    """
    Cosine similarity with all 12 circular shifts (key-invariant).
    Returns best score across shifts so transposed versions still match.
    """
    c1 = np.mean(chroma1, axis=1)
    c2 = np.mean(chroma2, axis=1)

    c1 = c1 / (np.linalg.norm(c1) + 1e-8)
    c2 = c2 / (np.linalg.norm(c2) + 1e-8)

    best = max(float(np.dot(np.roll(c1, k), c2)) for k in range(12))
    return round(best, 4)
