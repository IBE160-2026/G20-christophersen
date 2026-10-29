import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: { maxWorkers: 4, include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.ts'] },
})
