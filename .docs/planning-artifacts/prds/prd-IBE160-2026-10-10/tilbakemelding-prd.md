# Tilbakemelding på PRD

| | |
|---|---|
| **Gruppe** | G20 – G20-christophersen |
| **PRD vurdert** | `.docs/planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md` (status: final, sist endret i frontmatter 2026-10-10, siste commit 6e3fbe6 2026-11-06). Addendum i samme mappe er lest. |
| **Dato** | 2026-11-12 |
| **Type** | Formativ tilbakemelding, ikke karakter |

## 1. Samlet inntrykk

Dette er en uvanlig sterk PRD: tydelig tese (sporbarhet, etterprøvbar økonomi og konsekvent håndtering av usikkerhet), 18 FR-er med akseptansekriterier, og et addendum med konkrete testtilfeller (RT, BT, AT, TT) med fasit. Risikoen for veien videre er mer redaksjonell enn faglig: dokumentet er langt og repetitivt, og et banner øverst sier at produktretningen har endret seg uten at kravene under er oppdatert.

## 2. Dette fungerer godt

- **Krav som kan bli testtilfeller.** FR-14 pkt. 4 og BT-8 fastsetter at nettoyield nøyaktig 7 % oppfyller kravet, mens 1 519 999 kr leie gir «under 7 % selv ved visning 7,00 %». Slike grensetilfeller gjør neste fase mye enklere.
- **KI holdes utenfor beslutningene.** FR-16 pkt. 1: «KI genererer eller endrer ikke anbefalingen, tersklene, regelprioriteten eller begrunnelsen». FR-9 pkt. 7 skiller «analyse feilet» fra «analyse fullført, ingen TG2/TG3 funnet», og FR-6 pkt. 4–5 begrenser live-kall til ett per rapport og gir en demomodus uten nøkkel.
- **Ærlig evaluering med motvekt.** S1–S6 er målbare, og K1–K3 hindrer feil optimalisering («Raskere tidsbruk godtas ikke … ved å skjule kritiske mangler»). Ikke-mål er konkrete i «Låst v1-scope og ikke-mål».

## 3. Oversikt per dimensjon

| Dimensjon | Vurdering | Kort begrunnelse |
|---|---|---|
| Beslutningsklarhet | god | Regelprioritet og avveininger er tydelige, men bannerets retningsendring er ikke innarbeidet, og «ingen åpne produktspørsmål» stemmer dårlig med at modell og kostnad er uavklart. |
| Substans | sterk | Alt har produktspesifikke terskler; ingen pynte-personas eller boilerplate-NFR-er. |
| Strategisk sammenheng | sterk | Funksjonene tjener samme tese og følger én flyt (UJ-1). |
| Testbarhet | sterk | Hvert FR har nummererte kriterier og koblede testtilfeller. Én sentral term («alvorlig TG3») er ikke selvstendig definert. |
| Scope og avgrensning | god | Utenfor-lista er eksplisitt, men salgsoppgave er både utenfor v1 og «hovedinngang» (se 4.1). |
| Brukbarhet for neste fase | god | ID-ene er rene, men omfanget (ca. 7 500 ord) og gjentakelsene gjør uttrekk tungt. |
| Formtilpasning | god | Passer et enbrukerverktøy med én reise. Prosesslogg (godkjenninger, «Kilde:»-linjer) blander seg med kravene. |

## 4. Viktigste forbedringer

### 4.1 Retningsendringen er ikke reflektert i kravene
- **Alvorlighet:** høy
- **Hvor:** banneret øverst («Salgsoppgave blir hovedinngangen til PAA … Teksten nedenfor bevarer det opprinnelige versjonsgrunnlaget») mot «Låst v1-scope» («OCR, analyse av salgsoppgave eller andre dokumenttyper» er utenfor v1). Frontmatter sier `updated: 2026-10-10`, `status: final`.
- **Problem og hvorfor det betyr noe:** Den som leser PRD-en får to sannheter og må følge lenker til andre dokumenter for å vite hva som gjelder. Epics, tester og kode skal knyttes til FR-ID-er, men det er uklart hvilke FR-er som fortsatt gjelder.
- **Forslag:** Legg inn en kort tabell «Gjeldende status per krav» rett under banneret, f.eks. `FR-6 | endret 2026-10-28 | se sprint-change-proposal §X | gjeldende tekst: …`. Oppdater `updated`, og vurder `status: final` til dere har gjort avstemmingen.

### 4.2 «Alvorlig TG3» er ikke definert i PRD-en
- **Alvorlighet:** høy
- **Hvor:** Begreper: «et TG3-funn som fortsatt skaper vesentlig usikkerhet … etter briefens regler»; brukt ca. 12 ganger i FR-5, FR-11, FR-16.
- **Problem og hvorfor det betyr noe:** Hele Forkast/Innhent-logikken hviler på begrepet, men en tester eller utvikler kan ikke avgjøre ut fra PRD-en hvilke TG3-funn som er «alvorlige». Uten det kan ikke RT-13 og AT-7–AT-9 skrives uten å lese briefen.
- **Forslag:** Skriv regelen inn i begrepet, f.eks.: «I v1 regnes hvert TG3-funn som alvorlig, med mindre …» (hent den faktiske regelen fra briefen og gjengi den). Legg til én testlinje for et TG3-funn som ikke er alvorlig, hvis slike finnes.

