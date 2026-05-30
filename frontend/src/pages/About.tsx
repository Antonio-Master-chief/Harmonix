import { motion } from 'framer-motion'
import { Mic2, Shield, Search, Music2, Fingerprint } from 'lucide-react'
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
                  <stop offset="0%" stopColor="#7C74FF"/>
                  <stop offset="100%" stopColor="#4A44C8"/>
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="22" fill="url(#herobg)"/>
              <rect x="11" y="35" width="10" height="30" rx="5" fill="white" opacity="0.95"/>
              <rect x="28" y="25" width="10" height="50" rx="5" fill="white" opacity="0.95"/>
              <rect x="45" y="16" width="10" height="68" rx="5" fill="white"/>
              <rect x="62" y="25" width="10" height="50" rx="5" fill="white" opacity="0.95"/>
              <rect x="79" y="35" width="10" height="30" rx="5" fill="white" opacity="0.95"/>
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
            <div className="text-center sm:text-left space-y-3">
              <h3 className="font-display font-bold text-xl text-white">Antonio Perera</h3>
              <p className="text-purple-light text-sm font-display">Creator &amp; Developer</p>
              <p className="text-zinc-400 leading-relaxed">
                Antonio built Harmonix with one goal in mind: make music recognition smarter, fairer, and more useful
                for the people who create music — not just the people who consume it.
              </p>
            </div>
          </div>
        </motion.section>

      </div>
    </PageWrapper>
  )
}
