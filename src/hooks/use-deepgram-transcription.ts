'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TranscriptEntry } from '@/lib/types'
import { MEDIA_RECORDER_TIMESLICE_MS } from '@/lib/constants'

interface UseDeepgramTranscriptionReturn {
  startRecording: (audioStream: MediaStream) => void
  stopRecording: () => void
  transcribe: () => Promise<TranscriptEntry[]>
  transcriptEntries: TranscriptEntry[]
  isRecording: boolean
}

/**
 * Records planner audio locally via MediaRecorder.
 * After session ends, sends the recording to server-side /api/transcribe
 * which calls Deepgram's pre-recorded API (avoids browser WebSocket auth issues).
 */
export function useDeepgramTranscription(): UseDeepgramTranscriptionReturn {
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const sessionStartRef = useRef<number>(0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startRecording = useCallback((audioStream: MediaStream) => {
    chunksRef.current = []
    sessionStartRef.current = Date.now()
    setTranscriptEntries([])

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : 'audio/webm'

    const recorder = new MediaRecorder(audioStream, { mimeType })
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    recorder.start(MEDIA_RECORDER_TIMESLICE_MS)
    setIsRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    recorderRef.current = null
    setIsRecording(false)
  }, [])

  const transcribe = useCallback(async (): Promise<TranscriptEntry[]> => {
    const chunks = chunksRef.current
    if (chunks.length === 0) return []

    const audioBlob = new Blob(chunks, { type: 'audio/webm;codecs=opus' })

    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.webm')

    const res = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      console.error('Transcription failed:', res.status, await res.text())
      return []
    }

    const data = await res.json()
    const entries: TranscriptEntry[] = (data.entries || []).map(
      (e: { text: string; start: number; confidence: number }, i: number) => ({
        id: `planner-${i + 1}`,
        speaker: 'planner' as const,
        text: e.text,
        timestamp: e.start,
        confidence: e.confidence,
        isFinal: true,
      })
    )

    setTranscriptEntries(entries)
    return entries
  }, [])

  return {
    startRecording,
    stopRecording,
    transcribe,
    transcriptEntries,
    isRecording,
  }
}
