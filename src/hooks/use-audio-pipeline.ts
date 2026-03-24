'use client'

import { useState, useCallback, useRef } from 'react'

interface AudioStreams {
  webrtc: MediaStream
  deepgram: MediaStream
}

interface UseAudioPipelineReturn {
  micStream: MediaStream | null
  webrtcStream: MediaStream | null
  deepgramStream: MediaStream | null
  isReady: boolean
  isMuted: boolean
  error: string | null
  requestMic: () => Promise<AudioStreams>
  toggleMute: () => void
  cleanup: () => void
}

export function useAudioPipeline(): UseAudioPipelineReturn {
  const [micStream, setMicStream] = useState<MediaStream | null>(null)
  const [webrtcStream, setWebrtcStream] = useState<MediaStream | null>(null)
  const [deepgramStream, setDeepgramStream] = useState<MediaStream | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const streamsRef = useRef<{
    mic: MediaStream | null
    webrtc: MediaStream | null
    deepgram: MediaStream | null
  }>({ mic: null, webrtc: null, deepgram: null })

  const requestMic = useCallback(async (): Promise<AudioStreams> => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const rtcStream = stream.clone()
      const dgStream = stream.clone()

      streamsRef.current = { mic: stream, webrtc: rtcStream, deepgram: dgStream }

      setMicStream(stream)
      setWebrtcStream(rtcStream)
      setDeepgramStream(dgStream)
      setIsReady(true)

      return { webrtc: rtcStream, deepgram: dgStream }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow microphone access and try again.'
          : 'Failed to access microphone.'
      setError(message)
      setIsReady(false)
      throw new Error(message)
    }
  }, [])

  const toggleMute = useCallback(() => {
    const { mic, webrtc, deepgram } = streamsRef.current
    const newMuted = !isMuted

    // Mute/unmute tracks across all streams
    ;[mic, webrtc, deepgram].forEach((stream) => {
      stream?.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted
      })
    })

    setIsMuted(newMuted)
  }, [isMuted])

  const cleanup = useCallback(() => {
    const { mic, webrtc, deepgram } = streamsRef.current
    ;[mic, webrtc, deepgram].forEach((stream) => {
      stream?.getTracks().forEach((track) => track.stop())
    })
    streamsRef.current = { mic: null, webrtc: null, deepgram: null }
    setMicStream(null)
    setWebrtcStream(null)
    setDeepgramStream(null)
    setIsReady(false)
    setIsMuted(false)
  }, [])

  return {
    micStream,
    webrtcStream,
    deepgramStream,
    isReady,
    isMuted,
    error,
    requestMic,
    toggleMute,
    cleanup,
  }
}
