import express, { Router } from 'express'
import { z } from 'zod'
import { DocumentImportSchema } from '../../contracts/document-import.ts'
import { RentEstimateSchema } from '../../contracts/rent-estimate.ts'
import { extractRentalProperty } from '../../domain/rental-property.ts'
import { estimateRent } from '../rent/ssb-rent.ts'

/** Gratis statistikksteg, uavhengig av dokument-/modellprosessen. Dokumentet forlater aldri lokalserveren. */
export function createRentRouter(options: { estimate?: typeof estimateRent } = {}) {
  const router = Router()
  const input = z.strictObject({ outcome: DocumentImportSchema })
  router.post('/rent-estimate', express.json({ limit: '9mb', strict: true }), async (request, response) => {
    response.setHeader('Cache-Control', 'no-store')
    const parsed = input.safeParse(request.body)
    if (!parsed.success || parsed.data.outcome.role !== 'prospectus') { response.status(400).json({ error: 'invalid-rental-document' }); return }
    const controller = new AbortController()
    const abort = () => { if (!response.writableEnded) controller.abort() }
    response.once('close', abort)
    const timeout = setTimeout(() => controller.abort(), 20_000)
    try {
      const property = extractRentalProperty(parsed.data.outcome)
      const estimate = await (options.estimate ?? estimateRent)(property, { signal: controller.signal })
      const incomplete = parsed.data.outcome.pages.filter(page => !['readable', 'blank'].includes(page.status) || page.rasterUnprocessed)
      if (incomplete.length) estimate.limitations = [...estimate.limitations, `Dokumentgrunnlaget har ${incomplete.length} ufullstendig leste sider. Bare lesbare boligopplysninger er brukt; uleste deler kan skjule motstrid. Kontroller originalen.`]
      const result = RentEstimateSchema.parse(estimate)
      if (result.documentHash !== parsed.data.outcome.reportHash || JSON.stringify(result.property) !== JSON.stringify(property)) throw new Error('Feil objektgrunnlag')
      if (!response.destroyed) response.json(result)
    } catch {
      if (!response.destroyed) response.status(502).json({ error: 'rent-estimate-unavailable' })
    } finally { clearTimeout(timeout); response.off('close', abort) }
  })
  return router
}
