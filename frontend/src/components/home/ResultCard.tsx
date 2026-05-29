import { motion } from 'framer-motion'
import { Music2, User, Disc3, Tag, Key, RotateCcw, TrendingUp } from 'lucide-react'
import { IdentifyResponse } from '../../lib/api'

interface Props {
  data:    IdentifyResponse
  onReset: () => void
}

export default function ResultCard({ data, onReset }: Props) {
  const { match, key_detected, notes_detected } = data
  const conf = match ? Math.round(match.confidence * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 22 }}
      className="w-full max-w-sm mx-auto"
    >
      {match ? (
        <div className="glass rounded-2xl p-6 space-y-5">

          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Music2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 font-display uppercase tracking-widest">Match found</p>
                <h3 className="font-display font-bold text-white text-lg leading-tight">{match.title}</h3>
              </div>
            </div>
            <button
              onClick={onReset}
              className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: User,  label: 'Artist', value: match.artist },
              { icon: Disc3, label: 'Album',  value: match.album  ?? '—' },
              { icon: Tag,   label: 'Genre',  value: match.genre  ?? '—' },
              { icon: Key,   label: 'Your key', value: key_detected?.key ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white/[0.03] rounded-xl p-3 border border-zinc-800/50">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-purple-light" />
                  <span className="text-xs text-zinc-500 font-display">{label}</span>
                </div>
                <p className="text-sm text-white font-medium truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Confidence bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-purple-light" />
                <span className="text-xs font-display text-zinc-400">Confidence</span>
              </div>
              <span className={`text-sm font-bold font-display ${
                conf >= 70 ? 'text-emerald-400' : conf >= 40 ? 'text-yellow-400' : 'text-red-400'
              }`}>{conf}%</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${conf}%` }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  conf >= 70 ? 'bg-emerald-400' : conf >= 40 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ boxShadow: conf >= 70 ? '0 0 12px rgba(52,211,153,0.6)' : undefined }}
              />
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 pt-1">
            {[
              { label: 'Notes', value: notes_detected },
              { label: 'Votes',  value: match.votes },
              { label: 'Key conf', value: `${Math.round((key_detected?.confidence ?? 0) * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 text-center">
                <p className="text-base font-bold font-display text-purple-light">{value}</p>
                <p className="text-xs text-zinc-500">{label}</p>
              </div>
            ))}
          </div>
        </div>

      ) : (
        // No match
        <div className="glass rounded-2xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto">
            <Music2 className="w-6 h-6 text-zinc-500" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">No match found</h3>
            <p className="text-sm text-zinc-500 mt-1">
              This song may not be in our library yet, or try singing more clearly.
            </p>
          </div>
          {key_detected && (
            <p className="text-sm text-zinc-400">
              Detected key: <span className="text-purple-light font-medium">{key_detected.key}</span>
            </p>
          )}
          <p className="text-xs text-zinc-600">{notes_detected} notes detected</p>
          <button onClick={onReset} className="btn-ghost text-sm w-full flex items-center justify-center gap-2">
            <RotateCcw className="w-4 h-4" /> Try again
          </button>
        </div>
      )}
    </motion.div>
  )
}
