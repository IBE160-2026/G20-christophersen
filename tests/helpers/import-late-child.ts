import { createHash } from 'node:crypto'
process.once('message', (input: { bytes: Uint8Array }) => {
  process.send?.({ kind: 'adapter-ready', hash: createHash('sha256').update(input.bytes).digest('hex') })
  process.once('message', () => { while (true) { /* Stopp etter adaptertillatelse. */ } })
})
