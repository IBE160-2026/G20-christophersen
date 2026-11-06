# Prosess og KI-styring: leseguide for sensor

Dato: 2026-11-06. Vurdert referanse: `639291814886a6058a24adf95c69e8633b645944`.
Denne guiden er laget i leveransekontrollen etter funksjonsfrys. Den peker til
eksisterende samtidige bevis; den erstatter ikke logger, godkjenninger eller
studentens egen refleksjonsrapport.

## Vurderingsgrunnlag og leserekkefølge

[Sensorveiledningen](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf)
side 2–3 vekter prosess og KI-styring 30 % av del 1. Den etterspør brukt og
oppdatert planlegging, spor fra krav til kode, iterativ historikk, organisert
arbeidsflyt, konkrete korrigeringer av KI og begrunnede beslutninger. Del 2
vurderer refleksjonen; veiledningen gir ikke grunnlag for å omtale en
agentgenerert prosessbeskrivelse som studentens personlige refleksjon.

1. Les [faglærerens tilbakemelding](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md),
   [revidert brief](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md)
   og [revisjonskontroll](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md).
   Tilbakemeldingen førte til mindre kjerne, faste finansformler, separate
   testmetoder og gratis demo fremfor sju samarbeidende produktagenter.
2. Følg [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md),
   [beslutningsavstemming](../../planning-artifacts/prds/prd-IBE160-2026-10-10/beslutningsavstemming.md),
   [arkitektur](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md),
   [epics/stories](../../planning-artifacts/epics.md) og
   [opprinnelig sporbarhet](../../specs/spec-IBE160/sporbarhet.md).
   FR-/AD-/S-ID-er gjelder opprinnelig v1 og må leses sammen med senere vedtak.
3. Les [Correct Course](../../planning-artifacts/sprint-change-proposal-2026-10-28.md)
   for salgsoppgave først, og de daterte endringene nedenfor for Konsept A,
   lokal dokumentanalyse og finansscenario. Et gammelt «avventer» i bevart
   historikk opphever ikke en senere eksplisitt beslutning.
4. Kontroller casekjedene nedenfor med originalprompt, dokument, faktisk
   commit og testbevis. Bruk [sentral deferred-work](../../implementation-artifacts/deferred-work.md)
   for gjeldende åpne/lukkede forhold. Denne guiden oppretter ingen ny saksliste.

## Hva promptloggen faktisk dokumenterer

Ved referansecommit finnes **56 versjonerte `session-*.jsonl`-filer med 191
JSONL-hendelser**. Alle lot seg parse som JSON og hadde feltene `timestamp`,
`session_id`, `turn_id` og `prompt`. Det er 168 ulike turn-ID-er; samme turn-ID
kan ha flere forskjellige hendelser, blant annet oppfølgingssvar. Antall
logglinjer er derfor ikke antall uavhengige beslutninger. Den nye prompten
for denne leveransekontrollen ligger i [egen aktiv logg](../prompts/session-01a1b056-1e59-7b90-bff3-d2479e545b0e.jsonl).

[Hookdokumentasjonen](../prompts/README.md) forklarer mekanismen og dens
grenser. Hooken lagrer **brukerprompter**, inklusive enkelte strukturerte
spørsmål/svar, men ikke modellens svar, verktøyutdata eller subagentenes
meldinger. Arbeidsøkter, reviewrapporter, testlogger og Git-differanser supplerer
derfor loggen. De er agentproduserte prosessbevis med ulik styrke, ikke en
fullstendig ordrett samtaletranskripsjon eller bevis på at hvert forslag ble
lest av et menneske. Før automatisk logging finnes blant annet samtidige
`.memlog.md`- og revisjonsreferater; opprinnelige prompter kan ikke
rekonstrueres ved å skrive dem inn nå.

Reproduserbar opptelling ved referansepunktet:

```sh
git ls-tree -r --name-only 639291814886a6058a24adf95c69e8633b645944 .docs/process/prompts
git log --reverse --format='%H %ad %s' --date=short 639291814886a6058a24adf95c69e8633b645944
git show <full-commit-id> -- <filsti>
```

