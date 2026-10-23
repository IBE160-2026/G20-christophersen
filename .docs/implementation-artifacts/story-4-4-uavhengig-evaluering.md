# Story 4.4 – uavhengig evaluering av originaluttrekk

Dato: 2026-10-23. Evaluator: separat agent etter checkpoint, uten nye leverandørkall eller betalte forsøk. Vurderingen bygger på Story 4.4 AC1–AC6/testkrav i `epics.md`, uendret `tests/fixtures/property-cases/expected.json`, faktiske PDF-bytes og originale F1–F4-bevis i `story-4-4/`. Implementeringsagentens vurdering er ikke brukt som fasit.

**Konklusjon:** S2 består for det dokumenterte utvalget: TG2 4/4 (100 %), TG3 1/1, ingen oppdiktede funn. Evalueringsarbeidet er gjennomført, men dette er ikke full produktgodkjenning eller full oppfyllelse av AC6. F1/F2 viser screeningavvik, og F1s avsluttede kontroll/resultat er bare dokumentert via replay. S5 er ikke målt.

## Selvstendig kildekontroll før rettinger

Alle fire kontaktark `story-2-2-fixtures-F*.png` er visuelt lest: alle fire sider per rapport. Dessuten er F1-replay-resultat, F2-resultat, F4-resultat og F4-source-2 visuelt inspisert med `view_image`. Beskrivelsene nedenfor er sammenholdt med rå `provider`-tekst og bevart `outcome.original`, ikke bare strukturell adaptervalidering.

| Rapport / original ID | Grad og beskrivelse | Fysisk PDF-side | Fasit / riktige / oversette / feil side / oppdiktede |
|---|---|---|---|
| F1 / F1-001 | TG2, Slitt overflate på baderomsgulv. | 2 | 1 / 1 / 0 / 0 / 0 |
| F2 / funn-001 | TG2, Slitt overflate på baderomsgulv. | 2 | 1 / 1 / 0 / 0 / 0 |
| F3 / F3-001 | TG2, Slitt overflate på baderomsgulv. | 2 | 1 / 1 / 0 / 0 / 0 |
| F4 / F4-001 og F4-002 | TG2 som over; TG3, Alvorlig lekkasje i tak, med rapportens uttrykkelige krav om videre avklaring før screening. | 2 og 4 | 2 / 2 / 0 / 0 / 0 |

Hvert funn angir riktig `F*-tilstandsrapport.pdf` og SHA-256. TG3 er særskilt kontrollert: grad TG3, lekkasje i tak og tilleggsteksten støttes av originalen. **F4-TG3 ligger på fysisk side 4; trykt side 2 er ikke PDF-posisjon.** Ingen flere eksplisitte TG2/TG3 finnes på de øvrige visuelt kontrollerte sidene. Punktum og den støttede tilleggsteksten er ikke semantiske avvik. Ingen usikre kandidater eller rettinger er regnet som treff.

PDF-hashene er selv beregnet og stemmer med plan, basis, request, uttrekk og kilder:

- F1: `c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb`
- F2: `458414c5c4556e999d7c6ca045bfc25e0de7d8f39185edb85d49e812de56ce86`
- F3: `ae2bc258d529ff2b231e553e22281644b3281ea909afd735073eed4cdf3ceace`
- F4: `545f888a4ae0c9d4b9836c0f6c6317aaa89cf38478ca27f1ed32d3c775f93c9b`

Fasitens nåværende SHA-256 er `d485669a4764a10b8a7ac8e451d1cc75836bc7f431a610bbdd1dc93288f20fce`, identisk med alle før-/etterregistreringer. Alle fire sider er med i hver faktisk request. F1/F2/F4 har kodegenerert requestId forskjellig fra planens basis; selvstendig normalisering av bare dette feltet gjenskaper planhashen. Faktisk requesthash stemmer med hver `dispatch`, også F3 uten identitetsendring.

## Forsøk og kostnader

Planene registrerer commit `d378399f8637b8b1feb7418646d745aee245c4ca`, SDK 6.9.1, modell gpt-6.1-sol, reasoning low/default tier, prompt/skjema/uttrekk v1 og kontrakt v2. Fire forskjellige response-/HTTP-request-identiteter, HTTP 200, fullførte providersvar og samsvarende tokenbruk i provider/receipt støtter fire faktiske analyseforsøk. Hvert har én transport, null registrerte retries. Separat preflight er et femte betalt kall, ikke S2-analyse. F1s lokale blokkering og UI-replayfeil er bevart; replay er ikke et nytt live-kvalitetsforsøk. Bevisene er lokale logger, ikke uavhengig leverandørfaktura eller full kontooversikt.

