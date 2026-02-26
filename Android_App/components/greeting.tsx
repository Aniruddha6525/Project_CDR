"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Shield } from "lucide-react"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: "Good Morning", sub: "SafeLine is active and monitoring." }
  if (hour >= 12 && hour < 17) return { text: "Good Afternoon", sub: "All systems operational." }
  if (hour >= 17 && hour < 21) return { text: "Good Evening", sub: "Stay vigilant against scams." }
  return { text: "Good Night", sub: "SafeLine keeps watching while you rest." }
}

function getDate() {
  return new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

export function Greeting() {
  const [data, setData] = useState(getGreeting())
  const [date, setDate] = useState(getDate())

  useEffect(() => {
    const id = setInterval(() => { setData(getGreeting()); setDate(getDate()) }, 60000)
    return () => clearInterval(id)
  }, [])

  return (
    <header className="px-5 pt-14 pb-1">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-foreground">SafeLine</p>
          <p className="text-[11px] font-medium text-primary tracking-wide">AI FRAUD DETECTION</p>
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-xs text-muted-foreground mb-1"
      >
        {date}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="text-[28px] font-bold tracking-tight text-foreground text-balance leading-tight"
      >
        {data.text}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="text-sm text-muted-foreground mt-1"
      >
        {data.sub}
      </motion.p>
    </header>
  )
}
