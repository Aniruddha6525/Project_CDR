"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, ScanLine, Phone, Bell, ChevronRight, ChevronLeft } from "lucide-react"

const slides = [
  {
    icon: Shield,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    title: "Welcome to SafeLine",
    subtitle: "Your AI-powered shield against telecom fraud",
    description:
      "SafeLine uses advanced artificial intelligence to analyze calls in real-time, protecting you from banking scams, tech support fraud, and social engineering attacks.",
    visual: "shield",
  },
  {
    icon: ScanLine,
    color: "text-sky-400",
    bg: "bg-sky-500/10",
    ring: "ring-sky-500/20",
    title: "Hybrid AI Analysis",
    subtitle: "Acoustic + Linguistic + CDR",
    description:
      "Our system combines voice stress detection, suspicious keyword analysis from transcriptions, and call pattern recognition for unmatched accuracy.",
    visual: "wave",
  },
  {
    icon: Phone,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    title: "Number Intelligence",
    subtitle: "Instant scam number lookup",
    description:
      "Check any phone number against our community-powered database. See risk scores, scam type classifications, and user reports before answering.",
    visual: "lookup",
  },
  {
    icon: Bell,
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    ring: "ring-rose-500/20",
    title: "Stay Protected",
    subtitle: "Real-time alerts & blocking",
    description:
      "Get instant notifications when a scam is detected. Auto-block known fraud numbers and receive weekly safety reports on your call activity.",
    visual: "alert",
  },
]

function ShieldVisual() {
  return (
    <div className="relative w-40 h-40 mx-auto">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-emerald-500/20"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1 + i * 0.25, opacity: 0.4 - i * 0.12 }}
          transition={{ delay: i * 0.2, duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        />
      ))}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
      >
        <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Shield className="w-10 h-10 text-emerald-400" />
        </div>
      </motion.div>
    </div>
  )
}

function WaveVisual() {
  return (
    <div className="flex items-center justify-center gap-1 h-40">
      {Array.from({ length: 24 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full bg-sky-400/60"
          initial={{ height: 8 }}
          animate={{ height: [8, 20 + Math.random() * 60, 8] }}
          transition={{
            delay: i * 0.05,
            duration: 1.2 + Math.random() * 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

function LookupVisual() {
  return (
    <div className="flex flex-col items-center gap-3 h-40 justify-center">
      <motion.div
        className="w-52 h-12 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center px-4 gap-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Phone className="w-4 h-4 text-amber-400" />
        <motion.div
          className="flex gap-0.5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } } }}
        >
          {"+91 98765 43210".split("").map((ch, i) => (
            <motion.span
              key={i}
              className="text-sm font-mono text-amber-400"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
      <motion.div
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.4, type: "spring", stiffness: 300 }}
      >
        <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
        <span className="text-xs font-semibold text-red-400">High Risk - Banking Fraud</span>
      </motion.div>
    </div>
  )
}

function AlertVisual() {
  return (
    <div className="relative flex items-center justify-center h-40">
      <motion.div
        className="absolute w-24 h-24 rounded-full bg-rose-500/5"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.15, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"
        animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
        transition={{ delay: 0.5, duration: 0.6, repeat: Infinity, repeatDelay: 2.5 }}
      >
        <Bell className="w-8 h-8 text-rose-400" />
      </motion.div>
    </div>
  )
}

const visuals: Record<string, () => JSX.Element> = {
  shield: ShieldVisual,
  wave: WaveVisual,
  lookup: LookupVisual,
  alert: AlertVisual,
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0, scale: 0.97 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0, scale: 0.97 }),
}

export function OnboardingScreen({ onComplete }: { onComplete: () => void }) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goNext = () => {
    if (current === slides.length - 1) {
      onComplete()
      return
    }
    setDirection(1)
    setCurrent((p) => p + 1)
  }

  const goBack = () => {
    if (current === 0) return
    setDirection(-1)
    setCurrent((p) => p - 1)
  }

  const slide = slides[current]
  const Icon = slide.icon
  const Visual = visuals[slide.visual]

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-background">
      {/* Skip */}
      <div className="flex justify-end px-5 pt-[env(safe-area-inset-top,48px)]">
        <button
          onClick={onComplete}
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col justify-center px-8 overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="flex flex-col items-center text-center"
          >
            {/* Visual */}
            <div className="mb-10">
              <Visual />
            </div>

            {/* Icon badge */}
            <motion.div
              className={`w-11 h-11 rounded-xl ${slide.bg} ring-1 ${slide.ring} flex items-center justify-center mb-5`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.15 }}
            >
              <Icon className={`w-5 h-5 ${slide.color}`} />
            </motion.div>

            {/* Text */}
            <motion.h1
              className="text-[26px] font-bold tracking-tight text-foreground mb-1.5 text-balance"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {slide.title}
            </motion.h1>
            <motion.p
              className={`text-sm font-semibold ${slide.color} mb-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {slide.subtitle}
            </motion.p>
            <motion.p
              className="text-sm text-muted-foreground leading-relaxed max-w-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="px-8 pb-[calc(env(safe-area-inset-bottom,16px)+16px)]">
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => {
                setDirection(i > current ? 1 : -1)
                setCurrent(i)
              }}
              className="relative h-1.5 rounded-full bg-secondary overflow-hidden"
              animate={{ width: i === current ? 28 : 8 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              aria-label={`Go to slide ${i + 1}`}
            >
              {i === current && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  layoutId="dot-fill"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-3">
          {current > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={goBack}
              className="flex items-center justify-center w-12 h-12 rounded-xl border border-border bg-card text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={goNext}
            className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-shadow hover:shadow-lg hover:shadow-primary/20"
          >
            {current === slides.length - 1 ? "Get Started" : "Continue"}
            {current < slides.length - 1 && <ChevronRight className="w-4 h-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
