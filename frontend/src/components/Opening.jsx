import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, Crown } from 'lucide-react'

const floaters = [
  ['left-[7%] top-[16%] h-28 w-16 rotate-[-28deg]', 0],
  ['right-[9%] top-[14%] h-24 w-14 rotate-[34deg]', .35],
  ['left-[16%] bottom-[18%] h-20 w-12 rotate-[18deg]', .7],
  ['right-[17%] bottom-[18%] h-28 w-16 rotate-[-16deg]', 1.05]
]

export default function Opening({ show, onOpen }) {
  return <AnimatePresence>{show && (
    <motion.div
      exit={{ opacity: 0, scale: 1.02, filter: 'blur(6px)' }}
      transition={{ duration: .75, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] min-h-[100dvh] overflow-hidden bg-[#efe4d0] px-4 py-5 text-center text-olive sm:py-7"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_8%,#fffdf5_0,#efe3cd_44%,#d6c39f_100%)]" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(#b69a65_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute left-1/2 top-1/2 h-[720px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/20 shadow-[0_0_90px_rgba(190,158,96,.24)]" />
      <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/45" />
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-gold/25 blur-3xl" />
      <div className="absolute -bottom-40 -right-28 h-96 w-96 rounded-full bg-olive/25 blur-3xl" />

      {floaters.map(([classes, delay]) => (
        <motion.span
          key={classes}
          className={`pointer-events-none absolute rounded-full bg-white/40 shadow-[inset_0_0_25px_rgba(194,164,103,.2)] blur-[.2px] ${classes}`}
          animate={{ y: [0, -14, 0], opacity: [.32, .78, .32] }}
          transition={{ duration: 4.5, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
      ))}

      <button type="button" onClick={onOpen} aria-label="Abrir convite" className="relative z-10 grid min-h-[calc(100dvh-2.5rem)] w-full place-items-center sm:min-h-[calc(100dvh-3.5rem)]">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: .94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: .9, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[680px]"
        >
          <div className="absolute -inset-3 rounded-[2.5rem] bg-gradient-to-br from-white/40 via-gold/20 to-olive/10 blur-2xl" />

          <motion.div
            initial={{ opacity: 0, y: 62, rotateX: 12 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: .24, duration: .9, ease: 'easeOut' }}
            className="relative mx-auto mb-[-58px] w-[74%] max-w-[340px] overflow-hidden rounded-t-[1.7rem] border border-gold/35 bg-[#fffaf1] px-5 pb-20 pt-6 shadow-[0_24px_70px_rgba(64,54,35,.18)] sm:mb-[-74px] sm:max-w-[380px] sm:pb-24 sm:pt-8 lg:max-w-[410px]"
          >
            <div className="pointer-events-none absolute inset-3 rounded-t-[1.25rem] border border-gold/20" />
            <Crown className="mx-auto mb-2 text-gold" size={18} />
            <p className="text-[8px] uppercase tracking-[.45em] text-gold sm:text-[9px]">Convite de casamento</p>
            <h2 className="mt-4 font-display text-4xl leading-[.92] text-olive sm:text-5xl lg:text-6xl">
              Loís <span className="text-gold">&</span><br /> Giovanna
            </h2>
            <div className="mx-auto my-4 flex w-28 items-center gap-2">
              <span className="h-px flex-1 bg-gold/35" />
              <Heart size={12} className="fill-gold text-gold" />
              <span className="h-px flex-1 bg-gold/35" />
            </div>
            <p className="text-[9px] uppercase tracking-[.3em] text-olive/55 sm:text-[10px]">18 de dezembro de 2027</p>
          </motion.div>

          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3.3, repeat: Infinity, ease: 'easeInOut' }}
            className="relative mx-auto aspect-[1.5] w-full max-w-[min(88vw,560px,60vh)] overflow-hidden rounded-[1.45rem] border border-white/75 bg-[#fbf5ea] shadow-[0_34px_95px_rgba(67,54,35,.28)] sm:rounded-[1.9rem]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-[#fbf5ea] to-[#dfceb0]" />
            <motion.div
              className="absolute inset-y-[-30%] -left-[35%] w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/45 to-transparent"
              animate={{ x: ['0%', '330%'] }}
              transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
            />
            <div className="absolute inset-y-0 left-0 w-1/2 bg-[#f4eadb] [clip-path:polygon(0_0,100%_50%,0_100%)]" />
            <div className="absolute inset-y-0 right-0 w-1/2 bg-[#f4eadb] [clip-path:polygon(100%_0,0_50%,100%_100%)]" />
            <motion.div
              className="absolute inset-x-0 top-0 h-[58%] origin-top bg-[#e3d1b4] [clip-path:polygon(0_0,100%_0,50%_100%)]"
              animate={{ rotateX: [0, -3, 0] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute inset-x-0 bottom-0 h-[56%] bg-[#fffaf1] [clip-path:polygon(0_100%,50%_0,100%_100%)]" />
            <div className="absolute inset-x-10 top-8 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

            <div className="absolute left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2">
              <motion.div
                animate={{ scale: [1, 1.06, 1], boxShadow: ['0 14px 34px rgba(30,45,31,.24)', '0 22px 54px rgba(30,45,31,.36)', '0 14px 34px rgba(30,45,31,.24)'] }}
                transition={{ repeat: Infinity, duration: 2.35, ease: 'easeInOut' }}
                className="grid h-20 w-20 place-items-center rounded-full bg-olive text-white ring-[6px] ring-[#dac69d]/85 sm:h-24 sm:w-24"
              >
                <span className="font-display text-2xl italic sm:text-3xl">L <b className="font-normal text-gold">&</b> G</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: .72, duration: .7 }}
            className="mx-auto mt-5 flex w-fit items-center gap-3 rounded-full border border-gold/35 bg-olive px-6 py-3 text-white shadow-[0_14px_42px_rgba(30,45,31,.24)] sm:mt-6"
          >
            <motion.span
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
              className="grid h-7 w-7 place-items-center rounded-full bg-gold"
            >
              <Sparkles size={14} />
            </motion.span>
            <span className="text-[10px] uppercase tracking-[.28em]">Abrir convite</span>
          </motion.div>
        </motion.div>
      </button>
    </motion.div>
  )}</AnimatePresence>
}
