import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles } from 'lucide-react'

const petals = [
  ['left-[8%] top-[18%] h-24 w-14 rotate-[-28deg]', 0],
  ['right-[10%] top-[16%] h-20 w-12 rotate-[32deg]', .35],
  ['left-[15%] bottom-[18%] h-16 w-10 rotate-[20deg]', .7],
  ['right-[18%] bottom-[20%] h-24 w-14 rotate-[-18deg]', 1.05]
]

export default function Opening({ show, onOpen }) {
  return <AnimatePresence>{show && (
    <motion.div
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: .7, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] min-h-[100dvh] overflow-hidden bg-[#efe5d3] px-4 py-7 text-center text-olive"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#fffaf0_0,#efe5d3_44%,#ddceb3_100%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(#b69a65_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -left-36 -top-36 h-80 w-80 rounded-full bg-gold/20 blur-3xl" />
      <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-olive/20 blur-3xl" />

      {petals.map(([classes, delay]) => (
        <motion.span
          key={classes}
          className={`pointer-events-none absolute rounded-full bg-white/45 shadow-[inset_0_0_20px_rgba(194,164,103,.18)] blur-[.2px] ${classes}`}
          animate={{ y: [0, -12, 0], opacity: [.35, .75, .35] }}
          transition={{ duration: 4.5, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
      ))}

      <button type="button" onClick={onOpen} aria-label="Abrir convite" className="relative z-10 grid min-h-[calc(100dvh-3.5rem)] w-full place-items-center">
        <motion.div
          initial={{ opacity: 0, y: 34, scale: .94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[720px]"
        >
          <motion.div
            initial={{ opacity: 0, y: 70, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: .28, duration: .9, ease: 'easeOut' }}
            className="relative mx-auto mb-[-78px] w-[78%] max-w-[430px] rounded-t-[2rem] border border-gold/35 bg-[#fffaf1] px-6 pb-24 pt-9 shadow-[0_22px_60px_rgba(64,54,35,.16)] sm:mb-[-92px] sm:pb-28 sm:pt-10"
          >
            <Sparkles className="mx-auto mb-3 text-gold" size={18} />
            <p className="text-[9px] uppercase tracking-[.42em] text-gold">Convite de casamento</p>
            <h2 className="mt-5 font-display text-5xl leading-none text-olive sm:text-6xl">
              Loís <span className="text-gold">&</span> Giovanna
            </h2>
            <div className="mx-auto my-5 h-px w-24 bg-gold/40" />
            <p className="text-[10px] uppercase tracking-[.28em] text-olive/55">18 de dezembro de 2027</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mx-auto aspect-[1.5] w-full max-w-[650px] overflow-hidden rounded-[1.8rem] border border-white/60 bg-[#fbf5ea] shadow-[0_32px_90px_rgba(67,54,35,.26)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-[#fbf5ea] to-[#dfceb0]" />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[#f4eadb] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[#f4eadb] [clip-path:polygon(100%_0,0_50%,100%_100%)]" />
            <motion.div
              className="absolute inset-x-0 top-0 h-[58%] origin-top bg-[#e5d4b9] [clip-path:polygon(0_0,100%_0,50%_100%)]"
              animate={{ rotateX: [0, -3, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-[56%] bg-[#fffaf1] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />

            <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ scale: [1, 1.055, 1], boxShadow: ['0 12px 30px rgba(30,45,31,.22)', '0 18px 45px rgba(30,45,31,.32)', '0 12px 30px rgba(30,45,31,.22)'] }}
                transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                className="grid h-24 w-24 place-items-center rounded-full bg-olive text-white ring-[7px] ring-[#dac69d]/80 sm:h-28 sm:w-28"
              >
                <span className="font-display text-3xl italic sm:text-4xl">L <b className="font-normal text-gold">&</b> G</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .75, duration: .7 }}
            className="mx-auto mt-8 max-w-sm rounded-full border border-gold/30 bg-white/45 px-5 py-3 shadow-[0_12px_35px_rgba(67,54,35,.12)] backdrop-blur"
          >
            <p className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-[.32em] text-olive/70">
              <Heart size={13} className="fill-gold text-gold" /> Toque para abrir
            </p>
          </motion.div>
        </motion.div>
      </button>
    </motion.div>
  )}</AnimatePresence>
}
