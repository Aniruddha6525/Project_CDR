"use client"

import { motion } from "framer-motion"
import { ShieldCheck, ShieldAlert, Ban, Phone, AlertTriangle } from "lucide-react"

const activities = [
  { id: "1", icon: ShieldCheck,  title: "Legitimate Call",       detail: "+91 98XXX XXXXX - Bank Verification",    time: "3m ago",  status: "safe" as const },
  { id: "2", icon: ShieldAlert,  title: "Suspicious Pattern",    detail: "+1 800-XXX-XXXX - Tech Support Claim",   time: "18m ago", status: "suspicious" as const },
  { id: "3", icon: Ban,          title: "Fraud Detected",        detail: "+44 XXXX XXXXXX - UPI Scam Pattern",     time: "42m ago", status: "fraud" as const },
  { id: "4", icon: Phone,        title: "Call Analyzed",          detail: "+91 70XXX XXXXX - Insurance Query",      time: "1h ago",  status: "safe" as const },
  { id: "5", icon: AlertTriangle,title: "Voice Stress Detected", detail: "+91 63XXX XXXXX - Pressure Tactics",     time: "2h ago",  status: "suspicious" as const },
]

const badgeStyles = {
  safe:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  suspicious: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  fraud:      "bg-red-500/10 text-red-400 border-red-500/20",
}

const badgeLabels = { safe: "Safe", suspicious: "Suspect", fraud: "Fraud" }

const iconColors = {
  safe: "text-emerald-400",
  suspicious: "text-amber-400",
  fraud: "text-red-400",
}

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.7 } },
}

const listItem = {
  hidden: { opacity: 0, x: -12 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
}

export function RecentActivity() {
  return (
    <section className="px-5 pb-2">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3"
      >
        Recent Call Analysis
      </motion.p>

      <motion.div
        variants={listContainer}
        initial="hidden"
        animate="show"
        className="rounded-2xl border border-border bg-card overflow-hidden"
      >
        {activities.map((a, i) => {
          const Icon = a.icon
          return (
            <motion.div
              key={a.id}
              variants={listItem}
              className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/40 ${
                i < activities.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className={`shrink-0 ${iconColors[a.status]}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] text-foreground font-medium truncate">{a.title}</p>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-px rounded-full border ${badgeStyles[a.status]}`}>
                    {badgeLabels[a.status]}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{a.detail}</p>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">{a.time}</span>
            </motion.div>
          )
        })}
      </motion.div>
    </section>
  )
}
