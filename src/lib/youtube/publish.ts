import { executeAction } from '@/lib/composio/client'

// Action name visible at app.composio.dev → Apps → YouTube → Actions
const ACTION_UPLOAD_VIDEO = 'YOUTUBE_VIDEOS_INSERT'

export async function publishYouTubeShort(
  videoUrl: string,
  title: string,
  description: string
): Promise<{ videoId: string; videoUrl: string }> {
  const result = await executeAction(ACTION_UPLOAD_VIDEO, {
    title: title.slice(0, 100),
    description,
    video_url: videoUrl,
    privacy_status: 'public',
    category_id: '22',
    self_declared_made_for_kids: false,
  })

  if (!result.successful) throw new Error(`YouTube upload failed: ${result.error}`)

  const videoId = result.data.id as string
  return {
    videoId,
    videoUrl: `https://www.youtube.com/shorts/${videoId}`,
  }
}
