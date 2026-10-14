# UX-kontroll — samsvar med låst PRD og brukerbeslutninger

Dato: 2026-10-13. Valgt linse i BMAD UX Reviewer Gate. Kontrollert gjeldende [DESIGN.md](DESIGN.md) og [EXPERIENCE.md](EXPERIENCE.md), begge `status: draft`. Linjenumre viser versjonen lest i denne kontrollen. Ingen spine, kilde eller beslutningslogg er redigert.

## Verdict

**Adequate.** Ingen faktisk scope-utvidelse, finansendring, endret anbefalingsprioritet eller tilsidesatt brukerbeslutning er funnet. To UX-overganger er likevel for uklart beskrevet for en ferdig atferdskontrakt: endring av separat TG3-avklaring etter Resultat og hvor selve mangelutfallet vises når førstegangsgrunnlaget blokkerer neste trinn. Begge kan konkretiseres innen eksisterende PRD og brukerens valgte lokale feilvisning.

**Funn:** critical 0 · high 0 · medium 2 · low 0. Dette er kontroll av dokumentene, ikke verifikasjon av en implementert app.

## Kontrollgrunnlag og presedens

- [Final PRD](../../prds/prd-IBE160-2026-10-10/prd.md), l. 1–26, og [final PRD-addendum](../../prds/prd-IBE160-2026-10-10/addendum.md), l. 1–10, er gjeldende produktkontrakt. Senere PRD-presiseringer går foran eldre «relevante funn» og historisk bredere scope.
- [Product Brief](../../briefs/brief-IBE160-2026-09-15/brief.md), l. 28–65/84–94, og [brief-addendum](../../briefs/brief-IBE160-2026-09-15/addendum.md), l. 5–25/58–81/83–103, er kontrollert direkte. [Revisjonskontroll](../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md), l. 71–98, overstyrer den tidligere tallfasiten i l. 56–58.
- [Faglærerens tilbakemelding](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md), l. 16–25/70–73/98–104, behandles gjennom revidert brief/final PRD. Den historiske agent-/dashboardomtalen gir ingen nye v1-funksjoner.
- [Brukeravklaringer](.working/brukeravklaringer.md), l. 13–43/53–94/104–132/142–310, og [.memlog.md](.memlog.md), l. 7/9–20/22–23, fastsetter kontrollflate, navigasjon, utdatert resultat, grafitt/petrol, lokale feil og behovsåpning. A1–A5 er uttrykkelig fasilitatorvalg; de er ikke påstått som ordrette brukergodkjenninger.
- [PRD-kildeavstemming](reconcile-prd.md), [brief-addendum-avstemming](reconcile-brief-addendum.md), [revisjonsavstemming](reconcile-revisjonskontroll.md), [kildeuttrekk fra brief/faglærer](.working/kildeuttrekk-brief-faglaerer.md) og [sensoruttrekk](.working/kildeuttrekk-sensorveiledning.md) er brukt som prosess-/kryssjekk, ikke nye krav. Sensoruttrekket l. 17/25–39 viser grunnleggende UX/sporbarhet og skiller kursføring fra valgt layout og numeriske designmål.

## Bevarte produkt- og UX-beslutninger

