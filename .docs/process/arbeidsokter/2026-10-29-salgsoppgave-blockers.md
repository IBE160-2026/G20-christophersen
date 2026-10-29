# Arbeidsøkt: count-støtte og privat ekte prøvegrunnlag

Dato 2026-10-29. Baseline `2b1afd2f875373fcff933a021684a0793c83ceb4`.
Mads bestilte to parallelle subagenter, integrasjon, uavhengig BMAD-review,
tester og lokal commit med aktiv promptlogg; ingen push eller betalt
generering. Stopp når faktisk dokument kreves.
[Aktiv promptlogg](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl).

BMAD Build ble rendret én gang for dette nye oppdraget. Brukerens eksplisitte
parallelle bestilling og implementeringsfullmakt har forrang foran generelle
sekvens-/godkjenningssteg i workflowen. [Spec](../../implementation-artifacts/spec-salgsoppgave-blocker-resolution.md)
fanger scope, AC og eksklusivt fileierskap. Agentene undersøkte først, fikk
specen, og implementerte hver sin del. Root eier integrasjon, verifikasjon,
review, prosess/deferred og commit. Bare aktiv prompt var endret ved start.

Agent 1 kontrollerte OpenAI Docs og faktisk SDK 6.9.1, implementerte
count-request, SDK-grense, bundet kvittering, ærlig proveniens og
konservativt budsjett. Agent 2 implementerte privat PDF.js-mottak, uutfylt
menneskelig fasit/dekningsregnskap og kilde-/frysekontroll. Ingen overlappende
kildeendringer. Root integrerte kommandoer, privat preflight og justerte
bare teller-/pristekst i eksisterende UI.

Den tidligere lokal-tokenizer-blokkeringen får en dokumentert serverløsning:
`responses.inputTokens.count` / `POST /responses/input_tokens`. Prompt,
schema og reasoning inngår i støttet inputprojeksjon; øvrige
genereringskontroller bindes gjennom hele requestdigesten. Lokal encoding
antas ikke. Stubkall og faktisk servertelling kan ikke forveksles eller
oppgraderes med importert JSON.

Count-prisen er fortsatt ikke eksplisitt etablert i de kontrollerte
offisielle kildene. Ingen «gratis»-antakelse; serverfabrikken stopper før
nettverk og krever senere dokumentert pris og eventuell reservasjon under
samme analysetak før åpning. Dette er en faktisk forutsetning, ikke en
løst-erklært kvalitetsport. Ingen nøkkel eller faktisk count/generering ble
brukt i økten.

Alle menneskelige input i automatiske tester er uttrykkelig simulert på
tidligere syntetiske originaler. De er ingen ny menneskelig verifikasjon av
et ekte dokument. Faktisk salgsoppgave er ennå ikke mottatt; ingen reell
representativitet eller modelltreff er påstått.

Sensorveiledning side 2–6 og faglærerfeedback ble lest for sporbarhet, fasit,
vanlig kode for finans og vern av ekte originaler. Finans-/screeningregler og
historiske bevis skal bevares. Endelig test-/reviewutfall føres før commit.

## Sluttkontroll

Tre uavhengige BMAD-lag ga 13 første funn; etter retting fant nykontrollen
ett tallformatavvik. Alle 14 fikk egen triagerad; ett dokumentfunn var allerede
oppfylt, og de 13 reelle forholdene er rettet. Alle siste nykontroller er tomme.
Samme to implementeringsagenter rettet egne filer; root integrerte og prøvde
plan/fasit-paritet og fysisk kildebasert matching. Ingen reviewfunn er utsatt.

Root kjørte fullsuite 1445, deretter 1453 og til slutt 1455/1455 i 59 filer
etter siste formatretting. Endelig bygg/typecheck og lint består. En midlertidig
typesjekkfeil i en eksplisitt simulert mock ble rettet; rått avvik er bevart.
159 låste filer og tidligere prompt-/deferred-prefiks er bevart. Ingen private
filer er versjonert. To serialiserte SDK-payloads er bytekontrollert; syntetisk
kontrollpakke har null kall/reservasjoner, USD 0,20 igjen og ready:false.

Stoppunkt: faktisk PDF fra Mads kreves for videre privat inntak og selvstendig
menneskelig fasit. Server-count-prisen må avklares før et faktisk tellekall;
ingen slik pris-/kontotilgang eller menneskelig handling er påstått verifisert.
Ingen API-count, betalt generering, push eller finans-/screeningendring.
Lokal commit inneholder denne økten, test-/reviewbevis og aktiv promptlogg.
