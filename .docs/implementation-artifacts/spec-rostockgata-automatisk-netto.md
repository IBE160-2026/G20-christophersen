---
title: 'Automatisk dokumentøkonomi og foreløpig netto i Konsept A'
type: 'feature'
created: '2026-11-04'
status: 'done'
route: 'dispatch'
baseline_commit: 'fae71a3180cd63e20211188821cf306c1c451d1b'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="Bruker har autorisert implementering, ekte Playwright og lokal commit; ingen ny godkjenning nødvendig">

## Intent

Rostockgata96 skal gi automatisk prisgrunnlag og et nyttig, tydelig foreløpig nettoanslag fra ekte salgsoppgave og SSB-referanse uten manuell registrering. Dokumentert null fellesgjeld, fellesutgifter og kildebundet kostnadsinnhold skal brukes uten dobbelttelling.

## Boundaries & Constraints

Bevar full PDF-flyt og alle fysiske kilder; ikke gjenåpne generell OCR. Bevar TG-begrensninger, kontroll-/screeningporter og manuell/dokumentert leies forrang. Ingen betalte KI-kall, push eller private PDF-er i Git. Automatisk P er prisantydning pluss dokumentert fellesgjeld, uten kjøpsomkostninger; det er ikke en avtalt kjøpesum.

Eksplisitt datert «Seksjonen har ingen gjeld per. 26.10.2026» sammen med «Ingen lån registrert for sameiet.» er dokumentasjon for null fellesgjeld, ikke fravær tolket som null. Bevar dato ordrett og fysisk side. Motstridende beløp eller negative utsagn skal sperre automatisk bruk. Ikke bruk generell pante-/sikringsinformasjon eller udaterte sameieutsagn alene som seksjonens nullgjeld.

Foreløpig netto før finansiering er (årsleie − kjente eierbetalte driftskostnader)/P, med kjent delsum og utregning synlig. Det er et avgrenset scenario, ikke full D eller kontrollert nettoyield; det skal ikke åpne kontantstrøm eller screening. Manglende kostnader blir aldri null. Ved uavklart gjeldsandel, motstrid, periode eller inkludering skal berørt automatisk delsum sperres. Manuell ugyldig/konfliktfylt/bevisst redigert drift skal ikke erstattes av dokumentdelsum. Dokumenter ukjent kostnadsår og blandede prisnivåer eksplisitt: SSB2025 og udaterte løpende kostnader skal ikke gis oppdiktet felles år eller skjult prisjustering.

## I/O & Edge-Case Matrix

| Tilfelle | Input | Resultat |
| --- | --- | --- |
| Nordvik urørt | Pris8600000, datert seksjonsnullgjeld, ingen sameielån,3660/mnd | P8600000;43920 kjent årsdrift;182880 foreløpig netto/år;2,13%;2,64% brutto ved18900/mnd |
| Sammensetning |2704+159+797 inngår i3660 | Rot3660 telles én gang; komponenter/kilder synlige; kommunale avgifter/bygningsforsikring ikke legges til igjen |
| Manglende grunnlag | Ingen eksplisitt null, tvetydig inklusjon eller gjeldsandel, ugyldig dato | Ikke anta null eller vis ubegrunnet delsum |
| Motstrid | Nullutsagn og positiv gjeld, beløps-/inkluderingskonflikt | Sperr berørte kandidater, behold begge kilder |
| Overstyring | Gyldig manuell pris/leie/drift eller ugyldig redigert felt | Behold eksisterende prioritet og validering; ingen skjult fallback |
| Begrensninger | SSB-referanse og ufullstendige kostnader/TG | Vis ukalibrerte leiescenarioer, manglende kostnader/år; fullD/kontantstrøm/TG uendret sperret |

</frozen-after-approval>

## Code Map

