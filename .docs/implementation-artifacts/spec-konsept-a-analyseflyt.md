---
title: Synlig og tilkoblet økonomianalyse etter PDF-opplasting
type: bugfix
created: 2026-10-30
status: done
route: dispatch
baseline_commit: 88cab245442ec83e0d4e4f81c143c699d6d3bd15
context: []
---

<frozen-after-approval reason="Brukerens uttrykkelige bestilling om å undersøke, rette og verifisere">

## Intent

Konsept A viser bilde etter opplasting, men økonomitall mangler. Den lokale HTTP-importen leser PDF-en, men bruker en smal lokal feltparser, mens den tidligere vellykkede økonomiprøven aldri ble koblet til produktet. Gjenskap med den private originalen, koble inn eksisterende validerte økonomibehandling og vis reelle verdier med kilder og tydelig behandlingsstatus.

## Boundaries & Constraints

Ingen betalte API-kall, ingen push, ingen fiktive erstatningstall. Private originaler, responser, tall og skjermbilder beholdes i ignorert private/. Gjenbruk av tidligere reell modellrespons skal merkes som lagret analyse av samme dokument og kreve identisk PDF-hash, originaltekst, request og streng kilde-/beløpsvalidering. Andre dokumenter skal få lokalt uttrekk med eksplisitt beskjed om at videre KI-analyse ikke har startet. Ingen tidligere testrundegodkjenning gir tillatelse til nye API-kall. Teknisk dekning, manglende leie/full drift og bekreftelsesporter beholdes uavklart. Ingen historisk budsjettjournal endres.

## Tasks & Acceptance

- Gitt ekte PDF, når den lastes opp, skal backend lese alle fysiske sider og vise eksisterende verifiserbare økonomifelt og kildebundne observasjoner i Konsept A, med motstrid, mva og ukjente perioder bevart.
- Gitt annen PDF eller endret/ugyldig lagret respons, når import utføres, skal den lagrede analysen avvises eller ignoreres tydelig og aldri lekke verdier fra annen eiendom.
- Gitt pågående import, feil eller sperret videre analyse, når brukeren ser oversikten, skal fremdrift og konkret terminalstatus være synlig; ukjente tall skal forklare hvilke opplysninger som mangler.
- Gitt manglende leie/full drift/gjeld, når dokumenttall vises, skal yield og kontantstrøm fortsatt være utilgjengelige uten tilstrekkelig grunnlag.

</frozen-after-approval>

## Code Map

- `src/backend/http/import-route.ts`, `run-import.ts`, `import-child.ts`: faktisk opplastingsløype, 60 sekunders frist og isolert prosess uten API-nøkler.
- `src/backend/import/semantic-adapter.ts`, `local-plan.ts`: nåværende lokale uttrekk gir ni missing-felt på originalen. Behold tekniske manifest/porter.
- `src/backend/import/economy-trial.ts`, `economy-compact.ts`: gjenbruk prepareEconomyTrial, verifyEconomyTrial og validateReferencedEconomyOutput; disse utfører ingen API-kall. Sistnevnte hydrerer kildereferanser, beløp, observasjoner og deterministisk evidens.
- Ignorert `private/representative-cases/real-01/economy-trial/approved-test-04/`: packet.json, actual-api-response.json og model-output.json fra den reelle 11/11-prøven. Ingen fixture eller oracle skal utgis som ny KI-respons.
- `src/contracts/document-import.ts`: streng felles kontrakt; eventuelt valgfri økonomidetalj med proveniens og kildebundne observasjoner må også validere originalspenn.
- `src/frontend/investment/InvestmentOverview.tsx`, `src/frontend/analysis/import-client.ts`, `src/frontend/state/prospectus.ts`: opplasting/status og visning. Gjenbruk felt/kilder og formattering. Ikke endre beregningsregler.
- Tidligere godkjenning/begrensning: `salgsoppgave-economy-trial-2026-10-30/live-resultat-4.md`, `spec-konsept-a-produkt.md` og faglærers kilde-/usikkerhetskrav i brief-tilbakemeldingen.

## Execution

- [x] Lag avgrenset leser for privat lagret analyse og adapter til importkontrakten, med full identitet-/kildekontroll og synlig årsak ved ugyldig/manglende analyse. Velg en lokal filbasert løsning som virker uten konfigurasjonsendring i eksisterende repo; den skal aldri opprette klient/transport eller reservere budsjett.
- [x] Koble adapteren inn i faktisk import-child for salgsoppgave. Behold rapportens tekniske status og kostnadsport.
- [x] Vis dokumentets økonomifelt/observasjoner og originalkilder direkte i Konsept A med lagret/lokal proveniens, synlig mangelliste og konkret status. Fremdrift kan bruke faktisk lokalt hash-steg og deretter ærlig ventestatus med tid; ikke finn på backendfaser.
- [x] Legg til relevante automatiske tester for gjenbruk, kildefeil, hashavvik, manglende cache og UI-status. Ingen private testdata committes.
- [x] Kjør typecheck/lint og relevante tester. Verifiser ekte PDF gjennom faktisk HTTP-rute. Rapporter alt som gjenstår for manuell nettleserkontroll.

