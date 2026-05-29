import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/layout/Navbar'
import FloatingParticles from './components/ui/FloatingParticles'
import Home    from './pages/Home'
import About   from './pages/About'
import Library from './pages/Library'
import Profile from './pages/Profile'
import Auth    from './pages/Auth'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/"        element={<Home    />} />
        <Route path="/about"   element={<About   />} />
        <Route path="/library" element={<Library />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/auth"    element={<Auth    />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Subtle floating particle background — sits behind everything */}
        <FloatingParticles />
        {/* Film-grain noise overlay */}
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
