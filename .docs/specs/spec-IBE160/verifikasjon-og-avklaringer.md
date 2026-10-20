# Verifikasjon, leveranseføringer og videreførte avklaringer

Avledet fra spec-beslutningsloggen, adoptert PRD/addendum og final arkitektur. Dette er kontrakt for senere verifikasjon; ingen produktkode, fixtures, produkttester, installasjon eller live-evaluering er levert av spec-arbeidet.

## Uendrede akseptansemål

| ID | Bestått når | Bevis ved senere gjennomføring |
|---|---|---|
| S1 | Alle beregnbare nøkkeltall i de kontrollerte casene avviker høyst 1 kr og 0,01 prosentpoeng fra uavhengig fasit. | F1–F4 og BT-1–BT-18; manglende beregning kontrolleres som mangel. Terskellikhet/én krone under testes eksakt uten S1-margin. |
| S2 | Alle fasitmerkede TG3 og minst 90 % av TG2 finnes med riktig PDF-side, uten oppdiktede TG2/TG3 i utvalget. | Fasit for alle eksplisitte TG2/TG3 lages før kjøring. Dokumenter fasitfunn, riktige, oversette, feil side og oppdiktede per rapport; kontroller hvert TG3 enkeltvis. Mål opprinnelig live-uttrekk før brukerretting, separat fra lagret demo. |
| S3 | Alle låste regelvarianter gir riktig utfall, også mangler, konflikter, feil, ubekreftelse, uavklart TG3 og likhet. | Brief-addendum, FR-5s sju eksempler, RT-1–RT-19, BT-1–BT-18 og AT-1–AT-20. Alle utløsere på avgjørende nivå og identisk kodebegrunnelse/neste handling inngår. |
| S4 | Alle viste rapportfunn har korrekt, kontrollerbar dokument-/PDF-sidekilde, og alle beregningsverdier har synlig kilde/forutsetning uten dobbelttelling. | Kontroll mot original/fasit av input, kostnadsinnhold, opprinnelig KI, usikkert uttrekk, brukerretting/avvisning og separat TG3-avklaring. Usikkert/avvist er ikke dokumentert rapportfaktum. |
| S5 | Median hovedanalyse ≤300 s og median menneskelig kontroll ≤600 s, målt separat og sammenlignet med manuell førstevurdering av samme caser. | Hele protokollen og TT-1–TT-9 i PRD-addendum gjelder; se presiseringene nedenfor. |
| S6 | En annen person gjennomfører hele demoen og de dokumenterte lokale testene kun fra README i rent dokumentert lokalt miljø uten gruppens nøkkel, betalt konto eller egen infrastruktur. | Miljø, kommandoer, resultater og feil/retting. Installasjonsnett kan være nødvendig; selve demoen kjører med eksternt nett sperret og alle nødvendige ressurser lokalt. |

F1 har P 16 000 000, L 1 900 000, D 400 000, J 800 000, Ymin 7 % og tilstrekkelig rapportgrunnlag: bruttoyield 11,875 %, NOI 1 500 000, nettoyield 9,375 %, kontantstrøm 700 000 og Gå videre. F2 endrer L til 1 400 000 og gir 8,75 %, 1 000 000, 6,25 %, 200 000 og Forkast. F3 mangler L, gir ingen av de fire beregningene og Innhent mer informasjon. F4 har F1-økonomi og uavklart TG3 «Alvorlig lekkasje i tak» på PDF-side 4, og gir Innhent mer informasjon. Full fasit og regelvarianter står i adoptert Brief-/PRD-addendum; disse erstattes ikke av sammendraget.

S2s 90 % er et evalueringsminimum, ikke tillatelse til å filtrere TG2. Utvalget dokumenterer ingen generell treffsikkerhet. PRDs K1–K3 gjelder: tidsgevinst oppnås ikke ved å hoppe over kontroll/TG3, antall uttrekk er ikke kvalitet i seg selv, og andel Gå videre er ikke suksessmål.

### S5-måling

Registrer t_start ved Start analyse etter bekreftede gyldige tall og ferdig opplastet støttet rapport; t_liste når den ferdige validerte listen med funn, sider og usikkerhet er synlig; t_bekreftet etter kontroll, eventuelle rettinger/avvisninger, håndtert TG3-status og bekreftet gjeldende liste. Hovedanalyse = t_liste − t_start, kontroll = t_bekreftet − t_liste. Håndtert TG3 kan være Uavklart og fortsatt gi Innhent mer informasjon.

Bruk samme tidsgrunnlag med tilstrekkelig presisjon. Dokumenter case, rapport/uttrekk, modus, målepunkter, utfall, planlagte/målte forsøk, vellykkede/feilede analyser og fullførte/ufullførte kontroller. Feiltid er ikke vellykket analysetid; ufullført kontroll eller manglende målepunkter er ikke null sekunder. Median beregnes separat; ved partall brukes gjennomsnittet av de to midterste sorterte tidene. Uten gyldige observasjoner er målet ikke verifisert.

