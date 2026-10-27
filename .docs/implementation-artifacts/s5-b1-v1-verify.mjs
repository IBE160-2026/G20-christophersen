// Offline dokument-/fasitkontroll. Ingen adapter, SDK, analyse eller menneskehandling.
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import Big from 'big.js'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractPdf } from '../../src/backend/documents/extract-pdf.ts'
import { DocumentBasisSchema } from '../../src/contracts/document-analysis.ts'
import { FinancialBasisSchema } from '../../src/contracts/financial-basis.ts'
import { validateFinancialBasis } from '../../src/domain/financial-basis.ts'
import { calculateFinancialMetrics } from '../../src/domain/finance.ts'
import { evaluateKnownDeficiencies } from '../../src/domain/screening.ts'

const root = new URL('../../tests/fixtures/s5-benchmark/S5-B1-v1/', import.meta.url)
const read = name => JSON.parse(readFileSync(new URL(name, root), 'utf8'))
const hash = bytes => createHash('sha256').update(bytes).digest('hex')
const norm = value => value.normalize('NFC').replace(/\s+/gu, ' ').trim()
const expected = read('expected.json')
const finances = read('financial-inputs.json')
const bytes = readFileSync(new URL(expected.documentName, root))
assert(bytes.length <= 50 * 1024 * 1024)
const format = await validatePdf(bytes, expected.documentName)
assert.equal(format.status, 'format-validated')
assert(format.pageCount >= 12 && format.pageCount <= 16)
const extracted = await extractPdf(format, { requestId: 'S5-B1-v1-offline-document-check', mode: 'demo' })
const basis = DocumentBasisSchema.parse(extracted.document)
assert.equal(basis.pageCount, expected.pageCount)
assert(basis.pages.every(page => page.status === 'readable'))
assert.equal(expected.caseId, 'S5-B1-v1')
assert.equal(finances.caseId, expected.caseId)
assert.equal(finances.version, expected.version)
assert.equal(new Set(expected.findings.map(f => f.id)).size, expected.findings.length)
const found = basis.pages.flatMap(page => [...page.text.matchAll(/\bTG[23]\b/gu)].map(match => ({ pdfPage: page.pdfPage, grade: match[0] })))
const oracle = expected.findings.map(({ pdfPage, grade }) => ({ pdfPage, grade }))
const ordered = value => value.toSorted((a, b) => a.pdfPage - b.pdfPage || a.grade.localeCompare(b.grade))
assert.deepEqual(ordered(found), ordered(oracle), 'Alle gradmarkeringer må dekkes på korrekt fysisk side')
assert.equal(oracle.filter(f => f.grade === 'TG2').length, 8)
assert.equal(oracle.filter(f => f.grade === 'TG3').length, 1)
let passagesChecked = 0
const groups = [expected.findings, expected.generalInspectionLimitations, expected.specificUncertainties, expected.additionalMethodLimits]
for (const entries of groups) for (const entry of entries) {
  const page = basis.pages[entry.pdfPage - 1]
  assert(page && page.pdfPage === entry.pdfPage)
  for (const field of ['sourcePassage', 'supportingPassage', 'resolutionPassage']) if (entry[field]) {
    assert(norm(page.text).includes(norm(entry[field])), `${entry.id ?? entry.scope}: ${field} mangler på PDF-side ${entry.pdfPage}`)
    passagesChecked++
  }
  if (entry.relatedFindingId) assert(expected.findings.some(f => f.id === entry.relatedFindingId))
}
const financialBasis = FinancialBasisSchema.parse(finances.basis)
const financial = validateFinancialBasis(financialBasis)
assert.deepEqual(financial.issues, [])
assert.equal(financial.commonYear, '2026')
assert.equal(financial.costBreakdown.annualD, '120000')
assert.equal(financial.costBreakdown.annualJ, '240000')
const metrics = calculateFinancialMetrics(financialBasis)
for (const metric of Object.values(metrics)) assert.equal(metric.status, 'available')
const percent = value => new Big(value.numerator).div(value.denominator).times('100').toFixed()
const results = { grossYieldPercent: percent(metrics.grossYield.value), noi: metrics.noi.value.amount,
  netYieldPercent: percent(metrics.netYield.value), cashFlowBeforeTax: metrics.cashFlowBeforeTax.value.amount }
assert.deepEqual(results, expected.expectedMetrics)
assert.deepEqual(results, finances.expectedMetrics)
const tg3Findings = expected.findings.filter(f => f.grade === 'TG3').map(f => ({ findingId: f.id,
  current: { grade: f.grade, description: f.description, source: { documentName: expected.documentName, reportHash: hash(bytes), pdfPage: f.pdfPage } }, resolution: null }))
const ruleCheck = evaluateKnownDeficiencies({ financialBasis, reportDeficiencies: [], tg3Findings })
assert.equal(ruleCheck.recommendation, expected.expectedRecommendation)
assert(ruleCheck.triggers.some(t => t.code === 'unresolved-tg3'))
let manifestFilesVerified = 0
if (existsSync(new URL('manifest.json', root))) {
  const manifest = read('manifest.json')
  assert.equal(manifest.caseId, expected.caseId)
  assert.equal(manifest.caseVersion, expected.version)
  for (const entry of Object.values(manifest.files)) {
    assert.equal(hash(readFileSync(new URL(entry.path, root))), entry.sha256, entry.path)
    manifestFilesVerified++
  }
}
console.log(JSON.stringify({ caseId: expected.caseId, pdf: fileURLToPath(new URL(expected.documentName, root)), pdfSha256: hash(bytes),
  oracleSha256: hash(readFileSync(new URL('expected.json', root))), financialSha256: hash(readFileSync(new URL('financial-inputs.json', root))),
  pageCount: basis.pageCount, bytes: bytes.length, pageStatuses: basis.pages.map(p => p.status),
  physicalPageGradeMarks: ordered(found), findings: { TG2: 8, TG3: 1 }, passagesChecked,
  generalLimitations: expected.generalInspectionLimitations.length, specificUncertainties: expected.specificUncertainties.length,
  additionalMethodLimits: expected.additionalMethodLimits.length, financeIssues: 0, expectedMetrics: results,
  ruleCheckOnly: { recommendation: ruleCheck.recommendation, unresolvedTg3Preserved: true },
  manifestFilesVerified, adaptersCalled: 0, providerCalls: 0, humanMeasurements: 0,
  documentModeNote: 'demo er kun DocumentBasis-metadata i lokal PDF-kontroll; ingen demo- eller live-adapter kjøres' }, null, 2))
