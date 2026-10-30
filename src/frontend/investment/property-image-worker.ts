import officialWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { PREVIEW_BUDGET_ERROR, PreviewRasterBudget } from './property-image-policy.ts'

type Scope = {
  postMessage: (message: unknown, transfer?: Transferable[] | StructuredSerializeOptions) => void
  close: () => void
}
const scope = globalThis as unknown as Scope
const send = scope.postMessage.bind(scope)
const budget = new PreviewRasterBudget()
let stopped = false
scope.postMessage = (message, transfer) => {
  if (stopped) return
  if (!budget.admit(message)) {
    stopped = true
    // No over-budget image or inline stream chunk reaches the main thread.
    send({ type: PREVIEW_BUDGET_ERROR, images: budget.images, pixels: budget.pixels })
    scope.close()
    return
  }
  send(message, transfer)
}
// Local bundled official worker, with our transfer guard already installed.
void import(/* @vite-ignore */ officialWorkerUrl)
