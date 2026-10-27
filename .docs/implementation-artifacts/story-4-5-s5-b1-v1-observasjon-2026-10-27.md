# S5-B1-v1 — faktisk forsøk og menneskelig video, 2026-10-27

**Checkpoint: forsøket er bevart og kostnadsavstemt; Story 4.5 og Epic 4 er
fortsatt in-progress. S5/tidsgevinst er ikke godkjent.** Den manuelle referansen
mangler avtalte aktiviteter. Ingen manglende menneskehandling er rekonstruert,
og ingen ny analyse eller ny måling er startet ved denne beviskontrollen.

## Originaler og identitet

Forsøk: `S5-2026-10-27-S5-B1-v1-01`, fra leveransecommit
`5fa438e2047bd9f854e72688da32c7ef8b045c7d`. [Bevismappe](story-4-5/S5-2026-10-27-S5-B1-v1-01/)
bevarer request, dispatch, originalt parset provider-svar, usage, HTTP/outcome,
receipt og separat cost-only-avstemming. Opprinnelige filer er ikke omskrevet.

- Video: `/Users/madschristophersen/Downloads/Screen Recording 2026-10-27 at 18.43.17.MOV`,
  1 174 580 962 byte, SHA-256 `c00e1047a502fdfb71eb4954e70fe1ac68cbc1f8fe52c46a562da96c295fba82`.
  Varighet 2551,83 s, 3024×1964, variabel bildefrekvens. Originalvideo blir lokalt;
  kun beskårne relevante rammer lagres i repo, uten nettleserfaner/chat/dock.
- Originalnotat: `/Users/madschristophersen/Documents/AI test tilstandsrapport.pages`,
  133 583 byte, SHA-256 `d402d0a409871b4d7c0bad40e481f8674b419a60d0b6a46ae9a0479433fcfa6c`.
  [Byteidentisk kopi](story-4-5/S5-2026-10-27-S5-B1-v1-01/human-evidence/manual-original.pages)
  og original innebygd forhåndsvisning er bevart. Visuell lesing av denne
  forhåndsvisningen, ikke påstått full IWA-tekstuttrekking.
- Samme fryste PDF: SHA-256 `5548434c32b3cdb3bd9ac5d91f25a1fa055eb3b0928279134124c46403bc3ca1`;
  fasit `8c7000bc06041f03e1090d7d9cfadf8dd679cdf6072931aad28c6af7cfc879a5`.
  14 fysiske sider. Alle sju fryste filer forblir uendret; fasit var fastsatt
  i benchmarkens tidligere frysecommit før dette første uttrekkskallet.

[Maskinlesbare observasjoner og rammehasher](story-4-5/S5-2026-10-27-S5-B1-v1-01/human-evidence/observations.json)
binder originalene til faktiske presentasjonstider og beskjæringskoordinater.
AVFoundation dekodet filen lokalt. Sandboxforsøk mislyktes; lokal dekoding med
utvidet medietilgang lyktes. Dette er ingen påvist skade på originalvideoen.

## Faktisk menneskelig gjennomføring og avgrensninger

Mads opplyser i aktiv promptlogg at han ikke tidligere hadde lest rapporten,
og at han kun brukte tilstandsrapporten under kontrollen av KI-resultatet.
Tidligere lesing av selve fasiten er ikke uttrykkelig besvart; ingen blindtest
påstås. Videoen viser også originalnotatet åpnet under kontrolldelen; åpning
alene beviser ikke bruk som kontrollgrunnlag. Selvrapport og observasjon
beholdes hver for seg.

Mads bekrefter uttrykkelig at den manuelle delen bare identifiserte og noterte
de ni TG2/TG3-funnene: **ingen separat generell begrensningsvurdering og ingen
uttrykkelig avklart/uavklart-vurdering av TG3 ble gjort før KI-analysen.**
Notatet inneholder 8 TG2 og 1 TG3 med riktige fysiske sider 3–11, og sluttmarkør
«Manuell kontroll ferdig». Originalen skal ikke kompletteres i ettertid.
Denne tiden gjelder derfor TG-identifisering/notering, ikke hele den avtalte
manuelle førstevurderingen etter kortinstruksen. Det finnes ingen gyldig
komplett sammenligningsreferanse eller dokumentert samlet tidsgevinst.

