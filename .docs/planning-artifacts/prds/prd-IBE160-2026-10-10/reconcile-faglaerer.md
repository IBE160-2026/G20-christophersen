# Sluttavstemming mot faglærerens tilbakemelding

Dato: 2026-10-10. Kilde: [faglærerens tilbakemelding 2026-10-06](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md), lest sammen med gjeldende [brief](../../briefs/brief-IBE160-2026-09-15/brief.md), [revisjonskontroll og oppfølging 2026-10-08](../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md), [PRD](prd.md), [PRD-addendum](addendum.md) og senere brukerbeslutninger i [.memlog.md](.memlog.md).

**Resultat:** Ingen reelle kravhull, interne produktmotsigelser eller scope-glidning funnet. Faglærerens nødvendige planendringer er videreført i PRD-en. Faktisk design, implementering og evaluering er fortsatt fremtidig arbeid og er ikke fremstilt som levert. Ingen endring i PRD foreslås.

Tilbakemeldingen vurderte en tidligere, bredere brief ved commit `3ac6267`. Beskrivelsene av sju agenter, DSCR, score og fire risikoområder er historiske problemfunn, ikke gjeldende krav. Gjeldende brief og produkteierens oppfølging har forrang. Godkjent uttrekk av alle eksplisitte TG2/TG3 og konkrete S5-målepunkter følger senere PRD-beslutninger.

| Tilbakemeldingspunkt | Behandling i gjeldende kravgrunnlag |
|---|---|
| Smalere v1 med tre steg og sekvensiell pipeline | Scope og UJ-1 viderefører manuelle tall → én rapportanalyse → kodebasert finans og anbefaling. Ingen agentrammeverk, sourcing, Market Agent, score eller stresstesting. |
| Behold tre anbefalinger, menneskelig kontroll og ingen automatisk budgivning | FR-4/FR-5/FR-10/FR-11/FR-16–FR-18; brukeren kontrollerer grunnlaget og velger videre handling. Gå videre er ingen kjøpsanbefaling. |
| Fastsett formler, kritiske felt, regler og kjent regnefasit før PRD | Begreper, FR-1–FR-5/FR-12–FR-17, BT-1–BT-18 og AT-1–AT-20. Gjeldende låste formler brukes; historisk omkostningsjustert tallfasit er ikke gjeninnført. |
| Finans i vanlig kode, ikke språkmodellen | FR-12–FR-17 og NFR-1. Også regelbegrunnelsen er deterministisk kode; KI brukes til uttrekk. |
| Kilder, fakta/antakelser/usikkerhet, ingen oppdiktede opplysninger eller dobbelttelling | FR-2/FR-7–FR-14/FR-18, S2–S4 og RT/BT-testeksemplene. Opprinnelig KI-funn og brukerendring skilles. |
| Målbare kriterier og separat KI-evaluering | S1–S6 med toleranser, dokumentfasit, regelvarianter, målepunkter og lokale kjørbarhetsbevis. Minst F1–F4 planlegges; live-evaluering skilles fra lagret demo og kode-/regeltester. |
| Konkret primærbruker og reelle behov | Visjon/målgruppe og bekreftet UJ-1: privat investor med økonomisk forkunnskap, uten bygningsfaglig kompetanse, som vurderer ett allerede funnet objekt. |
| Nøktern differensiering fra regneark, chatboter og rådgivere | Løst i briefens «What Makes This Different»; PRD viderefører sporbarhet, etterprøvbar økonomi og konsekvent usikkerhetshåndtering som verdi. Tids-/kvalitetsgevinster er evalueringsmål, ikke beviste fordeler. |
| Riktig emnekontekst; ikke utilgjengelig konseptvideo | PRD angir IBE160 og har ingen videobasert produktpremiss. Brukerreisen er beskrevet med egne ord. Egne skisser er eksplisitt videre UX-arbeid, i samsvar med brukerens stopp før UX. |
| Lokal kjørbarhet uten gruppens nøkkel, betaling eller særskilt infrastruktur | FR-6/FR-15/FR-18, NFR-3 og S6: merket demo med lagret uttrekk og aktive kodeberegninger, oppskrift og lokal verifikasjon fra annen person planlagt. |
| Plan for API-kostnader, gjenbruk og mock | FR-6/FR-15: ett eksplisitt kall per ny rapport, ingen automatiske omkjøringssløyfer og gjenbruk av uendret rapport. Modell, pris og prosjektbudsjett skal avklares før betalte tester. Demo er kostnadsfri og dokumenterer ikke live-kvalitet. |
| Uleselige PDF-er, filhåndtering og analysefeil | FR-6/FR-8/FR-9/FR-11 og RT-2/RT-9/RT-19. Tekstbasert PDF ≤30 sider, ingen OCR; feil eller delanalyse gir ikke vellykket tom liste eller komplett screeninggrunnlag. |
| Grunnlag for kvalitetssikring, UX, arkitektur, README og ryddig repo | NFR-1–NFR-4, stabile krav-/test-ID-er, testgrunnlag og prosessbevis. Fixtures og evalueringsbevis har planlagt plassering; hemmeligheter og private originaler holdes utenfor Git. |
| Synlig utviklingsprosess og trace fra brief til kode | Kildekoblinger, UJ–FR-koblinger, NFR-kilder, S1–S6 og memlog gir planlagt videre sporbarhet. Faktiske tester, senere commits og kode-/storykoblinger er løpende gjennomføringsarbeid, ikke påstått utført. |

Faglærerens forslag om egne wireframes og begrunnet teknologistakk er fortsatt relevant, men hører til neste autoriserte design-/arkitekturfase. Faktiske PDF-fixtures, maskinlesbar fasit, lokale produkttester, live-evaluering, README-verifikasjon og tidsmålinger gjenstår. Dette er ingen uløste produktbeslutninger som blokkerer ferdigstilling av PRD-en.
