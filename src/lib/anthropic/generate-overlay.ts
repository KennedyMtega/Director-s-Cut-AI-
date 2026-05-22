import { anthropic, MODEL } from './client'

interface GenerateOverlayInput {
  brandVoiceSummary: string
  recentOverlays: string[]
  themeHint?: string
}

export async function generateTextOverlay(input: GenerateOverlayInput): Promise<string> {
  const { brandVoiceSummary, recentOverlays, themeHint } = input

  const recentSection = recentOverlays.length > 0
    ? `\nRECENT OVERLAYS TO AVOID REPEATING:\n${recentOverlays.map((o, i) => `${i + 1}. ${o}`).join('\n')}`
    : ''

  const themeSection = themeHint ? `\nTHEME HINT: ${themeHint}` : ''

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: `BRAND VOICE:
${brandVoiceSummary}
${recentSection}
${themeSection}

Write a text overlay for a vertical video reel. Rules:
- 1 to 3 short lines only
- Each line: 3-8 words maximum
- Lowercase preferred
- No punctuation at line ends
- Evocative, poetic, philosophical — makes the viewer pause
- Never cliché or generic
- Output ONLY the overlay text, nothing else`,
      },
    ],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text.trim() : ''
}
