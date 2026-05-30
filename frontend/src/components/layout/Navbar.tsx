import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Library, Music2, User, LogIn, Menu, X, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/library', label: 'Library',  icon: Library },
  { to: '/about',   label: 'About',    icon: Music2 },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate     = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setMobileOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4"
      >
        <div className="max-w-6xl mx-auto glass rounded-2xl px-5 py-3 flex items-center justify-between">

          {/* Logo — clicking goes to About */}
          <Link to="/about" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8 group-hover:scale-105 transition-transform">
              <div className="absolute inset-0 rounded-lg bg-purple-primary blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="relative w-8 h-8">
                <defs>
                  <linearGradient id="navbg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#1E1455"/>
                    <stop offset="100%" stopColor="#080620"/>
                  </linearGradient>
                  <linearGradient id="navwg" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#6C63FF" stopOpacity="0.15"/>
                    <stop offset="50%"  stopColor="#C4BFFF"/>
                    <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.15"/>
                  </linearGradient>
                  <filter id="navglow">
                    <feGaussianBlur stdDeviation="2.5" result="b"/>
                    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <rect width="100" height="100" rx="22" fill="url(#navbg)"/>
                <rect width="100" height="100" rx="22" fill="none" stroke="#6C63FF" strokeWidth="1.5" opacity="0.45"/>
                <path d="M 18 52 A 32 32 0 0 0 82 52" fill="none" stroke="#6C63FF" strokeWidth="1"   opacity="0.18"/>
                <path d="M 26 52 A 24 24 0 0 0 74 52" fill="none" stroke="#7C74FF" strokeWidth="1.2" opacity="0.30"/>
                <path d="M 34 52 A 16 16 0 0 0 66 52" fill="none" stroke="#8B83FF" strokeWidth="1.5" opacity="0.48"/>
                <path d="M 42 52 A  8  8 0 0 0 58 52" fill="none" stroke="#A78BFA" strokeWidth="2"   opacity="0.72"/>
                <circle cx="50" cy="52" r="9"   fill="#6C63FF" opacity="0.14"/>
                <circle cx="50" cy="52" r="3.5" fill="#D4CCFF" filter="url(#navglow)"/>
                <path d="M 6 74 L 14 74 C 17 74 20 66 23 66 C 26 66 29 74 32 74 C 34 74 37 63 42 59 C 45 56 47 55 50 55 C 53 55 55 56 58 59 C 63 63 66 74 68 74 C 71 74 74 66 77 66 C 80 66 83 74 86 74 L 94 74"
                      fill="none" stroke="url(#navwg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-display font-bold text-lg tracking-wide">
              <span className="gradient-text">HARMONIX</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-4 py-2 rounded-lg font-display text-sm font-medium transition-all duration-200
                  ${pathname === to
                    ? 'text-purple-light bg-purple-glow'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user && profile ? (
              <>
                {/* Greeting pill */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-hover group"
                >
                  <div className="w-6 h-6 rounded-full bg-purple-primary flex items-center justify-center text-xs font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-300 group-hover:text-white transition-colors font-display">
                    Hey, <span className="text-purple-light">@{profile.username}</span>
                  </span>
                </Link>
                <button onClick={handleSignOut} className="btn-ghost text-sm flex items-center gap-1.5">
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </>
            ) : (
              <Link to="/auth" className="btn-primary text-sm flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Sign in
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(o => !o)}
            className="md:hidden p-2 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{   opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              className="mt-2 max-w-6xl mx-auto glass rounded-2xl p-4 flex flex-col gap-2"
            >
              {links.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-display font-medium transition-all
                    ${pathname === to
                      ? 'text-purple-light bg-purple-glow'
                      : 'text-zinc-300 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </Link>
              ))}

              <div className="border-t border-zinc-800 pt-2 mt-1">
                {user && profile ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                      <User className="w-4 h-4" />
                      <span className="font-display">@{profile.username}</span>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileOpen(false)}
                    className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <LogIn className="w-4 h-4" /> Sign in
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Spacer */}
      <div className="h-20" />
    </>
  )
}
