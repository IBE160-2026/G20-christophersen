---
title: Kildebundet boliguttrekk og ærlig modellstatus fra ekte PDF
type: bugfix
created: 2026-11-04
status: done
route: dispatch
baseline_commit: cb944599b89eae2a3e133a991839b881b735a437
context: [AGENTS.md]
---

<frozen-after-approval reason="Bruker bestilte undersøkelse, retting, ekte Playwright-test og lokal commit uten betalte kall">

## Intent

Leieagenten skal automatisk gjenkjenne opplysninger som allerede står i en ekte salgsoppgave og forklare nøyaktig hvorfor et estimat eventuelt ikke er forsvarlig. Serveren skal kjøre nyeste kode, og hele flyten prøves med eksisterende ekte PDF i Playwright. Dokumentverdier, markedsestimater og ukjent informasjon holdes atskilt.

## Boundaries & Constraints

Ingen betalte API-kall eller push. Ingen manuell inntasting av allerede dokumenterte opplysninger, ingen fabrikkerte verdier, klassifikasjoner eller falsk presisjon. OCR/TG og eksisterende finans-/kildekontroll beholdes. Ekte PDF og råtekst/screenshot forblir ignorert private/. Bare syntetiske regresjonseksempler i Git. En enebolig skal ikke feilklassifiseres som leilighet for å produsere et tall. Modellgrense rapporteres som uløst dersom tilgjengelig datagrunnlag ikke støtter en forsvarlig leieverdi.

## I/O & Edge-Case Matrix

| Tilfelle | Inndata | Forventet utfall |
| --- | --- | --- |
| Ny ekte kontrollcase | Enebolig, 196 m² BRA-i, 3 rom, eksplisitt eiendomsbetegnelse i Bergen | Alle fire boligopplysninger og adresse gjenkjennes med ordrette PDF-kilder; konkret modellbegrensning, ingen fiktiv markedsleie |
| Kompakt megleroppsett | SALGSOBJEKT Leilighet, BRA‑I/ BRA TOTAL x/y kvm, ANTALL ROM n | Bruk første eksplisitte interne areal, ikke total/bod, og behold eksakte originalspenn |
| Etasjefordeling | Totalt BRA-i og flere mindre BRA-i-poster under BRUKSAREAL FORDELT PÅ ETASJE | Total beholdes; etasjer er ikke alternative totaler og summeres ikke blindt |
| Adresse og tomt budskjema | Forsideadresse og eksplisitt eiendomsbetegnelse, tomme Adresse:/Postnr.-felt bakerst | Salgsobjektets adresse brukes; feltetiketter og megleradresse blir ikke identitet eller kildekonflikt |
| Kommune i setning | Gnr./bnr. i X kommune; samt setningen kommune vedrørende ... | X er kommune, fritekst etter ordet kommune er ingen kommuneverdi |
| Gyldig enkeltleilighet | Entydig støttet kommune, rom og areal | Eksisterende gratis SSB-valg/estimat og økonomikobling består uten nye brukerfelt |
| Reell motstrid | Ulike eksplisitte objekttotaler/adresser/rom | Konkret blokkering; ingen kandidat velges skjult |

</frozen-after-approval>

## Code Map

- `src/domain/rental-property.ts`: feil i gjenbruk av propertyIdentity, smale boligtype-/arealformater og kommuneetikett som aksepterer løpende tekst.
- `src/contracts/rent-estimate.ts`: eksisterende semantisk type apartment/unsupported og kildebevis beholdes; unngå kontraktendring med mindre nødvendig.
- `src/backend/rent/ssb-rent.ts`: stopper unsupported før nettverk, publiserte arealpunkter velges fra metadata. Bevar ingen-ekstrapoleringsregel.
- `src/frontend/investment/RentEstimatePanel.tsx`, `InvestmentOverview.tsx`: vis dokumenterte verdier og konkrete terminalårsaker på hovedflaten, også når markedsleie ikke finnes.
- `private/incoming/new-salgsoppgave.pdf`: nyeste ekte kontrollcase, 135 sider; første lokalt lagrede respons har feil propertyIdentity fra tomt budskjema. Ny opplasting skal brukes som sluttbevis, ikke eldre respons.
- `private/incoming/salgsoppgave.pdf`: eldre kontrollcase er en hel bygård, heller ikke én støttet leilighet. Ingen ekte enkeltleilighet er tilgjengelig i repoets private PDF-inventar.
- Kurs-/produktføringer: faglærers kilde-/usikkerhetskrav, sensorveiledningen og eksisterende Konsept A/leieagentspec videreføres.

## Tasks & Acceptance

- [x] `src/domain/rental-property.ts`, `tests/unit/rental-property.test.ts`: rett uttrekk med generiske, kildebevarende mønstre og syntetiske regresjoner for matrisen. Implementeringsagent eier disse to filene.
- [x] `src/backend/rent/ssb-rent.ts`, relevante tester: konkretiser modell-/arealgrense uten å endre støttet boligtype eller ekstrapolere. Hovedagent eier dette.
- [x] `RentEstimatePanel.tsx`, `InvestmentOverview.tsx`, paneltester: dokumentert boligtype/kommune/areal/rom vises separat fra markedsestimat; årsak til manglende estimat må være synlig uten å lete i foldet detalj. Hovedagent eier dette.
- [x] `tests/e2e/`: test ekte PDF via faktisk server/rute og ekte lokal import, ikke stubbet import; bekreft korrekt blokkering hvis datagrunnlaget ikke støtter estimat. Bevar også positiv automatisk leilighetsflyt med syntetisk PDF og offentlig SSB-fixture.
- [x] `.docs/process/arbeidsokter/`, `README.md`, sentral deferred-work: dokumenter opprinnelige feil, reelle modellgrenser og faktisk testutfall; oppdater historikk uten å lukke uavklarte punkter. Lokal commit med aktiv promptlogg.

