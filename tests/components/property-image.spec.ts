import { deflateSync } from 'node:zlib'
import { test, expect } from '@playwright/test'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'

let server: ViteDevServer
let origin: string
test.beforeAll(async () => {
  const cacheDir = `node_modules/.vite-property-image-${process.pid}`
  server = await createServer({ cacheDir, optimizeDeps: { include: ['react', 'react-dom/client'] },
    server: { host: '127.0.0.1', port: 0 }, plugins: [{
    name: 'property-image-test-harness',
    configureServer(vite) {
      vite.middlewares.use('/__property-image-test', async (_request, response) => {
        const html = await vite.transformIndexHtml('/__property-image-test', `<!doctype html><html lang="nb"><body><div id="root"></div>
          <script type="module">
          import React from '/${cacheDir}/deps/react.js';
          import ReactDOM from '/${cacheDir}/deps/react-dom_client.js';
          import {PropertyImage} from '/src/frontend/investment/PropertyImage.tsx';
          const root=ReactDOM.createRoot(document.getElementById('root'));
          const NativeWorker=window.Worker;
          window.previewWorkers={created:0,terminated:0,budget:null};
          window.Worker=class extends NativeWorker{
            constructor(...args){super(...args);window.previewWorkers.created++;this.addEventListener('message',event=>{
              if(event.data?.type==='paa-preview-image-budget-exceeded')window.previewWorkers.budget={images:event.data.images,pixels:event.data.pixels};
            });}
            terminate(){window.previewWorkers.terminated++;super.terminate();}
          };
          window.opens=0;
          window.openedPage=null;
          window.showDocument=async function(base64,name){
            if(base64===null){root.render(React.createElement(PropertyImage,{selected:null,onOpen:()=>window.opens++}));return;}
            const bytes=Uint8Array.from(atob(base64),c=>c.charCodeAt(0));
            const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),c=>c.toString(16).padStart(2,'0')).join('');
            root.render(React.createElement(PropertyImage,{selected:{bytes,hash,file:new File([bytes],name)},onOpen:page=>{window.opens++;window.openedPage=page;}}));
          };
          window.showDocument(null,'');
          </script></body></html>`)
        response.setHeader('Content-Type', 'text/html'); response.end(html)
      })
    },
  }] })
  await server.listen()
  const address = server.httpServer!.address()
  if (!address || typeof address === 'string') throw new Error('Testserver mangler lokal adresse')
  origin = `http://127.0.0.1:${address.port}`
})
test.afterAll(async () => { await server?.close() })

/** Actual synthetic PDF image streams, including a larger second-page image. */
function imagePdf(images = true) {
  const parts: Buffer[] = [Buffer.from('%PDF-1.4\n')], offsets = [0]
  const add = (id: number, content: Buffer | string) => {
    offsets[id] = parts.reduce((total, part) => total + part.length, 0)
    parts.push(Buffer.from(`${id} 0 obj\n`), Buffer.isBuffer(content) ? content : Buffer.from(content), Buffer.from('\nendobj\n'))
  }
  add(1, '<< /Type /Catalog /Pages 2 0 R >>')
  add(2, '<< /Type /Pages /Count 3 /Kids [3 0 R 6 0 R 9 0 R] >>')
  for (const [index, [width, height]] of [[400, 300], [800, 600], [500, 400]].entries()) {
    const id = 3 + index * 3
    add(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 450] /Resources << ${images ? `/XObject << /Im ${id + 2} 0 R >>` : ''} >> /Contents ${id + 1} 0 R >>`)
    const content = images ? 'q 600 0 0 450 0 0 cm /Im Do Q' : '0.8 0.8 0.8 rg 10 10 580 430 re f'
    add(id + 1, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
    const pixels = Buffer.alloc(width! * height! * 3)
    for (let pixel = 0; pixel < width! * height!; pixel++) pixels[pixel * 3 + index] = 255
    const compressed = deflateSync(pixels)
    add(id + 2, Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${compressed.length} >>\nstream\n`), compressed, Buffer.from('\nendstream')]))
  }
  const xref = parts.reduce((total, part) => total + part.length, 0)
  parts.push(Buffer.from(`xref\n0 12\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 12 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`))
  return Buffer.concat(parts).toString('base64')
}

