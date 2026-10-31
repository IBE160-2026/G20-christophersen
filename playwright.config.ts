import { defineConfig } from '@playwright/test'

const port = Number(process.env.PAA_E2E_PORT ?? '3000')
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Ugyldig PAA_E2E_PORT')
const baseURL = `http://127.0.0.1:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['new-document-import.spec.ts', 'investment-overview.spec.ts', 'prospectus-import.spec.ts', 'listing-import.spec.ts', 'app-shell.spec.ts', 'financial-input.spec.ts', 'report-analysis.spec.ts', 'screening-result.spec.ts'],
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run demo',
    env: { PAA_PORT: String(port), ANALYSIS_MODE: 'demo', OPENAI_API_KEY: '', FINN_IMPORT_ENABLED: 'false', FINN_IMPORT_ACCESS_REFERENCE: '', FINN_IMPORT_COST_REFERENCE: '' },
    url: baseURL,
    reuseExistingServer: false,
  },
})
