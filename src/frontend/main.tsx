import { AnalysisStartupSchema } from '../contracts/analysis-http.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles.css'

const root = createRoot(document.getElementById('root')!)
root.render(<main><p role="status">Laster arbeidsflaten …</p></main>)
async function start() {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch('/api/analysis-config', { cache: 'no-store', signal: controller.signal })
    if (!response.ok) throw new Error('Startup unavailable')
    const startup = AnalysisStartupSchema.parse(await response.json())
    root.render(<StrictMode><App mode={startup.mode} /></StrictMode>)
  } catch {
    root.render(<main><h1>Arbeidsflaten kunne ikke lastes</h1><p>Last siden på nytt for å hente lokal analysemodus.</p></main>)
  } finally {
    clearTimeout(timer)
    controller.abort()
  }
}
void start()
