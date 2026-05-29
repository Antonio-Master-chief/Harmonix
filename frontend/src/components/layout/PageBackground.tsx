import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'

interface Props {
  src: string
  overlayOpacity?: number
  routeKey: string
}

export default function PageBackground({ src, overlayOpacity = 0.62, routeKey }: Props) {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, -120])

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed inset-0 overflow-hidden pointer-events-none"
        style={{ zIndex: -10 }}
      >
        <motion.div style={{ y }} className="absolute inset-0 scale-110">
          <img
            src={src}
            alt=""
            className="w-full h-full object-cover object-center"
            draggable={false}
          />
        </motion.div>
        <div className="absolute inset-0" style={{ background: `rgba(4,4,8,${overlayOpacity})` }} />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 35%, rgba(4,4,8,0.55) 100%)' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
