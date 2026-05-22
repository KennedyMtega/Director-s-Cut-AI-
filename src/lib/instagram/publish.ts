import { graphRequest } from './client'
import type { InstagramContainerStatus } from '@/types/platform'

const USER_ID = process.env.INSTAGRAM_USER_ID!

export async function publishReel(videoUrl: string, caption: string): Promise<{ postId: string; permalink: string }> {
  // Step 1: Create media container
  const container = await graphRequest<{ id: string }>(`/${USER_ID}/media`, {
    method: 'POST',
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: videoUrl,
      caption,
      share_to_feed: true,
    }),
  })

  const creationId = container.id

  // Step 2: Poll until container is ready
  await pollContainerStatus(creationId)

  // Step 3: Publish
  const published = await graphRequest<{ id: string }>(`/${USER_ID}/media_publish`, {
    method: 'POST',
    body: JSON.stringify({ creation_id: creationId }),
  })

  const postId = published.id
  const mediaInfo = await graphRequest<{ permalink: string }>(`/${postId}`, {
    method: 'GET',
  })

  // append fields query param separately since graphRequest appends access_token
  const response = await fetch(
    `https://graph.facebook.com/v21.0/${postId}?fields=permalink&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`
  )
  const data = await response.json() as { permalink?: string }

  return { postId, permalink: data.permalink ?? `https://www.instagram.com/p/${postId}/` }
}

async function pollContainerStatus(creationId: string, maxAttempts = 24): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await graphRequest<InstagramContainerStatus>(
      `/${creationId}?fields=status_code`
    )

    if (status.status_code === 'FINISHED') return
    if (status.status_code === 'ERROR' || status.status_code === 'EXPIRED') {
      throw new Error(`Instagram container status: ${status.status_code}`)
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  throw new Error('Instagram container did not finish processing within 2 minutes')
}
