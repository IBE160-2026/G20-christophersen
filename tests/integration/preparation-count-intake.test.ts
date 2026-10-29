import { afterEach, expect, it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { prepareLiveTest } from '../../src/backend/import/prepare-live-test.ts'
import { createTokenCountRequest } from '../../src/backend/import/token-count.ts'
import * as intake from '../../src/backend/import/representative-intake.ts'
import { codeFirstBasis } from '../helpers/code-first.ts'
import frozenOracle from '../fixtures/sales-prospectus/code-first-live-oracle.json' with { type: 'json' }

const directories: string[] = []
afterEach(async () => { vi.restoreAllMocks(); await Promise.all(directories.splice(0).map(path => rm(path, { recursive: true, force: true }))) })

it('preparation binds both real SDK serializations without treating the count stub as an actual count', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'count-preparation-')); directories.push(directory)
  const result = await prepareLiveTest({ outputDirectory: directory, budgetDirectory: join(directory, 'missing') })
  const packet = JSON.parse(await readFile(result.packet, 'utf8'))
  const body = await readFile(join(directory, 'count-request.json'), 'utf8')
  expect(JSON.parse(body)).toEqual(createTokenCountRequest(packet.request))
  expect(JSON.parse(body).text).toEqual(packet.request.text)
  expect(JSON.parse(body).instructions).toBe(packet.request.instructions)
  expect(JSON.parse(body).reasoning).toEqual({ effort: 'low' })
  expect(JSON.parse(body).max_output_tokens).toBeUndefined()
  expect(packet.request.max_output_tokens).toBe(8000)
  expect(body).toBe(packet.tokenCount.wire.body)
  expect(createHash('sha256').update(body).digest('hex')).toBe(packet.tokenCount.wire.bodySha256)
  expect(packet.tokenCount.serializationOnly).toBe(true)
  expect(packet.tokenCount.priceEvidence.verified).toBe(false)
  expect(packet.tokenizer).toMatchObject({ verified: false, inputTokens: null, source: 'responses-input-tokens', status: 'not-called' })
  expect(packet.ready).toBe(false)
  expect(packet.blockers).toContain('server-token-count-required')
  expect(packet.blockers).toContain('token-count-price-unverified')
  expect(packet.externalCalls).toBe(0); expect(packet.reservationsCreated).toBe(0)
})

it('real-case preparation cannot use a public output override or bypass missing/frozen human evidence', async () => {
  await expect(prepareLiveTest({ representativeCaseId: 'not-supplied', outputDirectory: '.docs' })).rejects.toThrow('representative-private-output-required')
  await expect(prepareLiveTest({ representativeCaseId: 'not-supplied', budgetDirectory: '/tmp' })).rejects.toThrow('representative-private-output-required')
  await expect(prepareLiveTest({ representativeCaseId: 'not-supplied' })).rejects.toThrow()
})

it('a frozen human report area cannot become a request that omits the ambiguously detected report', async () => {
  const basis = codeFirstBasis(['Prisantydning: 3 000 000 kr', 'TILSTANDSRAPPORT\nTilstandsgrad: TG2\nBygningsdel: tak\nLekkasje.'])
  const oracle = { ...frozenOracle, reportPages: [2] }
  // This is a simulated loader result for the guard test, never an actual human attestation.
  vi.spyOn(intake, 'loadFrozenRepresentativeCase').mockResolvedValueOnce({ basis, oracle, directory: '/never-written' } as unknown as Awaited<ReturnType<typeof intake.loadFrozenRepresentativeCase>>)
  await expect(prepareLiveTest({ representativeCaseId: 'simulated-ambiguous-report' })).rejects.toThrow('representative-plan-report-mismatch')
})
