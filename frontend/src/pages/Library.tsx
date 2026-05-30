import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Loader2, Music2, Disc3 } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import SongCard from '../components/library/SongCard'
import { fetchLibrary, Song } from '../lib/api'

const GENRES = ['All', 'Pop', 'Rock', 'Jazz', 'Classical', 'Hip-Hop', 'R&B', 'Electronic', 'Folk']

export default function LibraryPage() {
  const [songs,   setSongs]   = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [query,   setQuery]   = useState('')
  const [genre,   setGenre]   = useState('All')

  useEffect(() => {
    fetchLibrary(200)
      .then(setSongs)
      .catch(() => setError('Could not load library. Make sure the backend is running.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = songs.filter(s => {
    const matchQuery = !query ||
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase())
    const matchGenre = genre === 'All' || (s.genre ?? '').toLowerCase().includes(genre.toLowerCase())
    return matchQuery && matchGenre
  })

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* ── HEADER ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="section-label">database</p>
          <div className="flex items-end justify-between gap-4">
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight">
              Song <span className="gradient-text">Archive</span>
            </h1>
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-2 panel px-3 py-1.5 rounded-lg shrink-0"
              >
                <Disc3 className="w-3.5 h-3.5 text-violet" />
                <span className="font-mono text-xs text-muted">{songs.length} tracks</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── SEARCH + FILTER ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="space-y-3 mb-8"
        >
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title or artist..."
              className="w-full panel rounded-xl pl-11 pr-4 py-3.5 text-white placeholder-muted
                         font-mono text-sm focus:outline-none transition-all duration-300"
              style={{
                caretColor: '#8B5CF6',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'
                e.currentTarget.style.boxShadow = '0 0 0 1px rgba(139,92,246,0.2)'
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = ''
                e.currentTarget.style.boxShadow = ''
              }}
            />
          </div>

          {/* Genre filter pills */}
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all duration-200
                  ${genre === g
                    ? 'text-white bg-gradient-to-r from-violet to-violet-dark shadow-lg'
                    : 'text-muted hover:text-white panel hover:border-violet-glow'
                  }`}
                style={genre === g ? { boxShadow: '0 0 16px rgba(139,92,246,0.4)' } : {}}
              >
                {g}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── CONTENT ─────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-32"
            >
              <div className="relative">
                <Loader2 className="w-8 h-8 text-violet animate-spin" />
                <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                     style={{ background: '#8B5CF6' }} />
              </div>
              <span className="font-mono text-xs text-muted uppercase tracking-widest">loading archive...</span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32 space-y-4"
            >
              <Music2 className="w-12 h-12 text-muted mx-auto opacity-40" />
              <p className="font-mono text-sm text-neon-pink">{error}</p>
            </motion.div>
          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32 space-y-4"
            >
              <Music2 className="w-12 h-12 text-muted mx-auto opacity-30" />
              <div>
                <p className="font-display font-bold text-white text-lg mb-1">
                  {songs.length === 0 ? 'Archive empty' : 'No matches'}
                </p>
                <p className="font-mono text-xs text-muted">
                  {songs.length === 0
                    ? 'Add songs via the admin API to populate the library.'
                    : 'Try a different search term or genre filter.'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {/* Results count */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-[10px] text-muted uppercase tracking-widest">
                  {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                  {query && ` for "${query}"`}
                  {genre !== 'All' && ` · ${genre}`}
                </span>
              </div>

              {filtered.map((song, i) => (
                <SongCard key={song.id} song={song} index={i} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  )
}
