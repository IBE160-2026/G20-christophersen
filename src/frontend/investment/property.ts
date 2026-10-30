import type { SessionState } from '../state/session.ts'

/** Bare gjeldende, validert salgsoppgave gir identitet og dokumentbilde. */
export function selectProperty(session: SessionState) {
  const slot = session.prospectus.prospectus
  const outcome = slot.status === 'imported' && slot.outcome?.role === 'prospectus' && slot.outcome?.reportHash === slot.selected?.hash ? slot.outcome : null
  const addresses = [...new Set(outcome?.propertyIdentity.filter(item => item.kind === 'address').map(item => item.value.trim()) ?? [])]
  const price = outcome?.economy.fields.find(field => field.id === 'price')
  const address = addresses.length === 1 ? addresses[0]! : null
  return { outcome, selected: outcome ? slot.selected : null, address,
    title: address ?? (addresses.length > 1 ? 'Eiendommens adresse må avklares.' : outcome ? 'Eiendom med ukjent adresse.' : 'Se eiendommens potensial.'),
    price: price?.status === 'available' && price.sources.length > 0 ? price.amount : null,
    priceOrigin: price?.nature === 'stated-estimate' ? 'Dokumentets estimat' : price?.nature === 'fact' ? 'Fra dokumentet' : 'Ukjent opphav',
    priceStatus: price?.status === 'conflict' ? 'Motstrid i dokumentet' : 'Ikke oppgitt',
    ownership: !outcome || outcome.economy.ownership === 'unknown' ? 'Eierform ukjent' : outcome.economy.ownership === 'eierseksjon' ? 'Eierseksjon' : 'Borettslag',
  }
}
