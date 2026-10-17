import type { Dispatch } from 'react'
import type { FinancialField, RawFinancialInput } from '../../contracts/financial-input.ts'
import { RegisteredPeriodSchema } from '../../contracts/financial-input.ts'
import type { SessionAction } from '../state/session.ts'

const fields: { id: FinancialField; label: string; description: string; unit: string }[] = [
  { id: 'P', label: 'Totalpris', description: 'Inklusive eventuell fellesgjeld, uten kjøpsomkostninger.', unit: 'NOK' },
  { id: 'L', label: 'Brutto leieinntekt', description: 'Leieinntekt for det aktuelle objektet og året du oppgir.', unit: 'NOK' },
  { id: 'D', label: 'Eierbetalte driftskostnader', description: 'Eierbetalt drift uten renter og avdrag. Unngå dobbelttelling.', unit: 'NOK' },
  { id: 'J', label: 'Gjeldsbetjening', description: 'Renter og avdrag inklusive eventuell fellesgjeld.', unit: 'NOK' },
  { id: 'Ymin', label: 'Minimumskrav til nettoyield', description: 'Ditt eget avkastningskrav i prosent.', unit: '%' },
]

export function FinancialInput({ financial, dispatch }: {
  financial: RawFinancialInput
  dispatch: Dispatch<SessionAction>
}) {
  return (
    <section className="financial-input" aria-labelledby="registration-title">
      <div className="registration-intro">
        <h2 id="registration-title">Registrer finansverdier</h2>
        <p>Oppgi dine tall for ett boligutleieobjekt. Velg periode og år for leie, drift og gjeldsbetjening.</p>
        <p className="meta">Opplysningene beholdes mens siden er åpen. Oppdatering eller lukking av siden avslutter økten.</p>
      </div>
      {fields.map(({ id, label, description, unit }) => {
        const value = financial[id]
        return (
          <div className="financial-row" key={id} role="group" aria-labelledby={`label-${id}`}>
            <div className="field-definition">
              <label id={`label-${id}`} htmlFor={`value-${id}`}>{label} ({id})</label>
              <p className="meta" id={`hint-${id}`}>{description}</p>
            </div>
            <div className="registered-value">
              <div className="value-control">
                <input
                  id={`value-${id}`}
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={`hint-${id} unit-${id} status-${id}`}
                  value={value.rawValue}
                  onChange={(event) => dispatch({ type: 'register-value', field: id, rawValue: event.target.value })}
                />
                <span id={`unit-${id}`} className="field-unit">{unit}</span>
              </div>
              <p className="meta field-status" id={`status-${id}`}>
                {value.rawValue === '' ? 'Ikke oppgitt' : value.rawValue === '0' ? '0 registrert' : 'Registrert'} · Ubekreftet
              </p>
            </div>
            {id === 'L' || id === 'D' || id === 'J' ? (
              <div className="period-context">
                <div className="period-field">
                  <label htmlFor={`period-${id}`}>Periode for {id}</label>
                  <select
                    id={`period-${id}`}
                    value={financial[id].period}
                    onChange={(event) => dispatch({
                      type: 'register-period', field: id,
                      period: RegisteredPeriodSchema.parse(event.target.value),
                    })}
                  >
                    <option value="">Ikke oppgitt</option>
                    <option value="year">År</option>
                    <option value="month">Måned</option>
                    <option value="unknown">Ukjent</option>
                  </select>
                </div>
                <div className="year-field">
                  <label htmlFor={`year-${id}`}>År for {id}</label>
                  <input
                    id={`year-${id}`}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    value={financial[id].year}
                    onChange={(event) => dispatch({ type: 'register-year', field: id, year: event.target.value })}
                  />
                </div>
              </div>
            ) : <p className="meta unchanged-period">{id === 'P' ? 'Totalpris' : 'Prosentkrav'} · ingen årsnormalisering</p>}
          </div>
        )
      })}
      <div className="registration-note">
        <p>Registrering alene er ikke bekreftelse. En blank verdi er ikke 0; null krever eksplisitt bekreftelse før bruk.</p>
        <p>Kontroll og bekreftelse av tallgrunnlaget er ennå ikke tilgjengelig. Tilstandsrapport åpnes først når tallgrunnlaget er gyldig og bekreftet.</p>
      </div>
    </section>
  )
}
