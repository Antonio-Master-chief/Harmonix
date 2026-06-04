import { useState, useEffect, useId } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Library, Info, User, LogIn, Menu, X, LogOut, Mic } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const NAV_LINKS = [
  { to: '/library', label: 'Library', icon: Library },
  { to: '/about',   label: 'About',   icon: Info    },
]

function QuaverLogo() {
  const uid = useId()
  const ids = { bg: `${uid}-bg`, note: `${uid}-note` }
  return (
    <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8">
      <rect width="36" height="36" rx="10" fill={`url(#${ids.bg})`} />
      {/* Note head */}
      <ellipse cx="13" cy="27.5" rx="5.5" ry="3.8" transform="rotate(-20 13 27.5)" fill={`url(#${ids.note})`} />
      {/* Stem */}
      <line x1="18.5" y1="25.5" x2="18.5" y2="8" stroke={`url(#${ids.note})`} strokeWidth="2" strokeLinecap="round" />
      {/* Flag */}
      <path d="M 18.5 8 C 25 10 27 16 20 22" stroke={`url(#${ids.note})`} strokeWidth="2" fill="none" strokeLinecap="round" />
      <defs>
        <linearGradient id={ids.bg} x1="0" y1="0" x2="36" y2="36">
          <stop offset="0%" stopColor="#1A0A3A" />
          <stop offset="100%" stopColor="#050315" />
        </linearGradient>
        <linearGradient id={ids.note} x1="13" y1="8" x2="18" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
    </svg>
  )
}

const NAV_SUBTITLES = ['music scanner.', 'signal active.', 'melody engine.', 'song detector.', 'ears online.']

function CyclingSubtitle() {
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % NAV_SUBTITLES.length), 3000)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="h-3.5 overflow-hidden relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={idx}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="absolute font-mono text-[9px] text-muted tracking-widest uppercase"
        >
          {NAV_SUBTITLES[idx]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [mobileOpen,  setMobileOpen]  = useState(false)
  const [scrolled,    setScrolled]    = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 pt-4"
      >
        <div
          className="max-w-6xl mx-auto px-4 sm:px-5 py-3 rounded-2xl flex items-center justify-between transition-all duration-500"
          style={{
            background: scrolled
              ? 'rgba(10,8,20,0.92)'
              : 'rgba(10,8,20,0.55)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(45,43,78,0.7)',
            boxShadow: scrolled
              ? '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(139,92,246,0.08)'
              : 'none',
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -3 }}
              transition={{ duration: 0.2 }}
              style={{ filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.5))' }}
            >
              <QuaverLogo />
            </motion.div>
            <div className="flex flex-col leading-none overflow-hidden">
              <span className="font-display font-extrabold text-base tracking-wider gradient-text">HARMONIX</span>
              <CyclingSubtitle />
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label }) => {
              const active = pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 font-display font-semibold text-sm transition-all duration-200 rounded-lg
                    ${active ? 'text-white' : 'text-muted hover:text-white'}`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </Link>
              )
            })}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all duration-200 hover:bg-violet-faint group"
                >
                  <div
                    className="w-7 h-7 rounded-lg overflow-hidden"
                    style={{ boxShadow: '0 0 12px rgba(139,92,246,0.4)', border: '1px solid rgba(139,92,246,0.4)' }}
                  >
                    <img src="/me_a.png" alt="profile" className="w-full h-full object-cover" />
                  </div>
                  <span className="font-mono text-xs text-muted group-hover:text-white transition-colors">
                    {profile ? `@${profile.username}` : (user.email ?? '')}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="btn-ghost text-xs flex items-center gap-1.5 px-3 py-2"
                >
                  <LogOut className="w-3.5 h-3.5" /> Out
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary text-sm flex items-center gap-2 px-4 py-2">
                <LogIn className="w-3.5 h-3.5" /> Sign in
              </Link>
            )}
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-white transition-colors"
            style={{ border: '1px solid rgba(45,43,78,0.8)' }}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{   opacity: 0, y: -8,  scale: 0.97 }}
              transition={{ duration: 0.18 }}
              className="mt-2 max-w-6xl mx-auto panel rounded-2xl p-3 flex flex-col gap-1"
            >
              <Link to="/" onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all font-display text-sm">
                <Mic className="w-4 h-4" /> Scanner
              </Link>
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display text-sm transition-all
                    ${pathname === to
                      ? 'text-violet-light bg-violet-faint'
                      : 'text-muted hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}
              <div className="h-px bg-border my-1" />
              {user ? (
                <>
                  <Link to="/profile" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all">
                    <User className="w-4 h-4" />
                    <span className="font-mono text-xs">
                      {profile ? `@${profile.username}` : (user.email ?? '')}
                    </span>
                  </Link>
                  <button onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted hover:text-white hover:bg-white/5 transition-all text-left w-full">
                    <LogOut className="w-4 h-4" />
                    <span className="font-display text-sm">Sign out</span>
                  </button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileOpen(false)}
                  className="btn-primary w-full flex items-center justify-center gap-2 text-sm mt-1">
                  <LogIn className="w-4 h-4" /> Sign in
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  )
}