JSONL-linjenumre i tabellene nedenfor gjelder de bevarte filene. Tidsstemplene
i råloggen er UTC; et sent kveldsinnspill kan derfor ha foregående UTC-dato
selv om arbeidsøkten og commiten har neste norske kalenderdato.

## Konkrete kjeder fra menneskelig styring til kontrollert endring

### 1. Mennesket stanser en misvisende S5-måling

| Ledd | Etterprøvbart bevis |
| --- | --- |
| Menneskelig inngrep | [Promptlogg](../prompts/session-01a16b53-323d-7bd1-9e58-2cd1f62a6b4e.jsonl), linje 5: Mads stopper målingen etter egen inspeksjon av F1; rapporten har bare ett TG2 og ingen TG3. Linje 6–7 bestemmer separat benchmark og bevaring av F1–F4. |
| Avdekket feil | [Dokumentsporingen](../../implementation-artifacts/story-4-5-f1-dokumentsporing-2026-10-24.md) bekrefter at 4/4 TG2 og 1/1 TG3 gjaldt hele F1–F4-utvalget, ikke F1. Kort KI-kommunikasjon hadde gjort sammenhengen uklar. |
| Endring | `593c60ab51d0f3d507b5baa244a501727d09aa51` stopper S5 og dokumenterer identitets-/inputkontrollen; `824a074db04b3738d4d770aab04dddd5db40d721` fryser eget S5-B1-v1 før ny analyse. Fixture og historisk fasit ble bevart. |
| Menneskelig kontroll og begrensning | Samme promptlogg linje 14–15 inneholder Mads' opplysninger om originalbruk og eksplisitt erkjennelse av at manuell vurdering av generell begrensning og TG3-status ikke ble gjort. Dette er sterkere bevis for menneskelig deltakelse enn en agentrapport alene. |
| Ærlig avslutning | Linje 16 og [S5-W1](../../implementation-artifacts/story-4-5-s5-waiver-2026-10-27.md), commit `2dadc800daafa8b1640ccd08bf91a302fbc9cfb0`: videre S5-testing avsluttes med aksepterte metodeavvik. **Ingen validert tidsbesparelse eller full formell S5-akseptanse hevdes.** |

### 2. Mennesket endrer produktretning og avgrenser kostbar KI

