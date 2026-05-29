import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Music2, Library, User, LogIn, Menu, X, LogOut } from 'lucide-react'
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
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-purple-primary opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 rounded-lg bg-purple-primary blur-md opacity-40 group-hover:opacity-70 transition-opacity" />
              <Music2 className="relative w-8 h-8 p-1.5 text-white" />
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
