const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

export async function publishToFacebookPage(
  videoUrl: string,
  description: string
): Promise<{ postId: string }> {
  const pageId = process.env.FACEBOOK_PAGE_ID!
  const pageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN!

  // Upload video to Facebook Page
  const response = await fetch(`${GRAPH_BASE}/${pageId}/videos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_url: videoUrl,
      description,
      access_token: pageToken,
      published: true,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Facebook video post failed (${response.status}): ${body}`)
  }

  const data = await response.json() as { id: string }
  return { postId: data.id }
}
