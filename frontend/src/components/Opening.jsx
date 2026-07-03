import { motion, AnimatePresence } from 'framer-motion'

export default function Opening({ show, onOpen }) {
  return <AnimatePresence>{show && (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: .6 }}
      className="fixed inset-0 z-[100] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-[#eee5d4] px-4 py-8"
    >
      <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(#b69a65_1px,transparent_1px)] [background-size:26px_26px]" />
      <motion.button
        type="button"
        onClick={onOpen}
        initial={{ opacity: 0, y: 24, scale: .96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .8, ease: 'easeOut' }}
        className="relative aspect-[1.48] w-full max-w-[520px] overflow-hidden bg-[#faf6ed] shadow-[0_25px_70px_rgba(67,54,35,.25)]"
        aria-label="Abrir convite"
      >
        <div className="absolute inset-0 bg-[#f8f3e9]" />
        <div className="absolute inset-y-0 left-0 w-1/2 bg-[#f3eadc] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[#f3eadc] [clip-path:polygon(100%_0,0_50%,100%_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[54%] bg-[#e4d5bd] [clip-path:polygon(0_0,100%_0,50%_100%)]" />

        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: [1, 1.045, 1] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-olive font-display italic text-white shadow-lg ring-[5px] ring-[#d9c49e]/70 sm:h-24 sm:w-24"
          >
            <span className="text-2xl sm:text-3xl">L</span>
            <span className="mx-1.5 text-xl text-gold sm:text-2xl">&</span>
            <span className="text-2xl sm:text-3xl">G</span>
          </motion.div>
        </div>

        <span className="absolute inset-x-0 bottom-5 text-[8px] uppercase tracking-[.3em] text-olive/60 sm:bottom-7 sm:text-[9px] sm:tracking-[.35em]">
          Toque para abrir
        </span>
      </motion.button>
    </motion.div>
  )}</AnimatePresence>
}