| Kall | Input/output tokens | Beregnet USD |
|---|---|---|
| Preflight | 9 / 5 | 0.000068 |
| F1 | 963 / 146 | 0.003386 |
| F2 | 972 / 149 | 0.003434 |
| F3 | 943 / 192 | 0.003806 |
| F4 | 994 / 339 | 0.005378 |
| Sum analyser | 3872 / 826 | **0.016004** |
| Sum inklusive preflight | 3881 / 831 | **0.016072** |

Summene er selv regnet fra registrert bruk og planens satser (2 USD/million input, 10 USD/million output; ingen cachebruk), og stemmer med kumulative receipts. Prisene er ikke slått opp på nytt. Maksimal enkeltreservasjon inkludert tidligere forbruk var 1.490694 USD, innen registrert operativ ramme 2 USD. Headers viser 5000 RPM/1000000 TPM og forskjellige `x-request-id`; de beviser ikke et konfigurert hardt kontotak. Kontogrense/prepaid er manuelt oppgitt i planene.

## Avvik og akseptanse

| AC | Selvstendig vurdering |
|---|---|
| AC1 | Oppfylt for dokumentert utvalg: uavhengig fasit, begge grader, versjoner, hash og budsjettramme er bevart. |
| AC2 | Oppfylt for original live-analyse F1–F4. Provider/request/outcome og HTTP-metadata er bevart; replay teller ikke som live-kall. |
| AC3 | Oppfylt med denne rapportens eksplisitte per-rapporttall og individuelle TG3-kontroll. |
| AC4 | Oppfylt: 4/4 TG2 og 1/1 TG3 på riktig fysisk side, null oppdiktede. Utvalget er lite og svært enkelt; dette er ingen generell kvalitetsgaranti. |
| AC5 | Reell status og avvik er synlige; ingen ny kjøring, fasitendring eller terskelsenkning er brukt. Produktretting og eventuell ny verifikasjon gjenstår. |
| AC6 | Delvis. F3 har fortsatt L=null i fasit/plan/control og er korrekt analysert ved adaptergrensen uten hovedflyt/S5-start. F1/F2/F4s fire nøkkeltall stemmer, men korrekt samlet hovedflyt/resultat er ikke fullt demonstrert. |

F1s replay viser **Innhent mer informasjon**, mot forventet **Gå videre**. F2s faktiske live-hovedflyt viser **Innhent mer informasjon**, mot forventet **Forkast**. Skjermbildene viser at modellens generelle tekst om fiktiv rapport/tekstbasert analyse blir årsak til «Rapportgrunnlaget er ufullført», selv etter fullført analyse og bekreftet funnliste. Dette krever konkret avklaring/retting i håndtering av `limitations`; S2-treffene skjuler ikke avviket. F4 gir riktig hovedutfall på grunn av uavklart TG3, men viser også slike ekstra ufullstendighetsårsaker. F3s tekst om manglende original-PDF er modellens begrensning, ikke evaluators observasjon: originalen foreligger og er visuelt kontrollert her.

F1s originale receipt sier `uiControlCompleted=false`. Senere replay bruker bevart live-uttrekk og gir nyttig kilde-/UI-bevis, men beviser ikke sammenhengende opprinnelig live-hovedflyt eller tid. Ingen av kontrollfilene dokumenterer menneskelig S5-tid, og alle relevante felt sier `s5Measured=false`.

RT-16–RT-18-metodekontrollen er lest og kjørt offline: `node --experimental-strip-types --test tools/story-4-4/evaluate-s2.test.mjs`, 3/3 bestått. Den dekker 9/10 TG2 + 2/2 TG3, oversett TG3, feil side under terskel, oppdiktet funn, 8/10 og uendret originalscore etter brukerretting. Dette kontrollerer evalueringsmåten og erstatter ikke den visuelle vurderingen over.

**Leveransegrense:** S2-evalueringen kan avsluttes med positiv utvalgsstatus og dokumenterte avvik. Story 4.4 kan ikke samtidig beskrives som alle AC fullt bestått uten AC6-forbeholdet. Produktets screening må følges opp; S5 og samlet v1-godkjenning er fortsatt uverifisert av disse bevisene.
