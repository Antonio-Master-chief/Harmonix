"""
Bulk library ingestion script.

Usage:
    python scripts/process_library.py --folder ./songs --ext mp3
    python scripts/process_library.py --folder ./midi  --ext mid

Each file must be named:  Artist - Title.mp3   (or .mid, .wav, etc.)

Flags:
    --folder    Directory containing audio/MIDI files
    --ext       File extension to process (mp3, wav, mid, ogg, flac)
    --polyphonic  Pass this flag for full-band recordings (runs Demucs)
    --dry-run   Print what would be added without hitting the API
"""

import argparse
import os
import sys
import time
import requests
from pathlib import Path

API_BASE = os.environ.get("HARMONIX_API", "http://localhost:8000")
ADMIN_KEY = os.environ.get("ADMIN_API_KEY", "")


def parse_filename(filename: str) -> tuple[str, str]:
    """Extract 'Artist - Title' from filename."""
    stem = Path(filename).stem
    if " - " in stem:
        artist, title = stem.split(" - ", 1)
        return artist.strip(), title.strip()
    return "Unknown Artist", stem.strip()


def add_audio(filepath: Path, artist: str, title: str, polyphonic: bool) -> dict:
    with open(filepath, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/library/add",
            files={"audio": (filepath.name, f, "audio/mpeg")},
            data={"title": title, "artist": artist, "is_polyphonic": str(polyphonic).lower()},
            headers={"x-admin-key": ADMIN_KEY},
            timeout=120,
        )
    resp.raise_for_status()
    return resp.json()


def add_midi(filepath: Path, artist: str, title: str) -> dict:
    with open(filepath, "rb") as f:
        resp = requests.post(
            f"{API_BASE}/library/add-midi",
            files={"midi": (filepath.name, f, "audio/midi")},
            data={"title": title, "artist": artist},
            headers={"x-admin-key": ADMIN_KEY},
            timeout=60,
        )
    resp.raise_for_status()
    return resp.json()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--folder",     required=True)
    parser.add_argument("--ext",        default="mp3")
    parser.add_argument("--polyphonic", action="store_true")
    parser.add_argument("--dry-run",    action="store_true")
    args = parser.parse_args()

    folder = Path(args.folder)
    if not folder.is_dir():
        print(f"ERROR: {folder} is not a directory")
        sys.exit(1)

    files = sorted(folder.glob(f"*.{args.ext.lstrip('.')}"))
    print(f"Found {len(files)} .{args.ext} files in {folder}")

    if not ADMIN_KEY and not args.dry_run:
        print("ERROR: Set ADMIN_API_KEY environment variable")
        sys.exit(1)

    ok, failed = 0, 0
    for filepath in files:
        artist, title = parse_filename(filepath.name)
        print(f"  [{ok + failed + 1}/{len(files)}] {artist} — {title}", end=" ... ")

        if args.dry_run:
            print("(dry-run)")
            continue

        try:
            if args.ext.lower() in ("mid", "midi"):
                result = add_midi(filepath, artist, title)
            else:
                result = add_audio(filepath, artist, title, args.polyphonic)

            print(f"OK — {result.get('ngrams_stored', '?')} n-grams, "
                  f"{result.get('notes_extracted', '?')} notes")
            ok += 1
            time.sleep(0.3)   # brief pause to avoid overwhelming the API

        except Exception as e:
            print(f"FAILED — {e}")
            failed += 1

    print(f"\nDone: {ok} added, {failed} failed")


if __name__ == "__main__":
    main()
