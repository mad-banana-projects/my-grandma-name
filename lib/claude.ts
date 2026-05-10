import Anthropic from '@anthropic-ai/sdk'

export const GRANDMA_NAME_MODEL = 'claude-haiku-4-5-20251001'

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) _client = new Anthropic()
  return _client
}

// Proxy defers initialization to first use so module evaluation during
// Next.js build doesn't throw when ANTHROPIC_API_KEY isn't present yet.
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop: string | symbol) {
    const client = getClient()
    const val = (client as any)[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})
