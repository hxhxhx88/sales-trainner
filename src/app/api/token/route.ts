import { NextResponse } from 'next/server'
import { tokenRequestSchema } from '@/lib/types'
import { getPersonaById } from '@/lib/personas'
import { OPENAI_REALTIME_MODEL, VAD_CONFIG } from '@/lib/constants'

const NATURAL_SPEECH_PREFIX = `## 语音风格要求（最高优先级）
你正在进行一场真实的语音对话。你必须像一个真实的人一样说话：
- 语速自然，有快有慢，不要匀速朗读
- 适当使用口头语和语气词：嗯、啊、那个、就是说、对吧、你看、哎、其实、说实话
- 句子不要太完整太书面，可以有停顿、重复、自我纠正（比如"我觉得……嗯，怎么说呢"）
- 表达情绪：惊讶时"哎？真的吗？"，犹豫时"嗯……这个嘛"，同意时"对对对"
- 回复长度要自然：简单问题简短回答，不要每次都长篇大论
- 偶尔可以反问或打断，像真实对话一样
- 绝对不要用列表或编号方式说话，不要说"第一、第二、第三"

`

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
        instructions: NATURAL_SPEECH_PREFIX + persona.systemPrompt,
        modalities: ['audio', 'text'],
        input_audio_transcription: {
          model: 'whisper-1',
        },
        turn_detection: VAD_CONFIG,
        temperature: 0.8,
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
