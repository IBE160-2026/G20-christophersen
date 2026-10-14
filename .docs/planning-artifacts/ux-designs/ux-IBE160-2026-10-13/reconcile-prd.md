# Kildeavstemming mot ferdigstilt PRD

Dato: 2026-10-13. Kontrollert mot [PRD](../../prds/prd-IBE160-2026-10-10/prd.md), [PRD-addendum](../../prds/prd-IBE160-2026-10-10/addendum.md), kilde-/beslutnings-/revisjons- og sluttkontrollene i samme kjøring, samt gjeldende [DESIGN.md](DESIGN.md), [EXPERIENCE.md](EXPERIENCE.md) og [.memlog.md](.memlog.md). Det tidligere [uttrekket av hele PRD-kjøringen](.working/kildeuttrekk-prd.md) er brukt; ingen ny PRD er skrevet.

Dette er BMAD Finalize sin påkrevde kildeavstemming, ikke den valgfrie Reviewer Gate, et ad hoc-review eller bevis på implementert kvalitet. PRD og addendum har `status: final`; UX-spines har `status: draft`. Ingen oppstrømsfil, peer-spine eller beslutningslogg er redigert gjennom denne kontrollen.

**Konklusjon:** Ingen reell kildekonflikt, droppet kvalitativ produktføring, scope-utvidelse eller endring i finans-/anbefalingsregler er identifisert. UX konkretiserer godkjente brukerbeslutninger innen PRD-ens åpne designrom. Mindre desktop-/PDF-fallback og merkede forslag A1–A5 er fortsatt åpne draft-valg, ikke avvik som løses ved å endre produktgrunnlaget.

## Presedens og kildekontroller

PRD «Kildegrunnlag» (linje 18–26) og «Formål og arbeidsstatus» (10–16) har forrang som gjeldende produktkontrakt. Senere godkjente PRD-presiseringer konkretiserer revidert brief/oppfølgingen 2026-10-08; eldre forslag og erstattet tallfasit gjeninnføres ikke. Kontrollfiler er prosessbevis, ikke nye kravkilder.

| Kontrollgrunnlag i PRD-kjøringen | Hva som er videreført i UX |
|---|---|
| [Beslutningsavstemming](../../prds/prd-IBE160-2026-10-10/beslutningsavstemming.md) og [.memlog.md fra PRD](../../prds/prd-IBE160-2026-10-10/.memlog.md) | Godkjenningene, all-TG-uttrekk, separat TG3-avklaring, deterministisk kodebegrunnelse og avklarte tidsmålepunkter beholdes. UX påstår ikke at FR-1–FR-4 fikk en separat godkjenning eller at produktet er testet. |
| [Brief-avstemming](../../prds/prd-IBE160-2026-10-10/reconcile-brief.md) og [brief-addendum-avstemming](../../prds/prd-IBE160-2026-10-10/reconcile-brief-addendum.md) | Ett objekt, manuelle tall, én rapport, fire finansmål, menneskelig kontroll, tre utfall, merket lokal demo og kilde-/opphavsskille. «Alle eksplisitte TG2/TG3» beholdes foran eldre «relevante». |
| [Revisjonskontroll-avstemming](../../prds/prd-IBE160-2026-10-10/reconcile-revisjonskontroll.md) og [faglærer-avstemming](../../prds/prd-IBE160-2026-10-10/reconcile-faglaerer.md) | Smal sekvensiell v1; finans i kode; egne wireframes; mennesket avgjør videre handling. Historiske agenter/DSCR/score, kostnadsjustert tallfasit eller fri dashboard-flyt gjeninnføres ikke. |
| [Sensor-avstemming](../../prds/prd-IBE160-2026-10-10/reconcile-sensorveiledning.md), [sensoruttrekk](../../prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md) og [kildegrunnlag](../../prds/prd-IBE160-2026-10-10/kildegrunnlag.md) | Konsistens, tydelig navigasjon/tilbakemelding, feil-/tomtilstander, grunnleggende tilgjengelighet og prosesspor. Ingen kursbestemt sertifisering, mobilapp, nye roller eller integrasjoner utledes. |
| [Rubrikk](../../prds/prd-IBE160-2026-10-10/review-rubric.md), [strukturkontroll](../../prds/prd-IBE160-2026-10-10/review-structure.md), [språkkontroll](../../prds/prd-IBE160-2026-10-10/review-prose.md) og [sluttkontroll](../../prds/prd-IBE160-2026-10-10/sluttkontroll.md) | Stabile ID-er, alle aktive funn i resultatgrunnlaget, juridisk analyse utenfor v1 og UX som senere konkretisering. Rubrikkens historiske `draft`-omtale overstyrer ikke den ferdigstilte PRD-en. |

