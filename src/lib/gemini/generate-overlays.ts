import { GoogleGenerativeAI } from '@google/generative-ai'

const STYLE_LABELS: Record<string, string> = {
  A: 'Kina cha Hisia (Emotional Depth)',
  B: 'Saikolojia ya Giza (Dark Psychology)',
  C: 'Maumivu ya Moyo (Heartbreak)',
  D: 'Fikira za Juu (Elite Mindset)',
}

const STYLE_DESCRIPTIONS: Record<string, string> = {
  A: 'Vulnerability, feeling understood, inner emotional world — private thoughts about being tired, needing to be heard, finding peace',
  B: 'Uncomfortable psychological truths, human nature, power dynamics, self-awareness, manipulation patterns',
  C: 'Heartbreak, loss, healing, bittersweet clarity after a relationship ends, learning from pain',
  D: 'Discipline, solitude as strength, uncommon mindset, elite habits, building quietly',
}

export interface OverlayEntry {
  hook: string
  body: string
  caption: string
  cta: string
  style: 'A' | 'B' | 'C' | 'D'
  style_label: string
}

export async function generateOverlayBatch(style: 'A' | 'B' | 'C' | 'D', count = 25): Promise<OverlayEntry[]> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const prompt = `You are the content mind of @solitude_script, a Swahili text-on-video brand for Tanzanians aged 18–35.
Style: ${STYLE_LABELS[style]} — ${STYLE_DESCRIPTIONS[style]}

Generate ${count} unique Swahili content entries. Rules:
- hook: ≤8 words, scroll-stopping, feels like the beginning of a private thought
- body: 3–4 short lines, feels like a confession or inner monologue, NOT a motivational speech
- caption: 1–2 Swahili sentences then exactly 10 hashtags starting with #solitudescript
- cta: a question in Swahili that triggers comments (personal, relatable)
- Authentic Swahili only — NOT translated English
- No two entries should feel alike

Return ONLY a valid JSON array. No markdown. No explanation. Just the array:
[{ "hook": "...", "body": "...", "caption": "...", "cta": "..." }, ...]`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  const jsonStart = text.indexOf('[')
  const jsonEnd = text.lastIndexOf(']')
  if (jsonStart === -1 || jsonEnd === -1) throw new Error('Gemini did not return a JSON array')

  const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Array<{
    hook: string; body: string; caption: string; cta: string
  }>

  return parsed.map((entry) => ({
    ...entry,
    style,
    style_label: STYLE_LABELS[style],
  }))
}
