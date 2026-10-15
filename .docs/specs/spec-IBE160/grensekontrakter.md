# Datagrunnlag, modulgrenser og gyldighet

Avledet fra spec-beslutningsloggen og adoptert PRD, final UX og AD-1–AD-9. Dette samler eksisterende kontrakter for neste BMAD-fase; konkrete kodeskjemaer eies fortsatt av implementeringen. Begreper og detaljerte akseptansekriterier står i [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md), atferd i [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md) og tekniske regler i [spine](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md).

## Eierskap og logiske objekter

| Grunnlag | Eier og minste betydning | Styrende spor |
|---|---|---|
| Finansverdi | Frontend holder registrert P/L/D/J/Ymin, kilde/brukerforutsetning, enhet, relevant periode/år, kostnadsinnhold, konflikt og bekreftelse. Normalisering bevarer registrert verdi, faktor og anvendt årsverdi. | FR-1–FR-4; AD-2/AD-7 |
| Rapportoriginal | Frontend beholder originalbytes til visning. Backend beregner SHA-256 av mottatte bytes; filnavn alene er ingen identitet eller serversti. PDF-side er filposisjon fra 1, trykt sidetall bare merket tillegg. | FR-6/FR-8; AD-3/AD-4/AD-9 |
| Sidemerket grunnlag | Backend dokumentkomponent leverer én post per posisjon 1..pageCount med tekst og uttrekksstatus. Hele støttede grunnlaget går til adapteren; ingen skjult avkorting, sidefiltrering eller OCR. | FR-6–FR-9; AD-3 |
| Analyseutfall | Versjonert kontrakt med requestId, reportHash, modus og diskriminert completed/failed. Completed har sideantall, funn og eksplisitt usikkerhet/mangler. Failed skiller document/analysis med stabil kode, berørt mål og trygg kjent årsak. | FR-6–FR-9; AD-4–AD-6 |
| Opprinnelig uttrekk | Immutabel original grad, beskrivelse, dokument-/sidekilde og usikkerhet. Uklar grad/kilde/side bevares som usikker kandidat med opphav, aldri gjettet gyldig TG-funn. | FR-7–FR-10; AD-2/AD-4 |
| Brukerkontroll | Enkeltfunnkontroll, korrigeringsutkast, gjeldende brukt korrigering/avvisning og bekreftelse av gjeldende liste er separate. findingId binder representasjonene innen rapportuttrekket; avviste originaler er tilgjengelige og ikke aktive rapportfunn. | FR-10/FR-11; AD-2 |
| TG3-avklaring | Egen brukerstatus, begrunnelse og konkret grunnlag per relevant alvorlig TG3, bundet til rapportforholdet/grunnlaget avklaringen gjelder. Stabil findingId alene overfører ikke avklaring til et annet forhold. | FR-5; AD-2/AD-8 |
| Nøkkeltall | Tilgjengelig verdi med formel/inputgrunnlag eller ikke-beregnbart med årsaker. Gyldigheten avgjøres per nøkkeltall; negativt kodeberegnet resultat er fortsatt et resultat. | FR-12–FR-14; AD-7 |
| Screening og snapshot | Én anbefaling, avgjørende prioritet, alle utløsere på nivået, fast begrunnelse/neste handling. Siste snapshot binder finans-, liste-, TG3- og rapportrevisjon; forskjell gir historisk Utdatert. | FR-16–FR-18; AD-2/AD-8 |

Backend gir dokument-/analyseutfall, aldri finansresultat eller anbefaling. Felles inputvalidering eier gyldighet, årsnormalisering og anvendbarheten til registrert TG3-avklaring; state/UI og screening innfører ingen parallelle lokale tolkninger. Kodekontroll av struktur og kildeidentitet beviser ikke semantisk fullstendighet eller brukerens kontroll.

## Finans og screening

