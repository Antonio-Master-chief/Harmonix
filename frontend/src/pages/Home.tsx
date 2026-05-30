import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import { Mic, Upload, Zap, Shield, Fingerprint, Layers, ArrowRight, RotateCcw, Music2, Radio } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import RecordButton from '../components/home/RecordButton'
import WaveVisualizer from '../components/home/WaveVisualizer'
import ResultCard from '../components/home/ResultCard'
import UploadZone from '../components/home/UploadZone'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { IdentifyResponse } from '../lib/api'

type Tab = 'record' | 'upload'

const WORDS = ['singing.', 'humming.', 'whistling.', 'la-la-la.']

const STATS = [
  { value: '0',    label: 'External APIs',        sub: 'entirely custom-built' },
  { value: '100%', label: 'Own Algorithm',         sub: 'interval fingerprinting' },
  { value: '6',    label: 'Pipeline Stages',       sub: 'pYIN → DTW → chroma' },
  { value: '∞',    label: 'Songs Identifiable',    sub: 'by melody alone' },
]

const FEATURES = [
  { icon: Zap,         title: 'Any key',          desc: 'Sing in your range, not the song\'s. Transpose-invariant by design.' },
  { icon: Mic,         title: 'Hum or whistle',   desc: 'No lyrics needed. Your melody is the fingerprint.' },
  { icon: Shield,      title: 'Zero third parties', desc: 'Built from scratch. No Shazam, ACRCloud, or external databases.' },
  { icon: Fingerprint, title: 'Key detection',    desc: 'Detects the musical key you naturally sang in via Krumhansl–Schmuckler.' },
]

const PIPELINE = [
  { n: '01', title: 'Preprocess',   desc: '80Hz highpass, normalize, silence trim' },
  { n: '02', title: 'Pitch extract', desc: 'pYIN algorithm — voiced probability 0.45' },
  { n: '03', title: 'Segment',      desc: 'MIN_NOTE 80ms, merge within 50ms/0.8st' },
  { n: '04', title: 'Fingerprint',  desc: 'SHA-256 skip-gram hashing, fine + coarse' },
  { n: '05', title: 'Vote + DTW',   desc: 'Offset voting, Sakoe-Chiba DTW band 20%' },
  { n: '06', title: 'Verify',       desc: 'Chromagram 12-key circular shift, KS key' },
]

/* Spinning orbital rings behind the scanner */
function OrbitalRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      {[220, 300, 380].map((size, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: size,
            height: size,
            border: `1px solid rgba(139,92,246,${0.22 - i * 0.06})`,
            boxShadow: `0 0 ${12 + i * 8}px rgba(139,92,246,${0.15 - i * 0.04}) inset`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 20 + i * 10, repeat: Infinity, ease: 'linear' }}
        >
          {/* Dot on ring */}
          <motion.div
            className="absolute w-2 h-2 rounded-full"
            style={{
              top: -4,
              left: '50%',
              marginLeft: -4,
              background: i === 0 ? '#8B5CF6' : i === 1 ? '#06B6D4' : '#F472B6',
              boxShadow: `0 0 8px ${i === 0 ? '#8B5CF6' : i === 1 ? '#06B6D4' : '#F472B6'}`,
            }}
          />
        </motion.div>
      ))}
    </div>
  )
}

