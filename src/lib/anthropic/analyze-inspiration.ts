import { anthropic, MODEL } from './client'
import type { InspirationItem } from '@/types/database'

export async function analyzeInspirationItem(imageUrl: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'url', url: imageUrl },
          },
          {
            type: 'text',
            text: `Analyze this content for the brand "Solitude Script" — a minimalist philosophical page. Describe in 2-3 sentences:
- The emotional tone and vibe (e.g. melancholic, introspective, serene)
- Any visual aesthetic patterns (colors, spacing, typography style)
- The type of language or theme if text is visible

Be specific and concise. This analysis will guide AI content generation.`,
          },
        ],
      },
    ],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}

export async function buildBrandVoiceSummary(items: InspirationItem[]): Promise<string> {
  if (items.length === 0) {
    return 'Tone: introspective and melancholic. Voice: minimalist, poetic, raw. Lines are short (3-8 words each). Themes: solitude, inner growth, the quiet mind, impermanence. No capitalization for stylistic effect. No punctuation at line ends.'
  }

  const analyses = items
    .filter((i) => i.ai_analysis)
    .map((i, idx) => `[${idx + 1}] ${i.ai_analysis}`)
    .join('\n')

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [
      {
        role: 'user',
        content: `Based on these analyses of content that the brand "Solitude Script" loves, synthesize a brand voice summary:

${analyses}

Write a single paragraph (4-6 sentences) describing: the emotional tone, vocabulary style, line length conventions, visual aesthetic, and recurring themes. This summary will be prepended to every content generation prompt. Be specific and prescriptive.`,
      },
    ],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}
