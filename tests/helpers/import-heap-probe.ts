import { getHeapStatistics } from 'node:v8'
import { newProspectusPdf } from './new-prospectus-pdf.ts'
import { validatePdf } from '../../src/backend/documents/validate-pdf.ts'
import { extractImport } from '../../src/backend/documents/extract-import.ts'
import { setImportMeasurementSink } from '../../src/backend/documents/import-measurement.ts'

let workerHeapLimit: number | undefined
setImportMeasurementSink(measurement => { if (measurement.phase === 'text') workerHeapLimit = measurement.heapLimit })
const format = await validatePdf(newProspectusPdf(['Synthetic heap-cap probe']), 'synthetic.pdf', { maxPages: 200 })
if (format.status !== 'format-validated') throw new Error('Synthetic format failed')
const result = await extractImport(format, { measure: true })
process.stdout.write(JSON.stringify({ parentHeapLimit: getHeapStatistics().heap_size_limit, workerHeapLimit, text: result.pages[0]?.text }))
