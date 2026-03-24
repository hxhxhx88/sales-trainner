'use client'

import { Button } from '@/components/ui/button'

interface MeetingControlsProps {
  isMuted: boolean
  onToggleMute: () => void
  onEndSession: () => void
}

export function MeetingControls({
  isMuted,
  onToggleMute,
  onEndSession,
}: MeetingControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 py-4 bg-zinc-950/80 backdrop-blur">
      {/* Mute Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onToggleMute}
        className={`w-14 h-14 rounded-full p-0 ${
          isMuted
            ? 'bg-red-600 border-red-600 hover:bg-red-700 text-white'
            : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-white'
        }`}
      >
        {isMuted ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
      </Button>

      {/* End Session Button */}
      <Button
        variant="destructive"
        size="lg"
        onClick={onEndSession}
        className="w-14 h-14 rounded-full p-0 bg-red-600 hover:bg-red-700"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
          <line x1="23" y1="1" x2="1" y2="23" />
        </svg>
      </Button>
    </div>
  )
}
