# Redaksjonell strukturkontroll 19. november 2026

Dokumentene skal hjelpe sensor, produkteier og videreutviklere å finne gjeldende PAA-krav, forstå avvik fra opprinnelig plan og etterprøve historisk testfasit uten å forveksle plan, funksjon og resultat.

**Omfang:** Kun `structure`-linsen i bmad-review, menneskelige lesere. Innhold og faglige valg er urørt; tabellen er forslag til hovedagentens triage. Ingen endringer er utført i PRD eller addendum av denne kontrollen. Kontrollen er utført av samme subagent som forberedte teknologi-/evalueringsunderlaget, uten ansvar for PRD-redigeringen; den er ikke en blind produktgjennomgang.

**Strukturmodell:** PRD bruker Strategic/Context (Pyramid): gjeldende status først, beslutninger og avgrensning, begreper/reise, normative krav og evalueringsbevis. Addendum bruker Reference/Database innenfor en tydelig datert ramme. Oppslagsformen passer test-ID-er; nåtid/historikk må fortsatt fremgå i dokumentets overskriftshierarki.

**Målt grunnlag:** `UV_CACHE_DIR=/private/tmp/paa-uv-cache uv run .agents/skills/bmad-review/scripts/word_metrics.py <fil>` er kjørt på begge reviderte filer. PRD: **4 574 ord**. Addendum: **3 640 ord**. Måleren teller whitespace-separerte token, inklusive Markdown/lenker. Seksjonstallene nedenfor er direkte målt; ingen lengdemål er pålagt.

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| structure | Addendum: «Opprinnelig spesifikasjon 10. oktober» (38 ord), etterfulgt av TG3-/RT-/BT-/AT-/TT-seksjonene som likestilte H2-er (215/725/734/763/711 ord) | **MOVE:** Gjør de fem historiske fagseksjonene til H3 under H2 «Opprinnelig spesifikasjon 10. oktober». Behold all ordlyd og alle test-ID-er/ankernavn. | Tydeliggjør historikkgrensen også i en innholdsoversikt og ved skumming; dagens H2-søsken ser ut som selvstendige nåtidsseksjoner. Omorganiserer 3 148 ord uten å redusere dem; ordvirkning 0. |
| structure | Addendum §Lesestatus: 403 ord, med både dateringsforklaring, anvendelsestabell og tre nye nummererte kontrolltilfeller | **MOVE:** Sett en egen H2 «Gjeldende kontrolltilfeller» rett før «Følgende presiserte kontrolltilfeller …». Behold listen og lenkene samlet før den historiske hovedseksjonen. | Skiller dagens testpresiseringer fra tabellen som forklarer hvordan gamle ID-er skal leses. Ingen flytting til PRD kreves; tekniske kontrolltilfeller hører hjemme i vedlegget. Innholdsmengde uendret, omtrent 3 nye Markdown-token i overskriften. |
| structure | PRD §Gjeldende status per krav: 385 ord; §Kildepresedens og hvorfor omfanget endret seg: 259 ord; §Analysefrister, kostnadsrammer og åpne porter: 370 ord | **PRESERVE:** Behold de tre separate funksjonene «hva som gjelder», «hvorfor det ble endret» og «hvilken grense som styrer hver analysevei». | De 1 014 ordene er nyttig navigasjon og beslutningsstøtte, ikke tre gjentakelser av samme stoff. Kravstatusen alene er 8,4 % av PRD-ordtallet og gir nødvendig oversikt før detaljer. Ingen reduksjon foreslås. |
| structure | Addendum RT/BT/AT/TT-seksjonene: samlet 2 933 ord; PRD FR-14: 119 ord med konkret terskeleksempel | **PRESERVE:** Behold testtabellene som oppslagsfasit og det korte terskeleksemplet i hovedkravet. | Historiske test-ID-er og forventninger brukes av eksisterende stories/testbevis. Eksemplet gjør uavrundet terskel forståelig uten å åpne vedlegget; dette er nyttig forsterkning for menneskelige lesere. Ingen reduksjon foreslås. |

