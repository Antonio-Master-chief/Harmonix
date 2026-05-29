import librosa
import numpy as np
from dataclasses import dataclass
from scipy.signal import medfilt

SAMPLE_RATE = 22050
HOP_LENGTH = 512

# Frequency bounds: C2 (~65 Hz) to C7 (~2093 Hz)
# Covers singing, humming, whistling
FMIN = librosa.note_to_hz("C2")
FMAX = librosa.note_to_hz("C7")

VOICED_PROB_THRESHOLD = 0.45   # pYIN confidence cutoff
VIBRATO_SMOOTH_KERNEL = 7      # frames — median filter to cancel vibrato


@dataclass
class PitchFrame:
    time: float        # seconds
    frequency: float   # Hz
    semitone: float    # absolute semitone (MIDI scale, A4 = 69)
    confidence: float  # 0–1 from pYIN


def hz_to_semitone(hz: float) -> float:
    """A4=440Hz → semitone 69. Log scale makes intervals invariant to octave."""
    return 69.0 + 12.0 * np.log2(hz / 440.0)


def extract_pitch_frames(audio: np.ndarray, sr: int = SAMPLE_RATE) -> list[PitchFrame]:
    """
    pYIN pitch extraction.
    pYIN (Probabilistic YIN) is preferred over plain YIN or FFT because:
    - It models pitch uncertainty probabilistically → less false-voiced frames
    - Purpose-built for monophonic sources (voice, whistle, hum)
    - Better at handling vibrato, breath, flat singing
    """
    f0, voiced_flag, voiced_probs = librosa.pyin(
        audio,
        fmin=FMIN,
        fmax=FMAX,
        sr=sr,
        hop_length=HOP_LENGTH,
        fill_na=None,
    )

    times = librosa.times_like(f0, sr=sr, hop_length=HOP_LENGTH)

    # Collect only voiced frames above confidence threshold
    raw_semitones = []
    raw_meta = []
    for t, freq, voiced, prob in zip(times, f0, voiced_flag, voiced_probs):
        if voiced and prob >= VOICED_PROB_THRESHOLD and freq is not None and not np.isnan(freq):
            raw_semitones.append(hz_to_semitone(float(freq)))
            raw_meta.append((float(t), float(freq), float(prob)))

    if len(raw_semitones) < VIBRATO_SMOOTH_KERNEL:
        # Not enough frames for smooth — return as-is
        return [
            PitchFrame(time=m[0], frequency=m[1], semitone=s, confidence=m[2])
            for s, m in zip(raw_semitones, raw_meta)
        ]

    # Median filter smooths out vibrato oscillations — keeps the "intended" note
    smoothed = medfilt(raw_semitones, kernel_size=VIBRATO_SMOOTH_KERNEL)

    frames = [
        PitchFrame(time=meta[0], frequency=meta[1], semitone=float(sm), confidence=meta[2])
        for sm, meta in zip(smoothed, raw_meta)
    ]

    return frames