Videoen viser Safari, mens planlagt oppsett var Chrome. Finans ble registrert
på nytt og avviker fra fryst `financial-inputs.json`: P14 000 000, L1 600 000/år,
D300 000/år og J73 000/måned (=876 000/år), 2026. Ymin-feltet viser 10 % under
registreringen (ramme 2079,935 s); dette er en observert feltverdi, ikke et
separat eksportert sluttgrunnlag. Kildetekster som Finn/Banken er deltakerens
registreringer i et fiktivt case, ikke verifiserte eksterne kilder. Ingen
kostnadsinnholdsposter er registrert ved bekreftelsen. Planen/finansfasiten
endres ikke for å samsvare med forsøket. Bekreftet appstatus er synlig, men
nøyaktig finans- og metodekvalifisering for det forhåndsdefinerte v1-forsøket
står åpen. Finansregistreringen inngår ikke i de to S5-varighetene.

## Observerte tidsgrenser — ikke konstruerte eksakte klikk

Alle tider er sekunder fra samme videoopphav. Før/etter-rammer avgrenser
hendelser; ønsket uttrekkstid og faktisk presentasjonstid holdes atskilt.
Nominell fps eller frameindeks er ikke brukt som stoppeklokke. Første synlige
PDF-fokus brukes som observert lesestart; PDF-en var allerede åpen i Preview,
så fysisk filåpning/første personlige eksponering kan ikke bevises av rammen.
Ingen eksempel-/anslagstider fra andre vinduer i opptaket brukes.

| Hendelse | Observerbar overgang, s |
| --- | --- |
| PDF får lesefokus | 2,028333–2,491667 |
| Hele «Manuell kontroll ferdig» synlig | 1938,238333–1938,488333 |
| Start analyse → Analyserer | 2123,646667–2124,138333 |
| Ferdig liste med beskrivelse, fysisk side og usikkerhet synlig | 2164,605000–2164,918333 |
| Vellykket gjeldende listebekreftelse | 2482,730000–2483,238333 |

| Observert varighet | Intervall, s | Hva tallet dokumenterer |
| --- | --- | --- |
| Manuell TG-identifisering/notering | 1935,746667–1936,460000 | Ca.32 min16 s; ufullstendig manuell referanse |
| Start → faktisk synlig liste | 40,466667–41,271667 | Ca.41 s; inkluderer brukerens navigasjon etter leverandørsvar |
| Synlig liste → appbekreftelse | 317,811667–318,633333 | Ca.5 min18 s; full protokollkvalifisering av originalkontrollen gjenstår |

Intervallene er beregnet konservativt fra endepunktene og dokumenterer ikke
presisjon på seks desimaler i menneskelige handlinger. HTTP-slutten stopper
ikke analysemålet. Senere beregning/resultat inngår ikke i kontrollmålet.
Ingen tidsgevinstprosent, median for godkjente kontroller eller bestått S5
beregnes fra ufullstendig sammenligningsgrunnlag. De observerte intervallene
ligger under 300/600 s, men lave tider alene oppfyller ikke AC3/AC5/AC6.

## Faktisk KI-uttrekk og sluttflyt

Ett faktisk live-kall, HTTP200/completed; ingen retry eller replay. RequestId
`af48b4bc-3024-4fa9-b0c1-b6dca567b845`, provider-ID
`resp_0b89a1d0869a2003016ae0eb1cfab487d29fe9455e83b2f93f`.
Leverandørens originaluttrekk inneholder alle 8 TG2 og 1 TG3 på fysiske sider
3,4,5,6,7(TG3),8,9,10,11, uten ekstra graderte funn. Innholdet er kontrollert
mot forhåndsfasiten etter kallet, aldri sendt som fasit til leverandøren.
Dette er separat benchmarkobservasjon; historisk S2/F1–F4 endres ikke.

Kontraktvalideringen returnerer `findings: []` og **9 uncertainCandidates**,
alle med `reported-uncertainty`, fordi originalene har eksplisitt usikkerhet.
Dette betyr ikke at modellen overså alle funn. Opprinnelig grad, beskrivelse,
side og usikkerhet er bevart. Videoen viser retting/bekreftelse av de ni
kandidatene, etterfulgt av vellykket listebekreftelse. Dette gir ekstra
kontrollarbeid; ingen automatisk sikkerhetsnedgradering utføres.

