import { Composio } from 'composio-core'
import fs from 'fs'

let _composio: Composio | null = null

function getComposio() {
  if (!_composio) {
    _composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY! })
  }
  return _composio
}

const ENTITY_ID = process.env.COMPOSIO_ENTITY_ID ?? 'default'

export async function publishToYouTube(params: {
  videoPath: string
  title: string
  description: string
  caption: string
}): Promise<{ videoId: string; videoUrl: string }> {
  const composio = getComposio()

  // Read video as base64 for upload
  const videoBuffer = fs.readFileSync(params.videoPath)
  const videoBase64 = videoBuffer.toString('base64')

  const result = await composio.actions.execute({
    actionName: 'YOUTUBE_VIDEOS_INSERT',
    requestBody: {
      input: {
        title: params.title.slice(0, 100),
        description: `${params.description}\n\n${params.caption}`,
        video_base64: videoBase64,
        privacy_status: 'public',
        category_id: '22',
        self_declared_made_for_kids: false,
        tags: ['solitudescript', 'swahili', 'quotes', 'shorts'],
      },
    },
  })

  if (!result.successful) throw new Error(`YouTube upload failed: ${result.error}`)

  const videoId = result.data.id as string
  return {
    videoId,
    videoUrl: `https://www.youtube.com/shorts/${videoId}`,
  }
}

export async function getYouTubeAnalytics(): Promise<{
  subscriberCount: number
  totalViews: number
  recentVideos: { id: string; title: string; views: number; likes: number; url: string }[]
}> {
  const composio = getComposio()

  // Get channel stats
  const channelResult = await composio.actions.execute({
    actionName: 'YOUTUBE_CHANNELS_LIST',
    requestBody: { input: { part: 'statistics', mine: true } },
  })

  const stats = (channelResult.data?.items as any[])?.[0]?.statistics ?? {}

  // Get recent videos
  const videosResult = await composio.actions.execute({
    actionName: 'YOUTUBE_SEARCH_LIST',
    requestBody: { input: { part: 'snippet', forMine: true, type: 'video', maxResults: 10, order: 'date' } },
  })

  const recentItems = (videosResult.data?.items as any[]) ?? []
  const recentVideos = recentItems.map((item: any) => ({
    id: item.id?.videoId ?? '',
    title: item.snippet?.title ?? '',
    views: 0,
    likes: 0,
    url: `https://www.youtube.com/shorts/${item.id?.videoId}`,
  }))

  return {
    subscriberCount: parseInt(stats.subscriberCount ?? '0'),
    totalViews: parseInt(stats.viewCount ?? '0'),
    recentVideos,
  }
}
