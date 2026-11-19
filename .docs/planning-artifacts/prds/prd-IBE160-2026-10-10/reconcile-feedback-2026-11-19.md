# Kildeavstemming av PRD-tilbakemeldingen

Dato: 2026-11-19. Inngangsreferanse: `684e61d3686f83f05c3f6cb1a3720dfb3f622c68`.
Dette er et kildeuttrekk for dokumentrevisjonen, skrevet av en separat KI-agent.
Tabellene beskriver revisjonsbehov ved inngangen til arbeidet; de er ikke en
ny sentral oppgaveliste eller påstand om at produkttester er kjørt.
Gjeldende saker følges i [deferred-work](../../../implementation-artifacts/deferred-work.md).

## Leste kilder og deres bevisverdi

- [PRD-tilbakemelding 12. november](tilbakemelding-prd.md), alle seksjoner 1–7.
  Formativ veiledning, uttrykkelig ingen karakter. Eksemplene med 300 sekunder,
  kostnadsbeløp og tre rapporter er forslag, ikke vedtatte produktkrav.
- [Product Brief](../../briefs/brief-IBE160-2026-09-15/brief.md),
  [brief-addendum](../../briefs/brief-IBE160-2026-09-15/addendum.md),
  [brief-tilbakemelding](../../briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md),
  [revisjonskontroll 8. oktober](../../briefs/brief-IBE160-2026-09-15/revisjonskontroll-2026-10-08.md)
  og briefens [.memlog](../../briefs/brief-IBE160-2026-09-15/.memlog.md).
- Hele [PRD](prd.md), [PRD-addendum](addendum.md), [.memlog](.memlog.md) og
  [beslutningsavstemming](beslutningsavstemming.md). Disse bevarer hva som ble
  planlagt/godkjent i oktober, ikke i seg selv dagens implementeringsstatus.
- [Leveranseavstemming](../../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md)
  og [prosess-/KI-guide](../../../process/leveranse-2026-11-06/prosess-og-ki.md)
  for å identifisere senere beslutninger og allerede erkjente bevisgrenser.
- Original [sensorveiledning del 1](../../../reference/course/Sensorveiledning-IBE160-Del-1.pdf),
  alle sju PDF-sider, tekstlest direkte med installert PDF.js 19. november.
  Poppler/pypdf var utilgjengelig; ingen ny avhengighet ble installert.
  Sidereferanser nedenfor gjelder originalens nummererte sider 1–7.

## Hva sensorveiledningen støtter

| Kriterium og veiledende vekt | Relevant grunnlag for revisjonen | Presis grense for tolkningen |
| --- | --- | --- |
| Prosess/KI-styring, 30 % | s. 2–3: brukt og oppdatert planlegging, spor fra plan til kode, forklarte avvik, konkrete menneskelige presiseringer/avvisninger av KI og begrunnede valg | En nyskrevet oppsummering kan gjøre samtidige bevis tilgjengelige; den skaper ikke historisk menneskelig godkjenning eller en komplett samtaletranskripsjon. |
| Funksjonalitet/omfang, 20 % | s. 3: kjerneflyt fra start til slutt, stabilitet og utelatelser/endringer fra proposal beskrevet med begrunnelse | Ny bred funksjonalitet er ikke nødvendig for toppnivå dersom den avgrensede, begrunnede kjernen løser problemet godt. |
| Kvalitetssikring/testing, 15 % | s. 3–4: meningsfulle kjørbare tester, dokumenterte manuelle tester eller testplaner og konkrete funn/rettinger i KI-kode | En testplan er relevant prosessbevis, men ikke et gjennomført resultat. Ingen bestemt prosentdekning eller minimumsantall brukertestere er pålagt. |
| Design/UX, 10 % | s. 4–5: konsistens, forståelig flyt/feil, tilgjengelighet og målgruppetilpasning | Uavhengig menneskelig brukertesting gir bedre belegg for forståelighet enn en agentkontroll, men er ikke formulert som et universelt kurskrav. |
| Kode/arkitektur, 10 % | s. 5: struktur som samsvarer med dokumentasjonen, lite duplisering og fornuftig konfigurasjon/avhengigheter | Veiledningen krever ingen spesifikk stack, database, skytjeneste eller antall produktagenter. |
| README/kjørbarhet, 10 % | s. 2 og 5–6: ren installasjon fra README; høyt nivå kjører uten avvik | Agentutført ren-klon-prøve er nyttig kjørbarhetsbevis, men oppfyller ikke alene prosjektets eget S6-krav om en annen person. |
| Repo, 5 % | s. 6–7: relevante filer, ryddig struktur, ingen hemmeligheter; motstridende planer er et varseltegn | Bevar historiske beslutninger med tydelig dato/status; ikke slett eldre bevis for å få dokumentene til å se samtidige ut. |

Veiledningen gir felles kjennetegn for **A–B**, ikke egne obligatoriske A-tester.
Del 1 teller 70 % av emnet (s. 1); karakterberegningen har veiledende A-grense
4,5 og rom for begrunnet faglig skjønn (s. 7). Dette gir ikke grunnlag for å
garantere A eller behandle PRD-revisjonen som en full sensur av del 1.

