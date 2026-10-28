# FINN-import — gjennomførbarhet og minimalt design

Dato: 2026-10-28. Beslutning FINN-1. Produkteier: Mads, bestilling i aktiv økt.
**Resultat: NO-GO for automatisk henting nå. Ingen verifisert tillatt tilgang
for import av vilkårlige tredjepartsannonser. Ingen importkode er implementert.**
Dette er en avgrenset tilgangsport, ikke en avvisning av produktretningen.

## 1. Git og sikring før arbeidet

- Rent arbeidstre ved start. `main`, `origin/main` og `origin/HEAD` =
  `ff3ea6e4431d5a104307487c7ec577c15980d2aa`.
- `git rev-list --left-right --count HEAD...@{upstream}` = `0 0`.
  `git log --branches --not --remotes` ga ingen commits.
- Første nettlesing fra terminalen feilet på DNS. Etter tillatt nettlesing med
  `git ls-remote origin refs/heads/main` returnerte faktisk GitHub samme SHA.
  Påstanden om mange usendte commits gjelder derfor ikke nåværende tilstand.
- Full `git bundle --all` ble laget og verifisert før dokumentendringer.
  Varig Git-ignorert kopi: `private/finn-checkpoint/before-finn-2026-10-28.bundle`.
  SHA-256 står i sidefilen `SHA256SUMS`. Alle 22 refs og komplett tilgjengelig
  historikk er med; ignorerte filer er ikke en del av Git-bundle.
- Ingen push, reset, rebase, historikkoverskriving eller betalte API-kall.

## 2. Tilgangssjekk og stoppgrunnlag

Primærkilder kontrollert 2026-10-28:

