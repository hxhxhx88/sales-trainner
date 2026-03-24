import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { gradeRequestSchema, gradingJsonSchema } from '@/lib/types'
import type { GradeResponse } from '@/lib/types'
import { getPersonaById } from '@/lib/personas'
import { COMPLIANCE_RULES } from '@/lib/compliance-rules'
import { OPENAI_GRADING_MODEL } from '@/lib/constants'
import { buildGradingSystemPrompt, buildGradingUserPrompt } from '@/lib/grading-prompts'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = gradeRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const { transcript, personaId, durationSeconds, outcome } = parsed.data

    const persona = getPersonaById(personaId)
    if (!persona) {
      return NextResponse.json(
        { error: `Persona not found: ${personaId}` },
        { status: 404 }
      )
    }

    const systemPrompt = buildGradingSystemPrompt({
      persona,
      durationSeconds,
      outcome,
      complianceRules: COMPLIANCE_RULES,
    })

    const userPrompt = buildGradingUserPrompt(transcript)

    const openai = new OpenAI()
    const completion = await openai.chat.completions.create({
      model: OPENAI_GRADING_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: gradingJsonSchema,
      },
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      return NextResponse.json(
        { error: 'No response from grading model' },
        { status: 500 }
      )
    }

    const result: GradeResponse = JSON.parse(content)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Grading endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