/** One page with independently decoded XObjects; the limit must apply before getOperatorList resolves. */
function imageBudgetPdf(count: number, width: number, height: number) {
  const parts: Buffer[] = [Buffer.from('%PDF-1.4\n')], offsets = [0]
  const add = (id: number, content: Buffer | string) => {
    offsets[id] = parts.reduce((total, part) => total + part.length, 0)
    parts.push(Buffer.from(`${id} 0 obj\n`), Buffer.isBuffer(content) ? content : Buffer.from(content), Buffer.from('\nendobj\n'))
  }
  add(1, '<< /Type /Catalog /Pages 2 0 R >>')
  add(2, '<< /Type /Pages /Count 1 /Kids [3 0 R] >>')
  const resources = Array.from({ length: count }, (_, index) => `/Im${index} ${5 + index} 0 R`).join(' ')
  add(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 450] /Resources << /XObject << ${resources} >> >> /Contents 4 0 R >>`)
  const content = Array.from({ length: count }, (_, index) => `q 600 0 0 450 0 0 cm /Im${index} Do Q`).join('\n')
  add(4, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
  for (let index = 0; index < count; index++) {
    const compressed = deflateSync(Buffer.alloc(width * height * 3, index + 1))
    add(5 + index, Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${compressed.length} >>\nstream\n`), compressed, Buffer.from('\nendstream')]))
  }
  const xref = parts.reduce((total, part) => total + part.length, 0), size = 5 + count
  parts.push(Buffer.from(`xref\n0 ${size}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`))
  return Buffer.concat(parts).toString('base64')
}

