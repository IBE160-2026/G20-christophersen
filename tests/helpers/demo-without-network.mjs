// Kjøres av integrasjonstesten i separat Node-prosess med env: {}.
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { Socket } from 'node:net'

let attempts = 0
const blocked = () => { attempts++; throw new Error('Nett sperret i demotest') }
Socket.prototype.connect = blocked
globalThis.fetch = blocked
// macOS kan legge til denne kodingsvariabelen selv med env: {}.
delete process.env.__CF_USER_TEXT_ENCODING
assert.deepEqual(Object.keys(process.env), [])

// Last produktmodulene først etter at nøkkel-/nettforutsetningene er etablert.
const { validatePdf } = await import('../../src/backend/documents/validate-pdf.ts')
const { extractPdf } = await import('../../src/backend/documents/extract-pdf.ts')
const { analyzeDocument } = await import('../../src/backend/analysis/analyze-document.ts')
const { createAnalysisBackend } = await import('../../src/backend/analysis/backend-config.ts')
let clients = 0
const backend = createAnalysisBackend(undefined, { createClient() { clients++; throw new Error('Ingen klient i demo') } })
assert.equal(backend.mode, 'demo')
assert.equal(clients, 0)
const bytes = await readFile(new URL('../fixtures/property-cases/F4-tilstandsrapport.pdf', import.meta.url))
const format = await validatePdf(bytes, 'F4-tilstandsrapport.pdf')
assert.equal(format.status, 'format-validated')
const { document, error } = await extractPdf(format, { requestId: 'uten-nøkler', mode: 'demo' })
assert.equal(error, null)
const result = await analyzeDocument(document)
assert.equal(result.status, 'completed')
assert.equal(result.mode, 'demo')
assert.deepEqual(result.findings.map(finding => finding.source.pdfPage), [2, 4])
assert.equal(attempts, 0)
const configuredResult = await analyzeDocument(document, backend.adapter)
assert.equal(configuredResult.status, 'completed')
assert.equal(clients, 0)
assert.equal(attempts, 0)
console.log('demo: completed; nettforespørsler: 0; miljøvariabler: 0')
