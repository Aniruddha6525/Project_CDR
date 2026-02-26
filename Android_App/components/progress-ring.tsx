"use client"

import { useEffect, useRef } from "react"

interface ThreatRingProps {
  value: number
  max: number
  size?: number
  strokeWidth?: number
  color: string
  label: string
}

export function ThreatRing({
  value,
  max,
  size = 76,
  strokeWidth = 5,
  color,
  label,
}: ThreatRingProps) {
  const circleRef = useRef<SVGCircleElement>(null)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(value / max, 1)
  const offset = circumference - progress * circumference

  useEffect(() => {
    const circle = circleRef.current
    if (circle) {
      circle.style.strokeDasharray = `${circumference}`
      circle.style.strokeDashoffset = `${circumference}`
      circle.getBoundingClientRect()
      circle.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
      circle.style.strokeDashoffset = `${offset}`
    }
  }, [circumference, offset])

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" role="img" aria-label={`${label}: ${value}%`}>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" className="text-secondary" strokeWidth={strokeWidth} />
          <circle
            ref={circleRef}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground tabular-nums">
          {Math.round(progress * 100)}%
        </span>
      </div>
      <span className="text-[10px] text-muted-foreground font-medium text-center leading-tight max-w-[70px]">{label}</span>
    </div>
  )
}
