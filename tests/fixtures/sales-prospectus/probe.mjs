/** Characterization of existing code, NOT an implemented salgsoppgave pipeline.
 * Run: node tests/fixtures/sales-prospectus/probe.mjs > probe.json
 * Each case runs in a fresh child; long PDFs use the raw extraction worker only.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { Worker } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'

const root = new URL('./', import.meta.url)
const expected = JSON.parse(readFileSync(new URL('expected.json', root)))
const hashes = JSON.parse(readFileSync(new URL('sha256.json', root)))

if (process.argv[2] === '--case') {
  const name = process.argv[3]
  const bytes = readFileSync(new URL(name, root))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), hashes[name])
  const { validatePdf } = await import('../../../src/backend/documents/validate-pdf.ts')
  const { DocumentBasisSchema } = await import('../../../src/contracts/document-analysis.ts')
  const { getDocumentBasisError } = await import('../../../src/contracts/analysis-validation.ts')
  const { getDocument, VerbosityLevel } = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const start = performance.now()
  const format = await validatePdf(bytes, name)
  const pageCount = expected.variants[name]?.pageCount ?? Number(/^text-(\d+)/.exec(name)[1])
  assert.equal(format.pageCount, pageCount)
  assert.equal(format.status, pageCount > 30 ? 'failed' : 'format-validated')
  if (pageCount > 30) assert.equal(format.error.code, 'page-limit')
  const worker = new Worker(new URL('../../../src/backend/documents/pdf-extraction-worker.ts', root), {
    workerData: { bytes: Uint8Array.from(bytes), pageCount },
  })
  let pages
  try {
    pages = await new Promise((resolve, reject) => {
      worker.once('message', reply => reply.kind === 'extracted' ? resolve(reply.pages) : reject(new Error('Raw worker failed')))
      worker.once('error', reject)
      worker.once('exit', () => reject(new Error('Raw worker exited without pages')))
    })
  } finally { await worker.terminate() }
  assert.deepEqual(pages.map(page => page.pdfPage), Array.from({length: pageCount}, (_, index) => index + 1))
  const basis = { contractVersion: '2', extractionVersion: '1', requestId: 'offline-probe',
    reportHash: hashes[name], documentName: name, mode: 'demo', pageCount, pages }
  const schemaAccepted = DocumentBasisSchema.safeParse(basis).success
  assert.equal(schemaAccepted, pageCount <= 30)
  const blocking = pages.filter(page => !['readable', 'blank'].includes(page.status)).map(page => page.pdfPage)
  assert.deepEqual(blocking, expected.variants[name]?.unreadable ?? [])
  const pageText = page => pages[page - 1].text
  if (name.startsWith('text-') || ['mixed-12.pdf', 'scanned-report-12.pdf', 'conflict-12.pdf'].includes(name)) {
    assert.match(pageText(6), /TG2\nBygningsdel: bad 1\nSlitt gulv i bad\nTrykt side 2/)
    assert.match(pageText(7), /TG2\nBygningsdel: bad 2/)
    assert.match(pageText(2), /TG3: Alvorlig lekkasje i tak/)
    if (name !== 'scanned-report-12.pdf') assert.match(pageText(10), /TG3\nBygningsdel: tak\nAlvorlig lekkasje i tak\nTrykt side 6/)
    else assert.equal(pageText(10), '')
  }
  if (name === 'conflict-12.pdf') {
    assert.match(pageText(1), /borettslag/)
    assert.match(pageText(2), /Prisantydning: 3 100 000 kr/)
    assert.doesNotMatch(pageText(1), /Dokumentavgift/)
  }
  if (name === 'missing-report-6.pdf') {
    assert.ok(pages.every(page => !/TG[23]/.test(page.text)))
    assert.match(pageText(6), /Tilstandsrapport følger separat/)
  }
  const loading = getDocument({data: Uint8Array.from(bytes), verbosity: VerbosityLevel.ERRORS})
  let attachment = null
  try {
    const pdf = await loading.promise
    const attachments = await pdf.getAttachments()
    if (name === 'attached-report-6.pdf') {
      assert.equal(attachments.size, 1)
      const [id, metadata] = [...attachments][0]
      assert.equal(metadata.filename, 'tilstandsrapport.pdf')
      const content = metadata.content ?? await pdf.getAttachmentContent(id)
      assert.ok(content)
      assert.equal(createHash('sha256').update(content).digest('hex'), hashes['separate-report-4.pdf'])
      const attachedLoading = getDocument({data: Uint8Array.from(content), verbosity: VerbosityLevel.ERRORS})
      let measuredPages
      try {
        const attachedPdf = await attachedLoading.promise
        measuredPages = attachedPdf.numPages
        assert.equal(measuredPages, expected.variants[name].attachmentPages)
      } finally { await attachedLoading.destroy() }
      attachment = {name: metadata.filename, sha256: hashes['separate-report-4.pdf'], pages: measuredPages}
      assert.ok(pages.every(page => !/TG[23]/.test(page.text)))
    } else assert.equal(attachments, null)
  } finally { await loading.destroy() }
  const documentError = schemaAccepted ? getDocumentBasisError(basis) : null
  assert.equal(documentError?.code ?? null, expected.variants[name]?.legacyDocumentError ?? null)
  console.log(JSON.stringify({name, bytes: bytes.length, pageCount, legacyFormat: format.status,
    legacyError: format.error?.code ?? null, schemaAccepted, blockingPages: blocking,
    legacyDocumentError: documentError?.code ?? null, attachment,
    textBytes: Buffer.byteLength(pages.map(page => page.text).join('')),
    milliseconds: Math.round(performance.now() - start), maxRSSKiB: process.resourceUsage().maxRSS,
    note: 'Raw worker probe is not an accepted analysis, model call, or new support guarantee'}))
} else {
  const cases = [...expected.textPageCounts.map(count => `text-${count}.pdf`), ...Object.keys(expected.variants)].sort()
  assert.deepEqual(Object.keys(hashes).sort(), cases, 'Hashmanifest must include exactly the independent oracle inventory')
  const results = cases.map(name => {
    const result = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--case', name], {
      encoding: 'utf8', timeout: 60_000, maxBuffer: 1024 * 1024, env: {...process.env, OPENAI_API_KEY: ''},
    })
    assert.equal(result.status, 0, `${name}: ${result.stderr || result.error || result.stdout}`)
    return JSON.parse(result.stdout.trim().split('\n').at(-1))
  })
  console.log(JSON.stringify({date: '2026-10-28', node: process.version, parser: 'pdfjs-dist 6.4.299',
    assertions: 'passed', cases: results, limitations: [
      'Synthetic small compressed files, not representative worst-case memory or production throughput',
      'No OCR, economic AI extraction, deduplication, integrated UI, or model quality tested',
      'Existing empty TG outcome could miss an attached report unless new orchestration checks it',
    ]}, null, 2))
}
