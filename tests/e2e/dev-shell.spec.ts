import { expect, test } from '@playwright/test'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'

test('AC2: dev laster skallet og kobler HMR til samme lokale origin uten nettleserfeil', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  const connected = new Promise<string>((resolve) => {
    page.on('websocket', (socket) => {
      socket.on('framereceived', ({ payload }) => {
        if (JSON.parse(String(payload)).type === 'connected') resolve(socket.url())
      })
    })
  })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Ingen tall registrert' })).toBeVisible()
  expect(new URL(await connected).origin).toBe('ws://127.0.0.1:3000')
  expect(errors).toEqual([])
})

test('AC5: dev avviser eksisterende private dokumenter, backend og miljøfiler', async ({ request }) => {
  await mkdir('private', { recursive: true })
  const probe = await mkdtemp(resolve('private/story-1-2-dev-'))
  const marker = 'FICTIONAL-PRIVATE-STORY12-DEV-PROBE'
  try {
    await writeFile(resolve(probe, 'private.txt'), marker)
    const path = `/${relative(process.cwd(), probe).replaceAll('\\', '/')}/private.txt`
    for (const target of [path, '/src/backend/server.ts', '/.docs/specs/spec-IBE160/SPEC.md', '/.env', '/.git/HEAD']) {
      const response = await request.get(target)
      expect([403, 404], target).toContain(response.status())
      expect(await response.text()).not.toContain(marker)
    }
  } finally {
    await rm(probe, { recursive: true, force: true })
  }
})
