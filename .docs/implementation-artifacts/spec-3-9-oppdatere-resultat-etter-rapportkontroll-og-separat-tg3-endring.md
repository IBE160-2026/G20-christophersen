---
title: 'Story 3.9 — Oppdatere resultat etter rapportkontroll og separat TG3-endring'
type: 'feature'
created: '2026-10-22'
status: 'done'
route: 'oneshot'
story_key: '3-9-oppdatere-resultat-etter-rapportkontroll-og-separat-tg3-endr'
baseline_commit: 'e2c2c131c7adeef0c80c2f1d9cab93c4aa069264'
---

<frozen-after-approval reason="Brukeren har eksplisitt bestilt Story 3.9 etter eksisterende AC med sekvensiell implementering og separat uavhengig review">

## Intent

Implementer bare Story 3.9 AC1–6 i epics.md. Koble eksisterende rapport-, funn- og separate TG3-handlinger til ny resultatnavigasjon etter nødvendig kontroll. UX DESIGN/EXPERIENCE, SPEC CAP-7 med CAP-2/3/4/6/8, grensekontrakter, arkitektur AD-2/4/6/8–10 og sprintstatus er autoritative. Bevar de fire trinnene, domain som eneste regelautoritet og immutabelt forrige snapshot.

Ubrukt korrigeringsutkast bevares ved funn-/trinnbytte, opplyses på Resultat og påvirker ingen brukt liste, tall, anbefaling eller gyldig bekreftelse. Avbryt fjerner bare utkastet. Bruk korrigering opphever relevant funn-/listebekreftelse; avvisning opphever listebekreftelse og bevarer originalen som inaktivt brukeravvist uttrekk. Forrige resultat er straks historisk og beholdes til nødvendig kontroll er fullført og eksisterende resultatnavigasjon gir nytt snapshot. Ingen kontrollendring utløser adapter-/KI-kall.

Registrert TG3-status, begrunnelse og grunnlag gjør forrige resultat historisk ved faktisk endring. Uendrede tall/liste beholder bekreftelsen. Felles FR-5-validering avgjør anvendbarhet; Uavklart/ukjent/ugyldig Avklart gir Innhent mer informasjon ved vurderingsgrensen. Eksisterende kontrollport tillater Uavklart etter relevant håndtering og beholder lokale feil/ufullstendighet i kontrolltrinnet. Gyldig Avklart fjerner bare aktuell mangel; øvrige mangler og økonomiske regler avgjør fortsatt. Samme findingId overfører ingen avklaring til annet/ukjent rapportforhold. Representasjonsretting kan bevare eksisterende avklaring etter felles validering; original, brukerretting og avklaringsgrunnlag bevares.

Ny rapport gjør gammelt resultat historisk og nullstiller aktivt rapportuttrekk, kontroller og TG3-registreringer. Ny eksplisitt analyse og rapportkontroll kreves; gammel/sen respons kan ikke fullføre ny rapport. Ny feil forblir synlig utilstrekkelig grunnlag og gir ingen snarvei gjennom kontrollporten. Nytt snapshot binder alle tall, aktive funn, kilder, avklaringer, utløsere og anbefaling til samme nåværende grunnlag, også ved fortsatt prioritet 1.

Verifiser utkast/Avbryt/Bruk, avvisning, hver TG3-endring, gyldig og ukjent forholdsbinding, ny rapport med kontrollert sent svar og feil/fullføring, revisjoner, originalbevaring, kallantall samt fokus/lokale feil. Bruk ekte PDF-fixtures og kontrolladapter uten betalt API. Ingen Epic 4, ny produkt-/arkitekturbeslutning, ny avklaringshandling, retry, persistens eller ny regelautoritet. Stopp ved beslutningsbehov. Dokumenter AC-/testbevis og prompts/arbeidsøkt. Lag lokal implementeringscommit uten push og stopp ved in-review/review før separat reviewer.

</frozen-after-approval>

## Implementation Notes

- Step01/02: autoritativ Epic3-kontekst og done-spec 3.8 er videreført. AC, SPEC/grensekontrakt, UX, arkitektur, sprintplan/status og kurs-/feedbackuttrekk er lest. Ingen intentgap eller irreversible operasjoner. Produksjonsfotavtrykk er eksisterende resultatnavigasjon i `src/frontend/state/session.ts`; ingen ny offentlig API. Oneshot brukes med brukerbestilt separat reviewfase.
- Code Map: `state/report.ts` eier utkast/kontroll/revisjoner/gamlesvarvern; `state/result.ts` eier binding/snapshot/historisk visning. Gjenbruk `findingListAssessment(...).controlCompleted` og `isFinancialConfirmed`. `domain/tg3-resolution.ts` og `domain/finding-control.ts` beholder eneste autoritet for anvendbarhet. `ReportAnalysis`, `ScreeningResult`, `FindingControl` og `Tg3Resolution` har nødvendige retur-/feil-/fokusmønstre og gjenbrukes.
- Tester: nye overgangsprøver i `tests/unit/report-result-renewal.test.ts`; bygget-app-forløp i eksisterende `tests/e2e/screening-result.spec.ts`. 3.8s midlertidige scopeprøver oppdateres når kontrollert rapport-/TG3-fornyelse nå er levert; ukontrollert grunnlag skal fortsatt være historisk. AC-spor og eksakte kommandoer dokumenteres i `story-3-9-verifikasjon.md`.

- Implementert kontrollert rapport-/funn-/TG3-fornyelse i eksisterende resultatnavigasjon; alle andre produksjonsmoduler er uendret. 18 nye overgangstester ga 16 røde før endringen, og 254 berørte tester er grønne etterpå. 3.8s midlertidige scopeprøver er oppdatert til 3.9-integrasjon.
- 72/72 berørte bygget-app-tester består, inkludert 8 nye. Første kjørings innerText/textContent-feil i testforventning ble rettet uten produktendring. Typecheck/lint/build/diffkontroll består. Tre faktiske UI-bilder er åpnet/inspisert; AC-spor, miljø og kommandoer står i `story-3-9-verifikasjon.md`.
- Checkpoint in-review/review. Ingen ny beslutning eller blocker. Implementeringsagenten har ikke utført review eller satt done; ny separat BMAD-reviewagent og full siste regresjon utføres av forelder. Epic 3 forblir in-progress og Epic 4 er ikke startet. Ingen push.

## Review og sluttverifikasjon

Uavhengig full BMAD-review av `e2c2c131c7adeef0c80c2f1d9cab93c4aa069264..7a4e1bb1efe0a93e8b1cfadd91eb9cccf6fcc826` er bestått. Fire nye lag kjørte sekvensielt: Blind Hunter, Edge Case Hunter, Verification Gap Reviewer og Acceptance Auditor. Alle ti kandidater er individuelt refutert i [reviewrapporten](story-3-9-review.md); ingen patch, defer eller beslutningsbehov. Reviewrapportcommit: `d49ca16d6b00b0d88b3804b99736fe99128e0f65`.

Forelderen kjørte full sluttregresjon på dette kodecheckpointet: 958/958 Vitest, 37/37 komponenter, 114/114 bygget-app og 3/3 dev-E2E, typecheck, lint, build og 7/7 promptloggtester består. [Arbeidsøkten](../process/arbeidsokter/2026-10-22-story-3-9.md) lenker kommandoer og råbevis. Ingen produktkode eller tester ble endret etter review eller regresjon. Story 3.9 er done; alle ni Epic 3-stories er kontrollert done i både spec og sprintstatus, og Epic 3 er derfor done. Retrospektivet er fortsatt optional. Epic 4 er urørt, ingen push og ingen nye blockers.
