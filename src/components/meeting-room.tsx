'use client'

import { ParticipantGrid } from './participant-grid'
import { MeetingControls } from './meeting-controls'
import { SessionTimer } from './session-timer'
import type { Persona } from '@/lib/types'

interface MeetingRoomProps {
  persona: Persona
  isAISpeaking: boolean
  isMuted: boolean
  timerFormatted: string
  timeRemaining: number
  onToggleMute: () => void
  onEndSession: () => void
}

export function MeetingRoom({
  persona,
  isAISpeaking,
  isMuted,
  timerFormatted,
  timeRemaining,
  onToggleMute,
  onEndSession,
}: MeetingRoomProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative">
      {/* Timer */}
      <SessionTimer formatted={timerFormatted} timeRemaining={timeRemaining} />

      {/* Participants */}
      <ParticipantGrid
        persona={persona}
        isAISpeaking={isAISpeaking}
        isMuted={isMuted}
      />

      {/* Controls */}
      <MeetingControls
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onEndSession={onEndSession}
      />
    </div>
  )
}
