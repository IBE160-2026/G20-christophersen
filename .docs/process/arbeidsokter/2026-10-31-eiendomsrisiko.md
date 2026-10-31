# Eiendomsrisiko og dokumentanalyse – 2026-10-31

Brukerbestillingen utvider salgsoppgaveflyten med juridiske/praktiske begrensninger, tekniske avvik og en risikooversikt i Konsept A. Tre parallelle implementeringsagenter leverte lokal juridisk analyse, teknisk analyse og brukerflate. Hovedagent integrerte kontrakter, kildevalidering, adaptere og arbeidsflyt. [Spesifikasjon og individuell reviewtriage](../../implementation-artifacts/spec-eiendomsrisiko-og-dokumentanalyse.md).

## Forankring og grenser

AGENTS.md, faglærertilbakemeldingen, sensorveiledningens fysiske sider 2–6, code-first-designet fra 29. oktober, godkjent UX fra 30. oktober og eksisterende implementasjon ble lest. Dette er brukerautorisert videreutvikling utover tidligere smal MVP; kilder og eksplisitt usikkerhet gjenbrukes, mens finans- og screeningregler beholdes. Ingen ny risikoscore eller automatisk eiendomsbeslutning innføres.

Aktiv promptlogg er session-01a18ff5-c8a5-7c42-965c-65c87cafbaf1.jsonl, identifisert gjennom den konkrete brukerbestillingen og sesjons-ID. Automatisk logging er uendret. Baseline er e55fd87cb6fe6e27e7e1ecc4a1225d5231b31482; kun denne promptloggen var uversjonert ved start.

## Implementert arbeidsflyt

1. Last opp salgsoppgave med eksisterende lokale PDF-kontroller. Ingen modellklient brukes av risikomodulen.
2. Lokale regler finner juridiske formuleringer, eksplisitte tekniske grader og avviksbeskrivelser med fysisk PDF-side og ordrett tekstområde.
3. Hovedsiden skiller dokumenterte problemer, mulige forhold og ikke undersøkte opplysninger. Detaljer viser betydning, kontrollhandling, originaltekst og original PDF.
4. Separat rapport kan lastes opp fra oversikten, med tilbakegang til integrert rapport. Filnavn og hash kontrolleres ved kildeåpning. Dokumentbytte/feil skjuler gamle funn.
5. Økonomi, økonomi-AI med eksisterende samtykker/budsjettsperrer, rapportbekreftelse og TG3-avklaring er bevart. Risikofunn gjør ingen endringer i økonomiske forutsetninger eller kontrollerte anbefalingsregler.

## Privat kontrollcase

Øvre Blekeveien 8 er undersøkt lokalt, uten å versjonere originalen eller utdrag. Dokumentet har 135 fysiske sider. Juridisk treff på fysisk side 58 klassifiseres som dokumentert manglende godkjenning av egen bruksenhet, med eksakte kildeoffseter. Ingen generell påstand om utleieforbud utledes. Originalside 58 åpnes i faktisk nettleserflyt.

Integrert rapport ligger fysisk 63–87. Eksisterende dokumentinspeksjon markerer rapportens sider som usikre med bevart tekst og grafisk innhold. Gradene er ikke sikkert tekstlige. De bevarte avviksbeskrivelsene tilbys derfor som mulige forhold med `partial-text`, `grade:null` og eksplisitt varsel, aldri som bekreftede TG-funn. Eksakt hash/navn/side/tekstområde valideres også for disse kandidatene. Rapportens ufullstendighet, uleste sider og kontrollsperrer bevares.

## BMAD-review og rettinger

Tre separate reviewlag undersøkte diffen: blind feiljakt, kanttilfeller og verifikasjonsgap. 17 individuelle funn, inklusive overlappende funn, er ført i spesifikasjonens triage. Konkrete feil ble reprodusert og rettet: benektede/historiske juridiske forhold, motsatt ordstilling ved manglende tillatelse, uklar teknisk sikkerhetsgruppe, dobbel uundersøkt-visning, avkortet avviksbeskrivelse, integrert identitetskonflikt og kildevalg ved samme hash med ulike navn. Juridiske funn fra separat rapport er nå også synlige.

