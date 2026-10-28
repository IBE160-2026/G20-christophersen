# FINN-1 — uavhengig BMAD-review 2026-10-28

Tre kontekstfrie reviewere ble startet samtidig fra BMAD-build step-04:
`finn_blind_review`, `finn_edge_review`, `finn_verification_review`.
De leste samme komplette diff fra baseline
`ff3ea6e4431d5a104307487c7ec577c15980d2aa`, inkludert eldre FINN-bevis som
lå ucommittet ved start. Diffen var 212049 bytes. Blind-reviewens pålagte
funn-gulv var min(floor(sqrt(212.049)+1),10)=10; gulvet er metode, ikke bevis
for at hvert foreslått funn er riktig. Alle resultater ble mottatt før triage.

Reviewerne fant ti, fem og ett funn. Hovedagenten kontrollerte påstandene
mot kallere/vakter og kjørte en egen syntetisk reproduksjon av feil deling,
nullgjeld og ugyldig år. Ett blindfunn ble avkreftet: år abc ga D=null,
ikke et numerisk D med ugyldig år. Tre egne funn gjelder gamle E2E-antall, ærlig status/etiketter og reserverte
ekstrafelt-ID-er som kunne krasje utkastet.

Hvert enkelt funn, dom, konkret bevis og patch-rute er registrert i
[specens Review Triage Log](../spec-finn-import.md). Samme rotårsak samles
først etter individuell dom. Ingen reelle produkt-/kontraktvalg er nødvendige
for rettingene: de håndhever allerede godkjente kilde-, korrigerings- og
finansgrenser. Ingen låst finans-/screeningformel endres.

Kode før rettingene er bevart i lokal commit
`6df0ec23481b662208e28968d736fa657b4d0849`, med aktiv promptlogg og tidligere
FINN-bevis. Den opprinnelige reviewdiffens SHA-256 er
`40a12911c45fde972e9c5cbc2169e4f5a78e79713bbacd8a563202e72a000546`.

[Retteloggen](review-fixes.md) beskriver implementeringsagentens endringer og
målrettede tester. En fokusert etterkontroll fra den uavhengige edge-revieweren
bekreftet at kostnadsvern, manuell periode/år, refresh, J-årsvakt og DOM-ID-er
var rettet. Den fant ett resterende konkret tilfelle i sliderfunnet:
`1075000.555` blir avrundet av range med øresteg. Hovedagenten rettet dette
ved å beholde nøyaktig tallverdi og skjule slideren med forklaring når beløpet
har flere enn to desimaler. E2E dekker også dette tilfellet.

Ingen reelle reviewfunn er utsatt. FINN-1s tilgangs-/aktiveringsport er et
bestående vilkår, ikke et lukket reviewfunn. Endelig regresjon og AC-spor
er samlet i [sluttverifikasjonen](sluttverifikasjon.md). Alle relevante sluttprøver bestod.
Reserverte ID-er fikk åtte nye tester etter konkret reproduksjon, fulgt av
full 1176-regresjon, bygg/typekontroll, lint og berørt FINN-E2E.
