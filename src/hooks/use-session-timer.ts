'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TIMER_INTERVAL_MS } from '@/lib/constants'

interface UseSessionTimerReturn {
  timeRemaining: number
  formatted: string
  isExpired: boolean
  progress: number
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSessionTimer(
  durationSeconds: number,
  onExpire: () => void
): UseSessionTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds)
  const [isRunning, setIsRunning] = useState(false)
  const onExpireRef = useRef(onExpire)
  const hasExpiredRef = useRef(false)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const next = prev - 1
        if (next <= 0 && !hasExpiredRef.current) {
          hasExpiredRef.current = true
          clearInterval(interval)
          setTimeout(() => onExpireRef.current(), 0)
          return 0
        }
        return next
      })
    }, TIMER_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [isRunning])

  const minutes = Math.floor(timeRemaining / 60)
  const seconds = timeRemaining % 60
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  const progress = 1 - timeRemaining / durationSeconds

  const start = useCallback(() => {
    hasExpiredRef.current = false
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => setIsRunning(false), [])

  const reset = useCallback(() => {
    setIsRunning(false)
    setTimeRemaining(durationSeconds)
    hasExpiredRef.current = false
  }, [durationSeconds])

  return {
    timeRemaining,
    formatted,
    isExpired: timeRemaining <= 0,
    progress,
    start,
    stop,
    reset,
  }
}