Alle tre reviewere kontrollerte egne funn på nytt; de opprinnelige sporene er rettet. Ny rettingstest oppretter faktisk en aktiv brukerretting og kontrollerer at den vises som mulig forhold. Endret status på et benektet TG-utsagn gir fortsatt uløst manifestkandidat, slik at dette ikke blir en komplett tomliste.

En skjermbildemåling viste hopp-lenken i et langt elementbilde. Faktisk mobilnettleser viste at den er skjult uten fokus (nederkant −8 px); dette var et bildeopptaksartefakt, ikke en produktfeil. Desktop og mobiloversikt ble visuelt inspisert. Private skjermbilder og PDF-tekst ligger bare i ignorert private/ eller systemets tempmappe.

## Verifikasjon

Node 24.21.0 og npm 11.19.0. Installert Chromium 1248 fra lokal Playwright-cache. API-nøkkelen ble eksplisitt satt tom ved testkjøring. Sandbox blokkerte først loopback/prosessmåling; integrasjon og Chromium ble kjørt med nødvendige lokale rettigheter. Ingen betalte API-kall, push eller private PDF-er i Git.

Første full regresjon: 83 testfiler / 1667 tester bestod. Etter støtte for usikkert tekstgrunnlag og reviewrettinger bestod 110 målrettede tester. De første åtte Playwright-testene bestod, inklusive privat originalside 58 og separat rapport. Endelig full regresjon registreres nedenfor når den er avsluttet.

Full nettleserregresjon avdekket eldre tester som hardkodet port 3000 selv om konfigurasjonen støtter PAA_E2E_PORT. De ble rettet til konfigurert baseURL, slik at isolert testserver brukes også ved nettblokkering og rå HTTP-prøver. En eksisterende brukerprosess på port 3000 ble ikke stoppet; rettingen hindrer at rå HTTP-prøver utilsiktet treffer denne.

### Sluttresultat

- [Full unit-/integrasjonsregresjon](eiendomsrisiko-2026-10-31/vitest.txt): **84 testfiler / 1693 tester bestod**.
- [Bred Playwright-kjøring](eiendomsrisiko-2026-10-31/playwright-full.txt): 242 planlagte prøver, 225 bestod, 5 valgfrie eldre miljøprøver ble skippet og 12 feilet. Tre feil var utdaterte testforventninger (port og API-404); ni var tidsavbrudd med unormalt lange veggtider.
- [Isolert nykjøring av alle 12 feil](eiendomsrisiko-2026-10-31/playwright-recheck.txt): **12/12 bestod** på 22,4 sekunder. Ingen økte tidsgrenser eller svekkede produkt-/sikkerhetskrav. Samlet er alle **237 kjørte ordinære nettleserprøver** bestått gjennom fullkjøring og nykontroll, ikke gjennom én feilfri fullkjøring.
- [Dev/HMR og private filgrenser](eiendomsrisiko-2026-10-31/playwright-dev.txt): **3/3 bestod** på egen lokal port.
- Build, typecheck, lint og `git diff --check` bestod. Vite gir samme eksisterende varsel om bundle over 500 kB; ingen ny produksjonsfeil.
- [Desktop](eiendomsrisiko-2026-10-31/desktop.png) og [mobil](eiendomsrisiko-2026-10-31/mobile.png) er inspiserte syntetiske skjermbilder. Den private originalen og private skjermbilder versjoneres ikke.

API-404-testen var foreldet mot eksisterende baseline: serveren returnerer allerede JSON med `api-route-unavailable`. Den krever nå eksakt JSON-feil på API-ruter og fortsatt eksakt tekstfeil på utilgjengelige filruter. Testreviewer kontrollerte også denne rettingen. Siste juridiske presisering beholder vilkår over vanlig komma, samtidig som motsetningsledd med «men» klassifiseres separat; relevant juridisk/importregresjon består.

PAA-SO2 forblir uttrykkelig åpen i [den sentrale restoversikten](../../implementation-artifacts/deferred-work.md). Ingen gamle oppføringer eller historiske promptlogger er slettet, omskrevet eller lukket. Dette er en fungerende lokal modul med tydelig delvis dekning, ikke bevis for universell dokumentforståelse.

Terminalutdata er bevart med kun avsluttende whitespace normalisert. Den automatiske promptloggen er uendret.
