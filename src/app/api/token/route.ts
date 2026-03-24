import { NextResponse } from 'next/server'
import { tokenRequestSchema } from '@/lib/types'
import { getPersonaById } from '@/lib/personas'
import { OPENAI_REALTIME_MODEL, VAD_CONFIG } from '@/lib/constants'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = tokenRequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const persona = getPersonaById(parsed.data.personaId)
    if (!persona) {
      return NextResponse.json(
        { error: `Persona not found: ${parsed.data.personaId}` },
        { status: 404 }
      )
    }

    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_REALTIME_MODEL,
        voice: persona.voiceId,
        instructions: persona.systemPrompt,
        modalities: ['audio', 'text'],
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: VAD_CONFIG,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI Realtime session creation failed:', errorText)
      return NextResponse.json(
        { error: 'Failed to create realtime session' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json({ client_secret: data.client_secret })
  } catch (error) {
    console.error('Token endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
