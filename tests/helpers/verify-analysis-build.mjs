// Fiktiv verdi genereres i minnet; ingen nøkkel eller rå bygg-/serverlogg skrives.
import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { once } from 'node:events'

const key = `fictional-${crypto.randomUUID()}`
const environment = { ...process.env, OPENAI_API_KEY: key, OPENAI_LOG: 'debug' }
const build = spawnSync('npm', ['run', 'build'], { env: environment, encoding: 'utf8' })
assert.equal(build.status, 0, 'Build må være grønn')
assert.ok(!(build.stdout + build.stderr).includes(key), 'Nøkkel i bygglogg')
let files = 0
async function inspectBuild(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), directory)
    if (entry.isDirectory()) await inspectBuild(path)
    else {
      const content = await readFile(path)
      assert.ok(!content.includes(Buffer.from(key)), 'Nøkkel i frontendbuild')
      assert.ok(!/OPENAI_API_KEY|api\.openai\.com|gpt-6\.1-sol/.test(content.toString()), 'Backendkonfigurasjon i frontendbuild')
      files++
    }
  }
}
await inspectBuild(new URL('../../dist/', import.meta.url))
assert.ok(files > 0)

const server = spawn(process.execPath, ['src/backend/server.ts'], { env: environment, stdio: ['ignore', 'pipe', 'pipe'] })
const closed = once(server, 'close')
let output = ''
let ready
const started = new Promise(resolve => { ready = resolve })
server.stdout.on('data', chunk => { output += chunk; if (output.includes(' · Demo · http://127.0.0.1:3000')) ready() })
server.stderr.on('data', chunk => { output += chunk })
let timer
try {
  await Promise.race([started, closed.then(() => { throw new Error('Server avsluttet før oppstart') }), new Promise((_resolve, reject) => { timer = setTimeout(() => reject(new Error('Oppstartsfrist')), 10_000) })])
  const response = await fetch('http://127.0.0.1:3000/')
  assert.equal(response.status, 200)
  assert.ok(!(await response.text()).includes(key), 'Nøkkel i HTTP-svar')
} finally {
  clearTimeout(timer)
  server.kill('SIGTERM')
  await closed
}
assert.ok(!output.includes(key), 'Nøkkel i oppstartslogg')
console.log(`build og demooppstart: bestått; frontendfiler kontrollert: ${files}; nøkkellekkasjer: 0`)
