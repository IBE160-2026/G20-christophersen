import { expect, it } from 'vitest'
import { economyTextConfiguration, EconomyTrialOutputSchema } from '../../src/backend/import/economy-request.ts'
import { ListingKeySchema } from '../../src/contracts/listing.ts'
it('bruker faste felt-IDer i API-schema uten regex-lookaround som live-API avviste', () => {
  const schema = economyTextConfiguration().format.schema
  const fields = schema.properties!.fields as { items: { properties: { id: { enum?: string[]; pattern?: string } } } }
  expect(fields.items.properties.id.enum).toEqual(ListingKeySchema.options)
  expect(fields.items.properties.id.pattern).toBeUndefined()
  function inspect(value: unknown) {
    if (!value || typeof value !== 'object') return
    for (const [key, child] of Object.entries(value)) {
      if (key === 'pattern' && typeof child === 'string') expect(child).not.toMatch(/\(\?(?:[=!]|<[=!])/u)
      inspect(child)
    }
  }
  inspect(schema)
  expect(EconomyTrialOutputSchema.shape.fields.element.shape.id.safeParse('constructor').success).toBe(false)
  expect(EconomyTrialOutputSchema.shape.fields.element.shape.id.safeParse('price').success).toBe(true)
})
