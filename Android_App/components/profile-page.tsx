"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Shield, Bell, Lock, Globe, HelpCircle, LogOut, ChevronRight, Zap, Wifi, Database } from "lucide-react"

interface SettingItem {
  id: string; icon: React.ReactNode; label: string; description: string; color: string; type: "toggle" | "link"; defaultOn?: boolean
}

const settings: SettingItem[] = [
  { id: "realtime", icon: <Zap className="w-4 h-4" />, label: "Real-Time Protection", description: "Analyze calls as they happen", color: "text-emerald-400", type: "toggle", defaultOn: true },
  { id: "notifications", icon: <Bell className="w-4 h-4" />, label: "Fraud Alerts", description: "Get notified about suspicious calls", color: "text-amber-400", type: "toggle", defaultOn: true },
  { id: "auto-block", icon: <Shield className="w-4 h-4" />, label: "Auto-Block Fraud", description: "Automatically block detected scam calls", color: "text-red-400", type: "toggle", defaultOn: false },
  { id: "cloud-sync", icon: <Wifi className="w-4 h-4" />, label: "Cloud Sync", description: "Sync analysis data across devices", color: "text-sky-400", type: "toggle", defaultOn: true },
  { id: "privacy", icon: <Lock className="w-4 h-4" />, label: "Privacy & Security", description: "Manage data and permissions", color: "text-indigo-400", type: "link" },
  { id: "language", icon: <Globe className="w-4 h-4" />, label: "Language", description: "Analysis language preferences", color: "text-teal-400", type: "link" },
  { id: "data", icon: <Database className="w-4 h-4" />, label: "Data Management", description: "Export or delete your analysis data", color: "text-orange-400", type: "link" },
  { id: "help", icon: <HelpCircle className="w-4 h-4" />, label: "Help & Support", description: "FAQ, guides, and contact support", color: "text-rose-400", type: "link" },
]

const pStats = [
  { label: "Calls Protected", value: "1,284", color: "text-emerald-400" },
  { label: "Threats Blocked", value: "47", color: "text-red-400" },
  { label: "Days Active", value: "34", color: "text-amber-400" },
]

export function ProfilePage() {
  const [toggles, setToggles] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    settings.forEach(s => { if (s.type === "toggle") init[s.id] = s.defaultOn ?? false })
    return init
  })

  return (
    <div className="px-5 pt-14 pb-4">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-5 mb-5"
      >
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">SafeLine User</h1>
            <p className="text-xs text-muted-foreground">Premium Protection Plan</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">Protection Active</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {pStats.map(s => (
            <div key={s.label} className="text-center rounded-xl bg-secondary/50 py-2.5 px-1">
              <p className={`text-base font-bold tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[9px] text-muted-foreground font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Settings */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3"
      >
        Settings
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-border bg-card overflow-hidden mb-5"
      >
        {settings.map((s, i) => (
          <div
            key={s.id}
            className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-secondary/30 ${
              i < settings.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className={`${s.color} shrink-0`}>{s.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-foreground font-medium">{s.label}</p>
              <p className="text-[11px] text-muted-foreground">{s.description}</p>
            </div>
            {s.type === "toggle" ? (
              <button
                onClick={() => setToggles(p => ({ ...p, [s.id]: !p[s.id] }))}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${
                  toggles[s.id] ? "bg-primary" : "bg-secondary"
                }`}
                aria-label={`Toggle ${s.label}`}
                role="switch"
                aria-checked={toggles[s.id]}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-foreground"
                  animate={{ left: toggles[s.id] ? "calc(100% - 22px)" : "2px" }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            ) : (
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            )}
          </div>
        ))}
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-border bg-card p-4 mb-3"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] text-foreground font-medium">About SafeLine</p>
          <span className="text-[10px] text-muted-foreground tabular-nums">v2.1.0</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Advanced AI-Powered Call Analysis System. Protects against Banking Fraud, Tech Support Scams,
          UPI Payment Scams, and more using hybrid acoustic-linguistic analysis.
        </p>
      </motion.div>

      {/* Logout */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full rounded-xl border border-red-500/20 bg-red-500/5 py-3 flex items-center justify-center gap-2 text-red-400 cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span className="text-sm font-semibold">Sign Out</span>
      </motion.button>
    </div>
  )
}
