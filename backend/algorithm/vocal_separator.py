"""
Vocal separator for library ingestion — wraps Facebook Demucs.

Only needed when adding full-band recordings (studio mix, YouTube rip)
to the library. User microphone input is already monophonic — skip this.

Demucs htdemucs separates: drums, bass, other, vocals.
We keep only the vocals stem, then run the normal pYIN pipeline on it.

Install:  pip install demucs
Requires: ffmpeg on PATH (for MP3/WebM decoding)

If Demucs is not installed, falls back to HPSS (librosa harmonic
separation) which is less clean but has no extra dependencies.
"""

import io
import numpy as np

SAMPLE_RATE = 22050


def separate_vocals(audio: np.ndarray, sr: int = SAMPLE_RATE) -> np.ndarray:
    """
    Returns isolated vocal track at the same sample rate.
    Uses Demucs if available, falls back to HPSS.
    """
    try:
        return _demucs_separate(audio, sr)
    except ImportError:
        return _hpss_separate(audio)


def _demucs_separate(audio: np.ndarray, sr: int) -> np.ndarray:
    import torch
    from demucs.pretrained import get_model
    from demucs.apply import apply_model

    model = get_model("htdemucs")
    model.eval()

    # Demucs expects (batch, channels, samples) float32 at 44100 Hz
    import librosa
    audio_44k = librosa.resample(audio, orig_sr=sr, target_sr=44100)
    wav = torch.tensor(audio_44k, dtype=torch.float32).unsqueeze(0).unsqueeze(0)
    wav = wav.repeat(1, 2, 1)   # mono → fake stereo

    with torch.no_grad():
        sources = apply_model(model, wav, device="cpu")

    # sources shape: (batch, stems, channels, samples)
    # stems order for htdemucs: drums, bass, other, vocals
    vocals_44k = sources[0, 3].mean(dim=0).numpy()   # stereo → mono

    # Resample back
    vocals = librosa.resample(vocals_44k, orig_sr=44100, target_sr=sr)
    return vocals


def _hpss_separate(audio: np.ndarray) -> np.ndarray:
    """Fallback: harmonic-percussive separation. Less clean than Demucs."""
    import librosa
    harmonic, _ = librosa.effects.hpss(audio, margin=3.0)
    return harmonic
