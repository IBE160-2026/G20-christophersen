# Faktisk PDF-sidetre — implementeringsvalg i Story 2.2

Brukerens videreføringsbestilling krever faktisk sidemengde med eksisterende
PDF-lag, uten å stole på Count og uten å velge R2-lesbarhetsmetode. Dette
dokumenterer en lokal implementeringsdetalj innen låst PDF.js 6.4.299 og
AD-3/AD-9; ingen produkt-, støtte-, UX- eller arkitekturkontrakt endres.

## Hvorfor ikke bare document.numPages/getPage?

PDF.js sin offentlige åpning og getPage bruker deklarert Count ved
traversering og områdekontroll. 31 bevarte sideobjekter kunne derfor bli
rapportert som 30. Å åpne alle deklarerte sider rettet ødelagte referanser,
men oppdaget ikke skjulte sider eller metadatafeil etter en lav Count.

Den samme låste parseren har allerede Catalog.getAllPageDicts(false), som
følger Kids/xref og registrerer hver faktisk side uten å lese Count.
Metoden oppdager også sykliske/gjentatte referanser og kan returnere Error
som en map-post. Den er ikke eksponert av det offentlige API-et.

## Avgrenset privat kobling

`count-pdf-pages.ts` starter én lokal Node-worker som kjører
`pdf-page-tree-worker.ts`. Originalbytes overføres ikke med transferList;
workerdata klones og normaliseres videre med Uint8Array.from før parserbruk.
Dette er nødvendig fordi intern Stream.makeSubStream antar offset 0 selv
om en klonet Buffer kan ha større backing buffer og ikke-null byteOffset.

Workeren leser den installerte legacy-workerbunten fra pdfjs-dist og
kontrollerer hele kildens SHA-256:

`bb422f60804477de4a0b09091d8347a916a387755ed1cbad24ccaec1d09c78bf`

Bare denne faste, betrodde avhengighetskoden lastes som en datamodul med
ekstra exports for LocalPdfManager, Page og setVerbosityLevel. Ingen kode
fra PDF-en evalueres. Installasjonen, node_modules og PDF-bytes omskrives
ikke. Egen worker isolerer PDF.js-buntens globale registrering og cacher.
Ukjent bunt/hash eller feil ved oppstart/opprydding gir trygg driftsfeil;
det finnes ingen fallback til Count-basert godkjenning.

LocalPdfManager følger samme initDocument- og XRefParseException-recovery
som normal loader. getAllPageDicts(false) gir faktisk sidemengde; Error-poster
avvises. For hver faktisk sidedictionary konstrueres PDF.js Page og dens
rotate/userUnit/view leses akkurat som ved normalt GetPage. Dermed bevares
tidligere reviewretting for skadede sider også etter deklarert siste side.
Ingen rendering, content-stream-/tekstlesing eller lesbarhetsstatus brukes.

Managerens terminate/cleanup kjøres i workerens finally. Hovedsiden venter
på svaret og terminerer den faktiske tråden i finally, også ved error,
messageerror, tidlig exit eller unavailable. Driftsfeil blir ikke tolket
som ødelagt rapport. Eksisterende PDF.js-loadingtask/worker-opprydding og
SHA-/originalbytes-snapshot er beholdt. Ingen timeout, vilkårlig bytegrense,
HTTP-ressursbeslutning eller R2-beslutning er innført.

## Verifikasjon og vedlikehold

Regresjoner dekker 31 faktiske sider med Count 30/1/0, nestede root-/gren-
underrapporteringer, 30 faktiske sider med Count 29/31, skjult skadet
referanse/metadata, gjentatte/sykliske referanser og eksplisitt Buffer-slice.
Ekte threadId=-1 kontrolleres etter opprydding; kontrollerte native
workerfeil og siste destroy-/terminate-feil gir faste trygge meldinger.

Alternative gyldige fixtures kontrollerer objekt-/xref-strømmer og
linearisering, i tillegg til de opprinnelige klassiske PDF-fixturene.
F1–F4 og uavhengig fasit er uendret. Disse kontrollene er ikke en påstand
om alle tenkelige PDF-varianter eller generell lesbarhet.

En fremtidig PDF.js-pinendring må bevisst kontrollere de tre private
eksportene, parserens constructor/getter-/cleanup-forutsetninger, ny
kildefilhash og alle regresjoner. Hashen skal ikke bare oppdateres for å
få en installasjon grønn. Pinendring er ikke del av dette reviewet.

R2 er fortsatt åpen før Story 2.3. Dette arbeidet bestemmer ingen
tekst-/layoutmetode og lager ingen pages-/tekst-/analysekontrakt.
