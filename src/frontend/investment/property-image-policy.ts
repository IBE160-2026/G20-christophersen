/** Presentation-only limits. A displayed raster never establishes the depicted property. */
export const PROPERTY_IMAGE_LIMITS = { pages: 3, images: 24, operators: 100_000,
  decodedPixels: 4_000_000, totalDecodedPixels: 8_000_000, messageNodes: 100_000,
  displayPixels: 1_000_000, displayEdge: 1200, deadlineMs: 10_000 } as const

export const PREVIEW_BUDGET_ERROR = 'paa-preview-image-budget-exceeded' as const

/** Runs inside the dedicated PDF worker, before postMessage transfers raster ownership.
 * Includes inline rasters nested in operator-stream chunks, not only Image obj messages.
 * Conservative cumulative accounting never refunds a previous page or a repeated transfer.
 */
export class PreviewRasterBudget {
  images = 0
  pixels = 0
  blocked = false
  admit(message: unknown): boolean {
    if (this.blocked) return false
    let images = 0, pixels = 0, nodes = 0
    const seen = new Set<object>(), pending: unknown[] = [message]
    while (pending.length) {
      const value = pending.pop()
      if (++nodes > PROPERTY_IMAGE_LIMITS.messageNodes) return this.reject()
      if (!value || typeof value !== 'object' || seen.has(value)) continue
      seen.add(value)
      if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) continue
      const object = value as Record<string, unknown>
      // PDF.js otherwise clones a main-thread cached image without an Image transfer.
      if (object.action === 'commonobj' && Array.isArray(object.data) && object.data[1] === 'CopyLocalImage') return this.reject()
      const bitmap = object.bitmap as Record<string, unknown> | undefined
      const raw = ArrayBuffer.isView(object.data)
      const directBitmap = typeof object.close === 'function' && ('displayWidth' in object || 'width' in object)
      if (raw && ('width' in object || 'height' in object) || bitmap || directBitmap) {
        const width = object.width ?? object.displayWidth, height = object.height ?? object.displayHeight
        if (typeof width !== 'number' || typeof height !== 'number' || !Number.isSafeInteger(width) || !Number.isSafeInteger(height)
          || width <= 0 || height <= 0 || width * height > PROPERTY_IMAGE_LIMITS.decodedPixels) return this.reject()
        let area = width * height
        if (bitmap) {
          const bitmapWidth = bitmap.codedWidth ?? bitmap.displayWidth ?? bitmap.width
          const bitmapHeight = bitmap.codedHeight ?? bitmap.displayHeight ?? bitmap.height
          if (typeof bitmapWidth !== 'number' || typeof bitmapHeight !== 'number' || !Number.isSafeInteger(bitmapWidth) || !Number.isSafeInteger(bitmapHeight)
            || bitmapWidth <= 0 || bitmapHeight <= 0 || bitmapWidth * bitmapHeight > PROPERTY_IMAGE_LIMITS.decodedPixels) return this.reject()
          area = Math.max(area, bitmapWidth * bitmapHeight)
        }
        if (raw && (object.data as ArrayBufferView).buffer.byteLength > area * 4) return this.reject()
        images++; pixels += area
        if (this.images + images > PROPERTY_IMAGE_LIMITS.images || this.pixels + pixels > PROPERTY_IMAGE_LIMITS.totalDecodedPixels) return this.reject()
        continue
      }
      for (const child of Object.values(object)) pending.push(child)
    }
    this.images += images; this.pixels += pixels
    return true
  }
  private reject() { this.blocked = true; return false }
}

export function largeRasterSize(width: unknown, height: unknown) {
  return typeof width === 'number' && typeof height === 'number'
    && Number.isSafeInteger(width) && Number.isSafeInteger(height)
    && width >= 400 && height >= 250 && width * height >= 120_000
    && width * height <= PROPERTY_IMAGE_LIMITS.decodedPixels
    && width / height >= 0.4 && width / height <= 3
}

/** Keep all page content visible and cap both canvas axes and allocated pixels. */
export function previewSize(width: number, height: number) {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null
  const scale = Math.min(1, PROPERTY_IMAGE_LIMITS.displayEdge / width, PROPERTY_IMAGE_LIMITS.displayEdge / height,
    Math.sqrt(PROPERTY_IMAGE_LIMITS.displayPixels / width / height))
  return { width: Math.max(1, Math.floor(width * scale)), height: Math.max(1, Math.floor(height * scale)), scale }
}

/** Only PDF.js's decoded RGB24/RGBA32 layouts; masks/packed grayscale are not guessed. */
export function rasterRgba(width: number, height: number, kind: unknown, data: unknown): Uint8ClampedArray | null {
  if (!largeRasterSize(width, height) || !(data instanceof Uint8Array || data instanceof Uint8ClampedArray)) return null
  const channels = kind === 2 ? 3 : kind === 3 ? 4 : 0
  if (!channels || data.length !== width * height * channels) return null
  const rgba = new Uint8ClampedArray(width * height * 4)
  for (let pixel = 0; pixel < width * height; pixel++) {
    const source = pixel * channels, target = pixel * 4
    rgba[target] = data[source]!
    rgba[target + 1] = data[source + 1]!
    rgba[target + 2] = data[source + 2]!
    rgba[target + 3] = channels === 4 ? data[source + 3]! : 255
  }
  return rgba
}
