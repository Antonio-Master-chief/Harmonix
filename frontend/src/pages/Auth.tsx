import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Loader2, Music2, Eye, EyeOff } from 'lucide-react'
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
        setSuccess('Account created! Check your email to confirm, then sign in.')
      }
    } catch (e: any) {
      setError(e.message ?? 'Something went wrong')
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
              <div className="w-10 h-10 rounded-xl bg-purple-primary flex items-center justify-center"
                   style={{ boxShadow: '0 0 30px rgba(108,99,255,0.5)' }}>
                <Music2 className="w-6 h-6 text-white" />
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
