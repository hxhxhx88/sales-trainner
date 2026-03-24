'use client'

import { useSessionStore } from '@/hooks/use-session-store'
import { MeetingLobby } from '@/components/meeting-lobby'
import { MeetingRoom } from '@/components/meeting-room'
import { ReviewPage } from '@/components/review-page'

export default function Home() {
  const store = useSessionStore()

  // Lobby
  if (store.phase === 'lobby') {
    return (
      <MeetingLobby
        selectedPersona={store.selectedPersona}
        onSelectPersona={store.selectPersona}
        onJoin={store.startSession}
      />
    )
  }

  // Connecting
  if (store.phase === 'connecting') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <audio ref={store.audioRef} autoPlay playsInline />
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-300 text-lg">正在连接会议...</p>
          <p className="text-zinc-500 text-sm">Connecting to meeting...</p>
        </div>
        {store.error && (
          <p className="text-red-400 mt-4 text-sm">{store.error}</p>
        )}
      </div>
    )
  }

  // Active session
  if (store.phase === 'active' && store.selectedPersona) {
    return (
      <MeetingRoom
        persona={store.selectedPersona}
        isAISpeaking={store.isAISpeaking}
        isMuted={store.isMuted}
        timerFormatted={store.timerFormatted}
        timeRemaining={store.timeRemaining}
        audioRef={store.audioRef}
        onToggleMute={store.toggleMute}
        onEndSession={() => store.endSession('lose')}
      />
    )
  }

  // Grading
  if (store.phase === 'grading') {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-300 text-lg">正在分析你的表现...</p>
          <p className="text-zinc-500 text-sm">Analyzing your performance...</p>
        </div>
      </div>
    )
  }

  // Review
  if (store.phase === 'review' && store.outcome) {
    return (
      <ReviewPage
        outcome={store.outcome}
        transcript={store.mergedTranscript}
        complianceFlags={store.complianceFlags}
        scorecard={store.scorecard}
        onTryAgain={store.startSession}
        onNewScenario={store.reset}
      />
    )
  }

  return null
}