| Tema | Konkret kontraktdekning | Autoritativ forankring |
|---|---|---|
| Låst enkeltobjekt-v1, fire skjermtrinn, ingen fri dashboard-navigasjon | EXPERIENCE l. 22–24/30–39/161; DESIGN l. 244/300 | PRD l. 36–42; UX-memlog l. 7/12 |
| Manuelle tall, synlig kilde/år, null forskjellig fra blank, kostnadsinnhold | EXPERIENCE l. 71–75/100–105/169; DESIGN l. 270–274 | PRD FR-1–FR-4, l. 107–150 |
| Fire kodeberegninger, uavrundede terskler, negative resultater, Ymin endrer ikke nøkkeltall | EXPERIENCE l. 87–89/128/193; DESIGN l. 240/286 | PRD FR-12–FR-15, l. 270–319; addendum BT-1–BT-18, l. 56–73 |
| Kode eier anbefaling, alle utløsere på avgjørende prioritet, ingen KI-omskriving eller kjøpshandling | EXPERIENCE l. 26/86/140; DESIGN l. 285 | PRD FR-16–FR-17, l. 331–356; addendum AT-18–AT-20, l. 98–100 |
| Alle eksplisitte TG2/TG3 i kontrollen og alle aktive tilgjengelige på Resultat | EXPERIENCE l. 43/78/88–89; DESIGN l. 250/277/287 | PRD FR-7, l. 197–207, og FR-18, l. 365; UX-memlog l. 20. Behovsåpning er hierarki, ingen funnfiltrering. |
| Original-PDF samtidig, automatisk riktig filside, hel side og nabosider, originalt KI-funn ved retting | EXPERIENCE l. 73/79–83/135/171; DESIGN l. 278–282 | PRD FR-8/FR-10, l. 209–219/235–246; brukersvar l. 13–43. Valgt kontrollmekanisme konkretiserer FR-8. |
| Enkeltfunnskontroll, separat TG3-status og separat listebekreftelse | EXPERIENCE l. 80/84–85/119/135; DESIGN l. 279/283–284 | PRD FR-5/FR-10/FR-11, l. 158–173/243–258. Uavklart TG3 kan bestå etter kontroll. |
| Finans-/funnendring gjenbruker uendret uttrekk; ny rapport krever ny analyse og ugyldiggjør gammel rapportkontroll | EXPERIENCE l. 76–77/81/112/139/191–196 | PRD FR-6/FR-11/FR-15, l. 193–195/256/315–319; UX-memlog l. 13–14 |
| Gamle resultat bevares historisk, uten aktiv beslutningsklar fremtoning | EXPERIENCE l. 92/127/192–194; DESIGN l. 213/291 | PRD FR-18, l. 367; brukersvar l. 104–132 |
| Lokale feil, kort blokkeroppsummering og behovsåpnet detaljsporbarhet | EXPERIENCE l. 41–43/89–90/123–124; DESIGN l. 250/287–289 | PRD FR-17/FR-18, l. 353/364–368; UX-memlog l. 19–20 |
| Profesjonelt lyst grafitt/petrol-uttrykk, KI som delprosess, ingen v2-funksjoner | DESIGN l. 201/205/209/297–300; EXPERIENCE l. 159–161 | UX-memlog l. 15/18; PRD l. 36–42 |
| Lagret lokal demo skilles fra live, ingen nøkkelvisning eller påståtte produkt-/tidsresultater | EXPERIENCE l. 59/67/77/111/126/144/200–207 | PRD NFR-3–NFR-5, l. 399–427; brief-addendum l. 66–75 |

## Faktiske funn

### PT-1 — medium: TG3-endring etter Resultat mangler eksplisitt gyldighetsovergang

**Sted:** EXPERIENCE `tg3-resolution`, l. 84; `stale-result`, l. 92; Interaction Primitives l. 139; Key Flow 3 l. 191–196. DESIGN `stale-result`, l. 291.

Det er godt beskrevet at finansverdier og endret funnliste gjør forrige resultat historisk, mens TG3-avklaring samtidig er en separat opplysning. Ingen av disse overgangene navngir hva som skjer når bare TG3-status, begrunnelse eller avklaringsgrunnlag endres etter et gyldig resultat. Flow 3s feilforløp omtaler tom TG3-tekst, men ikke den vanlige overgangen Avklart → Uavklart eller øvrig redigering av avklaringen. Kilderegelen er arvet og ikke endret; UX-kontrakten lar likevel denne separate endringstypen falle mellom de beskrevne utløsere.

