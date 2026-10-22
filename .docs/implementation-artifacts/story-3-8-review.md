# Story 3.8 — uavhengig BMAD code-review

Dato: 2026-10-22. **Formelt review bestått etter retting og uavhengig etterkontroll.** R1–R6 er lukket, ingen åpne storyfunn. Spec/sprint er `done`. Full sluttregresjon gjenstår fordi brukeren ba avslutte ved dette checkpointet; done gjelder bestått storyreview med målrettet kontroll.

## Kanonisk grunnlag og metode

- Baseline: `49d21e185215c00c39282c132933b64038778cd1`.
- Reviewet implementeringscommit: `f62a3c9d422b7e447784dfd406d269e0470f37c0`.
- Etterkontrollert patchcommit: `1bc47e9d6913abbd5c3810c0fe4d7be7fc1605b7`. Revieweren rettet deretter bare R6-dokumentfilteret som forklart under; ingen ny produksjonsendring.
- Full diff mellom disse commitene: 17 filer, +701/−2, 813 linjer; 63 682 bytes. Midlertidig diff: `/private/tmp/story-3-8-review-20261022.diff`; uendret commitfortelling separat i `/private/tmp/story-3-8-review-20261022-claims.txt`.
- `bmad-code-review` ble aktivert og customization løst. Eksplisitt target, full spec og eksisterende godkjenning av review/retting gjorde nye target-/patchspørsmål unødvendige. Brukerens sekvenskrav overstyrte skillens parallellstandard.
- Fire nye kontekstfrie reviewlag med samme modellkapabilitet kjørte **sekvensielt**, uten delte funn: Blind Hunter → Edge Case Hunter → Verification Gap Reviewer → Acceptance Auditor. Ingen prosjektfiler ble endret mens lagene arbeidet. Blind/edge så ikke implementeringsagentens forklaring utover det deres respektive prompt tillot. Ingen lag feilet. Verification rapporterte ingen gap; Acceptance rapporterte ingen ytterligere AC-brudd og kjørte de 18 eksisterende fornyelsestestene grønt.
- Originalautoritet: Story 3.8 AC1–5 og grensen mot 3.9 i `epics.md`; gjeldende SPEC, grensekontrakter, Epic3-kontekst, AD-2/6–10 og relevant final EXPERIENCE/Key Flow 3. Kurs-PDF ble lest med installert PDF.js; faglærertilbakemelding og arkitekturens kildeavstemming er lest. Disse brukes til sporbarhet og meningsfull verifikasjon, uten nye produktkrav.

## Individuell triage før gruppering

Hver kandidat beholder sitt eget verdict. Lavnivå testforbedringer er ikke påstander om observerte produktfeil.

