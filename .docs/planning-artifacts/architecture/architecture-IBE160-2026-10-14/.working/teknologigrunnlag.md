# Teknologigrunnlag

Kontrollert 2026-10-14. Dette er dokumentert versjons- og fit-vurdering for arkitekturens startstakk, ikke bevis for en installert eller testet applikasjon.

| Valg | Versjon | Primærkilde og kontroll |
| --- | --- | --- |
| Node.js | 24.21.0 LTS | [Utgivelse](https://nodejs.org/en/blog/release/v24.21.0), [LTS-status](https://nodejs.org/en/about/previous-releases). npm fra denne Node-installasjonen er eneste pakkebehandler. |
| React / react-dom | 19.3.0 | [Stabil utgivelse](https://github.com/react/react/releases/tag/v19.3.0), [offisiell react-ts-starter](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-react-ts/package.json). |
| Vite | 8.3.4 | [Stabil utgivelse](https://github.com/vitejs/vite/releases/tag/v8.3.4), [Node-forutsetninger](https://vite.dev/guide/), [bygg](https://vite.dev/guide/build). Node 24 oppfyller dokumenterte forutsetninger. |
| TypeScript | 6.0.2 | [Gjeldende starterdefault](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-react-ts/package.json). [7.0.2 er nyere stabil utgivelse](https://github.com/microsoft/TypeScript/releases/tag/v7.0.2); 6.0.2 velges for å beholde starterens utgangspunkt. Den kalles ikke latest. |
| @vitejs/plugin-react | 6.1.2 | [Gjeldende starterdefault](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-react-ts/package.json). |
| Oxlint | 1.87.0 | [Gjeldende starterdefault](https://raw.githubusercontent.com/vitejs/vite/main/packages/create-vite/template-react-ts/package.json). Behold starterens enkle lintsteg. |
| Express | 5.3.0 | [Stabil utgivelse](https://github.com/expressjs/express/releases/tag/v5.3.0), [installasjonsforutsetninger](https://expressjs.com/en/starter/installing/), [statisk filservering](https://expressjs.com/en/starter/static-files/), [asynkrone feil](https://expressjs.com/en/guide/error-handling/). |
| PDF.js / pdfjs-dist | 6.4.299 | [Stabil distribusjon](https://mozilla.github.io/pdf.js/getting_started/), [utgivelse](https://github.com/mozilla/pdf.js/releases/tag/v6.4.299), [Node-eksempel med sidetall og tekst](https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.mjs), [miljøstøtte](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions). Node 22+ støttes i hovedsak; Node 24 er innenfor. Node-uttrekk bruker den dokumenterte legacy-builden; browser-visning bruker browser-build og lokalt bundlet, matchende worker. Samme distribusjonsversjon betyr ikke samme build eller initialisering. |
| big.js | 7.0.1 | [Vedlikeholderens pakkedefinisjon](https://raw.githubusercontent.com/MikeMcl/big.js/main/package.json), [API](https://mikemcl.github.io/big.js/). Eksakt desimalaritmetikk for beløp/terskler; divisjon og visningsavrunding holdes i presentasjon. Strenginput hindrer tap av presisjon før biblioteket mottar verdien. |
| Zod | 4.6.7 | [Stabil utgivelse](https://github.com/colinhacks/zod/releases/tag/v4.6.7), [Node/browser og TypeScript-forutsetninger](https://zod.dev/). TypeScript 5.5+ med strict støttes; én skjemakilde gir runtime-validering og delte typer. |
| Vitest | 5.0.4 | [Stabil utgivelse](https://github.com/vitest-dev/vitest/releases/tag/v5.0.4), [forutsetninger](https://vitest.dev/guide/). Vite >=6.4 og Node >=22.12 passer startstakken; brukes for rene moduler og backend/adapter-integrasjon. |
| Playwright | 1.64.0 | [Stabil utgivelse](https://github.com/microsoft/playwright/releases/tag/v1.64.0), [installasjon og støttede miljøer](https://playwright.dev/docs/intro). Node 24 støttes. Browserbinær og eventuelle systemavhengigheter installeres før offline E2E-kjøring. |

## Avgrenset vurdering

PDF.js velges for sidemerket tekstuttrekk og styrt originalvisning i den allerede valgte Node/React-stakken. PDF-funksjonene skjermes bak dokument- og visningskomponenter. Tekstuttrekkets faktiske kvalitet, tabellkoblinger og Node/browser-funksjoner må verifiseres på rapportfixtures ved implementering. Bibliotekstøtte betyr ikke bestått S2 eller S6.

big.js velges innen brukerens godkjente strategi. Beløpsoperasjoner og sammenligning trenger ikke yielddivisjon; presentasjon bruker biblioteket til visningsverdier. Det bygges ingen egen heltalls-/brøkaritmetikk. Typer/deklarasjoner for biblioteker som ikke leverer dem selv må følge den senere låsfilen og typekontrollen.

Zod velges for én felles kontrakt som kan kontrolleres ved runtime på begge sider av API-et. Vitest og Playwright dekker ulike nødvendige testgrenser; ingen separat frontend-testplattform eller komponentbibliotek legges til nå. Reacts [reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) og vanlig CSS etter UX-tokens dekker v1-tilstanden og uttrykket.

Ingen starter, pakker eller browserbinærer er installert i arkitekturarbeidet. Offentlig npm-metadata var utilgjengelig fra sandbox; offisielle utgivelsessider og starterkoden er derfor brukt. Ingen eskalering eller API-nøkkel ble brukt. Ved første implementering må tilgjengelighet, avhengighetsoppløsning, typekontroll og ren installasjon kontrolleres igjen før pins materialiseres i package.json og package-lock.json.