function jpegPdf(base64: string) {
  const jpeg = Buffer.from(base64, 'base64'), parts: Buffer[] = [Buffer.from('%PDF-1.4\n')], offsets = [0]
  const add = (id: number, content: Buffer | string) => {
    offsets[id] = parts.reduce((total, part) => total + part.length, 0)
    parts.push(Buffer.from(`${id} 0 obj\n`), Buffer.isBuffer(content) ? content : Buffer.from(content), Buffer.from('\nendobj\n'))
  }
  add(1, '<< /Type /Catalog /Pages 2 0 R >>')
  add(2, '<< /Type /Pages /Count 1 /Kids [3 0 R] >>')
  add(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 337.5] /Resources << /XObject << /Photo 5 0 R >> >> /Contents 4 0 R >>')
  const content = 'q 600 0 0 337.5 0 0 cm /Photo Do Q'
  add(4, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`)
  add(5, Buffer.concat([Buffer.from(`<< /Type /XObject /Subtype /Image /Width 2400 /Height 1350 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`), jpeg, Buffer.from('\nendstream')]))
  const xref = parts.reduce((total, part) => total + part.length, 0)
  parts.push(Buffer.from(`xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`))
  return Buffer.concat(parts).toString('base64')
}

test('ekte raster velges med kilde; motiv erklæres ikke identifisert og bytte fjerner gammelt bilde', async ({ page }) => {
  const external: string[] = []
  await page.route('**/*', route => {
    if (!route.request().url().startsWith(origin)) { external.push(route.request().url()); return route.abort() }
    return route.continue()
  })
  await page.goto(`${origin}/__property-image-test`)
  await expect(page.getByText('Last opp en salgsoppgave for å se dokumentet.')).toBeVisible()
  await page.evaluate(async base64 => {
    await (window as unknown as { showDocument: (bytes: string, name: string) => Promise<void> }).showDocument(base64, 'syntetisk-bilder.pdf')
  }, imagePdf())
  await expect(page.locator('canvas[data-preview-kind="image"]')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('figcaption')).toContainText('syntetisk-bilder.pdf · fysisk PDF-side 2')
  await expect(page.locator('figcaption')).toContainText('motivet er ikke identifisert')
  expect(await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => [...canvas.getContext('2d')!.getImageData(10, 10, 1, 1).data])).toEqual([0, 255, 0, 255])
  await page.getByRole('button', { name: 'Åpne originaldokument' }).click()
  expect(await page.evaluate(() => (window as unknown as { opens: number }).opens)).toBe(1)
  expect(await page.evaluate(() => (window as unknown as { openedPage: number }).openedPage)).toBe(2)
  await page.evaluate(async () => {
    await (window as unknown as { showDocument: (bytes: string | null, name: string) => Promise<void> }).showDocument(null, '')
  })
  await expect(page.getByText('Last opp en salgsoppgave for å se dokumentet.')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('figcaption')).toHaveCount(0)
  expect(external).toEqual([])
})

test('uten egnet raster vises hele originalside1; ugyldig nytt dokument beholder ingen gammel visning', async ({ page }) => {
  const failures: string[] = []
  page.on('pageerror', error => failures.push(error.message))
  await page.goto(`${origin}/__property-image-test`)
  await expect(page.getByText('Last opp en salgsoppgave for å se dokumentet.')).toBeVisible()
  await page.evaluate(async base64 => {
    await (window as unknown as { showDocument: (bytes: string, name: string) => Promise<void> }).showDocument(base64, 'original-uten-foto.pdf')
  }, imagePdf(false))
  await expect(page.locator('canvas[data-preview-kind="page"]')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('figcaption')).toContainText('original-uten-foto.pdf · fysisk PDF-side 1')
  await expect(page.locator('figcaption')).toContainText('Originalside, ikke et identifisert eiendomsfoto.')
  await page.evaluate(async () => {
    await (window as unknown as { showDocument: (bytes: string, name: string) => Promise<void> }).showDocument('', 'tom.pdf')
  })
  await expect(page.getByText('Dokumentforhåndsvisning er utilgjengelig. Åpne originalen.')).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(0)
  await expect(page.locator('figcaption')).toContainText('tom.pdf')
  await expect(page.locator('figcaption')).not.toContainText('original-uten-foto.pdf')
  expect(failures).toEqual([])
})

for (const [name, count, width, height] of [['samlet8Mp', 5, 1400, 1400], ['maks24raster', 25, 64, 64]] as const) {
  test(`${name}: stor flerbilde-PDF sperres i worker og ny original kan åpnes etter cleanup`, async ({ page }) => {
    const failures: string[] = []
    page.on('pageerror', error => failures.push(error.message))
    await page.goto(`${origin}/__property-image-test`)
    await expect(page.getByText('Last opp en salgsoppgave for å se dokumentet.')).toBeVisible()
    await page.evaluate(async base64 => {
      await (window as unknown as { showDocument: (bytes: string, name: string) => Promise<void> }).showDocument(base64, 'mange-raster.pdf')
    }, imageBudgetPdf(count, width, height))
    await expect(page.getByText('Dokumentforhåndsvisningen nådde ressursgrensen. Åpne originalen.')).toBeVisible({ timeout: 15_000 })
    expect(await page.evaluate(() => (window as unknown as { previewWorkers: { budget: unknown } }).previewWorkers.budget))
      .toEqual(name === 'samlet8Mp' ? { images: 4, pixels: 7_840_000 } : { images: 24, pixels: 98_304 })
    await expect.poll(() => page.evaluate(() => (window as unknown as { previewWorkers: { terminated: number } }).previewWorkers.terminated)).toBe(1)
    await expect(page.locator('canvas')).toHaveCount(0)
    await page.evaluate(async base64 => {
      await (window as unknown as { showDocument: (bytes: string, name: string) => Promise<void> }).showDocument(base64, 'etter-ressursstopp.pdf')
    }, imagePdf(false))
    await expect(page.locator('canvas[data-preview-kind="page"]')).toBeVisible({ timeout: 15_000 })
    await expect(page.locator('figcaption')).toContainText('etter-ressursstopp.pdf · fysisk PDF-side 1')
    await expect.poll(() => page.evaluate(() => (window as unknown as { previewWorkers: { terminated: number } }).previewWorkers.terminated)).toBe(2)
    expect(failures).toEqual([])
  })
}

test('2400×1350 JPEG tegnes fra native dekodet kilde uten illustrasjonsfallback', async ({ page }) => {
  await page.goto(`${origin}/__property-image-test`)
  await expect(page.getByText('Last opp en salgsoppgave for å se dokumentet.')).toBeVisible()
  const jpeg = await page.evaluate(() => {
    const canvas = document.createElement('canvas'); canvas.width = 2400; canvas.height = 1350
    const context = canvas.getContext('2d')!
    context.fillStyle = 'rgb(32,128,224)'; context.fillRect(0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.9).split(',')[1]!
  })
  await page.evaluate(async base64 => {
    await (window as unknown as { showDocument: (bytes: string, name: string) => Promise<void> }).showDocument(base64, 'syntetisk-jpeg.pdf')
  }, jpegPdf(jpeg))
  await expect(page.locator('canvas[data-preview-kind="image"]')).toBeVisible({ timeout: 15_000 })
  await expect(page.locator('figcaption')).toContainText('syntetisk-jpeg.pdf · fysisk PDF-side 1')
  const channels = await page.locator('canvas').evaluate((canvas: HTMLCanvasElement) => [...canvas.getContext('2d')!.getImageData(10, 10, 1, 1).data])
  expect(Math.abs(channels[0]! - 32)).toBeLessThanOrEqual(3)
  expect(Math.abs(channels[1]! - 128)).toBeLessThanOrEqual(3)
  expect(Math.abs(channels[2]! - 224)).toBeLessThanOrEqual(3)
  expect(channels[3]).toBe(255)
  await expect.poll(() => page.evaluate(() => (window as unknown as { previewWorkers: { terminated: number } }).previewWorkers.terminated)).toBe(1)
})
