# Story 2.8 — uavhengig full BMAD code review

Dato: 2026-10-21. Target: `fee2f76e5e94745cc1df43a45ae103cf633981c0..c0594fbc5157dad1e4b335bcf708c7d265436d4e`.
25 filer, +883/−13, 84 966 bytes / 1148 linjer diff. Full specmodus.
Ny reviewagent etter implementeringsagentens lokale checkpoint.

## Metode og autoritativt grunnlag

`bmad-code-review/SKILL.md`, defaults/customization, config og steg 1–4 er
fulgt. Resolverens dokumenterte fallback ble brukt etter cachetilgangsfeil;
ingen team-/user-overrides, prepend/append/persistent facts eller on_complete.
Brukerens uttrykkelige krav overstyrer parallell utførelse: fire selvstendige
reviewlag ble startet og avsluttet **ett om gangen**, uten egne filendringer
mens lag arbeidet. Blind, edge og verification fikk context-free oppdrag;
acceptance fikk story/kontraktkontekst. Bare 2.8 er reviewet/rettet.
Eksplisitt bestilling forhåndsautoriserer konkrete rettinger, status og lokale
commits. Ingen ny produkt-/arkitekturbeslutning, push eller senere story.

Grunnlag: AGENTS.md, sensorveiledningens syv sider lest direkte med lokal
PDF.js-tekstekstraksjon, lagret faglærertilbakemelding, epics.md 2.8 AC1–AC4,
storyspec, Epic 2-kontekst, SPEC/grensekontrakter, låst EXPERIENCE
finding-edit/origin-detail, validering/fokus og statuskunngjøring, arkitektur
og sprintplan/-status. PDF-tekstlesingen var vellykket; testskriptets etterfølgende
`d.destroy()` var feil API (task eier cleanup), uten påvirkning på produkt/tester.
Kursgrunnlaget støtter sporbar, avgrenset utvikling og faktiske tester; ingen
nye produktkrav utledes fra det.

## Fire lag og alle kandidater

Blindlagets gulv: `N=min(floor(sqrt(84,966)+1),10)=10` (kB=84,966).
Gulvet gir kandidater, ikke ti bekreftede produktfeil.

| ID / kilde | Dom, konkret bevis og behandling |
|---|---|
| B1 / blind | medium, patch: enhver draft-endring satte errors={}. Ny reducerprøve og browserprøve var røde: gyldig grad fjernet fortsatt ugyldig beskrivelse/side. Samme domain-validering brukes nå til å beholde allerede viste feil til respektive grunnlag er gyldig; nye feil vises fortsatt ved eksplisitt Bruk. |
| B2 / blind | medium, patch: status var vanlig tekst; eksisterende live-region endret bare analysestatus. Ny browserprøve fant ingen kontrollstatusregion. En kort lokal polite/atomic-status kunngjør Bekreft, gyldig Bruk og Avbryt etter faktisk tilstandsovergang, uten å flytte fokus eller avspille gamle handlinger ved remount. |
| B3 / blind | medium, patch: errors-effekten fokuserte første feil ved hver remount. Ny browserprøve var rød etter funnbytte og retur. Feilfokus armeres nå kun ved nytt eksplisitt Bruk-forsøk. Vanlig redigering og funn-/trinnretur beholder sitt fokus. |
| B4 / blind | medium verifikasjonsgap, patch: mismatchet dokument/hash på originalkandidaten manglet egen korrigeringsprøve. To nye negative reducerprøver viser original som usikker/ubekreftbar før eksplisitt Bruk, binding av brukt retting til valgt rapport og uendret original mismatch. Originalside er bevart som synlig oppgitt opphav, ikke automatisk bekreftet støtte. Ingen ny kildepolicy. |
| B5 / blind | medium verifikasjonsgap, patch: ingen test hadde kontrolltilstand på to funn samtidig. Ny prøve lar A ha brukt retting, bekreftelse og nytt utkast mens B redigeres/brukes/bekreftes/avbrytes; As komplette kontrollobjekt og gjeldende kilde bevares. |
| B6 / blind | medium verifikasjonsgap, patch: ny brukt retting etter første retting/bekreftelse manglet. Ny prøve krever andre kilde/tekst, revisjon 2, opphevede enkelt-/listebekreftelser og identisk opprinnelig outcome. |
| B7 / blind | medium verifikasjonsgap, patch: sen report-finding-draft manglet eksplisitt generasjonsprøve. Ny prøve med samme findingId og ny generasjon krever identisk tilstand ved gammel hendelse. |
| B8 / blind | medium, patch etter egen reproduksjon: eksisterende 320-prøve målte bare overflow/fokusidentitet. Ny prøve ved 850×480 viste at preventScroll beholdt Korriger utenfor synlig workspace etter tastatur-Bruk. Fokusretur bruker nå vanlig focus(), og geometri krever hele fokuserte knappen innen faktisk synlig arbeidsflate etter Bruk og Avbryt. |
| B9 / blind | false som produktfeil: kombinert ugyldig rapportidentitet og feltfeil er ikke nåbart kontrollgrunnlag. AnalysisOutcomeSchema og HTTP-/reducerkorrelasjon validerer fullført valgt hash/navn før finding-handling; kontrollgrenens identitetsvern stopper mismatch. Direkte domain-kall avviser ugyldig identitet. Ingen ekstra produktguard eller ny regel for umulig state. |
| B10 / blind | low, direkte statusretting: epickontekst og README hadde 2.8 «ikke startet» samtidig som ny status sa review. Gjeldende status og historiske avsnitt merkes/synkroniseres etter bestått review; ingen låste produktkrav endres. |
| E0 / edge | ingen funn. Instruksfil/diff lest, handlinger/utkast/revisjoner/rapportidentitet/kildegrenser sporet før claims ble lest. Første sluttretur [] ble fulgt opp med tekstbekreftelse på fullført tracing; ingen ufullført linse. Én feil relativ referansesti ble korrigert til skillens references/, ingen filendring. |
| V1 / verification | medium, patch, samme rot som B5. Repo-søk/testlesing viste at mutasjonen findingControls:[next] ville passert tidligere tester og slettet andre funns kontroller. Den nye to-funnsprøven beskytter den konkrete regresjonen. |
| A1 / acceptance | medium, patch, samme rot som B1; EXPERIENCEs eksplisitte regel om vedvarende feltfeil brutt. Alle øvrige AC1–AC4 kontrollert uten andre sikre brudd. |

