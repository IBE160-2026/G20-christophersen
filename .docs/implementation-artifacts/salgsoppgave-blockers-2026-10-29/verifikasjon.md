# Count-støtte og privat representativt prøvegrunnlag

Bestilling: [spec/AC](../spec-salgsoppgave-blocker-resolution.md).
Baseline `2b1afd2f875373fcff933a021684a0793c83ceb4`.
Ingen faktisk PDF fra bruker er mottatt. Ingen faktisk menneskelig kontroll,
API-count eller generering er gjennomført; intet er pushet.

## Hva som er implementert

To parallelle agenter hadde adskilte kilde-/testfiler. Tokenagenten kontrollerte
offisiell count-kontrakt og installert SDK 6.9.1; dokumentagenten laget privat
intake/freeze/check med tom menneskelig fasit. Root integrerte kommandoer,
privat preflight og tydelig tellertekst. [Prosess/prompt](../../process/arbeidsokter/2026-10-29-salgsoppgave-blockers.md).

`responses.inputTokens.count` støttes av den låste SDK-en og bruker
`POST /responses/input_tokens`. Inputprojeksjonen inneholder modell, hele
inputen, instruksjoner, reasoning, strict schema og truncation. Resten av
genereringskontrollene er bundet gjennom hele genereringsdigesten. Metode,
URL, SDK-versjon og serialiserte bytes kontrolleres. Kvitteringen er frosset
og registrert i prosessen; importert JSON, kloner og endret request kan ikke
brukes som verifisert servertelling. SDK-stub forblir `offline-sdk-stub`.
[Åpnet offisiell dokumentasjon, prisgrunnlag og implementeringsgrense](token-count-research.md).

Inputtelling beregner ikke fremtidig output. Maksimalt 8 000 outputtokens
inkluderer reasoning; reasoning legges ikke til en gang til. Inputmaks 40 000,
Sol/low/Standard, globalt endepunkt og standard cache beholdes. Alle inputtokens
reserveres med USD 2,50/M og output med USD 10/M; maksimum **USD 0,18** gjelder
generering under denne profilen, ikke eventuell uavklart count-kostnad.
Verktøy er deaktivert og har derfor null godkjent verktøygebyr; både aktiverte
verktøy og uventet tool-usage gir stopp. Ukjent gebyr anslås aldri til null.

Salgsoppgave og separat rapport deler varig USD 0,20-journal. Reservasjoner
bevares over omstart, timeout og feil. Oppgitt usage avregnes med makssatser
og merkes `provider-usage-upper-bound`, slik at ukjent cache-write-fordeling
ikke feilaktig blir en nøyaktig fakturapåstand. Ingen finans-/screeningregel
eller modellvalg er endret.

## Faktisk gjenværende port

Serverbasert telling er en implementert vei rundt manglende lokal encoder,
men count-endepunktets pris er **ikke verifisert** i kontrollerte offisielle
kilder. Serverfabrikken stopper før fetch med `token-count-price-unverified`.
Før den kan åpnes må prisgrunnlag og eventuell reservasjon under samme
USD 0,20-tak være dokumentert. Fravær av offentlig pris er ingen gratisgaranti.
Kontotilgang og tjenestens faktiske Sol-respons er heller ikke prøvd.
Ingen genereringsrute er åpnet.

Neste brukeravhengige steg er den faktiske komplette salgsoppgaven, helst med
integrert rapport for denne ene dokumentprøven. Legg PDF-en i ignorert
`private/incoming/salgsoppgave.pdf` eller oppgi en lokal sti utenfor repoet.
Deretter kjøres lokalt inntak; et menneske må lage selvstendig fasit før
modelloutput. [Detaljert prosedyre og kommandoer](representative-document-procedure.md).
Ett valgt dokument blir ingen universell produksjonsbenchmark.

## Privat håndtering og menneskelig kontroll

Inntak bevarer originalbytes/hash, samtlige fysiske sider, blokker, TG-kandidater,
restoversikt og vedlegg i fast ignorert privat mappe. Forventede beløp/funn og
menneskelige felt er tomme. Kjente og ukjente økonomifelt, alle sider/blokker,
hver TG-kandidat og rapportgrenser må kontrolleres og kildebindes før frysing.

Frysing er en selvrapportert menneskelig før-output-attestasjon med lokale
hashbindinger, ikke autentisert bevis for at en person har lest originalen.
Syntetiske tester simulerer påstandene uttrykkelig; ingen av dem er brukt som
faktisk menneskelig verifikasjon. Fremtidig original/tekst/fasit/output blir
aldri skrevet i offentlige bevis. Vanlig staging beskyttes av ignore-/tracked-
kontroll, men operatøren må fortsatt unngå force-add og offentlig kopiering.

