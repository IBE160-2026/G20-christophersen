# Uavhengig kritisk sluttkontroll av dokumentrevisjonen

Dato: 2026-11-19. Kontrollør: separat KI-agent; dette er ikke en uavhengig
menneskelig brukertest eller en sensur. Inngangscommit: `684e61d`.
Gjennomgangen gjelder arbeidstreets reviderte [PRD](prd.md),
[addendum](addendum.md), [oppfølgingsrapport](oppfolging-prd-2026-11-19.md),
[teknologivurdering](../../architecture/technology-principles-2026-11-19.md),
[testprotokoll](../../../process/evaluering/testprotokoll-del1-2026-11-19.md),
ny datert seksjon i [sentral ledger](../../../implementation-artifacts/deferred-work.md)
og lesestatus i Brief, arkitektur, sporbarhetskart og README.

Alle [faglærerkommentarer](tilbakemelding-prd.md) og originalens sju sider i
[sensorveiledningen](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf)
er brukt som kontrollgrunnlag. Kildeuttrekket er kontrollert mot original-PDF
med installert PDF.js. TG3-binding, rapportfrist og økonomihjelperens
forespørselsfrist er i tillegg stikkprøvd direkte i kode. Ingen produktkode,
andre dokumenter eller rålogger er endret av denne kontrolløren; ingen
produkttest, betalt transport, brukerundersøkelse eller publisering er utført.
Hovedøktens endelige lenkekontroll var under ferdigstilling og vurderes
derfor ikke som manglende leveranse her. [Arbeidsøkten](../../../process/arbeidsokter/2026-11-19-prd-faglaerer.md)
og råloggens avslutning med 20/20 filer og 620/620 beståtte tester er lest
ved rekontrollen. Miljøavviket fra README-Node og den første feilede
sandkassekjøringen er synlig dokumentert; resultatet fremstilles ikke som
full regresjon, ren installasjon eller menneskelig S6.

## Kontrollkonklusjon

Det er ikke funnet en gjenstående faglig dokumentmotsetning som krever ny
produktfunksjon eller kodeendring. Revisjonen retter den sentrale
dobbeltheten mellom historisk kravgrunnlag og dagens leveranse, og gjør
kritiske bevisgrenser tydelige. Ett konkret lenkefunn ble meldt til
hovedagenten, rettet og rekontrollert; se D1 nedenfor. Ingen kjent
blokkerende dokumentdefekt gjenstår i dette reviewet.

Dette er en vurdering av dokumentasjonens etterprøvbarhet. En ferdig
revisjon gir ikke i seg selv grunnlag for å erklære A på hele del 1.
Sensorveiledningen s. 3–6 har felles A–B-kjennetegn og vurderer den faktiske
appen, testene og kjørbarheten. De kjente empiriske begrensningene nedenfor
består selv om dokumentene er konsistente.

## Dekning av tilbakemeldingene

