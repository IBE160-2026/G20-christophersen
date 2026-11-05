import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { expect, it } from 'vitest'

it('the actual extraction worker keeps the parent 256 MiB old-space cap and bounded young space', async () => {
  const { stdout } = await promisify(execFile)(process.execPath, ['--max-old-space-size=256', fileURLToPath(new URL('../helpers/import-heap-probe.ts', import.meta.url))], { env: {}, timeout: 10000, maxBuffer: 64 * 1024 })
  const result = JSON.parse(stdout) as { parentHeapLimit: number; workerHeapLimit: number; text: string }
  expect(result.parentHeapLimit).toBeGreaterThan(256 * 1024 * 1024)
  expect(result.workerHeapLimit).toBeGreaterThanOrEqual(256 * 1024 * 1024)
  expect(result.workerHeapLimit).toBeLessThanOrEqual(288 * 1024 * 1024)
  expect(result.text).toContain('Synthetic heap-cap probe')
})
