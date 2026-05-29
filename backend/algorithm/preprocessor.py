import io
import numpy as np
import librosa
from scipy.signal import butter, filtfilt

SAMPLE_RATE = 22050
HOP_LENGTH = 512


def load_audio(file_bytes: bytes) -> np.ndarray:
    audio, _ = librosa.load(io.BytesIO(file_bytes), sr=SAMPLE_RATE, mono=True)
    return audio


def normalize(audio: np.ndarray) -> np.ndarray:
    peak = np.max(np.abs(audio))
    return audio / peak if peak > 0 else audio


def highpass_filter(audio: np.ndarray, cutoff: float = 80.0) -> np.ndarray:
    """Remove low-frequency rumble (handling noise, wind, mic hum)"""
    nyquist = SAMPLE_RATE / 2
    b, a = butter(4, cutoff / nyquist, btype="high")
    return filtfilt(b, a, audio)


def trim_silence(audio: np.ndarray, top_db: float = 28.0) -> np.ndarray:
    trimmed, _ = librosa.effects.trim(audio, top_db=top_db)
    return trimmed


def preemphasis(audio: np.ndarray, coef: float = 0.97) -> np.ndarray:
    """Boost high frequencies — improves pitch detection clarity"""
    return np.append(audio[0], audio[1:] - coef * audio[:-1])


def preprocess(file_bytes: bytes) -> np.ndarray:
    audio = load_audio(file_bytes)
    audio = normalize(audio)
    audio = highpass_filter(audio)
    audio = trim_silence(audio)
    audio = preemphasis(audio)
    return audio
