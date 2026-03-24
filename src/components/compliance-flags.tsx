'use client'

import { Badge } from '@/components/ui/badge'
import type { ComplianceFlag } from '@/lib/types'

interface ComplianceFlagsProps {
  flags: ComplianceFlag[]
}

export function ComplianceFlags({ flags }: ComplianceFlagsProps) {
  if (flags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-green-500 mb-3"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
        <p className="text-green-400 font-semibold text-lg">合规通过</p>
        <p className="text-zinc-500 text-sm mt-1">未发现合规违规问题</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2 mb-2">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-red-400"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span className="text-red-400 font-semibold">
          发现 {flags.length} 个合规问题
        </span>
      </div>

      {flags.map((flag) => (
        <div
          key={flag.id}
          className={`rounded-lg p-4 ${
            flag.severity === 'violation'
              ? 'bg-red-900/20 border border-red-800/50'
              : 'bg-yellow-900/20 border border-yellow-800/50'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Badge
              className={
                flag.severity === 'violation'
                  ? 'bg-red-600 text-white'
                  : 'bg-yellow-600 text-white'
              }
            >
              {flag.severity === 'violation' ? '违规' : '警告'}
            </Badge>
            <span className="text-sm font-medium text-zinc-200">
              {flag.message.zh}
            </span>
          </div>
          {flag.matchedText && (
            <blockquote className="border-l-2 border-zinc-600 pl-3 mt-2 text-sm text-zinc-400 italic">
              &ldquo;{flag.matchedText}&rdquo;
            </blockquote>
          )}
          <p className="text-xs text-zinc-500 mt-2">{flag.message.en}</p>
        </div>
      ))}
    </div>
  )
}
