import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { RecordState } from '../../hooks/useAudioRecorder'

interface Props {
  state:    RecordState
  duration: number
  onStart:  () => void
  onStop:   () => void
}

const COLORS: Record<RecordState, string> = {
  idle:       'linear-gradient(135deg, #6C63FF, #4F46E5)',
  requesting: 'linear-gradient(135deg, #6C63FF, #4F46E5)',
  recording:  'linear-gradient(135deg, #ef4444, #b91c1c)',
  processing: 'linear-gradient(135deg, #6C63FF, #7C3AED)',
  result:     'linear-gradient(135deg, #10b981, #059669)',
  error:      'linear-gradient(135deg, #ef4444, #b91c1c)',
}

const GLOW: Record<RecordState, string> = {
  idle:       'rgba(108,99,255,0.5)',
  requesting: 'rgba(108,99,255,0.5)',
  recording:  'rgba(239,68,68,0.6)',
  processing: 'rgba(108,99,255,0.6)',
  result:     'rgba(16,185,129,0.5)',
  error:      'rgba(239,68,68,0.5)',
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

export default function RecordButton({ state, duration, onStart, onStop }: Props) {
  const isRecording  = state === 'recording'
  const isProcessing = state === 'processing'
  const isResult     = state === 'result'
  const isError      = state === 'error'
  const isDisabled   = isProcessing || state === 'requesting'

  const handleClick = () => {
    if (isDisabled || isResult || isError) return
    if (isRecording) onStop()
    else             onStart()
  }

  return (
    <div className="flex flex-col items-center gap-6">

      {/* Button + sonar rings */}
      <div className="relative flex items-center justify-center">

        {/* Sonar rings — only when recording */}
        <AnimatePresence>
          {isRecording && [0, 1, 2, 3, 4].map(i => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-red-500/60"
              style={{ width: 160, height: 160 }}
              initial={{ scale: 1, opacity: 0.7 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{
                duration: 2.2,
                delay: i * 0.44,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>

        {/* Idle glow pulse */}
        {state === 'idle' && (
          <motion.div
            className="absolute rounded-full"
            style={{ width: 160, height: 160, background: 'rgba(108,99,255,0.2)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Main button */}
        <motion.button
          onClick={handleClick}
          disabled={isDisabled}
          whileHover={!isDisabled ? { scale: 1.06 } : {}}
          whileTap={!isDisabled  ? { scale: 0.94 } : {}}
          style={{
            background: COLORS[state],
            boxShadow: `0 0 40px ${GLOW[state]}, 0 0 80px ${GLOW[state]}44`,
            width: 160, height: 160,
          }}
          className="relative rounded-full flex items-center justify-center cursor-pointer
                     transition-shadow duration-300 z-10 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait">
            {isProcessing ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{   opacity: 0, scale: 0.5 }}
              >
                <Loader2 className="w-14 h-14 text-white animate-spin" />
              </motion.div>
            ) : isResult ? (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{   opacity: 0, scale: 0.5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <CheckCircle2 className="w-14 h-14 text-white" />
              </motion.div>
            ) : isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{   opacity: 0, scale: 0.5 }}
              >
                <AlertCircle className="w-14 h-14 text-white" />
              </motion.div>
            ) : isRecording ? (
              <motion.div
                key="mic-active"
                initial={{ opacity: 0 }}
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <MicOff className="w-14 h-14 text-white" />
              </motion.div>
            ) : (
              <motion.div
                key="mic"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{   opacity: 0, scale: 0.7 }}
              >
                <Mic className="w-14 h-14 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        <motion.p
          key={state}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{   opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="text-sm font-display text-zinc-400 text-center"
        >
          {state === 'idle'       && 'Tap to start singing or humming'}
          {state === 'requesting' && 'Requesting microphone access...'}
          {state === 'recording'  && (
            <span className="flex items-center gap-2 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Recording — {formatDuration(duration)} — tap to identify
            </span>
          )}
          {state === 'processing' && (
            <span className="text-purple-light">Analyzing your melody...</span>
          )}
          {state === 'result'     && <span className="text-emerald-400">Match found!</span>}
          {state === 'error'      && <span className="text-red-400">Something went wrong</span>}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}
