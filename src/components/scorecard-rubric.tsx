'use client'

import { Progress } from '@/components/ui/progress'
import type { RubricScore } from '@/lib/types'

interface ScorecardRubricProps {
  rubric: RubricScore
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-400'
  if (score >= 60) return 'text-yellow-400'
  return 'text-red-400'
}

function getProgressClass(score: number): string {
  if (score >= 80) return '[&>div]:bg-green-500'
  if (score >= 60) return '[&>div]:bg-yellow-500'
  return '[&>div]:bg-red-500'
}

export function ScorecardRubric({ rubric }: ScorecardRubricProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200">
            {rubric.dimension}
          </span>
          <span className="text-xs text-zinc-500">({rubric.weight}%)</span>
        </div>
        <span className={`text-sm font-bold ${getScoreColor(rubric.score)}`}>
          {rubric.score}
        </span>
      </div>
      <Progress
        value={rubric.score}
        className={`h-2 bg-zinc-800 ${getProgressClass(rubric.score)}`}
      />
      {rubric.feedback && (
        <p className="text-xs text-zinc-400 leading-relaxed">{rubric.feedback}</p>
      )}
    </div>
  )
}
