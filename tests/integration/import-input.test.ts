import { fork } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

// Exercise the real child's bounded stream boundary without parser/HTTP mocks.
describe('import child byte-stream boundary', () => {
  it.each([
    { byteLength: 0, bytes: new Uint8Array() },
    { byteLength: 50 * 1024 * 1024 + 1, bytes: new Uint8Array() },
    { byteLength: 1.5, bytes: new Uint8Array([1]) },
    { byteLength: 2, bytes: new Uint8Array([1]) },
    { byteLength: 1, bytes: new Uint8Array([1, 2]) },
  ])('rejects invalid length or incomplete/excess input: $byteLength', async ({ byteLength, bytes }) => {
    const child = fork(fileURLToPath(new URL('../../src/backend/http/import-child.ts', import.meta.url)), [], {
      execArgv: ['--max-old-space-size=256'], env: {}, serialization: 'advanced', stdio: ['pipe', 'ignore', 'ignore', 'ipc'],
    })
    const closed = new Promise<void>(resolve => child.once('close', () => resolve()))
    const replies: unknown[] = []
    child.stdin?.on('error', () => { /* Rejection can close input early. */ })
    try {
      const result = new Promise<unknown>((resolve, reject) => {
        child.on('message', value => { replies.push(value); resolve(value) })
        child.once('error', reject)
        child.once('exit', () => reject(new Error('Child exited before rejection')))
      })
      child.send({ byteLength, documentName: 'synthetic.pdf', requestId: 'stream', role: 'prospectus', parentHash: null, attachmentId: null })
      child.stdin?.end(bytes)
      expect(await result).toEqual({ kind: 'rejected', code: 'invalid-format' })
      expect(replies).toHaveLength(1)
    } finally {
      child.kill('SIGKILL')
      await closed
    }
  })
})
