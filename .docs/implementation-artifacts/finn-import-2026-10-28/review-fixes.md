# FINN-1 — retting av reviewfunn 2026-10-28

Kjente eller motstridende kostnader blir beholdt i valideringen ved ugyldig/blank
retting. Kjente kostnadsrelasjoner og rentedeler valideres uavhengig av brukerens
erklæring om komplett drift. Ukjent periode/år, ugyldig inkludering og motstrid
mellom null fellesgjeld og positiv betaling blokkerer full J.

Brukt D/J eies bare av importen når beløp, kilde, periode og år fortsatt stemmer.
Manuell periodisering/år bevares ved ny bruk. Samme-objektoppfrisking beholder
rettinger og noter med fornyet kontrollbehov; allerede brukt bevis beholdes.
Utkast kan bare brukes fra vellykket ready-status, både i reducer og UI.

Forhåndsvisning og anvendelse deler samme årsvilkår for J. Slideren får kanonisk
desimalverdi og skjules med forklaring ved blankt/ugyldig/utenfor-grense beløp.
DOM-ID-er har atskilte navnerom som ikke kan kollidere med gyldige ekstra felt-ID-er.
Deaktivert live-import opplyses før klikk, kodeverdier vises på norsk, og knapper
bruker etablerte klasser.

Bare berørte testfiler/prøver ble kjørt, med Node24.21.0. Bygg/typekontroll bestod
([utskrift](review-fixes-build.txt)). Begge berørte enhetstestfiler bestod med 58
prøver ([verktøyutskrift](review-fixes-unit.txt)).

Tre berørte nettlesertestfiler ble kjørt med eskalert lokal loopback og:

```sh
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers npm exec playwright test tests/e2e/listing-import.spec.ts tests/e2e/app-shell.spec.ts tests/e2e/financial-input.spec.ts
```

43 prøver bestod, inkludert alle tre FINN-importprøvene og app-shell. Fire nye
fokusprøver feilet på clipping av FINN-input. Se [første utskrift](review-fixes-e2e-initial.txt).
Kontrollene fikk samme høyde og scroll-margin som eksisterende finansfelt.
Et mellomforsøk kjørte utilsiktet hele den berørte financial-input-filen fordi npm
tolket --grep som eget flagg; 27 bestod og to fokusprøver viste behovet for samme
kontrollhøyde på svært korte flater. Ingen clipping- eller fokuskrav ble svekket.

Etter rettingen ble bare fem relevante fokusprøver kjørt med korrekt argumentgrense:

```sh
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/ibe160-story-3-5-browsers npm exec -- playwright test tests/e2e/financial-input.spec.ts --grep '1.3 UX'
```

Alle fem bestod på 3,0 s ([sluttutskrift](review-fixes-focus.txt)). De omfatter
1440×900, 720×450, 360×225, 360×160 og 320×160, nå med både FINN-kontroller og
avgrenset eksisterende finansrekkefølge. Ingen historiske story-artifakter er endret.
Hovedagenten utfører samlet sluttverifikasjon; ingen commit/push er utført her.

En siste øktkontroll sikrer også at endring av trackingparametere etter mislykket
oppfrisking ikke gjør gammelt bevis ready igjen. Den berørte session-testfilen
ble kjørt etter denne rettingen: 14/14 bestod på 194 ms
([sluttutskrift](review-fixes-session-final.txt)).
