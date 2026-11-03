import { visualGradeToken } from '../../contracts/local-visual.ts'
type Reading = { text: string; confidence: number }
/** Fullside og separat skiltutsnitt må være enige; confidence oppjusteres aldri. */
export function resolveLocalGrade(readings: readonly Reading[] | undefined) {
  if (readings?.length !== 2 || readings.some(reading => reading.confidence < 0.3)) return { grade: null, confidence: readings?.[1]?.confidence ?? 0 } as const
  const first = visualGradeToken(readings[0]!.text), second = visualGradeToken(readings[1]!.text)
  const confidence = Math.min(readings[0]!.confidence, readings[1]!.confidence)
  return first && first === second ? { grade: first, confidence, agreement: 'two-pass' as const } : { grade: null, confidence }
}
