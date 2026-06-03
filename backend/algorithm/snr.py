"""
Audio quality gate — runs before heavy processing.

Estimates Signal-to-Noise Ratio by comparing energy in voiced
vs. unvoiced regions. Also checks for clipping and silence.
Raises ValueError with a user-friendly message if audio is unusable.
"""

import numpy as np
import librosa

SAMPLE_RATE       = 22050
MIN_VOICED_RATIO  = 0.08    # at least 8% of frames must have pitch signal — lowered for humming
CLIPPING_THRESHOLD = 0.98   # fraction of peak samples that signal clipping
MIN_DURATION      = 1.5     # seconds — must be at least this long
MAX_DURATION      = 60.0    # seconds — cap processing time


def check_audio_quality(audio: np.ndarray, sr: int = SAMPLE_RATE) -> dict:
    """
    Returns quality report dict. Raises ValueError if audio is unusable.
    """
    duration = len(audio) / sr

    if duration < MIN_DURATION:
        raise ValueError(
            f"Audio is only {duration:.1f}s. Please sing for at least {MIN_DURATION} seconds."
        )

    if duration > MAX_DURATION:
        audio = audio[: int(MAX_DURATION * sr)]

    # Clipping check
    peak = np.max(np.abs(audio))
    clipped_fraction = np.mean(np.abs(audio) > CLIPPING_THRESHOLD * peak)
    if clipped_fraction > 0.05:
        raise ValueError(
            "Audio appears clipped (microphone overloaded). Lower your mic volume and try again."
        )

    # SNR estimate via RMS ratio: voiced frames vs. overall noise floor
    frame_len  = 2048
    hop        = 512
    rms        = librosa.feature.rms(y=audio, frame_length=frame_len, hop_length=hop)[0]
    noise_floor = np.percentile(rms, 10)    # quietest 10% = background noise
    signal_peak = np.percentile(rms, 90)    # loudest 10% = your voice

    snr_db = 20 * np.log10(signal_peak / (noise_floor + 1e-10))

    # Voiced-frame ratio (rough estimate without running full pYIN)
    threshold    = noise_floor * 3.0
    voiced_ratio = float(np.mean(rms > threshold))

    if voiced_ratio < MIN_VOICED_RATIO:
        raise ValueError(
            "Barely any pitched sound detected. Make sure your microphone is on "
            "and sing or hum clearly into it."
        )

    return {
        "duration_s":    round(duration, 2),
        "snr_db":        round(snr_db, 1),
        "voiced_ratio":  round(voiced_ratio, 3),
        "clipped":       clipped_fraction > 0.02,
    }
