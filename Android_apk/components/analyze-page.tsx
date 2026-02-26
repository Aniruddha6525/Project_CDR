"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, Mic, MicOff, FileAudio, X, Shield, AlertTriangle, CheckCircle2, Loader2, ArrowRight } from "lucide-react"

type AnalysisState = "idle" | "recording" | "uploading" | "analyzing" | "result"
type ResultVerdict = "legitimate" | "suspicious" | "fraud"

interface AnalysisResult {
  verdict: ResultVerdict
  confidence: number
  acousticScore: number
  linguisticScore: number
  cdrScore: number
  scamType: string | null
  keywords: string[]
  summary: string
}

function generateMockResult(): AnalysisResult {
  const verdicts: ResultVerdict[] = ["legitimate", "suspicious", "fraud"]
  const verdict = verdicts[Math.floor(Math.random() * 3)]
  const confidence = verdict === "legitimate" ? 75 + Math.random() * 20 : verdict === "suspicious" ? 55 + Math.random() * 20 : 70 + Math.random() * 25
  return {
    verdict,
    confidence: Math.round(confidence),
    acousticScore: Math.round(60 + Math.random() * 35),
    linguisticScore: Math.round(50 + Math.random() * 45),
    cdrScore: Math.round(55 + Math.random() * 40),
    scamType: verdict === "fraud" ? ["Banking Fraud", "Tech Support Scam", "UPI Payment Scam", "Lottery Scam"][Math.floor(Math.random() * 4)]
      : verdict === "suspicious" ? ["Potential Phishing", "Social Engineering"][Math.floor(Math.random() * 2)] : null,
    keywords: verdict === "legitimate" ? ["verified", "account holder", "standard procedure"]
      : verdict === "suspicious" ? ["urgent", "verify immediately", "limited time", "personal details"]
      : ["transfer now", "OTP", "penalty", "account blocked", "immediate action"],
    summary: verdict === "legitimate" ? "Call patterns and language analysis indicate a standard, legitimate communication. No stress markers or suspicious keywords detected."
      : verdict === "suspicious" ? "Moderate risk indicators detected. Caller used urgency-based language and requested personal information. Voice stress analysis shows elevated patterns."
      : "High-risk fraud indicators detected. Call matches known scam patterns with pressure tactics, OTP requests, and impersonation markers.",
  }
}

function WaveformVisualizer({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-end justify-center gap-[3px] h-14" aria-hidden="true">
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-[2.5px] rounded-full bg-primary"
          animate={isActive ? {
            scaleY: [0.2, 0.4 + Math.random() * 0.6, 0.2],
          } : { scaleY: 0.15 }}
          transition={isActive ? {
            duration: 0.4 + Math.random() * 0.5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.03,
          } : { duration: 0.3 }}
          style={{ height: "100%", originY: "bottom", opacity: isActive ? 0.8 : 0.15 }}
        />
      ))}
    </div>
  )
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <span className="text-xs text-foreground font-bold tabular-nums">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.2 }}
        />
      </div>
    </div>
  )
}

