import { expect, test } from '@playwright/test'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { get } from 'node:http'

test('AC1/AC3: bygget skall starter med riktig status og sperret videregang', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveTitle('Property Acquisition Agent')
  await expect(page.getByRole('banner').getByText('Property Acquisition Agent', { exact: true })).toBeVisible()
  await expect(page.getByText('Demo · lagret KI-uttrekk', { exact: true })).toBeVisible()
  const navigation = page.getByRole('navigation', { name: 'Vurderingens fire trinn' })
  await expect(navigation.getByRole('listitem')).toHaveCount(4)
  const steps = navigation.getByRole('listitem')
  for (const [index, name] of ['Tallgrunnlag', 'Tilstandsrapport', 'Kontroller funn', 'Resultat'].entries()) {
    await expect(steps.nth(index).locator('.step-number')).toHaveText(String(index + 1))
    await expect(steps.nth(index).locator('.step-name')).toHaveText(name)
    await expect(steps.nth(index).locator('.step-status')).toHaveText(index === 0
      ? 'Trinn 1 · Gjeldende' : `Trinn ${index + 1} · Gjenstår · Utilgjengelig`)
  }
  await expect(navigation.getByRole('link')).toHaveAttribute('aria-current', 'step')
  await expect(navigation.getByRole('link')).toContainText('Trinn 1 · Gjeldende')
  for (const name of ['Tilstandsrapport', 'Kontroller funn', 'Resultat']) {
    const step = navigation.getByRole('button', { name: new RegExp(name) })
    await expect(step).toHaveAttribute('aria-disabled', 'true')
    await expect(step).toContainText('Gjenstår · Utilgjengelig')
    await expect(step).toHaveAccessibleDescription(/Krever .+/)
    // Prøv både peker og tastatur; aria-disabled alene sperrer ikke hendelser.
    await step.click({ force: true })
    await step.focus()
    await step.press('Enter')
    await step.press('Space')
    await expect(page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })).toBeVisible()
  }
  await expect(page.getByRole('heading', { name: 'Registrer finansverdier' })).toBeVisible()
  await expect(page.getByText('Ubekreftet tallgrunnlag', { exact: true })).toBeVisible()
  await expect(navigation.getByText('Fullført', { exact: true })).toHaveCount(0)
  await expect(page.locator('input')).toHaveCount(13)
  await expect(page.locator('select')).toHaveCount(9)
  await expect(page.locator('textarea, form')).toHaveCount(0)
  expect(errors).toEqual([])
})

test('AC1: eksterne nettforespørsler er sperret mens alle appressurser lastes lokalt', async ({ context, page }) => {
  const external: string[] = []
  await context.route('**/*', (route) => {
    const url = new URL(route.request().url())
    if (url.origin === 'http://127.0.0.1:3000') return route.continue()
    external.push(url.href)
    return route.abort('blockedbyclient')
  })
  const responses: number[] = []
  page.on('response', (response) => responses.push(response.status()))
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Registrer finansverdier' })).toBeVisible()
  expect(external).toEqual([])
  expect(responses.every((status) => status === 200)).toBe(true)
  // Kontrollprobe beviser at sperren faktisk avviser eksternt nett.
  const blocked = await page.evaluate(async () => {
    try { await fetch('https://example.org/ibe160-offline-probe'); return false }
    catch { return true }
  })
  expect(blocked).toBe(true)
  expect(external).toEqual(['https://example.org/ibe160-offline-probe'])
})

