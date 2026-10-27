import assert from 'node:assert/strict'
import { test } from 'node:test'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:http'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { runBuild, probeHttp, stopChild, buildEnvironment } from './verify-analysis-build.mjs'

test('byggfrist stopper både eid byggprosess og dens barn med trygg feil', { timeout: 5_000 }, async () => {
  const directory = await mkdtemp(join(tmpdir(), 'ibe160-build-deadline-'))
  const pidFile = join(directory, 'pids.json')
  try {
    const source = `
      const {spawn} = require('node:child_process');
      const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)']);
      require('node:fs').writeFileSync(process.argv[1], JSON.stringify([process.pid, child.pid]));
      console.error('raw-build-detail');
      setInterval(() => {}, 1000);
    `
    await assert.rejects(runBuild(process.execPath, ['-e', source, pidFile], process.env, 500), { message: 'Byggfristen ble overskredet.' })
    const pids = JSON.parse(await readFile(pidFile, 'utf8'))
    for (const pid of pids) assert.throws(() => process.kill(pid, 0), { code: 'ESRCH' })
  } finally { await rm(directory, { recursive: true, force: true }) }
})

test('byggfeil eksponerer bare kodeeid feil', async () => {
  await assert.rejects(runBuild(process.execPath, ['-e', "console.error('raw-build-detail'); process.exit(1)"], process.env), { message: 'Bygget kunne ikke fullføres.' })
})

for (const bodyStarted of [false, true]) {
  test(`HTTP-frist avbryter ${bodyStarted ? 'uavsluttet body' : 'venting på headere'}`, { timeout: 5_000 }, async () => {
    const server = createServer((_request, response) => {
      if (bodyStarted) { response.writeHead(200); response.write('incomplete') }
    })
    server.listen(0, '127.0.0.1')
    await once(server, 'listening')
    try {
      await assert.rejects(probeHttp(`http://127.0.0.1:${server.address().port}/`, 'fictional', 100), { message: 'HTTP-kontrollen kunne ikke fullføres innen fristen.' })
    } finally {
      server.closeAllConnections()
      await new Promise(resolve => server.close(resolve))
    }
  })
}

for (const ignoreTerm of [false, true]) {
  test(`servercleanup avventer faktisk close (${ignoreTerm ? 'SIGTERM ignoreres' : 'normal stopp'})`, { timeout: 5_000 }, async () => {
    const child = spawn(process.execPath, ['-e', `${ignoreTerm ? "process.on('SIGTERM', () => {});" : ''} console.log('ready'); setInterval(() => {}, 1000)`], { stdio: ['ignore', 'pipe', 'pipe'] })
    const closed = once(child, 'close')
    try {
      await once(child.stdout, 'data')
      await stopChild(child, closed, 50)
      const [code, signal] = await closed
      assert.equal(code, null)
      assert.equal(signal, ignoreTerm ? 'SIGKILL' : 'SIGTERM')
      assert.throws(() => process.kill(child.pid, 0), { code: 'ESRCH' })
    } finally {
      child.kill('SIGKILL')
      await closed
    }
  })
}


test('arvet live erstattes med demo uten å fjerne fiktiv lekkasjesentinel', () => {
  const parent = { ANALYSIS_MODE: 'live', OPENAI_API_KEY: 'fictional-parent', PATH: '/controlled' }
  const environment = buildEnvironment(parent, 'fictional-build-sentinel')
  assert.equal(environment.ANALYSIS_MODE, 'demo')
  assert.equal(environment.OPENAI_API_KEY, 'fictional-build-sentinel')
  assert.equal(environment.OPENAI_LOG, 'debug')
  assert.equal(environment.PATH, '/controlled')
  assert.equal(parent.ANALYSIS_MODE, 'live')
})
