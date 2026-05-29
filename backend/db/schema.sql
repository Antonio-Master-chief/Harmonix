-- =====================================================================
-- Harmonix v2 — Database Schema
-- Run in: Supabase → SQL Editor → New Query
-- =====================================================================

-- Profiles (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id           UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username     TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url   TEXT,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Song library
CREATE TABLE IF NOT EXISTS songs (
    id            UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
    title         TEXT    NOT NULL,
    artist        TEXT    NOT NULL,
    album         TEXT,
    genre         TEXT,
    duration      FLOAT,
    note_count    INT,

    -- Step-1 intervals (consecutive notes) — for DTW refinement
    intervals_s1  FLOAT[] NOT NULL,

    -- Step-2 intervals (skip-one) — stored so DTW can match users who skip notes
    intervals_s2  FLOAT[] NOT NULL DEFAULT '{}',

    -- Melodic contour (-1/0/+1) — for fast pre-filter
    contour       INT[]   NOT NULL DEFAULT '{}',

    -- Mean chromagram (12 floats) — for secondary verification
    -- Stored as FLOAT[] rather than a separate table to keep queries simple
    chroma_mean   FLOAT[],

    created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- N-gram inverted index — hot path for every identify request
CREATE TABLE IF NOT EXISTS fingerprints (
    id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
    song_id     UUID    REFERENCES songs(id) ON DELETE CASCADE NOT NULL,
    ngram_hash  BIGINT  NOT NULL,
    position    INT     NOT NULL,
    resolution  TEXT    NOT NULL DEFAULT 'fine',    -- 'fine' (0.5 st) | 'coarse' (1.0 st)
    step_size   INT     NOT NULL DEFAULT 1          -- 1=consecutive | 2=skip-one
);

-- The most important index in the whole system
CREATE INDEX IF NOT EXISTS idx_fp_hash      ON fingerprints(ngram_hash);
CREATE INDEX IF NOT EXISTS idx_fp_song_id   ON fingerprints(song_id);
CREATE INDEX IF NOT EXISTS idx_fp_hash_res  ON fingerprints(ngram_hash, resolution, step_size);

-- Search history
CREATE TABLE IF NOT EXISTS search_history (
    id          UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id     UUID    REFERENCES auth.users(id) ON DELETE CASCADE,
    song_id     UUID    REFERENCES songs(id) ON DELETE SET NULL,
    confidence  FLOAT,
    matched     BOOLEAN,
    note_count  INT,
    searched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user ON search_history(user_id, searched_at DESC);

-- =====================================================================
-- Row Level Security
-- =====================================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE fingerprints   ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Profiles: public read, own write
CREATE POLICY "profiles_read"  ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_write" ON profiles FOR ALL    USING (auth.uid() = id);

-- Songs: public read (service role key writes — no public insert)
CREATE POLICY "songs_read" ON songs FOR SELECT USING (true);

-- Fingerprints: public read only
CREATE POLICY "fp_read" ON fingerprints FOR SELECT USING (true);

-- History: own records only
CREATE POLICY "history_own" ON search_history
    FOR ALL USING (auth.uid() = user_id);

-- =====================================================================
-- Auto-create profile on signup trigger
-- =====================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'display_name',
            split_part(NEW.email, '@', 1)
        )
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================================
-- Useful views
-- =====================================================================

-- Library stats — how many songs, fingerprints, avg quality
CREATE OR REPLACE VIEW library_stats AS
SELECT
    COUNT(DISTINCT s.id)              AS total_songs,
    COUNT(f.id)                       AS total_fingerprints,
    ROUND(AVG(s.note_count)::NUMERIC, 1) AS avg_notes_per_song,
    ROUND(
        COUNT(CASE WHEN f.step_size = 1 AND f.resolution = 'fine' THEN 1 END)::NUMERIC
        / NULLIF(COUNT(DISTINCT s.id), 0),
    1)                                AS avg_fine_ngrams_per_song
FROM songs s
LEFT JOIN fingerprints f ON f.song_id = s.id;
