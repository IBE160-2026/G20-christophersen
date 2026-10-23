# Sporbarhet fra kilder til spesifikasjon

CAP-ID-ene grupperer eksisterende krav for videre BMAD-arbeid. De erstatter ingen godkjent ID eller beslutning. [Brief](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/brief.md), [PRD](../../planning-artifacts/prds/prd-IBE160-2026-10-10/prd.md), [DESIGN](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/DESIGN.md), [EXPERIENCE](../../planning-artifacts/ux-designs/ux-IBE160-2026-10-13/EXPERIENCE.md) og [final spine](../../planning-artifacts/architecture/architecture-IBE160-2026-10-14/ARCHITECTURE-SPINE.md) er obligatoriske adopterte kompanjonger, sammen med begge produktaddenda.

## Kildearv og beslutnings-ID-er

| Kilde | Bevart innhold og bruk |
|---|---|
| Brief og addendum, låst oppfølging 2026-10-08 | Problem/primærbruker, smal v1, finansdefinisjoner, kritisk grunnlag, tre utfall, F1–F4/regelvarianter, kjørbarhet/personvern/kostnader og langsiktig visjon utenfor v1. |
| Final PRD og addendum 2026-10-10 | UJ-1, FR-1–FR-18, NFR-1–NFR-5, S1–S6, kontrollmål K1–K3, FR-5-eksempler, RT/BT/AT/TT-fasit og S5-protokoll. PRDs Q-1 om målepunkter er løst. |
| Final DESIGN/EXPERIENCE, oppdatert 2026-10-14 | Alle tokens, 26 komponentpar, tilstander, tilgjengelighet, responsive regler og fire navngitte flyter. UX-beslutning A/B er lokale feil og behovsåpnet detaljsporbarhet; UX-C er smalt PDF-panel. A1–A5 er dokumenterte detaljvalg fra UX-fasilitator, ikke nye spec-antakelser. Korrigeringsutkast med Bruk korrigering/Avbryt beholdes. |
| Final ARCHITECTURE-SPINE, oppdatert 2026-10-23 | AD-1–AD-10, Q-1–Q-7s ferdige valg, stack/versjonspins, import-/pipeline-diagrammer, structural seed, konsistenskonvensjoner, kravkart, verifikasjonsgrenser og Deferred med lukket R1. |
| [Godkjent R2-regel 2026-10-20](../../planning-artifacts/r2-pdf-lesbarhet-semester-v1.md) | CAP-2; FR-6/FR-9; AD-3/AD-4; Story 2.3 AC1–AC4. Kontraktversjon 2 skiller blank fra unreadable/unknown/incomplete, bevarer fysiske sider og sperrer falsk fullføring. `tests/unit/document-analysis.test.ts` etterprøver kontraktvern; faktisk PDF-ekstraksjon/blankdeteksjon og fixturebevis gjenstår i 2.3. |
| [Godkjent R1-oppsett 2026-10-23](../../planning-artifacts/r1-live-ki-semester-v1.md) | CAP-2/CAP-8; FR-6–FR-9; NFR-1/NFR-3–NFR-5; AD-3–AD-6/AD-9/AD-10; Epic 4 og 4.1–4.5. Fyller Deferred om leverandør/modell/SDK, kapasitet/pris/budsjett og live-frist uten endret AC eller kontraktversjon. Testmatrisen spores til 4.1–4.3; faktisk kontogrense, sekvensielle forsøk, USD 20-stopp og S2/S5-bevis til 4.4/4.5. |
| Faglærer 2026-10-06 og gjeldende oppfølging | Smal sekvensiell kjerne, finans i kode med fasit, kildekontroll, egne UX-referanser, realistisk tid til gjennomføring/test/retting/README og kostnadsfri demo. Historisk bredt MVP er ikke gjeninnført. |
| Sensorveiledning, alle sju sider | Prosess-/plan–kode-spor, relevante tester/kvalitetssikring, design, struktur, README/kjørbarhet og reporyddighet. Operasjonalisert i eksisterende NFR/S/AD og [verifikasjon](verifikasjon-og-avklaringer.md); ingen nye produktfunksjoner fra eksempellistene. |

ID-er er lokale til kilden: PRDs Q-1 gjelder S5; arkitekturens Q-1 gjelder TypeScript-stakk. UX A/B og A1–A5 er forskjellige etiketter i UX-historikken. De omnummereres ikke til én global beslutningsserie. Gjeldende spesifikasjon peker til final dokumentinnhold; beslutningshistorikk bevares der den allerede ligger.

