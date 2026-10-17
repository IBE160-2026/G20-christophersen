# Story 1.3 — uavhengig BMAD code review

Dato: 2026-10-17. Reviewmål: `d03394119b48691aa492e4542f35409c59c35052` mot `0a8e21dfb10bd8a41609728446d5b86156bde154`. **Bestått etter rettinger; Story 1.3 done.** Epic 1 er in-progress; 1.4 og senere er backlog. Brukerens siste styring stopper mini-sprinten her. Ingen ny produkt-/arkitekturbeslutning, endret låst grunnlag eller omgått port.

Alle fire konfigurerte lag er fullført med uavhengige read-only underreviewere: Blind Hunter (9 funn), Edge Case Hunter (null), Verification Gap (1) og Acceptance Auditor (ingen AC-/scopeavvik). Edge-lagets `[]` var pålagt nullfunnformat, etterkontroll bekreftet fullført undersøkelse. Hovedreviewer kjørte tester selv og triagerte før retting. [Rå kommandoer/utdata](story-1-3-review-kontroller.txt) og [prosess/promptspor](../process/arbeidsokter/2026-10-17-story-1-3-review.md) bevares.

## Samtlige funn og dommer

Hvert funn beholder separat dom og handling; ingen funn er slått sammen. Ingen decision-needed. Ni patcher er håndtert, én lav verifikasjonsavgrensning er defer, én påstand er avvist.

| ID / kilde | Påstand og sted | Dom / handling / evidens |
|---|---|---|
| B1 / blind | Etikett rulles ut ved fokus i smal visning, FinancialInput.tsx | medium / patch rettet. Egen probe 360×225: P-etikett y85 utenfor navbunn139, input y164. Én synlig etikett flyttet nær kontrollen, fokusmargin lagt til. Slutttest krever synlig etikett ved høyde ≥225 og hele fokusrammen. |
| B2 / blind | Verdiens tilgjengelige beskrivelse mangler periode/år, FinancialInput.tsx:41 | false / avvist. Valgt periode og år har egne eksplisitt navngitte native kontroller i samme radgruppe og tastaturrekkefølge; UX/AC krever tilgjengelig kontekst, ingen duplisert opplesning ved hvert beløpsfokus. Ingen tidssammenheng er skjult for hjelpemidler. |
| B3 / blind | 320/360×160 hadde bare skallkontroll, financial-input.spec.ts | medium / patch rettet. Begge størrelser kontrollerer nå alle elleve felt og fokus. Dette avdekket for stor margin; ved høyde ≤200 brukes liten margin. Etikett kan leses ved rulling i disse korte flatene; samtidig etikett/input påstås ikke. |
| B4 / blind | Fokusfarge alene beviser ikke synlig ramme, financial-input.spec.ts | medium / patch rettet. Kontrollerer :focus-visible, solid, 2px, 3px og petrol samt geometri. Chromium-delavrunding tillates med 0,5 CSS px; ingen økonomisk toleranse. |
| B5 / blind | Reload kontrollerer bare beløp | medium / patch rettet. Alle tre perioder og år kontrolleres nå blanke etter reload, i tillegg til fem råverdier. |
| B6 / blind | Schemaavvisning ikke verifisert, session.test.ts | low / direkte patch. Avviser confirmed:true, numerisk råverdi, manglende år, ukjent periode og ekstra nøkkel. Ingen ny produktregel. |
| B7 / blind | Periode/år-mutasjon svakere verifisert, session.test.ts | medium / patch rettet. Fryser før hver handling og kontrollerer gammel periode/år etter ny registrering. |
| B8 / blind | Ny lockfil mangler isolert npm ci-bevis | low / defer, miljøavgrensning. Isolert kopi uten node_modules ble prøvd. Offline gir ENOTCACHED for zod; to nett-forsøk gir OpenSSL ERR_SSL_CIPHER_OPERATION_FAILED. Ingen fil-/produktfeil er påvist og eksisterende installasjon kjører alle tester. Ren installasjon er ikke bestått eller påstått; gjentas når nett-/SSL-miljøet fungerer. Ingen TLS-/versjonsendring. |
| B9 / blind | «Ingen årsnormalisering» er intern terminologi | low / direkte patch rettet. Flaten sier nå «Totalpris for objektet» og «Minimumskrav i prosent». |
| V1 / verification-gap | Vanlig registrert-status kunne regressere uten test | medium / patch rettet. Alle fem F1-felt krever «Registrert · Ubekreftet» etter innskriving. Lagets konkrete testbevis er tatt til følge. |
| O1 / hovedreviewer | E2E-feil ved heading-fokus etter PageDown, app-shell.spec.ts | medium / testpatch rettet. Egen probe 5/5 viste at tastaturens asynkrone glidescroll fortsatte etter syntetisk focus. Testen venter nå på scrollend før fokusmåling, uten produksjonskode for syntetisk forløp. |

