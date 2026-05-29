import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Library, Loader2, Music2 } from 'lucide-react'
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
      <div className="max-w-4xl mx-auto px-4 py-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-glow flex items-center justify-center">
              <Library className="w-5 h-5 text-purple-light" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-white">Song Library</h1>
          </div>
          <p className="text-zinc-500 ml-13">
            {loading ? 'Loading...' : `${songs.length} songs in the recognition library`}
          </p>
        </motion.div>

        {/* Search + Filter */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3 mb-8"
        >
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search by title or artist..."
              className="w-full glass rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600
                         font-display text-sm focus:outline-none focus:border-purple-primary
                         border border-zinc-800 transition-colors"
            />
          </div>

          {/* Genre pills */}
          <div className="flex flex-wrap gap-2">
            {GENRES.map(g => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all duration-200
                  ${genre === g
                    ? 'bg-purple-primary text-white'
                    : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                  }`}
              >
                {g}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Loader2 className="w-8 h-8 text-purple-primary animate-spin" />
            <p className="text-zinc-500 font-display text-sm">Loading library...</p>
          </div>
        ) : error ? (
          <div className="text-center py-24 space-y-3">
            <Music2 className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-zinc-400 font-display">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 space-y-3">
            <Music2 className="w-12 h-12 text-zinc-700 mx-auto" />
            <p className="text-white font-display font-semibold">No songs found</p>
            <p className="text-zinc-500 text-sm">
              {songs.length === 0
                ? 'The library is empty. Add songs via the admin API.'
                : 'Try a different search or filter.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((song, i) => (
              <SongCard key={song.id} song={song} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  )
}
