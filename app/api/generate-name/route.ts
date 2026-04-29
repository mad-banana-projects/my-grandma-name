import { NextRequest, NextResponse } from 'next/server'
import { anthropic, GRANDMA_NAME_MODEL } from '@/lib/claude'

export async function POST(request: NextRequest) {
  const { personality, region, style } = await request.json() as {
    personality: string
    region: string
    style: 'classic' | 'playful' | 'modern'
  }

  const message = await anthropic.messages.create({
    model: GRANDMA_NAME_MODEL,
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `You are a creative naming expert specializing in grandma names.

Generate 5 unique grandma name suggestions based on these preferences:
- Personality: ${personality}
- Regional background: ${region}
- Style: ${style}

Return a JSON array of exactly 5 objects with this shape:
[{ "name": "string", "explanation": "1-2 sentence explanation of why this name fits" }]

Return only the JSON array, no other text.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'

  try {
    const suggestions = JSON.parse(text)
    return NextResponse.json({ suggestions })
  } catch {
    return NextResponse.json({ error: 'Failed to parse suggestions' }, { status: 500 })
  }
}
