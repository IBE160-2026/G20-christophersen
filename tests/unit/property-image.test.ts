import { describe, expect, it } from 'vitest'
import { largeRasterSize, previewSize, PROPERTY_IMAGE_LIMITS, rasterRgba, PreviewRasterBudget, PREVIEW_BUDGET_ERROR } from '../../src/frontend/investment/property-image-policy.ts'
import { PreviewWorkerPort } from '../../src/frontend/investment/property-image-port.ts'
import type { PreviewRawWorker } from '../../src/frontend/investment/property-image-port.ts'

describe('lokal originalbasert bildevisning', () => {
  it('utelater små logoer, masker, urimelige dimensjoner og raster over dekodingstaket', () => {
    expect(largeRasterSize(800, 600)).toBe(true)
    for (const [width, height] of [[300, 200], [2000, 100], [3000, 3000], [Infinity, 600], [800.5, 600], [0, 0]]) {
      expect(largeRasterSize(width, height)).toBe(false)
    }
    expect(largeRasterSize('800', 600)).toBe(false)
  })
  it('bevarer sideforhold med tak på piksler og akser også for ekstreme PDF-sider', () => {
    for (const [width, height] of [[800, 600], [8000, 6000], [100_000, 10], [10, 100_000]]) {
      const size = previewSize(width!, height!)!
      expect(size.width * size.height).toBeLessThanOrEqual(PROPERTY_IMAGE_LIMITS.displayPixels)
      expect(Math.max(size.width, size.height)).toBeLessThanOrEqual(PROPERTY_IMAGE_LIMITS.displayEdge)
      expect(size.scale).toBeLessThanOrEqual(1)
    }
    expect(previewSize(0, 1)).toBeNull()
    expect(previewSize(NaN, 20)).toBeNull()
    expect(previewSize(Infinity, 20)).toBeNull()
  })
  it('bevarer faktiske RGB/RGBA-piksler; gjetter ikke ved avkuttet data eller pakket maske', () => {
    const rgb = new Uint8Array(400 * 300 * 3)
    rgb.set([12, 34, 56]); rgb.set([90, 80, 70], rgb.length - 3)
    const rgba = rasterRgba(400, 300, 2, rgb)!
    expect([...rgba.slice(0, 4)]).toEqual([12, 34, 56, 255])
    expect([...rgba.slice(-4)]).toEqual([90, 80, 70, 255])
    rgba.set([1, 2, 3, 4])
    expect([...rasterRgba(400, 300, 3, rgba)!.slice(0, 4)]).toEqual([1, 2, 3, 4])
    expect(rasterRgba(400, 300, 1, new Uint8Array(400 * 300))).toBeNull()
    expect(rasterRgba(400, 300, 2, rgb.slice(1))).toBeNull()
    expect(rasterRgba(400, 300, 3, [])).toBeNull()
  })
  it('stopper samlet dekoding før neste raster over8Mp kan overføres, på tvers av sideobjekter', () => {
    const budget = new PreviewRasterBudget()
    const image = { width: 2000, height: 2000, data: new Uint8Array(1) }
    expect(budget.admit({ action: 'obj', data: ['first', 0, 'Image', image] })).toBe(true)
    expect(budget.admit({ action: 'commonobj', data: ['second', 'Image', image] })).toBe(true)
    expect(budget.pixels).toBe(8_000_000)
    expect(budget.admit({ action: 'obj', data: ['third', 2, 'Image', { width: 1, height: 1, data: new Uint8Array(1) }] })).toBe(false)
    expect(budget.pixels).toBe(8_000_000)
    expect(budget.images).toBe(2)
    expect(budget.admit({ action: 'ready' })).toBe(false)
  })
  it('inkluderer inline-raster i operatørstrømmen og avviser cachekloning/oversize/nativecodedbilder', () => {
    const budget = new PreviewRasterBudget()
    for (let index = 0; index < 24; index++) {
      expect(budget.admit({ stream: 4, chunk: { argsArray: [[{ width: 1, height: 1, data: new Uint8Array(4) }]] } })).toBe(true)
    }
    expect(budget.admit({ stream: 4, chunk: { argsArray: [[{ width: 1, height: 1, data: new Uint8Array(4) }]] } })).toBe(false)
    expect(new PreviewRasterBudget().admit({ action: 'commonobj', data: ['copy', 'CopyLocalImage', { imageRef: 'x' }] })).toBe(false)
    expect(new PreviewRasterBudget().admit({ width: 4000, height: 4000, data: new Uint8Array(1) })).toBe(false)
    expect(new PreviewRasterBudget().admit({ width: 800, height: 600, bitmap: { displayWidth: 800, displayHeight: 600, codedWidth: 8000, codedHeight: 6000 } })).toBe(false)
    // A tiny typed-array view must not transfer an oversized backing buffer.
    expect(new PreviewRasterBudget().admit({ width: 1, height: 1, data: new Uint8Array(new ArrayBuffer(100), 0, 4) })).toBe(false)
  })
  it('frigjør ekte worker/listenere og avviser ventende PDF-kall ved budsjettstopp; destroy kan fullføre', async () => {
    class FakeWorker extends EventTarget {
      terminated = 0
      postMessage() {}
      terminate() { this.terminated++ }
    }
    const worker = new FakeWorker(), limits: boolean[] = []
    const port = new PreviewWorkerPort(worker as unknown as PreviewRawWorker, exceeded => limits.push(exceeded))
    const received: Record<string, unknown>[] = []
    port.addEventListener('message', event => received.push((event as MessageEvent).data))
    worker.dispatchEvent(new MessageEvent('message', { data: { action: 'ready' } }))
    await port.ready
    port.postMessage({ sourceName: 'main', targetName: 'worker', action: 'GetDocRequest', callbackId: 1 })
    port.postMessage({ sourceName: 'doc', targetName: 'doc_worker', action: 'GetOperatorList', streamId: 2 })
    worker.dispatchEvent(new MessageEvent('message', { data: { type: PREVIEW_BUDGET_ERROR } }))
    expect(limits).toEqual([true])
    expect(worker.terminated).toBe(1)
    expect(received).toContainEqual(expect.objectContaining({ callback: 2, callbackId: 1, targetName: 'main' }))
    expect(received).toContainEqual(expect.objectContaining({ stream: 8, streamId: 2, reason: expect.any(Object) }))
    port.postMessage({ sourceName: 'doc', targetName: 'doc_worker', action: 'Terminate', callbackId: 3 })
    await Promise.resolve()
    expect(received).toContainEqual(expect.objectContaining({ callback: 1, callbackId: 3, data: null }))
    const count = received.length
    worker.dispatchEvent(new MessageEvent('message', { data: { action: 'late' } }))
    expect(received).toHaveLength(count)
    port.terminate()
    expect(worker.terminated).toBe(1)
  })
})