Fem generelle originalbegrensninger er synlige. Noen skjemaer får korte
begrunnelsestekster, men det er ikke dokumentert at generelle avklaringer
faktisk lagres. De opprinnelige begrensningene står fortsatt som blokkere.
TG3 F005 er fortsatt Uavklart. Appen viser «Kontroll fullført» og **Innhent mer
informasjon**. Nøkkeltall: bruttoyield11,429 %, NOI1 300 000 kr/år,
nettoyield9,286 %, kontantstrøm424 000 kr/år, merket Delgrunnlag. Dette er
faktisk avvikende finansvariant, ikke den fryste finansfasiten.

Mads opplyser at originalrapporten ble brukt. Full kildekontroll av hvert
funn/oversette forhold er foreløpig ikke uavhengig verifisert fra opptaket;
appen sin bekreftelsestekst alene beviser ikke de menneskelige aktivitetene.
Denne begrensningen bevares, uten å registrere ufullført som nulltid.

## Antall, kostnad og status

Planlagt1, faktisk målt/opptatt1, live1/demo0, teknisk fullført analyse1,
feilet analyse0, synlig appbekreftelse1. Godkjent komplett manuell referanse0;
protokollgodkjente fullstendige sammenligninger0. Kontrollens protokollstatus
er åpen, ikke en påstått teknisk feil eller en nullsekundskontroll.

9437 inputtokens (9434 cache-write,0 cached),2356 outputtokens:
`(3×2 + 9434×2,5 + 2356×10)/1 000 000 = USD0,047151`.
Samlet prosjektforbruk **USD0,070243**, rest mot bekreftetUSD2: **USD1,929757**.
`reconciled.json` validerer kostnadskjeden og frigjør bare forsøksidentisk
paidlock. Cost-only-receipt bevares med `s5Measured:false`; menneskelig
video dokumenteres separat. Ingen nye API-kall under denne kontrollen.

AC1/AC2/AC4 har faktisk hendelses-/forsøksgrunnlag, med dokumenterte avvik;
full AC1/AC3/AC5/AC6-akseptanse påstås ikke. 4.4 er fortsatt done. 4.5/Epic4
forblir in-progress. 5.4/S6 og5.5 er urørt.

## Neste checkpoint

Bevar dette ene forsøket som faktisk, avgrenset bevis. Før ny gjennomføring
må en kontrollert plan avklare komplett manuell referanse, finansavvik,
originalkontroll og nå kjent rapport/læringseffekt. Etterhåndstillegg teller
ikke i den opprinnelige manuelle tiden. Nytt forsøk/nytt benchmark opprettes
ikke her; ingen ny betalt analyse er nødvendig for å avklare planen. Deretter
gjenstår faktisk komplett S5-grunnlag, sammenstilling mot TT-1–TT-9 og full
uavhengig Story4.5-review før eventuell done/Epic4-avslutning og sluttregresjon.

## Verifikasjon av dette checkpointet

[Uavhengig fokusert review og rekontroll](story-4-5-s5-b1-v1-opptaksreview-2026-10-27.md)
består etter to dokumentasjonsrettinger. [Lokal read-only-integritetskontroll](story-4-5/S5-2026-10-27-S5-B1-v1-01/human-evidence/verify.mjs)
består; [råresultat](story-4-5/S5-2026-10-27-S5-B1-v1-01/human-evidence/verification.txt).
Ekstern video/notat er rehashet til oppgitte verdier. Komplett prosjektledger
viserUSD0,070243 og ingen paidlock. `git diff --check` består; produktkode,
tools, alle fixtures og historiske S2-/4.4-/B2-filer er byteuendret mot
`5fa438e2047bd9f854e72688da32c7ef8b045c7d`. Ingen ny full appregresjon er
kjørt for denne dokument-/bevisregistreringen. Sist fullførte regresjon i
4.4-leveransen bestod1082Vitest,195E2E,3dev/offline,37komponentprøver samt
typecheck/lint/build/nøkkelkontroll; den omtales ikke som en ny S5-kjøring.
