import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/components', fullyParallel: true, retries: 0, reporter: 'list',
  use: { browserName: 'chromium', viewport: { width: 1440, height: 900 },
    screenshot: 'only-on-failure', trace: 'retain-on-failure' },
})
