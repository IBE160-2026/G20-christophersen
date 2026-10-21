---
title: 'Story 3.7 — Vise ett samlet screeningresultat med kontrollgrunnlag'
type: 'feature'
created: '2026-10-21'
status: 'in-review'
route: 'oneshot'
story_key: '3-7-vise-ett-samlet-screeningresultat-med-kontrollgrunnlag'
baseline_commit: 'fcc87c6e4b13fdaf03271dd0b7825804ec2e6412'
---

<frozen-after-approval reason="Brukerens eksplisitte mini-sprintbestilling med eksisterende AC og separat uavhengig review">

## Intent

Implementer bare Story 3.7 AC1–6 i epics.md. Resultat blir fjerde trinn i eksisterende firetrinnsreise, etter nødvendig kontroll. Gitt gjeldende snapshot, når Resultat leses, skal nøyaktig én kodebestemt anbefaling, kort grunn, avgjørende prioritet, alle utløsere og konkret neste handling vises først. Fire nøkkeltall gjenbruker 3.6; alvorlige funn, faktiske mangler og uavklarte forhold vises uten detaljåpning. Regler, tekster og beregninger eies fortsatt av domain fra 3.1–3.4; ingen ny UI-regelautoritet.

Gitt rapportgrunnlag, når kontrollgrunnlaget undersøkes, skal alle aktive TG2/TG3, grad/beskrivelse/dokument/fysisk PDF-side og tilgang til originalrapporten være tilgjengelige gjennom eksisterende kontrollflate. Opprinnelig KI-uttrekk, brukt brukerkorrigering og avvist original bevares atskilt i merkede behovsåpnete detaljer. Separat alvorlig TG3-status er synlig, med begrunnelse/grunnlag og anvendbarhet fra eksisterende felles validering ved behov. Rapportfunn er ikke teknisk godkjenning; avvisning er ikke avklaring.

Gitt kritiske mangler, dokument-/analysefeil eller ufullført kontroll representert ved komponent-/stategrensen, når delresultat leses, skal Innhent mer informasjon samle faktiske blokkere med berørt grunnlag og handling. Gyldige tall merkes Delgrunnlag. Lokale feil beholder detaljforklaringen i problemtrinnet; Resultat viser kompakt feilkategori/kode/mål uten å kopiere full lokal feilmelding. Ingen produktsnarvei for å nå sperrede feiltilstander.

Gitt ingen beregning, når komponenten leses, skal Ikke beregnet forklare nødvendig kontroll uten oppdiktet anbefaling. Gitt endret binding, når tidligere resultat leses, skal alle tall, funn og anbefaling komme fra samme historiske snapshot, tydelig Utdatert / Må bekreftes på nytt med konkret endring og nødvendig kontroll. Nye verdier blandes ikke inn. Ubrukt aktivt utkast opplyses uten å brukes. Historisk kildehandling peker bare til samme bevart originalidentitet; erstattet original utgis ikke for å være historisk PDF.

Gitt Resultat i demo, når Endre tallgrunnlag eller Gå tilbake til rapportfunn velges, skal gyldige data, kontroll og analyse bevares, ingen ny analyse starte, og fokus gå til trinnoverskrift. Demo · lagret KI-uttrekk er synlig. Detaljer bruker native tastaturbetjente kontroller med semantisk åpen/lukket tilstand og synlig fokus. Sticky trinn/status, leserekkefølge, etiketter, kontrast og desktop-/zoomombrudd følger final DESIGN/EXPERIENCE; korte gyldighetskunngjøringer skal ikke gjentas eller stjele fokus.

Autoritet er SPEC CAP-3–8/grensekontrakter, FR-5/8–18, NFR-1–3, AD-2/6–10 og final UX, med F1/F2/F4-fasit fra PRD-addendum. Ingen backend, ny offentlig testrute, score, kjøpsbeslutning, ekstern handling, ny produkt-/arkitekturbeslutning eller 3.8+ bygges. Første beregning skjer etter ferdig kontroll; fornyelse etter faktisk endret grunnlag tilhører 3.8/3.9, mens historisk vern gjelder nå.

