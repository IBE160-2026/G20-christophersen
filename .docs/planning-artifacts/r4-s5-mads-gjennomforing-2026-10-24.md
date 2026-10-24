---
title: 'R4-S5 — Mads og faktisk manuell gjennomføring'
date: 2026-10-24
decision_status: partial
gate: R4-S5
gate_status: open
decision_owner: Mads
before_stories: ['4.5']
---

# R4-S5 — delvis avklart, ingen betalt start ennå

Brukeravklaring 2026-10-24: **Mads er primærbruker og faktisk deltaker** i
menneskelig kontroll og manuell samme-case referanse. Ingen tidligere faktiske
S5-registreringer skal gjenbrukes. Automatisering, replay og simulerte tider
erstatter aldri hans arbeid eller beviser menneskelig tid. Avklaringen er
lagret i aktiv promptlogg som følger root-commit.

Gjennomføringsplanen konkretiseres til F1/F2/F4 med ett planlagt nytt forsøk
per case, sekvensielt, uten automatisk retry. F3 med låst L=null er utenfor
vellykket S5-start. Dette er et forsøksutvalg, ikke et nytt minimumkrav.
Modell, fasit, S1–S5, Story-AC og R1 endres ikke.

Første F1 planlegges som nytt faktisk **4.4 AC6-liveforsøk med samtidige
S5-målepunkter**, først etter lukket R4-S5. Sprintplanen tillater eksplisitt
innsamling i 4.4 etter denne porten. B1-produktrettingen er nå uavhengig
reviewbestått; B2s manglende historiske F1-sluttbevis kan ikke gjenopprettes.
Nye bevis registreres med ny forsøks-ID og originalhistorikken bevares.
Etter F1 må root vurdere 4.4s samlede AC6/reviewstatus før resten av 4.5
fortsetter. Ingen 4.5-done kan bygge på ufullført 4.4-avhengighet.

## Gjenstående før porten kan lukkes

1. Mads bekrefter faktisk miljø, nettleser, tidsmetode/opptaksoppløsning og
   startberedskap. Et lesbart lokalt prøveopptak er støtte for tidsmetoden,
   ikke et S5-forsøk.
2. Root bekrefter bestått relevant regresjon og fryser full kodecommit;
   faktisk app-/modell-/prompt-/schema-/kontraktversjon registreres.
3. Root klargjør oppfanging av nye originale uttrekk, terminalutfall og
   kostnadsbevis i ny forsøksmappe. Gamle 4.4-script som automatiserer
   menneskekontroll eller kan overskrive originaler skal ikke brukes.
4. Konto, dagens pris, tidligere kumulativt forbruk, ukjente belastninger,
   tilgjengelig dekning og konservativ forsøksreservasjon avstemmes. R1s
   USD 20 og eventuell strengere faktisk kontogrense gjelder. Ingen ny
   API-preflight eller betalt analyse utføres bare for å fylle dette dokumentet.

[Måleskjemaet](../implementation-artifacts/story-4-5-mads-maaleskjema.md)
gir eksakte menneskehandlinger/start/stopp, blanke tidsfelt og nødvendige
bevis. Kontinuerlig opptaks relative tid brukes gjennom hvert forsøk; faktisk
oppløsning og måleusikkerhet registreres. Manuell referanse avgrenses til
lesing/uttrekk/kontroll av samme klargjorte rapport; finansklargjøring og
senere beregning/anbefaling holdes utenfor sammenlignbar tid. Aktiviteter og
resultater dokumenteres, slik at dette ikke blir et mål på total due diligence.

**Portstatus forblir open.** Ingen faktiske målinger foreligger, ingen
person-/miljøbekreftelse utover Mads som deltaker er påstått. Ingen betalte
forsøk er startet fra denne forberedelsen. Lukking krever datert faktisk
utfylling/avstemming av punktene over og tilsvarende sprintstatusoppdatering;
det følger ikke automatisk av dette planleggingsdokumentet. Faktiske bevis
og uavhengig review må fortsatt foreligge før storyene kan bli done.

Story 5.4/R4-S6 og 5.5 er urørt.
