import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { expect, it } from 'vitest'
import { createImportRuntimeGuard, importRuntimeRevision } from '../../src/backend/http/import-runtime.ts'

it('oppdager endrede kildebytes før ny import, også uten ny Git-commit', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'paa-import-runtime-'))
  const roots = [pathToFileURL(directory + '/')]
  try {
    await writeFile(join(directory, 'contract.ts'), 'export const version = 1')
    const guard = createImportRuntimeGuard(roots)
    const loaded = await guard.revision
    expect(await guard.current()).toBe(true)
    await writeFile(join(directory, 'contract.ts'), 'export const version = 2')
    expect(await guard.current()).toBe(false)
    expect(await importRuntimeRevision(roots)).not.toBe(loaded)
    const restarted = createImportRuntimeGuard(roots)
    expect(await restarted.current()).toBe(true)
    await mkdir(join(directory, 'nested'))
    await writeFile(join(directory, 'nested', 'parser.ts'), 'new parser')
    expect(await restarted.current()).toBe(false)
  } finally { await rm(directory, { recursive: true, force: true }) }
})
