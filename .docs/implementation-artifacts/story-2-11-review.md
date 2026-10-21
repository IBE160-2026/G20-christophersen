# Story 2.11 — uavhengig BMAD code review

Dato: 2026-10-21. **Bestått etter konkrete rettinger. Story 2.11 og Epic 2 done.**
Diff `b2600f954dc2a4f2aa37f3903a0754e738d3b1e3..175725a99e8650958b063a8f3081928582ef82b3`.
13 filer, 599 tilføyelser, 31 slettinger. Review gjelder bare Story 2.11.
Autoritet: Story 2.11 AC1–AC5 i epics, final UX, AD-2/4/6/8/10,
SPEC/grensekontrakter, sprintplan og readiness. Kursveiledning og faglærerfeedback
er lest for sporbarhet, avgrensning og meningsfulle testbevis; ingen nye krav er utledet.

## Fire sekvensielle reviewlag

En ny uavhengig reviewagent gjennomførte workflowen med fire separate barn,
ett om gangen, uten egne filendringer mens barn var aktive. Blind Hunter ga
ni kandidater (65,8 kB → N=9). Edge Case Hunter returnerte `[]`; tomt lag er
registrert etter workflowens regel, uten skjult påstand om edge-funn.
Verification Gap fant ett bindingsrelatert testhull. Acceptance Auditor fant
ingen AC-brudd, men påpekte manglende ekte listehandling etter TG3-endring.
Reviewagenten fulgte opp med egen kodelesing, negative tilstandsprøver,
tastaturfokus og full regresjon. Ingen ulåst produkt-/arkitekturbeslutning.

## Triage — hver kandidat bevart

| ID / kilde | Verdikt og bevis | Behandling |
|---|---|---|
| 1 Blind: ufullstendig Avklart får bare beskjed om status | low. Listegruppen ba om status også når resolved allerede var valgt og en tekst manglet. | Direkte tekstpresisering: Avklart krever begge tekster; Uavklart kan beholdes. E2E prøver denne tilstanden. |
| 2 Blind: Uavklart og mangelliste motsier hverandre | false. Mangellisten forklarer hva som kreves for tilstrekkelig screeninggrunnlag; den er ingen port for menneskelig kontrollslutt. Listegruppen tillater uttrykkelig Uavklart. TG3-feltene får ikke falsk ugyldigmerking. | Forkastet. Kritisk mangel og konkret neste handling beholdes, slik AC3 krever. |
| 3 Blind: bare antall ukontrollerte funn | low. Hvert aktivt funn har allerede eksplisitt kontrollstatus i listen. En ny hopp-/valgflate er en utvidelse, ingen manglende AC. | Forkastet som lite nødvendig forbedring med ekstra overflate. |
| 4 Blind: finansbevaring starter med ubekreftede felt | medium verifikasjonshull. Identitet av et ubekreftet grunnlag beviser ikke bevart gyldig bekreftelse. | Ekte gyldig finansgrunnlag registreres og bekreftes; isFinancialConfirmed og revisjon/identitet prøves ved retur og TG3-/listehandlinger. |
| 5 Blind: focus()+Enter omgår Tab-flyten | low verifikasjonshull. Aktivering var prøvd, ikke sammenhengende Tab-retur. | Tab/Shift+Tab fra Avvis og Avbryt via eksisterende PDF-knapp til listeknappen og tilbake; også med åpent utkast. |
| 6 Blind: 320 px mangler eksplisitt fokusgeometri | low verifikasjonshull. Overflow/screenshot alene beviste ikke at fokusknappen var synlig. | Tastaturfokus og full horisontal/vertikal knappgeometri mot workspace/viewport; screenshot inspisert. |
| 7 Blind: Fullført trekkes ikke tilbake i testen | low verifikasjonshull. Listegyldighet var kontrollert, trinnnavigasjon var ikke eksplisitt prøvd etter endring. | E2E verifiserer tilbaketrekking etter Bruk, Avvis, rapportbytte og ugyldig Avklart. |
| 8 Blind: separat tg3Findings kan være inkonsistent | false som faktisk feil. Eneste konsument bygger aktive TG3 fra gjeldende uttrekk/korrigeringer; ingen brukerhandling eller aktuell konsument kan sende en utelatt TG3. Samme ren-input-mønster brukes av kjent-mangelautoriteten. | Forkastet; ingen hypotetisk ekstra kontrakt-/avledningsarkitektur innført. |
| 9 Blind: manuell oppfattelse hevdes fra automatisering | low dokumentasjonsuklarhet. AC-bevis må skille agentens UI-/bildekontroll fra menneskelig forståelse og faktisk S5. | Presisert nedenfor og i verifikasjonen; ingen bruker-/tidsevaluering påstås. |
| 10 Verification Gap: gammel Uavklart-binding ved kontrollslutt | medium verifikasjonshull. Riktig sameTg3Basis-vern hadde ingen negativ prøve i den nye grenen. | To reducerprøver: endret beskrivelse eller fysisk side, ny enkelt-/listebekreftelse, fortsatt ufullført kontroll til eksplisitt fersk Uavklart. Original og registrering bevares. |
| 11 Acceptance: listehandling etter separat TG3-endring | medium verifikasjonshull. Statusbevaring ble prøvd uten å utløse listehandlingen igjen. | Unit og ekte browser-Enter etter TG3-endring; uendrede liste-/finansbekreftelser består. |

