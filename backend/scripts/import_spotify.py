#!/usr/bin/env python3
"""
Spotify Liked Songs Importer for Harmonix
------------------------------------------
Fetches your Spotify liked songs and adds them to the Harmonix library
by fingerprinting the 30-second preview clips Spotify provides.

Setup (one-time):
  1. Go to https://developer.spotify.com/dashboard
  2. Create an app — any name, any description
  3. Add Redirect URI:  http://localhost:8888/callback
  4. Copy Client ID and Client Secret
  5. Add these to backend/.env:
       SPOTIFY_CLIENT_ID=your_client_id
       SPOTIFY_CLIENT_SECRET=your_client_secret

Usage:
  cd backend
  python scripts/import_spotify.py

First run opens a browser for Spotify login — after that it's automatic.
"""

import os
import sys
import time
import tempfile
import requests
from pathlib import Path

# Load .env from the backend folder
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

try:
    import spotipy
    from spotipy.oauth2 import SpotifyOAuth
except ImportError:
    print("spotipy not installed. Run:  pip install spotipy")
    sys.exit(1)

SPOTIFY_CLIENT_ID     = os.environ.get("SPOTIFY_CLIENT_ID", "")
SPOTIFY_CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET", "")
ADMIN_KEY             = os.environ.get("ADMIN_KEY", "")
HARMONIX_URL          = os.environ.get("HARMONIX_URL", "http://localhost:8000")

# Cache file goes in backend/ so it persists between runs
CACHE_PATH = str(Path(__file__).parent.parent / ".spotify_cache")


def fetch_all_liked_songs(sp):
    """Returns list of track dicts for every liked song that has a preview URL."""
    tracks = []
    no_preview = 0
    results = sp.current_user_saved_tracks(limit=50)

    while results:
        for item in results["items"]:
            track = item.get("track")
            if not track:
                continue
            if track.get("preview_url"):
                tracks.append({
                    "id":          track["id"],
                    "title":       track["name"],
                    "artist":      track["artists"][0]["name"],
                    "album":       track["album"]["name"],
                    "preview_url": track["preview_url"],
                    "artist_id":   track["artists"][0]["id"],
                })
            else:
                no_preview += 1

        total_seen = len(tracks) + no_preview
        print(f"  Scanning liked songs: {total_seen} checked, {len(tracks)} have previews ...", end="\r")

        results = sp.next(results) if results.get("next") else None

    print()
    if no_preview:
        print(f"  ({no_preview} songs skipped — Spotify doesn't provide previews for them)")
    return tracks


def fetch_artist_genres(sp, tracks):
    """Batch-fetches artist genres and adds a 'genre' field to each track."""
    artist_ids = list({t["artist_id"] for t in tracks})
    artist_genres = {}

    for i in range(0, len(artist_ids), 50):
        batch = artist_ids[i : i + 50]
        resp = sp.artists(batch)
        for a in resp["artists"]:
            genres = a.get("genres", [])
            artist_genres[a["id"]] = genres[0].title() if genres else None
        time.sleep(0.1)

    for t in tracks:
        t["genre"] = artist_genres.get(t["artist_id"])


def add_to_harmonix(track):
    """Downloads the Spotify preview and POSTs it to /library/add. Returns status string."""
    preview_resp = requests.get(track["preview_url"], timeout=15)
    preview_resp.raise_for_status()

    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(preview_resp.content)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            resp = requests.post(
                f"{HARMONIX_URL}/library/add",
                headers={"x-admin-key": ADMIN_KEY},
                files={"audio": (f"{track['title']}.mp3", f, "audio/mpeg")},
                data={
                    "title":  track["title"],
                    "artist": track["artist"],
                    "album":  track.get("album", ""),
                    "genre":  track.get("genre") or "",
                },
                timeout=120,
            )
    finally:
        os.unlink(tmp_path)

    if resp.status_code == 200:
        data = resp.json()
        return "ok", data
    elif resp.status_code == 409:
        return "duplicate", None
    else:
        return "error", resp.text


def main():
    if not SPOTIFY_CLIENT_ID or not SPOTIFY_CLIENT_SECRET:
        print("ERROR: SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are not set.")
        print("Add them to backend/.env and re-run.")
        sys.exit(1)
    if not ADMIN_KEY:
        print("ERROR: ADMIN_KEY not found in backend/.env")
        sys.exit(1)

    # Check backend is reachable
    try:
        health = requests.get(f"{HARMONIX_URL}/health", timeout=5)
        health.raise_for_status()
    except Exception:
        print(f"ERROR: Harmonix backend is not reachable at {HARMONIX_URL}")
        print("Start it with:  uvicorn main:app --reload")
        sys.exit(1)

    print(f"Harmonix backend: OK ({HARMONIX_URL})")

    # Connect to Spotify — opens browser for one-time auth
    sp = spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=SPOTIFY_CLIENT_ID,
        client_secret=SPOTIFY_CLIENT_SECRET,
        redirect_uri="http://localhost:8888/callback",
        scope="user-library-read",
        cache_path=CACHE_PATH,
    ))

    user = sp.current_user()
    print(f"Spotify: logged in as {user['display_name']} ({user['id']})\n")

    # Step 1 — fetch all liked songs
    tracks = fetch_all_liked_songs(sp)
    print(f"\nTotal to process: {len(tracks)} songs\n")

    if not tracks:
        print("Nothing to add.")
        return

    # Step 2 — enrich with genres
    print("Fetching artist genres ...")
    fetch_artist_genres(sp, tracks)
    print("Done.\n")

    # Step 3 — fingerprint and add each song
    added = duplicates = failed = 0

    for i, track in enumerate(tracks, 1):
        label = f"{track['artist']} — {track['title']}"
        print(f"[{i:>4}/{len(tracks)}] {label[:60]:<60}", end=" ")

        try:
            status, data = add_to_harmonix(track)
            if status == "ok":
                print(f"✓  {data['notes_extracted']} notes  {data['ngrams_stored']} ngrams")
                added += 1
            elif status == "duplicate":
                print("already in library")
                duplicates += 1
            else:
                print(f"✗  {str(data)[:60]}")
                failed += 1
        except Exception as e:
            print(f"✗  {e}")
            failed += 1

        time.sleep(0.3)

    # Summary
    print(f"\n{'─' * 60}")
    print(f"  Added:           {added}")
    print(f"  Already existed: {duplicates}")
    print(f"  Failed:          {failed}")
    print(f"  Total in run:    {len(tracks)}")
    print(f"{'─' * 60}")


if __name__ == "__main__":
    main()
