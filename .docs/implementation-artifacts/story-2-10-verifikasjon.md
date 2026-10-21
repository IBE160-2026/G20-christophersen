# Story 2.10 — egenverifikasjon før uavhengig review

Dato: 2026-10-21. Baseline: `70c799af3593ad10795cb1eebaa95771530e9478`.
[Implementeringsspec](spec-2-10-separat-tg3-avklaring.md). Ingen uavhengig review
utført av implementeringsagenten. Kun Story 2.10 er implementert.

| Kontroll | Faktisk bevis |
|---|---|
| AC1: eksplisitt Avklart og to ikke-tomme tekster | Domain/reducer dekker alle sju FR-5-eksemplers avklaringsdel, status ukjent/blank/feil og whitespace i begge felt. E2E etterprøver tilknyttede feil, Tab mellom feltene og kontinuerlig feltfokus. |
| AC2: separat brukergrunnlag og original | Egne TG3-registreringer; immutabel original/PDF og gjeldende funn identiske før/etter. E2E leser begge faktiske tekstlag og originalfeltene med kilde; UI sier brukerbekreftet for førstevurdering, ingen KI-fakta/ekstern verifisering/teknisk godkjenning. |
| AC3: ett av to er utilstrekkelig | Unit og E2E navngir andre TG3 med fysisk side etter første avklart. Alle avklart gir bare ingen kjente TG3-mangler, aldri automatisk Gå videre eller økonomiberegning. |
| AC4: forholdsbinding | Felles snapshot/validator sammenholder grad, rapportidentitet, fysisk side og whitespace-normalisert beskrivelse. Ren whitespace-retting kan bevare avklaring. Annen/ukjent tekst, side eller rapport er utilstrekkelig ved samme ID. E2E bytter elektrisk forhold til tak med korrekt fysisk side og bevarer original og tidligere registrert binding. Bare tekstredigering overfører ikke avklaring; eksisterende statusfelt registreres eksplisitt for gjeldende grunnlag. |
| AC5: revisjon og isolasjon | Faktisk status/begrunnelse/grunnlag øker TG3-revisjon, uendrede finans/liste/enkeltfunnkontroller beholdes. Uendret registrering, navigasjon og rent utkast øker ingen TG3-revisjon. E2E kommer tilbake til fortsatt bekreftet finans, samme TG3-tekster og ett analyse-POST. |
| Negative grunnlag | Avvist/TG2/usikker kilde, mislykket analyse, feil rapportidentitet, ukjent funn og gammel generasjon kan ikke få anvendbar avklaring. Rapportbytte nullstiller gjeldende registreringer. Rettet usikker kilde krever egen eksplisitt registrering. |
| Tastatur/fokus/regresjon | Faktisk Tab-rekkefølge og aktivt tekstfelt ved gyldig/ugyldig overgang. Geometrikontroll av synlig felt ved 800×500. Gamle 2.7/2.8/2.9-prøver bestod uendret. |

## Kjørte kontroller

- `npm test` med tillatt lokal loopback: 21 filer, **562/562** bestått (81 s).
- Etter dette: én ekstra usikker-kilde-prøve lagt til. `npx vitest run tests/unit/tg3-resolution.test.ts`: **25/25** bestått, inkludert den nye prøven. Totalt 563 unike unit-/integrasjonsprøver er kjørt grønne; siste fulle kjøring omfattet 562. Produktkode er identisk med fullkjøringen.
- `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-1-2-browsers npx playwright test --workers=2`: **83/83** bygget-app-E2E bestått (49 s).
- `... npx playwright test --config playwright.dev.config.ts --workers=2`: **3/3** bestått.
- Siste utsnittsendring i skjermbildetest: bare den aktuelle AC1–3/5-prøven kjørt igjen, **1/1** bestått.
- `npm run typecheck`, `npm run lint`, `npm run build`: bestått. Eksisterende Vite-varsel om chunk >500 kB består, ingen ny avhengighet.

Første ueskalerte fullforsøk traff `listen EPERM` i sandbox; tillatt lokal
kjøring bestod. Det første forsøket avdekket også at den strenge delkontrakten
måtte få en eksplisitt projeksjon av gjeldende funn (ikke hele analyseposten);
det er rettet. I første nye browserprøver ble to feil i testoppsettet rettet
(native select-tastemønster og antakelse om deaktivert finansknapp). Én reell
UX-feil ble rettet: endret feiltekst kunne skyve aktivt tekstfelt ut av den
korte arbeidsflaten. Renderkontroll ruller bare aktivt felt i egen TG3-gruppe
nærmest inn i synsfeltet; den flytter ikke fokus eller stjeler det ved retur.

[Inspisert feltgruppe](story-2-10-tg3.png). Egen fiktiv PDF og separat håndskrevet
fasit i `tests/fixtures/finding-control/tg3*`; generator og kontrolladapter leser
ikke fasiten. Ingen betalt/live-KI eller faktisk ekstern kontroll er testet.

Arkitekturens AD-2/AD-8 og `reviews/recheck-seams.md` delegerer konkrete
bindingsfelt til contracts/domain og tillater representasjonsretting uten ny
handling. Whitespace er en begrenset, mekanisk identisk representasjon; koden
hevder ikke å forstå om en forbedret fritekst eller annen PDF-side er samme
forhold. Ukjent tilhørighet er derfor konservativt utilstrekkelig. Uavhengig
review skal kontrollere denne implementasjonen særskilt mot AC4.

Ingen blocker eller ulåst beslutning er funnet. 2.10 er review; 2.11 backlog;
Epic 2 in-progress og Epic 3 backlog. Neste port er separat full BMAD code review.