Registrering/opplasting før start, maskinelle beregninger etter kontroll og videre investeringsarbeid inngår ikke. Live og demo rapporteres separat. F3 har ikke gyldig S5-start før tallmangelen er rettet. Manuell referansemåling av samme caser dokumenterer sin aktivitetsavgrensning; brukerens gamle tidsanslag er bakgrunn, ingen målt fasit. S1–S4 gjelder samtidig, og det innføres ingen timer-/telemetrifunksjon.

## Verifikasjonsgrenser fra AD-10

| Grense | Senere kontroll og avgrensning |
|---|---|
| Rene input-/finans-/terskel-/screening-/formatfunksjoner | Vitest mot uavhengig fasit, null/blank, år/måned, ulike år, negativt resultat, delberegninger, eksakt likhet/én krone under og alle utløsere. Formatering testes separat fra regelavgjørelse. |
| Frontend-overganger | Rene reducer-tester for navigasjon uten mutasjon, bevart utkast, Bruk/Avbryt/Avvis, ny relevant bekreftelse, forholdsbundet TG3-avklaring og historisk snapshot. |
| PDF | Faktiske fixturebytes: 30/31 sider, feil format/tekstlag, antall og side→tekst, blank/blandet tekst-bilde/tegnkoding og tabeller/kolonner mot uavhengig fasit. Ufullstendig/upålitelig lesing blir ikke falsk suksess. |
| Adapter/HTTP/felles kontrakt | Kontrollsvar for gyldig tomliste, manglende/ugyldig svar, usikre kandidater, feil/timeout, rapport-/fixture-/versjonsmismatch, duplikat, klientavbrudd og sent svar. Verifiser fravær av ekstra KI-kall, retry og live-fallback. |
| Hele bygde appen | Playwright med kontrollert adapter ved samme grense som live/demo; UJ-1, alle tre anbefalinger, feil/retting, originalside og gjenbruk. Ingen betalt API i E2E. |
| Manuell UX | Alle fire trinn, eksakte trinnnavn/status, lokale feil, synlig beslutningsgrunnlag/detaljåpning, tastatur/fokus/statuskunngjøringer, PDF-side/nabosider/panel/Esc/retur, zoom, kontrast og forståelse. DESIGNs praktiske kontrastmål er 4,5:1 tekst og 3:1 nødvendig kontroll/fokus, ingen sertifiseringspåstand. |
| Live/tid/ren kjøring | Separat originalt live-uttrekk mot S2 før retting, S5 med manuell sammenligning og S6 med annen person. Demo og enhetstester er ingen live-kvalitets-/tidsbevis. |

Fixtures planlegges under `tests/fixtures/property-cases/`, med fiktive rapporter, strukturerte inndata, uavhengig fasit og rapport-/versjonsbundne lagrede uttrekk. Faktiske evalueringsresultater og manuelle bevis legges under `.docs/implementation-artifacts/` ved gjennomføring. Testfasit tilpasses aldri modellsvaret i etterkant. Det opprettes ingen ny dekningsprosent eller test-ID-serie her.

## Kurs- og faglærerføringer

Autoritet: [faglærerens tilbakemelding](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md) og [sensorveiledningen](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf). Tilbakemeldingen gjelder den tidligere brede briefen; dens oppfølging er bevart gjennom revidert brief, final PRD, UX og arkitektur.

| Føring | Konsekvens for videre arbeid, uten nytt produktomfang |
|---|---|
| Smal og gjennomførbar v1 | Tre faglige steg i enkel sekvens, finans i kode og faste regler med fasit. Fire UX-trinn er den godkjente skjermfordelingen. Ingen agentrammeverk/score/annonseuthenting. |
| Sporbar prosess og KI-styring, sensor s. 1–3 | Bruk planene videre, knytt krav/beslutninger til senere kode/testbevis og forklar avvik. Lagre viktige prompts/arbeidsøkter og konkrete rettinger av KI-forslag, med faktiske små avgrensede commits over tid. BMAD-planlegging og faglærerens omtalte Claude Code-implementering starter ikke en ny fase her. |
| Funksjonalitet og testing, s. 3–4 | Verifiser kjerneflyt, feil input og gjentatte handlinger. Kjør relevante automatiske tester og dokumenter manuelle tester, kodegjennomgang, funn og rettinger der det trengs. Ingen kursbestemt testdekningsprosent eller plikt til alle testtyper utledes. |
| Design, s. 4–5 | Bruk final UX og egne eksisterende skisser/mocks som referanser. Vis konsistens, navigasjon/tilbakemeldinger, etiketter, kontrast, tastatur, eventuell alternativtekst og relevant desktop-/zoomtilpasning. Mocks er ikke produktbevis. |
| Kode/arkitektur, s. 5 | Hold struktur/importer/ansvar i samsvar med final AD-er; lesbar og konsekvent kode uten dupliserte regler, døde rester eller unødvendig kompleksitet. Begrunn konfigurasjon/avhengigheter. |
| README/kjørbarhet, s. 2 og 5–6 | Beskriv formål/målgruppe, versjonerte forutsetninger, eksakt installasjon/build/start/adresse/tester, demodata, valgfri live-konfigurasjon uten hemmeligheter, struktur og plan-/prosesslenker. Verifiser at oppskriften stemmer med faktisk kode i rent miljø. |
| Repo/data/kostnad, s. 6–7 og faglærer | Oversiktlig struktur og .gitignore; ingen hemmeligheter i filer/historikk, lokale private originaler/byggeartefakter utenfor Git. Fiktive data foretrekkes; reelle dokumenters rettigheter/personopplysninger/anonymisering vurderes før publisering. Avklar budsjett før betalte tester og gjenbruk uendret uttrekk. |

