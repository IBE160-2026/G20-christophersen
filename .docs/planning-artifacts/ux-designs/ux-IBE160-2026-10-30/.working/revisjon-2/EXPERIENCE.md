---
name: Property Acquisition Agent
description: Investeringsorientert førstevurdering med separat scenario og kildefordypning.
status: proposal-awaiting-approval
revision: 2
updated: 2026-10-30
baseline_commit: 06d8962a5fc5812b4b76c35e8a4798cd1d5f473e
paired_with: DESIGN.md
implementation_authorized: false
sources:
  - designforslag.md
  - .memlog.md
  - ../ux-IBE160-2026-10-13/EXPERIENCE.md
  - ../../sprint-change-proposal-2026-10-28.md
  - ../../prds/prd-IBE160-2026-10-10/prd.md
---

# Property Acquisition Agent — atferdsforslag, revisjon 2

## Foundation

Responsiv lokal webapp, desktop først, ett utleieobjekt i midlertidig økt.
[DESIGN.md](DESIGN.md) eier visuelt uttrykk; [samlet forslag](designforslag.md)
og [beslutningslogg](.memlog.md) beskriver retning og kildegrunnlag.
Revisjon 2 prioriterer investeringsinnsikt og interaktiv finansiering.
Dokumentkontroll er tilgjengelig fordypning med kritiske konsekvenser synlige
på investeringsflaten. Status er fortsatt utkast før Mads' godkjenning.

[Offline-prototypen](mockups/designforslag.html) er én interaktiv HTML med
fiktive data, lokal illustrasjon, navigasjon, scenariofelter, validering,
nullstilling, leie-mangler-tilstand og kildedialog. Den åpner på Investering
slik at designet kan vurderes direkte; den foreslåtte virkelige reisen starter
med PDF på Start. Filvalg i skissen leser eller analyserer ingen fil.
Eksempelknappen navigerer bare til illustrasjonen. Ingen API, betalt tjeneste,
ny AI-modul eller produktkode inngår.

Revisjon 1 er bevart under [.working/revisjon-1](.working/revisjon-1).
Dokumentene angir tilsiktet forslag ved skisseavvik; tidligere godkjente
produktkontrakter endres først ved vedtak og senere implementering.

## Information Architecture

| Flate | Inngang og oppgave |
| --- | --- |
| Start | Salgsoppgave som hovedinngang, synlig FINN URL-felt med eksisterende sperre og tydelig merket eksempelvisning. |
| Investering | Eiendomsbilde/adresse/pris/nøkkelinfo, tre primære nøkkeltall, vurdering, interaktiv finansiering og konkrete risikoer. |
| Eiendom og risiko | Eiendomsopplysninger og konkrete tekniske/økonomiske forhold. Full TG-liste, rapportdekning og separat alvorlig TG3-avklaring i fordypning. |
| Dokumentasjon | Dokumenter, kilder, sidestatus, konflikter, begrensninger, nødvendig kilde-/økonomikontroll og listekontroll. |
| Kildedialog | Åpnes fra relevante tall og forhold; viser kilde med riktig dokument og fysisk side og gir retur til åpneren. |

Åpen navigasjon krever ikke ferdig økonomi. Tilgang til dokumenter er ikke
bekreftelse av grunnlaget. Økonomidetaljer om leie/drift, pris/kjøp og NOI
nås fra Investering uten en ny obligatorisk veiviser.

## Voice and Tone

Språket skal hjelpe investoren å forstå eiendommen og økonomien først.
Bruttoyield/nettoyield forklares kort som leieavkastning; kontantstrøm oppgir
før skatt og periode. P/L/D/J/Ymin, revisjoner og SDK-termer ligger i detaljer.

| Situasjon | Tekst |
| --- | --- |
| Opplasting | «Last opp salgsoppgave» med kort forklaring om tilgjengelige opplysninger og senere kontroll. |
| Scenario | «Interaktivt scenario – ikke bekreftet». |
| Finansiering | «Prøv finansieringen» og «Se hvordan egenkapital, rente og nedbetaling påvirker betalingene». |
| Manglende leie | «Kan ikke beregnes — leieinntekt mangler». |
| Risiko | «Forhold å ta stilling til» og konkret årsak, eksempelvis «Takforhold må avklares». |
| Kontrollstatus | «Kontroll gjenstår» før gjeldende kodevurdering finnes; ingen ny anbefalingskategori. |
| Opphav | «Fra dokumentet», «Egen forutsetning», «Ukjent» og separat «Dokumentets estimat» når relevant. |
| TG3 | «Avklart for førstevurdering — brukeroppgitt grunnlag»; ingen teknisk godkjenning. |
| Historikk | «Forrige vurdering — historisk». |
| Midlertidig økt | «Arbeidet beholdes bare mens siden er åpen». |

