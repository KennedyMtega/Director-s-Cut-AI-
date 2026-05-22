const GRAPH_BASE = 'https://graph.facebook.com/v21.0'

export async function graphRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const accessToken = token ?? process.env.INSTAGRAM_ACCESS_TOKEN!
  const url = new URL(`${GRAPH_BASE}${path}`)
  url.searchParams.set('access_token', accessToken)

  const response = await fetch(url.toString(), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Graph API ${options.method ?? 'GET'} ${path} failed (${response.status}): ${body}`)
  }

  return response.json() as Promise<T>
}
