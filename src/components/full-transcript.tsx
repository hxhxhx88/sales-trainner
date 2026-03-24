'use client'

import { ScrollArea } from '@/components/ui/scroll-area'
import type { TranscriptEntry } from '@/lib/types'

interface FullTranscriptProps {
  entries: TranscriptEntry[]
  flaggedEntryIds?: Set<string>
}

export function FullTranscript({ entries, flaggedEntryIds }: FullTranscriptProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-12">
        没有录到对话内容
      </div>
    )
  }

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-3 p-4">
        {entries.map((entry) => {
          const isFlagged = flaggedEntryIds?.has(entry.id)
          const isPlanner = entry.speaker === 'planner'
          const minutes = Math.floor(entry.timestamp / 60)
          const seconds = Math.floor(entry.timestamp % 60)
          const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

          return (
            <div
              key={entry.id}
              className={`flex ${isPlanner ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 ${
                  isFlagged
                    ? 'ring-2 ring-red-500/50'
                    : ''
                } ${
                  isPlanner
                    ? 'bg-blue-900/30 text-blue-100'
                    : 'bg-zinc-800 text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs font-semibold ${
                      isPlanner ? 'text-blue-400' : 'text-green-400'
                    }`}
                  >
                    {isPlanner ? '理财顾问' : '客户'}
                  </span>
                  <span className="text-xs text-zinc-500">{time}</span>
                  {isFlagged && (
                    <span className="text-xs text-red-400 font-medium">
                      违规
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed">{entry.text}</p>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
