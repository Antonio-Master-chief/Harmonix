import { useRef, useState } from 'react'
import { motion, useScroll, useTransform, useSpring, AnimatePresence, useInView } from 'framer-motion'
import { Mic, Upload, Zap, Shield, Globe, ChevronDown, Fingerprint, Layers, Wand2, ArrowRight } from 'lucide-react'
import PageWrapper from '../components/layout/PageWrapper'
import RecordButton from '../components/home/RecordButton'
import WaveVisualizer from '../components/home/WaveVisualizer'
import ResultCard from '../components/home/ResultCard'
import UploadZone from '../components/home/UploadZone'
import HowItWorks from '../components/home/HowItWorks'
import { useAudioRecorder } from '../hooks/useAudioRecorder'
import { IdentifyResponse } from '../lib/api'

type Tab = 'record' | 'upload'
const SUBTITLES = ['singing.', 'humming.', 'whistling.', 'la-la-la.']

const FEATURES = [
  { icon: Zap,    title: 'Any key works',    desc: 'Transpose-invariant — sing in your own pitch range, not the song\'s.' },
  { icon: Mic,    title: 'Hum or whistle',   desc: 'No lyrics needed. Your melody alone is the fingerprint.' },
  { icon: Shield, title: 'Custom algorithm', desc: 'Interval fingerprinting + DTW — built from scratch, zero third-party APIs.' },
  { icon: Globe,  title: 'Key detection',    desc: 'Tells you what musical key you naturally sang in.' },
]

const ALGO_STEPS = [
  { icon: Fingerprint, text: 'Semitone interval sequence fingerprinting' },
  { icon: Layers,      text: 'Dynamic Time Warping (DTW) matching' },
  { icon: Wand2,       text: 'Key detection from your natural voice' },
]

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[60] origin-left"
      style={{ scaleX, background: 'linear-gradient(90deg, #6C63FF, #A78BFA, #C4BFFF)' }}
    />
  )
}

