import numpy as np
from dataclasses import dataclass
from .pitch_extractor import PitchFrame

MIN_NOTE_DURATION   = 0.08   # seconds — below this is ornament/noise, not a real note
MAX_PITCH_SPREAD    = 1.5    # semitones — max variation for frames to belong to same note
MAX_FRAME_GAP       = 0.12   # seconds — gap larger than this splits into two notes
MERGE_GAP           = 0.06   # seconds — merge adjacent notes if gap ≤ this and pitch close
MERGE_PITCH_DIFF    = 0.8    # semitones — pitch closeness for merging


@dataclass
class Note:
    semitone: float    # median semitone — robust to micro-variation and vibrato
    start: float       # seconds
    end: float         # seconds
    confidence: float  # average pYIN confidence across frames

    @property
    def duration(self) -> float:
        return self.end - self.start


def segment_notes(frames: list[PitchFrame]) -> list[Note]:
    if not frames:
        return []

    groups: list[list[PitchFrame]] = []
    current: list[PitchFrame] = [frames[0]]

    for frame in frames[1:]:
        prev = current[-1]
        pitch_jump = abs(frame.semitone - prev.semitone)
        time_gap   = frame.time - prev.time

        if pitch_jump > MAX_PITCH_SPREAD or time_gap > MAX_FRAME_GAP:
            groups.append(current)
            current = [frame]
        else:
            current.append(frame)

    groups.append(current)

    notes: list[Note] = []
    for group in groups:
        if not group:
            continue

        start    = group[0].time
        end      = group[-1].time
        duration = end - start

        if duration < MIN_NOTE_DURATION:
            continue

        # Median semitone — handles residual vibrato and quantization noise
        semitone   = float(np.median([f.semitone for f in group]))
        confidence = float(np.mean([f.confidence for f in group]))

        notes.append(Note(semitone=semitone, start=start, end=end, confidence=confidence))

    notes = _merge_close_notes(notes)
    return notes


def _merge_close_notes(notes: list[Note]) -> list[Note]:
    """
    Merge pairs of notes that are very close in time and pitch.
    Handles brief unvoiced gaps mid-note (breath, consonant) that split one note into two.
    """
    if len(notes) < 2:
        return notes

    merged = [notes[0]]
    for note in notes[1:]:
        prev = merged[-1]
        gap  = note.start - prev.end

        if gap <= MERGE_GAP and abs(note.semitone - prev.semitone) <= MERGE_PITCH_DIFF:
            total_dur = prev.duration + note.duration
            new_semitone = (
                (prev.semitone * prev.duration + note.semitone * note.duration)
                / total_dur
            )
            merged[-1] = Note(
                semitone=new_semitone,
                start=prev.start,
                end=note.end,
                confidence=(prev.confidence + note.confidence) / 2,
            )
        else:
            merged.append(note)

    return merged