**Acceptance:**
- Gitt PDF med opplysningene tilgjengelig, når leiesteg kjører, så vises de kildebundet uten manuell registrering.
- Gitt valgt SSB-grunnlag, når leie kan beregnes, så vises statistikkår, koder og konservativ usikkerhet; når modellen ikke er anvendelig, så vises ingen numerisk leie som gyldig.
- Gitt ekte Playwright-opplasting, når behandlingen avsluttes, så dokumenteres om et forsvarlig estimat faktisk finnes og nøyaktig hva som hindrer det.

## Implementation Notes

Brukerens uttrykkelige implementeringsbestilling erstatter ekstra spekgodkjenning. Ingen uavklart intensjon eller irreversibel endring. Undersøkelsen har allerede avdekket at nyeste ekte PDF ikke er enkeltleilighet; riktig boligklassifikasjon skal bevares. Server på port 3000 er identifisert i riktig repo, stoppet og startet med samme Node 24.21 og deaktivert OPENAI_API_KEY. Avgrenset parallelt arbeid følger fileierskapet over.

## Review Triage Log

Tre uavhengige reviewlag er kjørt mot `/tmp/paa-rent-real-review.diff`. Funn er vurdert enkeltvis før samling; konkrete feil er rettet uten å svekke modellgrenser.

| ID | Vurdering og håndtering |
| --- | --- |
| B1 | medium / patch: «Kommune Oslo» mistet støtte. Eget mønster for eksplisitt etikett og navn med stor forbokstav bevarer dette uten å akseptere løpende «kommune vedrørende»-tekst. |
| B2 | high / patch: Etasjekontekst ble nullstilt ved sideskift og kunne gi en etasje som objekttotal. Kontekst bæres over sider til eksplisitt total; tosidig negativ/positiv test. |
| B3 | medium / patch: Kompakt intern/total etter etasjer ble hoppet over. Denne eksplisitte totalen er nå seksjonsmarkør, verifisert i test. |
| B4 | high / patch: Generell slash-splitting skjulte blandet leilighet/næring/enebolig. Splitting tillates bare for boligtype/eierform med kjent eierform; blandinger blokkeres. |
| B5 | high / patch: Kompakt total ble fanget, men ikke kontrollert. Begge tall valideres og internt areal må være <= total; ugyldig relasjon gir blokkering, ingen kandidat. |
| B6 | medium / patch: Tom Kommune kunne svelge neste feltetikett. Kjente etiketter avvises som kommunenavn; egen regresjon. |
| B7 | medium / patch: Meglerkontorets kommune skapte falsk konflikt. Samme kontekstfilter som adresse brukes for kommuneetikett og matrikkelsetning. |
| B8 | medium / patch: Positiv nettleserprøve gjennom faktisk server/SSB var bare privat bevis. Versjonert, eksplisitt gratis nettprøve med syntetisk PDF er lagt til og kjøres med PAA_TEST_SSB_NETWORK=1. Deterministisk HTTP-test og offentlig fixture beholdes for nettuavhengig regresjon. |
| E1 | high / patch: Samme sideskiftproblem som B2; egen test viser ingen areal fra fortsatt etasjetabell. |
| E2 | medium / patch: Samme kompakte total etter etasjer som B3; totalmarkøren avslutter etasjefilteret. |
| E3 | high / patch: Samme intern/total-motstrid som B5; begge tall og relasjon er kontrollert. |
| E4 | high / patch: Samme skjulte slash-klassifikasjon som B4; ingen leilighetsestimering for blandet boligtype. |
| E5 | medium / patch: Samme meglerkommune som B7; kontekstfilter og regresjon hindrer falsk konflikt. |
| V1 | medium / patch: Verifisert manglende test for totaloverskrift etter etasjer. Ny test krever at AREAL TOTALT gjenopptar totalfelt, både samme side og etter sideskift. |

## Verification

Målrettede uttrekks-, panel-, SSB- og scenariotester; build/typecheck/lint; reell PDF-opplasting og kildeåpning i lokal Playwright med nyeste backend. Gratis SSB-tilgang bekreftes separat ved behov. Ingen betalte modellkall. Testbevis og eventuell uløst modellgrense dokumenteres før commit.

Implementering: Uttrekksagenten leverte et delvis kildebevarende kodeutkast, men fikk en kapasitetsfeil før tester var skrevet. Hovedagenten fullførte filene, regresjonstester og faktisk validering selv. Ingen nye brukeropplysninger var nødvendig for å identifisere opplysningene.

Sluttverifikasjon: 2 004 unit-/integrasjonstester består, 7 eksisterende native vision-tester er eksplisitt hoppet over. 22 Konsept A-/app-shell-regresjoner består. Endelig server på port 3000 er prøvd med de to versjonerte Playwright-testene: ekte PDF og eksplisitt gratis SSB-nettprøve; 2/2 består uten skip. Build/typecheck/lint/diffkontroll består. Modellgrensen for ekte enebolig er fortsatt uløst, tydelig rapportert og oppført Åpen i PAA-LEIE1. Ingen konkrete reviewfeil står igjen.
