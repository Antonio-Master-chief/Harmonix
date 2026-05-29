import { useEffect, useRef } from 'react'

interface Props {
  analyser:    AnalyserNode | null
  isActive:    boolean
  isProcessing?: boolean
}

export default function WaveVisualizer({ analyser, isActive, isProcessing }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx    = canvas.getContext('2d')!

    if (!isActive || !analyser) {
      // Draw idle flat line
      drawIdle(ctx, canvas.width, canvas.height)
      return
    }

    const bins    = analyser.frequencyBinCount   // 64
    const data    = new Uint8Array(bins)
    const barW    = (canvas.width - (bins - 1) * 2) / bins
    const centerY = canvas.height / 2

    const draw = () => {
      analyser.getByteFrequencyData(data)
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < bins; i++) {
        const v        = data[i] / 255
        const barH     = Math.max(3, v * canvas.height * 0.85)
        const x        = i * (barW + 2)
        const hue      = 250 + v * 40   // purple → violet
        const alpha    = 0.3 + v * 0.7

        ctx.beginPath()
        ctx.roundRect(x, centerY - barH / 2, barW, barH, 2)

        const grad = ctx.createLinearGradient(0, centerY - barH / 2, 0, centerY + barH / 2)
        grad.addColorStop(0,   `hsla(${hue}, 90%, 70%, ${alpha})`)
        grad.addColorStop(0.5, `hsla(${hue}, 80%, 60%, ${alpha * 1.2})`)
        grad.addColorStop(1,   `hsla(${hue}, 90%, 70%, ${alpha})`)
        ctx.fillStyle = grad
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(rafRef.current)
  }, [analyser, isActive])

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={72}
      className="w-full max-w-xs mx-auto rounded-xl opacity-90"
      style={{ display: isProcessing ? 'none' : 'block' }}
    />
  )
}

function drawIdle(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  const bars = 32
  const barW = (w - (bars - 1) * 3) / bars
  const cy   = h / 2

  for (let i = 0; i < bars; i++) {
    const x   = i * (barW + 3)
    const barH = 3
    ctx.beginPath()
    ctx.roundRect(x, cy - barH / 2, barW, barH, 2)
    ctx.fillStyle = 'rgba(108,99,255,0.25)'
    ctx.fill()
  }
}
