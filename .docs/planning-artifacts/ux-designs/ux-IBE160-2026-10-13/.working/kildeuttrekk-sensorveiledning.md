# Kildeuttrekk: sensorveiledning til UX-arbeidet

Dato: 2026-10-13. Formål: underlag for BMAD UX for Property Acquisition Agent, låst v1.

Autoritativ kilde: [Sensorveiledning-IBE160-Del-1.pdf](../../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf). Hele original-PDF-en er lest med macOS PDFKit; PDF-side 4 er også rendret og kontrollert visuelt. PDF-en har sju sider, og PDF-sidetall og trykte sidetall samsvarer (1-7). Uttrekket er parafrase, ikke en ny kravkilde. [PRD-arbeidets kildeuttrekk](../../../prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md) er brukt som kryssjekk, ikke som erstatning for originalen.

## Det originalkilden faktisk sier

| Kildested | Relevant vurderingsgrunnlag |
| --- | --- |
| s. 1, kap. 1 «Formål» | Applikasjon og repo vurderes som helhet: hva gruppen har laget, hvordan det ble laget, og om andre kan forstå, kjøre og videreutvikle det. Planlegging, prompts, iterasjoner, kvalitetssikring og beslutninger inngår. Veiledningen støtter faglig skjønn og skal ses i forhold til valgt oppgave og ambisjonsnivå. |
| s. 1, kap. 2 «Vurderingskriterier og veiledende vekting» | Design og brukeropplevelse har veiledende vekt 10 %. Prosess/KI-styring har 30 % og kvalitetssikring/testing 15 %. Vektene begrunner oppmerksomhet til både UX-resultatet og dokumentert arbeidsprosess; de bestemmer ikke produktfunksjoner. |
| s. 2, kap. 3 «Fremgangsmåte for sensor» | Sensor leser godkjent proposal og eventuell product brief, går gjennom beskrevne kjerneflyter og prøver feil input og uventet bruk. Design vurderes på helhet, konsistens og brukervennlighet, med ulike skjermstørrelser hvis relevant. Planleggingsdokumenter, prompts, KI-økter, beslutninger og kvalitetssikring skal henge sammen med koden. |
| s. 2-3, kap. 4, kriterium 1 «Prosess og KI-styring» | Sensor ser etter BMAD-dokumenter som faktisk brukes og oppdateres, sporbarhet fra krav/plan til funksjoner, forklarte avvik, lagrede prompts og KI-økter samt dokumenterte og begrunnede løsningsvalg. Prosessen skal vise at gruppen har presisert, avvist, rettet eller forbedret KI-forslag. A-B-kjennetegnene på s. 3 legger vekt på dokumenterte beslutninger og prompts koblet til konkrete endringer. |
| s. 3, kap. 4, kriterium 2 «Funksjonalitet og omfang» | Kjerneflytene fra proposal og README skal fungere fra start til slutt. Appen skal tåle vanlig bruk, feil input og gjentatte handlinger uten å krasje. Utelatelser eller endringer fra proposal skal beskrives og begrunnes. Omfang vurderes mot valgt oppgave og ambisjonsnivå. |
| s. 3-4, kap. 4, kriterium 3 «Kvalitetssikring og testing» | Kvalitetssikring vurderer om KI-generert kode gjør det den skal og hvordan feil er funnet og rettet. Sensor ser etter kjørbare automatiserte tester av meningsfull logikk, dokumenterte manuelle tester/testplaner der automatisering ikke passer, spor av kodegjennomgang, grunnleggende feilhåndtering og inputvalidering. A-B-kjennetegnene på s. 4 omfatter systematisk dokumentert kvalitetssikring med konkrete funn og rettinger. |
| s. 4, kap. 4, kriterium 4 «Design og brukeropplevelse» | Appen skal være gjennomtenkt for sine brukere. Sensor ser etter et helhetlig og konsistent visuelt uttrykk i farger, typografi, avstand og komponenter; tydelig navigasjon og informasjonsstruktur; at brukeren forstår hva som kan gjøres og hva som skjer; forståelige tilbakemeldinger, feilmeldinger og tomtilstander; grunnleggende tilgjengelighet gjennom lesbar kontrast, tastaturnavigasjon, alternativtekst og fornuftige skjemaetiketter; tilpasning til relevante skjermstørrelser; spor av designarbeid, som skisser, wireframes eller UX-beskrivelser. |
| s. 4-5, kap. 4, kriterium 4 «Kjennetegn» | A-B beskriver gjennomarbeidet, konsistent og intuitiv UX med bevisste designvalg tilpasset målgruppen og grunnleggende tilgjengelighet. C beskriver brukbarhet med enkelte uklarheter i flyt og tilbakemeldinger. D-E/F på s. 5 beskriver uoversiktlig eller vanskelig bruk og en app som ikke kan brukes som tiltenkt. |
| s. 5, kap. 4, kriterium 6 «README og kjørbarhet» | En utenforstående skal kunne forstå hva appen gjør og få den til å kjøre fra README. Sensor ser blant annet etter kort forklaring av funksjon/målgruppe, gjerne skjermbilde, testdata/testbrukere ved behov og lenker til planleggings- og prosessdokumentasjon. README skal stemme med den faktiske appen. |
| s. 6, kap. 4, kriterium 7 «Ryddighet i repoet» | Dokumentasjon skal kunne finnes i en oversiktlig struktur med fornuftige fil- og mappenavn. Kode, dokumentasjon og ressurser bør være tydelig atskilt. |
| s. 6-7, kap. 5 «Typiske varseltegn» | Planleggingsdokumenter som beskriver en annen app enn den leverte, etterkonstruert planlegging og generell KI-dokumentasjon uten kobling til konkrete endringer er varseltegn. |

