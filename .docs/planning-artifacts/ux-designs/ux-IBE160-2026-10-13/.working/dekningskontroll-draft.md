# Proaktiv dekningskontroll — draft-spines

Dato: 2026-10-13. BMAD UX Finalize, Pass 1 som del av destilleringen. Dette er mekanisk kilde-/dekningskontroll, ikke den valgfrie Reviewer Gate, et eksternt review eller test av implementert produkt. Ingen kritikkagenter er startet.

Kontrollert [DESIGN.md](../DESIGN.md) og [EXPERIENCE.md](../EXPERIENCE.md) mot siste [.memlog.md](../.memlog.md), [brukersvar](brukeravklaringer.md), kildeuttrekkene, valgt palett og arbeidsartefaktene. Begge har `status: draft`. De endelige UX-svarene om lokale feil og behovsåpnete detaljer er innarbeidet; ingen OPEN UX-A/B står igjen.

## 1. Flow coverage

EXPERIENCE.md har fire navngitte Mads-forløp, alle med nummererte steg, et eksplisitt klimaks og feilforløp. Kildenavnet **UJ-1: Mads førstevurderer ett boligutleieobjekt** er gjengitt ordrett. UI-oppdelingen Tallgrunnlag → Tilstandsrapport → Kontroller funn → Resultat kobles eksplisitt til PRD-ens logiske steg, uten endring i sekvens, regler eller scope.

Kravnavnene nedenfor er hentet ordrett fra PRD; kolonnen kobler dem til Key Flows og til kontraktkomponenter. Kravinnhold/finansfasit kopieres ikke på nytt til spines. Dette er én produktreise med kontroll-/retur-/feilvarianter, ikke nye produktkrav.

| Kravnavn fra PRD | Opplevelsesdekning |
|---|---|
| FR-1: Registrere finansverdier for ett objekt | Flow 1, steg 1 |
| FR-2: Synliggjøre kilder, forutsetninger og kostnadsinnhold | Flow 1, steg 1/4; source-note og cost-breakdown |
| FR-3: Validere tall og skille null fra manglende verdi | Flow 1, steg 1/feil; flow 4 |
| FR-4: Kontrollere og bekrefte tallgrunnlaget | Flow 1, steg 1; financial-confirmation |
| FR-5: Registrere og anvende brukerbekreftet TG3-avklaring | Flow 2, steg 3/feil; flow 1, steg 3 |
| FR-6: Analysere én støttet tilstandsrapport | Flow 1, steg 2; flow 4 |
| FR-7: Trekke ut alle eksplisitte TG2- og TG3-funn | Flow 1, steg 2–3; finding-list |
| FR-8: Vise kilde og gjøre originalrapporten tilgjengelig for kontroll | Flow 1, steg 3; flow 2, steg 1–2 |
| FR-9: Synliggjøre usikkerhet og ufullstendig analyse | Flow 1, feil; flow 4, steg 2–4/feil |
| FR-10: Korrigere eller avvise KI-funn med bevart opprinnelse | Flow 2, steg 2 |
| FR-11: Bekrefte gjeldende rapportgrunnlag før screening | Flow 1, steg 3/feil; flow 2, steg 3/feil |
| FR-12: Beregne de fire låste økonomiske nøkkeltallene | Flow 1, steg 4; metric-grid |
| FR-13: Vise bare beregninger med gyldig grunnlag | Flow 1, feil; flow 4, steg 3; metric-grid |
| FR-14: Gjøre beregninger etterprøvbare og bevare presisjon | Flow 1, steg 4; basis-detail/detail-disclosure |
| FR-15: Beregne på nytt etter endret finansgrunnlag | Flow 3, steg 2–4 |
| FR-16: Bestemme én anbefaling med låst regelprioritet | Flow 1, steg 4/feil; flow 4, steg 3–4 |
| FR-17: Forklare anbefaling, utløste regler og neste handling | Flow 1, steg 4; recommendation |
| FR-18: Presentere et sammenhengende og gjeldende beslutningsgrunnlag | Flow 1, steg 4; flow 3 |
| NFR-1: Stabilitet og etterprøvbar regelkjøring | Flow 3; gyldighet og endret/stale-tilstander |
| NFR-2: Forståelig desktop-flyt og grunnleggende tilgjengelighet | Flow 1–4; Accessibility Floor og fokus-/feiltilstander |
| NFR-3: Lokal kjørbarhet og kostnadsfri demo | Flow 4, steg 1/4; offline-rader |
| NFR-4: Hemmeligheter og testdata | Flow 4; Foundation/app-header/live-feil uten nøkkelvisning |
| NFR-5: Tidsbruk i førstevurderingen | Flow 1, steg 2–3; flow 4 henviser S5 til PRD/addendum |
| S1: Beregninger | Flow 1, steg 4; flow 3; presisjonsforslag A5 må triageres |
| S2: Dokumentfunn | Flow 1, steg 2–3; flow 2 bevarer opprinnelig KI-funn |
| S3: Mangler og regler | Feilforløp i flow 1–4 og prioritet etter PRD |
| S4: Sporbarhet i resultatet | Flow 1, steg 3–4; flow 2; kilde-/opphavskomponenter |
| S5: Tidsbruk | Flow 1, steg 2–3; evalueringsprotokoll arves, ingen timerfunksjon |
| S6: Kjørbarhet | Flow 4; lokale demo-/offline-tilstander |

