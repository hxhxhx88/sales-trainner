'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useSession } from '@/contexts/session-context'
import { useAudioPipeline } from './use-audio-pipeline'
import { useWebRTCSession } from './use-webrtc-session'
import { useDeepgramTranscription } from './use-deepgram-transcription'
import { useSessionTimer } from './use-session-timer'
import { SESSION_DURATION_SECONDS } from '@/lib/constants'
import type { TranscriptEntry, ComplianceFlag, SessionOutcome } from '@/lib/types'

export function useSessionStore() {
  const session = useSession()
  const audio = useAudioPipeline()
  const webrtc = useWebRTCSession()
  const deepgram = useDeepgramTranscription()
  const endingRef = useRef(false)

  // Keep refs to latest values for use in async callbacks
  const buyerEntriesRef = useRef(webrtc.buyerTranscriptEntries)
  buyerEntriesRef.current = webrtc.buyerTranscriptEntries
  const timerRef = useRef(0)
  timerRef.current = 0
  const personaRef = useRef(session.selectedPersona)
  personaRef.current = session.selectedPersona
  // Ref to deepgram's transcribe function (stable)
  const transcribeRef = useRef(deepgram.transcribe)
  transcribeRef.current = deepgram.transcribe

  const handleExpire = useCallback(() => {
    if (!endingRef.current) {
      handleEndSession('timeout')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const timer = useSessionTimer(SESSION_DURATION_SECONDS, handleExpire)

  // Keep timer ref up to date
  timerRef.current = timer.timeRemaining

  // Sync buyer transcript entries to context
  useEffect(() => {
    if (webrtc.buyerTranscriptEntries.length > 0) {
      const latest =
        webrtc.buyerTranscriptEntries[webrtc.buyerTranscriptEntries.length - 1]
      session.addBuyerEntry(latest)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webrtc.buyerTranscriptEntries.length])

  // Auto-end on buy decision (win)
  useEffect(() => {
    if (webrtc.buyDecision && !endingRef.current) {
      handleEndSession('win')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webrtc.buyDecision])

  // Transition to 'active' when WebRTC is connected
  useEffect(() => {
    if (webrtc.connectionState === 'connected' && session.phase === 'connecting') {
      session.setPhase('active')
      timer.start()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [webrtc.connectionState])

  const handleStartSession = useCallback(async () => {
    if (!session.selectedPersona) return

    endingRef.current = false
    session.startSession()
    timer.reset()

    try {
      // requestMic returns streams directly — no need to wait for re-render
      const streams = await audio.requestMic()

      // Start recording for post-session transcription (Pipeline B)
      deepgram.startRecording(streams.deepgram)

      // Connect WebRTC (Pipeline A)
      await webrtc.connect(streams.webrtc, session.selectedPersona!.id)
    } catch (error) {
      console.error('Session start error:', error)
      session.setError(
        error instanceof Error ? error.message : 'Failed to connect. Please try again.'
      )
      session.setPhase('lobby')
      deepgram.stopRecording()
      audio.cleanup()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.selectedPersona])

  const handleEndSession = useCallback(
    async (outcome: SessionOutcome) => {
      if (endingRef.current) return
      endingRef.current = true

      timer.stop()
      session.endSession(outcome)

      // Stop recording and disconnect WebRTC
      deepgram.stopRecording()
      webrtc.disconnect()
      audio.cleanup()

      const persona = personaRef.current

      try {
        // Transcribe the recorded audio via server-side Deepgram API
        const plannerEntries = await transcribeRef.current()

        // Get buyer entries from WebRTC data channel
        const buyerEntries = buyerEntriesRef.current

        // Merge transcripts
        const merged = mergeTranscripts(plannerEntries, buyerEntries)

        if (merged.length > 0 && persona) {
          // Grade the session
          const res = await fetch('/api/grade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcript: merged,
              personaId: persona.id,
              durationSeconds: SESSION_DURATION_SECONDS - timerRef.current,
              outcome,
            }),
          })

          if (!res.ok) throw new Error('Grading failed')

          const result = await res.json()

          const complianceFlags: ComplianceFlag[] = (result.complianceFlags || []).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (flag: any, index: number) => ({
              id: `flag-${index}`,
              ruleId: flag.ruleId,
              severity: flag.severity,
              message: flag.message,
              matchedText: flag.matchedText,
              timestamp: 0,
              transcriptEntryId: '',
            })
          )

          session.setGradingResult(
            {
              sessionId: `session-${Date.now()}`,
              overallScore: result.overallScore,
              grade: result.grade,
              rubrics: result.rubrics,
              strengths: result.strengths,
              improvements: result.improvements,
              compliancePassed: result.compliancePassed,
              summary: result.summary,
            },
            complianceFlags,
            merged
          )
        } else {
          session.setGradingResult(
            {
              sessionId: `session-${Date.now()}`,
              overallScore: 0,
              grade: 'F',
              rubrics: [],
              strengths: [],
              improvements: ['No conversation was recorded.'],
              compliancePassed: false,
              summary: 'No transcript available for grading.',
            },
            [],
            merged
          )
        }
      } catch (error) {
        console.error('Transcription/grading error:', error)
        session.setGradingResult(
          {
            sessionId: `session-${Date.now()}`,
            overallScore: 0,
            grade: 'F',
            rubrics: [],
            strengths: [],
            improvements: ['Grading failed. Please try again.'],
            compliancePassed: false,
            summary: 'Unable to grade this session. Please try again.',
          },
          [],
          []
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return {
    // Session state (from context)
    phase: session.phase,
    selectedPersona: session.selectedPersona,
    mergedTranscript: session.mergedTranscript,
    scorecard: session.scorecard,
    complianceFlags: session.complianceFlags,
    outcome: session.outcome,
    error: session.error || audio.error,

    // Timer
    timeRemaining: timer.timeRemaining,
    timerFormatted: timer.formatted,
    timerProgress: timer.progress,

    // Audio
    isMuted: audio.isMuted,
    toggleMute: audio.toggleMute,

    // WebRTC
    connectionState: webrtc.connectionState,
    isAISpeaking: webrtc.isAISpeaking,
    audioRef: webrtc.audioRef,

    // Actions
    selectPersona: session.selectPersona,
    startSession: handleStartSession,
    endSession: handleEndSession,
    reset: session.reset,
  }
}

function mergeTranscripts(
  plannerEntries: TranscriptEntry[],
  buyerEntries: TranscriptEntry[]
): TranscriptEntry[] {
  return [...plannerEntries.filter((e) => e.isFinal), ...buyerEntries.filter((e) => e.isFinal)]
    .sort((a, b) => a.timestamp - b.timestamp)
}
