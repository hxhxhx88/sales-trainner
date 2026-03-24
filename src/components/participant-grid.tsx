'use client'

import type { Persona } from '@/lib/types'

interface ParticipantGridProps {
  persona: Persona
  isAISpeaking: boolean
  isMuted: boolean
}

export function ParticipantGrid({
  persona,
  isAISpeaking,
  isMuted,
}: ParticipantGridProps) {
  return (
    <div className="flex-1 flex items-center justify-center gap-4 p-4">
      {/* AI Participant */}
      <div className="w-[400px] h-[300px] bg-zinc-900 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
        {/* Speaking indicator ring */}
        <div
          className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold transition-all duration-300 ${
            isAISpeaking
              ? 'ring-4 ring-green-500 ring-offset-2 ring-offset-zinc-900 scale-105'
              : ''
          }`}
          style={{ backgroundColor: persona.avatarColor }}
        >
          {persona.name.zh.charAt(0)}
        </div>
        <p className="text-white mt-4 font-medium text-lg">{persona.name.zh}</p>
        <p className="text-zinc-500 text-sm">{persona.name.en}</p>

        {/* Camera off indicator */}
        <div className="absolute bottom-3 left-3 text-zinc-600 text-xs flex items-center gap-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16.5 9.4l-2-1.3a1 1 0 0 0-1.5.9v6a1 1 0 0 0 1.5.9l2-1.3a1 1 0 0 0 0-1.7" />
            <rect x="2" y="6" width="12" height="12" rx="2" />
            <line x1="2" y1="2" x2="22" y2="22" />
          </svg>
        </div>

        {isAISpeaking && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            <div className="w-1 h-3 bg-green-500 rounded-full animate-pulse" />
            <div className="w-1 h-4 bg-green-500 rounded-full animate-pulse [animation-delay:0.1s]" />
            <div className="w-1 h-2 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]" />
          </div>
        )}
      </div>

      {/* User Participant */}
      <div className="w-[400px] h-[300px] bg-zinc-900 rounded-xl flex flex-col items-center justify-center relative">
        <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center text-white text-3xl font-bold">
          你
        </div>
        <p className="text-white mt-4 font-medium text-lg">你（理财顾问）</p>

        {/* Mic status */}
        <div className="absolute bottom-3 right-3">
          {isMuted ? (
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
                <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.13 1.49-.35 2.17" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-1 h-2 bg-blue-400 rounded-full animate-pulse" />
              <div className="w-1 h-3 bg-blue-400 rounded-full animate-pulse [animation-delay:0.15s]" />
              <div className="w-1 h-2 bg-blue-400 rounded-full animate-pulse [animation-delay:0.3s]" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