| ID / lag | Opprinnelig kandidat og sted | Individuelt verdict og bevis | Videreføring |
|---|---|---|---|
| B1 · blind | Nullbekreftelse trukket tilbake/gjenopprettet hindrer fornyelse, `session.ts:107–111` | **medium**. Gyldig J=0-snapshot → `check-zero false` → `true` → `confirm-financial` gir samme binding som gammelt snapshot, men endringslisten inneholder `financial` og `confirmation`. `financialChangeOnly` blir false; vanlig fremovernavigasjon beholder `historical`. Uavhengig reproduksjon og ny rød regresjon viser akkurat dette. AC5 krever at gyldig retting/bekreftelse kan fornyes. | R1 patch |
| B2 · blind | P/D/J-testene kontrollerer tall, men mangler anbefaling/regelutløsere, `financial-result-renewal.test.ts:37–46` | **low**. Dette er en konkret svakhet i disse testenes dokumentasjon av AC2, uten påvist produktfeil. Uavhengige prøver ga P=20 mill. → Gå videre/prioritet 3; D=900 000 → Forkast/yieldbrudd; J=1 600 000 → Forkast/negativ kontantstrøm. Eksisterende E2E verifiserer J og flere L-regelutfall. Direkte forventninger i de eksisterende prøvene gjør P/D/J-beviset tydeligere. | R2 patch, testforbedring |
| B3 · blind | Periodeprøven mangler forventede normaliserte tall, `financial-result-renewal.test.ts:68–83` | **low**. Prøven kontrollerer fornyet binding, men ikke årsfasiten. Uavhengig L=1 900 000/måned ga års-L 22 800 000, NOI 22 400 000 og kontantstrøm 21 600 000 korrekt. Legg direkte fasitforventninger i eksisterende prøve; ingen produksjonsfeil er påvist. | R3 patch, testforbedring |
| B4 · blind | Kostnadsvarianten endrer bare etikett, ikke numerisk innhold, `financial-result-renewal.test.ts:71` | **low**. Faktisk begrensning i den nye fornyelsesprøven, uten observerbar produksjonsfeil. Uavhengig endring av `cost-1` til 150 000/30 000 fornyet snapshotets kostnadsgrunnlag til D120 000/J30 000, mens registrerte D/J-totaler og de fire tallverdiene var uendret. Hele metric-objektet skal ikke være identisk, fordi opphavsgrunnlaget faktisk er nytt. Styrk den eksisterende kostnadsprøven med denne typen fasit. | R4 patch, testforbedring |
| B5 · blind | Manglende-Ymin-snapshot beregnes, men beholdes ikke gjennom gjenoppretting, `financial-result-renewal.test.ts:49–64` | **low**. Kandidaten beskriver de nye prøvene korrekt. Eksisterende `result-snapshot.test.ts:370–382` beholder et slikt snapshot, men gjenberegner med intern beregningshandling. Uavhengig beholdt prioritet-1-snapshot → Ymin10 → bekreftelse → vanlig navigasjon ga current/Forkast og identiske fire nøkkeltall. En direkte utvidelse av eksisterende prøve dokumenterer nettopp den nye navigasjonskoblingen. | R5 patch, testforbedring |
| B6 · blind | Ingen ny finansfornyelsesprøve fra allerede korrigert/avvist rapportbaseline, `financial-result-renewal.test.ts:109–120` | **low**, avvist. Proveniens og kontroll etter korrigering/avvisning er allerede prøvd i snapshot-testene. Finansfornyelsen tar samme rapportobjekt og sammenligner hele ikke-finansielle bindingen; ingen ny kontroll-/proveniensgren er innført. Uavhengig baseline med bekreftet avvisning ga gjeldende Forkast etter L-endring med identisk rapportobjekt. Den foreslåtte ekstra scenariooppbyggingen gir liten nytte for en lite sannsynlig, ikke observert feil og er mer enn en direkte korreksjon. | Avvist |
| B7 · blind | Rapport-scopeprøven endrer feil/status, ikke ekte rapportidentitet, `financial-result-renewal.test.ts:144–155` | **low**, avvist. Eksisterende `result-snapshot.test.ts:383–433` og `screening-result-navigation.test.ts:35–58` dekker reelt bytte, generasjon, gamle svar og historisk navigasjon. Den nye porten sammenligner alle rapportidentitetsfeltene gjennom eksisterende `sameResultBinding`. Uavhengig bytte til generasjon 2 fulgt av finansbekreftelse beholdt historisk resultat. Ny full rapportscenariooppbygging ville være redundant og er mer enn en direkte korreksjon. | Avvist |
| B8 · blind | Verifikasjon lover kjørbare kommandoer, men oppgir ikke eksakte E2E-filtre/env, `story-3-8-verifikasjon.md:26–39` | **low**. Arbeidsøkten sier eksplisitt at rapporten inneholder kjørbare kommandoer. Rapporten har runtime-/browserstier og resultatantall, men ikke de eksakte Playwright-kommandoene for 5-/46-testkjøringene. Dette gjør reproduksjon av beviset mindre presis. Direkte dokumentasjonskorreksjon er tilstrekkelig. | R6 patch, dokumentasjon |
| E1 · edge | Samme nullkontrollovergang beholder Utdatert, `session.ts:107–111` | **medium**. Uavhengig identifisert samme trigger og utfall som B1; eget verdict støttes av reviewerens røde test. Korrekt kontrollport kan fornyes ved ventende finansendring selv om endelig binding er lik. | R1 patch etter gruppering |

