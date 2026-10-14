# Arbeidsnotat: valgte flater og navigasjon

**Status 14. oktober 2026:** IA er lukket med de fire navngitte trinnene. [EXPERIENCE.md](../EXPERIENCE.md) er gjeldende atferdskontrakt. Lokale mangler gir det kodebaserte utfallet Innhent mer informasjon i problemtrinnet, mens normal framdrift fortsatt sperres. Grafitt/petrol, behovsåpnete resultatdetaljer, PDF-panel ved smal desktop/zoom og korrigeringsutkast med bruk/avbryt er avklart i [beslutningsloggen](../.memlog.md). Åpne punkter nedenfor er historiske Discovery-notater.

Discovery, 2026-10-13. Utleder Mads' valgte skjermoppdeling fra [brukeravklaringer.md](brukeravklaringer.md) og [PRD-uttrekket](kildeuttrekk-prd.md). Dette er UX-arbeidsmateriale, ingen ny produktkontrakt. `.memlog.md` inneholder valgte beslutninger; DESIGN.md og EXPERIENCE.md destilleres ved Finalize.

## Valgte flater og kravspor

| Flate | Behov og arbeid | Kravspor |
| --- | --- | --- |
| 1. Tallgrunnlag | Registrere og kontrollere tall, enheter, perioder, årsgrunnlag og kilde/forutsetning. Bekrefte gjeldende tall. Synlige mangler og konkrete feltfeil. | UJ-1 steg 1; FR-1–FR-4, FR-15 |
| 2. Tilstandsrapport | Velge gjeldende støttet rapport, se dokumentstatus, starte analyse eksplisitt og forstå laste-/feilstatus. Analyse etter gyldig bekreftet tallgrunnlag i hovedreisen. | UJ-1 steg 1–2; FR-6–FR-9 |
| 3. Kontroller funn | Delt funn-/PDF-flate med automatisk PDF-side. Kontrollere uttrekk, korrigere/avvise KI-feil, beholde original, registrere separat TG3-avklaring og bekrefte gjeldende funnliste. | UJ-1 steg 2; FR-5, FR-8–FR-11 |
| 4. Resultat | Kodeberegnede nøkkeltall og én kodeanbefaling med begrunnelse øverst. Påkrevd kontrollgrunnlag og mangler tilgjengelige. Handlinger tilbake til tall eller funn. | UJ-1 steg 3–4; FR-12–FR-18 |

PRD-ens fire logiske steg er ikke et låst skjermantall. Mads har nå valgt fire skjermtrinn som deler registrering/opplasting og samler beregninger/anbefaling i Resultat. Det endrer ingen formel, regelprioritet, bekreftelse eller scope.

## Navigasjon og gyldighet

- Horisontal stepper øverst på alle fire flater, med nummer, navn og gjeldende/fullført/gjenstående/endret status.
- Tidligere fullførte trinn kan åpnes igjen. Navigasjon alene endrer ikke data eller bekreftelser.
- Endrede tall krever berørt ny kontroll/bekreftelse; rapportuttrekk og fortsatt gyldig rapportkontroll gjenbrukes. Endret funnliste krever ny listebekreftelse; ingen ny KI-analyse. Ny rapport krever ny analyse, kontroll og listebekreftelse og ugyldiggjør gammel rapports TG3-avklaringer.
- Bekreftelser bevares når grunnlaget fortsatt er uendret og gyldig. Input beholdes i den aktuelle vurderingen; det er ikke et løfte om varig lagring eller gjenopptak etter lukking.
- Fremtidige trinn kan ikke hoppes til i hovedreisen før nødvendig grunnlag foreligger. Forklar hva som gjenstår. Dette må ikke hindre PRD-ens mangel-/feilforløp: mangler skal kunne vises, gyldige økonomiske delberegninger kan vises, og regelutfallet kan være Innhent mer informasjon. Konkret inngang til slikt delgrunnlag gjenstår i UX.
- Alvorlig TG3 kan være Uavklart ved fullført menneskelig kontroll. Resultatet blir da Innhent mer informasjon etter PRD; trinnet skal ikke kreve Avklart.
- Resultat beholder stepperen og tydelige tilbakehandlinger. Tidligere anbefaling kan aldri framstilles som gjeldende etter endret grunnlag.

## Åpne UX-valg

- Utdatert resultat er valgt: behold forrige anbefaling/nøkkeltall som historisk med tydelig utdatert status, demping, endret grunnlag og nødvendig ny bekreftelse. Ingen aktive beslutningshandlinger fra det gamle resultatet. Dette gjelder gjeldende vurdering; ingen historikkfunksjon innføres.
- Visuell retning er valgt: lys, rolig, institusjonell med marineblå/grafitt struktur, en diskret aksent og meningsfull statusfarge. Linear/Stripe er prinsippinspirasjon; ingen konkrete tokens er valgt. Se mottatt svar i brukeravklaringer.md.
- Resultats standard detaljtetthet er valgt: anbefaling/begrunnelse/utløste regler/fire nøkkeltall/alvorlige funn/mangler/neste handling synlige; formler, inputkilder/forutsetninger, beregningsdetaljer og originalt/korrigert uttrekk åpnes ved behov gjennom seksjoner/accordions. Alle aktive funn forblir tilgjengelige.
- Tallvisningspresisjon, mindre desktop-bredder, PDF-panel ved behov, konkret tilstands-/feilmikrocopy.
- Feilplassering er valgt: konkrete feil/mangler vises der de oppstår, ingen nødvendig omvei til Resultat. På Resultat samles faktiske blokkere i en kort oppsummering som forklarer Innhent mer informasjon; ikke gjenta hele feilmeldinger. Den normale steppersekvensen og regelprioritetene består.