Opphav og kontrollstatus er ulike egenskaper. Kontrollmarkeringer vises i
fordypningen; kritisk mangel og konsekvens skal fortsatt ses fra Investering.

## Component Patterns

| Komponent | Atferd |
| --- | --- |
| Eiendomstopp | Vis dokumentert adresse, pris og nøkkelinfo når tilgjengelig. Manglende informasjon forblir ukjent; manglende bilde får nøytral plassholder. Fiktive opplysninger og illustrasjon merkes som eksempel. |
| Opplasting | I fremtidig produkt starter eksisterende lokal lesing ved filvalg uten finansinput. Skissen leser ingen fil og påstår ingen analyse. 200 fysiske sider og samlet 50 MiB-profil videreføres; ingen OCR. |
| FINN | Synlig felt og sperretekst. Innliming starter ingen henting. URL-validering, objektbytteregler, servergate, autorisasjonsreferanser og duplikatvern beholdes. |
| Primære nøkkeltall | Bruttoyield, nettoyield og kontantstrøm før skatt med enhet/år. Skissen viser separat syntetisk scenario. Gjeldende produktberegninger krever fortsatt relevante gyldige bekreftede input. NOI ligger i økonomiforklaring. |
| Finansscenario | Tallfelt og supplerende slider for egenkapital/rente/nedbetaling. Lokal justering oppdaterer lån, betaling og scenariokontantstrøm. Finansiering endrer ikke brutto-/nettoyield etter eksisterende formler. Nullstill gjenoppretter eksempelverdier. |
| Risikosammendrag | Oppsummer konkrete tekniske, økonomiske og dokumentrelaterte forhold. Ingen ny totalrisiko, score eller modellkalibrert sikkerhetsprosent. |
| Kilde-/økonomikontroll | Dokumentverdier skrives ikke inn på nytt. Vis originale perioder, år, mva, gjeldsdel, inkludering og konflikter når relevant; kontroller eller korriger med proveniens bevart. |
| Bekreft økonomi | Én synlig sluttkontroll etter nødvendige kilde-, konflikt-, null-, kostnadsinnholds- og fullstendighetskontroller. Ingen automatisk bekreftelse eller bekreft-alt-snarvei. Skissen bekrefter ikke reelle data. |
| Rapportfunn | Korrekt originalside, bekreft/korriger/avvis uttrekk og original bevart. Ubrukt utkast påvirker ikke grunnlaget. |
| TG3 | Separat Uavklart/Avklart, begrunnelse og konkret eksternt grunnlag. Kontrollert tekst er ingen TG3-avklaring. |
| Rapportliste | Egen eksplisitt bekreftelse etter nødvendige enkelt-/begrensningskontroller. Vellykket tomliste og analysefeil er ulike tilstander. |
| Vurdering | Eksisterende kodebestemte utfall og regelprioritet. Scenariojustering endrer aldri gjeldende kontrollstatus, bekreftelser eller revisjonsbundet investeringsvurdering. |
| Kildedialog | Originalutdrag, dokument, fysisk side, trykt side når kjent og nabosider i tilsiktet produkt. Skissen viser fiktiv kildekontekst uten ekte PDF. Tekniske identitets-/tekstbindinger ligger i detaljer. |

Finanskontroller har `{spacing.control-height}` høyde og
`{spacing.related-gap}` innbyrdes avstand. Status bruker navngitt tekst med
`{colors.status-warning}` eller `{colors.status-danger}`; farge endrer ingen regel.

## State Patterns