Mekanisk resultat: ingen manglende navngitt brukerreise eller ukoblet FR. NFR/S er støttet av flyt/tilstand og arvet evalueringsgrunnlag; faktisk kvalitet, kjørbarhet og tidsmål er ikke påstått verifisert.

## 2. Token completeness

YAML-frontmatter er faktisk tolket med Ruby/Psych safe_load (systemets Python har ikke PyYAML). 17 flate kebab-case-fargetokens har gyldige seks-tegns hex-verdier. De valgte fargene svarer til alternativ 2; hvit `on-accent` følger den valgte primærknappen. Lys modus er eneste scope, så mørke par er ikke manglende tokens.

Det finnes 6 typeroller, 5 radier, 13 spacing-tokens og 26 komponentobjekter. Alle **28 unike tokenreferanser** i frontmatter/prose og EXPERIENCE.md slår opp i DESIGN.md; ingen udefinerte referanser eller cycles ble funnet i komponentenes referanser. Alle 8 `sources` i hvert peer-dokument og alle lokale dokument-/artefaktlenker løser.

Lastbærende kontrastmål og faktiske par står i DESIGN.md Colors (linje 207). Valgt prøves svakeste vanlige tekstpar er 5,2061:1, statuspar ≥6,1489:1, fokus ≥5,8590:1 og kontrollkant ≥3,3314:1. Praktiske mål er ≥4,5:1 for informasjonstekst og ≥3:1 for nødvendig kontroll/fokus; ingen kurssertifisering påstås. Typografi/geometri A1/A2 og tallformat A5 er forslag, ikke brukerbekreftede fakta.

Mekanisk resultat: ingen farge-, token- eller referansemiss. Åpne/foreslåtte valg er eksplisitte og skal triageres før endelig kontrakt.

## 3. Component coverage

DESIGN.md Components (linje 260) og EXPERIENCE.md Component Patterns (linje 61) har begge samme **26 komponent-ID-er** som frontmatter. Hver har en konkret visuell og atferdsmessig rad. Nødvendig detail-disclosure er lagt til etter Mads' endelige valg om behovsåpning; den har både tokenobjekt og peer-rader.

Kontrollene for enkeltfunn, alvorlig TG3 og gjeldende liste er forskjellige komponenter/kontrakter. Originalt KI-funn og brukerendring forblir tilgjengelig; Avvis betyr KI-feil, ikke teknisk avklaring. Det finnes ingen kjøp-/bud-/investeringsbeslutningsknapp og ingen ny varig historikkfunksjon.

Mekanisk resultat: ingen komponent med manglende peer-rad eller tokenobjekt.

## 4. State coverage

EXPERIENCE.md State Patterns (linje 94) har tilstandsdekning for alle fire IA-flater:

| Flate | Rader | Dekket |
|---|---:|---|
| Tallgrunnlag | 6 | Tomt, faktisk lasting, ugyldig/mangel/konflikt/null, fokus, offline demo, ubekreftet/endret. |
| Tilstandsrapport | 7 | Tomt, faktisk validering/analyse, dokumentfeil, analysefeil/delresultat, fokus, offline/manglende live-konfigurasjon, ny rapport/stale. |
| Kontroller funn | 8 | Fullført tomliste, funn-/PDF-lasting, usikkerhet/kildefeil/ugyldig, fokus, offline, ubekreftet/korrigert/avvist, TG3 Uavklart/ugyldig Avklart, ny rapport/stale. |
| Resultat | 8 | Ikke beregnet/tomt, faktisk kodeventing, utilstrekkelig/ikke beregnbart, rapport-/analysefeil, fokus i behovsåpning, offline demo, utdatert, nytt gjeldende resultat. |

