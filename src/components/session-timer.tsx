'use client'

interface SessionTimerProps {
  formatted: string
  timeRemaining: number
}

export function SessionTimer({ formatted, timeRemaining }: SessionTimerProps) {
  const isWarning = timeRemaining <= 60
  const isCritical = timeRemaining <= 30

  return (
    <div
      className={`absolute top-4 right-4 px-4 py-2 rounded-lg font-mono text-lg font-bold select-none ${
        isCritical
          ? 'bg-red-600/20 text-red-400 animate-pulse'
          : isWarning
            ? 'bg-red-600/10 text-red-400'
            : 'bg-zinc-800/80 text-zinc-300'
      }`}
    >
      {formatted}
    </div>
  )
}
