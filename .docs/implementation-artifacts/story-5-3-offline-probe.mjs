// Kjør gjennom den bevarte macOS-profilen, fra reporoten:
// /usr/bin/sandbox-exec -f .docs/implementation-artifacts/story-5-3-nettprofil.sb /usr/bin/env -i PATH="$PATH" node .docs/implementation-artifacts/story-5-3-offline-probe.mjs
// Bare eksplisitt EPERM er bestått. Tilkobling, timeout og andre feil feiler prøven.
import { createConnection } from 'node:net'
const socket = createConnection({ host: '1.1.1.1', port: 443 })
socket.setTimeout(3000)
socket.once('connect', () => {
  console.error('FEIL: Eksternt TCP-kall ble tillatt')
  process.exitCode = 1
  socket.destroy()
})
socket.once('timeout', () => {
  console.error('FEIL: Timeout beviser ikke eksplisitt nettnekt')
  process.exitCode = 1
  socket.destroy()
})
socket.once('error', error => {
  if (error.code === 'EPERM') console.log('Eksternt IP-kall sperret: EPERM')
  else { console.error(`FEIL: Uventet nettfeil ${error.code}`); process.exitCode = 1 }
  socket.destroy()
})