| Kommentar | Uavhengig kontrollresultat |
| --- | --- |
| §1 og §4.1: to produktversjoner | PRD har oppdatert dato, gjeldende tekst og status per FR. Senere vedtak for salgsoppgave, lokal analyse, Konsept A, leiereferanser og scenario forklarer både begrunnelse og avkall. Historisk ordlyd peker til Git; Brief/addendum/arkitektur/sporbarhet har tydelig lesestatus. Gamle ikke-mål fremstilles ikke som nåværende forbud. |
| §2: bevar sterke sider | Eksakte økonomiske grenser, kodebestemt anbefaling, feil versus fullført tomliste, nøkkelfri demo og K1–K3 er beholdt. FR-14 skiller kjerneformler fra annuitetens øreavrundede betaling. Ett gammelt rapportkall forveksles ikke med null modellkall i vanlig lokal import. |
| §3: sju dimensjoner | Oppfølgingsmatrisen behandler alle sju. Én investor og én reise er beholdt, med feilscener og korte krav fremfor nye personas eller generelle kvalitetsløfter. Kravstatus og bevisgrenser støtter videre bruk uten å likestille «bevart» med «bestått». |
| §4.2: alvorlig TG3 | Operativ regel er alle aktive TG3. `currentTg3Findings` i `src/frontend/state/report.ts` velger gjeldende TG3; `validateTg3Resolution` i `src/domain/tg3-resolution.ts` krever status, tekster og binding. Ingen ny ufarlig TG3-klasse oppfinnes. Retting/avvisning av feiluttak og faktisk TG3-avklaring er skilt, og formuleringen fremstilles som presisering av konservativ kode, ikke ordrett opprinnelig briefvedtak. |
| §4.3: lengde og gjentakelser | Hovedregelen er samlet i FR-16; andre FR-er beskriver sine særlige konsekvenser. Status-/kildestoff er samlet og historiske testtabeller bevart. Den nye tekstens økte antall lenkede dokumenter er sporbarhetsbevis, ikke parallelle issuesystemer. |
| §4.4: frist og budsjett | R1s USD20, senere USD0,20 og økonomireservasjon USD0,15 er skilt. S5 300/600 s er ikke timeout. Rapportens absolutte 120 s til validert utfall er skilt fra økonomihjelperens 120 s forespørselsfrist; ettervalideringens svakere totale tidsavgrensning er uttrykkelig oppgitt. Ukjent belastning nullstilles ikke, og en nøkkel er ikke fremstilt som tillatelse. |
| §4.5: testutvalg | F1–F4 har verdier og fasit. Nytt forslag om tre rapporter/ti TG2/to TG3 er merket uutført; match, duplikater, fysisk side, ceil-regel og nullnevner er angitt. Historiske 4/4 TG2 og 1/1 TG3 beskrives som lite kontrollert utvalg. Det nye forslaget omskriver ingen gammel prøve til bestått. |
| §5: ID-er, antakelser, begreper og scener | ID-er og historiske testtabeller er bevart. Scenarioantakelser og konto-/prisusikkerhet er synlige; ingen generell antakelsesfrihet hevdes. Uttrekk, funnliste, dokumentgrunnlag, kritisk grunnlag og TG3-avklaring er skilt. D1 er rettet og rekontrollert; hovedagentens endelige mekaniske kontroll supplerer reviewet. |
| §6: videre-fase-porter og briefoppfølging | Avklaringer beskrives som etterfølgende avstemming, ikke som om alle faser først skulle starte nå. Den manglende omtalen av manuell lesing/regneark, chatboter og rådgivere er innarbeidet med ærlige nyttehypoteser. |
| §7: opphav og historikk | Opphavsdelen skiller samtidige beslutningsreferater fra manglende råsamtaler. Den tilskriver ikke studenten eller faglærer sikkert førsteforfatterskap til 90 %. KI-formulerte/grenseavledede testeksempler er kontrollert mot formler og testasserts; «håndskrevet fasit» brukes ikke som bevis på uavhengig menneskelig fagvalidering. Dokumentgjelden etter omfangsskiftet erkjenner en reell svakhet. |

## Konkrete dokumentfunn

### D1: Feil anker til briefens finanscaser

- **Sted ved gjennomgangen:** PRD, «Finansutvalg F1–F4», kildelenken etter
  tabellen (linje 280 ved kontrollen).
- **Bevis:** lenken bruker `addendum.md#fire-kontrollerte-testcaser`.
  Den faktiske overskriften i brief-addendum er
  `### Minst fire kontrollerte testcaser`; det genererte ankeret er
  `#minst-fire-kontrollerte-testcaser`.
- **Konsekvens:** filen åpnes, men leseren ledes ikke til oppgitt kildeavsnitt.
  Påstanden om ferdig lenkekontroll blir for sterk dersom feilen står igjen.
- **Foreslått retting:** bruk det faktiske ankeret og kjør lenkekontroll på
  endelig filsett. Dette er en mekanisk dokumentretting, ikke en produktfeil.