## Alle tilbakemeldinger og hva revisjonen må bevare eller avklare

| Kildepunkt | Innhold og kildekonflikt ved inngangen | Konsekvens for revisjonen |
| --- | --- | --- |
| §1 samlet inntrykk | Sterk tese/kravfasit, men banner og resten av PRD gir forskjellige produktversjoner | Gjeldende krav må være lesbare i PRD. Den gamle versjonen bevares i Git og daterte beslutnings-/testdokumenter. |
| §2, første styrke | FR-14/BT-8 gjør eksakt 7 % forskjellig fra avrundet 7,00 % under terskelen | Bevar uavrundede grenser og de opprinnelige test-ID-ene; redaksjonell forenkling må ikke fjerne grensene. |
| §2, andre styrke | KI skal ikke bestemme anbefaling eller formler; feil er forskjellig fra fullført tom liste; ett kall/gjenbruk og gratis demo beskytter kostnad | Bevar deterministisk kjernelogikk og feilskillet. Beskriv senere lokal import separat fra gammel KI-rapportadapter; ikke utvid et historisk ett-kall-løfte til en ny analysearkitektur uten beslutningsbelegg. |
| §2, tredje styrke | S1–S6 og K1–K3 hindrer å vinne tid ved dårligere kontroll eller flere tilfeldige funn | Bevar kvalitetsmotvektene og skill mål, observerte resultater og ikke beståtte/ikke gjennomførte evalueringer. |
| §3 beslutningsklarhet, scope og nedstrømsbruk | God, men retningsendring og «ingen åpne produktspørsmål» gir feil inntrykk; for lang tekst | Kravstatus, daterte beslutninger, faktiske sperrer og eksisterende kostnads-/tidsvedtak må være synlige. |
| §3 substans, strategi og testbarhet | Sterk produktspesifikk tese, én sammenhengende reise og konsekvenser per FR; TG3-term er svak | Bevar den smale beslutningsoppgaven og målbare akseptansekriterier. Ingen ekstra personas eller produktfunksjoner trengs for å fylle en mal. |
| §3 formtilpasning | Én reise passer, men prosessgodkjenninger forstyrrer kravteksten | Flytt ikke bort begrunnelse; samle den i datert kilde-/beslutningsdel og bruk korte kravhenvisninger. |
| §4.1 høy: retningsendring | Original PRD sier både «salgsoppgave hovedinngang» og «salgsoppgave/OCR utenfor v1». Frontmatter er 10. oktober/final. Flere senere økonomifunksjoner var opprinnelig ikke-mål | Oppdater dato og kravtekst, med status per stabile FR-ID-er og lenker til vedtak. Bevar tidligere begrensning som historikk, inkludert separat 30-siders rapportadapter versus ny importgrense. Forklar utvidelsene som senere bestillinger, ikke opprinnelig godkjent scope. |
| §4.2 høy: alvorlig TG3 | Briefen sier «alvorlig TG3» med usikkerhet/avklaringsbehov, og PRD henviser sirkulært tilbake. Ingen av brieftekstene definerer en eksplisitt ufarlig TG3-klasse | Fastslå operasjonell regel fra faktisk kode og vedtak, inklusive aktivt/avvist/korrigert funn. Faglærers eksempel «hvert TG3 med mindre …» er ikke originalt vedtak. Ikke oppfinn et TG3-unntak eller en ny teknisk klassifisering. FR-5s status + begrunnelse + grunnlag, og at dette ikke er teknisk godkjenning, må bestå. |
| §4.3 medium: gjentakelser | Samme prioritet-1-regel gjentas i FR-9/11/13/16/18; status/kilder gjentas per gruppe | Én autoritativ regel i FR-16 med korte krysshenvisninger. Bevar særskilte observerbare feil-/tilstandskrav. Godkjenninger finnes allerede i .memlog og beslutningsavstemming; historikken skal ikke omskrives. |
| §4.4 medium: live-kostnad/feilgrenser | PRD ber fortsatt om modell/budsjett før første test selv om senere beslutninger og forsøk finnes | Bruk gjeldende dokumenterte tidsfrister og budsjetter per analysevei. 300 sekunder i tilbakemeldingen er bare et eksempel og må ikke forveksles med S5-medianmålet. Historisk rammestørrelse er ikke nåværende tillatelse til nye betalte kall. |
| §4.5 medium: S2/S5-utvalg | F1–F4 er primært finans-/regelcaser; original RT-16 illustrerer ti TG2/to TG3, ikke et dokumentert evaluert korpus | Vis F1–F4-verdier og forventet utfall. Definer et gjennomførbart dokumentutvalg og tell funn/rapporter eksplisitt før ny evaluering. Skill plan, eksisterende syntetiske funn, reelle dokumenter og opprinnelig/live/lokalt/manuelt resultat. Små utvalg gir ingen generell treffsikkerhet. |
| §5 mekanikk, ID-er | FR-1–18/NFR-1–5/S1–6/UJ-1/K1–3 og lenker var sammenhengende ved feedback | Bevar ID-er og kontroller dem etter revisjonen; ny gjeldende tekst må ikke bryte gamle storyreferanser. |
| §5 mekanikk, antakelser | Ingen ASSUMPTION-tag var brukt; modell/kostnad stod likevel uavklart | Erstatt utdatert antakelsesfrihet med konkrete beslutninger, sperrer og gjenværende bevisbehov. Ikke påstå at gamle gjennomføringsvalg fortsatt er uvalgte. |
| §5 mekanikk, begreper | «funnliste», «gjeldende liste», «rapportgrunnlag» og flere kritisk-/avklaringsuttrykk glir sammen | Definer rapportgrunnlag som mer enn listen, kritisk grunnlag som tall + teknisk kontroll, og TG3-avklaring separat fra listebekreftelse. Bruk termene konsekvent. |
| §5 mekanikk, feilscener | Én brukerreise er riktig; feil er allerede egne avsnitt | Korte feilscener kan bedre lesbarheten innen UJ-1. Ingen ny brukerrolle eller ny reise er nødvendig. |
| §6 tre før-fase-avklaringer | Gjeldende krav etter 28. oktober, TG3-definisjon og timeout/kostnad må avklares før videre faser | Faser er allerede gjennomført. Avstem dokumentene ærlig nå; ikke presenter korrigeringen som en beslutning før implementeringen. |
| §6 «kan vente» | Utvalg, duplisering og begreper kunne vente i lærerens formative gjennomgang | Denne bestillingen ber om dem nå; det er derfor relevant å ta dem med i samme dokumentrevisjon. |
| §6 brief-oppfølging | Innsnevring, formler, demo og målekrav vurderes fulgt. Mangler kort omtale av dagens alternativer i PRD | Briefens «What Makes This Different» har allerede manuell lesing/regneark, generelle chatboter og rådgivere. Gjengi kort i PRD som bakgrunn/hypotese; ingen dokumentert konkurrentundersøkelse eller tidsgevinst foreligger. |
| §7.1 refleksjon: hvem bestemte kriteriene? | Det finnes samtidige .memlog- og revisjonsreferater, men ikke fullstendig råsamtale for tidlig brief/PRD | Skill brukerens eksplisitte formler, prioritet, årsperioder, terskellikhet og S5-målepunkter fra KI-utformede akseptansekriterier/testeksempler som ble godkjent. S2s 90 % kan spores til revidert brief og senere godkjenning; kildene beviser ikke hvem som først foreslo nøyaktig 90 %. Ikke etterregistrer et sikkert menneskelig opphav. |
| §7.2 refleksjon: 28. oktober/historikk | Banner og lenker bevarte eldre krav uten å få hovedteksten ajour. Dette ga leseren to sannheter | Forklar feilen som dokumentgjeld. Gjeldende versjon + datert endrings-/kravtabell + urørt historisk beslutnings-/testbevis gir ny leser en etterprøvbar forskjell. |

