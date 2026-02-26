"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShieldAlert, Landmark, Monitor, Smartphone, Gift, CreditCard, Users, ChevronDown, AlertTriangle, Info } from "lucide-react"

interface ScamCategory {
  id: string; name: string; icon: React.ReactNode; accent: string; borderColor: string; bgColor: string
  severity: "critical" | "high" | "medium"; detectedCount: number; description: string; signs: string[]; example: string
}

const scamCategories: ScamCategory[] = [
  { id: "banking", name: "Banking Fraud", icon: <Landmark className="w-5 h-5" />, accent: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/20", severity: "critical", detectedCount: 23, description: "Callers impersonate bank officials, claiming suspicious activity on your account and requesting OTPs, PINs, or card details.", signs: ["Requests for OTP or PIN over phone", "Claims of unauthorized transactions", "Urgency to act immediately", "Requests to install remote access apps"], example: "\"Your SBI account has been compromised. Share your OTP to secure your account immediately.\"" },
  { id: "tech-support", name: "Tech Support Scam", icon: <Monitor className="w-5 h-5" />, accent: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20", severity: "high", detectedCount: 15, description: "Scammers pose as technical support from Microsoft, Google, or your ISP, claiming your device is infected or compromised.", signs: ["Unsolicited calls about device problems", "Requests to install remote access software", "Payment demanded for fake fixes", "Pressure to buy unnecessary software"], example: "\"This is Microsoft Security. Your computer is sending virus alerts. Let me connect remotely to fix it.\"" },
  { id: "upi", name: "UPI Payment Scam", icon: <Smartphone className="w-5 h-5" />, accent: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20", severity: "critical", detectedCount: 31, description: "Fraudsters trick victims into approving UPI collect requests or sharing UPI PINs under false pretenses like refunds or prizes.", signs: ["Requests to enter UPI PIN for receiving money", "Unknown collect requests", "Claims of cashback or refund", "QR codes sent via WhatsApp for payment"], example: "\"You have a pending refund of Rs. 5000. Please accept this UPI request and enter your PIN to receive the amount.\"" },
  { id: "lottery", name: "Lottery / Prize Scam", icon: <Gift className="w-5 h-5" />, accent: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20", severity: "medium", detectedCount: 8, description: "Victims are told they have won a lottery or prize and must pay processing fees or taxes to claim the winnings.", signs: ["Unsolicited notification of winning", "Advance fee required to claim prize", "Pressure to keep it confidential", "Request for bank account details"], example: "\"Congratulations! You have won Rs. 25 Lakhs in the Google Annual Draw. Pay Rs. 5000 processing fee to claim.\"" },
  { id: "credit-card", name: "Credit Card Fraud", icon: <CreditCard className="w-5 h-5" />, accent: "text-sky-400", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/20", severity: "high", detectedCount: 12, description: "Scammers request credit card details including CVV and expiry date, often posing as bank or payment processor representatives.", signs: ["Requests for full card number over phone", "Asking for CVV or expiry date", "Claims of card being blocked", "Offers to increase credit limit"], example: "\"Your credit card will be blocked in 2 hours. Share your 16-digit card number and CVV to prevent this.\"" },
  { id: "social", name: "Social Engineering", icon: <Users className="w-5 h-5" />, accent: "text-indigo-400", bgColor: "bg-indigo-500/10", borderColor: "border-indigo-500/20", severity: "high", detectedCount: 18, description: "Manipulative tactics exploiting trust, fear, or urgency. Callers may impersonate police, government officials, or relatives.", signs: ["Impersonation of authority figures", "Threatening legal action", "Creating artificial urgency", "Emotional manipulation tactics"], example: "\"This is the Cyber Crime Department. A case has been filed against your Aadhaar. Transfer Rs. 50,000 to avoid arrest.\"" },
]

const severityCfg = {
  critical: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/15", label: "Critical" },
  high:     { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/15", label: "High" },
  medium:   { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/15", label: "Medium" },
}

function ScamCard({ cat }: { cat: ScamCategory }) {
  const [open, setOpen] = useState(false)
  const sev = severityCfg[cat.severity]

  return (
    <div className={`rounded-xl border ${cat.borderColor} bg-card overflow-hidden`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-start gap-3 text-left cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        <div className={`${cat.bgColor} rounded-lg p-2.5 shrink-0`}>
          <span className={cat.accent}>{cat.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-[13px] font-semibold text-foreground">{cat.name}</p>
            <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md border ${sev.bg} ${sev.color} ${sev.border}`}>{sev.label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">{cat.detectedCount} detected this month</p>
        </div>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground shrink-0 mt-1"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-border pt-3">
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">{cat.description}</p>
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-widest">Warning Signs</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  {cat.signs.map(s => (
                    <div key={s} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                      <p className="text-xs text-secondary-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Info className="w-3.5 h-3.5 text-sky-400" />
                  <p className="text-[10px] font-semibold text-sky-400 uppercase tracking-widest">Example Script</p>
                </div>
                <p className="text-xs text-muted-foreground italic leading-relaxed">{cat.example}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AlertsPage() {
  const total = scamCategories.reduce((s, c) => s + c.detectedCount, 0)

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-1">
        <h1 className="text-[28px] font-bold text-foreground tracking-tight">Scam Database</h1>
        <div className="rounded-xl bg-card border border-border p-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
        </div>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-sm text-muted-foreground mb-5">
        {total} threats detected across {scamCategories.length} categories
      </motion.p>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-3 gap-2 mb-5"
      >
        {(Object.entries(severityCfg) as [string, typeof severityCfg.critical][]).map(([key, cfg]) => {
          const count = scamCategories.filter(c => c.severity === key).reduce((s, c) => s + c.detectedCount, 0)
          return (
            <div key={key} className="rounded-xl border border-border bg-card p-3 text-center">
              <p className={`text-lg font-bold tabular-nums ${cfg.color}`}>{count}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{cfg.label}</p>
            </div>
          )
        })}
      </motion.div>

      {/* Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="flex flex-col gap-2.5"
      >
        {scamCategories.map(c => <ScamCard key={c.id} cat={c} />)}
      </motion.div>
    </div>
  )
}
