import type { ResponseCreateParamsNonStreaming } from 'openai/resources/responses/responses'
import { createAnalysisBackend } from '../analysis/backend-config.ts'
import { boundedFetch } from '../listing/backend.ts'
import { IMPORT_MAX_RESPONSE_BYTES } from '../../contracts/document-import.ts'
import type { OfflineSemanticTransport } from './semantic-adapter.ts'
/** Test harness for the official SDK. Mandatory injected fetch; never used by the HTTP production route. */
export function createOfflineSdkTransport(stubFetch: typeof globalThis.fetch): OfflineSemanticTransport {
  const bounded = boundedFetch(stubFetch, IMPORT_MAX_RESPONSE_BYTES)
  const backend = createAnalysisBackend('live', { environment: { OPENAI_API_KEY: 'offline-stub-no-real-key' }, fetch: bounded.fetch })
  if (backend.mode !== 'live') throw new Error('invalid-offline-backend')
  return { purpose: 'offline-stub', responses: { async create(request, options) {
    try {
      const response = await backend.responses.create(request as unknown as ResponseCreateParamsNonStreaming, options).asResponse()
      const raw = JSON.parse(await response.text()) as { output?: { type?: string; content?: { type: string; text?: string }[] }[]; status?: string; usage?: unknown }
      const contents = raw.output?.filter(item => item.type === 'message').flatMap(item => item.content ?? []) ?? []
      if (contents.some(item => item.type !== 'output_text')) throw new Error('refused-response')
      return { ...raw, output_text: contents.map(item => item.text ?? '').join('') }
    } finally { await bounded.settled() }
  } } }
}
