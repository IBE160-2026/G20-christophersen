# BMAD Correct Course — salgsoppgave, 2026-10-28

Bestilling og stoppvilkår er bevart i aktiv
[automatisk promptlogg](../prompts/session-01a18445-b28a-71e2-af47-e969cbb8c90f.jsonl).
Bare denne identifiserte aktive loggen var usporet ved start. Baseline var
`b259207`; ingen ukjente kodeendringer eller andre usporede filer ble funnet.
Tidligere logger og automatisk logging er urørt.

Brukt skill: `.agents/skills/bmad-correct-course/SKILL.md`. Workflow ble
resolvert med prosjektets resolver, uten prepend/append/persistent-facts.
Konfigurasjonen angir Mads, norsk, intermediate og eksisterende
planning-/implementation-artifacts. Batch er valgt fra brukerens konkrete
arbeidsbestilling; trigger og produktretning var allerede eksplisitte.
Skillens generiske spørsmål om trigger/modus brukes ikke til å spørre på
nytt om det bestillingen avklarer.

Lest PRD/addendum, epics og stories, arkitektur, UX, SPEC/grensekontrakter,
R1/R2/R3, sprintstatus, sentral deferred-work og FINN-spec/sluttbevis.
Sensorveiledningens sju sider ble lest med pypdf, sammen med faglærerens
tilbakemelding. Disse brukes for sporbarhet, realistisk scope, kontrollerbar
KI, deterministisk finans, lokal demo og personvern; ingen nye kurskrav er
utledet om OCR, sidetall eller priser.

Koden bekrefter 30-sidersgrense både i validering og fullført kontrakt,
50 MiB/1 MiB-mottak, hard 60/120-sekunders prosess-/live-frist, separate
FINN-kilder og et rent TG-schema. Rå tekstuttrekk og FINN-økonomimapping er
gjenbrukbare; dokumentopphav, rapportdekning og AI-envelope krever endring.
Dette er et vesentlig valg etter bestillingens stoppregel. Ingen
produktimplementering ble startet eller delegert.

PDF-skillen ble brukt for syntetiske testoriginaler og visuell kontroll;
authoring-markøren kjørte vellykket én gang før 13 PDF-er ble generert.
Eksisterende Python-miljø i systemtemp hadde reportlab/Pillow/pypdf;
ingen ny avhengighet ble installert i prosjektet. Poppler var utilgjengelig,
så fire representative sider ble rendret med lokal PDF.js/@napi-rs/canvas
og inspisert. Generator og uavhengig fasit er versjonert under tests/fixtures.

OpenAI Docs ble brukt til datert, lesende oppslag av offisiell file-input-,
token-count- og modellsidedokumentasjon. PDF.js FAQ/API ble også åpnet.
URL-er og konkrete slutninger er i endringsforslaget. Ingen dokumenter ble
sendt til API, ingen nøkkel/konto ble kontrollert, og ingen betalt forespørsel
eller token-count-forespørsel ble utført.

Levert [endringsforslag](../../planning-artifacts/sprint-change-proposal-2026-10-28.md)
skiller vedtatt produktretning fra D1–D3. [Ny spec](../../implementation-artifacts/spec-salgsoppgave-input.md)
har arkitektur, avgrensning og 15 planlagte AC. Primærplaner og README har
datert henvisning; gammel tekst/metadata/akseptanse bevares. Bare sentral
deferred-work oppdateres med PAA-SO1 og FINN-utsettelsen. Ingen parallelle
issueoversikter opprettes. Sprintregisteret venter til teknisk profil vedtas.

BMAD Review er utført med tre kontekstfrie reviewere for adversarial,
edge-case-hunter og verification-gap. Oppdraget autoriserer dette
uavhengige reviewarbeidet; ingen implementeringsagenter ble startet.
Resultat og triage lagres i [review](../../implementation-artifacts/salgsoppgave-correct-course-2026-10-28/review.md).
Ti adversarial-funn og ett overlappende edge-funn ble rettet; verification-gap
ga ingen funn. Fokusert adversarial-/edge-etterkontroll returnerte begge `[]`.
Reviewrettingene konkretiserer ny-objekt-nullstilling, kildebundet
eiendomsidentitet, separat rapport ved ny støtteprofil, versjonert gjenbruk
og korrekt ressurslivsløp. Proben fikk assertions for dokumentfeil,
målt vedleggssidetall og komplett inventar. Bibliotekversjoner er låst;
regenerering ga identiske 13 PDF-hasher. Ingen semantisk fasit er tilpasset
modellretur; ingen modell ble kjørt. Forventede dokumentfeilkoder ble
eksplisitt lagt til under review ut fra den allerede fastsatte sidefasiten.

Faktiske prøve-/regresjonsresultater, bevaringskontroll, begrensninger og
commitspor står i [verifikasjon](../../implementation-artifacts/salgsoppgave-correct-course-2026-10-28/verifikasjon.md).
Første npm-test traff sandbox-EPERM på lokale HTTP-servere; original feil
bevares. Ny autorisert loopback-kjøring bestod uten endrede forventninger.
Ingen betalte kall, FINN-aktivering, S5-måling, ny S6-akseptanse eller push.

Gjeldende stopp: Mads avgjør anbefalt 200-sidersprofil med ressursvern,
ingen OCR og eksplisitt deldekning, samt ett kombinert uttrekk og separat
opplasting av faktisk PDF-vedlegg i første leveranse. Deretter kan godkjent
spec implementeres via bmad-build. Produktretningen trenger ingen ny avklaring.