| Ledd | Etterprøvbart bevis |
| --- | --- |
| Bestilling og beslutning | [Promptlogg 28. oktober](../prompts/session-01a18445-b28a-71e2-af47-e969cbb8c90f.jsonl), linje 1–2: salgsoppgave blir hovedinngang; FINN utsettes; 200 sider/50 MiB, ingen OCR i første trinn og separat opplasting av vedlegg godkjennes. |
| Planavstemming | [Correct Course](../../planning-artifacts/sprint-change-proposal-2026-10-28.md) behandler konsekvensene for brief, PRD, arkitektur, UX, stories og testbevis. Senere OCR-/finansutvidelser har egne daterte spesifikasjoner; de er ikke opprinnelige v1-løfter. |
| Implementering | Plancommit `9f49aa083b3fdd65cf0765119c33b6aa34a115bc`; offline bygg `c516b8682ae0bac9d38a10a064dcedc9984e5167`; [verifikasjon](../../implementation-artifacts/salgsoppgave-implementation-2026-10-28/verifikasjon.md). |
| Ny presisering | [Code-first-promptlogg](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl), linje 1–2: lokal kode først, semantisk AI bare ved behov, synlig ufullstendighet og USD 0,20 samlet tak. [Designøkten](../arbeidsokter/2026-10-29-salgsoppgave-code-first-design.md) skiller designgodkjenning fra tillatelse til betalte kall. |
| Bevarte grenser | [Arbeidsøkten](../arbeidsokter/2026-11-05-investeringsverktoy.md#semantisk-ai) og `src/backend/http/import-route.ts` viser dagens `liveEnabled: false` og `live-disabled` for import. Historiske KI-forsøk er ikke tillatelse til nye kall. |

### 3. Feilaktig modelloutput avvises; årsaken flyttes til kontrollerbar kode

| Ledd | Etterprøvbart bevis |
| --- | --- |
| Observerte feil | [Tredje økonomiprøve](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-resultat-3.md): bare 3 av 11 fasitpunkter korrekte; sju tallnormaliseringsfeil og ett manglende punkt. Kandidaten avvises. Gyldige kilde-ID-er behandles ikke som bevis for riktig beløp eller semantikk. |
| Menneskelig styring | [Promptlogg](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl), linje 18: Mads ber om årsakskontroll mot rårespons, norsk beløpstolkning i kode, bevaring av øre/kilder og ingen nye betalte kall. |
| Beslutning og endring | [Årsakskontrollen](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/deterministiske-belop.md) viser at råmodellens beløp allerede var feil. `41d2bf84de5deb5534c0bb082aa2ae58b5fe152b` lar kode transkribere beløp; modellen velger kildebundet verdi-ID. Se `src/backend/import/norwegian-money.ts`, `economy-money.ts` og `economy-compact.ts`. |
| Relevant test og review | Samme rapport og maskinlesbar verifikasjon dokumenterer 89 målrettede tester samt tre uavhengige reviewlag med rettinger, blant annet fragmenterte beløp og segmentgrenser. Historisk 3/11-respons er ikke reparert til en bestått KI-test. |
| Resultat og bevisgrense | Etter ny uttrykkelig godkjenning i promptlinje 19 viser [fjerde prøve](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-resultat-4.md) 11/11 for samlet PAA, 10/11 for modellen alene. `06d8962a5fc5812b4b76c35e8a4798cd1d5f473e` dokumenterer dette. Det er én avgrenset privat økonomicase, ikke generell dokument-/TG-kvalitet. Offentlig repo inneholder anonymisert resultat; råoriginalen kan ikke etterprøves fra klonen. |

### 4. Subagent-QA avdekker finans- og importfeil før ferdigpåstand

| Ledd | Etterprøvbart bevis |
| --- | --- |
| Menneskets mål og rammer | [Investeringsprompt](../prompts/session-01a1acf7-346f-7af2-9c86-9b8f35865a9f.jsonl), linje 1: samlet finansscenario, tre faglige subagenter og ingen betalte kall. [Neste prompt](../prompts/session-01a1ae14-46c3-76b0-bb25-906105b99dfa.jsonl), linje 1, fastsetter 80 %/6 %/30 år og dokumentert driftsdelsum. |
| Agentenes kritikk | [Investeringsøkten](../arbeidsokter/2026-11-05-investeringsverktoy.md#konkrete-feil-funnet-under-arbeidet) beskriver feil i kildeavstemming, LTV-endepunkter og romkobling. Første faktiske private QA feilet på begge dokumentene; fasiten og akseptansekravet ble beholdt. |
| Kontrollert retting | `01909131f005f768d77a30b2a0533f1ea01e4ea2` integrerer rettinger og [uavhengig QA](../arbeidsokter/2026-11-05-investeringsverktoy-uavhengig-qa.md). `639291814886a6058a24adf95c69e8633b645944` legger til standarder og retter videre drift-/sliderfunn. |
| Konkrete bevis | [Økonomistandardøkten](../arbeidsokter/2026-11-06-okonomistandarder.md) lenker versjonert Vitest-logg, offentlig regresjon og to kompakte QA-oppsummeringer. Native slider, fellesgjeld, reset og blank/ugyldig input ble prøvd. Full Vitest ved dette referansepunktet: 2 238 beståtte og 7 valgfrie skip. Dette er historisk resultat; nye kjøringer rapporteres separat i leveransekontrollen. |
| Begrensning | «Uavhengig QA» her betyr en separat **KI-agent**, ikke en annen menneskelig bruker. Private PDF-er og skjermbilder er ikke leverte filer. En grønn prøve med to originaler beviser ikke universell formatstøtte, fullstendig TG-dekning eller S6. |

## Teknologi- og arkitekturvalg som kan etterprøves

[Arkitekturens AD-1/AD-7/AD-8](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md)
plasserer finans, validering og screening i rene moduler, med delt
Zod-kontrakt og separat presentasjon. Se `src/domain/finance.ts`,
`thresholds.ts`, `screening.ts` og `src/contracts/`. Begrunnelsen er faste
formler, eksakte grenseverdier og ett autoritativt regelgrunnlag.

AD-3/AD-4/AD-6 begrunner fysisk side, originalhash, usikkerhet og separat
demo-/livebevis. AD-9 begrunner én lokal Express-prosess, lokale PDF-ressurser
og nøkkelfri demo. Senere [minnearbeid](../arbeidsokter/2026-11-05-robust-pdf-minne.md)
og [reprodusert importfeil](../arbeidsokter/2026-11-05-import-stability.md)
viser at arkitekturen ble endret etter faktisk måling, ikke bare beskrevet
på forhånd. A/B-prøven med samme PDF og kode isolerte en gammel serverprosess;
gratis reimport fikk annen duplikatbehandling enn betalte forsøk.

## Historikk og arbeidsdeling

Referansepunktet har **178 commits fordelt på 25 norske commitdatoer** fra
7. september til 6. november. Brief, faglærertilbakemelding, revisjon, PRD,
UX, arkitektur, stories, implementering, review og retting ligger i denne
rekkefølgen. Dette taler mot en engangsopplasting av ferdig kode. Flere nyere
endringer er store; antall commits alene viser verken kvalitet, arbeidsinnsats
eller hvem som har forstått koden. Historikken har i hovedsak én student som
forfatter, i tillegg til fire lærercommits; subagenter er ikke menneskelige
gruppemedlemmer. Arbeidsøkter, stories, reviewrapporter og sentral ledger er
repoets dokumenterte organisering; ingen PR-historikk er undersøkt eksternt.

Tidligere subagentbruk er blant annet beskrevet i code-first-designøkten,
økonomiprøveøkten og investeringsøkten. De oppgir roller, funn og behandling,
men ikke alltid fullstendige agentprompter/-svar. I denne leveransekontrollen
er rollene prosess/KI, teknikk/testing og uavhengig sensor. Hovedagenten eier
integrasjon og endelig triage. Denne prosessagenten har bare skrevet denne
guiden; den har ikke utført klonetest, produktregresjon eller menneskelig
akseptanse og har ikke opprettet nye subagenter.

## Påstander som må holdes avgrenset

| Påstand | Dokumenterbar formulering |
| --- | --- |
| «KI brukes i utviklingen» | Brukerprompter, samtidige arbeidsøkter, konkrete avvisninger/rettinger og Git-differanser dokumenterer styring. Loggeren er ikke en full samtaletranskripsjon. |
| «Menneskelig kontroll er gjennomført» | Oppgi handling og kilde: eksempelvis Mads' F1-inspeksjon og det ene S5-opptaket. Agentutført PDF-/kodekontroll kalles agentkontroll. Appbekreftelse alene beviser ikke grundig originalkontroll. |
| «Semantisk AI fungerer i dagens hovedflyt» | Semantisk import er deaktivert. Lokal PDF.js, tekstregler, tilgjengelig lokal OCR og kodebasert økonomi er aktive. En tolkningsplan er ingen utført modellforespørsel. Historiske liveforsøk gjelder sine versjoner/caser. |
| «Kvaliteten er bevist» | Kjørbare offentlige tester beviser konkrete regler, kilde-/tilstandsbinding og feilforløp. Historiske private caser gir supplerende erfaring, men ikke offentlig reproduserbar generell treffsikkerhet. |
| «Tidsbesparelse og S6 er bestått» | S5 har aksepterte metodeavvik uten validert tidsbesparelse. [S6-porten](../../implementation-artifacts/story-5-4-forberedelse-2026-10-27.md) krever fortsatt en faktisk annen person. En ny AI-utført ren klonetest er et kjørbarhetsbevis og oppfyller ikke alene dette kravet. |

Mangler kan ikke fjernes ved å omskrive prosesshistorien. Personlig forståelse,
ekstern menneskelig brukertest og eventuell refleksjonsrapport må bygge på
faktiske menneskelige handlinger. Denne leveransekontrollen forbedrer
tilgjengeligheten og presisjonen i bevisene uten å etterregistrere slike
handlinger eller lukke historiske porter.
