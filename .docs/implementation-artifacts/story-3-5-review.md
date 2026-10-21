# Story 3.5 — uavhengig BMAD-review

Dato: 2026-10-21. Modus: **full**. Diff: `c2faf8f597299210b98b5f8b7d445684dbf232c3..8f16bd76d5b839be33ae6a1f9b614d536dd0363c`. 20 filer, +993/−4, 1160 linjer. Revieweren er en ny agent etter implementeringen.

## Autoritet og metode

Story 3.5 AC1–6, frozen storyspec, SPEC CAP-7, hele grensekontraktens Endring og gyldighet, arkitektur AD-1/2/4/8/10, final UX stale-result/Key Flow 3, Epic 3-kontekst, sprintplan/status og eksisterende kontrakter/testfasit er lest. Faglærerfeedback og det sidehenviste sensoruttrekket er brukt for avgrenset omfang, relevante fasittester, sporbarhet og dokumentert review. Ingen nye kurskrav innføres.

`bmad-code-review` ble aktivert med resolver (`UV_CACHE_DIR` under `/private/tmp`). Fire uavhengige lag med samme modellkapabilitet kjørte **sekvensielt**: Blind Hunter → Edge Case Hunter → Verification Gap Reviewer → Acceptance Auditor. Brukerens sekvenskrav overstyrte parallellstandard. De tre første fikk bare sine instruksjons-/diffstier; edge-laget fikk separat claims-fil. Acceptance fikk spec og autoritetskilder. Ingen filer ble endret mens et lag reviewet. Ingen lag feilet eller ble hoppet over. Edge returnerte `[]` og Acceptance ingen AC-avvik. Blind-gulv: 90 276 byte / 1000 = 90,276 kB; min(floor(sqrt(90,276) + 1), 10) = 10.

## Individuell triage før gruppering

| ID / lag | Kandidat / bevis | Dom og håndtering |
|---|---|---|
| B1 / blind | Avvisning bevarer åpent utkast som ikke lenger kan avbrytes. `FindingControl.tsx` viser det eksplisitt som bevart historikk; Story 2.9-review etablerte nettopp dette. Den nye selektoren kaller det korrekt ubrukt, uten å bruke det som grunnlag. | **false**, avvist. Sletting ville miste tilsiktet auditspor; ingen resultatfeil er demonstrert. |
| B2 / blind | `selectResult().changes` deler mutable metadata med state; en håndskrivende konsument kan slette årsaker og omgå historikk etter nullkontrollreversering. | **low**, avvist. Ingen appkaller skriver til selektorutdata. Vernet gjelder den immutable snapshotkopien, som faktisk fryses. Ekstra beskyttelse av intern mutable state for en hypotetisk kaller er mer enn direkte feilretting. |
| B3 / blind | `ResultSnapshot` er shallow readonly i TypeScript, mens runtime er dypt fryst. Nested writes vil derfor kompilere, men kaste. | **low**, avvist. Ingen aktuell konsument muterer snapshot; runtimevernet og negative mutasjonsprøver består. Rekursiv readonly krever bredere kompatibilitet med finans-/presentasjonskontraktene uten demonstrert feil fra produsenten. |
| B4 / blind | Direkte håndmutasjon av aktiv finans-/rapportstate uten revisjon kan fortsatt gi current. | **low**, avvist. Arkitekturen eier endring gjennom reduceren, som øker revisjoner/bekreftelser for faktiske handlinger. Testen omgår dette bevisst for å prøve isolasjon av historisk innhold. Ingen normal appkaller er vist å omgå reduceren. |
| B5 / blind | Etter L-endring og vellykket confirm-financial beholder historisk selector en nextAction som fortsatt krever L-kontroll/bekreftelse. Dette blir misvisende for neste Resultat-konsument selv om endringshistorikken er korrekt. | **medium**, patch G1. Historisk finansårsak beholdes, men når finansbekreftelsene er gjeldende skal neste handling bare være ny beregning. Rød/grønn prøve legges til i faktisk AT16/BT12-forløp. |
| B6 / blind | Rapportbytteprøvene stopper etter mottatt, ukontrollert rapport; mangler hele veien tilbake til nytt komplett resultat. | **medium**, patch G2. Ny F1/F4-reducerprøve gjør alle nye kontroller/bekreftelser/TG3-avklaring og verifiserer ny rapportprovenance og prioritet. |
| B7 / blind | Samme-generasjon error/retry kan beholde gamle kontroller. | **low**, avvist. Completed→error→ny completed krever håndlagde handlinger: ReportClient sender ikke error etter fullført svar, og backend duplikatsperre hindrer ny vellykket analyse i samme økt/rapport. Ny rapport bruker ny generasjon og nullstiller kontrollene. Ingen nåbar gjenoppliving er demonstrert. |
| B8 / blind | Eksisterende draft=null-assert gjelder snapshot fra før utkast ble åpnet; sanitiseringsgrenen er ikke prøvd med aktivt utkast under calculate-result. | **medium**, patch G2. Reell omberegning skal bevare gjeldende funn og opprinnelse, fjerne utkast/feil fra anvendt grunnlag og fortsatt opplyse om det ubrukte utkastet. |
| B9 / blind | Påstått omordningsprøve bruker ett F1-funn og omordner aldri kontroller. | **medium**, patch G2. Ny F4-prøve omordner to reelle kontroller og beviser uendret binding/current og samme kontrollgrunnlag ved ny beregning. |
| B10 / blind | D-år med kostnader mangler, selv om D-periode prøves. | **medium**, patch G2; samme testgrunnlag som V1. Parameteriser begge og kontroller D/J kontra uendrede bekreftelser. |
| V1 / verification-gap | Eksisterende historical-helper krever bare ikke-tom tekst og 'resultatet på nytt'; sletting av D/J-detaljen i affected ville fortsatt gitt grønt. | **medium**, patch G2. Assert eksakt navngitt D/J-kontroll-/bekreftelsesbehov for både periode og år. Dette er et forhåndsverifisert testgap fra lagets konkrete søk og mutasjonseksempel. |