## UJ og funksjonelle krav

De ordrette kravnavnene nedenfor refererer til PRD, ikke en ny kravdefinisjon. EXPERIENCE.md «Key Flows» gjengir **UJ-1: Mads førstevurderer ett boligutleieobjekt** ordrett, med nummererte steg, klimaks og feilforløp. «Information Architecture» knytter Mads' UI-valg til PRD: Tallgrunnlag og Tilstandsrapport skiller registrering/opplasting, Kontroller funn dekker kontrollen, og Resultat samler kodeberegning/anbefaling. Fire UI-trinn endrer ikke PRD-ens sekvensielle produktflyt.

| Ordrett navn fra PRD | Konkret UX-dekning |
|---|---|
| FR-1: Registrere finansverdier for ett objekt | EXPERIENCE Foundation/IA og `value-field`/`period-control`; DESIGN Components. Manuelle P/L/D/J/Ymin, enheter og årsgrunnlag arves fra PRD. |
| FR-2: Synliggjøre kilder, forutsetninger og kostnadsinnhold | `source-note`, `cost-breakdown`, `financial-confirmation`, `basis-detail`; kildekonflikt og dobbelttelling behandles synlig. |
| FR-3: Validere tall og skille null fra manglende verdi | Voice and Tone, Tallgrunnlag-tilstander og `value-field`; blank/ugyldig/ubekreftet null er ulike opplysninger. |
| FR-4: Kontrollere og bekrefte tallgrunnlaget | `financial-confirmation`, IA og Key Flow 1. Registrering er ikke bekreftelse; hovedanalyse starter etter gyldig bekreftet tallgrunnlag. |
| FR-5: Registrere og anvende brukerbekreftet TG3-avklaring | `tg3-resolution`, Key Flow 2 og TG3-tilstander. Eksplisitt status + begge tekstgrunnlag, ingen ekstern verifisering, opprinnelig grad/funn beholdes. |
| FR-6: Analysere én støttet tilstandsrapport | `report-input`, `analysis-status`, Tilstandsrapport-tilstander og Key Flows 1/4. Én tekstbasert PDF ≤30 sider, eksplisitt kall, gjenbruk og lagret demo. |
| FR-7: Trekke ut alle eksplisitte TG2- og TG3-funn | `finding-list` og Key Flow 1. Ingen relevansfiltrering, ny teknisk grad, finansutfylling eller reparasjons-/juridisk/markedsanalyse. |
| FR-8: Vise kilde og gjøre originalrapporten tilgjengelig for kontroll | `source-note`, `finding-detail`, `pdf-viewer`, Key Flow 1. Dokumentnavn, PDF-filposisjon fra 1 og samtidig originalkontroll; automatisk side er valgt UX-konkretisering. |
| FR-9: Synliggjøre usikkerhet og ufullstendig analyse | `issue-message`, `analysis-status`, relevante State Patterns og Key Flow 4. Feil/delresultat/tom vellykket liste er atskilt; manglende kilde/side gjettes ikke. |
| FR-10: Korrigere eller avvise KI-funn med bevart opprinnelse | `finding-actions`, `finding-edit`, `origin-detail`, Key Flow 2. Korrigering mot original; Avvis gjelder KI-feil; originalen overskrives ikke. |
| FR-11: Bekrefte gjeldende rapportgrunnlag før screening | `list-confirmation`, IA, Key Flows 1–2 og ubekreftet/endret-listetilstander. Per-funn Bekreft erstatter ikke separat gjeldende listebekreftelse eller TG3-avklaring. |
| FR-12: Beregne de fire låste økonomiske nøkkeltallene | `metric-grid`, Key Flow 1 og arvet PRD-definisjon. Ingen nye finansmål/formler/fratrekk; kode gjør beregningene og negative resultater beholdes. |
| FR-13: Vise bare beregninger med gyldig grunnlag | `metric-grid`, Resultat-tilstander og Key Flow 4. Ikke beregnbart viser konkret årsak; gyldige tall med utilstrekkelig samlet grunnlag er delgrunnlag. |
| FR-14: Gjøre beregninger etterprøvbare og bevare presisjon | `basis-detail`/`detail-disclosure` og DESIGN Typography. Formel/input/perioder/kilde er tilgjengelige; uavrundede regler og synlig forklaring av skjult terskelbrudd beholdes. |
| FR-15: Beregne på nytt etter endret finansgrunnlag | Key Flow 3, Interaction Primitives, `financial-confirmation` og `stale-result`. Ny bekreftelse av endret grunnlag; uendret rapport gjenbrukes uten KI-kall; Ymin endrer regelvurdering, ikke tallene. |
| FR-16: Bestemme én anbefaling med låst regelprioritet | `recommendation`, State Patterns og Key Flows 1/4. Prioritet fra PRD arves; alle utløsere på avgjørende nivå beholdes, også ved svake delberegninger/uavklart TG3. |
| FR-17: Forklare anbefaling, utløste regler og neste handling | Resultats valgte standardhierarki, `recommendation` og Voice and Tone. Kodebestemt begrunnelse/nestehandling, ingen KI-omskriving; Gå videre er grundigere vurdering, ingen kjøpsbeslutning. |
| FR-18: Presentere et sammenhengende og gjeldende beslutningsgrunnlag | IA, `basis-detail`, `origin-detail`, `status-label`, `stale-result`, Key Flows 1/3. Gjeldende objekt/grunnlag, alle aktive funn og opphav tilgjengelig, mangler beholdes, gamle resultater bare historisk. |