/* Central scanner orb */
function ScannerOrb({ isRecording }: { isRecording: boolean }) {
  return (
    <div className="relative w-52 h-52 mx-auto">
      {/* Sonar rings */}
      {isRecording && [0, 1, 2, 3].map(i => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(244,114,182,0.5)' }}
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 3.5, opacity: 0 }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.55,
            ease: 'easeOut',
          }}
        />
      ))}
      {!isRecording && [0, 1, 2].map(i => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(139,92,246,0.35)' }}
          initial={{ scale: 1, opacity: 0.5 }}
          animate={{ scale: 2.8, opacity: 0 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.8,
            ease: 'easeOut',
          }}
        />
      ))}

      {/* Core */}
      <motion.div
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{
          background: isRecording
            ? 'radial-gradient(circle, rgba(244,114,182,0.25) 0%, rgba(139,92,246,0.10) 60%, transparent 100%)'
            : 'radial-gradient(circle, rgba(139,92,246,0.20) 0%, rgba(6,182,212,0.05) 60%, transparent 100%)',
          border: `1px solid ${isRecording ? 'rgba(244,114,182,0.4)' : 'rgba(139,92,246,0.3)'}`,
        }}
        animate={{
          boxShadow: isRecording
            ? ['0 0 30px rgba(244,114,182,0.4)', '0 0 80px rgba(244,114,182,0.7)', '0 0 30px rgba(244,114,182,0.4)']
            : ['0 0 20px rgba(139,92,246,0.2)', '0 0 50px rgba(139,92,246,0.4)', '0 0 20px rgba(139,92,246,0.2)'],
        }}
        transition={{ duration: isRecording ? 1.2 : 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{
            background: isRecording
              ? 'linear-gradient(135deg, rgba(244,114,182,0.4), rgba(139,92,246,0.4))'
              : 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.2))',
          }}
        >
          <Radio className={`w-8 h-8 ${isRecording ? 'text-pink-300' : 'text-violet-light'}`} />
        </div>
      </motion.div>
    </div>
  )
}

/* Cycling subtitle word */
function CycleWord() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % WORDS.length), 2600)
    return () => clearInterval(t)
  }, [])
  return (
    <AnimatePresence mode="wait">
      <motion.span key={idx}
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.28 }}
        className="gradient-text font-display font-extrabold"
      >
        {WORDS[idx]}
      </motion.span>
    </AnimatePresence>
  )
}