## Implementation Notes

- Reproduksjon før retting: HTTP-opplasting av private/incoming/salgsoppgave.pdf ga imported, 146 sider, ni missing-felt og cost.reason live-disabled; local-tokenizer-unavailable. Respons lagret privat i incoming/concept-a-before.json.
- Nettleservert utilgjengelig; native Chrome-tilkobling ga timeout to ganger. Hovedagent forsøker videre manuell tilkobling og verifiserer HTTP mens implementeringsagent arbeider.
- Ingen uavklarte produktvalg eller irreversible endringer. Brukeren har allerede autorisert implementering; ingen ekstra godkjenningsrunde.

## Verification

Typecheck, lint, målrettede unit/integrasjon/UI-tester og faktisk lokal HTTP-opplasting av den ekte PDF-en. Privat respons sammenlignes med tidligere reelle resultater; kilder skal bruke aktuell dokumentidentitet. Manuell nettleserkontroll dokumenteres separat med faktisk resultat eller konkret blocker.

- Ekte automatisert nettleserverifikasjon består etter retting av historisk kind-markør; alle ni felt sammenlignet mot tidligere reelt validert resultat, kildeåpning, ukjente KPI-er, mobilbredde og null eksterne requests. Direkte manuell CUA er fortsatt blokkert.

## Review Triage Log

Tre uavhengige reviewlag kjørt: blind hunter, edge case hunter og verification gap. Edge case hunter ga ingen funn. Alle øvrige funn er vurdert individuelt nedenfor; ingen funksjonelle funn er utsatt.

| Funn | Vurdering og bevis |
| --- | --- |
| Blind 1: lokale verdier kan overskrives av sideutvalg | false for produksjonsløypen: replay krever pinnet arkiv og identisk full PDF/tekstledger; dagens lokale plan har alle ni felt missing på akkurat denne originalen. Andre PDF-er kommer aldri til feltutskifting. En generell cache må avstemme lokale fremtidige parserforbedringer, men er ikke implementert her. |
| Blind 2: dokumentspesifikke dekningsårsaker overskrives | false: dagens createCodeFirstImport lager én fast, generell årsak om lokal grammatikk, ikke dokumentspesifikke årsaker. Uleste sider, vedlegg og teknisk manifest bevares. Ny årsak beskriver den avgrensede lagrede analysen korrekt. |
| Blind 3: privat arkiv mangler i ren checkout | low, dokumentasjon rettet: sesjonsbeviset beskriver eksplisitt lokal avhengighet, pinnet arkiv og fallback. Ingen private filer skal publiseres for å gjøre denne testen portabel. |
| Blind 4: ingen faktisk import-child-test av replay | medium, patch: ny versjonert privat HTTP-test bruker standard pinnet leser og faktisk barn. Kjørt med tilgjengelig original; bare eksplisitt fravær av privat original gir skip i annen checkout. |
| Blind 5: økonomiseksjonen er vanskelig å finne | medium, patch: ferdig opplasting gir direkte lenke til dokumentets økonomitall. |
| Blind 6: generiske hjelpetekster for manglende felt | low, avvist: hvert felt navngis og full økonomikontroll har egne periode-/år-/inkluderings-/gjeldsfelt. Ny rådgivende tekst for alle felter ville utvide denne årsaksrettingen. Motstridsforklaringen er rettet separat. |
| Blind 7: hvert sekund annonseres i live-region | medium, patch: sekundteller er separat og aria-hidden; statusregionen endres ved faktiske tilstandsoverganger. |
| Blind 8: kontrakten kan merke ulest side som valgt | false som nåværende produksjonsfeil: valgt side regenereres og kontrolleres av prepareEconomyTrial som krever readable og tekst. Fallback har ingen valgte sider. Ingen produksjonskaller kan returnere foreslått tilstand. |
| Verification 1: helpertest oppdager ikke frakoblet import-child | medium, patch: samme nye faktiske HTTP-test krever saved-same-document og replay-felter; helper-/fixturetester er ikke alene brukt som bevis. |
| Verification 2: komponents test oppdager ikke fjernet rendring i oversikt | medium, patch: eksisterende investment-overview E2E krever synlig økonomiseksjon, dokumentbeløp og lokal proveniens etter opplasting. |
| Egen visuell kontroll: nullbeløp i konflikt fremstilles som ingen verifiserbare beløp | medium, patch: egen motstridstekst bevarer verifiserbare alternativer og synlig periode/år, uten å velge ett beløp. |

Sluttkontroll: 152/152 målrettede unit-/UI-/HTTP-tester passerer, inkludert ekte privat HTTP-test uten skip. Build/typecheck og lint passerer. Før review bestod 15/15 eksisterende E2E og ekte PDF-test; etter patch bestod målrettet E2E med ny økonomiseksjonsassert. Brukeren ba deretter uttrykkelig om lokal Playwright i stedet for Chrome-styring. Sluttkontroll med synlig lokal Chromium på http://localhost:3000 bestod med ekte filopplasting, bilde, økonomitall, originalside, mobilbredde og ingen nettverks-/konsollfeil. Ingen gjenstående oppgave for nettleserstyring.
