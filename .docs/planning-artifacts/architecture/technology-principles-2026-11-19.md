# Prinsippvurdering av faglærerens teknologioversikt

Dato: 2026-11-19. Kontrollgrunnlag: lokal HEAD `684e61d3686f83f05c3f6cb1a3720dfb3f622c68`.
Dette er dokumentgjennomgang og kode-/teststikkprøver, ikke en ny sikkerhetsrevisjon eller produktbestilling.

[technology.md](technology.md), lagt til av Bård Pettersen i referansecommiten,
beskriver **Pytagoras Forlag / `pytagoras-website-v2`**, med butikk, kontoer,
betaling og flere tjenester. Dokumentet fastsetter ikke PAA-krav. Versjoner,
leverandører, nøkkelnavn og kontobehov i denne kilden gjelder dette andre
produktet; de er ikke kontrollert som oppdaterte anbefalinger 19. november.
Originalen beholdes uendret.

PAA beholder React/TypeScript/Vite, lokal Node/Express, PDF.js, Zod og
kodebasert økonomi/screening. Nøyaktige avhengigheter og runtimeversjoner
står i [package.json](../../../package.json), låsfilen og [README](../../../README.md).
Ingen nye tjenester, avhengigheter, kontoer eller miljøvariabler innføres.

## Overførbare prinsipper og bevis

«Viderefør» betyr at et relevant prinsipp allerede finnes i PAA.
«Presiser» betyr en dokumentert avgrensning, ikke en kodeendring.
«Ikke innfør» betyr at forslaget mangler behov i den lokale prototypen.

