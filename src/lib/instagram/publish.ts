import { executeAction } from '@/lib/composio/client'

// Action names visible at app.composio.dev → Apps → Instagram → Actions
const ACTION_CREATE_CONTAINER = 'INSTAGRAM_CREATE_REELS_MEDIA_CONTAINER'
const ACTION_CONTAINER_STATUS = 'INSTAGRAM_GET_MEDIA_CONTAINER_STATUS'
const ACTION_PUBLISH = 'INSTAGRAM_PUBLISH_MEDIA_CONTAINER'

const IG_USER_ID = process.env.INSTAGRAM_USER_ID!

export async function publishReel(
  videoUrl: string,
  caption: string
): Promise<{ postId: string; permalink: string }> {
  // Step 1: Create Reels media container
  const containerRes = await executeAction(ACTION_CREATE_CONTAINER, {
    ig_user_id: IG_USER_ID,
    media_type: 'REELS',
    video_url: videoUrl,
    caption,
    share_to_feed: true,
  })

  if (!containerRes.successful) throw new Error(`IG container creation failed: ${containerRes.error}`)
  const creationId = containerRes.data.id as string

  // Step 2: Poll until container is ready
  await pollContainerStatus(creationId)

  // Step 3: Publish
  const publishRes = await executeAction(ACTION_PUBLISH, {
    ig_user_id: IG_USER_ID,
    creation_id: creationId,
  })

  if (!publishRes.successful) throw new Error(`IG publish failed: ${publishRes.error}`)
  const postId = publishRes.data.id as string

  return {
    postId,
    permalink: `https://www.instagram.com/p/${postId}/`,
  }
}

async function pollContainerStatus(creationId: string, maxAttempts = 24): Promise<void> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusRes = await executeAction(ACTION_CONTAINER_STATUS, {
      container_id: creationId,
    })

    const code = statusRes.data?.status_code as string | undefined
    if (code === 'FINISHED') return
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(`Instagram container status: ${code}`)
    }

    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  throw new Error('Instagram container did not finish processing within 2 minutes')
}
