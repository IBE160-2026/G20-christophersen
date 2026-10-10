# Codex-promptlogg

Loggen dokumenterer brukerens styring av KI i IBE160. Dette støtter sporbar
KI-bruk i [sensorveiledningen](../../reference/course/Sensorveiledning-IBE160-Del-1.pdf),
del 1, kriterium 1, og repoets `AGENTS.md`. Oppsettet endrer ikke produktomfanget.
Faglærers [tilbakemelding](../../planning-artifacts/briefs/brief-IBE160-2026-09-15/tilbakemelding-product-brief.md)
understreker sammenhengen mellom prosessdokumentasjon og implementasjon.

## Mekanisme og forutsetninger

Undersøkt 2026-10-08: installert CLI er `codex-cli 0.153.4`; motoren i
VS Code-utvidelse `openai.chatgpt 26.1002.51308` er `0.162.0-alpha.2`.
Begge rapporterer `hooks stable true`. Prosjektet er allerede betrodd lokalt.
`.codex/config.toml` aktiverer `features.hooks` eksplisitt for prosjektet.
Oppsettet bruker den offisielle prosjektmekanismen `.codex/hooks.json` og
hendelsen `UserPromptSubmit`, ikke avlesing av interne samtalefiler eller
instruksjoner som modellen må huske å følge.
Se [OpenAI Docs: Hooks](https://learn.chatgpt.com/docs/hooks).

Hooken kjører `.codex/hooks/log_user_prompt.py` via `python3` før prompten sendes.
Krever lokal macOS/Linux, Python 3 og Git tilgjengelig i Codex sitt kjøremiljø.
Kommandoen finner repoets rot med `git rev-parse --show-toplevel`, også fra
undermapper. Loggeren avviser hendelser med arbeidsmappe utenfor dette repoet.
Dette gjelder lokale Codex-sesjoner som laster dette prosjektets hook.
Fjernkjøring og andre klientversjoner må verifiseres separat.

## Aktiver én gang

1. Åpne en ny Codex-sesjon i repoet etter at filene er på plass. Last IDE-vinduet
   på nytt hvis det fortsatt bruker gammel konfigurasjon.
2. Åpne `/hooks` i Codex CLI, gjennomgå `UserPromptSubmit` og velg å stole på
   hooken. Start CLI med `codex` fra repoets rot ved behov. Codex lagrer tilliten
   lokalt; den følger ikke med Git. Nye utviklere må også gjøre dette.
3. Åpne en ny sesjon i klienten du skal bruke og kjør testprompten nedenfor.

Codex hopper over hooks som ikke er gjennomgått og betrodd. Endring av
hookdefinisjonen kan kreve ny gjennomgang. Oppsettet deaktiverer ikke denne
sikkerhetsmekanismen og endrer ingen globale innstillinger.

## Loggformat og sikkerhet

Én UTF-8 JSONL-fil per sesjon: `session-<session_id>.jsonl`. Hver linje har
`timestamp` (UTC med tidssone, tidspunkt for lagring), `session_id`, `turn_id`
og `prompt`. Mangler sesjons-ID, brukes `day-YYYY-MM-DD.jsonl` etter UTC-dato.
Manglende ID-er blir `null`. Linjeskift i prompten JSON-kodes og bevares.
Samtidige skrivinger bruker fillås. Sesjoner som gjenopptas med samme ID
fortsetter i samme fil.

Loggeren leser bare hookens JSON fra stdin og skriver de fire feltene over.
Den leser ikke miljøvariabler, vedlegg, transkripsjoner, API-konfigurasjon
eller hemmelighetsfiler. Den logger ikke modellens svar eller verktøyutdata.
Maskering gjelder bare prosjektloggen, ikke prompten som sendes til Codex.

Kjente nøkkelformater, JWT-er, private nøkkelblokker, Bearer/Basic-verdier,
URL-pålogging og verdier eksplisitt merket som eksempelvis `API_KEY=`,
`token:`, `password:` eller `passordet mitt er` erstattes med `REDACTED`.
Deteksjonen er mønsterbasert: umerkede passord og ukjente nøkkelformater kan
ikke identifiseres sikkert. Ikke lim inn ekte hemmeligheter, og gjennomgå
loggdiffen før vanlig commit. Maskering kan også treffe fiktive eksempelverdier.

Ved feil returnerer loggeren en generell feilmelding uten å gjengi input.
Kontroller Codex sine hook-feilmeldinger og at loggfilen faktisk oppdateres;
en mislykket kjøring kan gi et hull i loggen. Tidligere prompter, inkludert
bestillingen som opprettet hooken, etterregistreres ikke automatisk.
Filene er vanlige prosjektfiler som ikke treffes av dagens `.gitignore`.
Ingenting kjører `git add`, commit eller push.

## Test

Etter tillitskontrollen, send én ufarlig prompt i en ny Codex-sesjon i repoet:

> Ufarlig loggtest IBE160: Svar bare OK.

Kontroller at `session-*.jsonl` her inne får en ny linje med nøyaktig denne
teksten, tidspunkt og ID-er. Test i VS Code dersom det er klienten du bruker;
en vellykket direkte Python-test alene beviser ikke at klienten kjører hooken.

Kjør sikkerhets- og filtestene fra repoets rot:

```sh
python3 -m unittest discover -s .codex/hooks -p 'test_*.py' -v
```

Testene bruker midlertidige mapper og fiktive hemmeligheter. De kontrollerer
maskering, bevaring av tekst, samtidighet, dagsfallback, feltavgrensning,
ugyldige hendelser, symbolske lenker og feilmeldinger.

Verifikasjon 2026-10-08: Alle sju tester bestod. Begge installerte motorer
fant hooken via `hooks/list` uten feil eller advarsler. En kontrollert
`codex exec`-kjøring per motor skrev testprompten automatisk med ID-er:

- IDE-motor: `session-01a11b69-bdc7-7541-9563-e1c63915d976.jsonl`
- CLI: `session-01a11b69-e941-77d0-819b-ce1233235cc7.jsonl`

Disse er ekte hook-genererte testlogger, ikke manuelt konstruerte hendelser.
Testkjøringene brukte `--ephemeral`, en utilgjengelig lokal modelladresse og
`--dangerously-bypass-hook-trust` bare for de kontrollerte kjøringene.
Ingen modellrespons var nødvendig for å teste loggingen, og ingen varig
hook-tillit ble gitt. Vanlig aktivering og en test i selve IDE-grensesnittet
gjenstår derfor som beskrevet over.

## Deaktivering

Deaktiver denne `UserPromptSubmit`-hooken via `/hooks` for din lokale Codex.
For å deaktivere oppsettet i selve prosjektet, fjern `UserPromptSubmit`-oppføringen
fra `.codex/hooks.json` (eller slett denne filen så lenge den bare inneholder
loggeren). Start nye sesjoner / last klienten på nytt. Eksisterende logger
beholdes, og ingen Git-operasjoner utføres automatisk.
