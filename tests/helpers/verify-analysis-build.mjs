// Fiktiv verdi genereres i minnet; ingen nøkkel eller rå bygg-/serverlogg skrives.
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readdir, readFile } from 'node:fs/promises'
import { once } from 'node:events'
import { pathToFileURL } from 'node:url'

function killOwned(child, signal, group = false) {
  try {
    if (group && child.pid) process.kill(-child.pid, signal)
    else child.kill(signal)
  } catch { /* Prosessen kan allerede være avsluttet. close avventes av eieren. */ }
}

export async function runBuild(command, args, environment, timeoutMs = 120_000) {
  // Egen prosessgruppe gjør at også npm-eide tsc/Vite-barn stoppes ved fristen.
  const build = spawn(command, args, { env: environment, detached: true, stdio: ['ignore', 'pipe', 'pipe'] })
  let output = ''
  build.stdout.on('data', chunk => { output += chunk })
  build.stderr.on('data', chunk => { output += chunk })
  let expired = false
  const timer = setTimeout(() => { expired = true; killOwned(build, 'SIGKILL', true) }, timeoutMs)
  try {
    const [code] = await once(build, 'close')
    if (expired) throw new Error('Byggfristen ble overskredet.')
    if (code !== 0) throw new Error('Bygget kunne ikke fullføres.')
    return output
  } catch {
    killOwned(build, 'SIGKILL', true)
    throw new Error(expired ? 'Byggfristen ble overskredet.' : 'Bygget kunne ikke fullføres.')
  } finally { clearTimeout(timer) }
}

export async function probeHttp(url, key, timeoutMs = 10_000) {
  const abort = new AbortController()
  const timer = setTimeout(() => abort.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: abort.signal })
    assert.equal(response.status, 200)
    assert.ok(!(await response.text()).includes(key), 'Nøkkel i HTTP-svar')
  } catch { throw new Error('HTTP-kontrollen kunne ikke fullføres innen fristen.') }
  finally { clearTimeout(timer); abort.abort() }
}

export async function stopChild(child, closed, graceMs = 2_000) {
  const timer = setTimeout(() => killOwned(child, 'SIGKILL'), graceMs)
  try {
    killOwned(child, 'SIGTERM')
    await closed
  } finally { clearTimeout(timer) }
}

export function buildEnvironment(parent, key) {
  return { ...parent, ANALYSIS_MODE: 'demo', OPENAI_API_KEY: key, OPENAI_LOG: 'debug' }
}

async function main() {
  const key = `fictional-${crypto.randomUUID()}`
  const environment = buildEnvironment(process.env, key)
  const buildOutput = await runBuild('npm', ['run', 'build'], environment)
  assert.ok(!buildOutput.includes(key), 'Nøkkel i bygglogg')
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
    clearTimeout(timer)
    await probeHttp('http://127.0.0.1:3000/', key)
  } finally {
    clearTimeout(timer)
    await stopChild(server, closed)
  }
  assert.ok(!output.includes(key), 'Nøkkel i oppstartslogg')
  console.log(`build og demooppstart: bestått; frontendfiler kontrollert: ${files}; nøkkellekkasjer: 0`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(() => {
    console.error('Bygg-/oppstartskontrollen feilet. Kontroller lokale verktøy og tidsfrister.')
    process.exitCode = 1
  })
}
