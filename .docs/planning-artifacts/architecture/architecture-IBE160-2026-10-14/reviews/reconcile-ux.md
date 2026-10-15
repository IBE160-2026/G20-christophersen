---
title: Kildeavstemming — final UX mot arkitektur
date: 2026-10-14
source_status: final
target_status: draft
verdict: samsvar-med-to-sma-presiseringer
---

# Kildeavstemming av UX

Arkitekturen er forenlig med ferdigstilt DESIGN.md, EXPERIENCE.md og brukerbeslutningene i UX-loggen. Ingen kritiske eller høye konflikter, produktutvidelser eller omgjøringer av låst UX ble funnet. To små presiseringer anbefales i AD-2 for at tilstandsmodulen og resultatskjermen skal videreføre korrigeringskontrakten helt eksplisitt. Presiseringene gjennomfører eksisterende UX og trenger ikke et nytt brukerbeslutningspunkt.

## Omfang og autoritet

Gjennomgått:

- [ARCHITECTURE-SPINE.md](../ARCHITECTURE-SPINE.md), linje 1–228, og [arkitekturens beslutningslogg](../.memlog.md), inkludert de brukeravgjorte Q-1–Q-7.
- [DESIGN.md](../../../ux-designs/ux-IBE160-2026-10-13/DESIGN.md), status final, linje 1–303.
- [EXPERIENCE.md](../../../ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md), status final, linje 1–220.
- [UX-beslutningsloggen](../../../ux-designs/ux-IBE160-2026-10-13/.memlog.md), inkludert endelig PDF-panel, korrigeringsutkast og fullføringshendelse.

Final UX og senere uttrykkelige arkitekturvalg er autoritative. Historiske forslag om Python, backend-eid vurdering, direkte PDF-input, frontend-only demo og jobb-ID er ikke gjeldende valg. At UX-dokumentet historisk omtaler teknologistakken som uvalgt, er ingen konflikt: Q-1 avgjør dette senere uten å endre UX.

Dette er dokumentavstemming, ikke implementerings-, tilgjengelighets-, dokumentanalyse- eller kjørbarhetsbevis. Ingen kilde, spine, regel, mock, story eller kode er endret av denne kontrollen.

## Funn

### UX-ARCH-1 — Lav: Korrigeringens ugyldiggjøring av enkeltfunnets bekreftelse bør navngis

**Lokasjon:** ARCHITECTURE-SPINE.md AD-2, linje 62.

**Kilde:** EXPERIENCE.md `finding-edit`, linje 83, og `Redigeringsutkast`, linje 120; DESIGN.md `finding-edit`, linje 282; UX-loggen linje 25–26.

Kilden krever at **Bruk korrigering** gjør redigert versjon gjeldende og markerer både berørt funn og listen ubekreftet. AD-2 krever ny listebekreftelse, men sier ikke eksplisitt at enkeltfunnets tidligere kontrollstatus også oppheves. AD-8 skiller uttrekkskontroll fra listebekreftelse, og AD-2 bevarer kontrollhandlinger i frontend. To separate modulbyggere kan derfor videreføre listegyldighet riktig, men beholde en gammel «Bekreftet»-etikett på et faktisk endret funn.

**Anbefalt presisering:** Legg til i AD-2 at **Bruk korrigering** markerer det endrede funnet og gjeldende liste ubekreftet før nødvendig ny kontroll/listebekreftelse. **Avbryt** bevarer tidligere versjon og kontrollstatus. Dette er en eksisterende UX-kontrakt, ikke et nytt krav om automatisk eller ytterligere bekreftelse.

### UX-ARCH-2 — Lav: Resultatets opplysning om ubrukt utkast bør knyttes til tilstandskontrakten

**Lokasjon:** ARCHITECTURE-SPINE.md AD-2, linje 62, og AD-9, linje 118.

**Kilde:** EXPERIENCE.md `finding-edit`, linje 83: «Resultat opplyser om et ubrukt utkast dersom det finnes.» Utkastets atskillelse fra gjeldende grunnlag følger dessuten linje 120 og UX-loggen linje 25–26.

Arkitekturen bevarer utkast, lar det stå utenfor screening og lar **Avbryt** beholde gjeldende versjon. Den viderefører imidlertid ikke uttrykkelig at resultatskjermen må vise at et utkast fortsatt er ubrukt. Når state-modul og Resultat bygges separat, kan man ellers få et korrekt resultat fra gjeldende liste uten at brukeren ser at den nylig redigerte versjonen ikke ble brukt.

**Anbefalt presisering:** Legg til at Resultat viser en tekstlig opplysning dersom ubrukt korrigeringsutkast finnes; utkastet skal fortsatt ikke endre beregning, anbefaling eller resultatets grunnlagsrevisjon. Ingen automatisk bruk eller ny sperre innføres.

## Dekning av de sentrale UX-bindingene

