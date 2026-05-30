import { motion } from 'framer-motion'
import { Music2, User2, Disc3, Tag, Key, RotateCcw, TrendingUp } from 'lucide-react'
import { IdentifyResponse } from '../../lib/api'

interface Props {
  data:    IdentifyResponse
  onReset: () => void
}

export default function ResultCard({ data, onReset }: Props) {
  const { match, key_detected, notes_detected } = data
  const conf = match ? Math.round(match.confidence * 100) : 0

  const confColor = conf >= 70
    ? { text: '#34D399', bar: 'linear-gradient(90deg, #34D399, #10B981)', glow: 'rgba(52,211,153,0.5)' }
    : conf >= 40
    ? { text: '#F59E0B', bar: 'linear-gradient(90deg, #F59E0B, #D97706)', glow: 'rgba(245,158,11,0.4)' }
    : { text: '#F472B6', bar: 'linear-gradient(90deg, #F472B6, #DB2777)', glow: 'rgba(244,114,182,0.4)' }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="w-full"
    >
      {match ? (
        <div className="neon-card p-5 space-y-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.3)' }}
              >
                <Music2 className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-neon-green">Match found</span>
                </div>
                <h3 className="font-display font-extrabold text-white text-base leading-tight">{match.title}</h3>
              </div>
            </div>
            <button
              onClick={onReset}
              className="p-2 rounded-lg text-muted hover:text-white transition-colors shrink-0"
              style={{ border: '1px solid rgba(45,43,78,0.8)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: User2, label: 'Artist',   value: match.artist },
              { icon: Disc3, label: 'Album',    value: match.album  ?? '—' },
              { icon: Tag,   label: 'Genre',    value: match.genre  ?? '—' },
              { icon: Key,   label: 'Your key', value: key_detected?.key ?? '—' },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-lg p-3"
                style={{ background: 'rgba(7,6,15,0.6)', border: '1px solid rgba(45,43,78,0.6)' }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <Icon className="w-3 h-3 text-violet-light" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-muted">{label}</span>
                </div>
                <p className="font-display font-semibold text-sm text-white truncate">{value}</p>
              </div>
            ))}
          </div>

          {/* Confidence */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-muted" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Confidence</span>
              </div>
              <span className="font-display font-bold text-sm" style={{ color: confColor.text }}>{conf}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${conf}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{
                  background: confColor.bar,
                  boxShadow: `0 0 10px ${confColor.glow}`,
                }}
              />
            </div>
          </div>

          {/* Mini stats */}
          <div
            className="flex gap-3 pt-1 rounded-lg p-3"
            style={{ background: 'rgba(7,6,15,0.5)', border: '1px solid rgba(45,43,78,0.5)' }}
          >
            {[
              { label: 'Notes',    value: notes_detected },
              { label: 'Votes',    value: match.votes },
              { label: 'Key conf', value: `${Math.round((key_detected?.confidence ?? 0) * 100)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 text-center">
                <p className="font-display font-bold text-sm text-violet-light">{value}</p>
                <p className="font-mono text-[9px] text-muted uppercase">{label}</p>
              </div>
            ))}
          </div>
        </div>

      ) : (
        <div className="neon-card p-5 text-center space-y-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(45,43,78,0.5)', border: '1px solid rgba(45,43,78,0.8)' }}
          >
            <Music2 className="w-6 h-6 text-muted" />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-sm mb-1">No match found</h3>
            <p className="font-mono text-xs text-muted leading-relaxed">
              Song may not be in the library yet, or try singing more clearly.
            </p>
          </div>
          {key_detected && (
            <p className="font-mono text-xs text-muted">
              Detected key: <span className="text-violet-light">{key_detected.key}</span>
            </p>
          )}
          <p className="font-mono text-xs text-muted opacity-60">{notes_detected} notes detected</p>
          <button onClick={onReset} className="btn-ghost text-xs w-full flex items-center justify-center gap-2 py-2">
            <RotateCcw className="w-3.5 h-3.5" /> Try again
          </button>
        </div>
      )}
    </motion.div>
  )
}