Verification Gap Reviewer ga eksplisitt «No verification gaps found». Acceptance Auditor ga eksplisitt «No acceptance violations found». Dette er fullførte lag uten kandidater, ikke lagfeil. Kandidater B1/E1 ble først gruppert etter individuelle vurderinger; de har samme rotårsak. B2–B5 og B8 gjelder forskjellige, små test-/dokumentasjonsforbedringer.

## Rettingsliste

- [x] **R1 · medium · produktfeil · blind+edge:** Finansfornyelse må også håndtere ventende finansendring med identisk sluttbinding. Behold gyldig finans, fullført rapportkontroll og identisk ikke-finansiell binding som porter. Ingen generell historikk-nullstilling eller Story 3.9-fornyelse. Ny snapshotberegning skal erstatte historisk status; bare ny bekreftelse skal ikke gjenopplive gammelt snapshot.
- [x] **R2 · low:** P/D/J-prøvene får anbefaling, prioritet og relevante regelutløsere med uavhengig fasit.
- [x] **R3 · low:** Periodeprøven får årsnormalisert grunnlag og alle berørte metric-forventninger.
- [x] **R4 · low:** Kostnadsprøven bruker numerisk innhold og kontrollerer oppdatert snapshotgrunnlag samt bevarte registrerte D/J-totaler.
- [x] **R5 · low:** Behold faktisk manglende-Ymin-snapshot gjennom registrering/bekreftelse av 10 % og navigasjonsfornyelse; bevar de fire tallene.
- [x] **R6 · low:** Oppgi eksakte kjørte E2E-kommandoer, filtre og nødvendige miljøvariabler i egenverifikasjonen.

Ingen `decision_needed` eller `defer`. To lavnivå ekstra scenarier er avvist med begrunnelse over. Original implementeringsagent tar rettingene sekvensielt etter dette checkpointet; reviewer endrer ikke produksjon.

## Uavhengig bevis og begrensninger

Ny reviewerprøve `review R1 AC5: tilbaketrukket og gjenbekreftet nullkontroll fornyer selv ved identisk binding` er lagt i `tests/unit/financial-result-renewal.test.ts`. Den bygger først gjeldende J=0 gjennom ordinær finansfornyelse, trekker nullkontroll tilbake og bekrefter igjen, viser at bindingen er lik og resultatet fortsatt historisk før navigasjon, og krever nytt gjeldende snapshot etter den vanlige fremoverflyten. Den bevarer rapporten og kontrollerer gammelt snapshots beløp.

Eksakt rød kommando:

```sh
PATH=/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:$PATH npm test -- tests/unit/financial-result-renewal.test.ts -t 'review R1'
```

[Rødt råbevis](story-3-8-review-rod.txt): én feilet, 18 utelatt; forventet `current`, fikk `historical` etter navigasjon. Dette bekrefter et faktisk AC5-brudd i implementeringscommiten. Andre reviewerprøver ble kjørt med pinnet Node mot virkelige reducer-/domainmoduler og bekreftet P/D/J-regelutfall, månedsnormalisering, numerisk kostnadsgrunnlag, beholdt manglende Ymin, bekreftet avvisningsbaseline og rapportgenerasjonsvern. En innledende reviewerassertion sammenlignet hele metric-objektet ved endret kostnadsinnhold; den var for streng fordi provenance skal oppdateres. Den ble rettet til å sammenligne tallverdier og kontrollere endret grunnlag separat; ingen produktfeil ble skjult.

Ingen betalte/eksterne API-er ble brukt. Full regresjon er ennå ikke kjørt av reviewer; forelder eier den etter retting/etterkontroll. Ingen ny produkt-/arkitekturbeslutning eller Story 3.9+ er innført. Ingen commit eller push i dette avventende-retting-checkpointet. Aktiv automatisk promptlogg beholdes utenfor fasecommit.

## Uavhengig etterkontroll og endelig reviewutfall

