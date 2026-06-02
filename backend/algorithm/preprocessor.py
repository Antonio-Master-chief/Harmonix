import os
import tempfile
import numpy as np
import librosa
from scipy.signal import butter, filtfilt

SAMPLE_RATE = 22050
HOP_LENGTH  = 512

# Magic bytes → file extension (lets ffmpeg detect format correctly)
_MAGIC: list[tuple[bytes, str]] = [
    (b'\x1a\x45\xdf\xa3', '.webm'),   # WebM / MKV (browser MediaRecorder)
    (b'RIFF',              '.wav'),
    (b'OggS',              '.ogg'),
    (b'fLaC',              '.flac'),
    (b'ID3',               '.mp3'),
    (b'\xff\xfb',          '.mp3'),
    (b'\xff\xf3',          '.mp3'),
    (b'\xff\xf2',          '.mp3'),
    (b'\x00\x00\x00',      '.m4a'),    # M4A / AAC in MPEG-4 box
]


def _detect_extension(data: bytes) -> str:
    """Sniff the first bytes to pick the right temp-file extension for ffmpeg."""
    for magic, ext in _MAGIC:
        if data[:len(magic)] == magic:
            return ext
    return '.webm'   # browser default when nothing matches


# ---------------------------------------------------------------------------
# Decode
# ---------------------------------------------------------------------------

def load_audio(file_bytes: bytes) -> np.ndarray:
    """
    Decode any audio format to a float32 mono array at SAMPLE_RATE.

    The temp file MUST have the correct extension so that ffmpeg/audioread
    can pick the right demuxer.  BytesIO skips that fallback entirely.
    """
    ext = _detect_extension(file_bytes)
    with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as f:
        f.write(file_bytes)
        tmp = f.name
    try:
        audio, _ = librosa.load(tmp, sr=SAMPLE_RATE, mono=True)
    except Exception as e:
        fmt = ext.lstrip('.').upper()
        raise RuntimeError(
            f"Could not decode {fmt} audio — ffmpeg must be installed on the server. "
            f"(Detail: {e})"
        ) from e
    finally:
        try:
            os.unlink(tmp)
        except OSError:
            pass
    return audio


# ---------------------------------------------------------------------------
# Per-step filters
# ---------------------------------------------------------------------------

def normalize(audio: np.ndarray) -> np.ndarray:
    peak = np.max(np.abs(audio))
    return audio / peak if peak > 0 else audio


def highpass_filter(audio: np.ndarray, cutoff: float = 80.0) -> np.ndarray:
    """Remove low-frequency rumble (handling noise, wind, mic hum) below 80 Hz."""
    nyquist = SAMPLE_RATE / 2
    b, a = butter(4, cutoff / nyquist, btype='high')
    return filtfilt(b, a, audio)


def reduce_noise(audio: np.ndarray) -> np.ndarray:
    """
    Spectral subtraction noise reduction.

    Estimates a stationary noise floor from the quietest frames (background
    hiss, room tone) and subtracts it from every frame.  Conservative factor
    (1.2×) avoids over-subtraction artefacts that could confuse pYIN.
    """
    stft      = librosa.stft(audio, n_fft=2048, hop_length=HOP_LENGTH)
    magnitude = np.abs(stft)
    phase     = np.angle(stft)

    # Noise profile from quietest 15 % of frames
    frame_rms = magnitude.mean(axis=0)
    quiet_thresh = np.percentile(frame_rms, 15)
    quiet_mask   = frame_rms <= quiet_thresh * 1.5

    if quiet_mask.sum() >= 3:
        noise_profile = magnitude[:, quiet_mask].mean(axis=1, keepdims=True)
        # Keep at least 5 % of original to avoid musical-noise holes
        cleaned = np.maximum(magnitude - 1.2 * noise_profile, 0.05 * magnitude)
    else:
        cleaned = magnitude

    stft_clean = cleaned * np.exp(1j * phase)
    return librosa.istft(stft_clean, hop_length=HOP_LENGTH, length=len(audio))


def isolate_harmonic(audio: np.ndarray) -> np.ndarray:
    """
    Harmonic-Percussive Source Separation (HPSS).

    Strips transient/percussive bursts (breath pops, mic taps, ambient bangs)
    and keeps only the harmonic (pitched) component that pYIN works best on.
    margin=3.0 is conservative — keeps weak harmonics rather than losing them.
    """
    harmonic, _ = librosa.effects.hpss(audio, margin=3.0)
    return harmonic


def trim_silence(audio: np.ndarray, top_db: float = 28.0) -> np.ndarray:
    trimmed, _ = librosa.effects.trim(audio, top_db=top_db)
    return trimmed


def preemphasis(audio: np.ndarray, coef: float = 0.97) -> np.ndarray:
    """Boost high frequencies — sharpens harmonic edges, improves pitch detection clarity."""
    return np.append(audio[0], audio[1:] - coef * audio[:-1])


# ---------------------------------------------------------------------------
# Full pipeline
# ---------------------------------------------------------------------------

def preprocess(file_bytes: bytes) -> np.ndarray:
    """
    Full preprocessing chain for both mic input and uploaded files.

    Order matters:
      1. Decode        — format-aware via magic-byte extension sniffing
      2. Normalize     — bring to full scale before filtering
      3. Highpass      — kill DC + sub-80 Hz rumble
      4. Noise reduce  — spectral subtraction of stationary background noise
      5. HPSS          — isolate harmonic content, strip percussive artefacts
      6. Re-normalize  — HPSS can attenuate; restore full scale before trimming
      7. Trim silence  — remove leading/trailing quiet (now calibrated to signal peak)
      8. Pre-emphasis  — boost high-freq overtones for pYIN clarity
    """
    audio = load_audio(file_bytes)
    audio = normalize(audio)
    audio = highpass_filter(audio)
    audio = reduce_noise(audio)
    audio = isolate_harmonic(audio)
    audio = normalize(audio)      # re-normalize — HPSS shifts the level
    audio = trim_silence(audio)
    audio = preemphasis(audio)
    return audio
