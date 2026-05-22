export const REEL_TEMPLATE_ID = process.env.CREATOMATE_TEMPLATE_ID!

export interface ReelRenderParams {
  backgroundVideoUrl: string
  textOverlay: string
}

export function buildRenderPayload(params: ReelRenderParams) {
  return {
    template_id: REEL_TEMPLATE_ID,
    modifications: {
      'Background Video.source': params.backgroundVideoUrl,
      'Text Overlay.text': params.textOverlay,
    },
  }
}