## Kvalitetskrav og suksesskriterier

| Ordrett navn fra PRD | UX-behandling og grensene for denne kontrollen |
|---|---|
| NFR-1: Stabilitet og etterprøvbar regelkjøring | Gyldighet ved retur/endring, gjeldende/stale-skille og kodebasert resultat er bevart. Faktisk gjentatt regelkjøring er senere produktverifikasjon. |
| NFR-2: Forståelig desktop-flyt og grunnleggende tilgjengelighet | Stepper, etiketter/enheter, tekstlige statuser, synlig fokus, tilgjengelig PDF-/detaljkontroll og DESIGN-kontrast. Numeriske mål er konkret UX-arbeid, ingen standardsertifisering. |
| NFR-3: Lokal kjørbarhet og kostnadsfri demo | Offline-rader og Key Flow 4 bevarer lagret merket uttrekk og aktive kodeberegninger uten nøkkel/nett. README/ren installasjon/annen persons kjøring er arvet senere bevis, ingen ny UX-funksjon. |
| NFR-4: Hemmeligheter og testdata | Live-nøkkel vises ikke; prøver er konstruerte/fiktive og ikke faktiske analyser. Publiserings-/repo-/historikkkontroll av reelle dokumenter er arvet leveransearbeid, ikke innebygd personvernadministrasjon. |
| NFR-5: Tidsbruk i førstevurderingen | Fullført analyse betyr synlig ferdig liste; kontroll inkluderer korrigering/avvisning, TG3-status og listebekreftelse. Ingen hurtigflyt hopper over kontroll, og ingen timer-/telemetrifunksjon er lagt til. |
| S1: Beregninger | PRD-toleranser og uavrundet regelpresisjon arves; basis åpnes for kontroll. Tallformat A5 er deklarert forslag, ingen ny terskel eller toleransemargin. |
| S2: Dokumentfunn | Alle eksplisitte TG2/TG3 omfattes; opprinnelig KI-uttrekk bevares atskilt fra rettinger. Testutvalgets 90 %-minimum tolkes ikke som filtreringsadgang eller generell kvalitetspåstand. |
| S3: Mangler og regler | Feil-/mangelvarianter, uavklart TG3, utilstrekkelig delgrunnlag og anbefalingsprioritet er bevart. Ingen appregel endres av lokale feilvisninger eller behovsåpning. |
| S4: Sporbarhet i resultatet | Kilder/PDF-side, brukerforutsetninger, originalt KI-funn, brukerendring og TG3-avklaring er adskilt. Behovsåpning gjør ikke opplysningene utilgjengelige. |
| S5: Tidsbruk | Måleprotokoll og fastsatte medianmål arves fra PRD/addendum. Designet påstår ingen målte tider; demo er ikke live-tidsbevis. |
| S6: Kjørbarhet | Merket lokal demo støtter samme brukerreise uten live-avhengighet. En annen persons faktiske README-/testkjøring er ikke levert gjennom UX. |

