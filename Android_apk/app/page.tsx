"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MeshBackground } from "@/components/mesh-background"
import { Greeting } from "@/components/greeting"
import { QuickActions } from "@/components/quick-actions"
import { ThreatOverview } from "@/components/stats-overview"
import { RecentActivity } from "@/components/recent-activity"
import { BottomNav } from "@/components/bottom-nav"
import { AnalyzePage } from "@/components/analyze-page"
import { HistoryPage } from "@/components/history-page"
import { AlertsPage } from "@/components/alerts-page"
import { ProfilePage } from "@/components/profile-page"

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export default function SafeLineDashboard() {
  const [activePage, setActivePage] = useState("home")

  return (
    <>
      <MeshBackground />
      <main className="relative min-h-screen max-w-lg mx-auto pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activePage}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {activePage === "home" && (
              <div className="flex flex-col gap-6">
                <Greeting />
                <QuickActions onNavigate={setActivePage} />
                <ThreatOverview />
                <RecentActivity />
              </div>
            )}
            {activePage === "analyze" && <AnalyzePage />}
            {activePage === "history" && <HistoryPage />}
            {activePage === "alerts" && <AlertsPage />}
            {activePage === "profile" && <ProfilePage />}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={activePage} onNavigate={setActivePage} />
    </>
  )
}