| Tilstand | Atferd |
| --- | --- |
| Prototypen åpnes | Investering med tydelig fiktivt eksempel; Start er tilgjengelig. |
| Tom produktstart | Primær PDF-inngang, synlig sperret FINN-felt, manuell/demo-inngang. |
| Lokal lesing i produkt | Faktiske delsteg og avbryt; ingen oppdiktet prosent eller påstått KI-aktivitet. |
| Scenario gyldig | Oppdater lokale scenariotall straks, med synlig ubekreftet merking. Ingen gjeldende resultatendring. |
| Scenario ugyldig | Forklar feltfeil lokalt. Ikke bruk ugyldig verdi, erstatt med null eller vis gamle tall som gjeldende scenario. |
| Leie mangler | Yield, NOI og kontantstrøm som krever leie viser mangelårsaken. Låne-/betalingsforslag kan fortsatt beregnes fra sitt eget gyldige grunnlag. |
| Nullstill | Gjenopprett syntetiske scenarioverdier og tilhørende beregninger uten å endre virkelig kontrollstatus. |
| Ufullstendig rapport / TG3 | Hold informasjonsbehov synlig uansett positivt eller negativt finansscenario. Ingen godkjenning fra kontantstrømmen. |
| Uløst semantikk / stengt live | Berørt omfang og sperreårsak synlig; ingen fallback, betalingsknapp eller nytt kall. |
| Rapport mangler / vedlegg ulest | Behold økonomi, tilby separat støttet rapport og tilhørighetskontroll. |
| Uleselig / uklar grense | Navngi fysiske sider; listebekreftelse kan ikke gjøre feilgrunnlag fullstendig. |
| Ukjent / konflikt | Ukjent er ikke 0. Behold alle kildealternativer og kvalifikasjoner; ingen automatisk vinner. |
| Drift / fellesgjeld ufullstendig | Vis kjente subtotaler som delgrunnlag. Privat lån alene gjør ikke samlet gjeldsbetaling komplett. |
| Endret bekreftet produktgrunnlag | Tidligere vurdering er historisk; bare fortsatt gyldige relevante delberegninger beholdes. Ny kontroll/reevaluering bruker riktig revisjon. |
| Dokumentbytte | Ny rapport beholder økonomi, men krever ny rapport-/listekontroll og TG3-avklaring. Ny salgsoppgave følger eksisterende objektbytteregler. |
| Samme dokument / retur | Gyldig hash-/versjons-/modusbunden gjenbruk, ingen ny analyse bare fra navigasjon. |
| Demo / feil / avbrudd | Faktisk opphav og ufullstendighet synlig; ingen påstått live-suksess eller automatisk retry. |
| Historikk | Merket med `{components.historical.background}` og tekst, aldri aktiv anbefaling for endrede verdier. |
| Sidelasting / lukking | Ingen ny varig lagring. Prototypens reset er ikke et produksjonssystem for historikk. |

## Interaction Primitives

- Lenker/knapper åpner Start, Investering, Eiendom og risiko og Dokumentasjon uten ny analyse.
- Scenariofelter og slidere har samme verdi og presise enheter. Nedbetaling konverteres entydig til hele måneder; ingen skjulte produktstandarder.
- Nullstill og en leie-mangler-kontroll lar Mads undersøke både normaltilstand og mangel i skissen.
- Feltvalidering beholder input, navngir problemet og unngår falske nullverdier.
- Kildedialog fokuserer overskriften; Esc/lukk returnerer til åpneren med kontekst bevart.
- Funnvalg kan skifte PDF-side uten å stjele fokus. Kontrollhandlinger endrer bare relevant grunnlag.
- Gjeldende produktanbefaling kan reevalueres i Investering etter nødvendige kontroller uten separat Beregn-resultat-side; senere implementering må bevare snapshot-/revisjonsbinding.
- Analyse-/resultatstatus kunngjøres kort ved faktiske overganger. Ikke les opp alle scenariotall kontinuerlig mens slideren dras.

## Accessibility Floor

Synlige etiketter, enheter, år og feil knyttes semantisk til kontrollene.
Tastaturrekkefølge følger leserekkefølgen; ingen handling avhenger av hover,
drag eller farge. Slidere har presist tallfeltalternativ. Kontroller er minst
`{spacing.control-height}`; fokus følger `{colors.focus-ring}`,
`{spacing.focus-width}` og `{spacing.focus-offset}`.

Fiktiv illustrasjon får tekstalternativ uten å antyde et virkelig foto.
Dialog har fokusstyring, Esc og retur. Forstørrelse bevarer tall, kilder og
handlinger. Kontrast, tastatur, annonsering og smal visning må kontrolleres på
senere produktimplementasjon; lokal prototypekontroll er ikke produktakseptanse.

## Responsive & Platform

Ved bred desktop får hero bilde/identitet side om side og investeringsrad ca.
2/3 tall og 1/3 vurdering. Finansiering og risiko står under. Ved knapp plass
stables innholdet i samme meningsfulle rekkefølge. Navigasjonen ombrytes;
`{spacing.page-gutter}` blir `{spacing.mobile-gutter}` på smal flate.
Original-PDF åpnes separat når delt visning ikke er lesbar. Ingen tap av
kontrollhandlinger når PDF og funnliste ikke kan vises samtidig.

## Inspiration & Anti-patterns

Viderefør lys grafitt/petrol, luft, presis typografi og lite støy. Se på
verktøyet som en eiendomsinvestors beslutningsflate: eiendom, avkastning,
finansiering og relevante forhold. Unngå at den første skjermen domineres av
filnavn, hash, statusadministrasjon eller kontrollsjekklister. Kritiske
usikkerheter forblir synlige. Ingen chatbot, glød, tradingpreg eller score.

## Key Flows

### 1. Mads prøver investeringsdesignet

