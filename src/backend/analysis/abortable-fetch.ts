/** Keep the response body bound to request abort after the SDK clears its header timer.
 * Also covers SDK-owned reads of error bodies before asResponse() can return. */
export function abortableFetch(fetch: typeof globalThis.fetch): typeof globalThis.fetch {
  return async (url, init) => {
    const response = await fetch(url, init)
    if (!response.body || !init?.signal) return response
    const signal = init.signal
    const reader = response.body.getReader()
    let finished = false
    let streamController: ReadableStreamDefaultController<Uint8Array>
    const cleanup = () => { signal.removeEventListener('abort', abort) }
    const cancelReader = () => {
      // cancel closes pending reads immediately; an arbitrary underlying cancel
      // promise must not extend the deadline. Native fetch is also signal-aborted.
      void reader.cancel().catch(() => {})
      reader.releaseLock()
    }
    const abort = () => {
      if (finished) return
      finished = true
      cleanup()
      streamController.error(new Error('Request interrupted'))
      cancelReader()
    }
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        streamController = controller
        signal.addEventListener('abort', abort, { once: true })
        if (signal.aborted) abort()
      },
      async pull(controller) {
        try {
          const chunk = await reader.read()
          if (finished) return
          if (chunk.done) {
            finished = true; cleanup(); reader.releaseLock(); controller.close()
          } else controller.enqueue(chunk.value)
        } catch {
          if (!finished) { finished = true; cleanup(); cancelReader(); controller.error(new Error('Response body unavailable')) }
        }
      },
      cancel() {
        if (!finished) { finished = true; cleanup(); cancelReader() }
      },
    })
    return new Response(body, { status: response.status, statusText: response.statusText, headers: response.headers })
  }
}
