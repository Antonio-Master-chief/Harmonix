import { motion } from 'framer-motion'
import { ReactNode } from 'react'

const variants = {
  initial: { opacity: 0, y: 18 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.25, ease: 'easeIn' } },
}

export default function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="enter"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}
