import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Loader2, CheckCircle2, AlertCircle, Square, Lock } from 'lucide-react'
import { RecordState } from '../../hooks/useAudioRecorder'

interface Props {
  state:    RecordState
  duration: number
  canStop:  boolean
  onStart:  () => void
  onStop:   () => void
}

function formatDuration(s: number) {
  const m   = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

const STATE_CONFIG: Record<RecordState, { bg: string; glow: string; label: React.ReactNode }> = {
  idle: {
    bg:   'linear-gradient(135deg, #8B5CF6, #5B21B6)',
    glow: 'rgba(139,92,246,0.6)',
    label: <span className="font-mono text-xs text-muted">Tap to start scanning</span>,
  },
  requesting: {
    bg:   'linear-gradient(135deg, #8B5CF6, #5B21B6)',
    glow: 'rgba(139,92,246,0.5)',
    label: <span className="font-mono text-xs text-muted">Requesting microphone...</span>,
  },
  recording: {
    bg:   'linear-gradient(135deg, #F472B6, #DB2777)',
    glow: 'rgba(244,114,182,0.7)',
    label: null,
  },
  processing: {
    bg:   'linear-gradient(135deg, #8B5CF6, #06B6D4)',
    glow: 'rgba(139,92,246,0.6)',
    label: <span className="font-mono text-xs text-violet-light">Analyzing melody...</span>,
  },
  result: {
    bg:   'linear-gradient(135deg, #34D399, #059669)',
    glow: 'rgba(52,211,153,0.6)',
    label: <span className="font-mono text-xs text-neon-green">Signal acquired</span>,
  },
  error: {
    bg:   'linear-gradient(135deg, #F472B6, #BE185D)',
    glow: 'rgba(244,114,182,0.5)',
    label: <span className="font-mono text-xs text-neon-pink">Signal error</span>,
  },
}

export default function RecordButton({ state, duration, canStop, onStart, onStop }: Props) {
  const isRecording  = state === 'recording'
  const isProcessing = state === 'processing'
  const isResult     = state === 'result'
  const isError      = state === 'error'
  const isDisabled   = isProcessing || state === 'requesting'
  const cfg          = STATE_CONFIG[state]

  // Orb click: start when idle, stop when recording + canStop, no-op otherwise
  const handleOrbClick = () => {
    if (isDisabled || isResult || isError) return
    if (isRecording && canStop) onStop()
    else if (!isRecording) onStart()
  }

  const orbClickable = !isDisabled && !isResult && !isError && (!isRecording || canStop)

  return (
    <div className="flex flex-col items-center gap-4">

      {/* ── Orb button ──────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-center">

        {/* Recording rings */}
        <AnimatePresence>
          {isRecording && [0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ width: 120, height: 120, border: '1px solid rgba(244,114,182,0.5)' }}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 3.5, opacity: 0 }}
              transition={{ duration: 2, delay: i * 0.55, repeat: Infinity, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>

        {/* Idle pulse */}
        {state === 'idle' && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: 120, height: 120, background: 'rgba(139,92,246,0.12)' }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.15, 0.5] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Core button */}
        <motion.button
          onClick={handleOrbClick}
          disabled={!orbClickable}
          whileHover={orbClickable ? { scale: 1.07 } : {}}
          whileTap={orbClickable ? { scale: 0.93 } : {}}
          className="relative rounded-full flex items-center justify-center z-10 transition-opacity duration-500"
          style={{
            background: cfg.bg,
            boxShadow:  `0 0 40px ${cfg.glow}, 0 0 80px ${cfg.glow.replace(/[\d.]+\)$/, '0.25)')}`,
            width: 120, height: 120,
            opacity: isRecording && !canStop ? 0.65 : 1,
            cursor: orbClickable ? 'pointer' : 'default',
          }}
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div key="loader"
                initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              </motion.div>
            ) : isResult ? (
              <motion.div key="check"
                initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                <CheckCircle2 className="w-10 h-10 text-white" />
              </motion.div>
            ) : isError ? (
              <motion.div key="err"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <AlertCircle className="w-10 h-10 text-white" />
              </motion.div>
            ) : isRecording ? (
              <motion.div key="rec"
                animate={{ opacity: canStop ? [1, 0.5, 1] : 1 }}
                transition={{ duration: 1, repeat: canStop ? Infinity : 0 }}>
                <Mic className="w-10 h-10 text-white" />
              </motion.div>
            ) : (
              <motion.div key="mic"
                initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <Mic className="w-10 h-10 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* ── Stop pill — appears only while recording ─────────────────────── */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            key="stop-pill"
            initial={{ opacity: 0, y: -8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.92 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-full"
            style={{
              border: canStop
                ? '1px solid rgba(244,114,182,0.55)'
                : '1px solid rgba(139,92,246,0.3)',
              background: canStop
                ? 'rgba(244,114,182,0.08)'
                : 'rgba(14,12,28,0.5)',
              minWidth: 160,
            }}
          >
            {/* Fill progress bar (3-second linear fill) */}
            {!canStop && (
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, rgba(139,92,246,0.3), rgba(6,182,212,0.15))',
                  transformOrigin: 'left center',
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 3, ease: 'linear' }}
              />
            )}

            <button
              onClick={canStop ? onStop : undefined}
              disabled={!canStop}
              className="relative w-full flex items-center justify-center gap-2 px-6 py-2.5 transition-colors duration-300"
              style={{ cursor: canStop ? 'pointer' : 'default' }}
            >
              <AnimatePresence mode="wait">
                {canStop ? (
                  <motion.span
                    key="ready"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-widest"
                    style={{ color: '#F472B6' }}
                  >
                    <Square className="w-3 h-3 fill-current" />
                    Stop · identify
                  </motion.span>
                ) : (
                  <motion.span
                    key="locked"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 font-display font-bold text-xs uppercase tracking-widest"
                    style={{ color: 'rgba(139,92,246,0.6)' }}
                  >
                    <Lock className="w-3 h-3" />
                    Acquiring signal
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Status label ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isRecording ? (canStop ? 'rec-ready' : 'rec-locked') : state}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="text-center h-5 flex items-center justify-center"
        >
          {isRecording ? (
            canStop ? (
              <span className="flex items-center gap-2 font-mono text-xs text-neon-pink">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-pink animate-pulse" />
                {formatDuration(duration)} · sing your part, then stop
              </span>
            ) : (
              <span className="font-mono text-xs text-muted">
                {formatDuration(duration)} · keep humming...
              </span>
            )
          ) : cfg.label}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
