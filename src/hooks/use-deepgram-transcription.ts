'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TranscriptEntry } from '@/lib/types'
import { MEDIA_RECORDER_TIMESLICE_MS, DEEPGRAM_MODEL } from '@/lib/constants'
import { buildDeepgramKeywordParams } from '@/lib/hk-insurance-vocab'

interface UseDeepgramTranscriptionReturn {
  connect: (audioStream: MediaStream) => Promise<void>
  disconnect: () => void
  transcriptEntries: TranscriptEntry[]
  isConnected: boolean
}

export function useDeepgramTranscription(): UseDeepgramTranscriptionReturn {
  const [transcriptEntries, setTranscriptEntries] = useState<TranscriptEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)

  const wsRef = useRef<WebSocket | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const sessionStartRef = useRef<number>(0)
  const entryCountRef = useRef(0)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const disconnect = useCallback(() => {
    // Stop MediaRecorder
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
    recorderRef.current = null

    // Close WebSocket
    if (wsRef.current) {
      if (wsRef.current.readyState === WebSocket.OPEN) {
        // Send close frame to Deepgram to finalize any remaining audio
        wsRef.current.send(JSON.stringify({ type: 'CloseStream' }))
      }
      wsRef.current.close()
      wsRef.current = null
    }

    setIsConnected(false)
  }, [])

  const connect = useCallback(async (audioStream: MediaStream) => {
    try {
      setTranscriptEntries([])
      sessionStartRef.current = Date.now()
      entryCountRef.current = 0

      // 1. Get Deepgram token
      const tokenRes = await fetch('/api/deepgram-token')
      if (!tokenRes.ok) throw new Error('Failed to get Deepgram token')
      const { token } = await tokenRes.json()

      // 2. Build WebSocket URL
      const keywordParams = buildDeepgramKeywordParams()
      const wsUrl = `wss://api.deepgram.com/v1/listen?model=${DEEPGRAM_MODEL}&language=zh&punctuate=true&interim_results=false&smart_format=true&endpointing=300&${keywordParams}`

      // 3. Open WebSocket
      const ws = new WebSocket(wsUrl, ['token', token])
      wsRef.current = ws

      await new Promise<void>((resolve, reject) => {
        ws.onopen = () => {
          setIsConnected(true)
          resolve()
        }
        ws.onerror = (e) => {
          console.error('Deepgram WebSocket error:', e)
          reject(new Error('Deepgram connection failed'))
        }
        // Timeout after 10 seconds
        setTimeout(() => reject(new Error('Deepgram connection timeout')), 10000)
      })

      // 4. Handle incoming transcripts
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'Results' && data.is_final) {
            const transcript = data.channel?.alternatives?.[0]?.transcript
            const confidence = data.channel?.alternatives?.[0]?.confidence
            if (transcript && transcript.trim()) {
              const timestamp = (Date.now() - sessionStartRef.current) / 1000
              const entry: TranscriptEntry = {
                id: `planner-${++entryCountRef.current}`,
                speaker: 'planner',
                text: transcript.trim(),
                timestamp,
                confidence,
                isFinal: true,
              }
              setTranscriptEntries((prev) => [...prev, entry])
            }
          }
        } catch {
          // Ignore non-JSON messages
        }
      }

      ws.onclose = () => {
        setIsConnected(false)
      }

      // 5. Start MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const recorder = new MediaRecorder(audioStream, { mimeType })
      recorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(e.data)
        }
      }

      recorder.start(MEDIA_RECORDER_TIMESLICE_MS)
    } catch (error) {
      console.error('Deepgram connection error:', error)
      setIsConnected(false)
      throw error
    }
  }, [])

  return {
    connect,
    disconnect,
    transcriptEntries,
    isConnected,
  }
}