function SonarOrb() {
  return (
    <div className="relative w-72 h-72 mx-auto select-none">
      {[{ r: 128, op: 0.10 }, { r: 96, op: 0.18 }, { r: 64, op: 0.28 }, { r: 32, op: 0.45 }].map(({ r, op }, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [op, op * 2.2, op] }}
          transition={{ duration: 2.5 + i * 0.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
        >
          <div className="rounded-full border border-purple-primary" style={{ width: r, height: r, borderColor: `rgba(108,99,255,${op + 0.1})` }} />
        </motion.div>
      ))}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-7 h-7 rounded-full bg-purple-primary"
          animate={{
            scale: [1, 1.5, 1],
            boxShadow: ['0 0 0px rgba(108,99,255,0.4)', '0 0 48px rgba(108,99,255,0.9)', '0 0 0px rgba(108,99,255,0.4)'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <svg viewBox="0 0 288 288" className="w-full h-full opacity-55">
          <defs>
            <linearGradient id="sonarWave" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.05"/>
              <stop offset="45%"  stopColor="#A78BFA" stopOpacity="0.9"/>
              <stop offset="55%"  stopColor="#C4BFFF"/>
              <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.05"/>
            </linearGradient>
          </defs>
          <path
            d="M 18 144 L 44 144 C 50 144 56 116 64 116 C 72 116 78 144 88 144 C 96 144 102 106 116 96 C 126 89 132 86 144 84 C 156 86 162 89 172 96 C 186 106 192 144 200 144 C 210 144 216 116 224 116 C 232 116 238 144 244 144 L 270 144"
            fill="none" stroke="url(#sonarWave)" strokeWidth="3.5" strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}

function StatBlock({ value, label }: { value: string; label: string }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-center">
      <div className="font-display font-bold text-4xl sm:text-5xl gradient-text mb-2 leading-none">{value}</div>
      <div className="text-zinc-500 font-display text-xs sm:text-sm tracking-wide leading-snug">{label}</div>
    </motion.div>
  )
}

export default function Home() {
  const [tab,          setTab]          = useState<Tab>('record')
  const [subIdx,       setSubIdx]       = useState(0)
  const [uploadResult, setUploadResult] = useState<IdentifyResponse | null>(null)
  const recorder = useAudioRecorder()

  const heroRef = useRef<HTMLElement>(null)
  const algRef  = useRef<HTMLElement>(null)

  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroY       = useTransform(heroProgress, [0, 1], [0, -70])
  const heroBadgeOp = useTransform(heroProgress, [0, 0.5], [1, 0])

  const { scrollYProgress: algProgress } = useScroll({ target: algRef, offset: ['start end', 'end start'] })
  const orbRotate = useTransform(algProgress, [0, 1], [0, 40])
  const orbScale  = useTransform(algProgress, [0, 0.5, 1], [0.88, 1.06, 0.94])

  const showResult = recorder.state === 'result' || recorder.state === 'error' || !!uploadResult
  const currentResult = recorder.result ?? uploadResult

  useState(() => {
    const id = setInterval(() => setSubIdx(i => (i + 1) % SUBTITLES.length), 2500)
    return () => clearInterval(id)
  })

  const handleReset = () => { recorder.reset(); setUploadResult(null) }

  return (
    <PageWrapper>
      <ScrollProgressBar />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 pt-4 pb-12 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
               style={{ width: 800, height: 800, background: 'radial-gradient(circle, #6C63FF 0%, #A78BFA 40%, transparent 70%)' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          style={{ y: heroY, opacity: heroBadgeOp }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-purple-primary/30 text-xs font-display text-purple-light mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-primary animate-pulse" />
          Interval-based music recognition — No exact pitch required
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ y: heroY }}
          transition={{ delay: 0.2, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="font-display font-bold text-5xl sm:text-7xl md:text-8xl text-white leading-none tracking-tight mb-6"
        >
          Feel the key.
          <br />
          <span className="gradient-text">Hear the soul.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ y: heroY, opacity: heroBadgeOp }} transition={{ delay: 0.4 }}
          className="h-8 flex items-center justify-center mb-12"
        >
          <span className="text-zinc-500 font-display text-lg mr-2">Identify any song by</span>
          <AnimatePresence mode="wait">
            <motion.span key={subIdx}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="gradient-text font-display font-semibold text-lg"
            >{SUBTITLES[subIdx]}</motion.span>
          </AnimatePresence>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          <AnimatePresence mode="wait">
            {currentResult && showResult ? (
              <motion.div key="result"><ResultCard data={currentResult} onReset={handleReset} /></motion.div>
            ) : (
              <motion.div key="identifier" className="glass rounded-3xl p-6 space-y-6">
                <div className="flex bg-black/40 rounded-xl p-1 gap-1">
                  {(['record', 'upload'] as Tab[]).map(t => (
                    <button key={t} onClick={() => { setTab(t); handleReset() }}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-display font-medium transition-all duration-250
                        ${tab === t ? 'bg-purple-primary text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      {t === 'record' ? <Mic className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
                <AnimatePresence mode="wait">
                  {tab === 'record' ? (
                    <motion.div key="record" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} className="space-y-5">
                      <RecordButton state={recorder.state} duration={recorder.duration} onStart={recorder.start} onStop={recorder.stop} />
                      <WaveVisualizer analyser={recorder.analyser} isActive={recorder.state === 'recording'} isProcessing={recorder.state === 'processing'} />
                      {recorder.error && recorder.state !== 'recording' && (
                        <p className="text-sm text-red-400 text-center font-display">{recorder.error}</p>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div key="upload" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                      <UploadZone onResult={r => setUploadResult(r)} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-zinc-600">
          <span className="text-xs font-display">Scroll to explore</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </motion.div>
      </section>

      {/* ── Stats Strip ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 border-t border-zinc-900/60">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-6 sm:gap-12">
          <StatBlock value="0"    label="External music databases used" />
          <StatBlock value="100%" label="Custom-built recognition engine" />
          <StatBlock value="∞"    label="Songs identifiable by melody alone" />
        </div>
      </section>

      {/* ── Algorithm Section ────────────────────────────────────────────── */}
      <section ref={algRef} className="py-28 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -56 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7"
          >
            <p className="text-xs font-display uppercase tracking-widest text-purple-light">The Science</p>
            <h2 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight">
              Not pitch matching.<br />
              <span className="gradient-text">Interval fingerprinting.</span>
            </h2>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Most apps need exact notes. Harmonix reads the{' '}
              <em className="text-purple-light not-italic font-medium">pattern between notes</em> — the intervals,
              the melody's shape — which stays identical no matter what key you sing in.
            </p>
            <div className="space-y-4 pt-1">
              {ALGO_STEPS.map(({ icon: Icon, text }, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.3, duration: 0.5 }}
                  className="flex items-center gap-3 text-zinc-300"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-glow flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-purple-light" />
                  </div>
                  <span className="font-display text-sm">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div style={{ rotate: orbRotate, scale: orbScale }} className="hidden md:block">
            <SonarOrb />
          </motion.div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="text-center mb-16"
          >
            <p className="text-xs font-display uppercase tracking-widest text-purple-light mb-3">Why Harmonix</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white leading-tight">
              Built<br /><span className="gradient-text">different.</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -5, transition: { duration: 0.22, ease: 'easeOut' } }}
                className="glass-hover rounded-2xl p-6 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-purple-glow flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-purple-light" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-white mb-1.5">{title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <HowItWorks />

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-36 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px] opacity-15"
               style={{ width: 600, height: 400, background: 'radial-gradient(ellipse, #6C63FF 0%, transparent 70%)' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-2xl mx-auto text-center space-y-8"
        >
          <h2 className="font-display font-bold text-5xl sm:text-6xl md:text-7xl text-white leading-none tracking-tight">
            That melody<br />
            <span className="gradient-text">in your head?</span>
          </h2>
          <p className="text-zinc-400 text-lg sm:text-xl max-w-md mx-auto leading-relaxed">
            Sing it. Hum it. Whistle it. We'll find it.<br />No lyrics. No beat. Just you and the tune.
          </p>
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="btn-primary inline-flex items-center gap-2.5 text-base px-8 py-4"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.18 }}
          >
            Start identifying <ArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
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
