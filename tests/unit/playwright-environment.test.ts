import { expect, it, vi } from 'vitest'

it('begge Playwright-servere overstyrer arvet live og nøkkel med demo/tom nøkkel', async () => {
  vi.stubEnv('ANALYSIS_MODE', 'live')
  vi.stubEnv('OPENAI_API_KEY', 'fictional-inherited-key')
  try {
    const { default: built } = await import('../../playwright.config.ts')
    const { default: dev } = await import('../../playwright.dev.config.ts')
    for (const config of [built, dev]) {
      expect(config.webServer).toMatchObject({ env: { ANALYSIS_MODE: 'demo', OPENAI_API_KEY: '' }, reuseExistingServer: false })
    }
    expect(built.webServer).toMatchObject({ command: 'npm run demo' })
    expect(dev.webServer).toMatchObject({ command: 'npm run dev' })
  } finally { vi.unstubAllEnvs() }
})
