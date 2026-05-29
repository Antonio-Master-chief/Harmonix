"""
MIDI → Note sequence parser.

Lets you build a perfect-accuracy reference library from MIDI files
with no pitch extraction uncertainty. A MIDI note_on event gives the
exact semitone value — no pYIN needed.

Install: pip install mido
"""

from dataclasses import dataclass
from typing import Optional


def notes_from_midi(midi_path: str, track_index: Optional[int] = None):
    """
    Parse a MIDI file and return a list of Note objects.
    track_index: None = merge all tracks (default), int = specific track.

    Returns list[Note] compatible with the rest of the pipeline.
    """
    try:
        import mido
    except ImportError:
        raise ImportError("Install mido: pip install mido")

    from .note_segmenter import Note

    mid   = mido.MidiFile(midi_path)
    tempo = 500000   # default: 120 BPM (microseconds per beat)
    ticks_per_beat = mid.ticks_per_beat

    events = []

    if track_index is not None:
        tracks = [mid.tracks[track_index]]
    else:
        # Merge all tracks into one event stream (sorted by absolute tick)
        tracks = mid.tracks

    for track in tracks:
        abs_tick = 0
        for msg in track:
            abs_tick += msg.time
            if msg.type == "set_tempo":
                tempo = msg.tempo
            if msg.type in ("note_on", "note_off"):
                t_sec = mido.tick2second(abs_tick, ticks_per_beat, tempo)
                events.append((t_sec, msg.type, msg.note, msg.velocity))

    # Sort by time
    events.sort(key=lambda x: x[0])

    # Build note on/off pairs
    active: dict[int, float] = {}
    notes = []

    for t, etype, pitch, vel in events:
        if etype == "note_on" and vel > 0:
            active[pitch] = t
        elif etype == "note_off" or (etype == "note_on" and vel == 0):
            if pitch in active:
                start = active.pop(pitch)
                duration = t - start
                if duration > 0.05:   # skip very short notes
                    notes.append(Note(
                        semitone=float(pitch),   # MIDI note = semitone directly
                        start=start,
                        end=t,
                        confidence=1.0,           # MIDI = perfect confidence
                    ))

    notes.sort(key=lambda n: n.start)
    return notes
