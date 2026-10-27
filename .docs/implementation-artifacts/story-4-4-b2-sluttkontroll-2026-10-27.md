# Story 4.4 — nye originale F1/F2-sluttbevis

Dato: 2026-10-27. Status før uavhengig sluttreview: **review**. Ingen done er
satt på grunnlag av denne egenkontrollen. Brukeren bestilte nytt faktisk F1-
sluttbevis, uavhengig review, full regresjon og deretter betinget klargjøring
av 4.5. Ingen menneskelig S5 eller KI-analyse av S5-B1-v1 er startet.

## R1, identitet og originalbevis

[Datert preflight](story-4-4-b2/preflight-2026-10-27.json) dokumenterer Mads sin
ferske kontroll: USD 2-grense, samlet USD 0.016072 og ingen andre/uavklarte
belastninger. Admininnsyn/prosjekt-ID mangler; det er ikke påstått API-verifisert
kontoavstemming. Lesende modelloppslag ga HTTP 200/riktig modell og ingen
kvoteheadere. [OpenAI Docs](https://developers.openai.com/api/docs/models/gpt-6.1-sol)
ble faktisk åpnet: Standard input/cached/cache-write/output = 2/0.1/2.5/10
USD/M. Reservasjon USD 1.53 inkluderte 100000 input ved konservativ cache-write-
sats og 128000 output. Ingen betalt minimalkontroll ble gjentatt.

Ny forsøks-ID: **F1-B2-2026-10-27-01**. Egen [forsøksmappe](story-4-4-b2/F1-B2-2026-10-27-01/)
bevarer plan, faktisk PDF.js-grunnlag, forventet request, dispatch/request,
komplett JSON-innhold fra providerresponsen, headere, opprinnelig apputfall, kildekontroll-checkpoint,
eksplisitt rootvurdering, sluttkontroll, screenshots, receipt og avstemming.
Planen binder full commit, kilde/build/helpers, PDF/fasit og stabil preflight.
Modell gpt-6.1-sol/low/default, SDK 6.9.1, prompt/schema 1/1, kontrakt/uttrekk
2/1, 120000 ms og retry 0 er uendret.

Dette var bygget app → ekte HTTP-router → faktisk PDF.js → uendret produksjons-
SDK → originalt validert live-utfall → samme appøkt/kildekontroll/resultat.
Ingen replay, kontrolladapter, demosvar eller bytte av korrelasjons-ID brukes.
Transporten videresendte originale requestbytes og tillot én dispatch.
Etter responsen ventet samme nettleser ved rootcheckpoint uten nytt kall.

F1-PDF SHA-256: `c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb`.
Fasit SHA-256: `d485669a4764a10b8a7ac8e451d1cc75836bc7f431a610bbdd1dc93288f20fce`.
Rapporten har **1 TG2 på fysisk side 2, 0 TG3**. Samlet historisk S2 4/4 TG2
og 1/1 TG3 gjelder fortsatt hele F1–F4-utvalget, ikke F1 alene.

## Faktisk F1-utfall og kildekontroll

HTTP 200/completed/live. Nytt originalt funn: «Bad: Slitt overflate på
baderomsgulv.», TG2, fysisk side 2. Root leste original-PDF-kilden, kontrollerte
fysisk side og viste source.png/original.png før videre bekreftelse. Dette
er semantisk samme fasitfunn: **1/1 riktig TG2, 0 oversette, 0 feil side,
0 oppdiktede, 0 usikre kandidater, 0 brukerrettinger**. Originalt uttrekk ble
bevart før UI-handlinger. Dette er ekstra AC6-forsøk, ikke omskriving av det
historiske S2-utvalget eller reparasjon av gammel F1-receipt.

To faktiske generelle begrensninger ble bevart og vurdert separat:

1. Uttrekket bruker fire siders tekst, ikke direkte original-PDF-kontroll.
   Dette er R1s tilsiktede tekstinput; root kontrollerte originalens side 2
   visuelt og alle fire lesbare sider. Ingen kritisk rapportmangel ble funnet.
2. Rapporten er fiktiv og beskriver ingen reell eiendom. Originalens side 1/3
   dokumenterer dette. Det er forventet opphav for funksjonsprøven, ikke
   manglende kritisk informasjon eller en faktisk investeringsbeslutning.

[limitation-approval.json](story-4-4-b2/F1-B2-2026-10-27-01/limitation-approval.json)
binder konkret vurdering til eksakt originalt utfall, funn og kilde. Appen
registrerte eksplisitt erklæring/begrunnelse i aktuell revisjon. Begrensningene
forble synlige både i kontrollen og resultatets opphavsdetaljer; vurderingene
er agentutførte brukerhandlinger for funksjonskontroll, **ikke Mads sin
menneskelige kontroll eller et KI-faktum**. Ingen kritisk usikkerhet ble
omklassifisert eller overstyrt.

Funn og gjeldende liste ble eksplisitt bekreftet. Kodebestemt sluttutfall
ble faktisk assertet: **Gå videre**, bruttoyield 11.875 %, NOI 1500000 NOK/år,
nettoyield 9.375 %, kontantstrøm før skatt 700000 NOK/år. Resultatets original-
begrensninger og begrunnelser ble kontrollert i UI. control.json og receipt
har uiControlCompleted=true. Én analyse-POST, én provider-dispatch, ingen retry.

Faktisk providerusage: 963 input + 156 output = 1119 tokens; ingen cached,
cache-write eller reasoning-tokens. Ny kostnad **USD 0.003486**, samlet
**USD 0.019558**, operativ rest **USD 1.980442**. Dette er beregnet fra faktisk
usage og kontrollert pris, ikke påstått endelig leverandørfaktura.
Headere bekreftet 5000 RPM/1000000 TPM. Root kontrollerte receipt/usage/eier
og kjørte eksplisitt reconcile uten nøkkel: kjent kostnad avstemt, eid global
paidlock frigitt, ingen ukjente belastninger fra dette forsøket. Server/nettleser
ble avsluttet. Ingen flere betalte forsøk er kjørt eller planlagt automatisk.

## Samlet akseptansegrunnlag

| AC | Faktisk grunnlag |
| --- | --- |
| AC1 | Forhåndsfasit og original F1–F4-planer består; nytt F1-forsøk har separat forhåndsplan/hash/kostnadsgrunnlag |
| AC2 | Originale fire live-uttrekk beholdt; ny original F1 gjennom hele hovedflyten, egne korrelerte provider/HTTP/UI-bevis |
| AC3 | Opprinnelig uavhengig S2-kildeevaluering beholdt; nytt F1 kontrollert uten retting, 1/1 TG2 fysisk side 2 |
| AC4 | Historisk S2 fortsatt 4/4 TG2 + 1/1 TG3, ingen oppdiktede; ikke flyttet eller utvidet med benchmarkdata |
| AC5 | Historisk uiControlCompleted=false og replay står urørt. Nytt B2-forsøk beviser dagens sluttflyt uten å omskrive historien |
| AC6 | F1 nytt komplett originalt live-sluttbevis; F2 har nå også et separat nytt korrekt originalt live-sluttbevis (se tillegg nedenfor). F4-originalens korrekte Innhent mer informasjon med Uavklart TG3 og F3 ved adaptergrensen bevares. B1 er tidligere uavhengig reviewbestått og nå verifisert i faktisk F1/F2-live. F3 har fortsatt L=null. |

B1: se [uavhengig review](story-4-4-b1-uavhengig-review-2026-10-24.md).
B2: dagens nye bevis er grunnlag for lukking først etter sluttreview.
F2s tidligere feil er ikke skjult: det var samme generelle limitation-trigger
som B1 retter; eksisterende produktregresjon kontrollerer F1/F2/F4 separat.
Fullverifisert betyr her Story-AC i prosjektets definerte testutvalg, ingen
generell KI-kvalitetsgaranti eller menneskelig tidsgevinst.

## Full regresjon og bevaring

[Maskinlesbar regresjon](story-4-4-b2/regression-2026-10-27.json): alle exit 0,
Node 24.21.0, nøkkel/modus fjernet, OS-nettsperre og bare lokal loopback.
Typecheck/lint/build, 1082 Vitest (39 filer), 195 E2E, 3 dev/offline,
37 komponentprøver, 13 S2-/sikkerhetsprøver, 8 eksisterende manuellhelperprøver
og build/demo-/nøkkelkontroll (204 frontendfiler, 0 lekkasjer) består.
Ny B2-helper har separat 7/7 offlineprøver og oxlint uten advarsler.
Eksisterende Vite chunkstørrelses- og NO_COLOR-varsler er uendret.
Nestet OS-sandbox stoppet først før teststart med exit 71; samme nettprofil
ble deretter kjørt med godkjent lokal utføring. Ingen testendringer/hopp/retry.

[Bevaringskontroll](story-4-4-b2/preservation-2026-10-27.json) bekrefter 87
byteidentiske beskyttede filer: samtlige 7 fryste S5-B1-v1-filer og de 80
historiske fixture-/4.4-/adapterfilene. Ingen produktkode, låste kontrakter,
F1–F4-fasit eller tidligere S2-/live-bevis er endret.

Uavhengig BMAD-sluttreview og eventuell triage registreres separat før done.
4.5 klargjøres først etter bestått 4.4. Epic 4 kan ikke settes done mens 4.5
fortsatt mangler faktisk menneskelig gjennomføring og review. 5.4/S6 og 5.5
forblir urørt.

## F2-rest avdekket og faktisk lukket 2026-10-27

Verifikasjonsreview avviste egenkontrollens tidligere antakelse om at F2-
replay var nok til AC6. F2-originalens expectedRecommendationMatched=false
står urørt. Ett nødvendig separat forsøk, **F2-B2-2026-10-27-01**, er derfor
gjennomført med ny plan og fersk kostnadsavstemming fra F1-B2.
[F2-preflight](story-4-4-b2/preflight-F2-2026-10-27.json) dokumenterer kjent
forbruk USD0.019558 og reservasjon USD1.53 innen den brukerbekreftede USD2-
grensen. Ingen ekstra kontobekreftelse eller minimalkall var nødvendig; alle
mellomliggende belastninger er våre egne originale receipts.

F2 gikk faktisk gjennom bygget app, original HTTP/PDF.js/SDK, rootcheckpoint
og samme nettleserøkt til korrekt **Forkast**. Ferskt TG2-funn «Slitt overflate
på baderomsgulv.» er visuelt kontrollert mot original fysisk side 2 og fasit:
1/1 riktig, 0 oversette/feil side/oppdiktede, ingen kandidater eller rettinger.
Alle fire sider er readable. To originale generelle tekstinput-/fiktivopphavs-
begrensninger ble hver for seg vurdert mot denne faktiske F2-originalen med
eksakt outcome-/finding-/kildebinding og bevart originaltekst/revisjonsgrunn.
Ingen gammel begrunnelse ble blindt brukt som godkjenning av ukjent ny tekst.
Dette er agentkontroll, ingen menneskelig S5.

Appen assertet bruttoyield **8.750 %**, NOI **1000000 NOK/år**, nettoyield
**6.250 %**, kontantstrøm **200000 NOK/år** og anbefaling **Forkast**.
[Originalt F2-sluttbevis](story-4-4-b2/F2-B2-2026-10-27-01/control.json) og
receipt har uiControlCompleted=true; original/controlled/source/result-
screenshots er bevart. Én POST/én providerrequest, ingen retry/replay.

F2-usage: **972 input + 159 output = 1131 tokens**, cache/reasoning 0.
Kostnad **USD0.003534**. Ny total **USD0.023092**, operativ rest **USD1.976908**.
Begge nye forsøk kostet samlet **USD0.007020**. Sum er formatert til seks
desimaler; JSONs flyttall kan vise 0.023091999999999998. Root har eksplisitt
avstemt også F2 og frigitt bare eid global lås. Ingen ukjent belastning,
server eller nettleser er etterlatt fra F1/F2. Ingen flere 4.4-live-kall.

## Reviewrettinger og rekontroll

Tre uavhengige BMAD-lag ble kjørt sekvensielt; alle ni funn er triagert i
[specen](spec-4-4-gjennomfore-live-og-evaluere-s2.md#reviewtriage-2026-10-27).
Opprydding er isolert fra receipt-skriving, brukte forsøk avvises før ny lås,
avstemming gjenopptas bare med samme validerte eier/receipt, feildiagnostikk
er nøkkelrenset, og felles ledger inkluderer nye B2-kostnader og stopper
uavklarte forsøk. Transportprøven verner eksakt originalbody med output.
F2-AC6-gapet ble rettet med ekte nytt bevis, aldri replay eller dokumentpåstand.

Root har kjørt **26/26 målrettede offlineprøver**, 0 hopp/feil, etter patch:
8 transport-/ACguard, 10 lifecycle/ledger og 8 eksisterende manuellhelper.
Nøkkel/modus var fjernet og OS-nettsperren aktiv; ingen leverandør ble kalt.
Oxlint uten advarsler. Ingen produktkode ble endret etter den fulle grønne
regresjonen. Varige [regresjonslogger](story-4-4-b2/regression-logs/) følger
repoet; loggreferansene i JSON har både råloggsti og bevart lokal fil.

Eksakt kjørte helperkilder er arkivert separat: F1 ble arkivert etter kjøring
før reviewpatch og aggregatfingerprint matchet planen; F2 ble arkivert før
betalt kjøring. Tidspunkt/proveniens står i hver snapshotmanifest. Ingen
historisk kilde eller filhash ble konstruert i ettertid som før-kjøringsbevis.
Endelig uavhengig rekontroll gjenstår før done-setting.

### Bevisformat og siste uavhengige kontroll

Providerfilene bevarer komplett parset JSON-innhold, inklusive originalt
output og usage. De er ikke arkiv av eksakte HTTP-responsebytes eller deres
whitespace. Transporten sendte mottatt body uendret tilbake til SDK-adapteren;
ingenting ble spilt av som live, og ingen råbody er rekonstruert i ettertid.
[Samlet integritetsindeks](story-4-4-b2/final-integrity-2026-10-27.json)
identifiserer begge nye forsøk og sluttotal USD0.023092. Den eldre
integrity-2026-10-27.json er F1-checkpointet før F2, ikke en gjeldende total.

Ny uavhengig verifikasjonsagent har nå etterprøvd AC1–AC6 mot epics, alle
fire historiske S2-originaler, faktisk F4/F3 og de nye F1/F2-provider-ID-ene,
requestId/outcomehash/receipt/usage/reconciled og skjermbevis: ingen replay-
rest eller manglende Story-AC ble funnet. Siste verktøyrettinger må fortsatt
bestå målrettet rekontroll før endelig done-setting.

### Rootens siste målrettede regresjon

[Datert kildebundet kjørebevis](story-4-4-b2/post-review-targeted-2026-10-27.json)
og [rålogg](story-4-4-b2/regression-logs/post-review-targeted.txt): **44/44**,
0 feil/hopp, exit0, nøkkel/modus fjernet og OS-nettsperre. Dette omfatter
23 nye B2-/lifecycle-/ledgerprøver, 13 S2-/sikkerhetsprøver og 8 eksisterende
manuellhelperprøver. Erstatter eldre 7-/26-prøvers delkontroller som gjeldende
etterpatchresultat; historiske opplysninger er ikke slettet. Alle gjenværende
receipt-/cleanup-/NaN-/ledger-/historisk-reconcile-funn er rettet. Ingen
produktkode eller nye leverandørkall er nødvendig for disse rettingene.

## Endelig beslutning

**Story4.4 er done 2026-10-27**, etter bestått
[uavhengig sluttreview](story-4-4-b2-uavhengig-sluttreview-2026-10-27.md),
full grønn produktregresjon og siste 44/44 målrettede prøver. Alle AC er
oppfylt; ingen åpne 4.4-funn. Tidligere statusformuleringer over beskriver
reviewforløpet, ikke gjeldende status. Epic4 forblir in-progress og 4.5
venter faktisk menneskelig S5. Ingen benchmark-KI/mennesketid er opprettet.
