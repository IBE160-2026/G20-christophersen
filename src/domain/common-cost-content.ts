/** Explicit inclusion and exclusion statements; absence carries no meaning. */
export function commonCostContent(quotes: string[]) {
  const categories = [
    ['kommunale avgifter', /kommunale avgifter/i], ['bygningsforsikring', /bygningsforsikring|byggforsikring/i],
    ['privat strøm', /privat(?:e)? strøm/i], ['internett', /internett/i], ['fyring', /fyring|oppvarming/i],
  ] as const
  const included = new Set<string>(), excluded = new Set<string>()
  for (const original of quotes) {
    const quote = original.replace(/^Fellesutgiftene utgjør kr\.?[ \t]*\d[\d. \u00a0]*,[-–‑] pr\. mnd\. og inkluderer:\s*/i, 'Felleskostnadene inkluderer ')
      .replace(/^Fellesutgiftene /i, 'Felleskostnadene ')
    if (!/^Felleskostnadene (?:inkluderer|ekskluderer)/i.test(quote)) continue
    const negative = /^Felleskostnadene (?:inkluderer ikke|ekskluderer)/i.test(quote)
    for (const [index, clause] of quote.split(/\b(?:men|og)\s+ikke\b/i).entries()) {
      const target = negative || index > 0 ? excluded : included
      for (const [label, pattern] of categories) if (pattern.test(clause)) target.add(label)
    }
  }
  return { included, excluded, conflict: [...included].some(label => excluded.has(label)) }
}
