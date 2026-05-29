import { motion } from 'framer-motion'
import { Music2, Clock, Hash } from 'lucide-react'
import { Song } from '../../lib/api'

const GENRE_COLORS: Record<string, string> = {
  pop:       '#ec4899', rock: '#f97316', jazz: '#eab308',
  classical: '#8b5cf6', hip: '#06b6d4', 'r&b': '#10b981',
  electronic:'#6C63FF', folk: '#84cc16', default: '#6C63FF',
}

function genreColor(genre?: string) {
  if (!genre) return GENRE_COLORS.default
  const key = Object.keys(GENRE_COLORS).find(k => genre.toLowerCase().includes(k))
  return key ? GENRE_COLORS[key] : GENRE_COLORS.default
}

function formatDuration(s?: number) {
  if (!s) return '—'
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

interface Props {
  song:  Song
  index: number
}

export default function SongCard({ song, index }: Props) {
  const color = genreColor(song.genre)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22,1,0.36,1] }}
      className="glass-hover rounded-2xl p-5 flex items-center gap-4 group"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                   transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}22`, boxShadow: `0 0 16px ${color}33` }}
      >
        <Music2 className="w-6 h-6" style={{ color }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h3 className="font-display font-semibold text-white truncate">{song.title}</h3>
        <p className="text-sm text-zinc-500 truncate">{song.artist}</p>
        {song.album && (
          <p className="text-xs text-zinc-600 truncate mt-0.5">{song.album}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        {song.genre && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-display font-medium"
            style={{ background: `${color}22`, color }}
          >
            {song.genre}
          </span>
        )}
        <div className="flex items-center gap-3 text-xs text-zinc-600">
          {song.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(song.duration)}
            </span>
          )}
          {song.note_count && (
            <span className="flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {song.note_count}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  )
}
