# Arbeidsøkt: klargjøring før første code-first live-test

Mads bestilte token-/wire-verifikasjon, håndhevbar samlet USD 0,20-ramme,
trygt stopp, frossen original/fasit, sammenligning, nødvendige tester/review
og lokal commit. Ingen betalte kall eller push; stopp før første live-test.
[Aktiv prompt](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl).
Tidligere promptlogger og automatisk logging er uendret.

Baseline: `27b5ac2635300881832ec93ab8f22955e9c4b9e8`. Ved start var bare
aktiv prompt endret. `bmad-build` ble rendret for dette nye oppdraget;
to lesende undersøkelsesagenter vurderte token-/leverandørgrunnlag og
eksisterende budsjett-/fasitgrenser. Ingen av dem endret repoet eller
brukte API-nøkkel/modelltransport. En kontekstfri implementeringsagent fikk
[arbeidsplanen](../../implementation-artifacts/spec-salgsoppgave-live-preflight.md)
som eneste oppdragskilde. Hovedagenten eier uavhengig diff-/AC-kontroll,
review, endelig verifikasjon og commit.

## Funn og styring

- Den offisielle lokale pakken tiktoken 0.14.0 har ingen Sol-mapping. Det er
  ikke etablert dokumentasjon for fullt lokalt request-format. Faktiske
  [kilder og råbevis](../../implementation-artifacts/salgsoppgave-live-preflight-2026-10-29/token-verification.md)
  gir en blokkering, ikke grunnlag for å anta en eldre encoding.
- OpenAI Docs er brukt til token-count, Sol-priser og cache-rate. Standard
  globalt endepunkt med standard 30m cache har inputmaks USD 2,50/M og
  output USD 10/M. Prisprofilen bindes til modell/tier/endepunkt/innhold;
  ukjente innstillinger sperres. Ekstern token-count antas ikke gratis.
- Den gamle budsjettklassen var minnebasert. Den nye klargjøringen bruker
  varig historikk og eksklusiv lås i ignorert `private/`. Hovedagenten
  initialiserte én kjent ny syntetisk analyse med null forbruk;
  [kvitteringen](../../implementation-artifacts/salgsoppgave-live-preflight-2026-10-29/history-initialization.json)
  har USD 0,20 igjen og null kall. Klargjøring får aldri nullstille historikken.
- Den faktiske nye originalen har fem fysiske sider og SHA-256
  `7c250de09eed71cefe4a6e4418ead8080b2f5b34b4371af2bed822699c1dae53`.
  Hovedagenten leste alle sider uavhengig med pypdf og kontrollerte hash,
  økonomiposter, to TG2-forhold og ett TG3-forhold med fortsettelser/tabell.
  Dette er en syntetisk teknisk førstetest, ingen påstand om representativ
  produksjonskvalitet for vilkårlige reelle salgsoppgaver.
- Før sammenligningsprøvene avstemte hovedagenten den håndskrevne fasiten:
  eksplisitt renter+avdrag er gjeldsdel 1000, koblet år kan være konservativt
  ukjent eller kildebelagt 2026, og ikke oppgitte faste felter forblir ukjente.
  Ingen modellretur finnes; rettingen er ikke tilpasning til modelloutput.
- Den eksakte SDK-bodyen bevares uten ekstra linjeskift, slik at filens
  bytehash svarer til observert request. Bare lokal fetch-stub brukes til
  serialiseringskontroll; ingen headers eller nøkler bevares.

Kursveiledning og faglærerfeedback videreføres for uavhengig fasit,
sporbarhet og vanlig kode for finans. Ingen finans-/screeningregel,
historisk S5/S6-akseptanse eller kostnadsfullmakt endres av klargjøringen.

## Uavhengig review og testgrunnlag

Tre kontekstfrie reviewere ble startet før resultatene ble håndtert.
14 konkrete funn fikk individuelle dommer i specen før gruppering;
[reviewloggen](../../implementation-artifacts/salgsoppgave-live-preflight-2026-10-29/review.md)
bevarer hvert funn. Den opprinnelige fulle suiten besto 1409 tester;
build/lint besto. Samme implementeringsagent fikk små kode-/testrettinger;
hovedagenten skrev prosedyre for manuell krasjavstemming og eier endelig
fulltest, nykontroll og commit. Ingen ny brukerflate eller betalt transport.

Lokal dokumentinventering fant bare syntetiske salgsoppgave-/rapportoriginaler
og historiske bevis. Ingen privat PDF/fasit ble funnet som kunne gjøre den nye
tekniske femsidersprøven representativ for reelle salgsoppgaver. Dette er en
egen åpen kvalitetsforutsetning, synlig i sentral PAA-SO2 og sluttverifikasjon;
ingen produksjonsrepresentativitet utledes av stubber eller historisk S5.

## Endelig offline-resultat

Alle 14 reviewfunn er rettet og gjenkontrollert av de samme tre uavhengige
reviewerne uten restfunn. Hovedagentens siste fullsuite består 1418/1418,
55 filer; build/typecheck og lint består. 80 låste filer er byteidentiske
mot baseline, og tidligere prompt-/deferred-historikk er bevart. Ny fasits
eierform-/relasjonskilder er uavhengig kontrollert mot alle originale sider.

Klargjøringen ble kjørt på nytt mot samme private journal, uten init/reset.
Eksakt SDK-body er 13274 bytes; wire-SHA256 og requestdigest er bevart i
[bytekontrollen](../../implementation-artifacts/salgsoppgave-live-preflight-2026-10-29/wire-validation.json).
`ready:false`, kun local-tokenizer-unavailable i teknisk pakke, null kall og
null reservasjoner, USD 0,20 igjen. Det overordnede representative
kvalitetsscope er også åpent. Ingen live-test, nøkkellesing, push eller
endring av finans-/screeningregler. Lokal commit inkluderer aktiv promptlogg.
