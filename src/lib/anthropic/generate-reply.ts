import { anthropic, MODEL } from './client'

interface GenerateReplyInput {
  brandVoiceSummary: string
  postOverlay: string
  commenterUsername: string
  commentText: string
}

export async function generateCommentReply(input: GenerateReplyInput): Promise<string> {
  const { brandVoiceSummary, postOverlay, commenterUsername, commentText } = input

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 80,
    messages: [
      {
        role: 'user',
        content: `BRAND VOICE:
${brandVoiceSummary}

POST TEXT: "${postOverlay}"
COMMENTER: @${commenterUsername}
COMMENT: "${commentText}"

Reply to this comment as Solitude Script. Rules:
- 1 sentence, warm but minimal
- Acknowledge what they said without being overly effusive
- Stay philosophical and genuine
- No links, no @mentions, no self-promotion
- Output ONLY the reply text`,
      },
    ],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text.trim() : ''
}

export async function generateOutboundComment(
  postContext: string,
  brandVoiceSummary: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 60,
    messages: [
      {
        role: 'user',
        content: `BRAND VOICE:
${brandVoiceSummary}

POST CONTEXT: "${postContext}"

Write a comment to leave on this post. Rules:
- 1 sentence or a short phrase
- Curious, thoughtful — not salesy or desperate
- Must feel organic, like a genuine reaction
- No links, no self-promotion, no @mentions
- Output ONLY the comment text`,
      },
    ],
  })

  const block = response.content[0]
  return block.type === 'text' ? block.text.trim() : ''
}
