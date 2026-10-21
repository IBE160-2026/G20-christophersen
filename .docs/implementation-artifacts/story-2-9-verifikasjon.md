# Story 2.9 — implementeringscheckpoint og egenverifikasjon

Dato: 2026-10-21. Baseline: `63627cee85b771f6207c431338eca7a734a9ee24`.
Historisk implementeringscheckpoint: spec in-review og sprint 2.9 review.
Dette var implementeringens egenkontroll før uavhengig review. Gjeldende status
er done etter [full uavhengig review](story-2-9-review.md).

| AC / matrise | Faktisk implementering og bevis |
|---|---|
| AC1, aktivt funn / Avvis | Separat brukeravvisningsmarkør i FindingControl. Ren overgang fjerner bare funnet fra currentFinding; originalt analyseutfall og originalbytes har identisk referanse/innhold. Avvist original forblir valgbart med opprinnelig grad, tekst, fysisk kilde og rapportidentitet. Unit og RT-12 gjennom faktisk HTTP/adapter/PDF består. |
| AC2, liste og andre kontroller | Avvis øker funn-/listerevisjon én gang og nullstiller berørt enkeltfunnsbekreftelse/listebekreftelse. Andre originaler, brukte rettinger, utkast og bekreftelser bevares. Unit bruker en konstruert tidligere listebekreftelse; ingen ny listebekreftelseshandling innføres. RT-12 beholder et kontrollert gulvfunn. |
| AC1/4, brukt retting / ubrukt utkast | Begge bevares ved siden av originalen. Brukt retting merkes historisk, ikke aktiv; ubrukt utkast vises deaktivert. Avvis og alle etterfølgende kontrollhandlinger er idempotente uten reaktivering. Unit dekker også eksisterende ugyldig utkast/feltfeil. Smal browserprøve beviser representasjonene og retur. |
| AC3, påstått TG3 / usikker kandidat / analysefeil | UI sier eksplisitt brukeravvist uttrekk og ingen TG3-avklaring, utbedring eller teknisk godkjenning. Avvist usikker kandidat gir ingen aktiv kandidatmangel; opprinnelig usikkerhet/kildeproblem og rapportbegrensninger bevares. Dokument- og analysefeil med delresultat forblir identiske failed-tilstander. Readiness og øvrige rapportmangler består. |
| AC4, gjentatt handling / gammel eller ukjent kontekst / retur | Rene negative prøver for duplikat, andre kontrollhandlinger, gammel generasjon, ukjent funn, feil hash/dokument og rapportbytte. RT-12 beviser tastatur-Avvis, kort status, synlig fokus til fortsatt valgbart avvist funn, originalkilde på fysisk side 3, funn-/trinnretur og ett analyse-POST. Ingen fokusstjeling ved remount eller PDF-panel-Esc. |

## RT-12 og tilgjengelighet

`tests/fixtures/finding-control/rt12-expected.json` er håndskrevet fasit
uavhengig av generator og kontrolladapter. Den virkelige tresiders PDF-en har
bare TG2 «Slitt gulv» på side 2. Side 3 sier at ingen lekkasje/grad er registrert;
adapteren påstår TG3 «Oppdiktet lekkasje» på den siden. Browseren kontrollerer
faktisk tekstlag og fysisk side før Avvis. Originalens SHA-256 og opphav bevares
etter avvisning og retur, også når en tidligere brukt retting peker på side 2.

Fokus etter Avvis går til funnets fortsatt tilgjengelige valgknapp. Korriger,
Bekreft og gjentatt Avvis er deaktivert; ingen reverseringshandling er lagt til.
Kildepanelet fungerer med Enter/Esc og bevarer fokus. 1440 px og 320 px er
visuelt inspisert: [avvist original og PDF](story-2-9-rejected-wide.png),
[smal visning](story-2-9-rejected-320.png). 850×480 prøves med brukt retting og
ubrukt utkast; 320 px har ingen vannrett arbeidsflateoverflow.

## Kjørte kontroller

Se [faktisk kontrollogg](story-2-9-kontroller.txt).

| Kontroll | Resultat |
|---|---|
| Full Vitest, 20 filer | 534/534 |
| Finding-control unit | 29/29, hvorav 7 nye 2.9-prøver |
| Full bygget-app-E2E | 79/79, hvorav 3 nye 2.9-prøver |
| Full dev-E2E | 3/3 |
| Typecheck / lint / build / diff whitespace | Bestått |

Første kjøring uten lokal servertilgang traff sandboxens EPERM. Samme tester
bestod med tillatt loopback og eksisterende Chromium under
`/private/tmp/ibe160-story-1-2-browsers`. Første målrettede browserkjøring fant
en feil i testens sammenligning av innerText med textContent; testen ble rettet
og hele bygget-app-suiten bestod. Vite viser eksisterende størrelsesmelding for
PDF.js-bundlen. Ingen ny avhengighet, betalt API eller produkt-/arkitekturvalg.

Scope er bare 2.9. TG3-avklaring (2.10), listebekreftelse (2.11) og Epic 3 er
ikke implementert. Dette beviser kontrollert uttrekksavvisning, ikke live-KI-kvalitet
eller ekstern brukertest. [Arbeidsøkt](../process/arbeidsokter/2026-10-21-story-2-9.md).

## Uavhengig review og gjeldende status

2.9 er done etter fire sekvensielle reviewlag. Avvist ubrukt utkast vises nå
som lesbar historisk tekst, med historisk merkede valideringsfeil og uten
aktive redigeringsfelt. Verdiene/feilmetadataene bevares uendret.
Fire nye negative unit-prøver, én ny E2E og utvidet RT-12 kontrollerer andre
usikre kandidater, feil originalkilde etter retting/avvisning, faktisk Tab,
én statuskunngjøring, historiske korrigeringsverdier og synlig kortskjermfokus.
Full sluttregresjon: 538/538 Vitest, 80/80 bygget-app og 3/3 dev-E2E,
typecheck/lint/build bestått. [Funn og bevis](story-2-9-review.md).
