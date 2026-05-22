export interface GenerateContentRequest {
  themeHint?: string
  inspirationIds?: string[]
}

export interface GeneratedContent {
  textOverlay: string
  caption: string
  hashtags: string[]
  generationPrompt: string
  model: string
}

export interface TextOverlay {
  lines: string[]
  font?: string
  position?: 'center' | 'bottom' | 'top'
}
