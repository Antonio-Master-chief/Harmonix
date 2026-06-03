import { useState, useRef, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic2, Search, Music2, Fingerprint, Instagram, Github, ExternalLink } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'

const capabilities = [
  {
    icon: Mic2,
    title: 'Voice-first identification',
    desc: 'Hum it, sing it, whistle it, or just go "la la la". Harmonix figures out the song from the melody alone — no lyrics, no beat, just the tune in your head.',
    accent: '#8B5CF6',
  },
  {
    icon: Music2,
    title: 'Off-key? Wrong octave?',
    desc: "Nobody sings perfectly. Harmonix is built to understand melody the way humans hear it — key-invariant and octave-tolerant by design.",
    accent: '#06B6D4',
  },
  {
    icon: Fingerprint,
    title: 'Unique melody signatures',
    desc: 'Two songs can share the same beat, tempo, or instruments — but no two original melodies are identical. Harmonix knows the difference.',
    accent: '#F472B6',
  },
  {
    icon: Search,
    title: 'Find without knowing the name',
    desc: "Had a melody stuck in your head for days? Sing it into Harmonix. That's literally all it takes.",
    accent: '#34D399',
  },
]

const steps = [
  { num: '01', text: 'An artist composes an original melody and submits it to Harmonix.' },
  { num: '02', text: 'Harmonix creates a permanent, timestamped fingerprint — the earliest submission is the original.' },
  { num: '03', text: 'If the same melody appears later, Harmonix identifies it and traces it back to the source.' },
  { num: '04', text: 'The artist now has a verifiable, independent record that predates any copies.' },
]

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
}

// ── Melody Fingerprint Visualization ────────────────────────────────────────

// Each value is a note height as % from bottom — this shape is the "fingerprint"
const HEIGHTS   = [42, 68, 30, 82, 55, 90, 38, 74, 50, 62]
const LABELS    = ['C', 'E', 'B', 'G', 'D', 'A', 'F', 'G', 'C', 'E']
const SYMS      = ['♩', '♪', '♫', '♬']

const VW = 300, VH = 128, PX = 20, PY = 12

const nx = (i: number) => PX + (i / (HEIGHTS.length - 1)) * (VW - PX * 2)
const ny = (h: number) => VH - PY - (h / 100) * (VH - PY * 2)

