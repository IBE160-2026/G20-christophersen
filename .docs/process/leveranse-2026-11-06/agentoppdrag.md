# Subagentoppdrag og ansvarsdeling

Dato: 2026-11-06. Hovedbestillingen er bevart automatisk i [aktiv promptlogg](../prompts/session-01a1b056-1e59-7b90-bff3-d2479e545b0e.jsonl). Tre subagenter ble opprettet, alle med samme modellkapabilitet som hovedagenten. Ingen ekstra agenter ble opprettet. Hovedagenten koordinerer og integrerer. Dette referatet bevarer de sentrale instruksene og oppfølgingen; det er ikke en automatisk full transkripsjon.

## `prosess_ki` — prosess og KI-styring

Oppdrag: Les AGENTS.md, original sensorveiledning, Brief/addendum/faglærerfeedback, PRD og relevante prosess-/promptlogger. Undersøk sporbar plan–kode, reell menneskelig styring, promptloggdekning, beslutninger, korrigeringer, subagentbruk og git-historikk. Skill bekreftede opplysninger fra hull. Lag en kildebelagt sensorleseguide med konkrete casekjeder fra opprinnelig prompt til beslutning, commit, testbevis og begrensning. Ikke skriv studentens personlige refleksjon. Ingen nye funksjoner, betalte AI-kall, push, private dokumenter i Git, nye subagenter, endring av historiske logger eller egne commits.

Eierskap: bare [prosess-og-ki.md](prosess-og-ki.md). Funn til ledger sendes hovedagenten; ledger redigeres ikke av subagenten.

Mottatte sentrale funn: Hooken logger bare brukerprompter, ikke svar/verktøy/subagentmeldinger. Linjeantall er ikke antall beslutninger. Faktisk S5-stopp og brukerens erkjennelse av ufullført kontroll gir konkret menneskestyringsbevis. Annen-person-S6 mangler egen tydelig sentral oppføring. Hovedagenten integrerte leseguiden og registrerte S6 åpent; ingen attestasjon ble konstruert.

## `teknisk_test` — teknisk kvalitet og testing

Oppdrag: Les AGENTS.md, sensorveiledning, PRD/arkitektur og relevante test-/implementeringsbevis. Undersøk arkitektur, sikkerhet, avhengigheter, finansfasit, kildebinding, PDF-import og feilbaner. Kjør full unit-/integrasjonskjøring, komponenter, lint og typecheck på støttet Node 24.21.0. Send konkrete produktfeil før eventuell produktendring. Ikke bruk port 3000 parallelt med hovedagentens E2E. Ingen betalte AI-kall, push, private originaler i Git, nye subagenter eller egne commits.

Eierskap: [teknisk-og-test.md](teknisk-og-test.md) og egne testlogger i denne leveransemappen. Hovedagenten eier ren klon/E2E, npm-audit og historikkskann.

Oppfølging fra hovedagenten: installer Chromium **1248** i ny midlertidig browsermappe; ikke tilpass testene til gammel browser **1243**. Bevar sandbox-/browserfeil separat og rapporter faktiske sluttresultater. Agenten fant støttet Node-runtime, kjørte 2 238 standardtester, 50 komponenter og 7 native OCR-prøver med bestått resultat. Den presiserte skillet mellom generell deaktivert semantisk import og bevarte økonomi-/live-ruter. I første kontroll ble ingen produktkode eller testforventning endret. I et eksplisitt oppfølgingsoppdrag ga hovedagenten agenten eierskap til bare `tests/e2e/new-document-import.spec.ts` og tillegg i teknisk rapport. Agenten rettet den privatcache-avhengige tekstasserten etter kildekontroll: alle tre felles garantier om lokal behandling, ikke startet KI og ingen nye kall kreves; øvrige kilde-/hash-/budsjettasserts er uendret. Produktkode og økonomisk fasit er fortsatt urørt.

## `uavhengig_sensor` — kritisk sensorgjennomgang

Oppdrag: Vurder leveransen uavhengig av implementeringsoppgavene direkte mot alle sju kriterier og veiledningens vekter/terskler. Les originalkilder og viktig plan-/prosess-/testbevis, README og sentral kode. Finn avvik plan–produkt–tester, udokumenterte påstander og det som skiller fra en svært god besvarelse. Skill del 1 fra total emne-/bachelorkarakter. Ikke anta at andre agenters påstander er verifisert. Ingen kodeendringer, nye subagenter, betalte AI-kall, push, private dokumenter i Git eller egne commits.

Eierskap: bare [uavhengig-sensor.md](uavhengig-sensor.md). Hovedagenten sender konkret sluttdiff og bevis for ny kontroll.

Mottatte tidlige funn: utdaterte D1–D3-bannere, manglende samlet scopeavstemming, README-navigasjon fra ny hovedskjerm, for vide KI-/lagringspåstander og behov for offentlig demo først. Baseline ble vurdert til 3,85/B for del 1. Hovedagenten rettet dokumentasjonen og beholdt S5-W1, åpen S6 og private testgrenser.

## Integrasjon og kontroll

Brukerens bestilling om tre ansvarsområder, hovedagentintegrasjon og selvstendig fullføring gikk foran byggeworkflowets ekstra godkjenningspause og standard implementeringsdispatch. BMAD-skillen ble rendret én gang; det ble laget [egen leveransespec](../../implementation-artifacts/spec-leveransekontroll-2026-11-06.md). Ingen nye produktkrav ble utledet fra sensorveiledningens eksempler.

Sluttkontroll og konkrete reviewfunn/behandling dokumenteres i [arbeidsøkten](../arbeidsokter/2026-11-06-leveransekontroll.md), specens Review Triage Log og sensorrapportens daterte tillegg. Agentgjennomgang er KI-kontroll, ikke en menneskelig ekstern fag-/brukertest.

### Videreført sluttreview

De samme tre agentene kontrollerte sluttdiff før commit. Sensoragenten vurderte leveransen kritisk, teknisk agent brukte edge-case-metodikken, og prosessagenten brukte verifikasjonsgap-metodikken. Ingen ny kontekstfri Blind Hunter ble startet; agentene beholdt sin forhistorie. Det hevdes derfor ingen slik blind kontroll. Dette viderefører brukerens tre konkrete ansvarsområder og hovedagentintegrasjon.

Prosessagenten fant ingen verifikasjonsgap. Sensoragenten fant feil retensjonsbeskrivelse (15 minutter er gyldighet, ikke automatisk sletting) og en rapportsetning som viste til manglende bokstaver. Teknisk agent fant et slettet README-anker, et foreldet agentreferat om testendringen og feil antall tidsfristfeil i sandboxreferatet. Hovedagenten etterprøvde alle fem mot kilde/logg og rettet dokumentasjonen. Ingen produktendring var nødvendig. Se specens Review Triage Log og [sensorens rekontroll](uavhengig-sensor.md).
