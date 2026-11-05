import { createHash } from 'node:crypto'
process.once('message', async () => {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) chunks.push(chunk)
  const bytes = Buffer.concat(chunks)
  process.send?.({ kind: 'adapter-ready', hash: createHash('sha256').update(bytes).digest('hex') })
  process.once('message', () => { while (true) { /* Stopp etter adaptertillatelse. */ } })
})
