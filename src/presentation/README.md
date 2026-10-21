# Presentasjon av finans

Story 3.3 og AD-7: `formatFinancialMetrics` tar bruttoyield/NOI fra finans og
nettoyield/kontantstrøm fra hvert terskelobjekts eget metrikkgrunnlag.
Funksjonen bruker ingen rå input, validering, screening, I/O eller UI.
Kalleren oppgir kjent delgrunnlag fra eksisterende grunnlagskontroll.

Normalvisning bruker hele NOK/år og tre yielddesimaler, desimalkomma,
hardt mellomrom som tusenskille og synlig minus. big.js roundHalfUp gjelder
bare visning. Beløpsdetaljer bevarer alle desimaler; yielddetaljer starter på
åtte og utvides ved skjulte brudd. Gjentakende yielddesimal merkes tilnærmet.
Eksakt teller/nevner og alle input/kilder/årsmetadata følger alltid med.

Ikke beregnbart har null visningsverdi/detalj og beholder konkrete årsaker.
Delgrunnlag velger ingen anbefaling. Når avrundet yield skjuler et mottatt
brudd, følger lesbar detalj og forklaring om uavrundet regelgrunnlag. Et
negativt beløp som vises som null får eksakt negativ detalj og forklaring.
Negativ yield som vises som null får også lesbar negativ detalj og forklaring,
uavhengig av om avkastningskravet er positivt, null eller ikke vurderbart.
Mottatt terskelutfall kopieres uendret; formaterte tall er aldri regelinput.

Alle kontrollobjekter klones slik at endring av presentasjonsdata heller ikke
kan endre opprinnelige finans-/terskeldata. Hver big.js-divisjon har isolert
presisjonskonfigurasjon. Ingen resultatflate eller senere story leveres her.