**Samlet vurdering:** To forslag til organisering og to uttrykkelige bevaringsanbefalinger. Ingen innholdskutt anbefales. Estimert reduksjon ved å følge alle forslag er **0 ord / 0 %** av begge dokumentene; egen kontrolloverskrift tilfører omtrent tre token. Ingen lengdegrense skal oppfylles. Revidert hoveddokument har allerede korte FR-er og tydelig status først; ytterligere mekanisk forkorting ville svekke forklaring og sporbarhet. Foreslått omorganisering av vedlegget forbedrer skillet mellom nåtid og historikk uten å ofre eksempler eller endre innhold.

## Etterfølgende språkkontroll

Formålet og den menneskelige målgruppen er uendret. `prose`-linsen er kjørt etter hovedagentens strukturelle endringer. Begge MOVE-forslag er nå gjennomført: fem historiske testseksjoner er H3 under den opprinnelige spesifikasjonen, og nye presiseringer har egen datert H2. Ingen CUT-/MERGE-forslag forelå, så ingen innholdspassasjer er hoppet over eller omskrevet til ny plassering i språkforslagene.

**Bevarte stilvalg:** Kort, normativ norsk kravprosa med stabile ID-er, nummererte kriterier, eksplisitte unntak og konkrete beløps-/terskeleksempler. Teknisk fagterminologi, forskjellen mellom brukerbekreftelse og teknisk godkjenning og den daterte historiske ordlyden skal beholdes. Tabellen under gjelder bare to små klarhetsproblemer i den nye teksten, ikke faglig innhold eller historiske testeksempler.

Ny kjøring av samme `word_metrics.py` måler fortsatt **4 574 ord i PRD** og nå **3 646 ord i addendum**. Forskjellen på seks token fra forrige måling skyldes den nye daterte kontrolloverskriften; seksjonsinnholdet er bevart. Den første strukturkontrollens anslag på tre token var for den kortere foreslåtte overskriften, ikke den faktisk valgte.

| Pass | Original Text | Revised Text | Changes |
| --- | --- | --- | --- |
| prose | PRD §Formål og gjeldende kravstatus: «Historisk ordlyd kan hentes med git show fra **684e61d**, filsti som denne PRD-en.» | «Historisk ordlyd finnes i samme filsti i commit **684e61d** og kan hentes med git show.» | Erstatter en ufullstendig hale med en hel setning som gjør plasseringen klar. Commit og gjenfinningsmåte beholdes. |
| prose | PRD FR-5.5 og addendum §Gjeldende kontrolltilfeller pkt. 1: «Avvisning av feiluttak»; PRD FR-10.1: «avvise feiluttak» | «Avvisning av feilaktige uttrekk» / «avvise feilaktige uttrekk» | «Feiluttak» kan leses som et økonomisk uttak. «Uttrekk» er allerede dokumentets term for maskinelt hentede funn. Samler samme rettelse på tre steder; ingen regelendring. |

Språkkontrollen foreslår to avgrensede rettelser. Den prioriterer forståelse fremfor ordreduksjon og gir ingen anbefaling om å redigere den bevarte oktoberfasiten. Ingen av språkforslagene er brukt av denne subagenten; hovedagenten gjør triage og eventuell retting.

## Hovedagentens behandling 19. november

Begge MOVE-forslag og begge språkforslag er innarbeidet; PRESERVE-føringene
er fulgt. Ingen gammel testfasit er omskrevet. Sluttmåling i
[dokumentkontrollen](../../../process/evaluering/prd-kontroll-2026-11-19/dokumentkontroll.json)
viser 4 579 ord i PRD etter språkpresisering og komplett dokumentbinding.
Struktur-/språkreviewets tidligere målinger beholdes som daterte
mellomstadier, ikke som konkurrerende sluttall.