Seks patchgrupper i specens Review Findings: fire faktiske UX-feil, samlet
målrettet verifikasjon og enkel kontinuitetssynkronisering. Ingen decision-needed,
ingen defer, én false. Ingen uløst medium/high etter grønn sluttregresjon.

## AC mot faktisk kode og egne prøver

| AC | Kontroll og resultat |
|---|---|
| AC1 | Bekreft endrer bare confirmedRevision på gjeldende findingControl. Grad/tekst/kilde og outcome beholdes, kilde/kontrollstatus er synlig. Ingen liste-/TG3-bekreftelse. Nye statusprøver og eksisterende RT-11-tastaturprøve består. |
| AC2 | Originalen ligger i immutable outcome, correction og draft separat. currentFinding ignorerer draft. Funn-/trinnretur og smalt PDF-panel/Esc bevarer utkast. Nye samtidige-funnprøver og retur/fokusprøver består; ingen auto-Bruk eller ny analyse. |
| AC3 | Bare report-finding-apply validerer og bruker correction, øker finding-/listerevisjon og opphever enkelt-/listebekreftelse. RT-11 bruker fysisk side 5; original TG3/4 forblir tilgjengelig. Andre korrigering og andre funns kontrolltilstand er uavhengig prøvd. Ett analyse-POST gjennom brukerforløpet i eksisterende bygget-app-prøve. |
| AC4 | Avbryt fjerner bare draft/errors; tidligere correction, revision og bekreftelser bevares. Tom/ukjent grad, blank tekst, utenfor-/ikke-heltallsside og ugyldig kilde gir feltmangler uten gjettet side/grad. Delvis retting bevarer relevante feil. Mismatchet originalkilde bevares. Ny rapport/gammel handling kan ikke overføre kontroll. |

Ingen avvisning (2.9), TG3-avklaring (2.10), listebekreftelseshandling (2.11)
eller finans-/screening-/snapshotlogikk (Epic 3) er innført. Forberedt
listConfirmationRevision ugyldiggjøres fortsatt bare; ingen UI kan sette den.

## Reproduksjon og endelig verifikasjon

Nye unit-prøver: 6 (16→22), hvor én var rød før feltfeilretting og de andre
lukker de konkrete negative/isolasjonsgapene. Nye bygget-app-prøver: 4.
Feltfeil, fokusstjeling, manglende statusregion og usynlig fokus ble reprodusert
rødt; alle fire er grønne etter retting. Feilet kort-viewport-oppsett forventet
først synlig listetittel uten å rulle; testen velger nå kort viewport etter
normal listeåpning. Dette var testoppsett, ikke ny produktfeil. En manglende
ReportState-annotasjon i ny test ble rettet etter typecheck; ingen produktfeil.

Lokal server måtte kjøres med autorisert loopback og eksisterende Chromium i
`/private/tmp/ibe160-story-1-2-browsers`. Ingen ny installasjon/avhengighet.
Den røde fokus-skjermdumpen er visuelt lest; den viste fokusknappen utenfor
synlig område. Grønne geometriasserts måler den faktiske clippinggrensen.
Dette er agentutført Chromium-/tastatur-/semantikkkontroll, ingen fysisk
skjermlesertest, ekstern brukertest eller live-KI-bevis.

| Kontroll etter siste kodeendring | Resultat |
|---|---|
| Målrettet ny unit | 22/22 |
| Målrettet ny browser | 4/4 |
| Full Vitest | 527/527, 20 filer, 81,22 s |
| Full bygget-app-E2E | 76/76, 29,2 s |
| Full dev-E2E | 3/3, 1,7 s |
| Typecheck / lint / build | bestått, ingen lintadvarsler |
| git diff --check | bestått |

PDF.js gir eksisterende informativ stor-bundlemelding, uten buildfeil.
Storyspec og sprint 2.8 er **done**. Epic 2 er **in-progress** med 2.1–2.8 done;
2.9–2.11 er backlog. Epic 3 er backlog. README og kontinuitetsdokumenter er
synkronisert. Ingen uløste funn eller nye beslutningsbehov. Neste steg er
2.9 med ny implementeringsagent og ny reviewagent; denne agenten stopper her.
Ingen push. Lokal reviewcommit meldes med full hash til orkestrator. Rålogger (kun avsluttende linjeblanker normalisert):
[reproduksjon](story-2-8-review-reproduksjon.txt) og
[sluttregresjon](story-2-8-review-kontroller.txt).
