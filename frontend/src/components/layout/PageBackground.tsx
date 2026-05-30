import { motion, AnimatePresence } from 'framer-motion'

const MESHES: Record<string, string> = {
  '/': `
    radial-gradient(ellipse 70% 60% at 20% 20%, rgba(139,92,246,0.18) 0%, transparent 65%),
    radial-gradient(ellipse 50% 50% at 80% 80%, rgba(6,182,212,0.10) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 60% 10%, rgba(244,114,182,0.06) 0%, transparent 55%),
    #030309
  `,
  '/about': `
    radial-gradient(ellipse 60% 50% at 10% 80%, rgba(6,182,212,0.14) 0%, transparent 60%),
    radial-gradient(ellipse 55% 55% at 85% 15%, rgba(139,92,246,0.16) 0%, transparent 60%),
    #030309
  `,
  '/library': `
    radial-gradient(ellipse 50% 60% at 50% 0%, rgba(139,92,246,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 40% 40% at 90% 90%, rgba(6,182,212,0.08) 0%, transparent 50%),
    #030309
  `,
  '/profile': `
    radial-gradient(ellipse 45% 45% at 15% 30%, rgba(244,114,182,0.10) 0%, transparent 55%),
    radial-gradient(ellipse 60% 40% at 75% 70%, rgba(139,92,246,0.14) 0%, transparent 60%),
    #030309
  `,
  '/auth': `
    radial-gradient(ellipse 55% 55% at 50% 50%, rgba(139,92,246,0.14) 0%, transparent 65%),
    radial-gradient(ellipse 30% 30% at 80% 20%, rgba(6,182,212,0.08) 0%, transparent 50%),
    #030309
  `,
}

interface Props {
  routeKey: string
  src?: string
  overlayOpacity?: number
}

export default function PageBackground({ routeKey }: Props) {
  const mesh = MESHES[routeKey] ?? MESHES['/']

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: -10, background: mesh }}
      />
    </AnimatePresence>
  )
}
