import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import PageBackground from './components/layout/PageBackground'
import FloatingParticles from './components/ui/FloatingParticles'
import Home    from './pages/Home'
import About   from './pages/About'
import Library from './pages/Library'
import Profile from './pages/Profile'
import Auth    from './pages/Auth'

const BG_MAP: Record<string, { src: string; overlay: number }> = {
  '/':        { src: '/images/hero-bg1.png',  overlay: 0.55 },
  '/about':   { src: '/images/about-bg1.png', overlay: 0.65 },
  '/library': { src: '/images/about-bg.png',  overlay: 0.68 },
  '/profile': { src: '/images/profile-bg.png',overlay: 0.65 },
  '/auth':    { src: '/images/auth-bg.png',   overlay: 0.60 },
}

function AnimatedRoutes() {
  const location = useLocation()
  const bg = BG_MAP[location.pathname] ?? BG_MAP['/']

  return (
    <>
      {/* Background lives outside AnimatePresence — no transform stacking-context issue */}
      <PageBackground
        key={bg.src}
        routeKey={bg.src}
        src={bg.src}
        overlayOpacity={bg.overlay}
      />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/"        element={<Home    />} />
          <Route path="/about"   element={<About   />} />
          <Route path="/library" element={<Library />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/auth"    element={<Auth    />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FloatingParticles />
        <div className="noise-overlay" />

        <div className="relative z-10 min-h-screen">
          <Navbar />
          <main>
            <AnimatedRoutes />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
