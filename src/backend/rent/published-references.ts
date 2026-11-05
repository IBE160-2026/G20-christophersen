import { z } from 'zod'
import type { RentalProperty } from '../../contracts/rent-estimate.ts'
import { RentReferenceSchema, PublishedRentAssessmentSchema } from '../../contracts/rent-reference.ts'
import type { PublishedRentAssessment } from '../../contracts/rent-reference.ts'
import rawReferences from './data/published-rents.json' with { type: 'json' }

const references = z.array(RentReferenceSchema).parse(rawReferences)
const normalize = (text: string) => text.toLocaleLowerCase('nb-NO').replace(/\s+kommune\s*$/, '').trim()

/** Manuelt kontrollert lokalt utdrag. Ingen prisblanding eller individuell areal-/standardjustering. */
export function assessPublishedReferences(property: RentalProperty, now: Date): PublishedRentAssessment {
  const base: PublishedRentAssessment = { datasetVersion: 'rent-references-2026-11-05', snapshotDate: '2026-11-05',
    references: [], selectedReferenceId: null, limitations: [
      'Individuell markedsleie kan ikke beregnes: referansene mangler individuelle sammenligningsobjekter og dokumentert justering for areal, standard og mikrolokasjon.',
      'Aktive kontrakter, nye kontrakter og annonser/portefølje er ulike utvalg. Tallene vises separat, uten gjennomsnittsblanding eller vekstfremskriving.',
      'Lokalt utdrag kontrollert 05.11.2026. Ingen kilde oppdateres under analysen; statistikkperiode og publiseringsdato beholdes.',
    ] }
  if (property.issues.length || property.propertyType?.value !== 'apartment' || !property.address || !property.municipality || !property.area || !property.rooms) {
    base.limitations.push('Ingen romreferanse velges uten entydige dokumenterte boligopplysninger for én leilighet.')
    return base
  }
  const municipality = normalize(property.municipality.value), district = property.district ? normalize(property.district.value) : null
  const today = now.toISOString().slice(0, 10)
  base.references = references.filter(reference => normalize(reference.municipality) === municipality
    && (!reference.district || normalize(reference.district) === district)
    && (reference.rooms === null || reference.rooms === property.rooms!.value)
    && (!reference.publishedAt || reference.publishedAt <= today)
    && (!reference.periodEnd || reference.periodEnd <= today))
    .map(reference => ({ reference: structuredClone(reference),
      relevance: reference.metric === 'monthly-rent' && reference.housingType === 'apartment' ? 'room-reference' : 'context',
      geographyMatch: reference.district ? 'district' : 'city-context' }))
  const candidates = base.references.filter(item => item.relevance === 'room-reference'
    && ['active-contracts', 'new-contracts'].includes(item.reference.population)
    && item.reference.publishedAt && now.getUTCFullYear() - Number(item.reference.publishedAt.slice(0, 4)) <= 3)
    .sort((a, b) => Number(b.geographyMatch === 'district') - Number(a.geographyMatch === 'district')
      || b.reference.publishedAt!.localeCompare(a.reference.publishedAt!))
  base.selectedReferenceId = candidates[0]?.reference.id ?? null
  if (base.references.some(item => item.geographyMatch === 'city-context')) base.limitations.push('Kommune brukes bare til grovt valg av byreferanser. By/tettsted og portefølje er ikke nødvendigvis hele kommunen; adressens plass i kildens avgrensning er ikke kontrollert.')
  if (base.references.some(item => item.geographyMatch === 'district')) base.limitations.push('Dokumentert bydelsnavn samsvarer med referansen. Hybels bydeler er koblet fra postnummer og er ikke et adressepresist oppslag.')
  base.limitations.push(`Dokumentert ${property.area.value} m² ${property.area.basis}, ${property.rooms.value} rom${property.bedrooms ? ` og ${property.bedrooms.value} soverom` : ''}. Referansene bruker totalt romantall. Arealfordeling mangler; beløpene er ikke arealtilpasset.`)
  if (base.selectedReferenceId) base.limitations.push('Valgt romreferanse er den mest geografisk spesifikke tilgjengelige kontraktsreferansen, deretter nyeste publisering. Dette er et publisert gruppenivå, uten kalibrert individuell usikkerhet.')
  else base.limitations.push('Ingen egnet kontraktsreferanse er valgt. Manglende dekning eller publisering eldre enn tre kalenderår gir ingen automatisk hovedreferanse; eldre tall kan vises som historisk kontekst.')
  return PublishedRentAssessmentSchema.parse(base)
}
