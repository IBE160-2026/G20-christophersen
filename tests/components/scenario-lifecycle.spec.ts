import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'
let server: ViteDevServer, origin: string
const cacheDir = `node_modules/.vite-scenario-lifecycle-${process.pid}`
test.beforeAll(async () => {
  server = await createServer({ cacheDir, optimizeDeps: { include: ['react', 'react-dom/client'] }, server: { host: '127.0.0.1', port: 0 }, plugins: [{ name: 'scenario-lifecycle-harness', configureServer(vite) {
    vite.middlewares.use('/__scenario-lifecycle', async (_req, res) => {
      res.setHeader('Content-Type', 'text/html')
      res.end(await vite.transformIndexHtml('/__scenario-lifecycle', `<!doctype html><html lang="nb"><body><div id="root"></div><script type="module">
        import React from '/${cacheDir}/deps/react.js'; import ReactDOM from '/${cacheDir}/deps/react-dom_client.js';
        import {useFinancialScenario} from '/src/frontend/investment/useFinancialScenario.ts';
        import {ScenarioChart} from '/src/frontend/investment/ScenarioChart.tsx';
        import {calculateFinancialScenario} from '/src/domain/financial-scenario.ts';
        const basis={P:'1000000',L:'120000',D:'20000',cashRequired:'1000000',sharedAnnualPayment:'0',year:'2026',issues:[],provenance:{P:'Test',L:'Egen forutsetning',D:'Egen forutsetning',cashRequired:'Test',sharedAnnualPayment:'Test'}};
        function Harness(){const [controls,set]=React.useState({equity:'1000000',annualInterest:'0',months:'12'});const {scenario,pending}=useFinancialScenario(basis,controls);
          return React.createElement('main',null,React.createElement('button',{onClick:()=>set({...controls,equity:controls.equity==='500000'?'750000':'500000'})},'Endre egenkapital'),React.createElement('output',{id:'cash'},scenario.cashFlow??'Ukjent'),React.createElement('output',{id:'yield'},scenario.grossYield??'Ukjent'),React.createElement('output',{id:'issues'},scenario.issues.join(' ')),React.createElement(ScenarioChart,{scenario,pending}));}
        window.deliver=(index)=>{const worker=window.testWorkers[index],request=worker.request;const result=calculateFinancialScenario(request.basis,request.controls);worker.onmessage?.({data:{kind:'base',requestId:request.requestId,scenario:result,error:null}})};
        const root=ReactDOM.createRoot(document.getElementById('root'));window.unmount=()=>root.unmount();root.render(React.createElement(Harness));
      </script></body></html>`))
    })
  } }] })
  await server.listen(); const address = server.httpServer!.address(); if (!address || typeof address === 'string') throw new Error('Testadresse mangler'); origin = `http://127.0.0.1:${address.port}`
})
test.afterAll(async () => { await server?.close() })
interface MockWorker { request: unknown; terminated: boolean; onerror: (() => void) | null }
interface HarnessWindow { testWorkers: MockWorker[]; deliver: (index: number) => void; unmount: () => void }
async function setup(page: Page) {
  await page.addInitScript(() => {
    const target = window as unknown as { testWorkers: unknown[] }
    target.testWorkers = []
    class FakeWorker {
      request: unknown; terminated = false; onmessage = null; onerror = null
      constructor() { target.testWorkers.push(this) }
      postMessage(request: unknown) { this.request = request }
      terminate() { this.terminated = true }
    }
    window.Worker = FakeWorker as unknown as typeof Worker
  })
  await page.goto(`${origin}/__scenario-lifecycle`)
  await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).testWorkers.length)).toBe(1)
}
test('sen workerrespons etter ny input og unmount kan ikke gjeninnføre gammelt scenario', async ({ page }) => {
  await setup(page)
  await page.evaluate(() => (window as unknown as HarnessWindow).deliver(0)); await expect(page.locator('#cash')).toHaveText('100000')
  await page.getByRole('button', { name: 'Endre egenkapital' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).testWorkers.length)).toBe(2)
  await expect(page.locator('#cash')).toHaveText('Ukjent'); await expect(page.locator('#yield')).toHaveText('12')
  await page.evaluate(() => (window as unknown as HarnessWindow).deliver(0)); await expect(page.locator('#cash')).toHaveText('Ukjent')
  await page.evaluate(() => (window as unknown as HarnessWindow).deliver(1)); await expect(page.locator('#cash')).toHaveText('-400000.04')
  expect(await page.evaluate(() => (window as unknown as HarnessWindow).testWorkers.every(worker => worker.terminated))).toBe(true)
  await page.getByRole('button', { name: 'Endre egenkapital' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).testWorkers.length)).toBe(3)
  await page.evaluate(() => { const harness = window as unknown as HarnessWindow; harness.unmount(); harness.deliver(2) })
  await expect(page.locator('#cash')).toHaveCount(0)
  expect(await page.evaluate(() => (window as unknown as HarnessWindow).testWorkers[2]!.terminated)).toBe(true)
})
test('hengende hovedworker termineres etter15sek; ingen gammel graf eller kontantstrøm vises', async ({ page }) => {
  await page.clock.install(); await setup(page); await page.clock.fastForward(15_001)
  await expect(page.locator('#issues')).toContainText('overskred 15 sekunder')
  await expect(page.locator('#cash')).toHaveText('Ukjent'); await expect(page.locator('.chart-svg')).toHaveCount(0)
  expect(await page.evaluate(() => (window as unknown as HarnessWindow).testWorkers[0]!.terminated)).toBe(true)
})
test('hengende renteworker termineres etter30sek og workerfeil blir synlig', async ({ page }) => {
  await page.clock.install(); await setup(page); await page.evaluate(() => (window as unknown as HarnessWindow).deliver(0))
  await page.getByRole('tab', { name: 'Rentefølsomhet' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).testWorkers.length)).toBe(2)
  await page.clock.fastForward(30_001)
  await expect(page.locator('.chart-unavailable')).toContainText('overskred 30 sekunder')
  expect(await page.evaluate(() => (window as unknown as HarnessWindow).testWorkers[1]!.terminated)).toBe(true)
  await page.getByRole('button', { name: 'Endre egenkapital' }).click()
  await expect.poll(() => page.evaluate(() => (window as unknown as HarnessWindow).testWorkers.length)).toBe(3)
  await page.evaluate(() => (window as unknown as HarnessWindow).testWorkers[2]!.onerror?.())
  await expect(page.locator('#issues')).toContainText('Scenarioet kunne ikke beregnes lokalt.')
  await expect(page.locator('#cash')).toHaveText('Ukjent')
})