Etter individuell vurdering og gruppering: **0 decision_needed, 2 patch, 0 defer, 5 avvist**. Brukerens bestilling autoriserer retting av alle verifiserte funn. Ingen ny produkt-/arkitekturbeslutning, I/O, UI, rute eller Story 3.6+ implementeres.

## Retting og fasebevis

**G1**: `selectResult` beholder historisk finansårsak, men gir bare «Tallgrunnlaget er bekreftet. Beregn resultatet på nytt fra gjeldende grunnlag.» når alle eksisterende finansbekreftelser igjen gjelder. Det endrer verken bekreftelsesreglene, revisjonene eller snapshotets historiske innhold. Før bekreftelse beholdes det konkrete kontrollbehovet. Den faktiske L→1 400 000→bekreft→ny beregning-prøven kontrollerer dette og får fortsatt Forkast med riktig finansgrunnlag.

**G2**: Fem nye reviewerprøver: D-år med delt kostnadskontekst (parameteriserer eksisterende D-periodeprøve), reell omberegning med aktivt ugyldig ubrukt utkast, to reelle omordnede F4-kontroller, og full kontroll av erstatningsrapport for både F1 og F4. D-periode/-år krever eksakt tekst for både D og J samt korrekt isolasjon av uendrede bekreftelser/rapport. Utkastet forblir aktivt i økten og merkes ubrukt, men kommer ikke med som anvendt grunnlag i nytt snapshot. Ny rapport får egne kontroller, listebekreftelse og eventuell TG3-avklaring før nytt komplett snapshot med generasjon 2/request-2.

- [Rød prøve før produksjonsretting](story-3-5-review-rod.txt): **1 feilet, 61 bestått**. Feilen demonstrerer konkret gjentatt L-kontrollbehov etter bekreftelse; de fem nye verifikasjonsprøvene består mot produksjonen.
- [Målrettet regresjon etter retting](story-3-5-review-malrettet.txt): **300/300 i åtte filer** (snapshot 62, session, finansbekreftelse, rapportsession, funnkontroll, listekontroll, TG3 og fullscreening).
- [Typecheck](story-3-5-review-typecheck.txt), [lint](story-3-5-review-lint.txt) og `git diff --check`: bestått. Node **24.21.0**, npm **11.19.0** fra lokal pinnet runtime.

Full Vitest/build/bygget-app/dev-E2E kjøres **sekvensielt av orkestratoren ved mini-sprintens slutt**, i henhold til fasefordelingen. Tidligere implementeringsbevis (910 Vitest og 89+3 E2E) står i [implementeringsverifikasjonen](story-3-5-verifikasjon.md); dette er tidligere bevis, ikke nykjøring etter reviewrettingen. Ingen live-/S2-/S5-/S6-påstand.

## AC og checkpoint

AC1: reelt F1-snapshot er isolert/frosset og har alle revisjoner, tall, anbefaling, ordnede utløsere og provenance. AC2: faktisk finans-/rapport-/kontrollendring gjør historisk med navngitt kontrollbehov; D/J-teksten er nå eksplisitt prøvd. AC3: separat TG3-status/tekster bruker FR-5 og bevarer uendrede bekreftelser/uttrekk. AC4: navigasjon, utkast/Avbryt og reell kontrollomordning bevarer binding; nytt snapshot bruker aldri aktivt ubrukt utkast. AC5: relevant ny kontroll gir ny korrekt prioritet/tall; begge erstatningsrapporter blir komplette først etter egne kontroller. Gamle/sene svar og ukontrollert ny rapport gir ikke komplett resultat. AC6: ny økt er Ikke beregnet og eier bare siste snapshot.

**Bestått review, 2 rettingsgrupper lukket, 0 åpne/defer/beslutningsfunn. Story 3.5 settes done i spec og sprintstatus.** Ingen krav eller autoritative planer er endret. Ingen Story 3.6+ implementert i denne fasen. Lokal commit uten push; canonical SHA rapporteres fra git etter commit. Pågående automatisk promptlogg for orkestreringsøkten holdes utenfor fasecommiten.
