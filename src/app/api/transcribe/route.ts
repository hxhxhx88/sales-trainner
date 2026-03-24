import { NextResponse } from 'next/server'
import { buildDeepgramKeywordParams } from '@/lib/hk-insurance-vocab'
import { DEEPGRAM_MODEL } from '@/lib/constants'

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File | null

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }

    const apiKey = process.env.DEEPGRAM_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 })
    }

    // Read audio file as buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer())

    // Build Deepgram pre-recorded API URL with keyword boosting
    const keywordParams = buildDeepgramKeywordParams()
    const url = `https://api.deepgram.com/v1/listen?model=${DEEPGRAM_MODEL}&language=zh&punctuate=true&smart_format=true&utterances=true&${keywordParams}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': audioFile.type || 'audio/webm',
      },
      body: audioBuffer,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Deepgram API error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Transcription failed', details: errorText },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract utterances (speaker-segmented transcript with timestamps)
    const utterances = data.results?.utterances || []
    const entries = utterances.map(
      (u: { transcript: string; start: number; confidence: number }) => ({
        text: u.transcript,
        start: u.start,
        confidence: u.confidence,
      })
    )

    // Fallback: if no utterances, use channel alternatives
    if (entries.length === 0) {
      const channels = data.results?.channels || []
      if (channels.length > 0) {
        const alternatives = channels[0]?.alternatives || []
        if (alternatives.length > 0 && alternatives[0].transcript) {
          entries.push({
            text: alternatives[0].transcript,
            start: 0,
            confidence: alternatives[0].confidence || 0,
          })
        }
      }
    }

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Transcribe endpoint error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
