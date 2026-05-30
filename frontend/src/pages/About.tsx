import { motion } from 'framer-motion'
import { Mic2, Shield, Search, Music2, Fingerprint, Instagram, Github } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'

const capabilities = [
  {
    icon: Mic2,
    title: 'Identify any song by voice',
    desc: 'Hum it, sing it, whistle it, or just go "la la la". Harmonix figures out the song from the melody alone — no lyrics, no beat, just the tune in your head.',
  },
  {
    icon: Music2,
    title: 'Off-key? Wrong octave? No problem.',
    desc: "Nobody sings perfectly. Harmonix is built to understand melody the way humans hear it — it doesn't care what key you sing in or how high or low you go.",
  },
  {
    icon: Fingerprint,
    title: 'Every melody has a unique signature',
    desc: 'Two songs can share the same beat, the same tempo, even the same instruments — but no two original melodies are identical. Harmonix knows the difference.',
  },
  {
    icon: Search,
    title: 'Find music without knowing its name',
    desc: "Had a melody stuck in your head for days? Sing it into Harmonix. That's all it takes.",
  },
]

const steps = [
  { num: '01', text: 'An artist composes an original melody and submits it to Harmonix.' },
  { num: '02', text: 'Harmonix creates a permanent, timestamped record — the earliest submission becomes the original.' },
  { num: '03', text: 'If the same melody appears in someone else\'s work later, Harmonix identifies it and traces it back to the original source.' },
  { num: '04', text: 'The artist now has a verifiable, independent record that predates any copies.' },
]

export default function About() {
  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-24">

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(108,99,255,0.4)' }}
          >
            <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-20 h-20">
              <defs>
                <linearGradient id="herobg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1E1455"/>
                  <stop offset="100%" stopColor="#080620"/>
                </linearGradient>
                <linearGradient id="herowg" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.15"/>
                  <stop offset="50%"  stopColor="#C4BFFF"/>
                  <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.15"/>
                </linearGradient>
                <filter id="heroglow">
                  <feGaussianBlur stdDeviation="2.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <rect width="100" height="100" rx="22" fill="url(#herobg)"/>
              <rect width="100" height="100" rx="22" fill="none" stroke="#6C63FF" strokeWidth="1.5" opacity="0.45"/>
              <path d="M 18 52 A 32 32 0 0 0 82 52" fill="none" stroke="#6C63FF" strokeWidth="1"   opacity="0.18"/>
              <path d="M 26 52 A 24 24 0 0 0 74 52" fill="none" stroke="#7C74FF" strokeWidth="1.2" opacity="0.30"/>
              <path d="M 34 52 A 16 16 0 0 0 66 52" fill="none" stroke="#8B83FF" strokeWidth="1.5" opacity="0.48"/>
              <path d="M 42 52 A 8 8 0 0 0 58 52" fill="none" stroke="#A78BFA" strokeWidth="2" opacity="0.72"/>
              <circle cx="50" cy="52" r="9"   fill="#6C63FF" opacity="0.14"/>
              <circle cx="50" cy="52" r="3.5" fill="#D4CCFF" filter="url(#heroglow)"/>
              <path d="M 6 74 L 14 74 C 17 74 20 66 23 66 C 26 66 29 74 32 74 C 34 74 37 63 42 59 C 45 56 47 55 50 55 C 53 55 55 56 58 59 C 63 63 66 74 68 74 C 71 74 74 66 77 66 C 80 66 83 74 86 74 L 94 74"
                    fill="none" stroke="url(#herowg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl font-display font-bold"
          >
            About <span className="gradient-text">Harmonix</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed"
          >
            Harmonix is a music recognition platform built around one idea: if you can hear a melody,
            you should be able to find it — and prove you wrote it first.
          </motion.p>
        </section>

        {/* ── What Harmonix can do ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="text-center">
            <p className="text-xs font-display uppercase tracking-widest text-purple-light mb-3">Capabilities</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">What Harmonix can do</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {capabilities.map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-hover rounded-2xl p-6 space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-glow flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-light" />
                </div>
                <h3 className="font-display font-semibold text-white">{title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Artist protection ────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 sm:p-12 space-y-8"
          style={{ boxShadow: '0 0 80px rgba(108,99,255,0.08)' }}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-purple-light flex-shrink-0" />
            <span className="text-xs font-display uppercase tracking-widest text-purple-light">For Artists</span>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Be the first. That record is permanent.
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              In music, originality is everything — but proving you wrote something first has always been difficult.
              Harmonix changes that. The moment an artist submits their melody, Harmonix creates a timestamped record.{' '}
              <span className="text-white font-medium">The earliest submission becomes the original.</span>
            </p>
            <p className="text-zinc-400 leading-relaxed">
              If your melody later appears in someone else's work, Harmonix will find it and trace it back to you.
              Your original submission is the proof.
            </p>
          </div>

          <div className="space-y-3">
            {steps.map(({ num, text }) => (
              <div key={num} className="flex items-start gap-4 p-4 rounded-xl bg-black/30">
                <span className="text-2xl font-display font-bold text-purple-primary/40 leading-none w-10 flex-shrink-0">{num}</span>
                <p className="text-sm text-zinc-300 leading-relaxed pt-0.5">{text}</p>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <p className="text-sm text-zinc-500 italic">
              "The first artist to have their work on Harmonix owns that record. If anyone copies it, Harmonix will tell you exactly where they copied it from."
            </p>
          </div>
        </motion.section>

        {/* ── Try it ──────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="glass rounded-3xl p-10" style={{ boxShadow: '0 0 80px rgba(108,99,255,0.12)' }}>
            <Mic2 className="w-10 h-10 text-purple-light mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-white mb-3">Try it now</h2>
            <p className="text-zinc-400 mb-6">Sing any melody. See what Harmonix finds.</p>
            <Link to="/" className="btn-primary inline-flex items-center justify-center gap-2">
              <Music2 className="w-4 h-4" /> Start identifying
            </Link>
          </div>
        </motion.section>

        {/* ── Creator ─────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 pb-8"
        >
          <div className="text-center">
            <p className="text-xs font-display uppercase tracking-widest text-purple-light mb-3">The Creator</p>
            <h2 className="text-2xl font-display font-bold text-white">Antonio Perera</h2>
          </div>

          <div className="glass rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0 text-3xl font-display font-bold text-white"
              style={{
                background: 'linear-gradient(135deg, #7C74FF 0%, #4A44C8 100%)',
                boxShadow: '0 0 40px rgba(108,99,255,0.4)',
              }}
            >
              AP
            </div>
            <div className="text-center sm:text-left space-y-4">
              <h3 className="font-display font-bold text-xl text-white">Antonio Perera</h3>
              <p className="text-purple-light text-sm font-display">Creator &amp; Developer</p>
              <p className="text-zinc-400 leading-relaxed">
                Antonio built Harmonix with one goal in mind: make music recognition smarter, fairer, and more useful
                for the people who create music — not just the people who consume it.
              </p>
              <div className="flex items-center gap-3 justify-center sm:justify-start pt-1">
                <a
                  href="https://www.instagram.com/__antonio__perera__/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-hover text-zinc-300 hover:text-white transition-colors text-sm font-display"
                >
                  <Instagram className="w-4 h-4 text-purple-light" />
                  @__antonio__perera__
                </a>
                <a
                  href="https://github.com/Antonio-Master-chief"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl glass-hover text-zinc-300 hover:text-white transition-colors text-sm font-display"
                >
                  <Github className="w-4 h-4 text-purple-light" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </PageWrapper>
  )
}
