import { test, expect } from '@playwright/test'
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'

let server: ViteDevServer, origin: string
const cacheDir = `node_modules/.vite-financing-${process.pid}`
test.beforeAll(async () => {
  server = await createServer({ cacheDir, optimizeDeps: { include: ['react', 'react-dom/client'] }, server: { host: '127.0.0.1', port: 0, watch: { ignored: ['**/private/**', '**/test-results/**'] } }, plugins: [{ name: 'financing-native-harness', configureServer(vite) {
    vite.middlewares.use('/__financing', async (_request, response) => {
      response.setHeader('Content-Type', 'text/html')
      response.end(await vite.transformIndexHtml('/__financing', `<!doctype html><html lang="nb"><body><div id="root"></div><script type="module">
        import React from '/${cacheDir}/deps/react.js'; import ReactDOM from '/${cacheDir}/deps/react-dom_client.js';
        import {ScenarioFinancing} from '/src/frontend/investment/ScenarioFinancing.tsx';
        import {calculateFinancialScenario} from '/src/domain/financial-scenario.ts';
        const inputs=JSON.parse(new URLSearchParams(location.search).get('basis'));
        const basis={...inputs,L:'288000',D:'36000',sharedAnnualPayment:'0',year:'2026',issues:[],provenance:{P:'Testgrunnlag',L:'Egen forutsetning',D:'Egen forutsetning',cashRequired:'Testgrunnlag',sharedAnnualPayment:'Testgrunnlag'}};
        function Harness(){const [controls,set]=React.useState({equity:'1000000',annualInterest:'8',months:'12'});const scenario=calculateFinancialScenario(basis,controls);
          return React.createElement(ScenarioFinancing,{basis,scenario,controls,onChange:set});}
        ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(Harness));
      </script></body></html>`))
    })
  } }] })
  await server.listen()
  const address = server.httpServer!.address()
  if (!address || typeof address === 'string') throw new Error('Testadresse mangler')
  origin = `http://127.0.0.1:${address.port}`
})
test.afterAll(async () => { await server?.close() })

for (const basis of [
  { P: '4050000', cashRequired: '4152340', sharedDebt: '0' },
  { P: '8600000', cashRequired: '8816090', sharedDebt: '0' },
  { P: '3000000', cashRequired: '2076090', sharedDebt: '1000000' },
]) test(`native belåningsslider beholder eksakte endepunkter ved Home, End og dragging: P=${basis.P}`, async ({ page }) => {
  await page.goto(`${origin}/__financing?basis=${encodeURIComponent(JSON.stringify(basis))}`)
  const slider = page.getByRole('slider', { name: 'Juster belåningsgrad', exact: true })
  const equity = page.locator('#scenario-equity')
  await slider.focus(); await slider.press('Home')
  await expect(equity).toHaveValue(basis.cashRequired)
  await slider.press('End')
  await expect(equity).toHaveValue(/^0(?:[.,]0+)?$/)
  await expect(slider).toBeVisible()
  await slider.press('Home')
  const bounds = await slider.boundingBox()
  if (!bounds) throw new Error('Slider mangler')
  await page.mouse.move(bounds.x + 4, bounds.y + bounds.height / 2)
  await page.mouse.down()
  await page.mouse.move(bounds.x + bounds.width + 20, bounds.y + bounds.height / 2, { steps: 10 })
  await page.mouse.up()
  await expect(equity).toHaveValue(/^0(?:[.,]0+)?$/)
  await expect(slider).toBeVisible()
  // Fritekst utenfor intervallet skal fortsatt avvises; bare native endestopp bindes.
  await page.locator('#scenario-leverage').fill('200')
  await expect(equity).toHaveValue('')
  await expect(page.getByText(/Oppgi belåningsgrad mellom/)).toBeVisible()
})