function buildPath(): string {
  const pts = HEIGHTS.map((h, i) => ({ x: nx(i), y: ny(h) }))
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(pts.length - 1, i + 2)]
    const cp1x = (p1.x + (p2.x - p0.x) / 6).toFixed(1)
    const cp1y = (p1.y + (p2.y - p0.y) / 6).toFixed(1)
    const cp2x = (p2.x - (p3.x - p1.x) / 6).toFixed(1)
    const cp2y = (p2.y - (p3.y - p1.y) / 6).toFixed(1)
    d += ` C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

const MELODY_PATH = buildPath()

interface FloatNote { id: number; x: number; y: number; sym: string; drift: number }

function MelodyCanvas() {
  const uid     = useId()
  const [hov, setHov]       = useState<number | null>(null)
  const [floats, setFloats] = useState<FloatNote[]>([])
  const cnt = useRef(0)

  function spawn(i: number) {
    const id = cnt.current++
    const item: FloatNote = {
      id,
      x:    nx(i),
      y:    ny(HEIGHTS[i]),
      sym:  SYMS[id % SYMS.length],
      drift: (Math.random() - 0.5) * 22,
    }
    setFloats(p => [...p, item])
    setTimeout(() => setFloats(p => p.filter(n => n.id !== id)), 1300)
  }

  const gradId   = `${uid}gr`
  const glowId   = `${uid}gl`
  const nodeGlow = `${uid}ng`

  return (
    <div className="relative mx-auto" style={{ width: VW, height: VH }}>
      <svg width={VW} height={VH} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={nodeGlow}>
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Subtle horizontal grid — evokes an audio editor */}
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line key={i}
            x1={PX}     y1={PY + p * (VH - PY * 2)}
            x2={VW - PX} y2={PY + p * (VH - PY * 2)}
            stroke="rgba(139,92,246,0.06)" strokeWidth="1" strokeDasharray="2 10"
          />
        ))}

        {/* Ambient glow underneath the curve */}
        <path
          d={MELODY_PATH} fill="none"
          stroke={`url(#${gradId})`} strokeWidth="10" opacity="0.06"
          filter={`url(#${glowId})`}
        />
        {/* Main melody curve */}
        <motion.path
          d={MELODY_PATH} fill="none"
          stroke={`url(#${gradId})`} strokeWidth="1.5" strokeLinecap="round"
          animate={{ opacity: hov !== null ? 0.72 : 0.42 }}
          transition={{ duration: 0.3 }}
        />

        {/* Nodes */}
        {HEIGHTS.map((h, i) => {
          const x = nx(i)
          const y = ny(h)
          const isH = hov === i

          return (
            <g
              key={i}
              onMouseEnter={() => { setHov(i); spawn(i) }}
              onMouseLeave={() => setHov(null)}
              style={{ cursor: 'crosshair' }}
            >
              {/* Invisible hit area */}
              <circle cx={x} cy={y} r={18} fill="transparent" />

              {/* Expanding pulse ring on hover */}
              <motion.circle
                cx={x} cy={y}
                fill="none" stroke="#A78BFA" strokeWidth="1"
                animate={isH
                  ? { r: [4, 16], opacity: [0.7, 0], transition: { duration: 0.65, repeat: Infinity, ease: 'easeOut' } }
                  : { r: 4, opacity: 0, transition: { duration: 0.15 } }
                }
              />

              {/* Node dot — bobs gently when idle */}
              <motion.circle
                cx={x}
                initial={{ cy: y, r: 2.5, opacity: 0.55 }}
                animate={{
                  cy:      isH ? y : [y - 3.5, y + 3.5],
                  r:       isH ? 5.5 : 2.5,
                  opacity: isH ? 1 : 0.55,
                }}
                transition={isH
                  ? { duration: 0.18 }
                  : {
                      cy:      { duration: 2.1 + i * 0.22, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut', delay: i * 0.30 },
                      r:       { duration: 0.18 },
                      opacity: { duration: 0.18 },
                    }
                }
                fill={isH ? '#C4B5FD' : `url(#${gradId})`}
                filter={isH ? `url(#${nodeGlow})` : undefined}
              />

              {/* Note label that appears on hover */}
              <AnimatePresence>
                {isH && (
                  <motion.text
                    key="lbl"
                    x={x} textAnchor="middle"
                    fill="#A78BFA" fontSize="8.5" fontFamily="monospace"
                    initial={{ opacity: 0, y: y - 10 }}
                    animate={{ opacity: 0.9, y: y - 14 }}
                    exit={{ opacity: 0, y: y - 10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {LABELS[i]}
                  </motion.text>
                )}
              </AnimatePresence>
            </g>
          )
        })}
      </svg>

      {/* Floating music symbols */}
      <AnimatePresence>
        {floats.map(n => (
          <motion.span
            key={n.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -46 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position:   'absolute',
              left:       n.x + n.drift,
              top:        n.y - 10,
              fontSize:   15,
              color:      '#A78BFA',
              pointerEvents: 'none',
              transform:  'translateX(-50%)',
              fontFamily: 'Georgia, serif',
              textShadow: '0 0 12px rgba(167,139,250,0.95)',
            }}
          >
            {n.sym}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function About() {
  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-28">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="text-center pt-6 space-y-6">

          {/* Interactive melody fingerprint visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 22 }}
            className="inline-block mx-auto mb-2"
            style={{
              background:    'rgba(7,6,15,0.9)',
              border:        '1px solid rgba(139,92,246,0.14)',
              borderRadius:  18,
              padding:       '14px 10px 8px',
              boxShadow:     '0 0 60px rgba(139,92,246,0.07), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}
          >
            <MelodyCanvas />
            <p style={{
              textAlign:     'center',
              marginTop:     6,
              fontSize:      8,
              fontFamily:    '"Space Mono", monospace',
              color:         'rgba(167,139,250,0.35)',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}>
              melody fingerprint · hover to interact
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="section-label justify-center flex mb-3">about harmonix</div>
            <h1
              className="font-display font-extrabold text-5xl sm:text-7xl leading-[0.92] tracking-tight"
              data-text="Music Recognition"
            >
              <span className="text-white">Music</span><br />
              <span className="gradient-text">Recognition</span><br />
              <span className="text-white text-3xl sm:text-4xl font-bold opacity-60">reimagined.</span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-muted max-w-lg mx-auto font-body leading-relaxed text-base"
          >
            Harmonix is a music identification engine built entirely from scratch — no third-party APIs,
            no external databases. It uses interval-based fingerprinting to match melodies the same way
            the human ear hears them.
          </motion.p>
        </section>

        {/* ── CAPABILITIES ──────────────────────────────────────────────── */}
        <section>
          <motion.div {...fadeIn} transition={{ duration: 0.6 }} className="mb-10">
            <p className="section-label">Capabilities</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">What Harmonix can do</h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {capabilities.map(({ icon: Icon, title, desc, accent }, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.09, duration: 0.55 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="panel-hover rounded-2xl p-6 flex gap-4 group"
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300"
                  style={{ background: `${accent}14`, border: `1px solid ${accent}33` }}
                >
                  <Icon className="w-5 h-5 transition-colors duration-300" style={{ color: accent }} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-sm mb-1.5">{title}</h3>
                  <p className="font-body text-xs text-muted leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── ARTIST PROTECTION ─────────────────────────────────────────── */}
        <section>
          <motion.div {...fadeIn} transition={{ duration: 0.6 }} className="mb-10">
            <p className="section-label">Artist protection</p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white leading-tight">
              A melody's <span className="gradient-text">timestamp</span><br />is its proof of origin.
            </h2>
          </motion.div>

          <div className="space-y-3">
            {steps.map(({ num, text }, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="panel rounded-xl p-5 flex gap-5 items-start"
              >
                <span className="font-mono text-xs text-violet font-bold shrink-0 mt-0.5 w-6">{num}</span>
                <div
                  className="w-px self-stretch shrink-0"
                  style={{ background: 'linear-gradient(to bottom, rgba(139,92,246,0.4), transparent)' }}
                />
                <p className="font-body text-sm text-muted leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── TRY IT CTA ────────────────────────────────────────────────── */}
        <section>
          <motion.div
            {...fadeIn}
            transition={{ duration: 0.6 }}
            className="neon-card p-8 text-center space-y-4"
          >
            <p className="section-label justify-center flex">ready?</p>
            <h2 className="font-display font-extrabold text-3xl text-white">
              Try it <span className="gradient-text">now.</span>
            </h2>
            <p className="text-muted text-sm font-body">Sing, hum, or whistle any song — Harmonix will identify it.</p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2 text-sm mt-2">
              <Mic2 className="w-4 h-4" /> Open scanner
            </Link>
          </motion.div>
        </section>

        {/* ── CREATOR ───────────────────────────────────────────────────── */}
        <section className="pb-8">
          <motion.div {...fadeIn} transition={{ duration: 0.6 }} className="mb-8">
            <p className="section-label">Creator</p>
            <h2 className="font-display font-extrabold text-3xl text-white">Built by</h2>
          </motion.div>

          <motion.div
            {...fadeIn}
            transition={{ delay: 0.1, duration: 0.55 }}
            className="panel rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-start"
            style={{ boxShadow: '0 0 40px rgba(139,92,246,0.08)' }}
          >
            <div
              className="w-16 h-16 rounded-2xl shrink-0 overflow-hidden"
              style={{ boxShadow: '0 0 24px rgba(139,92,246,0.5)', border: '1px solid rgba(139,92,246,0.4)' }}
            >
              <img src="/me_a.png" alt="Antonio Perera" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1">
              <div className="font-mono text-[10px] text-muted uppercase tracking-widest mb-1">creator</div>
              <h3 className="font-display font-extrabold text-xl text-white mb-1">Antonio Perera</h3>
              <p className="text-muted text-sm font-body leading-relaxed mb-4">
                Designed, built, and shipped Harmonix entirely solo — from the DSP algorithm and FastAPI backend to the React frontend.
              </p>
              <div className="flex gap-3 flex-wrap">
                <a
                  href="https://www.instagram.com/__antonio__perera__/"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs text-muted hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(45,43,78,0.8)' }}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @__antonio__perera__
                </a>
                <a
                  href="https://github.com/Antonio-Master-chief"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs text-muted hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(45,43,78,0.8)' }}
                >
                  <Github className="w-3.5 h-3.5" />
                  Antonio-Master-chief
                </a>
                <a
                  href="https://github.com/Antonio-Master-chief/Harmonix"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs text-violet-light transition-all"
                  style={{ border: '1px solid rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.08)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Source code
                </a>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </PageWrapper>
  )
}
