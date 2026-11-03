import { prepareLocalVisual } from './local-visual-ocr.ts'

const result = await prepareLocalVisual()
console.log(result.reason)
if (!result.available) process.exitCode = 1