- **Behandling/rekontroll 19. november:** hovedagenten rettet fragmentet til
  `#minst-fire-kontrollerte-testcaser`. Ny lesing av PRD og briefens faktiske
  overskrift bekrefter samsvar. Funnet er dokumentrettet; det lukker ingen
  produktsak i den sentrale ledgeren.

Ingen andre konkrete blokkerende dokumentdefekter er identifisert i denne
kontrollen. Dette er et avgrenset review, ingen garanti om at hver påstand
i hele repoet eller all fungerende applikasjonskode er fullstendig kontrollert.

## Testopplegg: gjennomførbarhet og gjenstående menneskelig arbeid

Prøve A har klart rekrutteringskrav, offentlig demo med eksisterende fasit,
observerbare feilscener og krav om logging av all hjelp. Den kan utføres
uten private PDF-er, konto eller produktkodeendring. Det er riktig at en
person med terminalerfaring er valgt for installasjonsprøven, og at dette
ikke generaliseres til helt datanovise brukere.

Prøve B har konkrete A/B-blueprints, oppgavene dekker samme arbeid i begge
metoder, og sekvensfordelingen balanserer case og metode. Øktgrense,
ufullførte forsøk, kvalitetsgate før tidsutsagn og rapportering av alle feil
reduserer risikoen fra den historiske S5-prøven. Ny primærmåling er
ende-til-ende og holdes atskilt fra gamle S5-målepunkter. Lik
anbefalingskategori i A/B er begrunnet som kontroll av arbeidsmengde; alle
tre utfall testes separat i S6/regresjon.

Planen er konkret, men **ikke klar til faktisk kjøring**: casepakker,
rettighets-/anonymiseringskontroll, uavhengig originalfasit, kontrollør,
pilot og rekruttering er uttrykkelig gjenstående. Et lite firepersoners
bekvemmelighetsutvalg kan bare gi utforskende resultater. Eventuell agentfasit
har svakere uavhengighet, og lokal parserdekning må rapporteres slik den
faktisk er. Disse begrensningene er oppgitt i protokollen og er ikke
skjult som gjennomførte eller beståtte tester.

## Hva som fortsatt begrenser en begrunnet A-vurdering

- **Funksjonalitet/omfang, 20 %:** generell dokument-/TG-/layoutdekning er
  ikke dokumentert, og sentrale reelle eksempler gir ufullstendig teknisk
  grunnlag. At scenarioet er nyttig eller kildene har korrekte hasher
  beviser ikke komplett og stabil dokumentforståelse. Dette er større enn
  en redaksjonell svakhet og må veies mot den godkjente kjerneambisjonen.
- **Testing/UX/kjørbarhet, 15/10/10 %:** egen S6 annen-person-prøve og
  uavhengig førstegangsforståelse mangler. Agentbasert ren klon og
  automatiserte tester gir reelle tekniske bevis, men ikke denne menneskelige
  akseptansen. Veiledningen pålegger ikke et bestemt antall brukertestere;
  begrensningen gjelder prosjektets egne mål og styrken i UX-bevisene.
- **Nyttehypotese/S5:** historisk manuell referanse mangler deler av
  oppgaven; 32:16/0:41/5:18 er ikke grunnlag for validert gevinstprosent.
  Akseptert S5-W1 er ikke rettet ved å skrive en ny plan. Bevist tidsgevinst
  er ikke et universelt A-krav, men kan ikke brukes som positiv effektpåstand
  før den faktisk er målt forsvarlig.
- **Bevisenes uavhengighet:** deler av prosess-/fasit-/reviewmaterialet er
  laget med KI, og private originaler kan ikke fullt reproduseres fra offentlig
  klon. Revisjonen er tydelig om dette; den tilfører ikke en menneskelig
  kontroll som ikke har skjedd. Personlig forståelse kan ikke attesteres
  av denne agenten.

Disse forholdene er allerede eid av den sentrale ledgeren og oppgitt i
oppfølgingsrapporten. Sluttkontrollen oppretter eller lukker ingen sak,
endrer ingen akseptanseterskel og anbefaler ingen ny tjeneste eller
stackendring for å løfte karakteren.