Briefens eldre formulering om relevante funn er konkretisert til alle eksplisitte TG2/TG3 i godkjent PRD. PRDs minimum for originaltilgang er konkretisert til innebygd automatisk sidenavigering i final UX. Tre faglige pipelinesteg fordeles på fire UX-trinn. UX-tekstens historiske «stakk ikke valgt» er avgjort i senere final arkitektur. Dette åpner ingen av beslutningene på nytt; en reell uløst motstrid skal avklares med Mads.

## UJ-1 og funksjonelle krav

Test-ID-ene nedenfor viser eksisterende kravfasit i [PRD-addendum](../../planning-artifacts/prds/prd-IBE160-2026-10-10/addendum.md) og [Brief-addendum](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md), ikke leverte tester. UX-komponentnavnene har samme ID i DESIGN og EXPERIENCE.

| Krav | CAP | Brief-/UX-spor og ansvar | AD | Planlagt kontroll / eksisterende fasit |
|---|---|---|---|---|
| UJ-1 | CAP-1–CAP-8 | Brief Med i v1; alle fire UX-trinn og Key Flow 1 | AD-1–AD-10 | F1–F4; hele demoflyten/S6; separat S2/S5 |
| FR-1 | CAP-1 | Finansdefinisjoner; value-field, period-control; Tallgrunnlag | AD-1/AD-2/AD-7 | UJ-1 steg 1; BT-7/BT-15/BT-16 |
| FR-2 | CAP-1 | Finans/kilder/S4; source-note, cost-breakdown | AD-2/AD-7 | Kostnadsdeling 120 000 = D 100 000 + J 20 000; kildekonflikt; S4 |
| FR-3 | CAP-1 | Kritisk informasjon; value-field, issue-message | AD-1/AD-7 | BT-3/BT-5/BT-6/BT-10/BT-14; AT-12 |
| FR-4 | CAP-1/CAP-7 | Kontroll før analyse; financial-confirmation | AD-2/AD-7 | UJ-1 steg 1; BT-12/BT-14; AT-12/AT-16 |
| FR-5 | CAP-4/CAP-7 | TG3-avklaringsstatus; tg3-resolution | AD-2/AD-8 | Sju FR-5-eksempler; AT-7–AT-9/AT-20; TT-5 |
| FR-6 | CAP-2/CAP-7/CAP-8 | Én rapport/ett kall/demo; report-input, analysis-status | AD-3–AD-6 | RT-1–RT-4/RT-15; dokument-/adapter-/HTTP-grense |
| FR-7 | CAP-2 | Rapportens grader; finding-list, finding-detail | AD-3/AD-4 | RT-5/RT-6/RT-16–RT-18; S2 før retting |
| FR-8 | CAP-2/CAP-3 | Kildekontroll; source-note, pdf-viewer | AD-2/AD-3/AD-4/AD-9 | RT-5/RT-7/RT-8; automatisk side/hel side/nabosider og panel |
| FR-9 | CAP-2/CAP-6 | Eksplisitt usikkerhet; issue-message, analysis-status | AD-3–AD-5/AD-8/AD-9 | RT-2/RT-7/RT-9/RT-10/RT-19; AT-13/AT-18 |
| FR-10 | CAP-3 | KI-feil mot original; finding-actions/edit, origin-detail | AD-2/AD-4 | RT-11/RT-12; utkast→Bruk/Avbryt og ny enkeltfunnkontroll |
| FR-11 | CAP-3/CAP-7 | Gjeldende liste; list-confirmation | AD-2/AD-4/AD-8 | RT-10–RT-14; AT-13/AT-16; separat liste/TG3 |
| FR-12 | CAP-5 | Fire finansformler; metric-grid | AD-7 | F1/F2; BT-1/BT-2/BT-7–BT-11/BT-15; S1 |
| FR-13 | CAP-5/CAP-6 | Kritisk grunnlag/delberegning; metric-grid, issue-message | AD-7/AD-8 | BT-3–BT-6/BT-13/BT-14/BT-16–BT-18 |
| FR-14 | CAP-5 | Etterprøvbar finans; basis-detail, detail-disclosure | AD-7 | BT-1/BT-8/BT-9/BT-15; S1/S4; separat visning/terskel |
| FR-15 | CAP-7/CAP-8 | Endret grunnlag/gjenbruk; financial-confirmation, stale-result | AD-2/AD-6/AD-7 | RT-3; BT-12/BT-13; AT-16 |
| FR-16 | CAP-6 | Tre prioriterte utfall; recommendation | AD-7/AD-8 | AT-1–AT-16/AT-18–AT-20; alle avgjørende utløsere |
| FR-17 | CAP-6 | Begrunnelse/neste handling; recommendation, issue-message | AD-7/AD-8/AD-9 | AT-1–AT-15/AT-18–AT-20; samme tekst fra samme grunnlag |
| FR-18 | CAP-6/CAP-7 | Samlet resultat; basis-detail, status-label, stale-result | AD-2/AD-7–AD-9 | AT-16/AT-17; RT-4/RT-14; utkastopplysning/historisk snapshot |

