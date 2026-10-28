# FINN-1 — levert deaktivert import og sluttverifikasjon

Dato: 2026-10-28. Omfang: [godkjent spec](../spec-finn-import.md).
**Den deaktiverte utviklingsleveransen er ferdig. Live-import er ikke aktivert,
og FINN-1 står fortsatt åpen i sentral deferred-work.**

## Implementert

Én validert FINN-boliglenke går gjennom en egen importkontrakt og injiserbar
Responses-adapter. Motoren krever ett fullført open_page på riktig annonse,
begrenser verktøybruk til ett kall og avviser feil kilde/handling/struktur.
Frist, responsgrense, korrelasjon og ingen automatisk retry er prøvd offline.
Produksjonsserveren gir verken aktivering eller transport til listing-ruten;
ANALYSIS_MODE=live gjelder fortsatt bare rapportanalyse.

Økonomifeltene omfatter pris/prisantydning, FINN-totalpris, omkostninger,
dokumentavgift, fellesgjeld, felleskostnader, eiendomsskatt, kommunale avgifter,
fellesgjeldsbetaling og øvrige eksplisitte pengeposter. Originalverdi, kilde,
utdrag, periode/år, hentetid, fravær og motstrid følger grunnlaget. Brukerretting
og brukt importbevis beholdes separat. Intet importert felt bekreftes automatisk.

P foreslås uten omkostninger; kontantbehov og fellesgjeld holdes atskilt.
Dokumentavgift og inkluderte poster telles én gang. Komplett D/J krever kjent
innhold, fordeling og relevante år. Egenkapital/tallfelt, rente og løpetid gir
separate eksakte Big.js-forslag med dokumentert øreavrunding. Slideren viser
bare beløp den kan representere med øresteg; mer presis egenkapital beholdes
i tallfeltet. L og Ymin registreres manuelt. Manuelle D/J/kostnadsposter og
manuelle periode-/årsendringer bevares.

Samme annonse via annen URL-form beholder objektet; faktisk ny kode tømmer
tidligere tall/rapport. Sene svar avvises. Oppfrisking bevarer rettinger og
brukt bevis, krever ny kontroll og sperrer bruk ved lasting/feil. Rapport-PDF
velges manuelt i eksisterende flyt. Finans, screening og TG-kontroll gjenbrukes.

## Tester og bevis

Alle sluttkommandoer brukte Node 24.21.0 / npm 11.19.0. Nettleserprøvene brukte
eksisterende Chromium via
`PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers`.
Lokale HTTP-/nettlesertester fikk eskalert loopback-tilgang etter sandbox-EPERM.
Ingen ekte FINN- eller betalt modelltransport ble brukt.

| Kontroll | Resultat | Faktisk utskrift |
| --- | --- | --- |
| `npm test`, endelig alene | 44 filer / 1176 bestod | [Vitest](final-vitest-guards.txt) |
| `npm run build` inkl. typekontroll | Bestod; eksisterende chunk-advarsel | [Bygg](final-build-guards.txt) |
| `npm run lint` | Bestod | [Lint](final-lint-guards.txt) |
| `npm run test:components` | 37 bestod | [Komponenter](final-components.txt) |
| `npm run test:e2e` | 200 i bygget app + 3 dev bestod | [E2E](final-e2e.txt) |
| Berørt FINN-E2E etter siste kontraktvakt | 3 bestod | [Siste FINN-prøve](final-listing-guards.txt) |

Siste kontraktvakt avviser reserverte ekstrafelt-ID-er før utkast/rendering.
Før retting kunne et gyldig formatert felt med ID `toString` utløse
`TypeError: Cannot read properties of undefined (reading 'trim')` via
Object-prototypen. Åtte testvarianter dekker dette. Full 1176-kjøring og siste
bygg/lint/FINN-E2E er kjørt etter denne endringen; de øvrige browserprøvene
bestod før denne avgrensede valideringsrettingen.

