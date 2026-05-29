import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, Upload, Zap, Shield, Globe, ChevronDown } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import RecordButton from '../components/home/RecordButton'
import WaveVisualizer from '../components/home/WaveVisualizer'
import ResultCard from '../components/home/ResultCard'
import UploadZone from '../components/home/UploadZone'
import HowItWorks from '../components/home/HowItWorks'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { IdentifyResponse } from '../lib/api'

type Tab = 'record' | 'upload'

const features = [
  { icon: Zap,    title: 'Any key works',    desc: 'Transpose-invariant algorithm — sing in your own pitch range' },
  { icon: Mic,    title: 'Hum or whistle',   desc: 'No lyrics needed. Your melody is the fingerprint.' },
  { icon: Shield, title: 'Custom algorithm', desc: 'Interval fingerprinting + DTW — built from scratch' },
  { icon: Globe,  title: 'Key detection',    desc: 'Tells you what key you naturally sang in' },
]

// Animated subtitle words
const SUBTITLES = ['singing.', 'humming.', 'whistling.', 'la-la-la.']

export default function Home() {
  const [tab, setTab]       = useState<Tab>('record')
  const [subIdx, setSubIdx] = useState(0)
  const recorder            = useAudioRecorder()

  const [uploadResult, setUploadResult] = useState<IdentifyResponse | null>(null)

  const showResult = recorder.state === 'result' || recorder.state === 'error' || uploadResult

  // Cycle subtitle every 2.5s
  useState(() => {
    const id = setInterval(() => setSubIdx(i => (i + 1) % SUBTITLES.length), 2500)
    return () => clearInterval(id)
  })

  const handleReset = () => {
    recorder.reset()
    setUploadResult(null)
  }

  const currentResult = recorder.result ?? uploadResult

  return (
    <PageWrapper>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-4 pb-12 text-center overflow-hidden">

        {/* Radial glow over image */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
            style={{ width: 700, height: 700, background: 'radial-gradient(circle, #6C63FF 0%, transparent 70%)' }}
          />
        </div>

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-primary/30 text-xs font-display text-purple-light mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-primary animate-pulse" />
          Interval-based music recognition — No exact pitch required
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, ease: [0.22,1,0.36,1] }}
          className="font-display font-bold text-5xl sm:text-7xl md:text-8xl text-white leading-none tracking-tight mb-6"
        >
          Feel the key.
          <br />
          <span className="gradient-text">Hear the soul.</span>
        </motion.h1>

        {/* Animated subtitle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="h-8 flex items-center justify-center mb-12"
        >
          <span className="text-zinc-500 font-display text-lg mr-2">Identify any song by</span>
          <AnimatePresence mode="wait">
            <motion.span
              key={subIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{   opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="gradient-text font-display font-semibold text-lg"
            >
              {SUBTITLES[subIdx]}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* ── Identifier Card ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22,1,0.36,1] }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            {currentResult && (recorder.state === 'result' || recorder.state === 'error' || uploadResult) ? (
              <motion.div key="result">
                <ResultCard data={currentResult} onReset={handleReset} />
              </motion.div>
            ) : (
              <motion.div key="identifier" className="glass rounded-3xl p-6 space-y-6">

                {/* Tabs */}
                <div className="flex bg-black/40 rounded-xl p-1 gap-1">
                  {(['record', 'upload'] as Tab[]).map(t => (
                    <button
                      key={t}
                      onClick={() => { setTab(t); handleReset() }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg
                                  text-sm font-display font-medium transition-all duration-250
                                  ${tab === t
                                    ? 'bg-purple-primary text-white shadow-lg'
                                    : 'text-zinc-500 hover:text-zinc-300'
                                  }`}
                    >
                      {t === 'record' ? <Mic className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Tab content */}
                <AnimatePresence mode="wait">
                  {tab === 'record' ? (
                    <motion.div
                      key="record"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{   opacity: 0, x: 12 }}
                      className="space-y-5"
                    >
                      <RecordButton
                        state={recorder.state}
                        duration={recorder.duration}
                        onStart={recorder.start}
                        onStop={recorder.stop}
                      />
                      <WaveVisualizer
                        analyser={recorder.analyser}
                        isActive={recorder.state === 'recording'}
                        isProcessing={recorder.state === 'processing'}
                      />
                      {recorder.error && recorder.state !== 'recording' && (
                        <p className="text-sm text-red-400 text-center font-display">{recorder.error}</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{   opacity: 0, x: -12 }}
                    >
                      <UploadZone onResult={r => { setUploadResult(r) }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600"
        >
          <span className="text-xs font-display">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-xs font-display uppercase tracking-widest text-purple-light mb-3">Why Harmonix</p>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
              Built different
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-hover rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-glow flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-purple-light" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 py-8 px-4 text-center">
        <p className="text-sm text-zinc-600 font-display">
          © 2025 <span className="gradient-text">HARMONIX</span> — Built by Antonio
        </p>
      </footer>
    </PageWrapper>
  )
}
