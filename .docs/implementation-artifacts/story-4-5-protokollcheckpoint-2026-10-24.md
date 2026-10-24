# Story 4.5 — protokollcheckpoint 2026-10-24

**Status: forberedt, faktisk gjennomføring blokkert; S5 ikke verifisert.**
Ingen nye live-kall, ny kostnad USD 0. Ingen S5-observasjoner eller manuell
referanse er produsert. Story 4.5 forblir backlog; draft-spec er ikke en
implementert eller reviewbestått story.

Kontrollert kildeversjon: `34a9ea6cb9b764ed14cf1a0e04912899fa7d7c6b`.
Story 4.3 er done. B1 er siden rettet og [uavhengig reviewbestått](story-4-4-b1-uavhengig-review-2026-10-24.md); 4.4 er fortsatt review fordi B2 trenger ny faktisk F1-live-sluttkontroll. R4-S5s person/miljø/metode er nå avklart i [datert beslutning](../planning-artifacts/r4-s5-mads-gjennomforing-2026-10-24.md); porten er closed. Mads er deltaker, teknisk miljø er lest lokalt, og konto er bekreftet uendret av Mads. Faktiske menneskehandlinger og S5-målinger gjenstår. Ingen tidligere S5-registreringer skal gjenbrukes etter brukerens nye beslutning.

## Autoritativt grunnlag