## Offline-verifikasjon

Pinned Node 24.21.0/npm 11.19.0, tom nøkkel/demomodus og obligatorisk SDK-stub.
[Første fullsuite](full-tests.txt): 1445/1445 i 59 filer; [build/typecheck](build.txt)
og [lint](lint.txt) består. Vite viser eksisterende varsel om chunkstørrelse.
[Bytekontrollen](packet-validation.json) bekrefter begge requestfiler i den
nye [syntetiske pakken](synthetic-packet/packet.json), null kall/reservasjoner
og uendret USD 0,20. `ready:false` med krav om faktisk servertelling og pris.

[Bevaring](preservation.json): 159 filer med finans-/screeningregler,
tidligere frosne bevis og syntetiske originaler er byteidentiske med baseline;
tidligere prompt-/deferred-prefiks er bevart og ingen private filer er sporet.

Uavhengig BMAD-review ga 13 første funn og ett nytt funn i nykontroll.
Alle 14 er individuelt triagert: ett allerede oppfylt dokumentfunn ble
avkreftet, og alle 13 reelle forhold er rettet. [Review/triage](review.md)
og [nykontroller uten restfunn](review-recheck.json). Ingen reviewfunn er utsatt.

Rettingene sperrer rapport-raster og ulikt maskinelt/menneskelig rapportområde
før requestbygging. Fasitens tekstgrenser samsvarer med returkontrakten,
like beskrivelser matches ved fysiske kilder og økonomitranskripsjon sjekkes
leksikalsk. Entydige punktumgrupper/desimaler støttes med uendrede sitater;
tvetydige 3.000/3,000 krever avklaring. Feil i sjekklister gir begrensede
feltstier/koder uten private verdier. Delvis intake bevares for avstemming
og nytt case-ID, uten automatisk sletting eller falsk frysing.

| AC / matrise | Verifisert bane |
| --- | --- |
| AC1: komplett presis tellervei | Ekte SDK-stub count-route/projeksjon/schema/reasoning og begge wire-hasher; receipt/klone/JSON-/requestendringer avvises. Faktisk serverpris/konto er eksplisitt utestet og sperret. |
| AC2: USD 0,20 og trygt stopp | 40k/8k inkl reasoning reserverer USD 0,18 under fast genereringsprofil; restart/rapport kan ikke gi ny kvote. Count-pris ukjent stopper før fetch. Verktøy avvises, timeout/ukjent usage beholder reserve, kostnadsgrunnlag består restart. |
| AC3: ekte inntak er privat og pending | Bytes/hash/alle sider bevares; tom forventningsmal, null attestasjon og alle reviewrader uavklarte. Path-escape, symlink/hardlink, tracked private og manglende ignore sperres. Ingen menneskelig handling utledes. |
| AC4: fasit-/kildekontroll | Full fysisk side/blokk/TG-/økonomiledger og før-output-selvrapportering kreves; endrede frosne bytes, raster, manglende kilder og feil transkripsjon avvises. Faktisk simulert freeze/load-oracle sammenlignes med kontrollert SDK-output før rettinger; verdi/grad/kilde og like funn i omvendt rekkefølge prøves. |
| AC5: stopp ved faktisk brukeroriginal | Prosedyre og CLI finnes, men bare tidligere syntetiske fixturer/simulerte mennesker er brukt. Ingen ekte original eller live-/kvalitetsprøve er erklært utført. |

En typesjekk under reviewretting fanget en ufullstendig annotasjon av en
bevisst simulert loader-mock. Annotasjonen ble gjort eksplisitt;
[rått avvik](build-final.txt) og [korrigert bygg](build-verified.txt) er bevart.
UI-endringen gjelder bare tekst om tellerproveniens og pris, uten ny flyt.

**Endelig resultat:** [1455/1455 tester i 59 filer](full-tests-verified.txt),
[bygg/typecheck](build-head.txt) og [lint](lint-head.txt) består etter siste
tallformatretting. [Forrige fullkjøring](full-tests-final.txt) besto 1453 før
de to siste formatregresjonene. Alle matriserader er kjørt uten skip i
fullsuiten. Ingen betalt generering, ekstern count eller push. Lokal commit
inkluderer aktiv promptlogg; sentral PAA-SO2 forblir åpen ved de nevnte portene.