Forelder reengasjerte original implementer først etter at den første reviewturen var avsluttet. Implementer leverte patchcommit `1bc47e9d6913abbd5c3810c0fe4d7be7fc1605b7` og avsluttet før reviewer ble reaktivert. Ingen ny bred reviewrunde eller nye subagenter var nødvendig: patchen endrer bare det påviste fornyelsesvilkåret, relevante tester og dokumentasjon.

| Funn | Etterkontroll mot faktisk patch | Utfall |
|---|---|---|
| B1/E1 → R1 | `pendingFinancialChange` inngår i fornyelsesvilkåret, fortsatt kombinert med lik ikke-finansiell binding, gyldig finans og fullført rapportkontroll. Reviewerens tidligere røde prøve er nå parameterisert: normal nullgjenbekreftelse gir nytt current-snapshot; samtidig avvist funn og ny listebekreftelse gir fortsatt historical. Uendret retur beholder samme snapshot. | Lukket; AC5 rettet uten 3.9 |
| B2 → R2 | P20 mill. gir nettoyield 7,5 %, Gå videre/prioritet 3 og de tre forventede positive utløsere. D900 000 gir nettoyield 6,25 % og bare yieldbrudd; J1 600 000 gir kontantstrøm −100 000 og bare negativ-kontantstrøm-utløser. Nye direkte forventninger stemmer med låste formler. | Lukket, testforbedring |
| B3 → R3 | Registrert måneds-L1 900 000, faktor12, års-L22 800 000, NOI22 400 000, nettoyieldbrøk22 400 000/16 000 000 og kontantstrøm21 600 000 kontrolleres direkte. | Lukket, testforbedring |
| B4 → R4 | Numerisk kostnad150 000, gjeld30 000 gir D120 000/J30 000 i snapshotgrunnlaget. D400 000/J800 000 beholdes som registrerte totaler, fire tallverdier er uendret og gammelt snapshot beholder120 000/20 000. | Lukket, testforbedring |
| B5 → R5 | `state = missing` beholder faktisk prioritet-1-snapshot. Bekreftet Ymin10 etterlater det historisk til navigasjon; deretter nytt current/Forkast med identiske nøkkeltall. Gammelt mangelsnapshot er fortsatt uendret. | Lukket, testforbedring |
| B8 → R6 | Eksakte historiske kommandoer, PATH og browsersti er dokumentert. Reviewer fant at ekstra femtest-filter med innledende `^` valgte null tester, fordi Playwright bruker full tittel. Fjernet bare ankeret og verifiserte med `--list`: fem tester, og berørt full kommando:46. Dette er dokumentkorreksjon, ingen ny produkttestkjøring. | Lukket, dokumentasjon |
| B6/B7 | Opprinnelig avvisning står; patchen introduserer ingen ekstra provenance-/rapportbytteatferd. Det nye samtidige rapportendringsvernet styrker den relevante grensen ytterligere. | Fortsatt avvist low |

Reviewer kjørte selv, på faktisk patch, **148/148 tester i fem relevante filer**, inkludert begge nullkontrollvariantene og eksisterende TG3-/funn-/rapport-scopevern. [Uavhengig grønt råbevis](story-3-8-review-etterkontroll.txt). `npm run typecheck`, `npm run lint` og `git diff --check` bestod. Testkommandoen står i råbeviset; pinnet PATH er den samme som i den røde kommandoen over. Ingen test er erstattet med mock av produktregelen.

Formelt review er derfor bestått med én rettet medium produktfeil, fem rettede low test-/dokumentasjonsforbedringer og to begrunnede low-avvisninger. Ingen åpne beslutninger, patches eller deferred. Spec og bare Story 3.8-raden i sprintstatus er satt `done`; Story 3.9 er fortsatt backlog. Full sluttregresjon gjenstår fordi brukeren ba avslutte nå; forelder starter derfor ingen ny testfase. Done gjelder bestått storyreview med målrettet kontroll. Review/done-fasecommit omfatter dokumentert rødt/grønt reviewbevis, prosessfiler og status; aktiv automatisk JSONL-promptlogg er uttrykkelig utelatt. Ingen push.
