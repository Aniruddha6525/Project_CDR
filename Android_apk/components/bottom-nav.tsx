"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Home, ScanLine, History, ShieldAlert, User } from "lucide-react"

const navItems = [
  { id: "home",    icon: Home,        label: "Home" },
  { id: "analyze", icon: ScanLine,    label: "Analyze" },
  { id: "history", icon: History,     label: "History" },
  { id: "alerts",  icon: ShieldAlert, label: "Threats" },
  { id: "profile", icon: User,        label: "Profile" },
]

export function BottomNav({ active, onNavigate }: { active: string; onNavigate: (p: string) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50" aria-label="Main navigation">
      {/* Fade-out gradient above the bar */}
      <div className="h-6 bg-gradient-to-t from-background to-transparent pointer-events-none" />

      <div className="bg-background border-t border-border pb-[env(safe-area-inset-bottom,4px)]">
        <div className="mx-auto max-w-md flex items-center justify-around py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`relative flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="text-[10px] font-medium">{item.label}</span>
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-primary"
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
