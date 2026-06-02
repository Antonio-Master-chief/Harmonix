import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  radius: number
  opacity: number
  life: number
  maxLife: number
}

export default function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    let raf: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (): Particle => ({
      x:       Math.random() * canvas.width,
      y:       canvas.height + 10,
      vx:      (Math.random() - 0.5) * 0.4,
      vy:      -(Math.random() * 0.6 + 0.2),
      radius:  Math.random() * 2 + 0.5,
      opacity: 0,
      life:    0,
      maxLife: Math.random() * 300 + 180,
    })

    // Pre-populate
    for (let i = 0; i < 40; i++) {
      const p = spawn()
      p.y = Math.random() * canvas.height
      p.life = Math.random() * p.maxLife
      particles.push(p)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Spawn new particles
      if (particles.length < 60 && Math.random() < 0.08) particles.push(spawn())

      particles = particles.filter(p => p.life < p.maxLife)

      for (const p of particles) {
        p.life++
        p.x += p.vx
        p.y += p.vy

        // Fade in / fade out
        const t = p.life / p.maxLife
        p.opacity = t < 0.2 ? t / 0.2 : t > 0.8 ? (1 - t) / 0.2 : 1
        p.opacity *= 0.45

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(108, 99, 255, ${p.opacity})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  )
}
