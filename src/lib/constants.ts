export const SESSION_DURATION_SECONDS = 300 // 5 minutes
export const TIMER_INTERVAL_MS = 1000
export const SUCCESS_SIGNAL = '__SUCCESS__'
export const MEDIA_RECORDER_TIMESLICE_MS = 250

// Models — use latest available
export const OPENAI_REALTIME_MODEL = 'gpt-4o-realtime-preview'
export const OPENAI_GRADING_MODEL = 'gpt-4o'
export const DEEPGRAM_MODEL = 'nova-2'

// WebRTC
export const STUN_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }]

// VAD settings for OpenAI Realtime — tuned for natural conversation
export const VAD_CONFIG = {
  type: 'server_vad' as const,
  threshold: 0.4,
  prefix_padding_ms: 200,
  silence_duration_ms: 300,
  create_response: true,
}
