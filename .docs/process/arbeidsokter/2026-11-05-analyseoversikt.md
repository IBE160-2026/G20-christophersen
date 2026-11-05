# PAA: samlet analyseoversikt i Konsept A

Utgangspunkt: `4917264353e24e77fb121f6a66ba2c81cb8b2cc6`. Oppdraget og oppfølgingsmeldingen er lagret i [aktiv promptlogg](../prompts/session-01a1abe7-5b69-75b2-b638-c3937b649678.jsonl). [Spesifikasjon og kontrollpunkter](../../implementation-artifacts/spec-analyseoversikt-2026-11-05.md). Brukeren autoriserte implementering, to subagenter, ekte lokal PDF-prøve og lokal commit; ingen betalt AI eller push.

## Produktendringer og avgrensning

Konsept A beholder papirhvit/grønn palett, serifoverskrifter og eksisterende kontroller. Rekkefølgen er bolig, samlet økonomi, juridiske forhold, teknisk tilstand og dokumentasjon. Prisgrunnlag, kjente kostnader, fire resultatmål, leie, finansiering, dokumentbeløp og graf ligger i samme økonomiseksjon. Full netto og kontantstrøm forblir ukjent ved ufullstendig grunnlag. Viktig forutsetning om eventuell kostnadsoverlapping vises direkte ved resultatet. Metode, forbehold, kildeutdrag og dekningsstatus kan foldes ut.

FINN-feltet er fjernet både fra oversikten og manuell tallkontroll. Backend og tilgangsporter er bevart. Tidligere E2E-tester som opererte det fjernede FINN-grensesnittet er erstattet med kontroll av PDF-inngang, fravær av FINN-felt og uendret deaktivert API. Eksisterende listing-adapter-, HTTP-, state- og finansprøver beholdes i unit/integrasjon. Øvrige berørte tester navigerer nå gjennom de faktiske detaljfeltene; finansfasit, kilder og kontrollkrav er ikke endret for å tilpasse resultatene.

Hybel/Menon vises som statistisk gruppereferanse, med periode og tydelig fravær av individuell markedsleie. SSB er bevart i beregningsgrunnlaget og under «Leiekilder og metode». Leieslider, presist tekstfelt og reset oppdaterer samme eksisterende finansmotor.

## Årsak og retting av hovedbilde

Tidligere valgte `PropertyImage` rasteret med flest dekodede piksler blant de tre første sidene. Det var ingen vurdering av sidefunksjon eller motiv. Et meglerportrett kunne derfor vinne over boligfotoet.

Originalforsidene er rendret og sett visuelt med lokal PDFKit. Nøstegatens forside er en grafisk EIE-illustrasjon; Rostockgatas har adresse/boligfakta og et stort balkongfoto. Ny policy undersøker bare første side og krever et dominerende innfelt fotopanel under boligoverskriften, sammen med adresse, rom-/arealopplysninger og boligtype. Kontakt-/meglersider, eksplisitt merkede illustrasjoner, små paneler, helsideraster og ukjente/roterte oppsett avvises. Ressursgrenser, separat worker, avbrudd og opprydding bevares. Ukjent motivgrunnlag gir nøytral plassholder med originalknapp, uten nettbilder.

Dette er konservativ gjenkjenning av et forsideoppsett, ikke generell bilde-/ansiktsgjenkjenning. Nøstegaten får derfor plassholder. Rostockgata viser faktisk balkongfoto fra fysisk PDF-side 1. Ukjente andre formater kan få plassholder selv om de inneholder et godt boligfoto.

## Juridiske og tekniske funn

Et ubesvart spørsmål om brukstillatelse/ferdigattest i Nøstegatens egenerklæring ble tidligere et falskt kontrollfunn. Spørsmål gir nå ingen positiv påstand; et svar må ha eget sammenhengende kildebelegg. Dette hevder ikke at godkjenning er verifisert.

Smale eksisterende tekstregler støtter nå dokumentert døgnbegrensning, formidlingstjenesteforbud og gjenstående arbeid før ferdigattest. Eksempler fra faktiske uttrekk:

- Nøstegaten: korttidsutleie inntil 60 døgn, fysisk side 12/117; eldre servitutter med henvisning til avgivereiendommen, side 12; innebygget varmtvannstank på kjøkken ikke tilgjengelig for kontroll, side 94. Like uttrykkelige døgnbegrensninger for hele boligen samles med begge kildebelegg; ulike grenser eller deler av boligen holdes adskilt.
- Rostockgata: 60 døgn, side 26; formidlingstjenesteforbud, side 28; gjenstående arbeid før ferdigattest, side 29; adkomstrett, side 29/30. Kilden om midlertidig brukstillatelse og lovlig bruk bevares. Tittelen hevder ikke ulovlig bruk.