| Nøkkeltall | Gyldige bekreftede input | Formel / enhet |
|---|---|---|
| Bruttoyield | P, L | L/P; prosentvisning × 100 |
| NOI | L, D | L−D; NOK/år |
| Nettoyield | P, L, D | (L−D)/P; prosentvisning × 100 |
| Kontantstrøm før skatt | L, D, J | L−D−J; NOK/år |

P er totalpris inklusive eventuell fellesgjeld, uten kjøpsomkostninger. D omfatter eierbetalt drift; renter/avdrag, også i felleskostnader, føres i J. Inkluderte poster skilles ut uten dobbelttelling. Ingen separat ledighet, reparasjon, skatt eller verdiendring legges til formlene. Månedlige L/D/J ganges med 12 før bruk; ukjent/annen periode eller ulike år gir utilstrekkelig grunnlag. P og Ymin annualiseres ikke.

Manglende L hindrer alle fire tall; manglende P hindrer yield, manglende J bare kontantstrøm. Manglende Ymin hindrer screening mot kravet, men ingen av de fire beregningene. Manglende, ugyldige, konfliktfylte eller ubekreftede verdier brukes ikke som gyldig input. Null er aldri en skjult standard.

AD-7 krever kanoniske desimalstrenger, modent desimalbibliotek og ingen Number/parseFloat før eksakt aritmetikk. Yield beholder teller/nevner til presentasjon. Med gyldig P og Ymin i prosent avgjøres nettoyieldkravet eksakt som `100 * NOI >= P * Ymin`; kontantstrøm sammenlignes direkte med 0. Norsk visning er hele NOK og tre yielddesimaler, med nødvendig ekstra detaljpresisjon/forklaring ved skjult terskelbrudd. S1s toleranse er ingen regelmargin.

| Avgørende prioritet | Vilkår | Utfall og forklaring |
|---|---|---|
| 1 | Minst én kritisk mangel, ugyldighet, konflikt, ubekreftelse, dokument-/analysefeil, uløst kritisk usikkerhet eller uavklart alvorlig TG3. | Innhent mer informasjon med alle kjente utløsere på dette nivået og konkret nødvendig handling. Gyldige tall er delgrunnlag. |
| 2 | Prioritet 1 gjelder ikke; nettoyield < Ymin eller kontantstrøm < 0. | Forkast med begge økonomiske brudd dersom begge gjelder. |
| 3 | Tilstrekkelig grunnlag, nettoyield ≥ Ymin og kontantstrøm ≥ 0. | Gå videre til grundigere vurdering/befaring, med funn og forutsetninger fortsatt tilgjengelige. |

Samme grunnlag gir samme stabilt ordnede utløsere, anbefaling, regelbegrunnelse og neste handling. KI lager eller omskriver ingen av disse. TG2/TG3 gir ingen automatisk forkastelse. Avklart krever eksplisitt valg og begge tekster etter trimming; avklaringen er brukeroppgitt og ikke eksternt verifisert. Rapportgrad/funn beholdes; Avklart betyr verken nødvendigvis utbedret eller teknisk godkjent.

## Endring og gyldighet

