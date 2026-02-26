"use client"

export function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-background" />
      {/* Subtle top-left glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full blur-[180px] opacity-[0.07]"
        style={{
          background: "radial-gradient(circle, oklch(0.72 0.19 165), transparent 70%)",
          top: "-10%",
          left: "-10%",
          animation: "ambient-shift 25s ease-in-out infinite",
        }}
      />
      {/* Subtle bottom-right glow */}
      <div
        className="absolute w-[400px] h-[400px] rounded-full blur-[160px] opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, oklch(0.6 0.15 260), transparent 70%)",
          bottom: "10%",
          right: "-5%",
          animation: "ambient-shift 30s ease-in-out infinite reverse",
        }}
      />
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(oklch(0.95 0 0) 1px, transparent 1px),
                            linear-gradient(90deg, oklch(0.95 0 0) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  )
}