### 4.3 Lengde, gjentakelser og prosessstoff i kravteksten
- **Alvorlighet:** medium
- **Hvor:** «Dokumentfeil/analysefeil gir Innhent mer informasjon» står i FR-9 pkt. 4, FR-11 pkt. 4, FR-13 pkt. 5–6, FR-16 pkt. 2 og FR-18 pkt. 3; hver kravgruppe har også «Status: godkjent av …» og «Kilde:»-avsnitt.
- **Problem og hvorfor det betyr noe:** Når samme regel står fem steder, må alle oppdateres ved endring (jf. 4.1), og stories får overlappende akseptansekriterier.
- **Forslag:** Definer prioritet 1 én gang (FR-16) og skriv i de andre kravene: «Se prioritet 1 i FR-16». Flytt status- og kildelinjer til `.memlog.md` eller addendum.

### 4.4 Kostnad og feilgrenser for live KI er utsatt
- **Alvorlighet:** medium
- **Hvor:** «Testgrunnlag»: «modell, prisgrunnlag, estimert kostnad … avklares» og «Avklaringsstatus»: «Ingen åpne produktspørsmål».
- **Problem og hvorfor det betyr noe:** Arkitektur må vite om det finnes en kostnadsgrense per analyse og hvor lenge appen venter før «analysefeil». Uten tall kan ikke «avbrutt analyse» (FR-9 pkt. 3) testes.
- **Forslag:** Legg til to målbare krav, f.eks. FR-6 pkt. 6: «Analysen avbrytes og gir analysefeil etter 300 sekunder uten svar» og «Estimert kostnad per 30-siders rapport dokumenteres før første live-kjøring; kjøringer stoppes ved [beløp] kr totalt» (tallene er forslag, sett egne). Før dem opp som åpne spørsmål med eier og frist.

### 4.5 Testutvalget for S2 og S5 er ikke definert
- **Alvorlighet:** medium
- **Hvor:** «Testgrunnlag»: «Minst F1–F4»; S2 («minst 90 % av TG2»).
- **Problem og hvorfor det betyr noe:** F1–F4 er finanscaser definert i briefens addendum, og PRD-en sier ikke hvor mange rapporter eller TG2/TG3-funn som inngår. Med få funn avgjør ett oversett TG2 om S2 består, og medianer over fire målinger sier lite.
- **Forslag:** Legg en liten tabell F1–F4 (verdier og forventet anbefaling) i PRD-en, og angi minste utvalg, f.eks. «minst 3 rapporter med til sammen minst 10 TG2 og 2 TG3», slik RT-16 allerede antyder.

## 5. Mekaniske funn

- ID-ene FR-1–FR-18, NFR-1–NFR-5, S1–S6, UJ-1 og K1–K3 er sammenhengende, og krysshenvisningene (også lenkene i banneret) løser seg.
- Det finnes ingen `[ASSUMPTION]`-tagger; dokumentet sier eksplisitt at ingen antakelser er brukt. Det er troverdig, men kostnad og modellvalg (4.4) er i praksis antakelser.
- Mindre begrepsdrift: «funnliste» / «gjeldende liste» / «rapportgrunnlag», «kritisk informasjon» / «kritisk grunnlag» og «avklaringsstatus» / «TG3-avklaring» brukes om nært beslektede ting. Velg ett begrep per ting i Begreper.
- Bare én brukerreise (UJ-1). Det passer produktet, men feilforløpene ligger som egne avsnitt og kunne vært egne korte scener.

## 6. Før dere går videre

**Må avklares før UX, arkitektur og epics:**
- Hvilke krav gjelder etter retningsendringen 2026-10-28 (4.1).
- Definisjon av «alvorlig TG3» (4.2).
- Timeout og kostnadsramme for live KI (4.4).

**Kan vente:** utvalgsstørrelse for evaluering (4.5), opprydding i gjentakelser (4.3) og begrepsdrift.

**Oppfølging av briefen-tilbakemeldingen: ja.** Scope er snevret kraftig inn (ett objekt, én PDF, fire nøkkeltall, tre anbefalinger), formler og regler er fastsatt med fasit, demomodus uten nøkkel er et eget krav (NFR-3), og suksesskriteriene er målbare. Det som mangler fra briefen-tilbakemeldingen er en kort omtale av hva investoren bruker i dag og hvorfor dette er bedre. PRD-en sier bare at fortrinn «skal evalueres».

## 7. Refleksjonsspørsmål

1. FR-ene er svært detaljerte. Hvilke av kriteriene kom fra dere selv (f.eks. 90 %-terskelen eller grensetilfellene i BT-8), og hvilke godtok dere fra KI-forslag? Hvordan kontrollerte dere at de ikke motsier hverandre?
2. Når retningen endret seg 28. oktober, hvordan avgjorde dere hva som skulle endres i PRD-en og hva som skulle bevares som historikk? Hva ville gjort det lettere for en ny leser å se forskjellen?

_Vurdert mot kvalitetsrubrikken i bmad-prd. Dette er veiledning, ikke sensur._