To eksisterende PDF-/HTTP-tester nådde 5000 ms da Vitest og browserregresjon
kjørte samtidig ([første utskrift](final-vitest.txt)). Uendret suite bestod
alene med 1168 tester ([kontroll](final-vitest-standalone.txt)), og den endelige
1176-kjøringen bestod også alene. Ingen tidsgrense eller forventning er økt.
Første implementerings-/reviewfeil og miljøproblemer er bevart i
[implementeringsloggen](implementering-og-verifikasjon.md) og
[retteloggen](review-fixes.md).

## AC- og matrisespor

| Krav | Kjørbar verifikasjon |
| --- | --- |
| FI-1 / deaktivert kanal | `listing-http.test.ts`: ingen transport selv med injisert adapter; `listing-import.spec.ts`: lokal reserveflyt og fire trinn |
| FI-2 / felt, kilde, mangler, konflikt | `listing.test.ts`: kilde/identitet/struktur, retting, null-konflikt og reserverte ID-er; `listing-session.test.ts`: original/brukt bevis; FINN-E2E: klikkbare kilder og retting |
| FI-3 / P og totalpris | Domenefasit 3200000, omkostninger utenfor P; ukjent gjeld og sprik blokkerer forslag |
| FI-4 / kostnader, dobbeltelling | Domenetester av inkludert dokumentavgift, D=48000, J-bidrag=12000, ugyldige tillegg/foreldre/sykluser/rentedeler og motstridende nullgjeld |
| FI-5 / finansiering og slider | Finansfasit 2000000 lån, 8333.33/mnd, 99999.96/år; null lån/rente, ugyldig løpetid; reducer bruker J=111999.96; E2E prøver komma/gruppering, mer enn to desimaler og tastatur |
| FI-6 / økt, PDF og regresjon | Økttester av sene svar, nytt objekt, manuelle felt/år/perioder og refresh; full eksisterende rapport-/screening-/komponent-/E2E-regresjon |
| URL-matrisen | Godkjent legacy/modern identitet; avvist feil vert/bane, credentials, porter, hash og tvetydige koder |
| Feil handling/kilde | Manglende/feil URL, feil annonse, ufullført handling, search/find, flere open_page og andre verktøy avvises |

## Review og bevarte grenser

[Uavhengig BMAD-review](review.md) brukte tre separate kontekstfrie reviewere.
Alle funn er individuelt triagert i specen. Ett funn ble avkreftet; alle reelle
funn er rettet, og ingen reviewfunn er utsatt. En fokusert uavhengig etterkontroll
bekreftet rettingene og utløste den siste sliderpresisjonsrettingen.

Direkte bytekontroll mot baseline
`ff3ea6e4431d5a104307487c7ec577c15980d2aa` bekreftet at finans, finansvalidering,
kostnadsvalidering, terskler, screening, FinancialBasis-kontrakt, sprintstatus,
S5-W1 og S6-overlevering er uendret (ni filer). Opprinnelig deferred-work er
bevart som uendret prefix med bare oppfølgingstillegg. Ingen S5-måling eller
ny ekstern S6-akseptanse påstås.

Første implementering og aktiv promptlogg er bevart i lokal commit
`6df0ec23481b662208e28968d736fa657b4d0849`. Reviewrettinger og sluttbevis lagres
i en egen påfølgende lokal commit. Ingen push er utført.

## Før live-aktivering

1. Dokumenter tillatt kanal og bruk som dekker den faktiske integrasjonen.
2. Autoriser kostnadsramme og koble godkjent servertransport; produksjonsruten
   kan ikke slås på med en miljøvariabel i denne leveransen.
3. Verifiser ny request/prompt/schema og feltdekning mot autoriserte originalkilder,
   med manglende data, ulike eierskaps-/kostnadsforhold og reell kildekvalitet.
   Det gamle forsøket på 476576649 er teknisk bevis for én åpning, ikke fasit for
   dette nye schemaet. De nye testenes beløp er syntetiske.
4. Lag relevant nytt leverings-/S6-grunnlag for den utvidede versjonen. Den
   frosne historiske kandidaten gjenbrukes ikke som bevis for FINN-funksjonen.

Ingen overvåking, automatisk PDF, markedsleie-/drifts-/oppussingsestimat eller
endrede finans-/screeningregler er lagt til.
