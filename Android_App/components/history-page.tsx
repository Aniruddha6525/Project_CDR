"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, ShieldCheck, ShieldAlert, Ban, Search, X } from "lucide-react"

type CallStatus = "safe" | "suspicious" | "fraud"
type FilterType = "all" | "safe" | "suspicious" | "fraud"

interface CallRecord {
  id: string; number: string; name: string; direction: "incoming" | "outgoing" | "missed"; status: CallStatus
  confidence: number; duration: string; time: string; date: string; scamType?: string
}

const callHistory: CallRecord[] = [
  { id: "c1", number: "+91 98XXX XXXXX", name: "HDFC Bank", direction: "incoming", status: "safe", confidence: 96, duration: "4:32", time: "10:15 AM", date: "Today" },
  { id: "c2", number: "+1 800-XXX-XXXX", name: "Unknown Caller", direction: "incoming", status: "fraud", confidence: 89, duration: "1:45", time: "9:30 AM", date: "Today", scamType: "Tech Support Scam" },
  { id: "c3", number: "+91 70XXX XXXXX", name: "Insurance Agent", direction: "incoming", status: "suspicious", confidence: 67, duration: "3:12", time: "Yesterday", date: "Yesterday", scamType: "Potential Phishing" },
  { id: "c4", number: "+91 63XXX XXXXX", name: "Family Contact", direction: "outgoing", status: "safe", confidence: 99, duration: "12:45", time: "Yesterday", date: "Yesterday" },
  { id: "c5", number: "+44 XXXX XXXXXX", name: "Unknown (UK)", direction: "missed", status: "fraud", confidence: 94, duration: "0:00", time: "2 days ago", date: "Feb 24", scamType: "UPI Payment Scam" },
  { id: "c6", number: "+91 88XXX XXXXX", name: "Delivery Partner", direction: "incoming", status: "safe", confidence: 91, duration: "0:58", time: "2 days ago", date: "Feb 24" },
  { id: "c7", number: "+91 55XXX XXXXX", name: "Loan Offer", direction: "incoming", status: "suspicious", confidence: 72, duration: "2:10", time: "3 days ago", date: "Feb 23", scamType: "Loan Fraud Attempt" },
  { id: "c8", number: "+91 99XXX XXXXX", name: "SBI Bank", direction: "incoming", status: "safe", confidence: 98, duration: "6:22", time: "3 days ago", date: "Feb 23" },
]

const statusCfg = {
  safe:       { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: ShieldCheck, label: "Safe" },
  suspicious: { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: ShieldAlert, label: "Suspect" },
  fraud:      { color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     icon: Ban,         label: "Fraud" },
}

function DirIcon({ d }: { d: "incoming" | "outgoing" | "missed" }) {
  if (d === "incoming") return <PhoneIncoming className="w-4 h-4 text-emerald-400" />
  if (d === "outgoing") return <PhoneOutgoing className="w-4 h-4 text-sky-400" />
  return <PhoneMissed className="w-4 h-4 text-red-400" />
}

export function HistoryPage() {
  const [filter, setFilter] = useState<FilterType>("all")
  const [q, setQ] = useState("")

  const filtered = callHistory.filter(c => {
    if (filter !== "all" && c.status !== filter) return false
    if (q) { const s = q.toLowerCase(); return c.name.toLowerCase().includes(s) || c.number.includes(s) || (c.scamType?.toLowerCase().includes(s) ?? false) }
    return true
  })

  const filters: { v: FilterType; l: string; n: number }[] = [
    { v: "all", l: "All", n: callHistory.length },
    { v: "safe", l: "Safe", n: callHistory.filter(c => c.status === "safe").length },
    { v: "suspicious", l: "Suspect", n: callHistory.filter(c => c.status === "suspicious").length },
    { v: "fraud", l: "Fraud", n: callHistory.filter(c => c.status === "fraud").length },
  ]

  let currentDate = ""

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-1"
      >
        <h1 className="text-[28px] font-bold text-foreground tracking-tight">Call History</h1>
        <div className="rounded-xl bg-card border border-border p-2.5">
          <Phone className="w-5 h-5 text-primary" />
        </div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm text-muted-foreground mb-5">
        {callHistory.length} calls analyzed this week
      </motion.p>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-xl border border-border bg-card flex items-center gap-2.5 px-3.5 py-2.5 mb-4"
      >
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          type="text"
          placeholder="Search calls, numbers, scam types..."
          className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground w-full outline-none"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {q && (
          <button onClick={() => setQ("")} className="cursor-pointer" aria-label="Clear search">
            <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-5 overflow-x-auto pb-1"
      >
        {filters.map(f => (
          <button
            key={f.v}
            onClick={() => setFilter(f.v)}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              filter === f.v ? "bg-primary/10 text-primary border-primary/30" : "bg-card text-muted-foreground border-border hover:text-foreground hover:border-border"
            }`}
          >
            {f.l} ({f.n})
          </button>
        ))}
      </motion.div>

      {/* List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={filter + q}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col gap-2"
        >
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center">
              <Search className="w-7 h-7 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No calls matching your filter</p>
            </div>
          ) : (
            filtered.map((c, i) => {
              const showDate = c.date !== currentDate
              currentDate = c.date
              const cfg = statusCfg[c.status]
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  {showDate && (
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mt-2 mb-1.5 px-1">{c.date}</p>
                  )}
                  <div className={`rounded-xl border ${cfg.border} bg-card p-3.5`}>
                    <div className="flex items-start gap-3">
                      <div className={`${cfg.bg} rounded-lg p-2 shrink-0 mt-0.5`}>
                        <DirIcon d={c.direction} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[13px] font-semibold text-foreground truncate">{c.name}</p>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{c.number}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-muted-foreground">{c.time}</span>
                          <span className="text-[10px] text-muted-foreground">{c.duration}</span>
                          <span className="text-[10px] text-foreground font-medium tabular-nums">{c.confidence}% confident</span>
                        </div>
                        {c.scamType && <p className="text-[10px] text-red-400 font-medium mt-1">{c.scamType}</p>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