- [Story 4.5](../planning-artifacts/epics.md#story-45-måle-live-analyse-og-menneskelig-kontroll-etter-s5-protokollen): AC1–AC6 og avhengighetene 4.3/4.4, person og budsjett.
- [PRD-addendum](../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md#s5-måleprotokoll-og-tt-1tt-9): sju protokollpunkter og TT-1–TT-9.
- [Sprintplan](sprint-plan.md): R4-S5 før måling eller innsamling for gjenbruk; datert beslutningslogg med eier/person/miljø/metode og lenke fra sprintstatus.
- [R1](../planning-artifacts/r1-live-ki-semester-v1.md), [SPEC](../specs/spec-IBE160/SPEC.md) og final [arkitektur](../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md): eksisterende modell/budsjett/kontrakt og AD-5/6/10; ingen ny timerfunksjon.
- [Sensoruttrekk](../planning-artifacts/prds/prd-IBE160-2026-10-10/kildeuttrekk-sensorveiledning.md) fra sensorveiledningen s. 2–4 og [faglærertilbakemelding](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md): sporbar faktisk evaluering, skilt fra finansfasit/automatisering; ingen ekstra produktfunksjon eller nytt minimum antall forsøk innføres.

## Kan 4.4s tider gjenbrukes?

**Ingen tidligere S5-registreringer skal gjenbrukes.** Undersøkelsen fant heller ingen komplett gyldig observasjon. Originalene er urørt.

| Bevis | Faktisk innhold | Hvorfor ikke S5-tid |
|---|---|---|
| `story-4-4/F*-started.json` | Tid for verktøyets forsøksstart/reservasjon | Ikke dokumentert brukertrykk Start analyse |
| `F*-dispatch.json`, `F*-http.json` | Leverandørdispatch og mottatt HTTP-svar/leverandørheader | Ikke faktisk synlig ferdig validert liste; leverandørtid alene kan ikke stoppe hovedanalysen |
| `F*-receipt.json` | Avstemmingens ferdigtid og kostnad | Inkluderer annet arbeid og dokumenterer ikke liste-/menneskelig kontrollhendelse |
| `F1-receipt.json` | `uiControlCompleted: false` | Mangler original full sluttkontroll; replay gjenoppretter ikke historiske hendelser |
| `F2-control.json`, `F4-control.json`, `F1-replay-control.json` | Automatiserte UI-/PDF-kontroller med enkelte kildetidspunkter, `s5Measured: false` | Ingen menneskelig tidsmåling eller komplett t_start/t_liste/t_bekreftet. F1 er dessuten replay uten nytt modellkall |
| `F3-control.json` | Adaptergrense, L=null, `mainFlowStarted: false`, `s5Measured: false` | Intet gyldig bekreftet finansgrunnlag eller S5-start |

`tools/story-4-4/run.mjs` venter på synlighetsmarkøren
`data-list-visible-generation` og klikker listebekreftelse, men lagrer ikke
de tre S5-tidspunktene. Den gjennomfører kontrollen automatisk og erklærer
uttrykkelig at menneskelig tid ikke er målt. Ingen differanse mellom
provider-/receipt-tider, skjermbildefiler eller Git-tid kan fylle dette gapet.
Ingen dokumentert faktisk manuell referanse for samme caser ble funnet i
de relevante 4.4-/S5-artifaktene.

Historisk dokumentert prosjektkostnad inklusive preflight er USD 0.016072.
Det er et eksisterende regnskap, ingen ny bekreftelse av dagens konto/pris.
Den tidligere operative kontogrensen USD 2 gjelder i tillegg til R1s USD 20;
ledig budsjett og eventuelle ukjente belastninger må avstemmes før nye forsøk.

## Konkret neste gjennomføring

Bruk [den korte F1-instruksen](story-4-5-f1-instruks.md). [Detaljskjemaet](story-4-5-mads-maaleskjema.md) fylles internt av Codex. Det inneholder eksakte start-/stoppregler, menneskelige aktiviteter, bevis og blanke tidsfelt. Forhåndsutvalg er **F1/F2/F4, ett planlagt nytt forsøk per case**, sekvensielt, ingen automatisk retry. Dette er et konkret forsøksutvalg, ikke et nytt minimumkrav. F3 med L=null har ikke gyldig S5-start og er utenfor.

1. Root har hentet teknisk miljø og avstemt konto/pris/forbruk/reservasjon i [intern preflight](story-4-5-f1-preflight-2026-10-24.md). Mads filmer og utfører vurderingen selv. Ingen nøkkel/kontoinformasjon filmes.
2. Etter faktisk lukket R4-S5 gjennomfører Mads første nye F1-runde som **4.4 AC6-livekontroll med samtidige S5-punkter**. Dette følger sprintplanens uttrykkelige adgang til innsamling i 4.4 etter portlukking; det er ikke selvstendig ferdig 4.5 eller omgåelse av 4.4.
3. Oppfanging av nye originale leverandør-/HTTP-/uttrekks-/kostnadsbevis må klargjøres med ny forsøksidentitet i egen mappe før Start analyse. De faktiske svarene og kostnadene registreres under og etter forsøket. Gamle `tools/story-4-4/run.mjs`-kommandoer skal ikke kjøres for denne manuelle runden: de automatiserer kontroll og kan skrive i originalmappen. Ingen kommando som overskriver 4.4-originaler er autorisert.
4. Etter F1 vurderes B2 og aktuell 4.4-akseptanse uavhengig. Først etter bestått 4.4 fortsetter resterende F2/F4 som 4.5. Feil/ufullstendige målepunkter bevares og diskuteres før eventuelt nytt eksplisitt forsøk med ny ID og ny preflight.
5. Mads gjennomfører manuell referanse på samme caser etter skjemaets avgrensning; ingen anslag, simulering, agentklikk eller replay er menneskelig bevis. Sammenstill alle forsøk, separate medianer og S1–S4 før uavhengig 4.5-review.

**Neste menneskelige checkpoint:** Mads følger kun kortinstruksen og leverer originalopptak, notat og faktisk anbefaling/feil. Han fyller ingen teknisk tabell. Root klargjør ny originaloppfanging og lokal server før overleveringen; ingen faktisk analyse startes av agenten.

## Registreringsgrunnlag per faktisk forsøk

Dette er en feltliste for senere originalbevis, ingen målefil med konstruerte
verdier. Uregistrerte tidspunkter skal stå som manglende med årsak.

| Gruppe | Registrer |
|---|---|
| Plan og identitet | Forsøks-ID, planlagt case/modus/antall, dato/person/miljø, full kodecommit, rapportnavn/hash og fasitversjon/hash |
| Analyseversjon | Modell, SDK, prompt/schema/contract/extraction-versjon, originalt uttrekk/terminalutfall og rapportbinding |
| Startgrunnlag | Bekreftede P/L/D/J/Ymin og støttet ferdig opplastet rapport; gyldig start eller konkret sperre |
| Tidsbevis | Samme tidsgrunnlag/presisjon/metode, t_start/t_liste/t_bekreftet, originale hendelsesreferanser; feilhendelse og tid separat |
| Kontroll | Hvem kontrollerte hvilke originaler/sider, rettinger/avvisninger, usikkerhet, TG3-status/grunnlag og bekreftet gjeldende listerevisjon |
| Utfall | Analyse fullført/feilet/avbrutt, kontroll fullført/ufullført, målepunkter mangler/komplette, S1–S4/avvik og gjeldende resultat |
| Manuell referanse | Samme case, faktisk person/aktiviteter/resultat, tidsgrunnlag/start/slutt/varighet, avgrensning og eventuell forhåndskjennskap |
| Kostnad | Forsøksreservasjon, faktisk bruk/kostnad og samlet forbruk, ukjent belastning og avstemming; ingen hemmeligheter |

## TT-protokollkontroll og hva den ikke beviser

Fasiten nedenfor er konstruert i PRD, ikke faktiske produktobservasjoner.
Kontrollerte regneregler kan ikke gjøre AC1/3/4/6 eller S5 bestått.

| ID | Kontroll ved registrering/beregning |
|---|---|
| TT-1 | Bare 240 s etter Start analyse inngår; 720 s før start holdes utenfor |
| TT-2 | Synlig liste ved 150 s stopper hovedanalyse; modellslutt ved 120 s gjør det ikke |
| TT-3 | 20 s til feil registreres som feiltid; ingen vellykket analyse/kontrollstart |
| TT-4 | Kontroll 540 s; senere 3 s beregning og videre arbeid holdes utenfor |
| TT-5 | Fullført menneskelig kontroll med Uavklart TG3 kan være 420 s og fortsatt Innhent mer informasjon |
| TT-6 | Ufullført kontroll har ingen gyldig kontrollvarighet; aldri null |
| TT-7 | Sorterte analyseverdier 120/240/300/360 gir (240+300)/2=270 s; kontroll 300/480/600/720 gir (480+600)/2=540 s. Individuelle overskridelser vises |
| TT-8 | Eksakte medianer 300/600 består; 301/601 består ikke. Ingen avrunding før sammenligning |
| TT-9 | Demo 1 s og feilet live 20 s holdes separat; ingen gyldig live-median |

Avgrenset kontroll utført 2026-10-24 med `python3`: uavhengig
`statistics.median` ga 270/540; assertions bekreftet eksakte 300/600- og
301/601-grenser og 150 s-synlighetseksemplet. Samme kontroll verifiserte de
relative fillenkene og de originale F2/F4-filenes `s5Measured: false` og
uttrykkelige metodebegrensning. `git diff --check` ga ingen feil. Dette er
regne-/dokumentkontroll, ingen automatisert verifikasjon av en ny
måleimplementasjon, full produkttest eller faktisk TT-/S5-gjennomføring.

## Status for AC og stoppunkt

| AC | Status ved dette checkpointet |
|---|---|
| AC1 | Ikke gjennomført: ingen nye gyldige trepunktsmålinger |
| AC2 | Avgrensning/formler planlagt; ingen faktisk S5-varighet beregnet |
| AC3 | Ikke gjennomført: faktisk menneskelig kontroll ikke registrert |
| AC4 | Eksisterende bevis undersøkt; utvalg F1/F2/F4 vedtatt etter brukeravklaring; 0 faktiske nye forsøk kjørt |
| AC5 | Regneregler/protokollfasit kontrollert separat; 0 gyldige observasjoner, begge faktiske medianer mangler og målene er ikke verifisert |
| AC6 | Ikke gjennomført: faktisk samme-case manuell referanse mangler |

Gjenstående nødvendige avklaringer står i [draft-spec](spec-4-5-male-live-analyse-og-menneskelig-kontroll.md).
Dette checkpointet setter ikke Story 4.5 til review/done eller R4-S5 til
closed; person er avklart, øvrig preflight gjenstår. Epic 4 kan ikke lukkes; 5.4/ekstern S6 og 5.5 er urørt.