function ResultCard({ result, onReset }: { result: AnalysisResult; onReset: () => void }) {
  const cfg = {
    legitimate: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: CheckCircle2, label: "Legitimate" },
    suspicious: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: AlertTriangle, label: "Suspicious" },
    fraud:      { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: Shield, label: "Fraud Detected" },
  }
  const c = cfg[result.verdict]
  const Icon = c.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Verdict */}
      <div className={`rounded-2xl border ${c.border} bg-card p-5 mb-3`}>
        <div className="flex items-center gap-4 mb-4">
          <div className={`${c.bg} rounded-xl p-3`}>
            <Icon className={`w-7 h-7 ${c.color}`} />
          </div>
          <div>
            <p className={`text-xl font-bold ${c.color}`}>{c.label}</p>
            <p className="text-sm text-muted-foreground">Confidence: <span className="text-foreground font-semibold tabular-nums">{result.confidence}%</span></p>
          </div>
        </div>
        {result.scamType && (
          <div className="rounded-lg bg-red-500/8 border border-red-500/15 px-3 py-2 mb-4">
            <p className="text-xs text-red-300">Scam Category: <span className="font-bold text-red-400">{result.scamType}</span></p>
          </div>
        )}
        <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Analysis Breakdown</p>
        <div className="flex flex-col gap-3.5">
          <ScoreBar label="Acoustic Analysis" value={result.acousticScore} color="oklch(0.72 0.19 165)" />
          <ScoreBar label="Linguistic Scan" value={result.linguisticScore} color="oklch(0.75 0.16 55)" />
          <ScoreBar label="CDR Pattern Match" value={result.cdrScore} color="oklch(0.6 0.15 260)" />
        </div>
      </div>

      {/* Keywords */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">Detected Keywords</p>
        <div className="flex flex-wrap gap-1.5">
          {result.keywords.map((k) => (
            <span
              key={k}
              className={`text-[11px] px-2.5 py-1 rounded-lg font-medium border ${
                result.verdict === "fraud" ? "bg-red-500/8 text-red-300 border-red-500/15"
                  : result.verdict === "suspicious" ? "bg-amber-500/8 text-amber-300 border-amber-500/15"
                  : "bg-emerald-500/8 text-emerald-300 border-emerald-500/15"
              }`}
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onReset}
        className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-semibold cursor-pointer flex items-center justify-center gap-2"
      >
        Analyze Another Call
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}

export function AnalyzePage() {
  const [state, setState] = useState<AnalysisState>("idle")
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [recordDuration, setRecordDuration] = useState(0)

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    setState("uploading")
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setState("analyzing")
          setTimeout(() => { setResult(generateMockResult()); setState("result") }, 2200)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)
  }, [])

  const handleRecord = useCallback(() => {
    if (state === "recording") {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
      setState("analyzing")
      setFileName(`Recording (${recordDuration}s)`)
      setTimeout(() => { setResult(generateMockResult()); setState("result") }, 2200)
    } else {
      setState("recording")
      setRecordDuration(0)
      recordingTimerRef.current = setInterval(() => setRecordDuration(p => p + 1), 1000)
    }
  }, [state, recordDuration])

  const handleReset = useCallback(() => {
    setState("idle"); setFileName(null); setResult(null); setProgress(0); setRecordDuration(0)
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current) }
  }, [])

  return (
    <div className="px-5 pt-14 pb-4">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-[28px] font-bold text-foreground tracking-tight mb-1"
      >
        Call Analysis
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-sm text-muted-foreground mb-6"
      >
        Upload audio or record a live call for AI-powered fraud detection
      </motion.p>

      <AnimatePresence mode="wait">
        {state === "result" && result ? (
          <ResultCard key="result" result={result} onReset={handleReset} />
        ) : (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {/* Upload zone */}
            <motion.div
              whileHover={state === "idle" ? { scale: 1.01 } : {}}
              whileTap={state === "idle" ? { scale: 0.99 } : {}}
              className="rounded-2xl border border-border bg-card p-6 mb-3 cursor-pointer transition-colors hover:border-primary/30"
              onClick={() => state === "idle" && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload audio file"
              onKeyDown={(e) => { if (e.key === "Enter") fileInputRef.current?.click() }}
            >
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} aria-hidden="true" />

              {state === "idle" && (
                <div className="flex flex-col items-center gap-3 py-6">
                  <div className="rounded-2xl bg-primary/10 border border-primary/20 p-4">
                    <Upload className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Upload Audio File</p>
                    <p className="text-xs text-muted-foreground mt-1">WAV, MP3, OGG, M4A supported</p>
                  </div>
                </div>
              )}

              {state === "uploading" && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="flex items-center gap-2">
                    <FileAudio className="w-4 h-4 text-primary" />
                    <span className="text-sm text-foreground font-medium truncate max-w-[200px]">{fileName}</span>
                    <button onClick={(e) => { e.stopPropagation(); handleReset() }} className="cursor-pointer" aria-label="Cancel upload">
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.2 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground tabular-nums">Uploading... {Math.round(Math.min(progress, 100))}%</p>
                </div>
              )}

              {state === "analyzing" && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="relative">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground">Analyzing Call...</p>
                    <p className="text-xs text-muted-foreground mt-1">Running acoustic, linguistic, and CDR analysis</p>
                  </div>
                  <WaveformVisualizer isActive />
                </div>
              )}
            </motion.div>

            {/* Record button */}
            {(state === "idle" || state === "recording") && (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleRecord}
                className={`w-full rounded-2xl border bg-card p-4 flex items-center gap-4 mb-3 cursor-pointer transition-colors ${
                  state === "recording" ? "border-red-500/30 hover:border-red-500/40" : "border-border hover:border-primary/20"
                }`}
              >
                <div className={`rounded-xl p-3 ${state === "recording" ? "bg-red-500/10" : "bg-rose-500/8"}`}>
                  {state === "recording" ? <MicOff className="w-5 h-5 text-red-400" /> : <Mic className="w-5 h-5 text-rose-400" />}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-semibold text-foreground">{state === "recording" ? "Stop Recording" : "Live Recording"}</p>
                  <p className="text-xs text-muted-foreground">{state === "recording" ? `Recording... ${recordDuration}s` : "Record a call in real-time for analysis"}</p>
                </div>
                {state === "recording" && (
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                  </span>
                )}
              </motion.button>
            )}

            {/* How it works */}
            {state === "idle" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">How It Works</p>
                <div className="flex flex-col gap-3">
                  {[
                    { n: "1", title: "Upload or Record", desc: "Submit call audio for analysis" },
                    { n: "2", title: "AI Processing", desc: "Acoustic, linguistic & CDR pattern analysis" },
                    { n: "3", title: "Get Results", desc: "Fraud vs Legit verdict with confidence score" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-primary">{s.n}</span>
                      </div>
                      <div>
                        <p className="text-[13px] text-foreground font-medium">{s.title}</p>
                        <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