| Handling | Grunnlag og bekreftelse | Resultat / analyse |
|---|---|---|
| Retur til tidligere trinn uten dataendring | Behold input, utkast, kontekst og fortsatt gyldige bekreftelser. Navigasjon endrer ingen grunnlagsrevisjon. | Behold gyldighet; ingen ny analyse. |
| Faktisk endret finansverdi, relevant periode/år/kilde/kostnadsinnhold | Berørt finansbekreftelse gjelder ikke den nye verdien. Kontroll/bekreftelse må gjentas før gyldig bruk. | Siste resultat er historisk; ny kodeberegning etter relevant kontroll. Bare Ymin endrer reglene, ikke de fire tallene. Uendret rapportkontroll bevares. |
| Rediger korrigeringsutkast eller bytt valgt funn | Utkast bevares ved funn-/trinnretur og påvirker ikke gjeldende liste. | Gjeldende grunnlag endres ikke; Resultat opplyser om ubrukt utkast. |
| Bruk korrigering | Gjør versjonen gjeldende; opphev enkeltfunnets bekreftelse og listebekreftelsen. Originalen bevares. | Historisk resultat; nødvendig ny kontroll og listebekreftelse, ingen KI-kall. |
| Avbryt korrigering | Fjern utkastet, behold tidligere gjeldende versjon/bekreftelser. | Ingen ny grunnlagsendring eller analyse fra avbryt alene. |
| Avvis feilaktig KI-funn | Original og brukeravvisning beholdes; funnet er ikke aktivt. Endret liste krever ny bekreftelse. | Historisk resultat; ingen teknisk TG3-avklaring eller KI-kall. |
| Endre registrert TG3-status/begrunnelse/grunnlag | Reevaluer FR-5 og avklaringens binding. Uendrede tall og liste beholder bekreftelsen. Ukjent/ugyldig avklaring er uavklart. | Siste resultat er umiddelbart historisk; kode gir nytt resultat fra gjeldende grunnlag, uten KI-kall. |
| Korriger et funn med tidligere TG3-avklaring | Felles validering kontrollerer registrert binding til samme rapportforhold. Representasjonsretting av samme forhold kan bevare avklaring; kjent motstrid/ukjent tilhørighet er utilstrekkelig. | Ingen automatisk semantisk klassifisering, ekstern verifisering eller ny UX-handling. Ny listekontroll gjelder fortsatt. |
| Erstatt rapport | Tidligere rapportuttrekk, rapportbekreftelser og TG3-avklaringer er ikke gjeldende for den nye rapporten. Ugyldiggjør pågående analysegenerasjon. | Ny analyse og rapportkontroll kreves; gammelt/sent svar kan ikke gjøre forlatt/erstattet rapport gjeldende. |
| Oppdater/lukk siden | Aktiv frontendøkt avsluttes. | Ingen varig lagring eller gjenopptaksfunksjon. |

## Dokument- og analysegrense

Eksplisitt Start analyse gir ett ventende `POST /api/analysis`. Frontend sperrer dobbeltstart; backend setter prosesslokal duplikatmarkør før adapterkall, bundet til aktiv økt, lokal modus og backendberegnet rapporthash. Markøren beholdes til serverstopp også ved klientavbrudd; ny requestId/generasjon omgår ikke sperren. Duplikat er en tydelig feil uten nytt adapterkall. Ingen automatisk retry, SDK-retry, jobb-ID, polling eller gjenopptakbart jobb-API.

Frontend validerer struktur og samsvar med aktiv økt, reportHash, requestId og analysegenerasjon før bruk. Forlatt analyse eller rapportbytte ugyldiggjør generasjonen; AbortController er best effort og garanterer ikke at leverandørkjøringen stopper. Timeout/transportfeil er analysefeil; HTTP 200 er ikke fullføring.

Demo bruker samme dokumentpipeline og kontrakt som live. Lagret uttrekk må passe SHA-256 av originalbytes og kontrakt-/uttrekksversjon; mismatch/manglende fixture er analysefeil uten live-fallback. Lokal konfigurasjon velger modus, demo er standard og oppretter ingen KI-klient. Hele flyten viser Demo · lagret KI-uttrekk eller Live analyse.

Gyldig tomliste er completed med findings: []; manglende svar/felt er feil. Uleselig/upålitelig tekst eller kjent ufullstendig lesing er dokumentfeil, ikke tomtekst-suksess. Ukjent kilde/side/grad beholdes som usikkerhet. Brukerkorrigering, avvisning og listebekreftelse kan ikke gjøre dokument-/analysefeil til fullført analyse. Fullføring for S5 krever at den ferdige validerte listen er synlig.

Arkitekturens PDF.js legacy-build i Node, browser-build med lokalt bundlet matchende worker i frontend, startstakk, importretning og struktur gjelder uendret. Detaljerte schemas, konkrete lesbarhetskontroller og ressursgrenser fastsettes først ved de allerede angitte [avklaringspunktene](verifikasjon-og-avklaringer.md#videreførte-avklaringer).
