# Målrettet etterkontroll — BMAD UX-rubrikk

Dato: 2026-10-14. Omfang: de to medium-funnene i [review-rubric.md](../review-rubric.md), kontrollert mot gjeldende spine-paret og siste brukerbeslutninger i [.memlog.md](../.memlog.md). Dette er ingen ny full rubrikkgjennomgang. Review-rapporten fra 13. oktober er bevart uendret som historisk øyeblikksbilde.

## 1. Korrigeringens gjeldende-versjon — lukket

Mads' endelige korrigeringsvalg 14. oktober skiller redigert utkast fra gjeldende og bekreftet versjon. Det er nå konkretisert i:

- [EXPERIENCE.md](../EXPERIENCE.md) linje 81, `finding-edit`: utkast påvirker ikke gjeldende liste/beregning. **Bruk korrigering** gjør versjonen gjeldende, men funn/liste ubekreftet. **Avbryt** fjerner utkastet og bevarer tidligere gjeldende versjon. Funnvalg/trinnretur beholder uferdig utkast i aktuell vurdering uten automatisk bruk; Resultat opplyser om ubrukt utkast.
- EXPERIENCE.md linje 82 og 118: original KI, utkast, gjeldende korrigering og kontrollstatus holdes atskilt; utkast er utenfor screeninggrunnlaget. Linje 92 knytter historisk resultat til brukt korrigering/listeendring, ikke til utkast alene. Flow 2 linje 192 beskriver de konkrete bruk/avbryt-handlingene.
- [DESIGN.md](../DESIGN.md) linje 280: begge handlinger og de ulike versjons-/bekreftelsestilstandene er tekstlig synlige.

Dermed er både anvendelsestidspunkt og håndtering ved navigasjon spesifisert. Original KI-versjon bevares. Bruk korrigering erstatter ikke PRD-ens nødvendige kontroll/listebekreftelse; det er ikke innført ny KI-analyse, automatisk bruk, varig utkastlagring eller ekstra screeningsregel.

## 2. TG3-endring og resultat-overgang — lukket

Den separate avklaringens **status, begrunnelse og grunnlag** er nå uttrykkelig nevnt alle de aktuelle stedene:

- [EXPERIENCE.md](../EXPERIENCE.md) linje 84, `tg3-resolution`: registrert endring gjør tidligere anbefaling umiddelbart historisk. Gjeldende avklaring registreres/kontrolleres etter FR-5 og reevalueres i kode. Uavklart/ugyldig Avklart gir Innhent mer informasjon med navngitt funn.
- EXPERIENCE.md linje 92, 121 og 142: endringene omfattes eksplisitt av historisk resultat og oppdateringsatferd. Uendrede tall, listebekreftelse og rapportuttrekk beholdes; ingen ny KI-analyse.
- Flow 3 linje 203–204: TG3-endring markeres i berørt trinn og tidligere resultat. Det separate kontrollforløpet etter FR-5 er skilt fra ny bekreftelse av faktisk endrede tall/funnliste.

Dette lukker den tidligere nødvendigheten av å tolke TG3-avklaring som en implisitt listeendring. Ingen skjult krav om ny tall-/listebekreftelse av uendret grunnlag er lagt til, og Avklart/Uavklart betyr fortsatt det samme som i låst PRD.

## PDF-fallback og resterende forhold

Mads' endelige UX-C-valg 14. oktober er integrert i EXPERIENCE.md linje 83 og §Responsive & Platform, linje 158–166, samt DESIGN.md linje 205, 248 og 282: vanlig desktop har delt visning; smal flate bruker PDF-panel fra valgt funn med riktig side, kort funnkontekst, tilbakehandling og bevart arbeid. 1200 CSS px og 44/56-fordeling er uttrykkelig fasilitatorens operasjonalisering, ikke påståtte ordrette brukerkrav. Utkast bevares ved panellukking.

Ingen gjenværende atferdsfeil er identifisert innen de to kontrollerte funnene. En liten foreldet kommentar gjenstår i DESIGN.md linje 68: «smalere PDF-fallback avklares separat» bør fjernes eller oppdateres, fordi valgt fallback allerede står i kontrakten. Det er en redaksjonell rest, uten ny beslutning eller produktregel.

Resultat: **2 av 2 opprinnelige medium-funn lukket**. Ingen endring av kildedokumenter, peer-dokumenter eller review-snapshot er utført i denne etterkontrollen. Nøkkelmocks, øvrige reviewerlinser og finalisering vurderes av hovedagenten utenfor dette avgrensede omfanget.
