import { defineConfig } from '@playwright/test'
import config from './playwright.config.ts'

export default defineConfig({
  ...config,
  testMatch: 'dev-shell.spec.ts',
  outputDir: './test-results/dev',
  webServer: {
    ...config.webServer,
    command: 'npm run dev',
  },
})
