"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { Mic, Upload, Phone, FileSearch, ShieldAlert, History } from "lucide-react"

const actions = [
  { id: "analyze",    label: "Analyze Call",  desc: "Upload audio",    icon: Upload,      accent: "text-emerald-400", bg: "bg-emerald-500/8",  border: "border-emerald-500/15" },
  { id: "record",     label: "Live Record",   desc: "Record & scan",   icon: Mic,         accent: "text-rose-400",    bg: "bg-rose-500/8",     border: "border-rose-500/15" },
  { id: "cdr",        label: "CDR Check",     desc: "Call records",    icon: Phone,       accent: "text-sky-400",     bg: "bg-sky-500/8",      border: "border-sky-500/15" },
  { id: "report",     label: "View Report",   desc: "Past analyses",   icon: FileSearch,  accent: "text-amber-400",   bg: "bg-amber-500/8",    border: "border-amber-500/15" },
  { id: "scam-types", label: "Scam Types",    desc: "Known patterns",  icon: ShieldAlert, accent: "text-orange-400",  bg: "bg-orange-500/8",   border: "border-orange-500/15" },
  { id: "history",    label: "Call History",   desc: "Full log",        icon: History,     accent: "text-teal-400",    bg: "bg-teal-500/8",     border: "border-teal-500/15" },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } },
}

const item = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } },
}

export function QuickActions({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const handleSelect = useCallback((id: string) => {
    if (!onNavigate) return
    if (id === "analyze" || id === "record") onNavigate("analyze")
    else if (id === "history" || id === "cdr" || id === "report") onNavigate("history")
    else if (id === "scam-types") onNavigate("alerts")
  }, [onNavigate])

  return (
    <section className="px-5">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3"
      >
        Quick Actions
      </motion.p>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
      >
        {actions.map((a) => {
          const Icon = a.icon
          return (
            <motion.button
              key={a.id}
              variants={item}
              whileHover={{ scale: 1.03, transition: { type: "spring", stiffness: 400, damping: 20 } }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelect(a.id)}
              className={`relative rounded-xl ${a.border} border bg-card p-3.5 flex flex-col items-start gap-2.5 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none transition-colors hover:bg-secondary/60`}
              aria-label={`${a.label}: ${a.desc}`}
            >
              <div className={`${a.bg} rounded-lg p-2`}>
                <Icon className={`w-[18px] h-[18px] ${a.accent}`} />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-foreground leading-tight">{a.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </motion.div>
    </section>
  )
}
