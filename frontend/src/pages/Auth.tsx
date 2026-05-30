import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Loader2, Eye, EyeOff } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PageWrapper from '../components/layout/PageWrapper'

type Mode = 'signin' | 'signup'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode,     setMode]     = useState<Mode>('signin')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [success,  setSuccess]  = useState<string | null>(null)

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
        if (!/^[a-z0-9_]+$/.test(username)) throw new Error('Username: only lowercase letters, numbers, underscores')
        await signUp(email, password, username)
        setSuccess('Account created! Check your inbox for a confirmation link, then come back to sign in.')
      }
    } catch (e: any) {
      const msg: string = e.message ?? ''
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first — check your inbox (and spam folder) for a link from Supabase.')
      } else if (msg.toLowerCase().includes('invalid login credentials')) {
        setError('Incorrect email or password.')
      } else if (msg.toLowerCase().includes('user already registered')) {
        setError('That email is already registered. Try signing in instead.')
      } else {
        setError(msg || 'Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/about" className="inline-flex items-center gap-2 mb-4">
              <div className="relative w-10 h-10" style={{ filter: 'drop-shadow(0 0 12px rgba(108,99,255,0.6))' }}>
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
                  <defs>
                    <linearGradient id="authbg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#1E1455"/>
                      <stop offset="100%" stopColor="#080620"/>
                    </linearGradient>
                    <linearGradient id="authwg" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.15"/>
                      <stop offset="50%"  stopColor="#C4BFFF"/>
                      <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.15"/>
                    </linearGradient>
                    <filter id="authglow">
                      <feGaussianBlur stdDeviation="2.5" result="b"/>
                      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                  </defs>
                  <rect width="100" height="100" rx="22" fill="url(#authbg)"/>
                  <rect width="100" height="100" rx="22" fill="none" stroke="#6C63FF" strokeWidth="1.5" opacity="0.45"/>
                  <path d="M 18 52 A 32 32 0 0 0 82 52" fill="none" stroke="#6C63FF" strokeWidth="1"   opacity="0.18"/>
                  <path d="M 26 52 A 24 24 0 0 0 74 52" fill="none" stroke="#7C74FF" strokeWidth="1.2" opacity="0.30"/>
                  <path d="M 34 52 A 16 16 0 0 0 66 52" fill="none" stroke="#8B83FF" strokeWidth="1.5" opacity="0.48"/>
                  <path d="M 42 52 A 8 8 0 0 0 58 52"   fill="none" stroke="#A78BFA" strokeWidth="2"   opacity="0.72"/>
                  <circle cx="50" cy="52" r="9"   fill="#6C63FF" opacity="0.14"/>
                  <circle cx="50" cy="52" r="3.5" fill="#D4CCFF" filter="url(#authglow)"/>
                  <path d="M 6 74 L 14 74 C 17 74 20 66 23 66 C 26 66 29 74 32 74 C 34 74 37 63 42 59 C 45 56 47 55 50 55 C 53 55 55 56 58 59 C 63 63 66 74 68 74 C 71 74 74 66 77 66 C 80 66 83 74 86 74 L 94 74"
                        fill="none" stroke="url(#authwg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="font-display font-bold text-xl gradient-text">HARMONIX</span>
            </Link>
            <h1 className="text-2xl font-display font-bold text-white">
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {mode === 'signin' ? 'Sign in to track your searches' : 'Join and start identifying music'}
            </p>
          </div>

          {/* Card */}
          <div className="glass rounded-3xl p-6 space-y-5"
               style={{ boxShadow: '0 0 60px rgba(108,99,255,0.1)' }}>

            {/* Mode toggle */}
            <div className="flex bg-black/40 rounded-xl p-1 gap-1">
              {(['signin', 'signup'] as Mode[]).map(m => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(null); setSuccess(null) }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-display font-medium transition-all duration-250
                    ${mode === m ? 'bg-purple-primary text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                >
                  {m === 'signin' ? 'Sign in' : 'Sign up'}
                </button>
              ))}
            </div>

            <form onSubmit={submit} className="space-y-4">
              <AnimatePresence>
                {mode === 'signup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{   opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-xs font-display text-zinc-400 mb-1.5">Username</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value.toLowerCase())}
                        placeholder="your_username"
                        required={mode === 'signup'}
                        className="w-full glass rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600
                                   text-sm font-display focus:outline-none focus:border-purple-primary
                                   border border-zinc-800 bg-transparent transition-colors"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email */}
              <div>
                <label className="block text-xs font-display text-zinc-400 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full glass rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-600
                               text-sm font-display focus:outline-none focus:border-purple-primary
                               border border-zinc-800 bg-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-display text-zinc-400 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full glass rounded-xl pl-10 pr-10 py-3 text-white placeholder-zinc-600
                               text-sm font-display focus:outline-none focus:border-purple-primary
                               border border-zinc-800 bg-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error / success */}
              <AnimatePresence>
                {error && (
                  <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            className="text-sm text-red-400 font-display">
                    {error}
                  </motion.p>
                )}
                {success && (
                  <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                            className="text-sm text-emerald-400 font-display">
                    {success}
                  </motion.p>
                )}
              </AnimatePresence>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : mode === 'signin' ? 'Sign in' : 'Create account'
                }
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  )
}
