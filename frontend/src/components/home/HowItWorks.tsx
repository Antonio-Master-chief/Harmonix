import { motion } from 'framer-motion'
import { Mic2, Music4, GitCompare, CheckCircle } from 'lucide-react'

const steps = [
  {
    icon:  Mic2,
    title: 'Sing or Hum',
    desc:  'Sing, hum, whistle, or upload a file. Even a rough melody works.',
    color: '#6C63FF',
  },
  {
    icon:  Music4,
    title: 'Notes Extracted',
    desc:  'pYIN pitch tracking isolates every note and removes vibrato noise.',
    color: '#8B5CF6',
  },
  {
    icon:  GitCompare,
    title: 'Intervals Mapped',
    desc:  'Semitone gaps between notes form a fingerprint that works in any key.',
    color: '#A78BFA',
  },
  {
    icon:  CheckCircle,
    title: 'Song Identified',
    desc:  'Voting + DTW matching finds the exact song from our library.',
    color: '#10b981',
  },
]

const container = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22,1,0.36,1] } },
}

export default function HowItWorks() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <p className="text-xs font-display uppercase tracking-widest text-purple-light mb-3">How it works</p>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Four steps to identify any song
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {steps.map((s, i) => (
            <motion.div key={i} variants={item} className="glass-hover rounded-2xl p-6 text-center group">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform group-hover:scale-110 duration-300"
                style={{ background: `${s.color}22`, boxShadow: `0 0 20px ${s.color}33` }}
              >
                <s.icon className="w-6 h-6" style={{ color: s.color }} />
              </div>
              <div className="w-6 h-0.5 bg-zinc-800 mx-auto mb-3 group-hover:bg-purple-primary transition-colors duration-300" />
              <h3 className="font-display font-semibold text-white mb-2">{s.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