Titler navngir rom/bygningsdel bare fra den aktuelle påstanden. Hypotetiske vilkår beholder «mulig/uavklart». Ingen nye grader, kostnadsestimater, rom eller komplettdekning er innført. TG2/TG3, sammendrag og OCR viser sine eksisterende kilde- og dekningsmarkeringer.

## Faktisk AI-status

`src/backend/http/import-route.ts` returnerer `mode: demo`, `liveEnabled: false`, `codeFirst: true`. Dette er også målt fra den faktiske serverens `/api/document-import-config`. `src/backend/import/semantic-adapter.ts:createCodeFirstImport` sperrer semantisk transport uten den eksplisitte testtransporten `offline-stub`; uløst materiale får `live-disabled; local-tokenizer-unavailable`. Den automatiske PDF-flyten utfører dermed ingen semantisk modellanalyse.

PDF.js, lokal OCR/Vision der runtime finnes, tekstregler for økonomi/juridikk/teknikk, TG-kobling, lokale leiesnapshots og Big.js-finans er aktive. OCR er lokal og er ikke et betalt språkmodellkall. Eventuell lagret økonomianalyse av eksakt samme dokument kan gjenbrukes med egen proveniens; begge prøvene her hadde lokalt uttrekk. Den separate økonomifunksjonen har fortsatt egne prepare/run-porter, eksplisitt overførings-/kostnadssamtykke og backendkrav. Den er flyttet under dokumentdetaljer og ble ikke aktivert i de ekte prøvene. Historisk rapportanalyse bak den separate kontrollflyten er ikke automatisk salgsoppgaveanalyse.

## Ekte sluttprøve og visuell kontroll

Playwright brukte ekte server på `http://localhost:3000`, lokal Chromium, Node 24.21.0, tom `OPENAI_API_KEY`, `ANALYSIS_MODE=demo` og deaktivert FINN. Ingen rutestubbing eller mockede import-/leiesvar i akseptanseprøven. Private originaler er `private/incoming/nostegaten-65-a.pdf` (152 sider) og `private/incoming/nordvik-rostockgata-96.pdf` (170 sider).

Alle åtte grupperte akseptanseprøver bestod: opplasting/bilde/rekkefølge, uavhengig økonomifasit/slider/reset, konkrete funn/originalkilder og mobil/touch for hver original. Det omfatter alle ni kontrollpunkter i brukeroppdraget. Prisene er 4 050 000 og 8 600 000 kr; kjente årskostnader 25 197 og 43 920 kr. Urørt scenarioleie 12 000/18 900 gir brutto 3,56/2,64 % og foreløpig 2,93/2,13 %. Presis leie 15 000,5 gir 180 006 kr/år og uavhengig kontrollert yield. Reset er 13 891/20 426 kr/mnd. Full netto/kontantstrøm blir ikke null når grunnlag mangler.

Desktop 1440 × 1000 og mobil 390 × 844 er fotografert med faktiske Playwright-skjermbilder, både hele sider og hero/økonomi/juridisk/teknisk. Hovedagenten har sett bildene, inkludert forsidenes originale innhold og kilde-PDF med zoom. Ingen horisontal rulling eller avklipping i de undersøkte flatene. Visuell kontroll avdekket en gammel mobilregel som lot siste KPI spenne over begge kolonner; denne er rettet til to ganger to nøkkeltall. En repetert importforklaring er kortet ned.

Råbevis, skjermbilder og kjørbare lokale harness ligger bare i ignorert `private/analysis-ux-2026-11-05/`. Første harnessforsøk brukte en kildeknapptekst som ikke finnes; dette ble korrigert til faktisk utfolding og «Se originalkilde». Produktet ble ikke endret for å skjule testfeilen. Første brede regresjon avdekket foreldede tester for de gamle overskriftene og plasseringen; forventningene er oppdatert til bestilt navigasjon. En full unitkjøring samtidig med nettleserregresjon fikk tre tidsavbrudd; ny full kontroll kjøres uten samtidig nettleserlast og med to arbeidere.

## Prosess og faglig avgrensning

