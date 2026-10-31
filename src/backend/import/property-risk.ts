import type { ImportBasis } from './local-plan.ts'
import { analyzeLegalRisks } from './legal-risk.ts'
import { analyzeTechnicalRisks } from './technical-risk.ts'
import { PropertyRiskSchema } from '../../contracts/property-risk.ts'

/** Lokale tekstregler. Ingen modellklient eller transport opprettes. */
export function analyzePropertyRisk(basis: ImportBasis) {
  return PropertyRiskSchema.parse({ legal: analyzeLegalRisks(basis), technical: analyzeTechnicalRisks(basis) })
}
