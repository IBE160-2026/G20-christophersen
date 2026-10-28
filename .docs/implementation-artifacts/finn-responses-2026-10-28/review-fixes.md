# FINN-2 — rettinger etter uavhengig review

Dato 2026-10-28. Se [individuell triage](../spec-finn-responses-kobling.md)
og [reviewmetode/bevis](review.md). Ingen reelle funn er utsatt.

- Vellykkede utkast starter ikke et nytt oppslag fra UI/klient/reducer.
  Annonsefeltet er låst mens oppslaget pågår; en lenkeretting kan derfor ikke
  avbryte og forbruke forsøket ved et uhell. Bevisst nytt forsøk krever
  serveromstart og ny sidelasting. Mislykket utkast kan ikke gjenopplives av
  duplikatavvisning eller endrede trackingparametre.
- Importert J avstemmes mot manuell P med samme kanoniske desimalregel i
  forhåndsvisning og bruk. Allerede anvendt, fortsatt import-eid J blankes ved
  reelt prisbrudd; eksplisitt manuell J bevares. Hovedøkten presiserte også
  bindingen til **anvendt** import-/finansieringssnapshot: ubrukte korrigeringer
  må verken skjule et prisbrudd eller forkaste J ved en ren formatendring.
- Kildepakker med alternativer uten konfliktstatus avvises før automatisk P.
  Usikkerhet blir ikke en tilgjengelig, automatisk valgt verdi.
- Backend beholder eierskap til den underliggende body-/cancel-operasjonen
  også når SDK-/klientfristen er utløpt. Neste eksterne oppslag forblir busy
  til kanselleringen faktisk avsluttes. Den beskyttede PDF-modulen
  `abortable-fetch.ts` er uendret.
- Strømmegrensen prøves med flere små UTF-8-chunks og ulest rest for både
  200-, 429- og 500-svar. Kansellering observeres ved grenseoverskridelsen,
  før fristen, slik at testen ikke kan bestå bare ved ugyldig JSON/HTTP-feil.
  Stansede SDK-eide feilkropper og pending cancellation er egne prøver.
- Ready-teksten lover ikke utfylling når P er ukjent eller manuelt beskyttet.
  Eksisterende manuell kontroll og redigering beholdes.

Hovedøkten kjørte de fire berørte unit-/HTTP-filene etter alle disse endringene:
**118 tester bestod** ([utskrift](review-fixes-tests.txt)). Dette omfatter
opptak uten omskriving, offisielt SDK med stubbet transport, gater, eksakt URL,
feil/strømmegrenser, samtidighet, forsøksvern, kildemotstrid og finansbindinger.
Ingen faktiske annonse-/modellkall inngår. Bred sluttregresjon dokumenteres
separat når den er fullført.
