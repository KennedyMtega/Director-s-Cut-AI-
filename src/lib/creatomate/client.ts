const BASE_URL = 'https://api.creatomate.com/v1'

export async function creatomateRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.CREATOMATE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Creatomate ${options.method ?? 'GET'} ${path} failed (${response.status}): ${body}`)
  }

  return response.json() as Promise<T>
}