## PRD-addendum og kvalitative føringer

PRD-addendumets sju FR-5-eksempler og RT-1–RT-19, BT-1–BT-18, AT-1–AT-20 og TT-1–TT-9 er fortsatt kravfasit ved referanse. De er ikke omskrevet til en ny UX-fasit eller påstått kjørt. F4-prøven er merket som konstruert PRD-referanse; dens økonomi/påviste Uavklart-forhold er ingen ny analyse.

- **Etterprøving fremfor oppdiktet sikkerhet:** kilder, aktuelle verdier, originalrapport, KI-usikkerhet og brukerendringer er tilgjengelige. Mads kan forstå anbefalingen uten detaljer og etterprøve hele grunnlaget ved behov.
- **Menneskelig kontroll og beslutning:** uttrekkskontroll, alvorlig TG3-avklaring og listebekreftelse holdes separate. Uavklart TG3 kan bestå etter fullført kontroll; ingen teknisk godkjenning, utbedringspåstand, kjøpshandling eller automatisk oppfølging er lagt til.
- **Feil er eget grunnlag:** lokal plassering forklarer problemet uten Resultat-omvei. Et vist Resultat samler alle faktiske blokkere, ikke bare første feil. Feil/delanalyse er aldri vellykket tomliste.
- **Gjeldende versus historisk:** Mads' dempede historiske resultatvalg følger FR-18 fordi tidligere anbefaling ikke brukes for nye verdier. Det gjelder siste resultat i aktuell vurdering, ikke varig historikk eller saksbehandling.
- **Langsiktig profesjonalitet uten v2-scope:** rolig lys grafitt/petrol er brukerens visuelle valg, ikke en ny PRD-premiss. Ingen portefølje, markedsagent, samarbeid, ekstra dokumenttype, score eller ny finansmodell er synliggjort som v1-funksjon.

Ingen av disse kvalitative ideene er droppet. Nye UI-valg er forankret i gjeldende UX-memlog: firetrinns-navigasjon, samtidig PDF/automatisk side, historisk utdatert resultat, palett og de endelige lokale-feil-/behovsåpningsbeslutningene.

## Åpne gjennomføringsvalg uten kildeavvik

**OPEN UX-C** gjelder mindre desktop-vinduer, panelandel/breakpoint og mulig PDF-panelfallback. **A1–A5** gjelder eksakt typografi, geometri, valideringstidspunkt, fokusforløp og tallformat. De står tydelig som åpne/forslag; ingen er behandlet som godkjent skjult produktkrav eller løst ved kildeendring. De må triageres før UX-spines ferdigstilles.

De er gjennomføringsvalg innen PRD «Avklaringsstatus og videre gjennomføringsarbeid», linje 477–486. Modeller/kostnader før betalte tester, arkitektur, PDF-fixtures, faktisk evaluering og README-kjørbarhet er fortsatt andre faser. Denne avstemmingen starter ingen av dem og identifiserer ingen nødvendig endring i final PRD.