export default function Home() {
  const [tab,          setTab]          = useState<Tab>('record')
  const [uploadResult, setUploadResult] = useState<IdentifyResponse | null>(null)
  const recorder = useAudioRecorder()

  const showResult = recorder.state === 'result' || recorder.state === 'error' || !!uploadResult
  const currentResult = recorder.result ?? uploadResult

  const handleReset = () => { recorder.reset(); setUploadResult(null) }

  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -60])

  return (
    <PageWrapper>

      {/* ── HERO SCANNER ──────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative min-h-[94vh] flex flex-col items-center justify-center px-4 overflow-hidden">

        {/* Ambient background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
               style={{ background: 'radial-gradient(circle, #8B5CF6 0%, #06B6D4 50%, transparent 70%)' }} />
        </div>

        <OrbitalRings />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 w-full max-w-md text-center"
        >
          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full font-mono text-xs text-muted"
            style={{ border: '1px solid rgba(45,43,78,0.8)', background: 'rgba(14,12,28,0.6)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
            SIGNAL READY — Interval fingerprint engine v2
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight mb-3"
          >
            <span className="text-white">Name that</span>
            <br />
            <span className="gradient-text">melody.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-muted mb-10 flex items-center justify-center gap-2 flex-wrap"
          >
            <span className="font-body text-sm">Identify any song by</span>
            <CycleWord />
          </motion.p>

          {/* Scanner core */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              {currentResult && showResult ? (
                <motion.div key="result"
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}>
                  <ResultCard data={currentResult} onReset={handleReset} />
                </motion.div>
              ) : (
                <motion.div key="scanner"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="neon-card p-6 space-y-5"
                >
                  {/* Orb visualization */}
                  <ScannerOrb isRecording={recorder.state === 'recording'} />

                  {/* Tab switcher */}
                  <div
                    className="flex rounded-xl overflow-hidden"
                    style={{ border: '1px solid rgba(45,43,78,0.8)', background: 'rgba(7,6,15,0.6)' }}
                  >
                    {(['record', 'upload'] as Tab[]).map(t => (
                      <button
                        key={t}
                        onClick={() => { setTab(t); handleReset() }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-display font-bold text-xs uppercase tracking-widest transition-all duration-250
                          ${tab === t
                            ? 'text-white bg-gradient-to-r from-violet to-violet-dark'
                            : 'text-muted hover:text-white'
                          }`}
                      >
                        {t === 'record' ? <Mic className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
                        {t}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <AnimatePresence mode="wait">
                    {tab === 'record' ? (
                      <motion.div key="rec"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className="space-y-4"
                      >
                        <RecordButton state={recorder.state} duration={recorder.duration} canStop={recorder.canStop} onStart={recorder.start} onStop={recorder.stop} />
                        <WaveVisualizer analyser={recorder.analyser} isActive={recorder.state === 'recording'} isProcessing={recorder.state === 'processing'} />
                        {recorder.error && recorder.state !== 'recording' && (
                          <p className="text-xs text-neon-pink text-center font-mono">{recorder.error}</p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div key="upl"
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                        <UploadZone onResult={r => setUploadResult(r)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        >
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted opacity-50">scroll</span>
          <motion.div className="w-px h-8 bg-gradient-to-b from-violet to-transparent opacity-50"
            animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </motion.div>
      </div>

      {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
      <section className="py-16 px-4 border-t" style={{ borderColor: 'rgba(45,43,78,0.5)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, sub }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="stat-card group"
            >
              <div className="stat-value gradient-text">{value}</div>
              <div className="font-display font-semibold text-sm text-white">{label}</div>
              <div className="font-mono text-[10px] text-muted">{sub}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── ALGORITHM SECTION ──────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
          >
            <div>
              <p className="section-label">The engine</p>
              <h2 className="font-display font-extrabold text-4xl sm:text-5xl text-white leading-tight">
                Not pitch.<br />
                <span className="gradient-text">Intervals.</span>
              </h2>
            </div>
            <p className="text-muted text-sm max-w-xs leading-relaxed font-body">
              Most apps need exact notes. Harmonix reads the <em className="text-violet-light not-italic">pattern between notes</em> — which stays constant regardless of key.
            </p>
          </motion.div>

          {/* Pipeline steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PIPELINE.map(({ n, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="panel-hover rounded-xl p-5 flex gap-4"
              >
                <span className="font-mono text-xs text-violet font-bold shrink-0 mt-0.5">{n}</span>
                <div>
                  <div className="font-display font-bold text-sm text-white mb-1">{title}</div>
                  <div className="font-mono text-[11px] text-muted leading-relaxed">{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t" style={{ borderColor: 'rgba(45,43,78,0.4)' }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <p className="section-label">Why Harmonix</p>
            <h2 className="font-display font-extrabold text-4xl text-white">
              Built <span className="gradient-text-pink">different.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09, duration: 0.5 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="panel-hover rounded-2xl p-6 flex gap-4"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  <Icon className="w-5 h-5 text-violet-light" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm mb-1">{title}</h3>
                  <p className="font-body text-xs text-muted leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full blur-[100px] opacity-12"
               style={{ background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-xl mx-auto text-center space-y-7"
        >
          <div className="section-label justify-center flex">signal detected</div>
          <h2 className="font-display font-extrabold text-5xl sm:text-6xl text-white leading-[0.95]">
            That tune<br />
            <span className="gradient-text">in your head?</span>
          </h2>
          <p className="text-muted text-sm max-w-sm mx-auto font-body leading-relaxed">
            Sing it. Hum it. Whistle it. Harmonix will identify it — no lyrics, no beat, just the melody.
          </p>
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-primary inline-flex items-center gap-2.5 text-sm"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <Mic className="w-4 h-4" />
            Start scanning
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="border-t py-8 px-4"
        style={{ borderColor: 'rgba(45,43,78,0.5)' }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Music2 className="w-3.5 h-3.5 text-violet opacity-60" />
            <span className="font-mono text-xs text-muted">© 2025 HARMONIX</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] text-muted opacity-50 uppercase tracking-widest">Interval fingerprint engine</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="font-mono text-[10px] text-neon-green">online</span>
            </div>
          </div>
        </div>
      </footer>
    </PageWrapper>
  )
}
