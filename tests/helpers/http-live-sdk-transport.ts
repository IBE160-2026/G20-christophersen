import { writeFile } from 'node:fs/promises'

  let calls = 0
  export const fetch: typeof globalThis.fetch = async (_url, init) => {
    calls++
    if (calls !== 1) throw new Error('Unexpected second transport attempt')
    const request = JSON.parse(String(init?.body))
    const document = JSON.parse(request.input[0].content[0].text)
    if (document.mode !== 'live' || document.pages.length !== document.pageCount) throw new Error('Incomplete document')
    if (document.documentName === 'transport.pdf') return new Response('{}', { status: 429 })
    if (document.documentName === 'invalid.pdf') return new Response('{}')
    if (document.documentName === 'incomplete.pdf') return new Response(JSON.stringify({ status: 'incomplete', output: [] }))
    if (document.documentName === 'abort.pdf') {
      const pending = new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      })
      const marker = new URL(import.meta.url).searchParams.get('started')
      if (marker) await writeFile(marker, 'started')
      return pending
    }
    const findings = document.documentName === 'nonempty.pdf' ? [
      { findingId: 'known', grade: 'TG3', description: 'Kontrollert lekkasje', source: { documentName: document.documentName, reportHash: document.reportHash, pdfPage: 2 }, uncertainties: [] },
      { findingId: 'uncertain', grade: '?', description: 'Uklart forhold', source: null, uncertainties: ['Ukjent grad og kilde'] },
    ] : []
    return new Response(JSON.stringify({ status: 'completed', output: [{ type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: JSON.stringify({ findings, limitations: [] }) }] }] }))
  }
