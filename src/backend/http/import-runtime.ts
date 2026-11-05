import { createHash } from 'node:crypto'
import { readdir, readFile } from 'node:fs/promises'

const sourceRoots = [new URL('../', import.meta.url), new URL('../../contracts/', import.meta.url), new URL('../../domain/', import.meta.url)]

/** Hash source bytes, not Git HEAD: uncommitted edits can also make a running
 * parent incompatible with the fresh process it starts for every import.
 * Only repository-owned source is read; private documents and env are excluded.
 */
export async function importRuntimeRevision(roots: readonly URL[] = sourceRoots): Promise<string> {
  const hash = createHash('sha256')
  async function visit(directory: URL, prefix: string) {
    const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))
    for (const entry of entries) {
      const name = prefix + entry.name
      if (entry.isDirectory()) await visit(new URL(entry.name + '/', directory), name + '/')
      else if (entry.isFile() && /\.(?:ts|swift|json)$/.test(entry.name)) {
        const bytes = await readFile(new URL(entry.name, directory))
        hash.update(name + '\0' + bytes.length + '\0').update(bytes)
      }
    }
  }
  for (const [index, root] of roots.entries()) await visit(root, `${index}/`)
  return hash.digest('hex')
}

export function createImportRuntimeGuard(roots: readonly URL[] = sourceRoots) {
  const loaded = importRuntimeRevision(roots)
  return { revision: loaded, async current() { return await loaded === await importRuntimeRevision(roots) } }
}
