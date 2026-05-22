import { getYouTubeClient } from './client'
import { Readable } from 'stream'

export async function publishYouTubeShort(
  videoUrl: string,
  title: string,
  description: string
): Promise<{ videoId: string; videoUrl: string }> {
  const youtube = getYouTubeClient()

  // Download video buffer from Creatomate CDN
  const videoResponse = await fetch(videoUrl)
  if (!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.status}`)
  const videoBuffer = Buffer.from(await videoResponse.arrayBuffer())

  const response = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: title.slice(0, 100),
        description,
        categoryId: '22',
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: Readable.from(videoBuffer),
    },
  })

  const videoId = response.data.id!
  return {
    videoId,
    videoUrl: `https://www.youtube.com/shorts/${videoId}`,
  }
}