Rejected: B2 false — konteksten finnes som synlige, separat navngitte og tastaturtilgjengelige periode-/årskontroller; påstanden krever en ekstra opplesningskontrakt som ikke står i UX/AC.

## AC1–AC4 og arkitektur

| AC | Faktisk bevis |
|---|---|
| AC1 | createInitialSession og delt RawFinancialInputSchema: fem blanke confirmed:false, L/D/J uten periode/år. Bygget UI: synlige etiketter, NOK/%, korrekt P/D/J-forklaring og ubekreftet tekst. |
| AC2 | Rene reducer- og UI-tester bevarer råverdier, måned/år/ukjent/uoppgitt, ulikt år og mellomrom. P/Ymin endres ikke av periodevalg; ingen normalisering eller skjulte standarder. |
| AC3 | Alle fem råfelt prøves med 0, sletting, mellomrom/desimaltekst/negativ/tekst, uten bekreftelse. UI skiller Ikke oppgitt/0 registrert/Registrert, alle Ubekreftet. F1 og F3s slettede L inngår. |
| AC4 | Fryst tilstand returneres identisk ved tilgjengelig navigasjon; bygget app bevarer verdier/år/periode ved klikk/Enter og fokuserer overskrift. Ingen API-analyse, ingen senere trinn åpnes. Reload nullstiller alle elleve kontroller. |

AD-1/AD-2/AD-7/AD-9: contracts eier råschema/typer og bruker bare Zod; én React-reducer eier økten. Ingen Number/parseFloat i inputbanen, varig lagring, backend-/domainendring eller senere 1.4/1.5/1.7-funksjonalitet. Final UX-tokens, tilgjengelighet og lesbare rader/ombryting er bevart. Autoritative kilder er lastet som dokumentert i prosessloggen, inklusive kurs-/faglærerkildene.

## Egne testresultater og avgrensninger

- Sluttresultat: **9/9 Vitest**, **typecheck**, **lint**, **build**, **19/19 bygget E2E + 2/2 dev** bestått. E2E bygger siste kilde. Ingen betalt API.
- Første kjøring: 8/8 Vitest og type/lint/build bestod; 16/17 E2E med PageDown-feilen. Mellomkjøringer fanget kortflate-/delpikselforhold; råutskriften bevarer også feilene. Siste fullkommando avsluttet 0.
- Registreringsfelt er kontrollert ved 1440×900, 720×450, 360×225, 360×160 og 320×160. Skallregresjon/HTTP-grense, kontrast, offline appforespørsler og dev/HMR består.
- Isolert npm ci er **ikke verifisert** på grunn av ovennevnte nett-/SSL-feil. Dette åpne bevispunktet endrer ikke Story 1.3s beståtte registrerings-AC, men må prøves før README-oppskriften kan omtales som rent installasjonsverifisert på denne versjonen. [Deferred](deferred-work.md).
- Ingen ny native manuell test, S1–S6, full demo eller live-bevis påstås. Ingen push/commit fra reviewer. Repoets demo er gjenopprettet på http://127.0.0.1:3000 (exec-session 32964). [Ferskt zoombevis](story-1-3-review-zoom.png) viser etikett og tastaturfokus i faktisk bygget app; bildet er sett direkte.