- `src/backend/import/local-plan.ts`: numerisk pris og3660 er allerede available. P blokkeres av missing sharedDebt i `src/domain/source-economy.ts`. Parseren forstår bare numeriske valutaetiketter og mister negativ gjeldsprosa. Legg kildebundet deterministisk økonomigrammatikk i egnet liten helper ved behov; `legacyEconomy` og integritetspinnet replay beholdes uendret.
- Privat eksisterende importbevis `private/incoming/rostockgata-rent-final/**/nordvik-import-rent.json`: fysisk28 har gjeldsutsagnene ovenfor; fysisk26 har «Felleskostnader / Kr 3 660,- pr. mnd. / Inkluderer: Felleskostnader: 2 704,- / Internett: 159,- / A-konto fyring: 797,-» og «Felleskostnadene inkluderer kommunale avgifter, drift og vedlikehold, felles bygningsforsikring, strøm til fellesarealer, forretningsfører- og styrehonorar.» Fysisk27 sier varme/varmtvann avregnes årlig31.12. Bevar faktisk UTF16-spenn med sourceFor; ikke hardkod adressen/hash/beløp i produksjonsregler. Kostnadsår er ukjent, ikke lån2026 fra gjeldsdato.
- `src/contracts/document-import.ts`, `src/domain/document-import.ts`: felt kan ha nye stabile id-er og kilder; source blir første PDF-kilde i draft. Foretrekk eksisterende kontrakt hvis dato/innhold bevares klart i kildesitat. Dato må vises uten å åpne kildedetaljer. Ikke merk dokumentøkonomi komplett.
- `src/domain/source-economy.ts`, `src/frontend/state/scenario.ts`, `src/domain/financial-scenario.ts`: eksisterende fullD krever kjent år/inkludering/debtPart og eksplisitt komplettstatus. Bevar fullberegning; gi separat foreløpig delsum/metrikker/forbehold uten å sette fullD eller normalisere ukjent år. Gjenbruk eksisterende inkludering/validering der forsvarlig; ingen duplisert summert rot+underposter.
- `src/frontend/investment/InvestmentOverview.tsx`, `DocumentEconomy.tsx`, `RentEstimatePanel.tsx`: vis foreløpig netto før finansiering, beløp/formel/delsum og kostnadsinnhold, manglende eiendomsskatt, innvendig vedlikehold, ledighet, utleie/forvaltning, privat forsikring/strøm og varmeavregning/eier-leietakerfordeling. Skill inklusjon fra ukjent beløp. Kommunale avgifter og bygningsforsikring inngår allerede i fellessummen. SSB18900/2025 beholdes som referanse, intervallet merkes ukalibrerte scenarioer.
- `tests/e2e/rent-real-document.spec.ts`: ekte170siders privat `private/incoming/nordvik-rostockgata-96.pdf`, SHA2563e2dd467c11785c1de7c8c79b8e5f58f786e87416f7dc9b14f7a2d713ec6cb70. Fjern tidligere nødvendig manuell P-registrering. Behold uavhengig live-SSB-fasit, kilder, mobil, minne- og TG-verifikasjon og separate manuell/faktisk leieprioritetstester.
- Kursveiledningens eksisterende kildeuttrekk og faglærers brief-tilbakemelding: sporbarhet, ekte endeprøve, formler i kode, skille fakta/estimater; KonseptA EXPERIENCE krever ukjent≠null og ufullstendig≠ferdig.

## Tasks & Acceptance

- [x] Parser og unit: dokumentert datert nullgjeld, konservativ kostnadssammensetning og kilder; negative/motstrid/ugyldige datoer og sumavvik.
- [x] Domene/selector og unit: automatiskP og separat foreløpig netto med eksplisitte mangler/år, uten endring av fullD/screening/finansiering og manuelle prioriteter.
- [x] KonseptA/panel og UI-tester: synlig dato, formel, delsum, komponenter, ukalibrerte scenarier og begrensninger.
- [x] EkteNordvik Playwright uten manuell registrering før automatiskøkonomi-sjekk; gratis faktiskSSB, åpne gjelds-/kostnadskilder, desktop/mobil, tom betaltkall-liste.
- [x] Prosessbevis, relevantREADME og append sentral deferred-historikk; build/lint/unit/integrasjon/Playwright/review; lokalcommit med aktivpromptlogg.

Gitt urørt import, når reell dokument- og SSB-flyt fullføres, så vises dokumentert pris/nullgjeld og foreløpig netto automatisk. Gitt manglende kostnader eller tekniskdekning, når tallene vises, så fremgår manglene og ingen fullstendig analyse hevdes.

## Implementation Notes

Ingen uavklarte brukerintensjoner eller irreversible operasjoner. Aktivpromptlogg endret automatisk fra samme sesjon, ingen andre startendringer. Implementeringsagenten utfører kode og relevante tester; hovedagenten eier prosessdokumenter, fullverifikasjon, review og commit.

## Spec Change Log

## Review Triage Log

Tre uavhengige reviewlag leste `/private/tmp/paa-nordvik-netto-review.diff` (59060 byte). Alle individuelle funn vurderes før gruppering. Ingen nye brukerbeslutninger kreves; konkrete grammatikk-, visnings- og aritmetikkrettinger sendes samme implementeringsagent. Historiske begrensninger forblir åpne.

