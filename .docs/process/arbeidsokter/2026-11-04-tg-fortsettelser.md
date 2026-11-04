# TG-fortsettelser og målrettet tolkningsgrunnlag

Økt 2026-11-03–04, fra `b982e10d7e6fa4b1ca81824a6c02de94301f2edb`.
Brukeren autoriserte implementering, subagenter, lokale tester og commit,
men ingen betalte API-kall eller push. Aktiv automatisk promptlogg beholdes
append-only og inngår i samme commit.

En enkel sekvensiell pipeline er videreført: PDF.js, lokale tekstregler,
lokal Vision/OCR, kildevalidering og et avgrenset tolkningsutvalg. Ingen ny
agentarkitektur eller finansregel. BMAD-build ble brukt med tre parallelle
arbeidsspor (tekstfortsettelse, tolkningsgrunnlag, ekte rapport/native OCR),
deretter uavhengig review av hverandres arbeid. Konkret triage og rettinger
står i [spesifikasjonen](../../implementation-artifacts/spec-tg-fortsettelser.md).

## Faktisk dokumentdekning

Den eksisterende private salgsoppgaven på 135 sider er analysert lokalt.
Rapportområdet er fortsatt usikkert avgrenset til fysisk side 63–87;
25/25 sider er rendret og lest. Ti TG2-detaljer med bygningsdel, avvik og
30 originalregioner er beholdt på 71,72,73,75,76,77,79,82. Ingen nye sikre
TG-detaljer sammenlignet med baseline. Ingen ekte TG3 er verifisert; dette
beviser ikke fravær av TG3. De 23 TG2-sammendragsopplysningene beholdes og
legges ikke til detaljtelleren. 104 tekniske tekstkilder er validert mot
originale UTF-16-offseter gjennom sluttkontrakten.

På fysisk side 81 fortsetter Fuktsikring og drenering fra venstre bunn til
høyre topp. Et lokalt ekstra utsnitt gjenfinner avslutningsetiketten, men
fire tekstlinjer har motstridende OCR-avlesninger. Både opprinnelig tekst,
faktisk score og avvikende avlesning beholdes; koblingen forblir uavklart.
Etasjeskiller på side 74 og Overflater gulv på side 78 har tilsvarende
kolonneflyt med utilstrekkelig gradbevis. Vilkårlig løpende prosa over flere
sider, ukjente oppsett og usikre rom/avslutninger krever fortsatt kontroll.
Alle 25 rapportsider har usikker fullstendighet og TG-dekning er incomplete.

Tolv kildebundne tolkningsmål på sju sider er forberedt. Side 81 med to
originalområder prioriteres først og viser OCR-konflikten. 58 ytterligere
kandidatområder beholdes utenfor utvalget. De totalt 70 områdene inkluderer
usikre symbolsøk/fargede bildeelementer og er ikke 70 TG-funn. Ingen AI-request
er kjørt eller godkjent for transport. Priser/bildetokens og historisk
budsjettrest er uverifisert; USD 0,20-taket består og reservasjon er USD 0.
[Statistikk uten dokumenttekst](tg-fortsettelser-2026-11-04/ekte-rapport-statistikk.json).

## Nødvendig verifikasjon

Node 24.21.0, tom OPENAI_API_KEY. `vitest run` på visual-technical,
visual-import, technical-risk, technical-interpretation, property-risk,
technical-reconciliation, code-first-budget og code-first-import:
192/192 passer. Siste direkte berørte to filer: 66/66 passer etter siste
retting. Ingen bred gjentakelse av hele testsuiten.

`PAA_TEST_LOCAL_VISION=1 vitest run tests/integration/local-visual-native.test.ts`:
7/7 passer med faktisk lokal renderer/OCR, inklusive ny generisk rasterisert
kolonnefortsettelse og bevarte vektor-, monokrom- og TG3-prøver. Ny kolonneprøve
er etterprøvd separat etter geometrirettinger. macOS Vision måtte kjøres uten
sandbox fordi sandbox gir lokal Vision-lesefeil; dette er ingen API-transport.

`npm run build` (inklusive typecheck) og `npm run lint` passer. Vite varsler
som tidligere om stor klientbundle. Berørt ekte Playwright-importflyt på
isolert port 3254 passer (1/1, 18,5 s), inklusive eksisterende økonomi-/risikovisning,
originalsider og ny åpning av usikkert område med markering. Første kjøring
avdekket manglende områdemarkering; riktig kildemetode rettet dette, og den
andre kjøringen passer. Private skjermbilder/spor er kun i ignorert eller
midlertidig mappe. Ingen private PDF-er eller sitatuttrekk legges i Git.

Ingen konkret reviewfeil er utsatt. Generell TG-kvalitet og fremtidig betalt
AI-tolkning er fortsatt åpne i [sentral oversikt](../../implementation-artifacts/deferred-work.md).