| Referanse i technology.md | Vurdering for PAA | Konkret grunnlag og konsekvens |
| --- | --- | --- |
| §1, §8.2: null nøkler og deterministisk demo | **Viderefør, med eksplisitt modus.** | [Demo-adapter](../../../src/backend/analysis/demo-adapter.ts) bruker hashbundne, fiktive svar; vanlig import bruker lokale regler. [backend-config](../../../src/backend/analysis/backend-config.ts) avviser feil eller manglende live-nøkkel. PAA skal ikke stille bytte en ønsket live-analyse til mock og fremstille den som vellykket. [Tester](../../../tests/unit/backend-config.test.ts) og [serverprøver](../../../tests/integration/server-mode.test.ts) skiller modusene. |
| §2: én offentlig inngang og relative API-stier | **Viderefør lokalt; ikke innfør proxy.** | [server.ts](../../../src/backend/server.ts) serverer frontend og `/api` fra `127.0.0.1`; Vite bruker middleware i samme prosess. Caddy og ekstra containere løser ikke et nåværende PAA-behov. Dette er ingen produksjonsgaranti mot alle nettangrep. |
| §2: tydelige ansvars- og tillitsgrenser | **Viderefør lagdeling.** | [Gjeldende arkitektur](../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md) skiller contracts, domain, backend og frontend/presentation. KI tolker ikke økonomiske terskler eller anbefalinger. [finance](../../../src/domain/finance.ts) og [screening](../../../src/domain/screening.ts) er etterprøvbare kodegrenser. Kontrollplan/dataplan på tvers av tjenester er unødvendig i enkeltbrukerappen. |
| §2, §6.1/6.8: auth, JWT/JWKS, capability-tokens, roller | **Ikke innfør.** | PAA har ikke kontoer, betaling eller tjenestekryssende rettigheter. Session-ID/rapporthash er korrelasjon og kildebinding, ikke autentisering. Den lokale serveren er ikke dokumentert som en offentlig flerbrukertjeneste. Produksjonsutrulling ville kreve ny behovs-/trusselvurdering; slike mekanismer er ikke levert nå. |
| §2: rate limiting og sikker oppstart | **Viderefør relevante sperrer; ikke likestill dem med auth.** | [Import-route](../../../src/backend/http/import-route.ts) har validert input, delt behandlingslås, frist og avvisning av live-import. Låsen verner ressursbruk; den er ikke per-IP rate limiting. [receive-pdf](../../../src/backend/http/receive-pdf.ts) begrenser bytes. Ukjente API-er avvises og serveren gir trygge feilmeldinger. Ingen ny auth-tjeneste eller webhotellering følger av dette. |
| §3: vertikale moduler, validering og konfigurasjon | **Viderefør struktur og validerte kontrakter.** | Zod-kontrakter i [contracts](../../../src/contracts/README.md), rene regler i [domain](../../../src/domain/README.md), I/O i [backend](../../../src/backend/README.md). SQLAlchemy-sesjoner, migrasjoner, DB-seeding og pluginsystem gjelder ikke PAA uten database. |
| §3/4, §6.13: feature flags | **Presiser eksisterende porter; ikke lag et flaggsystem.** | [Importkonfigurasjon](../../../src/backend/http/import-route.ts) sier `liveEnabled:false`, `codeFirst:true`; [semantikkadapter](../../../src/backend/import/semantic-adapter.ts) tillater bare eksplisitt `offline-stub` i kontrollerte tester. Backendens `ANALYSIS_MODE` styrer eldre rapportanalyse, ikke alle økonomihjelpere. Flere generiske flagg ville øke konfigurasjonsflaten uten et dokumentert behov. |
| §4: frontendbiblioteker og visuell konsistens | **Viderefør eksisterende UI; ikke bytt rammeverk.** | [Konsept A](../ux-designs/ux-IBE160-2026-10-30/DESIGN.md), egne komponenter, tastatur-/fokusprøver og [offentlig demonstrasjon](../../process/leveranse-2026-11-06/demonstrasjon.md) gir relevant designbevis. Next, Tailwind, shadcn, editorer og regnearkbiblioteker følger det andre produktets behov. Ingen ny slik avhengighet er begrunnet. |
| §4: CSP og innholdssikkerhet | **Vurder prinsippet, uten å påstå full beskyttelse.** | [server](../../../src/backend/server.ts) setter `nosniff`, leverer bare `dist` i bygget modus og skjuler rå driftsfeil. [Vite-konfig](../../../vite.config.ts) stenger sensitivt dev-innhold. Dette dokumenterer ikke en full CSP, pentest eller sikkerhet ved offentlig hosting. CSP-/DOMPurify-oppsettet fra et annet produkt kan ikke kopieres uten analyse av PAA sine faktiske innholdskilder. |
| §5/6.12: Compose, hosting, cache og database | **Ikke innfør.** | README-demoen trenger Node/npm og Chromium til nettlesertester; ingen Docker, Postgres, Redis, Railway eller Supabase. Lokal, midlertidig vurdering er et bevisst omfangsvalg. Flere tjenester ville gjøre sensorens rene kjøring vanskeligere uten nødvendig produktverdi. |
| §5/6.11: backup, restore og overvåking | **Ikke innfør eksterne tjenester nå; presiser livsløp.** | Originalen holdes midlertidig i frontend; vanlig import rydder requestfiler. Økonomihjelpernes forberedte pakker har 15 minutters gyldighet, men er ikke garantert slettet etter 15 minutter. Særskilt godkjent live kan skrive private resultat-/budsjettfiler. [Lagringsavstemming](../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md) beskriver dette. Varig brukerlagring ville kreve separat backup-/restorebeslutning. |
| §6.1–6.9: hemmeligheter vs offentlig konfigurasjon | **Viderefør og dokumenter nøyaktig.** | [.env.example](../../../.env.example) er nøkkelfri; Node laster den ikke automatisk. API-nøkkel leses bare i backend. [vite.config.ts](../../../vite.config.ts) har `envPrefix: []`, og `private/`, `.env*`, backend og `.git` er sperret ved dev-filservering. [.gitignore](../../../.gitignore) utelater private originaler og ekte miljøfiler. Det er variabelnavn og tomme eksempelverdier som dokumenteres, aldri faktiske nøkler. |
| §6.5: modell-/pris-/budsjettkonfigurasjon | **Viderefør eksplisitt kostnadsstyring.** | [R1](../r1-live-ki-semester-v1.md) er den historiske rapportbeslutningen; [code-first design](../salgsoppgave-code-first-design-2026-10-29.md) og [økonomiruten](../../../src/backend/http/economy-route.ts) har egne nyere grenser og samtykke. En historisk pris er ikke bekreftet aktuell pris eller kontobalanse. Betalt kjøring er ikke del av denne gjennomgangen. |
| §6.2–6.4/6.6–6.8, §7: kontoer, betaling, e-post, regnskap, selgeridentitet | **Ikke innfør.** | PAA selger ikke varer og har ingen ordre-/faktura-/innholdsmodell. Stripe, Vipps, Resend, Fiken, Supabase-nøkler og Pytagoras-identitet skal ikke kopieres. OpenRouter bytter heller ikke ut PAA sin bevarte SDK-grense. |
| §6.9/6.10, §8.9: build-konfig og release/migrering | **Viderefør reproduksjon, ikke migreringsoppskrift.** | README krever ny build og serverstart etter endringer. [Import-runtime](../../../src/backend/http/import-runtime.ts) fanger endrede runtimebytes. [Ren-klon-bevis](../../process/leveranse-2026-11-06/ren-klon.md) binder testene til commit og låsfil. Ingen automatisk `production`-deploy, cutover-hemmeligheter eller migreringsjobb behøves. |
| §3/4: relevante automatiserte tester | **Viderefør eksisterende verktøy og skill bevisklassene.** | PAA bruker Vitest og Playwright. [Teknisk rapport](../../process/leveranse-2026-11-06/teknisk-og-test.md) skiller offentlig syntetisk regresjon, stubber, private originaler, native OCR og historisk live. Et testantall eller et mocksvar er ikke menneskelig UX-/S6-bevis. |
| §8: eksplisitt oppskrifts-/nøkkeldokumentasjon | **Viderefør tilpasset README.** | Sensor skal kunne starte uten private filer/nøkler. [README](../../../README.md) beskriver eksakte versjoner, demo, datakilder, grenser og tester. [Ny testprotokoll](../../process/evaluering/testprotokoll-del1-2026-11-19.md) forbereder faktisk førstegangsprøve; gjennomføringen er fortsatt ikke utført. |

## Betydning for del 1

[Sensorveiledningen](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf)
vurderer begrunnede teknologivalg og sammenheng plan–kode (s. 2–3), relevante
tester/sikkerhetsbevis (s. 4), passende arkitektur/konfigurasjon (s. 5),
kjørbar README (s. 5–6) og et ryddig repo uten hemmeligheter (s. 6).
Den krever ingen bestemt stack, skyplattform, database, betalingsløsning eller
produksjonsdrift. A–B-kjennetegnene er felles nivåbeskrivelser, ikke en
checkliste som automatisk gir A ved å legge til tjenester.

Vurderingen styrker begrunnelsen for eksisterende valg og avgrenser hva de
beviser. Den endrer ingen kode eller lukker kvalitetsavvik. Alle faktiske
restpunkter beholdes i [sentral deferred-work](../../implementation-artifacts/deferred-work.md).
