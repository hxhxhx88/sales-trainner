'use client'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScorecardRubric } from './scorecard-rubric'
import type { Scorecard as ScorecardType } from '@/lib/types'

interface ScorecardProps {
  scorecard: ScorecardType
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A':
      return 'text-green-400'
    case 'B':
      return 'text-blue-400'
    case 'C':
      return 'text-yellow-400'
    case 'D':
      return 'text-orange-400'
    default:
      return 'text-red-400'
  }
}

export function Scorecard({ scorecard }: ScorecardProps) {
  return (
    <div className="p-4 space-y-6">
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getGradeColor(scorecard.grade)}`}>
              {scorecard.grade}
            </div>
            <div className="text-xs text-zinc-500 mt-1">等级</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-zinc-200">
              {scorecard.overallScore}
            </div>
            <div className="text-xs text-zinc-500 mt-1">总分 / 100</div>
          </div>
        </div>
        <Badge
          className={
            scorecard.compliancePassed
              ? 'bg-green-900/50 text-green-400 border-green-700'
              : 'bg-red-900/50 text-red-400 border-red-700'
          }
        >
          {scorecard.compliancePassed ? '合规通过' : '合规未通过'}
        </Badge>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Rubrics */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-4">评分详情</h3>
        <div className="space-y-5">
          {scorecard.rubrics.map((rubric) => (
            <ScorecardRubric key={rubric.dimension} rubric={rubric} />
          ))}
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* Strengths */}
      {scorecard.strengths.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-green-400 mb-3">做得好的方面</h3>
          <ul className="space-y-2">
            {scorecard.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-green-500 mt-0.5 shrink-0"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Improvements */}
      {scorecard.improvements.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-yellow-400 mb-3">
            需要改进的方面
          </h3>
          <ul className="space-y-2">
            {scorecard.improvements.map((imp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-yellow-500 mt-0.5 shrink-0"
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                {imp}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Separator className="bg-zinc-800" />

      {/* Summary */}
      <div>
        <h3 className="text-sm font-semibold text-zinc-400 mb-2">总体评价</h3>
        <p className="text-sm text-zinc-300 leading-relaxed">
          {scorecard.summary}
        </p>
      </div>
    </div>
  )
}