Sensorveiledningen brukes med faglig skjønn mot godkjent oppgave. Kompleksitetseksemplene gir ingen nye krav om database, roller eller integrasjoner. Karaktervekter/-beregning er vurderingsadministrasjon, ingen appfunksjon; sertifisering, bestemt stakk, ekstra responstidsgrense og egen revisjonsfunksjon utledes ikke. Denne kontrollen gir ingen karakter eller attest for et ferdig produkt.

## Videreførte avklaringer

Dette er eksisterende Deferred i final arkitektur, med samme eiere og seneste avklaringspunkt. Ingen av dem blokkerer destillering av spec eller er skjult avgjort her. Dersom en løsning krever endring av låst produkt/UX/arkitektur, må Mads spørres først.

| Gjenstående valg/arbeid | Eier | Senest før / ramme |
|---|---|---|
| KI-leverandør, modell, SDK, kontekst/output, pris og prosjektbudsjett | Mads og live-integrasjon | Før live-adapterimplementering/betalte tester. Hele støttede sidemerkede grunnlaget i ett kall, uten skjult avkorting/retry; ingen flerleverandørplattform. Demo/kontrakt avhenger ikke av valget. |
| HTTP-ressurser og cleanup — R3 lukket 2026-10-20 | Mads + Backendansvar | [Godkjente grenser, ressurslivsløp og testmatrise](../../planning-artifacts/r3-http-ressurser-semester-v1.md) implementeres/verifiseres i Story 2.5. Eksakt PDF-/JSON-grense, hard lokal 60 s-frist, tidlig avvisning, in-memory cleanup og duplikatmarkør er avklart. 30 sider og S5 bevares; live-timeout forblir ved R1 før Epic 4. Portlukking er ikke bestått HTTP-/cleanup-test. |
| PDF-lesbarhetskontroll og layoutbevaring — R2 lukket 2026-10-20 | Dokumentkomponenten | [Godkjent R2-regel og fixtureutfall](../../planning-artifacts/r2-pdf-lesbarhet-semester-v1.md) skiller bevist blank fra ulest innhold. Selve ekstraksjon/blankdeteksjon og PDF-testbevis leveres i Story 2.3; ingen OCR/vision eller manuell semantisk klassifisering. Tabeller/kolonner, tegnkoding og blandet tekst/bilde kontrolleres mot fasit. |
| Detaljerte felt/runtime-schemas, prompt, endelige script-/miljøvariabelnavn | Implementering innen AD-1–AD-10 | Før de aktuelle kontraktene/ressursene tas i bruk. Én contracts-kode er autoritet, ingen konkurrerende former eller ekstra produktfunksjoner. |
| Faktiske fixtures/fasit, installasjon/låsfil/typekontroll, tester, README og S2/S5/S6-bevis | Implementering/evaluering | Fasit før KI-evaluering; faktisk kode/låsfil/rent miljø verifiserer startstakken og kommandokontraktene. Ingen installasjon eller kvalitet påstås fra dokumentene. |
| Hosting, varig lagring, innlogging, samarbeid, OCR og utvidet analyse | Senere produktbeslutning | Utenfor v1; ingen gjeldende arkitekturforpliktelse eller leveranseplan. |

Spine beholder kommandokontraktene `npm ci` → `npm run build` → `npm run demo`, utvikling via `npm run dev`, lokale tester via `npm test` og bygget E2E via `npm run test:e2e`. Browserinstallasjon dokumenteres før offline E2E. Dette er planlagte kontrakter, ikke scripts som finnes eller er kjørt gjennom denne spec-en.

Spec avsluttes etter koherens- og bevaringskontroll. Eventuell senere oppdeling skal bruke hele kontrakten og kravsporene; denne leveransen starter ingen epics, stories eller implementering.