**Kilde:** PRD FR-5 AK8, l. 173, og FR-18 AK4, l. 367; PRD-addendum FR-5-eksemplet l. 22 og AT-16 l. 96 inkluderer eksplisitt TG3-statusendring.

**UX-fiks:** Navngi TG3-status/begrunnelse/grunnlag som berørt resultatgrunnlag i gyldighetsreglene og en returvariant. Beskriv at gammel anbefaling umiddelbart opphører å være gjeldende, og at kodeutfallet for Uavklart eller ugyldig Avklart er Innhent mer informasjon med funnet navngitt. Bevar gyldige finansverdier og uendret rapportuttrekk; ingen nytt KI-kall eller automatisk ny listebekreftelse innføres bare fordi den separate avklaringen endres. Den nødvendige brukerbekreftelsen følger FR-5, ikke en ny produktregel.

### PT-2 — medium: Selve mangelutfallet har ingen bestemt synlig plass i den sperrede førstegangsreisen

**Sted:** EXPERIENCE IA l. 35/39–41, State Patterns l. 102/108–109/121–124 og Key Flows l. 174/203–204. Arbeidsnotatet [ia-og-navigasjon.md](.working/ia-og-navigasjon.md), l. 22, sier at konkret inngang til delgrunnlag gjenstår. DESIGN l. 250/289.

Mangler vises korrekt lokalt, og fremtidige trinn sperres uten nødvendig grunnlag. Selve kodeanbefalingen Innhent mer informasjon er spesifisert på Resultat, men visningen ved manglende tall eller dokument-/analysefeil beskrives bare med «hvis Resultat vises». Ingen bestemt lokal tilstand sier at utfallet vises i stedet når førstegangsreisen stoppes før Resultat. Uavklart TG3 etter bekreftet kontroll har en tydelig resultatrute; ufullstendige tall og feilet analyse har bare feilruten. Dette er et uavklart UX-ledd, ikke påvist endret regelprioritet.

**Kilde:** PRD FR-3 AK5, l. 139; FR-4 AK4, l. 150; FR-9 AK4, l. 230; FR-16 AK2, l. 338. Addendum RT-19 l. 48 og AT-12/AT-13 l. 92–93 krever Innhent mer informasjon for disse tilfellene. Brukerens valg er lokale feil uten nødvendig Resultat-omvei, UX-memlog l. 19 og brukersvar l. 246–264.

**UX-fiks:** Konkretiser at identifisert ufullstendig kritisk grunnlag gir det kodebaserte utfallet Innhent mer informasjon i det aktuelle trinnet, sammen med lokale konkrete blokkere og nødvendig handling. Forklar at ordinær videregang er sperret, mens dette mangelutfallet fortsatt er synlig. Behold Resultats samlede oppsummering når Resultat faktisk åpnes; ikke innfør en tvungen Resultat-omvei eller godta ufullstendig grunnlag som fullført.

## Kjent Finalize-arbeid — ikke nye funn

- **OPEN UX-C** er bevisst uavklart i DESIGN l. 248 og EXPERIENCE l. 155: relevant mindre desktop-bredde, panelandel og eventuell PDF-fallback krever en reell UX-avklaring. Ingen skjult løsning eller kildeendring er funnet.
- Nøkkelmocks, mock-/spine-only-valg, promotering og `status: final` er senere BMAD Finalize-steg. Manglende ferdigstilling nå er ikke et nytt produktavvik. Valgte palett/skisse er lenket som arbeidsmateriale.
- A1–A5 er allerede triagert i UX-memlog l. 22. Eldre deknings-/avstemmingsnotater omtaler dem fortsatt som forslag; gjeldende spines og logg sier hvem som valgte dem. Dette endrer ingen finans- eller produktregel.
- Arkitektur, epics, stories, implementering, betalte live-tester og faktisk appverifikasjon er fortsatt andre faser og er ikke igangsatt gjennom denne kontrollen.
