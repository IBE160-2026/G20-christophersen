# Første live UI-prøve — stopp før aktivering

Dato: 2026-10-28. Kontrollert kode: `276802c0417106b5d608ab8f9e612a08202f3479`.
Prosedyre: [sluttverifikasjon](sluttverifikasjon.md#før-første-faktiske-finn-lenke-kan-prøves-i-ui).

Brukeren bestilte én brukerinitiert import av
`https://www.finn.no/realestate/homes/ad.html?finnkode=476576649`,
med høyst ett betalt forsøk, maksimalt USD 0,15, ingen retries og ingen push.
Brukeren ba uttrykkelig om stopp ved manglende autorisasjon.

## Kontroller

- Kostnadsautorisasjon: brukerens bestilling gir en uttrykkelig ramme på
  USD 0,15 for ett forsøk. Faktisk maksimal forespørselskostnad er ikke
  verifisert i denne kontrollen. Eksisterende gatereferanse håndhever ingen
  USD-grense; dette må avklares før eventuell senere aktivering.
- Nøkkel: `OPENAI_API_KEY` finnes i det arvede backendmiljøet og består
  produksjonskodens lokale syntakskriterium. Ingen nøkkelverdi ble vist,
  lagret eller sendt. Gyldighet, kontotilgang og saldo er ikke verifisert.
- Tilgang: ingen prosjektspesifikk godkjenningsreferanse ble funnet i de
  undersøkte prosjektartefaktene. [Eksisterende tilgangsbeslutning](../finn-import-checkpoint-2026-10-28.md#2-tilgangssjekk-og-stoppgrunnlag)
  og FINN-1 i [sentral oversikt](../deferred-work.md#finn-1--tilgangsblokkert-2026-10-28)
  står fortsatt åpne. Det tidligere tekniske open_page-beviset oppfyller ikke
  prosjektets krav til dokumentert tillatt tilgang.
- `FINN_IMPORT_ENABLED`, `FINN_IMPORT_ACCESS_REFERENCE` og
  `FINN_IMPORT_COST_REFERENCE` er ikke satt i kontrollert prosessmiljø.
  Ingen lokal `.env`-fil utover `.env.example` ble funnet. Ingen gateverdi
  eller serverkonfigurasjon ble endret.

## Resultat

**STOPP ved manglende dokumentert tilgangsautorisasjon.** PAA ble ikke startet
i denne kontrollen. Ingen import ble sendt, ingen retry ble gjort og ingen
UI-kontroll av faktiske annonseverdier, kilder eller korrigering ble utført.
Betalte importforsøk: **0 av 1**. Kostnad fra denne kontrollens API-kall:
**USD 0,00** (ingen API-kall). Ingen push.

Før videreføring må en reell tilgangsgodkjenning som dekker denne integrasjonen
foreligge, og forespørselens kostnadsgrense må kunne underbygges innen brukerens
USD 0,15. Deretter følges den eksisterende oppstartsprosedyren. Ingen ny
tilgangstillatelse eller større kostnadsramme utledes av denne rapporten.
