'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PERSONAS } from '@/lib/personas'
import type { Persona, Difficulty } from '@/lib/types'

const difficultyColor: Record<Difficulty, string> = {
  beginner: 'bg-green-600',
  intermediate: 'bg-yellow-600',
  advanced: 'bg-red-600',
}

const difficultyLabel: Record<Difficulty, string> = {
  beginner: '入门',
  intermediate: '中级',
  advanced: '高级',
}

interface MeetingLobbyProps {
  selectedPersona: Persona | null
  onSelectPersona: (persona: Persona) => void
  onJoin: () => void
}

export function MeetingLobby({
  selectedPersona,
  onSelectPersona,
  onJoin,
}: MeetingLobbyProps) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AI 销售模拟训练</h1>
          <p className="text-zinc-400">
            选择一位客户角色，开始模拟销售对话练习
          </p>
        </div>

        {/* Persona Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {PERSONAS.map((persona) => (
            <Card
              key={persona.id}
              className={`cursor-pointer transition-all duration-200 bg-zinc-900 border-2 hover:border-zinc-600 ${
                selectedPersona?.id === persona.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'border-zinc-800'
              }`}
              onClick={() => onSelectPersona(persona)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0"
                    style={{ backgroundColor: persona.avatarColor }}
                  >
                    {persona.name.zh.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold text-lg">
                        {persona.name.zh}
                      </h3>
                      <Badge
                        className={`${difficultyColor[persona.difficulty]} text-white text-xs`}
                      >
                        {difficultyLabel[persona.difficulty]}
                      </Badge>
                    </div>
                    <p className="text-sm text-zinc-400 mb-2">
                      {persona.name.en}
                    </p>
                    <p className="text-sm text-zinc-300 leading-relaxed">
                      {persona.description.zh}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {persona.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            disabled={!selectedPersona}
            onClick={onJoin}
            className="px-12 py-6 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            加入会议
          </Button>
        </div>

        {selectedPersona && (
          <p className="text-center text-zinc-500 mt-3 text-sm">
            即将与 {selectedPersona.name.zh} 进行模拟对话
          </p>
        )}
      </div>
    </div>
  )
}
