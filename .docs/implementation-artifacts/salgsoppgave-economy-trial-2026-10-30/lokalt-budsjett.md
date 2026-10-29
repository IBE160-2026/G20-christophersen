# Lokal kostnadsport for første økonomiprøve

2026-10-30. Brukerens nye eksplisitte bestilling erstatter server-count som
obligatorisk avhengighet **kun for første avgrensede økonomitest**. Ingen ny
planleggings-/godkjenningsrunde eller full testsuite. Opprinnelig generell
TG-/semantic-preflight og historiske pris-/testbevis er beholdt uendret.

`src/backend/import/economy-local-budget.ts` gjenbruker økonomipakke, streng
requestkonfigurasjon, SDK-wire, source-/outputvalidering og varig felles
AnalysisBudgetStore. Offisiell Standard global Sol-pris er uendret fra forrige
checkpoint: input USD 2/M, cache-write-maksimum USD 2,50/M, output USD 10/M.

Hele den faktisk SDK-serialiserte requesten, også instruksjoner og schema,
telles lokalt i UTF-8-byte. Budsjettet bruker **2 token per byte + 4096** for
framing. Dette er en konservativ budsjetteringsregel, ikke presis tokenizer
eller en serverbekreftet inputtelling. Kun kjent tekst-/schemaformat tillates;
maks 5 lesbare valgte sider, 12 000 byte valgt tekst, 40 000 inputbudsjetttokens.
Overskridelse stopper; teksten avkortes ikke automatisk.

Den private klargjorte requesten er 17 808 byte, og inputbudsjettet blir
39 712 tokens. Nytt outputtak er **4000 inklusive reasoning og annen skjult
output**. Regnestykket er `39712 * 2,50/M + 4000 * 10/M = USD 0,13928`.
Høyeste tillatte modellbudsjett er USD 0,14 ved inputtaket på 40 000.
**USD 0,15 reserveres varig** før nettverk. Det etterlater minst USD 0,05
av samlet USD 0,20. Tidligere reservasjoner stopper førsteprøven slik at de
ikke spiser opp sikkerhetsmarginen. Et senere separat rapportkall får ingen
egen kvote, og er ikke autorisert eller automatisert av denne leveransen.

Fasitgodkjenningen bindes til original, eksisterende godkjent pakke og eksakt
fasitfil. Endret outputtak gir ny requestdigest; betalt godkjenning mangler og
må bindes til nettopp denne requesten, fasiten og USD 0,20. Ingen nøkkel er
lest. Klargjøring bruker kun lokal SDK-stubb. Den nye ettkallsfunksjonen
aksepterer eksplisitte credentials, men er ikke startet eller koblet til
automatisk HTTP-/produktflyt.

Den første økonomiprøven kan etter godkjenning kun gjøre ett Responses-kall.
Ingen count, verktøy, bilder, filer, historikk, tier-/cache-overstyring,
redirect, automatisk retry eller separat rapport. Reservasjonen beholdes
ved timeout, API-feil, avbrutt output, feil kilder eller feil svarstruktur.
En ufullstendig respons blir avvist; outputtaket kan ikke automatisk økes.
Utfallet forblir ubekreftet og må sammenlignes med den godkjente fasiten.
Teknisk/TG-dekning er fortsatt uavklart.

## Målrettet verifikasjon

- 7/7 nye tester i `tests/unit/economy-local-budget.test.ts` består: hele
  requesten/schema/framing, input-/output-/verktøygrenser, eksakt fasit-/pakke-
  og betalt godkjenning, reservasjon før ett stubbkall, sikker stopp ved
  ufullstendig svar, ingen retry, bevart kvote ved API-feil, tidligere
  rapportreservasjon og ubekreftet kandidat etter komplett svar.
- Typecheck og avgrenset lint består. Ingen full suite eller nye omfattende
  planleggings-/reviewrunder kjørt, i tråd med brukerens prioritering.
- Ekte privat pakke/original/fasit er bundet og ny SDK-wire er klargjort
  lokalt; `readyForApproval: true`, betalt godkjenning fortsatt påkrevd,
  eksterne API-kall 0. Reell modellkvalitet er fortsatt uprøvd.
- Ingen finans-/screeningendring, private filer i Git, betalte kall eller push.

Private nye klargjøringsfiler erstatter ikke historiske preflight-filer, som
korrekt dokumenterer det tidligere obligatoriske count-kravet.
