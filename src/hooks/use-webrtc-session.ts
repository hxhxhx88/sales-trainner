'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TranscriptEntry } from '@/lib/types'
import { SUCCESS_SIGNAL, STUN_SERVERS } from '@/lib/constants'

type ConnectionState = 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed'

interface UseWebRTCSessionReturn {
  connect: (audioStream: MediaStream, personaId: string) => Promise<void>
  disconnect: () => void
  connectionState: ConnectionState
  isAISpeaking: boolean
  buyerTranscriptEntries: TranscriptEntry[]
  buyDecision: boolean
  audioRef: React.RefObject<HTMLAudioElement | null>
}

export function useWebRTCSession(): UseWebRTCSessionReturn {
  const [connectionState, setConnectionState] = useState<ConnectionState>('new')
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [buyerTranscriptEntries, setBuyerTranscriptEntries] = useState<TranscriptEntry[]>([])
  const [buyDecision, setBuyDecision] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)
  const dcRef = useRef<RTCDataChannel | null>(null)
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
    if (dcRef.current) {
      dcRef.current.close()
      dcRef.current = null
    }
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
    setConnectionState('disconnected')
    setIsAISpeaking(false)
  }, [])

  const connect = useCallback(
    async (audioStream: MediaStream, personaId: string) => {
      try {
        setConnectionState('connecting')
        setBuyerTranscriptEntries([])
        setBuyDecision(false)
        sessionStartRef.current = Date.now()
        entryCountRef.current = 0

        // 1. Get ephemeral token
        const tokenRes = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ personaId }),
        })

        if (!tokenRes.ok) {
          throw new Error(`Token request failed: ${tokenRes.status}`)
        }

        const { client_secret } = await tokenRes.json()
        const ephemeralKey = client_secret.value

        // 2. Create RTCPeerConnection
        const pc = new RTCPeerConnection({ iceServers: STUN_SERVERS })
        pcRef.current = pc

        // 3. Add audio track
        const audioTrack = audioStream.getAudioTracks()[0]
        if (!audioTrack) throw new Error('No audio track available')
        pc.addTrack(audioTrack, audioStream)

        // 4. Set up remote audio playback
        pc.ontrack = (event) => {
          if (audioRef.current && event.streams[0]) {
            audioRef.current.srcObject = event.streams[0]
            audioRef.current.play().catch((e) => {
              console.warn('Audio autoplay failed:', e)
            })
          }
        }

        // 5. Create data channel
        const dc = pc.createDataChannel('oai-events')
        dcRef.current = dc

        dc.onopen = () => {
          console.log('Data channel opened')
        }

        dc.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            handleDataChannelEvent(msg)
          } catch {
            // Ignore non-JSON messages
          }
        }

        // 6. Monitor connection state
        pc.oniceconnectionstatechange = () => {
          const iceState = pc.iceConnectionState
          if (iceState === 'connected' || iceState === 'completed') {
            setConnectionState('connected')
          } else if (iceState === 'failed') {
            setConnectionState('failed')
          } else if (iceState === 'disconnected') {
            setConnectionState('disconnected')
          }
        }

        // 7. Create and set local offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        // 8. Send SDP to OpenAI Realtime
        const sdpRes = await fetch(
          `https://api.openai.com/v1/realtime?model=${encodeURIComponent(
            'gpt-4o-realtime-preview'
          )}`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${ephemeralKey}`,
              'Content-Type': 'application/sdp',
            },
            body: offer.sdp,
          }
        )

        if (!sdpRes.ok) {
          throw new Error(`SDP exchange failed: ${sdpRes.status}`)
        }

        const answerSdp = await sdpRes.text()
        await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })
      } catch (error) {
        console.error('WebRTC connection error:', error)
        setConnectionState('failed')
        throw error
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  function handleDataChannelEvent(msg: Record<string, unknown>) {
    const type = msg.type as string

    switch (type) {
      case 'response.audio_transcript.done': {
        // Final buyer transcript for a response turn
        const text = msg.transcript as string
        if (text) {
          const timestamp = (Date.now() - sessionStartRef.current) / 1000
          const entry: TranscriptEntry = {
            id: `buyer-${++entryCountRef.current}`,
            speaker: 'buyer',
            text,
            timestamp,
            isFinal: true,
          }
          setBuyerTranscriptEntries((prev) => [...prev, entry])

          // Check for buy decision
          if (text.includes(SUCCESS_SIGNAL)) {
            setBuyDecision(true)
          }
        }
        break
      }
      case 'response.audio.started':
      case 'output_audio_buffer.started':
        setIsAISpeaking(true)
        break
      case 'response.audio.done':
      case 'output_audio_buffer.stopped':
      case 'response.done':
        setIsAISpeaking(false)
        break
      case 'response.text.done': {
        // Text-only response (may contain __SUCCESS__)
        const text = (msg.text as string) || ''
        if (text.includes(SUCCESS_SIGNAL)) {
          setBuyDecision(true)
        }
        break
      }
    }
  }

  return {
    connect,
    disconnect,
    connectionState,
    isAISpeaking,
    buyerTranscriptEntries,
    buyDecision,
    audioRef,
  }
}