1. Mads åpner prototypen på Investering og ser fiktiv illustrasjon/adresse, pris, tre nøkkeltall og informasjonsbehov.
2. Han endrer egenkapital, rente eller nedbetaling. Lån, betaling og scenariokontantstrøm oppdateres; yieldene følger uendret leie/drift/pris.
3. Han sammenligner finansieringsvirkningen og åpner et risikoforhold eller en kilde ved behov.
4. **Klimaks:** Han ser investeringens økonomiske følsomhet samtidig som ufullstendig rapport og uavklart TG3 fortsatt krever informasjon. Ingenting er bekreftet av scenarioet.

Feilforløp: ugyldige felt gir konkrete feil; leie-mangler-tilstanden viser utilgjengelige beregninger. Nullstill returnerer til utgangspunktet.

### 2. Mads starter fra salgsoppgaven i det foreslåtte produktet

1. Mads velger PDF på Start uten å registrere finansverdier først.
2. Lokal analyse viser tilgjengelig dokumentgrunnlag på Investering. Manglende bilde/areal/type/rom fylles ikke inn med antakelser.
3. Han undersøker scenarier og kontrollerer dokumentverdier, forutsetninger, kostnadsinnhold og rapport i valgfri rekkefølge.
4. Han bekrefter økonomi og rapportliste etter nødvendige underkontroller; TG3 avklares separat eller beholdes uavklart.
5. **Klimaks:** Gjeldende kodevurdering viser alle avgjørende forhold fra det kontrollerte grunnlaget. Mads tar beslutningen selv.

Feilforløp: manglende rapport/leie er synlig på investeringsoversikten; tilgjengelig økonomi og originalkilder kan fortsatt leses.

### 3. Mads undersøker et alvorlig forhold og endrer grunnlag

1. Mads åpner takforholdet fra risikooversikten og ser fiktiv kildekontekst i skissen eller korrekt originalside i tilsiktet produkt.
2. Han skiller korrekt uttrekk fra separat TG3-avklaring; en listebekreftelse opphever ingen dokumentfeil.
3. Ved endring av faktisk bekreftet økonomi blir forrige produktvurdering historisk til relevant ny kontroll. Et separat scenario endrer ikke denne historikken.
4. **Klimaks:** Han kan etterprøve dokumentet, egne antakelser og kontrollstatus uten å miste eiendommens investeringsoversikt.

## Syntetisk scenario og senere kontraktarbeid

Skissen bruker Eksempelveien 14, 0000 Eksempelby og en lokalt illustrert fiktiv
leilighet: 86 m² BRA-i, to soverom, eierseksjon, byggeår ukjent. Bilde, areal,
type og rom krever senere kontrakt-/parserarbeid og er ikke støttet uttrekk nå.
Ingen generert illustrasjon skal fremstilles som foto av et virkelig objekt.

Alle beløp er eksplisitte eksempelverdier: prisantydning 3 000 000 kr,
totalpris uten kjøpsomkostninger 3 200 000 kr, kontantbehov 3 075 000 kr,
egenkapital 1 000 000 kr, rente 5,50 %, 300 måneder, fellesgjeldsbetaling
12 000 kr/år, leie 252 000 kr/år, drift 48 000 kr/år og nettoyieldkrav 6 %.
De er ingen produktstandarder eller dokumenterte virkelig-eiendomsdata.

Den separate scenariomodellen er et nytt forslag som krever senere
modell-/krav-/kontraktavstemming. Den bruker investeringens eksisterende
økonomiske betydninger, men er ikke en implementert del av finansdomene eller
bekreftet screening. Ingen midlertidig confirmed:true. FR-13 gjelder fortsatt
relevante bekreftede input i gjeldende produktresultat; scenariet får egen
identitet, opphav og gyldighet. FR-16s prioritet beholdes. Ufullstendig rapport
og uavklart alvorlig TG3 gir fortsatt Innhent mer informasjon i eksemplet,
uansett hvordan finansieringen justeres.

## Bevarte faglige og tekniske grenser

Gjeldende screening har bare Gå videre, Forkast og Innhent mer informasjon.
Mangler/uavklart alvorlig TG3 har prioritet foran økonomiske brudd. Pris,
kontantbehov og lån er separate størrelser. Ingen nye lånetyper, fratrekk,
risikoscore, markedsdata eller AI-moduler. Ingen antatt null eller stille
årsomregning av kvartal/termin/mva fra separat økonomiprøve.

Original/korrigering, manuelle rettingers eierskap, kilde-/side-/tekstbindinger,
gamle svar-/duplikatvern, ressursgrenser, nøkler kun i backend og eksisterende
kostnads-/tilgangsporter beholdes. Checkpointets 11/11 gjelder avgrenset
økonomiprøve, ikke full TG-/produksjonsvalidering. Vanlig salgsoppgave-live og
FINN forblir sperret; svake modellfortolkninger er ubekreftede og PAA-SO2 åpen.
