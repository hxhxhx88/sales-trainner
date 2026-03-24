'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { OutcomeBanner } from './outcome-banner'
import { FullTranscript } from './full-transcript'
import { ComplianceFlags } from './compliance-flags'
import { Scorecard } from './scorecard'
import type {
  SessionOutcome,
  TranscriptEntry,
  ComplianceFlag,
  Scorecard as ScorecardType,
} from '@/lib/types'

interface ReviewPageProps {
  outcome: SessionOutcome
  transcript: TranscriptEntry[]
  complianceFlags: ComplianceFlag[]
  scorecard: ScorecardType | null
  onTryAgain: () => void
  onNewScenario: () => void
}

export function ReviewPage({
  outcome,
  transcript,
  complianceFlags,
  scorecard,
  onTryAgain,
  onNewScenario,
}: ReviewPageProps) {
  const flaggedEntryIds = new Set(
    complianceFlags.map((f) => f.transcriptEntryId).filter(Boolean)
  )

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-1">会话回顾</h1>
          <p className="text-zinc-500 text-sm">Session Review</p>
        </div>

        {/* Outcome Banner */}
        <OutcomeBanner outcome={outcome} />

        {/* Tabs */}
        <Tabs defaultValue="scorecard" className="w-full">
          <TabsList className="w-full bg-zinc-900 border border-zinc-800">
            <TabsTrigger
              value="scorecard"
              className="flex-1 data-[state=active]:bg-zinc-800"
            >
              评分卡
            </TabsTrigger>
            <TabsTrigger
              value="transcript"
              className="flex-1 data-[state=active]:bg-zinc-800"
            >
              对话记录
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="flex-1 data-[state=active]:bg-zinc-800"
            >
              合规检查
              {complianceFlags.length > 0 && (
                <span className="ml-2 w-5 h-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center">
                  {complianceFlags.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scorecard" className="bg-zinc-900 rounded-lg border border-zinc-800 mt-4">
            {scorecard ? (
              <Scorecard scorecard={scorecard} />
            ) : (
              <div className="text-center text-zinc-500 py-12">
                评分数据不可用
              </div>
            )}
          </TabsContent>

          <TabsContent value="transcript" className="bg-zinc-900 rounded-lg border border-zinc-800 mt-4">
            <FullTranscript entries={transcript} flaggedEntryIds={flaggedEntryIds} />
          </TabsContent>

          <TabsContent value="compliance" className="bg-zinc-900 rounded-lg border border-zinc-800 mt-4">
            <ComplianceFlags flags={complianceFlags} />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onTryAgain}
            className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800"
          >
            再试一次
          </Button>
          <Button
            size="lg"
            onClick={onNewScenario}
            className="bg-blue-600 hover:bg-blue-700"
          >
            选择新场景
          </Button>
        </div>
      </div>
    </div>
  )
}
