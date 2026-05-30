import { motion } from 'framer-motion'
import { Music2, Clock } from 'lucide-react'
import { Song } from '../../lib/api'

const GENRE_MAP: Record<string, { color: string; bg: string }> = {
  pop:       { color: '#F472B6', bg: 'rgba(244,114,182,0.1)' },
  rock:      { color: '#F97316', bg: 'rgba(249,115,22,0.1)'  },
  jazz:      { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)'  },
  classical: { color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' },
  hip:       { color: '#22D3EE', bg: 'rgba(34,211,238,0.1)'  },
  'r&b':     { color: '#34D399', bg: 'rgba(52,211,153,0.1)'  },
  electronic:{ color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
  folk:      { color: '#84CC16', bg: 'rgba(132,204,22,0.1)'  },
  default:   { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)'  },
}

function genreStyle(genre?: string) {
  if (!genre) return GENRE_MAP.default
  const key = Object.keys(GENRE_MAP).find(k => genre.toLowerCase().includes(k))
  return key ? GENRE_MAP[key] : GENRE_MAP.default
}

function formatDuration(s?: number) {
  if (!s) return null
  return `${Math.floor(s / 60)}:${Math.round(s % 60).toString().padStart(2, '0')}`
}

interface Props {
  song:  Song
  index: number
}

export default function SongCard({ song, index }: Props) {
  const style = genreStyle(song.genre)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="panel-hover rounded-xl p-4 flex items-center gap-4 group"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
        style={{ background: style.bg, border: `1px solid ${style.color}33` }}
      >
        <Music2 className="w-4.5 h-4.5" style={{ color: style.color, width: 18, height: 18 }} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-display font-semibold text-sm text-white truncate">{song.title}</p>
        <p className="font-mono text-xs text-muted truncate">{song.artist}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 shrink-0">
        {song.genre && (
          <span
            className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ color: style.color, background: style.bg, border: `1px solid ${style.color}33` }}
          >
            {song.genre}
          </span>
        )}
        {song.duration && (
          <span className="flex items-center gap-1 font-mono text-[10px] text-muted">
            <Clock className="w-3 h-3" />
            {formatDuration(song.duration)}
          </span>
        )}
      </div>
    </motion.div>
  )
}
