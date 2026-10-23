/** Counts independently assessed ORIGINAL findings; does not perform semantic matching. */
export type ExpectedFinding = { expectedId: string; grade: 'TG2' | 'TG3' }
export type Assessment = ExpectedFinding & { originalCorrectDescriptionAndGrade: boolean; originalCorrectPhysicalPage: boolean }
export function evaluateS2(expected: readonly ExpectedFinding[], assessments: readonly Assessment[], inventedFindings: number) {
  const expectedById = new Map(expected.map(row => [row.expectedId, row.grade]))
  if (!Number.isSafeInteger(inventedFindings) || inventedFindings < 0
    || expectedById.size !== expected.length || new Set(assessments.map(row => row.expectedId)).size !== assessments.length
    || expected.length !== assessments.length
    || expected.some(row => !row.expectedId || !['TG2', 'TG3'].includes(row.grade))
    || assessments.some(row => expectedById.get(row.expectedId) !== row.grade
      || typeof row.originalCorrectDescriptionAndGrade !== 'boolean' || typeof row.originalCorrectPhysicalPage !== 'boolean')) throw new Error('Invalid or incomplete assessment coverage')
  const counts = (grade: 'TG2' | 'TG3') => {
    const all = assessments.filter(row => row.grade === grade)
    const correct = all.filter(row => row.originalCorrectDescriptionAndGrade && row.originalCorrectPhysicalPage).length
    return { total: expected.filter(row => row.grade === grade).length, correct, missedOrWrong: all.filter(row => !row.originalCorrectDescriptionAndGrade || !row.originalCorrectPhysicalPage).map(row => row.expectedId) }
  }
  const tg2=counts('TG2'), tg3=counts('TG3')
  return { tg2, tg3, inventedFindings, passed: expected.length > 0 && tg2.correct*10 >= tg2.total*9 && tg3.correct === tg3.total && inventedFindings === 0 }
}