## Kvalitet og suksessmål

| Krav/mål | CAP | UX/leveranse og AD-spor | Kontroll |
|---|---|---|---|
| NFR-1 | CAP-1–CAP-8 | Tilstander/gyldighet; AD-1/AD-2/AD-4/AD-5/AD-8 | AT-16/AT-18–AT-20, retting/gjentakelser/race; rene tilstandsoverganger |
| NFR-2 | CAP-1/CAP-3/CAP-6/CAP-7 | DESIGN + EXPERIENCE Accessibility/Responsive; AD-2/AD-9 | Tastatur, fokus/status, panel/Esc/retur, zoom, kontrast, etiketter og forståelse |
| NFR-3 | CAP-8 | Lokal frontend/API, demo; AD-6/AD-9 | Ren kjøring og tester fra README; nett sperret under demo |
| NFR-4 | CAP-2/CAP-8 | Lokal konfigurasjon/data; AD-6/AD-9 | Ingen nøkkel i frontend/Git/logger/feil/demo, fiktive data og historikkontroll |
| NFR-5 | CAP-2/CAP-3/CAP-4/CAP-6 | Synlig liste og kontroll; AD-5/AD-10 | TT-1–TT-9 og S5-protokoll; feil/live/demo holdes atskilt |
| S1 | CAP-5/CAP-7 | Finans/format; AD-7/AD-10 | F1–F4/BT-1–BT-18, uavhengig fasit og toleranse |
| S2 | CAP-2 | Alle eksplisitte TG2/TG3; AD-3/AD-4/AD-10 | Rapportfasit/opprinnelig live-uttrekk, RT-16–RT-18 |
| S3 | CAP-1–CAP-7 | Mangler/regler; AD-2/AD-4/AD-5/AD-7/AD-8/AD-10 | Regelvarianter, FR-5, RT/BT/AT; terskler og prioriteter |
| S4 | CAP-1/CAP-3–CAP-7 | Kilde/opphav/etterprøvbarhet; AD-2/AD-3/AD-4/AD-7/AD-8/AD-10 | Inputkilder, original/PDF-side, brukerendring, TG3, ingen dobbelttelling |
| S5 | CAP-2/CAP-3/CAP-4 | S5-målepunkter; AD-5/AD-10 | Median ≤300/600 s, TT-fasit og manuell sammenligning |
| S6 | CAP-8 | Hele lokale UJ-1; AD-6/AD-9/AD-10 | Annen person, rent miljø, dokumenterte kommandoer og utfall |

## Uendrede arkitekturbeslutninger

| ID | Beslutningsområde | CAP-binding |
|---|---|---|
| AD-1 | Modulgrenser og importretning | CAP-1–CAP-8 |
| AD-2 | Frontend eier økt, opphav, bekreftelser og snapshot | CAP-1/CAP-3/CAP-4/CAP-6/CAP-7 |
| AD-3 | Sidemerket dokumentgrunnlag og originalkilde | CAP-2/CAP-3 |
| AD-4 | Én delt validert kontrakt, feil/usikkerhet og eksplisitt fullføring | CAP-2/CAP-3/CAP-6/CAP-8 |
| AD-5 | Ett HTTP-forløp, duplikatsperre og gamle svar | CAP-2/CAP-7 |
| AD-6 | Felles demo/live og rapportbinding | CAP-2/CAP-7/CAP-8 |
| AD-7 | Eksakte finansgrenser og separat presentasjon | CAP-1/CAP-5/CAP-6/CAP-7 |
| AD-8 | Én screening og separat TG3-avklaring | CAP-4/CAP-6/CAP-7 |
| AD-9 | Lokal levering/konfigurasjon og godkjent UX | CAP-1–CAP-8 |
| AD-10 | Verifikasjonsgrenser og kravspor | CAP-1–CAP-8 |

Ved senere planlegging skal hver arbeidsenhet føre relevant CAP og eksisterende FR/NFR/S, AD og testeksempel-ID. Ingen ID-er for epics eller stories opprettes her. Alle ti AD-er gjelder med full tekst i spine, også regler som ikke gjentas i tabellene.
