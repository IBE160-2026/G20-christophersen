# Pre-submission quality gate — semester-v1

Dato: 2026-10-27. Basis før retting:
`be895e0009ae133b3899e53236e2dfdcab853d5d`.
Dette er intern, uavhengig sensorsimulering og leveringskontroll av del 1,
ikke faktisk sensur eller ekstern S6. Del 2/refleksjonsrapporten er ikke
vurdert. Formell story-status følger [sprintstatus](sprint-status.yaml).

## Grunnlag og metode

Faktisk [sensorveiledning](../reference/course/Sensorveiledning-IBE160-Del-1.pdf),
alle sju sider, og
[faglærerens tilbakemelding](../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
er lest. Oppgaven vurderes mot godkjent smal
[SPEC](../specs/spec-IBE160/SPEC.md), ikke den erstattede fleragentvisjonen.
Tre uavhengige lesegjennomganger gransket kriteriene, resultat-/feilflyt og
leveringsoppskrift før kodeendring. De brukte faktisk kode, historikk,
testlogger og desktop-/smalbilder. De kjørte ingen tester eller API-kall.
[Funnregistrering og foreløpige skårer](pre-submission-2026-10-27/independent-initial-assessment.json).

## Simulert vurdering per kriterium

Bokstavene er en foreløpig faglig vurdering fra stikkprøver. De er ikke et
karakterløfte. Testantall, dokumentmengde eller en waiver gir ikke automatisk
høy karakter. Faktisk sensors kjøring og skjønn kan endre vurderingen.

| Kriterium / vekt | Foreløpig nivå | Begrunnelse | Vesentlig usikkerhet |
| --- | --- | --- | --- |
| 1. Prosess og KI-styring · 30 % | A | Sporbar revisjon fra lærerens omfangskritikk til smal SPEC, PRD, UX, AD-er, stories, kode og testbevis. Historikk fra september til oktober, avgrensede iterasjoner, prompts, avviste/rettede KI-forslag og ærlige avvik. [Kravsporingen](story-5-5-leveringskontroll-2026-10-27.md) og [promptmekanismen](../process/prompts/README.md) gjør prosessen etterprøvbar. | Ikke alle økter er lest. Historikken alene beviser ikke studentens forståelse; Mads må kunne forklare valg og avvik. |
| 2. Funksjonalitet og omfang · 20 % | B | Bekreftet finans, tekstbasert rapport, menneskelig kilde-/funnkontroll, separat TG3, eksakte kodeberegninger og tre faste utfall svarer på lærerens anbefalte kjerne. [4.4-sluttreview](story-4-4-b2-uavhengig-sluttreview-2026-10-27.md) gir originalt live-/S2-bevis. | S5/tidsgevinst er ikke validert. Live-utvalget er lite og fiktivt. Ekstern S6 mangler; feilflyten B3/C2 krever retting/verifikasjon i denne runden. |
| 3. Kvalitetssikring og testing · 15 % | A | Uavhengige fasiter, eksakte terskel-/blank-/null-/race-/feilprøver og konkrete reviewrettinger. [Tidligere full regresjon](sluttforing-2026-10-27/post-patch-regression.json) og [uendret standardport](sluttforing-2026-10-27/standard-port-regression.json) har bevarte faktiske logger. | Antall er ikke kvalitet. Nye state-/testmiljøendringer må prøves før tidligere bevis kan videreføres som relevant. S5 og faktisk eksternt rent miljø dekkes ikke av automatisering. |
| 4. Design og brukeropplevelse · 10 % | B | [Faktiske resultatbilder](sluttforing-2026-10-27/after-final/) viser konsekvent grafitt/petrol, anbefaling før økonomi, fire faste nøkkeltall, status/grad/opphav som tekst, kilder og detaljer ved behov. [UX-review](sluttforing-2026-10-27-review.md) dokumenterer smalflate/fokus og korrigerte funn. | Nybrukerforståelse uten forklaring er uprøvd. Lang TG3-tekst er tung på smal skjerm. Elektrikereksemplet for taklekkasje er en konkret svakhet; ytterligere forkorting er skjønn. |
| 5. Kodekvalitet og arkitektur · 10 % | B | Rene domain-/contracts-moduler, frontend-eid økt/snapshot og isolert PDF-/adapter-/HTTP-grense samsvarer med AD-ene. Finans/terskler er eksakte desimaltall i kode, aldri KI eller avrundet visning. | Store UI-/state-moduler gir vedlikeholdsrisiko, men begrunner ikke omskriving før levering. Stikkprøver, ikke en full formell arkitekturrevisjon. |
| 6. README og kjørbarhet · 10 % | B | Prosjektspesifikk oppskrift med pins, npm ci, build/demo/dev, F1–F4, offline, kontroll/feil/retur, tester og valgfri sikker live-konfigurasjon. Tidligere intern ren installasjon og standardportkjøring er dokumentert. | E2E arvet live-miljø ved baseline, en konkret sikkerhets-/reproduserbarhetsfeil som må rettes. A-nivå kan ikke hevdes fra gjennomlesing: annen person må komme i mål. Bare macOS er egenprøvd. |
| 7. Ryddighet i repoet · 5 % | B | Tydelig src/tests/.docs, låsfil/fiktive fixtures, én sentral deferred-oversikt og ignorering av private originaler, miljøfiler, avhengigheter og genererte utdata. Relevante prosess- og reviewbevis beholdes. | Mønstergjenkjenning garanterer ikke fravær av alle hemmeligheter. Eventuell offentlig deling av kurskilder er en menneskelig rettighetsavklaring. Dokumentmengden krever gode inngangslenker. |

Sensorveiledningens hjelperegning med A=5/B=4 gir **4,45 → B i del 1**
for denne foreløpige profilen. Nærhet til A-grensen er ikke evidens for A;
vekter og skår er støtte til skjønn. Del 1 teller 70 % av samlet mappe,
men ingen samlet karakter er beregnet fordi del 2 ikke er vurdert.

## Prioritering og avgrensning

Sentrale statuser og lukkebevis finnes bare i
[deferred-work](deferred-work.md). Dette er støtteunderlag for triage.

1. **PG1, høy verdi:** Bind E2E-serverne til demo og tom nøkkel uansett
   arvet miljø. Bind build-/nøkkelhelperen til demo; behold dens fiktive
   byggsentinel. README-devstart velger demo eksplisitt. Dette retter
   NFR-3/NFR-4, CAP-8, AD-6/AD-9 og 5.5 AC3/AC6 uten produktendring.
2. **4.3 B3/C2, middels:** Bevar første feil, mål og delresultat når et
   manuelt nytt forsøk avvises som duplicate. Forklar sperren. Backend-
   markør, kostnadsvern, legitime manuelle forsøk og HTTP-kontrakt beholdes.
3. **PG2, liten men relevant:** Erstatt generisk elektriker-eksempel med
   relevant fagkyndig og dato/referanse. Ingen ny faglig klassifisering,
   endret validering eller endring av låste elektriske eksempler/fasit.
4. **Subjektivt, ikke prioritert som feil:** ytterligere ombygging av
   resultatets informasjonsstruktur og oppdeling av store komponenter.
   Gjeldende resultat har tydelig anbefaling, nøkkeltall og kildegrunnlag;
   en ny designretning trenger ikke innføres før ekstern S6.

## Story 5.5 før ekstern S6

Den eksisterende [leveringskontrollen](story-5-5-leveringskontroll-2026-10-27.md)
er fortsatt autoritet for FR/NFR/CAP/AD/UX-DR og S1–S6/K1–K3. Denne runden
supplerer 5.5 AC3/AC4/AC5/AC6 med konkrete rettinger og versjonsbundet
ny verifikasjon; den oppretter ikke et nytt sett produktkrav.
Avhengighetstreet/låsfilen beholdes fra den tidligere rettede versjonen.
Tidligere datert audit gir ingen garanti om fremtidige advisories.

5.5 kan fortsatt ikke settes done: ekte 5.4/S6 mangler, og 4.5s formelle
AC-akseptanse er ufullstendig under S5-W1. Waiveren er akseptert prosjekt-
disposisjon, ikke et bestått S5-mål. Ingen opprinnelige observasjoner endres.
Eventuell offentlig deling av eksisterende kurskilder avklares av Mads.

## Neste menneskelige gate

Etter verifiserte rettinger og uavhengig sluttreview fryses en konkret lokal
commit til en ren S6-eksport med SHA-256/inventar. Dette er intern klargjøring,
ikke et gjennomført eksternt forsøk. Den [korte instruksen](story-5-4-ekstern-instruks.md)
og [bevismalen](story-5-4-forberedelse-2026-10-27.md) brukes videre; alle
faktiske observasjoner skal komme fra den andre personen.

Mads avtaler person/rent miljø, gir akkurat den oppgitte versjonen, mottar
faktisk logg og avvik, og sørger for nødvendig retting/rekontroll før
5.4-/leveringsakseptanse. Før innlevering må riktig sluttcommit være gjort
tilgjengelig i den avtalte innleveringskanalen; ingen push er gjort her.

## Faktisk verifikasjon etter retting

[Fullrundens rå indeks](pre-submission-2026-10-27/regression.json) og
[rekontrollens rå indeks](pre-submission-2026-10-27/regression-recovery.json)
bevarer både rødt og grønt, med eksakte kommandoer, miljøgrense og varighet.
Hovedrepo/standardport 3000 er brukt uten porttilpasning. Node 24.21.0 og
npm 11.19.0; eksternt nett OS-sperret, loopback tillatt. E2E/dev/buildhelper
har fiktiv arvet live-modus/nøkkel for å prøve miljørettingen. Ingen ekte
nøkkel eller betalt leverandørkall.

| Kontroll | Faktisk utfall og bevisgrense |
| --- | --- |
| Full Vitest | [1088/1088, 40 filer](pre-submission-2026-10-27/vitest.txt) før siste korte duplikatkunngjøring. |
| Full bygget E2E | [195/197 bestått](pre-submission-2026-10-27/e2e.txt); to F4-varianter feilet kun på gammel eksplisitt generisk elektrikerveiledning i testen. Den røde kjøringen beholdes. |
| Målrettet endelig rekontroll | [134/134 Vitest](pre-submission-2026-10-27/recovery-targeted-unit.txt) og [6/6 E2E](pre-submission-2026-10-27/recovery-targeted-e2e.txt): begge F4-varianter og duplikat/transport i demo/kontrollert live. Forventet hjelpetekst er oppdatert; alle tall-/regel-/kildekrav beholdes. Skjermleserkunngjøring inngår. Ingen ny fullrunde påstås. |
| Dev / komponent | [3/3 dev](pre-submission-2026-10-27/dev.txt), [37/37 komponent](pre-submission-2026-10-27/components.txt). |
| Bygg-/nøkkelgrense | [204 frontendfiler, 0 nøkkellekkasjer](pre-submission-2026-10-27/build-key.txt), build/demooppstart med fiktiv arvet live bestått. [7/7 helperprøver](pre-submission-2026-10-27/build-helper.txt). |
| Typecheck/build/lint | [Endelig build med typecheck](pre-submission-2026-10-27/recovery-build.txt) og [lint](pre-submission-2026-10-27/lint.txt) exit 0. |
| Visuell kontroll | [16 nye bilder](pre-submission-2026-10-27/visual/) av F1/F2/F4-resultat og feil/duplikat på 1440×900 og 390×844. Alle åpnet av hovedagenten. Ingen horisontalt overløp eller eksterne requests i [observasjonene](pre-submission-2026-10-27/visual/observations.json). |

Den [avgrensede kildedeltaen](pre-submission-2026-10-27/recovery-source-delta.json)
etter fullrunden består av kort duplikatstatus i eksisterende live-region
og relevante testforventninger. [Endelig kildemanifest](pre-submission-2026-10-27/regression-recovery-source-manifest.json)
og [stabilitetskontroll](pre-submission-2026-10-27/regression-recovery-source-stability.json)
binder de grønne rekontrollene til faktisk kilde; ingen finans-/screening-
eller backendregel ble endret etter fullrunden. Derfor er ny fullrunde
unødvendig; berørte prøver er faktisk kjørt på nytt.

Visuelt har alle tre utfall tydelig tekstlig anbefaling, avgjørende regler,
navngitte/enhetsmerkede nøkkeltall og neste handling. Rapportfunn og
kontrolldetaljer er tilgjengelige under; Uavklart TG3 gir fortsatt prioritet
foran god økonomi. Smal visning krever vertikal rulling. Det er ikke en ny
feil eller ekstern bekreftelse på intuitivitet. TG3-teksten er fortsatt
omfattende; ingen skjønnsmessig redesign er gjort.

[Repo-/historikkontroll](pre-submission-2026-10-27/repository-audit.json)
skanner de oppgitte nøkkelmønstrene uten å gjengi verdier. Kjente fiktive
redigeringstester klassifiseres eksplisitt. Alle 209 originalbevis fra det
forrige bevaringsmanifestet er byteidentiske. Ingen rettighets- eller
universell hemmelighetsgaranti utledes av mønstersøket.


Faktisk kode-/bevischeckpoint: `f105216703033a34163ce9eb94df9f060fd4a0ce`. Etterfølgende
lukkedokumentasjon og eksportkvittering endrer ingen produktkode eller
testforventning. [Endelig kilderelevans](pre-submission-2026-10-27/final-source-relevance.json)
bekrefter at siste reviewtillegg bare er én ny requestId-test, prøvd 35/35.


## Ferdig intern gate — 2026-10-28

[Uavhengig slutt-review med full triage](pre-submission-review-2026-10-27.md)
og separat eksportrettingsreview har ingen gjenstående verifiserte funn.
B3/C2 og PG1–PG5 er verifisert lukket i den sentrale oversikten; første
feilede eksportforsøk er bevart. Faktisk ren S6-kandidat, sidefiler og
SHA-256 står i [overleveringen](story-5-4-s6-overlevering-2026-10-28.md).
Arkivets 1578 filer er byte-/moduskontrollert mot eksakt Git-commit;
[kilderelevansen](pre-submission-2026-10-27/s6-source-relevance.json)
bekrefter samsvar med det siste verifiserte produkt-/testmanifestet.

En verifisert identisk kopi er lagt i Git-ignorert `private/s6-handoff/`.
Arkivet og dets midlertidige kopier committes ikke. Det inneholder ikke
Git-historikken og er for ekstern S6, ikke en erstatning for prosjektets
endelige Git-innlevering. Senere checkpoint registrerer bare disse bevisene
og statuser, uten produkt-/testendring. Neste arbeid krever ekte testperson.
