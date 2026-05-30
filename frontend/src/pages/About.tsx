import { motion } from 'framer-motion'
import { Mic2, Shield, Search, Music2, Fingerprint, Instagram, Github, ExternalLink } from 'lucide-react'
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

export default function About() {
  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-28">

        {/* ── HERO ──────────────────────────────────────────────────────── */}
        <section className="text-center pt-6 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-2"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.15))',
              border: '1px solid rgba(139,92,246,0.4)',
              boxShadow: '0 0 40px rgba(139,92,246,0.3)',
            }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
              <defs>
                <linearGradient id="ab-arc" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8B5CF6"/>
                  <stop offset="100%" stopColor="#06B6D4"/>
                </linearGradient>
                <linearGradient id="ab-wave" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#8B5CF6" stopOpacity="0.1"/>
                  <stop offset="45%"  stopColor="#A78BFA"/>
                  <stop offset="55%"  stopColor="#22D3EE"/>
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1"/>
                </linearGradient>
                <filter id="ab-glow">
                  <feGaussianBlur stdDeviation="2.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <path d="M 18 52 A 32 32 0 0 0 82 52" fill="none" stroke="url(#ab-arc)" strokeWidth="1.2" opacity="0.3"/>
              <path d="M 26 52 A 24 24 0 0 0 74 52" fill="none" stroke="url(#ab-arc)" strokeWidth="1.5" opacity="0.5"/>
              <path d="M 34 52 A 16 16 0 0 0 66 52" fill="none" stroke="url(#ab-arc)" strokeWidth="2"   opacity="0.7"/>
              <path d="M 42 52 A 8 8 0 0 0 58 52"   fill="none" stroke="url(#ab-arc)" strokeWidth="2.5" opacity="0.9"/>
              <circle cx="50" cy="52" r="3.5" fill="#C4B5FD" filter="url(#ab-glow)"/>
              <path d="M 6 74 L 14 74 C 17 74 20 66 23 66 C 26 66 29 74 32 74 C 34 74 37 63 42 59 C 45 56 47 55 50 55 C 53 55 55 56 58 59 C 63 63 66 74 68 74 C 71 74 74 66 77 66 C 80 66 83 74 86 74 L 94 74"
                    fill="none" stroke="url(#ab-wave)" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
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
                  style={{
                    background: `${accent}14`,
                    border: `1px solid ${accent}33`,
                  }}
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
            {/* Avatar */}
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 font-display font-extrabold text-2xl text-white"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6, #06B6D4)',
                boxShadow: '0 0 24px rgba(139,92,246,0.5)',
              }}
            >
              A
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs text-muted hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(45,43,78,0.8)' }}
                >
                  <Instagram className="w-3.5 h-3.5" />
                  @__antonio__perera__
                </a>
                <a
                  href="https://github.com/Antonio-Master-chief"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs text-muted hover:text-white transition-colors"
                  style={{ border: '1px solid rgba(45,43,78,0.8)' }}
                >
                  <Github className="w-3.5 h-3.5" />
                  Antonio-Master-chief
                </a>
                <a
                  href="https://github.com/Antonio-Master-chief/Harmonix"
                  target="_blank"
                  rel="noopener noreferrer"
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
