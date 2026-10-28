import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['listing-import.spec.ts', 'app-shell.spec.ts', 'financial-input.spec.ts', 'report-analysis.spec.ts', 'screening-result.spec.ts'],
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:3000',
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run demo',
    env: { ANALYSIS_MODE: 'demo', OPENAI_API_KEY: '', FINN_IMPORT_ENABLED: 'false', FINN_IMPORT_ACCESS_REFERENCE: '', FINN_IMPORT_COST_REFERENCE: '' },
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: false,
  },
})
