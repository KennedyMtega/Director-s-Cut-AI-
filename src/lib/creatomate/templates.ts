export const REEL_TEMPLATE_ID = process.env.CREATOMATE_TEMPLATE_ID!

export interface ReelRenderParams {
  backgroundVideoUrl: string
  textOverlay: string
  heading?: string
  musicUrl?: string
}

export function buildRenderPayload(params: ReelRenderParams) {
  const modifications: Record<string, string> = {
    'Background-1.source': params.backgroundVideoUrl,
    'Text-1.text': params.textOverlay,
    'Text-3LC.text': params.heading ?? '@solitudescript',
  }

  if (params.musicUrl) {
    modifications['Music.source'] = params.musicUrl
  }

  return {
    template_id: REEL_TEMPLATE_ID,
    modifications,
  }
}
