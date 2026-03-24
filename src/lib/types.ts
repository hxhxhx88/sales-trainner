import { z } from 'zod'

// --- Session Phase & Outcome ---

export type SessionPhase = 'lobby' | 'connecting' | 'active' | 'grading' | 'review'
export type SessionOutcome = 'win' | 'lose' | 'timeout'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type ProductFocus = 'life' | 'medical' | 'savings' | 'investment' | 'general'

// --- Persona ---

export interface Persona {
  id: string
  name: { en: string; zh: string }
  avatarColor: string
  description: { en: string; zh: string }
  difficulty: Difficulty
  language: 'mandarin'
  tags: string[]
  systemPrompt: string
  voiceId: string
  objectionPatterns: string[]
  productFocus: ProductFocus
  buySignalThreshold: string
}

// --- Transcript ---

export interface TranscriptEntry {
  id: string
  speaker: 'planner' | 'buyer'
  text: string
  timestamp: number
  language?: string
  confidence?: number
  isFinal: boolean
}

// --- Compliance ---

export interface ComplianceRule {
  id: string
  name: string
  description: string
  severity: 'warning' | 'violation'
  message: { en: string; zh: string }
}

export interface ComplianceFlag {
  id: string
  ruleId: string
  severity: 'warning' | 'violation'
  message: { en: string; zh: string }
  matchedText: string
  timestamp: number
  transcriptEntryId: string
}

// --- Scorecard ---

export interface RubricScore {
  dimension: string
  score: number
  weight: number
  feedback: string
}

export interface Scorecard {
  sessionId: string
  overallScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  rubrics: RubricScore[]
  strengths: string[]
  improvements: string[]
  compliancePassed: boolean
  summary: string
}

// --- Session ---

export interface RoleplaySession {
  id: string
  personaId: string
  startedAt: string
  endedAt?: string
  status: SessionPhase
  outcome?: SessionOutcome
  transcript: TranscriptEntry[]
  complianceFlags: ComplianceFlag[]
  scorecard?: Scorecard
  durationSeconds?: number
  timeLimitSeconds: number
}

// --- Zod Schemas ---

export const tokenRequestSchema = z.object({
  personaId: z.string().min(1),
})

export type TokenRequest = z.infer<typeof tokenRequestSchema>

const transcriptEntrySchema = z.object({
  id: z.string(),
  speaker: z.enum(['planner', 'buyer']),
  text: z.string(),
  timestamp: z.number(),
  language: z.string().optional(),
  confidence: z.number().optional(),
  isFinal: z.boolean(),
})

export const gradeRequestSchema = z.object({
  transcript: z.array(transcriptEntrySchema).min(1),
  personaId: z.string().min(1),
  durationSeconds: z.number().positive(),
  outcome: z.enum(['win', 'lose', 'timeout']),
})

export type GradeRequest = z.infer<typeof gradeRequestSchema>

// JSON Schema for GPT structured output (response_format)
export const gradingJsonSchema = {
  name: 'grading_result',
  strict: true,
  schema: {
    type: 'object' as const,
    required: [
      'overallScore',
      'grade',
      'rubrics',
      'strengths',
      'improvements',
      'compliancePassed',
      'complianceFlags',
      'summary',
    ],
    additionalProperties: false,
    properties: {
      overallScore: { type: 'number' as const },
      grade: { type: 'string' as const, enum: ['A', 'B', 'C', 'D', 'F'] },
      rubrics: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          required: ['dimension', 'score', 'weight', 'feedback'],
          additionalProperties: false,
          properties: {
            dimension: { type: 'string' as const },
            score: { type: 'number' as const },
            weight: { type: 'number' as const },
            feedback: { type: 'string' as const },
          },
        },
      },
      strengths: { type: 'array' as const, items: { type: 'string' as const } },
      improvements: { type: 'array' as const, items: { type: 'string' as const } },
      compliancePassed: { type: 'boolean' as const },
      complianceFlags: {
        type: 'array' as const,
        items: {
          type: 'object' as const,
          required: ['ruleId', 'severity', 'message', 'matchedText'],
          additionalProperties: false,
          properties: {
            ruleId: { type: 'string' as const },
            severity: { type: 'string' as const, enum: ['warning', 'violation'] },
            message: {
              type: 'object' as const,
              required: ['en', 'zh'],
              additionalProperties: false,
              properties: {
                en: { type: 'string' as const },
                zh: { type: 'string' as const },
              },
            },
            matchedText: { type: 'string' as const },
          },
        },
      },
      summary: { type: 'string' as const },
    },
  },
}

export interface GradeResponse {
  overallScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  rubrics: RubricScore[]
  strengths: string[]
  improvements: string[]
  compliancePassed: boolean
  complianceFlags: Array<{
    ruleId: string
    severity: 'warning' | 'violation'
    message: { en: string; zh: string }
    matchedText: string
  }>
  summary: string
}
