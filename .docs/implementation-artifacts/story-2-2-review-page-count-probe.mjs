// Regression probe: was red before Count-independent page-tree traversal.
// Run with the pinned Node: node .docs/implementation-artifacts/story-2-2-review-page-count-probe.mjs
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'

const original = await readFile(new URL('../../tests/fixtures/property-cases/text-31-pages.pdf', import.meta.url))
const source = original.toString('latin1')
assert.equal(source.match(/\/Count 31\b/g)?.length, 1)
// Equal-length mutation preserves every page object/reference and all xref offsets.
const manipulated = Buffer.from(source.replace('/Count 31', '/Count 30'), 'latin1')
const result = await validatePdf(manipulated, 'understated-count.pdf')
console.log(JSON.stringify({ actualPages: 31, declaredCount: 30,
  status: result.status, returnedPageCount: result.pageCount }))
assert.notEqual(result.status, 'format-validated', '31 preserved page objects must not receive format approval with pageCount 30')
assert.equal(result.pageCount, 31)
assert.equal(result.error.code, 'page-limit')