Verifiser bygget app med ekte kontrollerte PDF-/adapterdata for F1 Gå videre, F2 Forkast og F4 Innhent mer informasjon med kontroll fullført og Uavklart TG3; etterprøv kildehandling, opphav/avvisning og retur uten analyse. Sperrede/ikke-normale tilstander testes ved komponent/stategrensen. Gjennomfør faktisk tastatur/fokus, detaljer, visuell hierarki-/kontrast-/zoomkontroll. Kjør berørte komponent/E2E/Vitest, typecheck/lint/build. Dokumenter AC-/testbevis og arbeidsøkt, lokal commit uten push. Stopp på in-review/review; separat uavhengig reviewer avgjør done.

</frozen-after-approval>

## Implementation Notes

- Step01/02: gyldig Epic3-context og done-spec/review3.6 lest; main/baseline kontrollert. Bare aktiv automatisk promptlogg var usporet; holdes utenfor commit. Bruker har autorisert avgrenset story, eksisterende main, sekvensielle subagenter, lokale commits og separat review. Kursuttrekk og faglærerfeedback gir prosess-/testspor, ingen nye produktkrav.
- Ingen intentgap eller irreversible operasjoner; reversibelt frontend-fotavtrykk. Code Map: `src/frontend/state/session.ts` utvider eksisterende navigasjon med kontrollport og første snapshot, uten ny fornyelseshandling; `App.tsx` kobler trinn/fokus/kort status. Ny `screens/ScreeningResult.tsx` konsumerer `selectResult`/snapshot og gjenbruker `FinancialMetrics`, eksisterende TG3-validering og kilde-/kontrollnavigasjon. `styles.css` gjenbruker final DESIGN-tokens. Nye komponent/state-/bygget-app-prøver dekker faktiske kontrakter og håndskrevet fasit; ingen offentlig testrute.

- Implementert første Resultat i eksisterende navigasjon. Første snapshot krever fortsatt gyldige bekreftede tall og fullført funnliste-/TG3-kontroll; senere besøk bevarer historisk snapshot uten fornyelse. `ScreeningResult` viser samme assessments anbefaling/prioritet/utløsere/neste handling, gjenbruker `FinancialMetrics` og binder alle funn/opphavsdetaljer til snapshot. Eksisterende PDF-kontrollflate gjenbrukes for kildeside og hele rapporten; native details brukes for opphav/brukerendringer/TG3. Aktive utkast inngår ikke.
- Egenverifikasjon avdekket en konkret fixturemetadatafeil: de komplette F1–F4-svarene hadde bare demoopphav i kritisk `limitations`. PRD FR-6.5/NFR-3, AD-6 og eksplisitt F1/F2-fasit avgjorde korrigeringen; forelder autoriserte nødvendig metadataretting. Opphav beholdes i README og synlig UI. Domain, kontrakt og faktisk kritisk mangelvurdering er uendret. Dette er dataretting, ingen backendlogikk eller ny produktbeslutning. Rød/grønn-bevis er bevart.
- Endelig egenverifikasjon: **182/182 målrettede Vitest**, **31/31 direkte Chromium-komponentprøver**, **67/67 berørte bygget-app-E2E**, typecheck/lint/build og diffkontroll. Syv nye E2E og syv nye komponentprøver dekker F1/F2/F4, historisk vern, brukt retting/avvist original, korrekt fysisk PDF-side, hele originalrapporten, kontrollport/retur/fokus, native detaljer og observerte statusmutasjoner én gang. En foreldet tidligere test om permanent sperret Resultat etter ferdig kontroll ble oppdatert til den nye storyen; reelle sperrer beholdes.
- Agentgjennomført visuell QA og kontrastkontroll er dokumentert med faktiske nettleserbilder. Alle fire tall ligger i bred rad, sticky trinn/status og historisk banner ombrytes ved 720×450 CSS px (200% tilsvarende flate), og detaljer/fokus er lesbare. Forelder har også inspisert representative bilder. Ingen menneskelig S6-/live-/WCAG-sertifiseringspåstand. Se [AC-/testbevis](story-3-7-verifikasjon.md) og [arbeidsøkt](../process/arbeidsokter/2026-10-21-story-3-7.md).
- Checkpoint: **in-review / review**, ikke done. Ingen reviewlag er kjørt av implementeringsagenten, i samsvar med brukerens separate sekvensielle reviewfase. Full siste regresjon tas av forelder etter uavhengig BMAD-review. Ingen ny beslutning/blocker, 3.8+, push eller endring av porter. Aktiv automatisk promptlogg holdes utenfor fasecommit.
