# Sluttverifikasjon – avgrenset økonomiprøve

Dato 2026-10-30. Baseline `58f11cfd9e3d25481ed3a385464e31aec4b1df1c`.
[Bestilling/spec/AC](../spec-salgsoppgave-economy-trial.md),
[prosesscheckpoint](../../process/arbeidsokter/2026-10-30-salgsoppgave-economy-trial.md).

## Resultat og grense

Kjent PDF-metadata valideres uten generell unntaksregel, også UTF-16-datoer,
kjente InDesign-oppføringer og Transparency/ICC. Ukjent/ødelagt struktur,
referanser og relevante annotasjoner gir fortsatt sperre. Dekodingsgrense
har egen årsak, uten å skjule samtidig kjent teksttap eller øke grensen.

Ny avgrenset økonomipakke bevarer alle fysiske sider lokalt og velger bare
lesbart originalt tekstlag. Utelatte sider/raster gjør ikke teknisk dekning
komplett og trenger ikke perfekt OCR for denne tekstprøven. Egen preflight
re-ekstraherer originalen, binder request/schema/fasitforslag og bruker kun
lokale SDK-stubber. Ingen transport, journalinitialisering eller frysing skjer.

Private originalkilder er kontrollert, og enkel fasitoversikt er klargjort
for brukerens godkjenning. Agentens transkripsjon er ikke uavhengig menneskelig
verifikasjon. Fasit- og betalt godkjenning er fortsatt null. Teknisk/TG-dekning
er uavklart; rapportfravær er ikke et godkjent negativt TG-fasitsvar.

## Tester og review

Pinned Node24.21.0/npm11.19.0, tom API-nøkkel og lokal demo/stubb.

| Kontroll | Endelig bevis |
| --- | --- |
| Full unit/integrasjon | [1506/1506, 61 filer](full-tests-head.txt) |
| Typecheck og bygg | [Bestått](build-head.txt); kjent Vite chunk-størrelsesvarsel, ingen type-/byggfeil |
| Lint | [Bestått](lint-head.txt) |
| Uavhengig BMAD | [Tre reviewlag + nykontroller, 14 individuelle funn rettet](review.md), ingen restfunn |
| Bevaring | [159 låste finans-/historikk-/fixturefiler byteidentiske](preservation.json), promptprefiks bevart, ingen privat fil sporet |

Innledende `full-tests.txt` har én reell AP-statusregresjon, rettet mot uendret
frosset fasit. Etter UTF-16/AP-retting bestod 1483 tester i full-tests-final.txt.
Reviewrettinger ble verifisert med 1503 i full-tests-reviewed.txt. Siste 1506-
kjøring inkluderer konfliktbelegg, kvalifikasjonstap og Unicode-minus. Tidligere
logger er beholdt; kun head-filene ovenfor er sluttbevis.

Matrisens metadata-/ukjent-/raster-/limit-/korrupsjonsrader dekkes av
`economy-pdf-status.test.ts` og `pdf-extraction.test.ts`. Økonomiscope, uavhengig
pakke-/orakel-/ledger-/teknisk manipulasjon, ekte re-ekstraksjon, kilder,
fastfelt, kategorier, rå kvartal/mva, konflikt og uavklart resultat dekkes av
`economy-trial.test.ts`. Eksisterende server-count-/budsjett-/separat-rapport-
/omstart-tester inngår i full suite. Delte numeriske/årstester gjenbrukes uten
finansberegning. Ingen av testene dokumenterer ekte modellkvalitet.

## Kostnad og første faktiske kall

Sol/global Standard/low er bevart. Full request med schema, input og reasoning
har samme digest-/SDK-/count-vakter som tidligere. Input40k og output8k inklusive
reasoning gir konservativ **modellreserve USD 0,18** ved maks input2,50/M og
output10/M; rabatt antas ikke. Dette er ikke målt kostnad for privat dokument
eller en godkjent totalpris inkludert count.

Kontrollerte offisielle kilder:
[Sol-pris](https://developers.openai.com/api/docs/models/gpt-6.1-sol),
[token-count](https://developers.openai.com/api/docs/guides/token-counting),
[per-run-controller og avgrensning mot andre avgifter](https://developers.openai.com/cookbook/articles/per_run_spending_controller_responses_api).
Count-endepunktets egen pris er fortsatt ikke etablert. Ukjent pris stopper
før nettverk; et prosjektvarsel eller vilkårlig restbeløp er ingen dollar-hardcap.
Faktisk telling, gebyrmaksimum og varig fellesreservasjon må være avklart før
senere generering. Ingen output-, reasoning-, verktøy- eller rapportkostnad kan
hoppes over. Verktøy/historikk/filer/bilder/retry er ikke tillatt.

**Første betalte AI-test er ikke godkjent eller kjørt.** Neste menneskelige
steg er godkjenning/retting av den private fasitoversikten, ikke gjennomlesing
av samtlige sider. Countpris, ekte kvittering, varig budsjett og særskilt
betalt testgodkjenning gjenstår. Ingen finans-/screeningregel eller eksisterende
fullstendig TG-fasit-/bekreftelsesport er endret. Ingen private dokumenter i
commit, ingen push.
