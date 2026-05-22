import { anthropic, MODEL } from './client'

interface GenerateCaptionInput {
  brandVoiceSummary: string
  textOverlay: string
  defaultHashtags: string[]
  themeHint?: string
}

export async function generateCaption(input: GenerateCaptionInput): Promise<{ caption: string; hashtags: string[] }> {
  const { brandVoiceSummary, textOverlay, defaultHashtags, themeHint } = input

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [
      {
        role: 'user',
        content: `BRAND VOICE:
${brandVoiceSummary}

VIDEO TEXT OVERLAY:
"${textOverlay}"
${themeHint ? `\nTHEME: ${themeHint}` : ''}

Write an Instagram caption for this reel. Rules:
- 1-3 short sentences max, matching the minimalist brand voice
- Optional: one line of space, then 3-5 relevant hashtags
- Keep it contemplative, never salesy
- Output JSON: { "caption": "...", "hashtags": ["#tag1", "#tag2"] }
- Include these brand hashtags in the hashtags array: ${defaultHashtags.join(', ')}`,
      },
    ],
  })

  const block = response.content[0]
  if (block.type !== 'text') return { caption: '', hashtags: defaultHashtags }

  try {
    const jsonMatch = block.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found')
    const parsed = JSON.parse(jsonMatch[0])
    return {
      caption: parsed.caption || '',
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : defaultHashtags,
    }
  } catch {
    return { caption: block.text.trim(), hashtags: defaultHashtags }
  }
}