1. [FINNs brukervilkår §6](https://www.finn.no/vilkar/brukervilkar-finn):
   automatisert kopiering krever uttrykkelig skriftlig samtykke. Privat bruk
   er ikke dokumentert som en generell tillatelse til denne integrasjonen.
2. [Offisiell API-tilgang](https://www.finn.no/api/): krever forretningsrelasjon,
   eierskap til data og avtale. Ingen generell privat tilgang er tilbudt på siden.
   En meglers tilgang til egne annonser dokumenterer ikke tilgang til alle annonser.
3. [robots.txt](https://www.finn.no/robots.txt): innledningen krever skriftlig
   tillatelse til crawling. Enkelte annonsebaner er tillatt for indeksering,
   mens enkelte navngitte roboter er sperret for eiendom. Disse rutereglene
   er ikke dokumentasjon på vår rett til uthenting.
4. [API-vilkårslenken](https://www.finn.no/api/terms) peker til en PDF som ga
   404 under sjekken. Dens innhold er ikke verifisert eller antatt godkjent.

Ingen prosjektspesifikk avtale eller skriftlig tillatelse er dokumentert i
undersøkt grunnlag. Konklusjonen er en konservativ prosjektbeslutning ut fra
publiserte tilgangskrav, ikke en generell juridisk vurdering av all privat bruk.
Det er ikke gjort direkte annonsehenting fra app/terminal, endpoint-probing,
innlogging, CAPTCHA-forsøk, cookie-/agentetterligning, proxy eller tredjepartsskraping.
Søkeindeksutdrag er kun brukt til avgrenset feltkartlegging, aldri som importkanal.
HTML, innebygd JSON og nettleserautomatisering løser ikke tilgangsporten.

**Port for videre implementering:** dokumentert tillatelse som dekker andres
boligannonser, formålet, relevante felt, oppdatering og lokal behandling, samt
avtalt teknisk kanal og eventuelle bruksgrenser. Deretter må faktiske API-svar
og feltdekning verifiseres. Ikke kontakt FINN eller kjøp tjenester automatisk.

## 3. Representative annonseeksempler — begrenset feltkartlegging

Dette er søkemotorens indekserte utdrag, ikke ferske komplette annonser eller
bevis for at import virker. Ingen HTML/API-parser, svartid eller full feltdekning
er verifisert. Tallene er observerte eksempler, ikke anbefalinger eller fixtures.
Utvalget dekker enebolig, selveierleilighet og andelsleilighet.

| Eksempel og kilde | Observasjon | Følge for design |
| --- | --- | --- |
| [Selveierleilighet 473915084](https://www.finn.no/realestate/homes/ad.html?finnkode=473915084) | Prisantydning 3 690 000; gjeld 184 211,63; omkostninger 97 940 uten valgfri pakke; dokumentavgift 96 850. Felleskostnader beskriver flere inkluderte ytelser. | Bevar øre, skill obligatorisk/valgfritt, og hold gjeld adskilt fra kontantoppgjør. Dokumentavgift må ha eget kildegrunnlag. |
| [Andel 478329972](https://www.finn.no/realestate/homes/ad.html?finnkode=478329972) | Prisantydning 3 050 000; gjeld 202 949; omkostninger 1 090; totalpris 3 254 039; felleskostnader 7 001/mnd inkluderer gjeldsbetjening og offentlige avgifter uten beløpsdeling i utdraget. | Kan ikke sette hele felleskostnaden i D eller legge gjeldsbetaling til på nytt. Ingen oppgitt dokumentavgift betyr ikke bekreftet null. |
| [Enebolig 478630078](https://www.finn.no/realestate/homes/ad.html?finnkode=478630078) | Prisantydning 12 000 000; omkostninger 301 090; dokumentavgift 300 000; kommunale avgifter 31 473/år og eiendomsskatt 5 885/år. Valgfri pakke vises separat. | Bevar periode og kilde; ikke anta at disse to løpende postene er komplett drift. Manglende fellesgjeld i utdraget blir ukjent. |

Utvalget viser at økonomiske opplysninger finnes offentlig, men ikke at alle
relevante felt finnes i alle annonser eller kan hentes lovlig av appen.

## 4. Autorisert omfang og minimal brukerreise

Dette tillegget registrerer brukerens nye retning foran tidligere avgrensning
mot annonseimport og automatisk låneplan i SPEC. Eksisterende levert v1 og
historiske akseptanser endres ikke i ettertid.

1. Lim inn URL til én FINN-boligannonse. Automatisk import bare via verifisert
   tillatt kanal. Vis tilgjengelige felt med kilde og konkrete mangler.
2. Brukeren kontrollerer/retter tall; egenkapital justeres med slider og
   tilgjengelig tallfelt. Rente/løpetid har synlige, redigerbare forutsetninger.
3. Brukeren laster selv ned og laster opp tilstandsrapport-PDF i eksisterende flyt.
4. Eksisterende deterministiske beregninger, bekreftelser og TG2/TG3-kontroll
   beholdes. Manglende leie/drift gir fortsatt utilstrekkelig økonomisk grunnlag.

Ute nå: leieestimat, driftsestimat, reparasjonsestimat, automatisk PDF-nedlasting,
automatisk søk/scouting, rangering, hosting og nye betalte tjenester.
Oppgitte kostnader kan registreres; de skal ikke suppleres med gjetninger.
Rente og løpetid er brukerforutsetninger, aldri banktilbud eller FINN-fakta.
Numeriske standardverdier er ikke avtalt eller implementert i denne økten.

## 5. Minimalt implementeringsdesign — betinget, ikke levert

- **Kontrakt:** nytt listing-grunnlag ved siden av `FinancialBasis`, med FINN-id,
  kanonisk URL, tilgangsstatus og felt for prisantydning/kjøpesum, totalpris,
  omkostninger (obligatorisk/valgfritt), dokumentavgift, øvrige engangsgebyrer,
  fellesgjeld, felleskostnader, kommunale avgifter, eiendomsskatt og øvrige
  eksplisitt oppgitte løpende kostnader. Eieform gir kontekst.
- Hvert felt har `available | missing | unavailable | conflict`, desimalstreng
  eller null, NOK/periode/år, URL, kildefelt eller kort utdrag og hentetid.
  Null er aldri 0. Eksplisitt oppgitt 0 må fortsatt bekreftes. Brukerendring
  beholder originalt opphav og skilles fra import. Ukjent periode/år beholdes.
- **Backend:** én eksplisitt importforespørsel gjennom separat tillatt adapter.
  Ingen vilkårlig URL-fetch. Valider HTTPS, eksakt FINN-vert og avtalt boligbane/
  numerisk id; avvis credentials, porter og lookalike-verter. Ikke følg vilkårlige
  redirects. Avtalte API-adresser er fast konfigurert på serveren; hemmeligheter
  forlater aldri backend. Sett endelig frist, størrelsesgrense og ingen automatisk
  retry. 401/403/429, fjernet annonse og utilgjengelig kanal får egne forklaringer.
- **Frontend:** innliming → importstatus → felt/kildekontroll → bekreftelse.
  Nye forespørsler/objektbytte må avvise sene svar og gjøre gammelt resultat
  utdatert. Ikke overskriv manuelt endrede felt eller gjenbruk forrige objekts
  verdier ved feil. Bevar kildekonflikter til brukeren løser dem.
- **Fallback:** tilgangsfeil viser «Automatisk FINN-import er ikke tilgjengelig.
  Registrer tallene manuelt og oppgi annonselenken som kilde.» Dette er dagens
  brukbare reserveflyt via eksisterende finansregistrering; meldingen og nytt
  URL-felt er design, ikke levert UI. Ingen falsk importknapp eller demoimport.

### Kobling til eksisterende finans uten endrede formler

- Eksisterende P = kjøpesum/prisantydning + fellesgjeld, **uten omkostninger**.
  FINNs totalpris må ikke kopieres direkte til P. Uavklart gjeld eller sprikende
  summer blokkerer automatisk forslag; vis alle kandidatverdier.
- Omkostninger/dokumentavgift vises separat fra yieldgrunnlaget. Ikke legg
  dokumentavgift til igjen når den inngår i omkostningene. Ingen generell
  dokumentavgiftsprosent eller eieformbasert null uten dokumentert grunnlag.
- Separat låneforslag: kontantbehov = kjøpesum + valgte engangskostnader;
  eget lån = kontantbehov − egenkapital. Fellesgjeld følger boligen og finansieres
  ikke en gang til i eget lån. Slider 0–kontantbehov, med samme verdi i tallfelt;
  beløp utenfor intervallet gir forklaring. Låneforslaget er ingen lånegodkjenning.
- For annuitet med positiv rente: m = B·r/(1−(1+r)^(-n)), r = nominell årsrente/12,
  n = antall måneder; ved 0 rente m = B/n; ved B=0 er m=0. Ugyldig løpetid eller
  uavklart kostnadsgrunnlag gir ingen beregning. Implementer med eksisterende
  desimalverktøy og eksplisitt avrunding; årlig egen gjeldsbetjening = 12·m.
- J = eget lån renter/avdrag + kjent fellesgjeldsbetjening. Bankforutsetningene
  skal ikke brukes til å gjette fellesgjeldens vilkår. D krever kjent driftsandel
  og kjent inkludering av øvrige poster. Usplittede felleskostnader kan vises,
  men gir ikke komplett D/J. Kommunale avgifter/skatt som allerede er inkludert
  i felleskostnader telles ikke på nytt. Leie L og Ymin registreres fortsatt manuelt.

## 6. BMAD-spor og akseptansekriterier

Arbeidsenhet FINN-1 er **tilgangsblokkert, ikke done**. Ingen nye epics eller
aksepterte storyresultater opprettes. Dette er nå prioritert produktarbeid.

| AC | Observerbart kriterium før implementering kan aksepteres | Eksisterende spor |
| --- | --- | --- |
| FI-AC1 | Dokumentert rett til den faktiske kanalen/annonsegruppen; ingen nettforespørsel uten godkjent tilgang | NFR-4, AD-9; ny tilgangsport |
| FI-AC2 | Avtalte annonsetyper testes mot autoriserte svar; hvert økonomifelt har kilde, periode og ærlig fravær/konflikt | CAP-1, FR-1–FR-4, AD-4 |
| FI-AC3 | P ekskluderer omkostninger; fellesgjeld, dokumentavgift og inkluderte kostnader telles én gang | CAP-1/5, FR-12–FR-14, S1, AD-7 |
| FI-AC4 | Slider/tallfelt samsvarer; redigerbare forutsetninger; nullrente/null lån og ufullstendig D/J prøves mot uavhengig fasit | Ny låneforberedelse → CAP-5; eksisterende formler beholdes |
| FI-AC5 | Feil/tilgangsmangel gir forklaring og manuell fallback, ingen falske nuller, suksess eller overskriving; sene svar avvises | CAP-6/7, FR-15–FR-18, AD-2/5 |
| FI-AC6 | Manuell PDF og eksisterende demo/TG2/TG3 virker uten FINN-nett; endret grunnlag krever ny bekreftelse | CAP-2–4/7/8, FR-6–FR-11, NFR-3, S6 |

Senere verifikasjon: målrettede kontrakt-/adaptertester med autoriserte eller
syntetiske svar, finansfasit for gjeld/inkludering/annuitet, komponentprøve av
mangel/fallback/slider og relevant regresjon. Ingen nett-/paid-test før tilgang.
Ingen produkttester er kjørt nå: bare dokumentasjon er endret.

## 7. Eksisterende bevis og neste handling

[S5-W1](story-4-5-s5-waiver-2026-10-27.md) og formell 4.5-status beholdes;
ikke start flere S5-forsøk. [S6-overleveringen](story-5-4-s6-overlevering-2026-10-28.md)
med kandidat `7e55652` beholdes som frosset grunnlag. 5.4 forblir backlog, 5.5
in-progress. Ingen ekstern S6 eller sluttakseptanse påstås her.
En senere produktendring må få relevant regresjon og egen oppdatert S6-kandidat;
den skal ikke gjenbruke gammel readiness som bevis for ny funksjonalitet.

Neste nødvendige avklaring er FINN/Vend-tillatelse og avtalt datatilgang, ikke
parserbygging. Deretter kan FI-AC1 etterprøves og resten implementeres smalt.
Eksisterende manuell registrering og rapportanalyse kan brukes i mellomtiden.

## 8. Senere bestilling og godkjent videre arbeid 2026-10-28

Avsnitt 1–7 bevares som opprinnelig gjennomførbarhetsvurdering, før de to
begrensede API-forsøkene og den nye implementeringsbestillingen. Det senere
`open_page`-forsøket på 476576649 viser teknisk åpning gjennom Responses
web_search; det er ikke uavhengig feltfasit eller dokumentasjon på generell
tilgangstillatelse.

Brukeren har nå uttrykkelig bestilt utvikling og godkjent
[den konkrete implementeringsspecen](spec-finn-import.md) for motor, mapping,
UI og offline tester med deaktivert produksjonsrute. Dette erstatter stoppet
for selve offline implementeringen i avsnitt 2 og 7. Porten for faktisk
automatisk henting/aktivering består. Ingen nye betalte kall er autorisert.
FI-AC1–FI-AC6 er opprinnelig designspor; specens FI-1–FI-6 konkretiserer den
godkjente deaktiverte leveransen uten å påstå at tilgangsporten er lukket.