test('AC5: HTTP serverer byggeutdata og avviser repo, private filer og ukjente API-ruter', async ({ request }) => {
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
    expect(response.headers()['content-type']).toContain('text/plain')
    expect(await response.text()).toBe(path.startsWith('/api')
      ? 'API-ruten er ikke tilgjengelig.' : 'Fant ikke ressursen.')
  }
  // node:http beholder request-target; nettleser/APIRequestContext normaliserer /%2e%2e/.
  for (const path of ['/../package.json', '/%2e%2e/package.json', '/assets/%2e%2e/%2e%2e/.env']) {
    const response = await new Promise<{ status: number | undefined, body: string }>((resolve, reject) => {
      get({ hostname: '127.0.0.1', port: 3000, path }, (response) => {
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

test('AC4: faktisk typografi, palett, geometri og kontrast følger DESIGN', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Registrer finansverdier' })).toBeVisible()
  const style = await page.evaluate(() => {
    const css = (selector: string) => getComputedStyle(document.querySelector(selector)!)
    const ratio = (foreground: string, background: string) => {
      const luminance = (color: string) => {
        const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((channel) => {
          const value = channel / 255
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
        })
        return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
      }
      const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a)
      return (values[0] + 0.05) / (values[1] + 0.05)
    }
    const main = css('.workspace'), header = css('.app-header'), body = css('body'), root = css(':root')
    const title = css('h1'), empty = css('.financial-input'), status = css('.status-label')
    const current = css('.step-current .step-number'), control = css('.step-control')
    const focus = root.getPropertyValue('--focus-ring').trim().toLowerCase()
    const contrast = {
      primary: ratio(body.color, header.backgroundColor),
      secondary: ratio(css('.meta').color, header.backgroundColor),
      status: ratio(status.color, status.backgroundColor),
      current: ratio(current.color, current.backgroundColor),
      border: ratio(css('.step:not(.step-current) .step-number').borderColor, header.backgroundColor),
    }
    return {
      page: root.backgroundColor, white: header.backgroundColor, ink: title.color,
      text: body.color, secondary: css('.meta').color, petrol: current.backgroundColor,
      font: body.fontFamily, bodySize: body.fontSize, titleSize: title.fontSize,
      titleWeight: title.fontWeight, titleLineHeight: title.lineHeight,
      gutter: main.paddingLeft, sectionGap: main.paddingTop,
      controlHeight: control.minHeight, controlRadius: control.borderRadius,
      groupRadius: empty.borderRadius, focus, contrast,
    }
  })
  expect(style).toMatchObject({
    page: 'rgb(241, 245, 244)', white: 'rgb(255, 255, 255)', ink: 'rgb(37, 52, 54)',
    text: 'rgb(36, 53, 55)', secondary: 'rgb(82, 104, 101)', petrol: 'rgb(34, 102, 95)',
    bodySize: '14px', titleSize: '24px', titleWeight: '600', titleLineHeight: '30px',
    gutter: '32px', sectionGap: '24px', controlHeight: '36px', controlRadius: '4px',
    groupRadius: '6px', focus: '#22665f',
  })
  expect(style.font).toContain('system-ui')
  for (const role of ['primary', 'secondary', 'status', 'current'] as const) {
    expect(style.contrast[role], role).toBeGreaterThanOrEqual(4.5)
  }
  expect(style.contrast.border).toBeGreaterThanOrEqual(3)
  console.log('Målt kontrast i bygget app:', JSON.stringify(style.contrast))
})

for (const viewport of [
  { width: 1440, height: 900 }, { width: 1280, height: 800 },
  { width: 720, height: 450 }, { width: 640, height: 400 },
  { width: 360, height: 225 }, { width: 320, height: 200 },
  { width: 360, height: 160 }, { width: 320, height: 160 },
]) {
  test(`AC4: tastatur, ombryting og fokus uten overlapp ved ${viewport.width}×${viewport.height}`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Registrer finansverdier' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.keyboard.press('Tab')
    await expect(page.getByRole('link', { name: 'Hopp til arbeidsinnhold' })).toBeFocused()
    await page.keyboard.press('Enter')
    const heading = page.getByRole('heading', { name: 'Tallgrunnlag', exact: true })
    await expect(heading).toBeFocused()
    const nav = await page.getByRole('navigation').boundingBox()
    const title = await heading.boundingBox()
    expect(title!.y).toBeGreaterThanOrEqual(nav!.y + nav!.height)
    await page.goto('/')
    for (let index = 0; index < 6; index++) {
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      const focus = await focused.evaluate((element) => {
        const style = getComputedStyle(element)
        const box = element.getBoundingClientRect()
        const parent = element.closest('nav')?.getBoundingClientRect()
        const extent = Math.max(0, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset))
        const luminance = (color: string) => {
          const channels = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((channel) => {
            const value = channel / 255
            return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
          })
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
        }
        const surface = element.closest('nav') ?? (element.matches('.skip-link')
          ? document.querySelector('.app-header')! : document.documentElement)
        const values = [luminance(style.outlineColor), luminance(getComputedStyle(surface).backgroundColor)].sort((a, b) => b - a)
        return { outline: style.outlineStyle, width: style.outlineWidth, top: box.top - extent,
          bottom: box.bottom + extent, left: box.left - extent, right: box.right + extent,
          color: style.outlineColor, contrast: (values[0] + 0.05) / (values[1] + 0.05),
          parentTop: parent?.top, parentBottom: parent?.bottom }
      })
      expect(focus.outline).toBe('solid')
      expect(focus.width).toBe('2px')
      expect(focus.color).toBe('rgb(34, 102, 95)')
      expect(focus.contrast).toBeGreaterThanOrEqual(3)
      expect(focus.top).toBeGreaterThanOrEqual(0)
      expect(focus.bottom).toBeLessThanOrEqual(viewport.height)
      expect(focus.left).toBeGreaterThanOrEqual(0)
      expect(focus.right).toBeLessThanOrEqual(viewport.width)
      if (focus.parentTop !== undefined) {
        expect(focus.top).toBeGreaterThanOrEqual(focus.parentTop)
        expect(focus.bottom).toBeLessThanOrEqual(focus.parentBottom!)
      }
    }
    if (viewport.width <= 720) {
      const workspace = page.getByRole('main')
      const before = await page.getByRole('navigation').boundingBox()
      await workspace.focus()
      await Promise.all([
        workspace.evaluate((element) => new Promise<void>((resolve) => {
          element.addEventListener('scrollend', () => resolve(), { once: true })
        })),
        page.keyboard.press('PageDown'),
      ])
      await expect.poll(() => workspace.evaluate((element) => element.scrollTop)).toBeGreaterThan(0)
      expect(await page.getByRole('navigation').boundingBox()).toEqual(before)
      await heading.focus()
      const title = await heading.boundingBox()
      const work = await workspace.boundingBox()
      expect(title!.y - 5).toBeGreaterThanOrEqual(before!.y + before!.height)
      expect(title!.y + title!.height + 5).toBeLessThanOrEqual(work!.y + work!.height)
    }
    const screenshot = testInfo.outputPath('appskall.png')
    await page.screenshot({ path: screenshot })
    await testInfo.attach('Appskall', { path: screenshot, contentType: 'image/png' })
  })
}