Tillatelsessurface/innlogging er ikke v1-krav. Faktisk filtilgangsfeil behandles som kjent relevant dokument-/visningsfeil; ingen nøkkel eller nye brukerroller eksponeres. Offline demo fungerer, og live uten grunnlag fremstilles ikke som fullført analyse. Historisk resultat bevares lesbart og inaktivt for nye verdier.

Mekanisk resultat: ingen IA-flate uten tom-/last-/feil-/fokus-/offline-/gyldighets-/stale-behandling når relevant. Smalere desktop-/PDF-fallback er fortsatt en åpen designbeslutning, ikke et skjult valgt breakpoint.

## 5. Visual reference coverage

Arbeidsartefakter er ikke promotert ved denne draft-destilleringen. Nåværende innhold i endelige artefaktmapper: `mockups/` 0 filer, `wireframes/` 0 filer og `imports/` 0 filer. Det finnes derfor ingen ulenket import/promotert mock eller wireframe.

De relevante `.working`-artefaktene er lenket inline med formål: color-themes-1.html **alternativ 2** for valgt visuell retning; valgt-palett.json for hexene; fargekontraster-1.json/tilgjengelighetsgrunnlag.md for dokumentasjon; Excalidraw og SVG for firetrinns flyt og PDF-kontroll. Andre paletter er eksplisitt uvalgte. Spines-win-on-conflict er sagt én gang i DESIGN.md. Geometri i wireframe og numeriske prøvedetaljer er ikke fremstilt som brukerbekreftet.

Mekanisk resultat: ingen lokal lenkefeil eller orphan blant tilgjengelige relevante keeper-referanser. Finalize har fortsatt senere promotering og key-screen/mocked-vs-spine-only-avklaring; denne kontrollen påstår ikke at de er utført.

## Reelle åpne valg og antakelser til triage

- **OPEN UX-C:** mindre desktop-bredde, panelandel/breakpoint og konkret PDF-fallback. Eget PDF-panel er kun en nevnt mulighet. Root avventer et konkret brukersvar; intet er valgt her.
- **ASSUMPTION A1:** lokale systemfontroller og eksakte størrelser/vekter/linjeavstander.
- **ASSUMPTION A2:** 4-baserte avstander, kontrollhøyde, radier og 2 px fokus med 3 px lys avstand; ingen tallfestet vindusgrense eller PDF-andel.
- **ASSUMPTION A3:** konkret valideringstidspunkt ved eksplisitt kontroll-/analyseforsøk; ingen modale avbrudd mens tall tastes.
- **ASSUMPTION A4:** fokus på overskrift ved trinnbytte/første feilfelt, og beholdt fokus ved funnvalg mens PDF-side skifter.
- **ASSUMPTION A5:** norske skilletegn, heltallsbeløp og tre normale yielddesimaler, med nødvendig ekstra presisjon ved terskelbrudd/fasitkontroll. Ingen endring i uavrundede regler.

Dette er bevisst merkede draft-valg. De er ikke mekaniske mangler eller krav om nytt v1-scope. Root/Mads triagerer dem før finalisering. Lokale feil/mangler og Resultats standard behovsåpning er nå **valgt**, og står ikke som åpne punkter.

## Form og arbeidsgrense

DESIGN.md har de åtte kanoniske seksjonene i riktig rekkefølge. EXPERIENCE.md har alle åtte obligatoriske seksjoner samt utløste Responsive & Platform og Inspiration & Anti-patterns, plassert som i BMAD-eksemplet før Key Flows. Sources arves ved referanse. Norsk prose; stabile opphavsbegreper og nøyaktige trinn-/UJ-navn.

Denne oppgaven har skrevet draft-spines og dette kontrollnotatet. Memlog, mottatte brukeravklaringer, valgt palett og oppstrøms kilder er ikke redigert. Ingen arkitektur, UI-bibliotek, stakk, epics, stories eller implementering er startet. Reviewer Gate er ikke gjennomført; dette er den påkrevde proaktive Pass 1-destilleringen.
