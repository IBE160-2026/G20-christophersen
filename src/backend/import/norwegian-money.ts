export type NorwegianMoney = { amount: string | null; minorUnits: string | null; ambiguity: string | null }
const unresolved = (ambiguity: string): NorwegianMoney => ({ amount: null, minorUnits: null, ambiguity })
/** Ren transkripsjon av norsk tallsyntaks. Ingen flyttall, avrunding eller avgiftsberegning. */
export function parseNorwegianMoney(raw: string): NorwegianMoney {
  if (!raw || raw !== raw.trim()) return unresolved('unsupported-syntax')
  if (/^[+\-\u2212\u2011\u2013\u2014]/u.test(raw)) return unresolved('signed-unsupported')
  if (/[%‰]/u.test(raw)) return unresolved('percentage-not-money')
  const wholeSuffix = /,[-\u2011\u2013]$/u.test(raw)
  const token = wholeSuffix ? raw.slice(0, -2) : raw
  if (/[/:\u2013\u2014]/u.test(token) || /^\d{1,2}\.\d{1,2}\.\d{2,4}$/u.test(raw) || /^\d{4}-\d{2}-\d{2}$/u.test(raw)) return unresolved('date-or-range-not-money')
  if (/[eE]/u.test(raw)) return unresolved('scientific-notation-unsupported')
  const ungrouped = /^\d+(?:,\d{1,2})?$/u.test(token)
  const spaceGrouped = /^\d{1,3}(?:[ \u00a0\u202f]\d{3})+(?:,\d{1,2})?$/u.test(token)
  const dotGrouped = /^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/u.test(token)
  if (!ungrouped && !spaceGrouped && !dotGrouped) return unresolved('unsupported-syntax')
  if (wholeSuffix && token.includes(',')) return unresolved('unsupported-syntax')
  if (dotGrouped && !wholeSuffix && !token.includes(',') && token.split('.').length === 2) return unresolved('ambiguous-single-dot-group')
  const normalized = token.replace(/[. \u00a0\u202f]/gu, '')
  const [integer = '', fraction = ''] = normalized.split(',')
  if (integer.length > 78) return unresolved('amount-too-long')
  const minorUnits = BigInt(integer) * 100n + BigInt(fraction.padEnd(2, '0'))
  const kronor = minorUnits / 100n, cents = minorUnits % 100n
  const amount = cents === 0n ? kronor.toString() : `${kronor}.${cents.toString().padStart(2, '0').replace(/0$/u, '')}`
  return { amount, minorUnits: minorUnits.toString(), ambiguity: null }
}