## Anvendelse i UX-planleggingen - tolkning, ikke nye kurskrav

- Begrunn UX-valg med målgruppen og den ferdigstilte PRD-en. Knyt utformede skjermbilder, flyter og tilstander til eksisterende krav, slik at plan og senere produkt kan sammenholdes. Et bestemt ID-format eller en sporbarhetsmatrise er ikke foreskrevet i veiledningen.
- Dokumenter navigasjon, informasjonshierarki, komponentbruk, feil- og tomtilstander samt grunnleggende tilgjengelighet i DESIGN.md og EXPERIENCE.md. Valget av disse to filene kommer fra BMAD UX-workflowen, ikke sensorveiledningen.
- Beskriv observerbar oppførsel ved vanlig bruk, feil input og gjentatte handlinger som grunnlag for senere UX-evaluering og testing. Dette uttrekket igangsetter ingen tester eller implementering.
- Bevar viktige brukeravklaringer, begrunnelser, prompts og KI-arbeid slik at designprosessen kan etterprøves. Bevis i repoet innebærer ikke en ny revisjonsfunksjon i appen.
- Sammenhold UX-dokumentene med låst v1-scope. Veiledningens eksempler på kompleksitet gir ikke grunnlag for å legge til roller, lagring eller integrasjoner.

## Avgrensninger som må beholdes

Sensorveiledningen bestemmer ikke sekvensielle steg, konkret skjermlayout, sidepanel, wizard, visuell stil, finansregler, anbefalingslogikk eller grensesnittets språk. Den fastsetter ikke dokumentfunn-til-PDF-side-funksjonen eller et produktmessig skille mellom KI-funn, brukerbekreftelser og kodebaserte resultater. Slike valg og begrensninger må komme fra produktkildene og brukerens UX-avklaringer.

Lastetilstander er eksplisitt prioritert av brukeren i denne UX-bestillingen, men er ikke nevnt som et selvstendig punkt i sensorveiledningen. «Hva som skjer» og forståelige tilbakemeldinger på s. 4 støtter oppmerksomhet til status, uten å foreskrive en bestemt løsning.

Grunnleggende tilgjengelighet er uttrykkelig nevnt i originalen. Ingen bestemt WCAG-versjon, samsvarsnivå, lovvurdering, numerisk kontrastgrense eller pålagt mobilversjon er fastsatt her. «Relevante skjermstørrelser» må tolkes i lys av produktets desktop-webretning, ikke som et nytt mobilkrav.

Veiledningen angir heller ingen bestemt teknologistakk, testdekningsprosent eller krav om alle testtyper. Den autoriserer ikke å endre ferdigstilte produktkrav for å øke omfanget.
