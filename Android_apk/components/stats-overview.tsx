"use client"

import { motion } from "framer-motion"
import { ThreatRing } from "./progress-ring"
import { ShieldCheck, PhoneIncoming, AlertTriangle, TrendingUp } from "lucide-react"

const stats = [
  { label: "Calls Analyzed", value: "1,284", change: "+18%", icon: PhoneIncoming, color: "text-emerald-400" },
  { label: "Threats Blocked", value: "47", change: "+5", icon: AlertTriangle, color: "text-amber-400" },
  { label: "Safety Score", value: "94%", change: "+2%", icon: ShieldCheck, color: "text-teal-400" },
]

export function ThreatOverview() {
  return (
    <section className="px-5">
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3"
      >
        Protection Overview
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="rounded-2xl border border-border bg-card p-5"
      >
        {/* Active status */}
        <div className="flex items-center gap-2 mb-5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="text-xs font-medium text-emerald-400">System Active</span>
          <span className="text-xs text-muted-foreground">-- Low Threat Level</span>
        </div>

        {/* Rings */}
        <div className="flex items-center justify-around mb-6">
          <ThreatRing value={94} max={100} color="oklch(0.72 0.19 165)" label="Acoustic" size={76} strokeWidth={5} />
          <ThreatRing value={87} max={100} color="oklch(0.75 0.16 55)" label="Linguistic" size={76} strokeWidth={5} />
          <ThreatRing value={96} max={100} color="oklch(0.7 0.14 200)" label="CDR" size={76} strokeWidth={5} />
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-xl bg-secondary/50 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                  <span className="text-[10px] text-muted-foreground font-medium truncate">{s.label}</span>
                </div>
                <p className="text-base font-bold text-foreground tabular-nums">{s.value}</p>
                <div className="flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                  <span className="text-[10px] font-semibold text-emerald-400">{s.change}</span>
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </section>
  )
}
