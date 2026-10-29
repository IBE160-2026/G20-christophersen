# Første code-first live-test: offline klargjøring

Bestilling og baseline: [arbeidsplan/AC](../spec-salgsoppgave-live-preflight.md),
`27b5ac2635300881832ec93ab8f22955e9c4b9e8`. Ingen betalt API-kjøring eller
push. Finans- og screeningreglene er bevart.

## Faktisk klar-status

[Kontrollpakken](packet/packet.json) returnerer **`ready: false`** med
`local-tokenizer-unavailable`. Undersøkelsen av tiktoken 0.14.0 gir ingen
Sol-mapping; heller ikke full lokal Responses-framing er verifisert.
[Råbevis og offisielt kildegrunnlag](token-verification.md).
SDK-wire beviser payloadbinding, ikke korrekt tokenantall. Serverens
token-count-endepunkt er ikke kalt eller antatt gratis.

SDK-bodyen bevares byteidentisk i [requestfilen](packet/request.json).
Kontrollpakken angir faktisk SDK-versjon, metode, global URL, hele strict-
schemaet, body-SHA256 og semantisk requestdigest. Serialiseringen fanges med
obligatorisk lokal fetch-stub. Ingen headers eller nøkler bevares.

## Kostnadsgrense og stopp

Prisen er kontrollert 2026-10-29 for Sol, global Responses, Standard/default,
standard 30m cache, tekst uten verktøy/filer/bilder/historikk/overstyringer.
[Modellpriser](https://developers.openai.com/api/docs/models/gpt-6.1-sol),
[cache-skriving](https://developers.openai.com/api/docs/guides/prompt-caching)
og [reasoning/outputgrense](https://developers.openai.com/api/docs/guides/reasoning)
underbygger inputmaks USD 2,50/M og output USD 10/M. Cache-skriving erstatter
vanlig inputprising; ingen rabatt eller vilkårlig sikkerhetsmargin antas.

40k input og 8k output inklusive reasoning reserverer maksimalt **USD 0,18**
under denne faste profilen. Dette er et grenseeksempel, ikke målt kostnad for
testdokumentet. Dokumentets estimat er fortsatt ukjent uten verifisert teller.
USD 0,20 gjelder summen av salgsoppgave og eventuell separat rapport.
Reservasjonen trekkes fra før transport og frigis ikke automatisk etter svar.
Hvis neste komplette request overstiger restbudsjettet, stopper analysen;
den avkortes ikke og forsøkes ikke automatisk igjen.

Den lokale budsjettjournalen bruker eksklusiv lås, privat fil, fsync og
atomisk erstatning. Manglende/korrupt historikk, pågående lås eller mislykket
skriving gir stopp. Krasjlåser blir stående for manuell avstemming.
[Eksplisitt engangsinitialisering](history-initialization.json) av den nye
syntetiske analysen har null historikk og USD 0,20 igjen. `prepare:live-test`
initialiserer aldri historikk og oppretter null reservasjoner uten teller.

## Manuell avstemming etter krasj

Det finnes ingen automatisk opplåsing. En operatør må først stoppe og
identifisere alle prosesser som kan eie journalen; ikke fjern låsen mens
eiendom til prosessen eller eventuell ekstern forespørsel er ukjent.
Ta en uendret privat kopi av journal, lås og eventuell `.pending` med hash
og tidspunkt før videre undersøkelser. Bevar samme rotanalyse-ID.

Avstem alle requestdigester mot transport-/forbrukskvitteringer dersom et
kall kan ha skjedd. Ukjent forbruk beholder hele reservasjonen som
reservert/usikkert. Lavere faktisk kostnad gir ingen ny automatisk kvote.
En pending-fil kan være en nyere, fullt reservert journal; den må vurderes
sammen med eksisterende journal, aldri slettes for å få tom historikk.

Bare når eierprosessen sikkert er avsluttet og full reservasjonshistorikk
er bevart, kan operatøren reparere en korrupt journal fra dokumentert
fullstendig kopi og fjerne krasjlåsen. Bevar originalene og en separat
avstemmingskvittering. Kan historikken ikke etableres, forblir analysen
sperret. `initialize`, ny analyse-ID eller tom journal er ingen
gjenopprettingsprosedyre.

## Original, fasit og sammenligning

[Frosset original](../../../tests/fixtures/sales-prospectus/code-first-live-original.pdf)
har fem fysiske sider og SHA-256
`7c250de09eed71cefe4a6e4418ead8080b2f5b34b4371af2bed822699c1dae53`.
[PDF.js-snapshot](../../../tests/fixtures/sales-prospectus/code-first-live-pages.json)
og [separat håndskrevet fasit](../../../tests/fixtures/sales-prospectus/code-first-live-oracle.json)
ble avstemt uten modellretur. Hovedagenten leste alle fem originalsidene
uavhengig med pypdf; [kontrollen](independent-original-check.json) bekrefter
hash, sider og alle økonomi-/TG-kildeutdrag. Den eldre fasiten er uendret.
Kildekrav supplert under review kontrolleres mot originalen, uten å endre
forventede beløp, grader eller forhold etter modelloutput.

To TG2-forhold i ulike bad og ett TG3-forhold i tak har linjedelt grad,
tabell og sidefortsettelser. Økonomifasiten omfatter pris, fellesgjeld,
omkostninger, felleskostnader, renter/avdrag, periode/år og ukjente felt.
Sammenligning krever schema-/kildegyldig originalretur før menneskelig retting,
og rapporterer manglende/ekstra funn, grad, fysisk kilde og økonomirelasjoner.
Modellgenererte ID-er og rekkefølge bestemmer ikke fasiten. Ulik ordlyd som
ikke normaliseres, gir konservativt avvik som må kontrolleres manuelt.

Dette er en **syntetisk teknisk prøve**. Representativitet for vanlige reelle
salgsoppgaver er ikke etablert. Repoets øvrige frosne rapport-/salgsoppgaver
er også syntetiske; historisk S5-fasit dekker rapport, ikke komplett ny
salgsoppgaveøkonomi. En representativ original med separat menneskelig
fasit må velges og fryses før en kvalitetsprøve kan kalles representativ.

## Verifikasjon og review

Pinned Node 24.21.0/npm 11.19.0, tom API-nøkkel, demomodus og lokal
transport. [Endelig full suite](full-tests-final.txt): **1418/1418**, 55 filer;
[build/typecheck](build-final.txt) og [lint](lint-final.txt) består. Den første
[fullkjøringen](full-tests.txt) besto 1409 tester før reviewrettingene.
Vite viser eksisterende chunkstørrelsesvarsel. Ingen UI-/finansendring krever
ny full nettleserakseptanse i dette oppdraget; tidligere bevis beholdes.
[Bevaringskontrollen](preservation.json) sammenligner 80 låste filer med
baseline og bekrefter uendrede finans-/screeningregler, historiske bevis,
eldre fasit og låsfil; tidligere prompt- og deferred-historikk er bevart.

Tre uavhengige BMAD-reviewlag fant 14 forhold, individuelt klassifisert før
gruppering. Alle er rettet med fokuserte regresjoner. Samme tre reviewere
kontrollerte rettingene på nytt; [alle tre returnerte tom funnliste](review-recheck.json).
[Funn og oppløsning](review.md). Ingen reviewfunn er utsatt.

| AC / kant | Faktisk bevis |
| --- | --- |
| 1: hel SDK-payload og endring/tellermangel | Unit-tester kontrollerer wire, faktisk installert SDK-versjon, body/digest, eksakt prompt/schema og mutasjoner; [sluttpakken](packet/packet.json) og [bytekontroll](wire-validation.json) er konsistente og fortsatt sperret. |
| 2: samme kvote etter restart/rapport | Varig post før transport, eksklusiv åpning, reservert/usikkert/fullført etter restart, samme foreldrerot og ingen ny kvote; feil rot og foreldreløs rapport sperres. |
| 3: grense og trygt stopp | Eksakt restgrense, overgrense, duplikat, ukjent/korrupt historikk, krasj, pending og skrivefeil før/etter transport testes. Ett kall, ingen retry, usikkert strukturert svar og lås/reservasjon bevares ved oppgjørsfeil. |
| 4: uavhengig fasit og kilder | Schema-gyldige negative mutasjoner for manglende/ekstra/grad/kilde/eierform/relasjon/økonomiverdi/ukjent null, isolert inkomplett status, limitations og ukjent kostnad. ID/rekkefølge og ubetydelig slutt-tegnsetting tolereres. |
| Ingen nøkkel/nett/betalt test | Integrasjon blokkerer global fetch og API-nøkkellesing; forberedt pakke har null kall/reservasjoner, USD 0,20 igjen og ready:false. |

[Regenerert klargjøring](preparation-final.txt) bruker siste foreldrebinding.
Requestfilen er nå **13 274 bytes**, SDK 6.9.1, SHA-256
`9f1777da3d0af5db6ccd58044ff4fc2efe10f92a8121ffb2158982dba98ff369`.
Semantisk digest:
`cacb1b039e863a07fd39928832eaddf5f5b633bd5e7bf0432166ed060277f200`.
Den tidligere pakken ble erstattet før commit, fordi metadata og kildekrav
ble styrket under review; ingen request ble sendt eksternt.

## Gjenstående port

Verifiser lokal Sol-tokenizer og hele request-formatet, eller avklar pris og
få særskilt autorisasjon for serverbasert kalibrering. Frys representativt
dokument/fasit for den påståtte prøvens scope. Kontroller deretter eksakt
request og samlet budsjett igjen. Ny import og klargjøringskommandoen har
fortsatt ingen aktiv betalt transport. Ingen første live-test er gjennomført;
brukeren skal godkjenne konkret live-opplegg før første kall.
