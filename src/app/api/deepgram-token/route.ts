import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.DEEPGRAM_API_KEY
  if (!token) {
    return NextResponse.json(
      { error: 'Deepgram API key not configured' },
      { status: 500 }
    )
  }
  return NextResponse.json({ token })
}
