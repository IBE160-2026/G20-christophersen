# Fokusert etterkontroll — TG3-avklaringens anvendbarhet

Dato: 2026-10-14. Grunnlag: gjeldende AD-2, AD-8 og «Funn og kilde» i `ARCHITECTURE-SPINE.md`, siste gate-fiks i `.memlog.md`, opprinnelig [seam-review](review-seams.md) og tidligere leste FR-5/FR-9/FR-10/FR-11 med sluttført UX. Den opprinnelige reviewen er bevart uendret.

**Verdikt: Bestått. S-1 er lukket på arkitekturens nivå. Ingen gjenværende handlingskrevende blokkering er påvist i den fokuserte etterkontrollen.**

## Hvorfor moteksemplet ikke lenger følger spinen

AD-2 skiller nå eksplisitt uttrekkets proveniensidentitet fra TG3-avklaringens binding til det faktiske rapportforholdet og registrerte grunnlaget. Samme `findingId` kan ikke alene overføre avklaringen til et annet teknisk forhold. AD-8 gir én felles inputvalidering eierskap til anvendbarheten og forbyr screening å bruke uavklart anvendbarhet som gyldig Avklart. Funnkonvensjonen gjør den ekstra bindingen til en felles kontrakt-/valideringsforpliktelse.

Den tidligere modulkombinasjonen kan derfor ikke lenger være AD-konform: En reducer kan fortsatt bevare elektrikervurderingen og dens opphav etter korrigering fra elektrisk forhold til taklekkasje, men den kan ikke gjøre vurderingen anvendbar på takfunnet bare ved å beholde id. Screening kan ikke godta dette som gyldig Avklart bare fordi status og begge tekster finnes. Kjent motstrid eller ukjent tilhørighet må gi utilstrekkelig grunnlag etter eksisterende regelprioritet.

## Avgrensning mot nye produktregler

| Tilfelle | Gjeldende arkitekturforpliktelse |
| --- | --- |
| Bedre KI-beskrivelse eller rettet kilde for det samme avklarte rapportforholdet | Avklaringen kan bevares. Ingen generell oppheving ved korrigering eller ekstra bekreftelsestrinn er innført. |
| Korrigeringen viser til et annet faktisk teknisk forhold | Proveniens-id overfører ikke avklaringen. Registrert binding og kjent motstrid håndteres av felles inputvalidering; tidligere tekst/opphav kan bevares separat. |
| Tilhørigheten mellom avklaring og gjeldende forhold er uavklart | Screening kan ikke behandle den som gyldig Avklart. Dette følger eksisterende utilstrekkelighetsregel og er ikke ekstern kontroll eller automatisk semantisk klassifisering. |

Presiseringen konkretiserer at FR-5 gjelder per alvorlig TG3-funn og at FR-11-listens bekreftelse ikke automatisk avklarer et annet TG3-forhold. Den innfører ikke en ny skjermhandling, obligatorisk ny tekst for alle korrigeringer, ekstern verifisering eller automatisk forståelse av friteksten. Konkrete felt og representasjon kan fortsatt utformes av samme contracts/domain validation-eier innen disse invariantene; de kan ikke velges som konkurrerende regler i state/UI og screening.

Dette er dokumentetterkontroll av den aktuelle sømmen. Den hevder ikke at implementert validering eller produkttester er levert eller bestått.