To subagenter gjennomførte frontend/layout og juridisk/teknisk analyse. Hovedagenten tok bildeutvelgelse, integrasjon, matematisk fasit, testtilpasning og visuell sluttkontroll. Agentenes siste rapporterings-/oppfølgingssteg traff tjenestens bruksgrense; hovedagenten fullførte de resterende rettingene og gjennomgangen. Det hevdes derfor ikke at en ekstra uavhengig trelagsreview er gjennomført.

Sensorveiledning Del 1 side 2–6 og faglærers brief-tilbakemelding er brukt for kjørbarhet, reell test, kildebelegg, enkel avgrenset flyt, kodeberegnet finans og sporbar prosess. Historiske åpne saker for generell TG-/juridisk-/kostnads-/markedsdekning lukkes ikke av dette arbeidet. Appen kan demonstreres ryddig med disse to dokumentene, innen de synlige begrensningene.

Full unit-/integrasjonskontroll uten samtidig nettleserlast: `npm test -- --maxWorkers=2` bestod med **2188 beståtte, 7 eksisterende skip** (108 beståtte filer, én skipfil), 133,34 sekunder. Rålogg: `private/analysis-ux-2026-11-05/vitest-verified.txt`. De tre tidligere tidsavbruddene er dermed avkreftet ved faktisk full ny kjøring, uten endrede tidsgrenser.

Den faktiske lokale tolkningen fant ingen sikkert koblede TG2/TG3-detaljer i disse to originalene; OCR-sidene ble lest, men grad-/komponentkobling er fortsatt uavklart og teknisk status er sperret. Dette er en eksisterende analysegrense, ikke bevis for god tilstand. Hovedflaten viser derfor «TG-status ikke avklart» når et ufullstendig uttrekk ikke har sikre treff, fremfor en lett misforståelig nulltelling. Ingen ny TG-modell ble utviklet for å skjule grensen.

Nettleserregresjonen kjørte alle **243** registrerte tilfeller: 234 bestod, fem valgfrie privat-/journalprøver ble hoppet over, og fire feilet. Tre av feilene var foreldede visningstekster/lokatorer; disse er rettet til de konkrete titlene og den nye plasseringen. Én originalvisning feilet mens byggeutdata ble skiftet under prøven; årsak kan ikke konkluderes fra det alene. Alle fire ble derfor kjørt på nytt mot et stabilt ferdig bygg og **4/4 bestod** (33,7 s), inklusive samme originalside og separat rapportgjenoppretting. Ingen kilde-/finansforventning eller tidsgrense ble svekket. Dermed er alle 238 ikke-hoppede tilfeller bekreftet; det hevdes ikke at den første brede kjøringen var feilfri. Loggene er `e2e-verified.txt` og `e2e-corrections.txt` i det private bevisområdet.

Bildekomponentene bestod **7/7** faktiske Chromium-prøver, med ytterligere 1/1 ny kjøring av den syntaktisk kontrollerte, tvetydige tofotoprøven. Seneste målrettede unitprøver etter de siste UI-presiseringene: 57/57; gruppering med faktisk «UTLEIE»-overskrift: 45/45. TypeScript, produksjonsbygg og lint består. Eksisterende varsel om stor Vite-chunk består; det er ingen byggefeil. De to ekte leietestene i den brede nettleserpakken bestod også og inkluderer kilde-/regnefasit og den nye analyserekkefølgen.


Siste kontroll etter alle produktendringer: `acceptance-reviewed.txt` og `acceptance-reviewed/summary.json` bekrefter igjen **8/8** grupperte prøver på localhost:3000, uten skip, sidefeil eller eksterne forespørsler. Eneste POST-er var to lokale dokumentimporter og to lokale leieoppslag. Ny visuell kontroll av de endelige bildene bekrefter 2 × 2 nøkkeltall på mobil, korrekt balkongfoto, kort importstatus og én Nøstegaten-rad med kildebelegg fra både side 12 og 117. En hopplenke som kom med i lange sammenføyde skjermbilder er også kontrollert i faktisk mobilviewport: den ligger utenfor skjermen (bottom −8 px) når den ikke har fokus; dette var et skjermbildeartefakt, ingen synlig overlapp i brukerflaten.

Siste bygg og lint er godkjent (`build-final.txt`, `lint-final.txt`); byggevarselet om stor chunk er uendret. Ingen private originaler, råresponser eller skjermbilder stages. Aktiv automatisk promptlogg med begge brukerpromptene tas med. Ingen betalte kall eller push. Demoen på localhost:3000 står igjen med siste byggeutdata.