Åtte konkrete patchpunkter, tre forkastede kandidater, ingen defer eller
decision-needed. Kun én produkttekst endret; øvrige rettinger er testbevis og
presis dokumentasjon. Brukerens bestilling forhåndsautoriserte disse rettingene,
status og lokale commits; ingen ny rutinegodkjenning ble bedt om.

## AC mot faktisk kode

| AC | Etterprøvd grunnlag |
|---|---|
| AC1 | Domain-eid assessFindingList, separat report-list-confirm med generasjon/hash/dokument/listerevisjon. Analyse og enkeltfunnets Bekreft bekrefter aldri listen. Originalutfall/bytes/kilde er uendret; korrigeringer/avvisninger er egne representasjoner. |
| AC2 | completed [] krever separat handling. Missing/ready/analysing/failed, usikker kandidat og kjent rapportbegrensning består som konkrete mangler. Delresultat beholder feil, mål, usikkerhet, begrensning og TG3; ingen kontrollhandling gjør det til completed. |
| AC3 | Uavklart for gjeldende forhold kan fullføre menneskelig kontroll; known-deficiencies beholder alle TG3 med navn og fysisk kilde. Ugyldig Avklart og gammel Uavklart-binding kan ikke fullføre kontrollen. Ingen tvang til Avklart. |
| AC4 | Bruk/Avvis/ny rapport opphever listebekreftelse. Feil identitet/revisjon/generasjon ignoreres. Utkast/Avbryt/uendret retur/TG3-endring bevarer faktisk bekreftet uendret finans/listegrunnlag. Ekte listehandling etter TG3-endring er idempotent; uendret rapport gir ett POST. |
| AC5 | Separat feltgruppe, kort status, faktisk Tab/Shift+Tab og Enter/Space/native TG3-tastatur. 850×480/320 px synlig fokus og lokale PDF-er uten eksternt nett. Trinn 3 følger domain-kontrollslutt; Resultat forblir utilgjengelig. Ingen timer, telemetri, resultatmotor eller live-tidsmåling. |

Agentens UI-gjennomgang omfatter faktisk tastaturstyrt browserflyt og visuell
inspeksjon av skjermbildene: listeknapp/status er lesbar ved 320 px, status og
separate begreper er synlige, og fokusrammen er synlig i den avsluttede TG3-flyten.
Dette er agentkontroll, ikke dokumentert menneskelig oppfattelse eller S5-evaluering.
Faktisk deltaker-/tidsmåling ligger fortsatt bak R4-S5 og Epic 4.
Kuraterte bilder: [320 px med tastaturfokus](story-2-11-list-confirmation-320.png)
og [kontrollslutt med separat Uavklart](story-2-11-unresolved-control-complete.png).

## Tester og sluttcheckpoint

Målrettet: 18/18 unit og 5/5 bygget-app-scenarier. Første nye Tab-prøve hadde
en feil testantakelse: PDF-knappen ligger mellom funnkontroll og listegruppe
på smal skjerm. Faktisk DOM-rekkefølge ble kontrollert og prøven rettet; ingen
produktflyt ble endret. Første fulle E2E avdekket også at testens Tab kunne sendes
før det responsive PDF-panelet var montert etter viewportbytte. Testen venter nå
eksplisitt på den synlige PDF-åpneknappen, uten sleep eller produktendring.

Full regresjon ble kjørt sekvensielt **etter at 2.11/Epic 2 ble satt done**:

- `npm test`: **582/582** i 22 filer, 82,51 s.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npm run test:e2e`:
  **89/89** bygget-app (35,7 s), deretter **3/3** dev (1,8 s).
- `npm run typecheck`, `npm run lint`, `npm run build`: bestått på siste kode.
- `git diff --check`: bestått. Det eksisterende Vite-varselet om stor PDF-bundle
  består; ingen ny byggfeil eller endring av timeout/retry.

Alle 2.1–2.11 er faktisk done med egen spec og uavhengig reviewbevis.
Epic 2/SP3 done, milepæl 2 kan demonstreres; Epic 3 og alle dens stories er
backlog. Ingen blocker eller nytt beslutningsbehov. R1/R4 og readiness CONCERNS
er uendret og gjelder senere porter. Ingen 3.1, terskler, full screening,
resultatflate eller snapshot er innført av denne reviewagenten.
Neste tillatte steg er ny implementeringsagent for bare 3.1, deretter separat
review. Ingen push. Aktiv JSONL-promptlogg holdes utenfor lokal commit.