| ID | Vurdering, bevis og håndtering |
| --- | --- |
| B1 | high / patch: suffixbeløpet i «Sameiet har lån på 100 000 kroner.» matcher ikke adverse-grammatikken, slik at nullgjeld kan stå tilgjengelig. Utvid eksplisitt positivt gjeldsbelegg og bevar kilde; negativ regresjon. |
| B2 | medium / patch: dato-regex mangler sluttgrense og godtar2026-prefikset i20260. Fullstendig dato kreves, med regresjoner. |
| B3 | medium / patch: enhver eksklusjonssetning gjør beløpet konfliktfylt, selv privat strøm som ordinært tilleggsbehov. Bevar eksklusjon som avgrensning; konflikt bare ved motstridende inkludering. |
| B4 | medium / patch: DocumentEconomy føyer alltid til at kommunale avgifter/bygningsforsikring inngår, også ved eksplisitt eksklusjon. Forklar bare positivt dokumenterte kategorier. |
| B5 | medium / patch: ny delsum validerer brutto underposter uten å kontrollere deres drifts-/gjeldsdeler mot roten. Tilføy begge avstemminger og uavhengig fasit for ikke-null gjeld. |
| B6 | low / patch: NOI kan være kjent uten P; prosent og divisjon med ukjent P er da misvisende presentasjon. Vis overskudd alene og beting prosent/formel på gyldig P. Direkte visningsretting. |
| B7 | medium / patch: gyldig manuell P har forrang, mens forklaringen sier prisantydning. Vis faktisk P-opphav. |
| B8 | medium / patch hos hovedagent: prosessbevisets verifikasjonsavsnitt var ennå uferdig under review. Registrer faktisk kjøring, kilder, bevis og eventuelle feil før commit; planlagte prøver påstås ikke bestått. |
| E1 | high / patch: samme uoppdagede positive sameielån som B1; egen vurdering bekrefter manglende valutasuffiks i adverse-grammatikken. Samme retting/regresjon. |
| E2 | medium / patch: ubundet blankrom før dato kan gi >2000 tegn til sourceFor og stoppe import. Begrens grammatikk/kildespenn; lang-blankrom-regresjon. |
| E3 | medium / patch: samme manglende avstemming av underpostens gjelds-/driftsdel som B5. Valider årlige deler hver for seg. |
| E4 | medium / patch: samme ubetingede inkluderingspåstand som B4; moteksempel ekskluderte kommunale avgifter. Positivt kildebelegg styrer formuleringen. |
| H1 | medium / patch: hovedagentens faktiske Nordvik-respons manglet side27-varmeavregningen fordi «pr.» avbrøt punktumekskluderende regex. Bounded originalkilde og ekte side27-assertion er lagt til. |
| H3 | low / patch: visuell kontroll fant generert64-tegnsSHA i den nye synlige prisforklaringen. Skjul kun automatisk generert hash i denne teksten; bevart lagret kilde/manuelle opplysninger, egen UI-test og ny ekte endeprøve. |
| H2 | medium / patch: første inkluderingsretting tolket «inkluderer kommunale avgifter, men ikke bygningsforsikring» samlet positivt. Del eksplisitt men/og-ikke-klausul, bevar original og test begge kategorier uten generell NLP. |
| V1 | medium / patch: verifisert testgap for gjeldsfratrekket i foreløpig delsum. Fjernet minusledd ville ikke blitt oppdaget av nullgjeldscasen. Test ikke-null gjeld og selector/NOI med uavhengig60000-fasit. |


Alle reviewrettinger er implementert og de 65 målrettede testene er kjørt grønt av implementeringsagenten. Hovedagenten har lest de faktiske rettingene; full sluttverifikasjon registreres nedenfor. Ingen nye reviewfunn er utsatt.

## Verification

Node24.21: npm run build, npm run lint, npm test. Playwright med privat config beskrevet i forrige prosessbevis, PAA_TEST_NORDVIK_REQUIRED=1 PAA_TEST_SSB_NETWORK=1, demo, tom OPENAI_API_KEY. Bruk installert Chromium og ekte original. Bevar rådata og skjermbilder privat, registrer faktiske tall og gjenværende begrensninger i `.docs/process/arbeidsokter/`.

Sluttverifikasjon: fullpakken2106 bestått/7 eksisterende skip, build/lint grønne.25 brede Playwright-prøver bestod før review; alle3 dokument-/SSB-prøver bestod etter funksjonsrettingene. Siste rene presentasjonsretting har5 målrettede UI-tester, nytt build/lint og ytterligere ekteNordvik-prøve20,2s, uten skip, feil eller betalte kall. Automatisk8600000/0 per26.10.2026/3660×12=43920/18900×12=226800/182880/2,13% verifisert. D/kontantstrøm/TG-kompletthet åpnes ikke. Se [fullt prosessbevis](../process/arbeidsokter/2026-11-04-rostockgata-automatisk-netto.md#sluttverifikasjon-etter-review).
