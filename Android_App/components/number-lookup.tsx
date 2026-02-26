"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Search,
  Phone,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  AlertTriangle,
  MapPin,
  Users,
  Clock,
  ChevronDown,
  Flag,
  ThumbsUp,
  ExternalLink,
} from "lucide-react"

interface NumberResult {
  number: string
  riskLevel: "safe" | "low" | "medium" | "high" | "critical"
  riskScore: number
  carrier: string
  region: string
  type: string
  reportCount: number
  lastReported: string
  scamCategory: string | null
  communityVerdict: string
  recentReports: {
    user: string
    date: string
    comment: string
    upvotes: number
  }[]
}

const riskConfig = {
  safe:     { label: "Safe",     color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: ShieldCheck },
  low:      { label: "Low Risk", color: "text-teal-400",    bg: "bg-teal-500/10",    border: "border-teal-500/20",    icon: ShieldCheck },
  medium:   { label: "Medium",   color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20",   icon: ShieldAlert },
  high:     { label: "High Risk",color: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20",  icon: AlertTriangle },
  critical: { label: "Critical", color: "text-red-400",     bg: "bg-red-500/10",     border: "border-red-500/20",     icon: ShieldX },
}

// Simulated database of numbers
const mockDatabase: Record<string, NumberResult> = {
  "9876543210": {
    number: "+91 98765 43210",
    riskLevel: "critical",
    riskScore: 94,
    carrier: "Jio",
    region: "Mumbai, Maharashtra",
    type: "Mobile",
    reportCount: 847,
    lastReported: "12 minutes ago",
    scamCategory: "Banking Fraud (OTP Phishing)",
    communityVerdict: "Confirmed Scam",
    recentReports: [
      { user: "Anon_82xx", date: "12m ago", comment: "Claimed to be SBI and asked for OTP. Classic bank fraud.", upvotes: 234 },
      { user: "User_45xx", date: "1h ago", comment: "Spoofing SBI customer care. Pressured me to share card details urgently.", upvotes: 187 },
      { user: "Anon_91xx", date: "3h ago", comment: "Received UPI collect request immediately after the call ended.", upvotes: 142 },
    ],
  },
  "8001234567": {
    number: "+1 800 123 4567",
    riskLevel: "high",
    riskScore: 78,
    carrier: "AT&T",
    region: "Texas, United States",
    type: "Toll-Free",
    reportCount: 312,
    lastReported: "2 hours ago",
    scamCategory: "Tech Support Scam",
    communityVerdict: "Likely Scam",
    recentReports: [
      { user: "Anon_33xx", date: "2h ago", comment: "Fake Microsoft support. Wanted remote access to my computer.", upvotes: 98 },
      { user: "User_67xx", date: "5h ago", comment: "Told me my PC was infected, demanded $299 for fix.", upvotes: 76 },
    ],
  },
  "7012345678": {
    number: "+91 70123 45678",
    riskLevel: "safe",
    riskScore: 8,
    carrier: "Airtel",
    region: "Bangalore, Karnataka",
    type: "Mobile",
    reportCount: 0,
    lastReported: "Never",
    scamCategory: null,
    communityVerdict: "No Reports",
    recentReports: [],
  },
  "4420712345": {
    number: "+44 20 7123 4567",
    riskLevel: "medium",
    riskScore: 45,
    carrier: "BT",
    region: "London, United Kingdom",
    type: "Landline",
    reportCount: 23,
    lastReported: "1 day ago",
    scamCategory: "Lottery/Prize Scam",
    communityVerdict: "Under Review",
    recentReports: [
      { user: "Anon_12xx", date: "1d ago", comment: "Said I won a UK lottery. Asked for processing fee.", upvotes: 31 },
    ],
  },
}

function getResult(input: string): NumberResult | null {
  const cleaned = input.replace(/[\s\-\+\(\)]/g, "")
  for (const key of Object.keys(mockDatabase)) {
    if (cleaned.includes(key)) return mockDatabase[key]
  }
  // Random result for unknown numbers
  if (cleaned.length >= 7) {
    const risk = ["safe", "low", "medium"][Math.floor(Math.random() * 3)] as NumberResult["riskLevel"]
    return {
      number: input,
      riskLevel: risk,
      riskScore: risk === "safe" ? Math.floor(Math.random() * 15) : risk === "low" ? 15 + Math.floor(Math.random() * 20) : 35 + Math.floor(Math.random() * 15),
      carrier: "Unknown",
      region: "Not identified",
      type: "Mobile",
      reportCount: risk === "safe" ? 0 : Math.floor(Math.random() * 5),
      lastReported: risk === "safe" ? "Never" : `${Math.floor(Math.random() * 30) + 1}d ago`,
      scamCategory: null,
      communityVerdict: risk === "safe" ? "No Reports" : "Insufficient Data",
      recentReports: [],
    }
  }
  return null
}

export function NumberLookupPage() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<NumberResult | null>(null)
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [showReports, setShowReports] = useState(false)

  const handleSearch = useCallback(() => {
    if (!query.trim()) return
    setSearching(true)
    setResult(null)
    setSearched(false)
    setShowReports(false)
    setTimeout(() => {
      setResult(getResult(query))
      setSearching(false)
      setSearched(true)
    }, 1200)
  }, [query])

  return (
    <div className="flex flex-col gap-5 px-5 pt-14 pb-4">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-[26px] font-bold tracking-tight text-foreground mb-1">Number Lookup</h1>
        <p className="text-sm text-muted-foreground">Check any number against our scam database</p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="relative"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="tel"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter phone number..."
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all font-mono"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSearch}
            disabled={!query.trim() || searching}
            className="h-12 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </motion.button>
        </div>

        {/* Quick try numbers */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-[10px] text-muted-foreground self-center mr-1">Try:</span>
          {["9876543210", "800-123-4567", "+44 20 7123 4567", "7012345678"].map((n) => (
            <button
              key={n}
              onClick={() => { setQuery(n); }}
              className="text-[11px] font-mono px-2 py-1 rounded-md bg-secondary/60 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {n}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Scanning animation */}
      <AnimatePresence>
        {searching && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-2xl border border-border bg-card p-8 flex flex-col items-center gap-4"
          >
            <div className="relative w-16 h-16">
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-primary/30"
                animate={{ scale: [1, 1.4], opacity: [0.6, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-primary/10">
                <Search className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-foreground">Scanning Database</p>
              <p className="text-xs text-muted-foreground mt-0.5">Checking scam reports, carrier info, and risk signals...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {searched && result && !searching && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="flex flex-col gap-3"
          >
            {/* Risk score hero card */}
            {(() => {
              const cfg = riskConfig[result.riskLevel]
              const RiskIcon = cfg.icon
              return (
                <div className={`rounded-2xl border ${cfg.border} bg-card p-5`}>
                  <div className="flex items-center gap-4 mb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
                      className={`w-14 h-14 rounded-2xl ${cfg.bg} flex items-center justify-center`}
                    >
                      <RiskIcon className={`w-7 h-7 ${cfg.color}`} />
                    </motion.div>
                    <div className="flex-1">
                      <p className="font-mono text-lg font-bold text-foreground tracking-tight">{result.number}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground">{result.communityVerdict}</span>
                      </div>
                    </div>
                  </div>

                  {/* Risk score bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-medium text-muted-foreground">Risk Score</span>
                      <span className={`text-sm font-bold tabular-nums ${cfg.color}`}>{result.riskScore}/100</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            result.riskScore > 70
                              ? "linear-gradient(90deg, oklch(0.75 0.16 55), oklch(0.62 0.24 25))"
                              : result.riskScore > 40
                              ? "linear-gradient(90deg, oklch(0.72 0.19 165), oklch(0.75 0.16 55))"
                              : "linear-gradient(90deg, oklch(0.72 0.19 165), oklch(0.7 0.14 200))",
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${result.riskScore}%` }}
                        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
                      />
                    </div>
                  </div>

                  {/* Scam category */}
                  {result.scamCategory && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/15 mb-3"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <span className="text-xs font-medium text-red-400">{result.scamCategory}</span>
                    </motion.div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Phone, label: "Type", value: result.type },
                      { icon: MapPin, label: "Region", value: result.region },
                      { icon: Users, label: "Reports", value: result.reportCount.toLocaleString() },
                      { icon: Clock, label: "Last Seen", value: result.lastReported },
                    ].map((d) => (
                      <div key={d.label} className="flex items-center gap-2.5 rounded-xl bg-secondary/40 px-3 py-2.5">
                        <d.icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">{d.label}</p>
                          <p className="text-[12px] font-semibold text-foreground truncate">{d.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Community reports */}
            {result.recentReports.length > 0 && (
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setShowReports(!showReports)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Flag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[13px] font-semibold text-foreground">Community Reports</span>
                    <span className="text-[11px] text-muted-foreground">({result.recentReports.length})</span>
                  </div>
                  <motion.div animate={{ rotate: showReports ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showReports && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      {result.recentReports.map((r, i) => (
                        <div
                          key={i}
                          className={`px-5 py-3 ${i < result.recentReports.length - 1 ? "border-b border-border" : ""}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-foreground">{r.user}</span>
                            <span className="text-[10px] text-muted-foreground">{r.date}</span>
                          </div>
                          <p className="text-[12px] text-muted-foreground leading-relaxed mb-1.5">{r.comment}</p>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground tabular-nums">{r.upvotes}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-11 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-semibold flex items-center justify-center gap-2 hover:bg-destructive/15 transition-colors"
              >
                <Flag className="w-4 h-4" />
                Report Number
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 h-11 rounded-xl bg-secondary border border-border text-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Share
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state when not searched yet */}
      {!searched && !searching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center py-12 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
            <Search className="w-7 h-7 text-primary/40" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Enter a phone number above</p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-[260px]">
              We will scan our database of scam reports, carrier records, and community flags to give you a risk assessment.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
