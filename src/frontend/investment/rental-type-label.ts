import type { RentalProperty } from '../../contracts/rent-estimate.ts'

/** Semantisk unsupported beholder dokumentets konkrete boligtype når kildeordet er entydig. */
export function rentalTypeLabel(type: RentalProperty['propertyType']): string {
  if (!type) return 'Ukjent boligtype'
  if (type.value === 'apartment') return 'Leilighet'
  const labels = new Map<string, string>([['enebolig', 'Enebolig'], ['tomannsbolig', 'Tomannsbolig'], ['rekkehus', 'Rekkehus'], ['fritidsbolig', 'Fritidsbolig'], ['hybel', 'Hybel'], ['bygård', 'Bygård'], ['utleiegård', 'Utleiegård'], ['flermannsbolig', 'Flermannsbolig']])
  const found = new Set(type.sources.flatMap(source => [...source.quote.toLocaleLowerCase('nb').matchAll(/\b(enebolig|tomannsbolig|rekkehus|fritidsbolig|hybel|bygård|utleiegård|flermannsbolig)\b/gu)].map(match => labels.get(match[1]!)!)))
  return found.size === 1 ? [...found][0]! : 'Annen boligtype'
}
