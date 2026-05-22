import { Composio } from 'composio-core'

let _client: Composio | null = null

export function getComposioClient(): Composio {
  if (!_client) {
    _client = new Composio({ apiKey: process.env.COMPOSIO_API_KEY! })
  }
  return _client
}

// Entity ID maps to the connected account in your Composio dashboard (app.composio.dev).
// Defaults to "default" for single-user setups.
export const ENTITY_ID = process.env.COMPOSIO_ENTITY_ID ?? 'default'

export async function executeAction(
  actionName: string,
  input: Record<string, unknown>
) {
  const composio = getComposioClient()
  return composio.actions.execute({
    actionName,
    requestBody: { input },
  })
}
