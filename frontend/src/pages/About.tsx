import { motion } from 'framer-motion'
import { ArrowRight, Music2, Binary, Cpu, Zap, Github } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageWrapper from '../components/layout/PageWrapper'

const tech = [
  { name: 'pYIN',           desc: 'Probabilistic pitch extraction' },
  { name: 'Semitone intervals', desc: 'Transpose-invariant fingerprinting' },
  { name: 'Skip-grams',     desc: 'Robust to missed notes' },
  { name: 'DTW',            desc: 'Flexible sequence alignment' },
  { name: 'Chromagram',     desc: 'Secondary harmonic verification' },
  { name: 'FastAPI',        desc: 'Python backend' },
  { name: 'Supabase',       desc: 'Auth + PostgreSQL' },
  { name: 'React + Vite',   desc: 'Frontend' },
]

// Animated interval diagram — shows the core algorithm concept visually
function IntervalDiagram() {
  const notes = ['C', 'E', 'G', 'B', 'D']
  const intervals = [4, 3, 4, 3]

  return (
    <div className="flex items-end justify-center gap-0 py-4">
      {notes.map((note, i) => (
        <div key={i} className="flex items-end">
          {/* Note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="flex flex-col items-center"
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center
                         font-display font-bold text-white text-sm border-2 border-purple-primary"
              style={{ background: 'rgba(108,99,255,0.2)', boxShadow: '0 0 20px rgba(108,99,255,0.3)' }}
            >
              {note}
            </div>
          </motion.div>

          {/* Interval arrow */}
          {i < intervals.length && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              whileInView={{ opacity: 1, scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 + 0.1, duration: 0.3 }}
              className="flex flex-col items-center px-1 sm:px-2 mb-3"
            >
              <span className="text-[10px] text-purple-light font-display font-bold mb-0.5">
                +{intervals[i]}st
              </span>
              <div className="flex items-center gap-0.5">
                <div className="h-0.5 w-6 sm:w-8 bg-purple-primary/60" />
                <ArrowRight className="w-3 h-3 text-purple-primary" />
              </div>
            </motion.div>
          )}
        </div>
      ))}
    </div>
  )
}

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
            className="w-20 h-20 rounded-3xl bg-purple-glow mx-auto flex items-center justify-center"
            style={{ boxShadow: '0 0 60px rgba(108,99,255,0.4)' }}
          >
            <Music2 className="w-10 h-10 text-purple-light" />
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
            className="text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed"
          >
            Harmonix identifies music from your voice — not by matching exact notes,
            but by reading the <em className="text-purple-light not-italic">intervals between them</em>.
            Sing off-key. Sing in a different octave. We'll still find it.
          </motion.p>
        </section>

        {/* ── The insight ─────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 sm:p-12 space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Binary className="w-5 h-5 text-purple-light" />
            <span className="text-xs font-display uppercase tracking-widest text-purple-light">The Core Insight</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Every melody has a unique interval fingerprint
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Most music apps match <strong className="text-white">exact frequencies</strong> — which breaks the moment you
            sing in a different key or octave. Harmonix maps the <strong className="text-white">gaps between notes</strong> (in semitones),
            which stay identical no matter what key you sing in.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            A major third is always <code className="text-purple-light bg-purple-glow px-1.5 py-0.5 rounded text-sm">+4 semitones</code>{' '}
            whether you sing it at C3 or C6. By chaining 10–15 of these intervals,
            we create a fingerprint so unique that only one song in the world matches it.
          </p>

          {/* Visual */}
          <div className="bg-black/40 rounded-2xl p-6">
            <p className="text-xs text-zinc-500 font-display text-center mb-4">
              Melody: C → E → G → B → D (intervals: +4, +3, +4, +3 semitones)
            </p>
            <IntervalDiagram />
            <p className="text-xs text-zinc-600 font-display text-center mt-4">
              Transpose to A major? The intervals are identical. We still match it.
            </p>
          </div>
        </motion.section>

        {/* ── Algorithm pipeline ──────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="text-center">
            <p className="text-xs font-display uppercase tracking-widest text-purple-light mb-3">Algorithm</p>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">Six-stage matching pipeline</h2>
          </div>

          <div className="space-y-3">
            {[
              { step: '01', title: 'Audio Preprocessing',   desc: 'High-pass filter, normalize, pre-emphasis, trim silence' },
              { step: '02', title: 'pYIN Pitch Extraction', desc: 'Probabilistic pitch tracker with vibrato smoothing — purpose-built for voice' },
              { step: '03', title: 'Note Segmentation',     desc: 'Group pitch frames into notes using median pitch (robust to vibrato)' },
              { step: '04', title: 'Interval Fingerprint',  desc: 'Step-1 + step-2 n-grams at fine (0.5st) + coarse (1.0st) resolution' },
              { step: '05', title: 'Offset-Based Voting',   desc: 'Consistent position-offset across n-grams = strong match signal' },
              { step: '06', title: 'DTW + Chromagram',      desc: 'Dynamic Time Warping refines top candidates; chromagram gives independent harmonic verification' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass-hover rounded-2xl p-5 flex items-start gap-4">
                <span className="text-3xl font-display font-bold text-purple-primary/30 leading-none w-12 flex-shrink-0">{step}</span>
                <div>
                  <h3 className="font-display font-semibold text-white mb-1">{title}</h3>
                  <p className="text-sm text-zinc-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── Tech stack ──────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-purple-light" />
            <h2 className="text-xl font-display font-bold text-white">Technology</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tech.map(({ name, desc }) => (
              <div key={name} className="glass-hover rounded-xl p-4">
                <p className="font-display font-semibold text-white text-sm mb-1">{name}</p>
                <p className="text-xs text-zinc-500">{desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-6 pb-8"
        >
          <div
            className="glass rounded-3xl p-10"
            style={{ boxShadow: '0 0 80px rgba(108,99,255,0.12)' }}
          >
            <Zap className="w-10 h-10 text-purple-light mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-white mb-3">Try it now</h2>
            <p className="text-zinc-400 mb-6">Sing any melody. See what Harmonix finds.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="btn-primary flex items-center justify-center gap-2">
                <Music2 className="w-4 h-4" /> Start identifying
              </Link>
              <a
                href="https://github.com/Antonio-Master-chief/Harmonix"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost flex items-center justify-center gap-2"
              >
                <Github className="w-4 h-4" /> View on GitHub
              </a>
            </div>
          </div>
        </motion.section>
      </div>
    </PageWrapper>
  )
}
