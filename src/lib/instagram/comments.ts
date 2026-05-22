import { graphRequest } from './client'

const USER_ID = process.env.INSTAGRAM_USER_ID!

export interface IGComment {
  id: string
  text: string
  username: string
  timestamp: string
}

export async function getPostComments(mediaId: string): Promise<IGComment[]> {
  const result = await graphRequest<{ data: { id: string; text: string; username: string; timestamp: string }[] }>(
    `/${mediaId}/comments?fields=id,text,username,timestamp`
  )
  return result.data ?? []
}

export async function replyToComment(commentId: string, replyText: string): Promise<string> {
  const result = await graphRequest<{ id: string }>(`/${commentId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ message: replyText }),
  })
  return result.id
}

export async function searchHashtagPosts(hashtag: string, limit = 10): Promise<string[]> {
  const hashtagSearch = await graphRequest<{ id: string }>(
    `/ig_hashtag_search?user_id=${USER_ID}&q=${encodeURIComponent(hashtag)}`
  )
  const hashtagId = hashtagSearch.id

  const posts = await graphRequest<{ data: { id: string; media_url?: string; caption?: string }[] }>(
    `/${hashtagId}/recent_media?fields=id,media_url,caption&user_id=${USER_ID}&limit=${limit}`
  )

  return (posts.data ?? []).map((p) => p.id)
}

export async function commentOnMedia(mediaId: string, commentText: string): Promise<string> {
  const result = await graphRequest<{ id: string }>(`/${mediaId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message: commentText }),
  })
  return result.id
}
