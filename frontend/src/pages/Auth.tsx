import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff, ArrowRight, Mic, Library, LogOut } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'

type Mode = 'signin' | 'signup'

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
  suffix,
}: {
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  minLength?: number
  suffix?: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <label className="font-mono text-[10px] uppercase tracking-widest text-muted">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          className="w-full bg-transparent text-white placeholder-muted font-mono text-sm
                     py-3 border-b border-border focus:outline-none focus:border-violet transition-colors duration-300"
          style={{ caretColor: '#8B5CF6' }}
        />
        {suffix && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  )
}

function timeGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'still up at this hour?'
  if (h < 12) return 'good morning'
  if (h < 17) return 'good afternoon'
  if (h < 21) return 'good evening'
  return 'good night'
}

const TAGLINES = [
  'Your frequency is recognized.',
  'The music never stopped.',
  'Back in the groove.',
  'Ears online. Signal locked.',
  'The waveform knows your name.',
]

function WelcomeBack({ username, onSignOut }: { username: string; onSignOut: () => void }) {
  const tagline = TAGLINES[username.charCodeAt(0) % TAGLINES.length]
  const bars = Array.from({ length: 12 })

  return (
    <PageWrapper>
      <div className="min-h-[88vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm text-center"
        >
          {/* Animated waveform bars */}
          <div className="flex items-end justify-center gap-0.5 h-10 mb-8">
            {bars.map((_, i) => (
              <motion.div
                key={i}
                className="w-1 rounded-full"
                style={{ background: i % 2 === 0 ? '#8B5CF6' : '#06B6D4', opacity: 0.7 }}
                animate={{ height: ['8px', `${16 + ((i * 7) % 18)}px`, '8px'] }}
                transition={{
                  duration: 1.1 + (i % 4) * 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.07,
                }}
              />
            ))}
          </div>

          {/* Greeting */}
          <p className="font-mono text-xs text-muted uppercase tracking-widest mb-3">
            {timeGreeting()}
          </p>

          <h1 className="font-display font-extrabold text-5xl mb-1 gradient-text">
            @{username}
          </h1>

          <p className="font-mono text-sm text-muted mt-3 mb-10">{tagline}</p>

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to="/"
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
            >
              <Mic className="w-4 h-4" /> Start scanning
            </Link>
            <Link
              to="/library"
              className="btn-ghost w-full flex items-center justify-center gap-2 text-sm"
            >
              <Library className="w-4 h-4" /> Open library
            </Link>
          </div>

          <button
            onClick={onSignOut}
            className="mt-8 flex items-center gap-1.5 mx-auto font-mono text-[10px] text-muted hover:text-neon-pink transition-colors uppercase tracking-widest"
          >
            <LogOut className="w-3 h-3" /> Not you? Sign out
          </button>
        </motion.div>
      </div>
    </PageWrapper>
  )
}

export default function Auth() {
  const { signIn, signUp, signOut, user, profile } = useAuth()
  const navigate = useNavigate()

  const [mode,     setMode]     = useState<Mode>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)

  if (user) {
    const name = profile?.username ?? user.email?.split('@')[0] ?? 'listener'
    return <WelcomeBack username={name} onSignOut={async () => { await signOut(); navigate('/auth') }} />
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/')
      } else {
        if (username.length < 3) throw new Error('Username must be at least 3 characters')
        if (!/^[a-z0-9_]+$/.test(username)) throw new Error('Username: only lowercase, numbers, underscores')
        await signUp(email, password, username)
        setSuccess('Account created! Check your inbox for a confirmation link.')
      }
    } catch (e: any) {
      const msg: string = e.message ?? ''
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first — check your inbox and spam folder.')
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password.')
      } else if (msg.toLowerCase().includes('user already registered')) {
        setError('That email is already registered. Try signing in.')
      } else {
        setError(msg || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-[88vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex flex-col items-center gap-2 group">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-display font-extrabold text-white group-hover:scale-105 transition-transform"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.15))',
                  border: '1px solid rgba(139,92,246,0.4)',
                  boxShadow: '0 0 32px rgba(139,92,246,0.3)',
                }}
              >
                HX
              </div>
              <span className="font-display font-extrabold text-lg gradient-text">HARMONIX</span>
            </Link>
          </div>

          {/* Mode tabs */}
          <div className="flex mb-8 border-b" style={{ borderColor: 'rgba(45,43,78,0.6)' }}>
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                className={`flex-1 pb-3 font-mono text-xs uppercase tracking-widest transition-all duration-200 relative
                  ${mode === m ? 'text-white' : 'text-muted hover:text-white'}`}
              >
                {m === 'signin' ? 'Sign in' : 'Sign up'}
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ background: 'linear-gradient(90deg, #8B5CF6, #06B6D4)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submit} className="space-y-5">
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <Field
                    label="Username"
                    type="text"
                    value={username}
                    onChange={v => setUsername(v.toLowerCase())}
                    placeholder="your_username"
                    required={mode === 'signup'}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />

            <Field
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
              minLength={6}
              suffix={
                <button type="button" onClick={() => setShowPw(s => !s)}
                  className="text-muted hover:text-white transition-colors p-1">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Feedback */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="panel rounded-lg p-3"
                  style={{ borderColor: 'rgba(244,114,182,0.4)' }}
                >
                  <p className="font-mono text-xs text-neon-pink">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="panel rounded-lg p-3"
                  style={{ borderColor: 'rgba(52,211,153,0.4)' }}
                >
                  <p className="font-mono text-xs text-neon-green">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' ? 'Enter' : 'Create account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="text-center font-mono text-[10px] text-muted mt-6 uppercase tracking-widest">
            Music identification engine · Harmonix v2
          </p>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
