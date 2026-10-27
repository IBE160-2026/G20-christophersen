// Offline-testable guards for the explicit, paid one-off runner.
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { randomUUID } from 'node:crypto'

export function validateCommand(action, fixtureId) {
  if (!['prepare', 'run', 'replay-control', 'reconcile'].includes(action) || !['F1', 'F2', 'F3', 'F4'].includes(fixtureId)) throw new Error('Invalid command')
  if (action === 'replay-control' && fixtureId === 'F3') throw new Error('F3 has no UI replay; production adapter replay is forbidden')
}
function token(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Invalid usage token count')
  return value
}
export function validCost(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new Error('Invalid or unresolved cost')
  return value
}
export function usageCost(usage) {
  if (!usage || typeof usage !== 'object') throw new Error('Missing usage')
  // Validate every reported token counter, including any additional provider details.
  const counters = value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid usage details')
    for (const [name, count] of Object.entries(value)) {
      if (name.endsWith('tokens')) token(count)
      else if (name.endsWith('_details')) counters(count)
    }
  }
  counters(usage)
  const input = token(usage.input_tokens), output = token(usage.output_tokens)
  const total = token(usage.total_tokens)
  const cached = token(usage.input_tokens_details?.cached_tokens)
  const written = token(usage.input_tokens_details?.cache_write_tokens)
  const reasoning = token(usage.output_tokens_details?.reasoning_tokens)
  if (!Number.isSafeInteger(input + output) || total !== input + output || cached > input || written > input - cached || reasoning > output) throw new Error('Inconsistent usage totals')
  // The prepared small requests reserve at most 100000 input, below long-context prices.
  if (input > 100000) throw new Error('Input reservation exceeded; reconcile manually')
  return validCost(((input - cached - written) * 2 + cached * 0.1 + written * 2.5 + output * 10) / 1e6)
}
export function ledgerTotal(preflight, receipts) {
  const preflightCost = validCost(preflight.cost_usd)
  if (preflight.unknownCost === true || Math.abs(usageCost(preflight.usage) - preflightCost) > 1e-12) throw new Error('Unresolved preflight cost')
  let total = preflightCost
  for (const receipt of receipts) {
    const cost = validCost(receipt.costUsd)
    if (receipt.unknownCost !== false || Math.abs(usageCost(receipt.usage) - cost) > 1e-12) throw new Error('Unresolved earlier cost')
    total = validCost(total + cost)
  }
  return total
}
function identity(owner) {
  if (!owner || !['F1', 'F2', 'F3', 'F4'].includes(owner.fixtureId) || typeof owner.attemptId !== 'string' || !owner.attemptId) throw new Error('Missing lock owner')
  return owner
}
export function createOwnedLock(path, fixtureId) {
  const owner = identity({ fixtureId, attemptId: randomUUID() })
  mkdirSync(path)
  // On failure leave the lock in place: missing ownership must never permit release.
  writeFileSync(`${path}/owner.json`, JSON.stringify(owner) + '\n', { flag: 'wx' })
  return owner
}
export function requireLockOwner(path, expected) {
  identity(expected)
  const actual = identity(JSON.parse(readFileSync(`${path}/owner.json`, 'utf8')))
  if (actual.fixtureId !== expected.fixtureId || actual.attemptId !== expected.attemptId) throw new Error('Lock belongs to another fixture or attempt')
}
export function releaseOwnedLock(path, owner) {
  requireLockOwner(path, owner)
  rmSync(path, { recursive: true })
}
export function listenLoopback(server) {
  return new Promise((resolve, reject) => {
    const failed = error => { server.off('listening', listening); reject(error) }
    const listening = () => { server.off('error', failed); resolve() }
    server.once('error', failed)
    server.once('listening', listening)
    server.listen(0, '127.0.0.1')
  })
}