## Historiske beslutninger som ikke må glattes ut

1. **8. oktober:** brukerens låste finansformler erstattet tidligere KI-forslag
   om omkostningsjustert yield, ledighetsfratrekk og førsteårstiltak. F1–F4 og
   regelen mangler først, så økonomi, er bevisste avgrensninger. Se
   briefens revisjonskontroll, «Oppfølging: låste v1-beslutninger før PRD».
2. **10. oktober:** PRD-.memlog dokumenterer at brukeren presiserte alle
   eksplisitte TG2/TG3 uten relevansfiltrering, særskilt brukerbekreftet
   TG3-avklaring, uavrundede terskler, alle avgjørende regelårsaker og
   start/stopp for S5. Elektrikereksemplet er ingen universell plikt til
   ekstern fagkontroll.
3. **28. oktober og senere:** senere salgsoppgave-/OCR-/finansbestillinger
   utvidet gamle ikke-mål. Den daværende innsnevringen var ikke feil eller
   uekte av den grunn. [Leveranseavstemmingen](../../../process/leveranse-2026-11-06/produkt-og-sporbarhet.md)
   peker til de samtidige beslutningene og spesifikasjonene som må brukes
   ved detaljavstemming mot dagens kode.
4. **S5/S6:** eksisterende [prosessguide](../../../process/leveranse-2026-11-06/prosess-og-ki.md)
   dokumenterer et menneskelig S5-forsøk med aksepterte metodeavvik og ingen
   validert tidsbesparelse. Separat KI-QA/ren klon er ikke en uavhengig
   menneskelig brukertest eller oppfylt S6. Disse manglene må ikke lukkes
   bare fordi en bedre plan er skrevet nå.

## Avgrensning av dette uttrekket

Dette uttrekket har kontrollert kildenes innhold og innbyrdes motsetninger,
ikke kjørt produktkode, gjort ny brukerundersøkelse eller satt en karakter.
Revisjonens hovedrapport må supplere med faktiske kode-/testhenvisninger,
gjeldende kostnads-/tidsvedtak og konkret testopplegg, og angi hvilke av
faglærerens eksempelforslag som velges bort med begrunnelse.
