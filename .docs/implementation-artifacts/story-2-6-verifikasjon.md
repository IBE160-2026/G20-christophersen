# Story 2.6 — implementeringsverifikasjon 2026-10-20

Status: **review**, ikke separat godkjent done. Baseline:
`f0f394d50a451d3359553685d3be6f3af2fab3a3` (Story 2.5 done).
Autoritet: epics.md 2.6 AC1–AC6, låst arkitektur/SPEC/grensekontrakter,
final UX og eksisterende HTTP-/PDF-/demo-/analysekontrakter. Ingen backend-,
kontrakt-, fixture- eller domeneregel er endret.

## Faktiske sluttkontroller

| Kontroll | Resultat |
|---|---|
| `npx vitest run tests/unit/report-session.test.ts` | 26/26 består |
| `npm test` | 498/498 i 18 filer består, 90,98 s |
| `npm run typecheck` | exit 0 |
| `npm run lint` | exit 0, ingen varsler |
| `npm run build` | exit 0; kjørt separat og gjennom E2E |
| `npm run test:e2e` | 53/53 bygget-app-prøver + 2/2 dev-prøver består |
| `git diff --check` | exit 0 |

[Utskrift](story-2-6-kontroller.txt), [faktisk bygget F4-flate](story-2-6-funnliste.png)
og [prosesspor](../process/arbeidsokter/2026-10-20-story-2-6.md).
Skjermbildet er åpnet og visuelt kontrollert: korrekt gjeldende trinn,
originalidentitet, begge F4-funn med filside 2/4, opphav og ubekreftet liste.
Fullsuite og E2E bruker fiktive data, uten leverandør/nøkkel/betalt API.

Node 24.21.0/npm 11.19.0 fra godkjent lokal runtime; Chromium fra
`/private/tmp/ibe160-story-1-2-browsers`. Sandbox ga EPERM ved første
loopback-start; de faktiske nettverksprøvene ble kjørt med autorisert lokal
exec-eskalering. Ingen ekstern trafikk fra produksjonsdemoens F4-test.

## AC- og matrisespor

| AC / matrise | Kjørt bevis |
|---|---|
| AC1 / manglende grunnlag og fil | Rene klient-/sessiontester gir null fetch; bygget-app-test prøver sperret Start, viser lokal forklaring og teller null request. Eksisterende finansprøver bevarer grunnlagsporten. |
| AC1 / eksplisitt start, dobbeltstart | SHA-256 fra faktiske originalbytes, ekte multipart POST og korrelasjonsheadere; synkrone doble starter gir ett kall. Bygget app viser Analyserer og beholder Start-fokus. |
| AC2 / ugyldig struktur og aktiv identitet | Null/ufullstendig/manglende findings, ugyldig 200/JSON, feil session/request/generasjon/hash/modus/dokumentnavn, transportavvisning og HTTP-feil. Bygget app manipulerer den faktiske HTTP-returen for fem separate negative tilfeller. Ingen blir gjeldende fullføring. |
| AC3 / forlatt/erstattet og sent svar | Rene reducerprøver og klient som ignorerer abort. To gyldig korrelerte requests med sen gammel retur viser at gammel finally ikke låser opp/ødelegger nyere request. Filhash fullføres i motsatt rekkefølge. E2E prøver rapportbytte og retur mens analyse pågår, uten gammel liste. |
| AC4 / funn, usikkerheter, tomliste, feil/delresultat | Ordinær kontrolladapter i samme HTTP-/PDF-pipeline gir TG3, uklar grad/kilde/side, eksplisitt tomliste og timeout med delresultat. Faktisk feilformat viser document-feil før adapter. Produksjonsdemo viser alle F4-funn. Alle bevarer ubekreftet status og lokale domain-mangler. |
| AC5 / gjenbruk | Bygget app endrer/bekrefter L og går tilbake til listen; requesttallet forblir ett. Rene sessionprøver bevarer uttrekk/usikkerheter/mangler ved finansendring og ugyldig bekreftelsesforsøk. |
| AC6 / kort kunngjøring og synlig liste | Ved mottak vises «Uttrekk mottatt», ingen listehendelse. Brukeren åpner trinn 3; IntersectionObserver registrerer synlig listestart i arbeidsflaten. Separat 640×400-prøve krever ingen markør før listen rulles inn, deretter én fullføringskunngjøring. Fullføring flytter ikke fokus; eksplisitt navigasjon fokuserer trinnoverskriften. |

Synlighetsgrensen betyr at den ferdige validerte listen vises for kontroll,
ikke at alle linjer i en lang liste må være på skjermen samtidig. Markøren
binder bare gjeldende generasjon og er idempotent; ingen timer/telemetri.

## Interne funn og grenser

Den ene implementeringsagenten gjennomførte interne BMAD-linser sekvensielt
etter brukerens agentregel. Åtte konkrete forbedringspunkter og rettinger
står i [storyspecens triagelogg](spec-2-6-velge-rapport-og-ta-imot-bare-gjeldende-analyseutfall.md).
Vesentligst: DOM-montering alene er utilstrekkelig for AC6, derfor faktisk
viewportskjæring og en egen negativ liten-flate-prøve. I tillegg ble
initial kunngjøringsduplisering, sperret knappestil, feilklassifisering og
tre konkrete verifikasjonshull lukket. Ingen uløst funksjonsfeil, defer eller
produkt-/arkitekturblocker er kjent. Separat uavhengig review gjenstår.

2.6 leveres **review**; Epic 2 og SP2 pågår. 2.7–2.11 er backlog, og milepæl 1
er ikke fullført før 2.7. Ingen original-PDF-visning, funnkontrollhandling,
listebekreftelse, TG3-avklaring, resultat, live eller senere story er
implementert. Lokal demo beviser ikke semantisk KI-kvalitet, live-tid,
S5-måloppnåelse eller S6 annen-person-kjøring. R1/R4 er uendret.

Nøyaktig neste steg: en ny subagent kjører full uavhengig BMAD code review av
Story 2.6 mot alle AC og faktisk kode. Rett bare 2.6-forhold; done først etter
bestått review. Ingen push.