| Kildebinding | Arkitekturdekningspunkt | Vurdering |
| --- | --- | --- |
| Original-PDF i appen, automatisk riktig PDF-side ved funnvalg, hel side og nabosider | AD-3 linje 68; AD-9 linje 118; verifikasjon linje 216 | Videreført. Lokalt tekstuttrekk erstatter ikke brukerens originalkilde. PDF-posisjon fra 1 er autoritativ; trykt sidetall er tillegg. |
| Fire eksakte trinn, synlig status på alle flater, sekvensiell hovedflyt og retur uten unødvendig omstart | AD-2 linje 62; AD-9 linje 118; Structural Seed linje 170; EXPERIENCE er uttrykkelig bindende i linje 31 | Videreført som kildearv. Den permanente stepperen, eksakte navn, sperrede fremtidige trinn og synlighet under rulling gjelder fra EXPERIENCE linje 41 og DESIGN linje 244; ingen fri dashboard-navigasjon foreslås. |
| Lokale mangler/feil og kodeutfallet Innhent mer informasjon i problemtrinnet | AD-4 linje 74; AD-8 linje 112; AD-9 linje 118; feilkonvensjon linje 133 | Videreført. Backend leverer dokument-/analysefeil, og den felles domenekjernen gir kodeutfallet; API-feil blir ikke selv en anbefaling. Resultat er ikke nødvendig for å forstå feilen. |
| Original KI, utkast, gjeldende retting og kontrollstatus skilles; Bruk/Avbryt | AD-2 linje 62; findingId-konvensjon linje 132; reducer-konvensjon linje 135; overgangstester linje 215 | Hovedkontrakten er videreført. To små presiseringer er registrert ovenfor. |
| Enkeltfunnets kontroll, listebekreftelse og separat alvorlig TG3-avklaring | AD-2 linje 62; AD-4 linje 74; AD-8 linje 112 | Videreført. Uavklart TG3 kan stå igjen etter kontroll. Avklart krever eksplisitt status og begge nødvendige ikke-tomme tekster; rapportgrad/funn beholdes. Listebekreftelse gjør ikke analysefeil til fullført analyse. |
| Historisk/uaktuelt resultat ved faktisk grunnlagsendring; relevant ny bekreftelse; uendret rapport gjenbrukes | AD-2 linje 62; AD-6 linje 86; AD-7 linje 106; overgangstester linje 215 | Videreført. Finans-/liste-/TG3-/rapportrevisjon binder resultatet. Navigasjon alene endrer ikke grunnlaget. TG3-endring krever ikke ny bekreftelse av uendrede tall og liste. |
| Smalt PDF-panel under 1200 CSS px; fokus, retur, valgt funn, kontekst og utkast bevares | AD-9 linje 118; frontend/pdf linje 171; verifikasjon linje 216 | Videreført ved direkte EXPERIENCE-arv. Der gjelder paneloverskrift ved åpning, fokus innen panelet, Esc/lukking tilbake til åpneren og bevaring av valgt funn/posisjon/utkast. Ingen stablet standard-fallback eller separat nettleserfane innføres. |
| Offline demo og tilgjengelig allerede analysert grunnlag | AD-6 linje 86; AD-9 linje 118; AD-10 linje 124; verifikasjon linje 217 | Videreført. Lokale ressurser, samme adaptergrense og ingen live-fallback; tydelig lagret opphav gjennom hele flyten. |
| Tastatur, fokus, tekstlig status, kunngjøringer og zoom | AD-9 linje 118; NFR-2-kart linje 202; verifikasjon linje 216 | Videreført fra EXPERIENCE. Automatisk sideskift beholder fokus på funnet, viktige statusoverganger kunngjøres uten å lese hele rapporten, og all meningsbærende status har tekst. Dette er planlagt kontroll, ikke påstått tilgjengelighetssertifisering. |
| Grafitt/petrol, lokale systemfonter, rolig uttrykk og progressive disclosure | AD-9 linje 118; tallkonvensjon linje 134; Structural Seed linje 158 | Videreført. DESIGN-tokenverdier forblir autoritet. Fullformler/opphav kan åpnes ved behov; anbefaling, kort begrunnelse, utløsere, fire nøkkeltall, alvorlige funn, blokkere og neste handling er synlige fra start. |

## Særkontroll av siste brukerbeslutning Q-7

AD-5 linje 80 viderefører hele den siste beslutningen: ett ventende POST-forløp, tydelig **Analyserer**, sperre mot dobbeltstart, validert terminalstatus, rapport-/forespørsels-/økt-/generasjonsbinding, synlig feil/timeout og ingen automatisk retry. **Å forlate pågående analyse eller erstatte rapporten ugyldiggjør analysegenerasjonen**, slik at et senere svar ikke blir gjeldende. AbortController er bare best effort; korrektheten er identitets-/generasjonskontroll og backendens duplikatvern. Ingen jobb-ID, polling eller persistent jobbtilstand foreslås.

Dette er forenlig med AD-2s regel om at navigasjon alene ikke endrer grunnlagsrevisjon: å forlate en **pågående** analyse endrer dens tekniske gyldighet; normal retur etter **fullført** analyse bevarer gjeldende tall, uttrekk, utkast og fortsatt gyldige bekreftelser. AD-5 gjør dette skillet uttrykkelig. Verifikasjonstabellen linje 214 inkluderer sent svar etter både rapportbytte og forlatt analyse.

S5 beholdes som kvalitets-/medianmål. Fullføring krever validert output, og målehendelsen avsluttes først når ferdig liste er synlig. Fem minutter omgjøres ikke til en hard teknisk timeout.

## Konklusjon

UX-kildearven er dekket på riktig arkitekturnivå. Ingen blokkering som krever et nytt arkitektur- eller UX-valg ble funnet. De to foreslåtte setningspresiseringene gjør en eksisterende korrigeringskontrakt tydeligere mellom frontend state og skjermene. Resten av de detaljerte fokus-, tekst-, token- og layoutreglene kan fortsatt arves direkte fra final DESIGN/EXPERIENCE; de trenger ikke kopieres til nye konkurrerende spesifikasjoner.
