# Intern F1-live-preflight — 2026-10-24

Mads bestiller forenklet operativ instruks, teknisk utfylling av Codex og
F1-preflight før overlevering. Ingen faktisk test, kildekontroll eller analyse
skal startes på hans vegne. Detaljskjemaet er beholdt som internt prosessbevis.

| Kontroll | Faktisk resultat |
|---|---|
| Produktkode | `43c0a693d7517c59835078205bfe72611697dc05`, uendret etter fullregresjon |
| Regresjon | 1082 Vitest, 195 E2E, 3 dev/offline, 37 komponent, 13 S2/sikkerhet; typecheck/lint/build og nøkkelkontroll bestått |
| Maskin | macOS 26.6.2 (25G83), arm64, lest med sw_vers/uname |
| Runtime | Node 24.21.0 fra eksisterende midlertidige installasjon; npm 11.19.0 |
| Valgt nettleser | Google Chrome 155.0.8059.85, installert versjon lest fra appmetadata |
| Skjermopptak | macOS Screenshot installert; Mads bruker Skift–Cmd–5. Faktiske fil-/bildedata og menneskehendelser hentes etter levering |
| API-nøkkel | Tilgjengelig/ikke tom; ingen verdi skrevet ut eller lagret |
| Modelloppslag | Lesende GET /v1/models/gpt-6.1-sol: HTTP 200, eksakt modell-ID; ingen Responses-kall |
| Kvoter | GET returnerte ingen rate-limit-headere. Tidligere faktisk 5000 RPM / 1000000 TPM er historisk, ingen ny kvotepåstand |
| Kontoavstemming | Mads bekrefter 2026-10-24: uendret USD 2 og intet annet forbruk/ukjente belastninger etter USD 0.016072 |
| Admininnsyn | Ingen adminnøkkel/prosjekt-ID i miljøet. Kontogrunnlaget er eksplisitt brukerbekreftelse, ikke admin-API-data |
| R1 | Samlet USD 20; strengere operative USD 2 brukes |
| Pris | [OpenAI Docs, modellside](https://developers.openai.com/api/docs/models/gpt-6.1-sol), faktisk åpnet 2026-10-24: USD/MTok input 2, cached 0.10, cache write 2.50, output 10, default/kort kontekst |
| Reservasjon | USD 1.53: 100000 inputtokens ved konservativ cache-write-sats 2.50/M + 128000 outputtokens ved 10/M |
| Maksimum etter neste request | USD 0.016072 + USD 1.53 = USD 1.546072, under USD 2. Ledig ramme før request USD 1.983928 |
| Rapport | F1-tilstandsrapport.pdf, 4 sider, SHA-256 `c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb` |
| Fasit | Versjon 1, SHA-256 `d485669a4764a10b8a7ac8e451d1cc75836bc7f431a610bbdd1dc93288f20fce` |
| Analyse | GPT-6.1 Sol/Responses, SDK 6.9.1, low/default, prompt/schema 1/1, kontrakt/uttrekk 2/1, 120000 ms, max output 128000, retry 0 |
| Finans før menneskets start | P=16000000, L=1900000, D=400000, J=800000 NOK, Ymin=7 %, årsgrunnlag 2026. Tallregistrering/opplasting er utenfor måletid |

Pris er kontrollert på modellens offisielle side. USD 1.53 dekker også
konservativ cache-write-pris, i stedet for tidligere USD 1.48.
Kontoopplysningen finnes i aktiv promptlogg.

Ny plan-ID: `S5-2026-10-24-F1-01`. Nye originaler skal bevares i egen mappe
under story-4-5/; gamle 4.4-originaler og receipts endres aldri. Separat
lokal server bruker bygget app og produksjonsrouter/SDK; observatøren bevarer
uendret request, terminalutfall, leverandørutfall og usage/kostnad uten nøkkel.
Uarmet POST stoppes før pipeline. Arming er eksplisitt lokal klargjøring og
sender ingen request. Én faktisk menneskelig POST/ett transportforsøk tillates;
ingen retry. Global paidlock/reservasjon beholdes til eksplisitt avstemming.

R4-S5s person/miljø/metode er avklart i
[beslutningsloggen](../planning-artifacts/r4-s5-mads-gjennomforing-2026-10-24.md).
Dette attesterer ikke at Mads har filmet, lest, kontrollert eller startet noe.
Fullstendige S5-/4.4-bevis kommer først fra hans faktiske gjennomføring.
Første F1 samler nødvendige nye 4.4-AC6-bevis og samtidige S5-punkter; etter
F1 stoppes videre testing til bevis/review er kontrollert.

Produktkode, fixtures, modell/prompt/schema og låste krav er urørt i denne
klargjøringen. Helperreview, offlinekontroll og lokal oppstartsverifikasjon
registreres separat før overlevering. Ingen faktisk analyse eller menneskelig
måling er gjennomført. Ny genereringskostnad fra agenten: USD 0.
