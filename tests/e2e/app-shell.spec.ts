import { expect, test } from '@playwright/test'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { get } from 'node:http'
import { createHash } from 'node:crypto'
import { AnalysisHttpResponseSchema } from '../../src/contracts/analysis-http.ts'

test('Konsept A: PDF først, ukjente verdier og bevart kontrollport', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('Property Acquisition Agent')
  await expect(page.getByRole('heading', { name: 'Se eiendommens potensial.' })).toBeVisible()
  await expect(page.locator('#import-file-prospectus')).toBeVisible()
  await expect(page.getByTestId('scenario-gross')).toContainText('—')
  await expect(page.getByTestId('scenario-cash')).toContainText('—')
  await expect(page.locator('.investment-main')).not.toContainText('Eksempelveien')
  await page.getByTestId('open-financial-basis').click()
  const navigation = page.getByRole('navigation', { name: 'Vurderingens fire trinn' })
  await expect(navigation.getByRole('listitem')).toHaveCount(4)
  for (const name of ['Tilstandsrapport', 'Kontroller funn', 'Resultat']) {
    const step = navigation.getByRole('button', { name: new RegExp(name) })
    await expect(step).toHaveAttribute('aria-disabled', 'true')
    await expect(step).toHaveAccessibleDescription(/Krever .+/)
    await step.focus(); await step.press('Enter'); await step.press('Space')
    await step.click({ force: true }); await expect(page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('Konsept A: alle ressurser lokalt uten ekstern transport', async ({ context, page, baseURL }) => {
  const external: string[] = []
  await context.route('**/*', route => { const url = new URL(route.request().url()); if (url.origin === new URL(baseURL!).origin) return route.continue(); external.push(url.href); return route.abort() })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Se eiendommens potensial.' })).toBeVisible()
  expect(external).toEqual([])
})

test('AC5: HTTP serverer byggeutdata og avviser repo, private filer og ukjente API-ruter', async ({ request, baseURL }) => {
  const root = await request.get('/')
  expect(root.status()).toBe(200)
  const html = await root.text()
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1])
  expect(assets.length).toBeGreaterThanOrEqual(2)
  for (const path of assets) {
    const response = await request.get(path)
    expect(response.status()).toBe(200)
    expect(response.headers()['x-content-type-options']).toBe('nosniff')
  }
  expect((await request.get(assets[0], { headers: { 'If-Match': '"mismatched-etag"' } })).status()).toBe(412)
  expect((await request.get(assets[0], { headers: { Range: 'bytes=999999999-' } })).status()).toBe(416)
  // En eksisterende privat fil må forbli utilgjengelig, også om serverrot endres ved en feil.
  await mkdir('private', { recursive: true })
  const probe = await mkdtemp(resolve('private/story-1-2-'))
  try {
    await writeFile(resolve(probe, 'private.txt'), 'FICTIONAL-PRIVATE-STORY12-PROBE')
    const path = `/${relative(process.cwd(), probe).replaceAll('\\', '/')}/private.txt`
    const response = await request.get(path)
    expect(response.status()).toBe(404)
    expect(await response.text()).not.toContain('FICTIONAL-PRIVATE-STORY12-PROBE')
  } finally {
    await rm(probe, { recursive: true, force: true })
  }
  for (const path of [
    '/package.json', '/package-lock.json', '/README.md', '/AGENTS.md', '/.git/HEAD',
    '/.env', '/.env.local', '/src/backend/server.ts', '/src/frontend/App.tsx',
    '/.docs/specs/spec-IBE160/SPEC.md', '/private/report.pdf', '/assets/missing.js',
    '/%2e%2e/package.json', '/assets/%2e%2e/%2e%2e/.env', '/api', '/api/analysis',
  ]) {
    const response = await request.get(path)
    expect(response.status(), path).toBe(404)
    if (path.startsWith('/api')) {
      expect(response.headers()['content-type']).toContain('application/json')
      expect(await response.json()).toEqual({ error: 'api-route-unavailable' })
    } else {
      expect(response.headers()['content-type']).toContain('text/plain')
      expect(await response.text()).toBe('Fant ikke ressursen.')
    }
  }
  // node:http beholder request-target; nettleser/APIRequestContext normaliserer /%2e%2e/.
  for (const path of ['/../package.json', '/%2e%2e/package.json', '/assets/%2e%2e/%2e%2e/.env']) {
    const response = await new Promise<{ status: number | undefined, body: string }>((resolve, reject) => {
      const target = new URL(baseURL!)
      get({ hostname: target.hostname, port: target.port, path }, (response) => {
        let body = ''
        response.setEncoding('utf8')
        response.on('data', (chunk: string) => { body += chunk })
        response.on('end', () => resolve({ status: response.statusCode, body }))
        response.on('error', reject)
      }).on('error', reject)
    })
    expect(response, path).toEqual({ status: 404, body: 'Fant ikke ressursen.' })
  }
})

test('Konsept A: komposisjon og typografi følger godkjent retning', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.hero-title')).toBeVisible()
  const styles = await page.evaluate(() => {
    const css = (s: string) => getComputedStyle(document.querySelector(s)!)
    const hero = document.querySelector('.hero')!.getBoundingClientRect()
    const image = document.querySelector('.hero-visual')!.getBoundingClientRect()
    return { background: css('.investment-shell').backgroundColor, title: css('.hero-title').fontFamily, size: parseFloat(css('.hero-title').fontSize), columns: css('.investment-kpis').gridTemplateColumns.split(' ').length, imageWidth: image.width / hero.width }
  })
  expect(styles.background).toBe('rgb(247, 248, 245)'); expect(styles.title).toContain('Georgia'); expect(styles.size).toBeGreaterThan(50); expect(styles.columns).toBe(3); expect(styles.imageWidth).toBeGreaterThan(.4)
})
for (const width of [320, 390, 768, 1024, 1440]) test(`Konsept A: ombryting, dialog og tastatur ved ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 900 }); await page.goto('/')
  await expect(page.locator('.hero-title')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.keyboard.press('Tab'); await expect(page.getByRole('link', { name: 'Hopp til arbeidsinnhold' })).toBeFocused()
  await page.keyboard.press('Enter'); await expect(page.locator('#investment-title')).toBeFocused()
  const opener = page.getByRole('button', { name: 'Eiendommen', exact: true }); await opener.click()
  await expect(page.getByRole('dialog')).toBeVisible()
  expect(await page.getByRole('dialog').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true)
  await page.keyboard.press('Escape'); await expect(opener).toBeFocused()
})

test('Story 2.5: faktisk demoserver analyserer én multipart-PDF med backendhash og korrelasjon', async ({ request }) => {
  const name = 'F1-tilstandsrapport.pdf'
  const bytes = await readFile(new URL(`../fixtures/property-cases/${name}`, import.meta.url))
  const correlation = { sessionId: 'production-http-smoke', requestId: 'production-request', generation: 7 }
  const response = await request.post('/api/analysis', {
    headers: { 'X-Session-Id': correlation.sessionId, 'X-Request-Id': correlation.requestId, 'X-Analysis-Generation': String(correlation.generation) },
    multipart: { file: { name, mimeType: 'application/pdf', buffer: bytes } },
  })
  expect(response.status()).toBe(200)
  const body = AnalysisHttpResponseSchema.parse(await response.json())
  expect(body).toMatchObject({ kind: 'analysis', correlation, outcome: {
    status: 'completed', requestId: correlation.requestId, reportHash: createHash('sha256').update(bytes).digest('hex'),
    mode: 'demo', documentName: name, pageCount: 4, findings: [{ findingId: 'F1-TG2-1', grade: 'TG2' }],
  } })
})

test('4.3 startup: invalid or secret-bearing metadata blocks boot without a mode fallback', async ({ page }) => {
  await page.route('**/api/analysis-config', route => route.fulfill({ json: { mode: 'live', apiKey: 'fictional-must-not-be-trusted' } }))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Arbeidsflaten kunne ikke lastes' })).toBeVisible()
  await expect(page.getByText('Last siden på nytt for å hente lokal analysemodus.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Start analyse', exact: true })).toHaveCount(0)
  await expect(page.getByText('fictional-must-not-be-trusted')).toHaveCount(0)
})

test('4.3 startup: stalled metadata shows status and a bounded safe error', async ({ page }) => {
  await page.clock.install()
  let release!: () => void
  const held = new Promise<void>(resolve => { release = resolve })
  await page.route('**/api/analysis-config', async route => {
    await held
    await route.fulfill({ json: { mode: 'demo' } }).catch(() => undefined)
  })
  try {
    await page.goto('/')
    await expect(page.getByRole('status')).toHaveText('Laster arbeidsflaten …')
    await page.clock.fastForward(10_000)
    await expect(page.getByRole('heading', { name: 'Arbeidsflaten kunne ikke lastes' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Start analyse', exact: true })).toHaveCount(0)
  } finally { release() }
})
