# Avgrenset økonomiprøve – 2026-10-30

Brukeren autoriserte videre kodearbeid fra full baseline
`58f11cfd9e3d25481ed3a385464e31aec4b1df1c`, avgrenset første prøve til økonomiske
opplysninger og dokumenterte begrensninger, og ba om stopp for fasit-/betalt
kallgodkjenning. Teknisk/TG-dekning forblir uavklart. Aktiv automatisk
[promptlogg](../prompts/session-01a187a8-c6d4-78e1-83e0-6cc45de8cd2c.jsonl) er bevart.

BMAD-build ble kjørt med kort intern [implementeringsspec](../../implementation-artifacts/spec-salgsoppgave-economy-trial.md),
ingen ny designgodkjenningsrunde. To undersøkelsesagenter ga konkrete kode-/pris-
funn; én sekvensiell implementeringsagent utførte endringene. Root integrerte,
kontrollerte originalgrunnlaget privat og utførte tre kontekstfrie BMAD-reviewlag.
Alle reviewfunn, inkludert to fra nykontroll, ble rettet og kontrollert igjen.

PDF-kontrollen validerer kjente PieceInfo/InDesign-/Transparency-strukturer,
inklusive UTF-16-metadata, uten generell metadata-unntaksregel. Ressursgrense
blandes ikke lenger med skadet komprimering. Samtidig kjent teksttap beholdes.
Raster og usikre sider fjernes aldri fra originalregnskapet. En innledende
AP-statusregresjon ble rettet mot uendret historisk fasit.

Ny økonomiprøve sender kun eksplisitt valgte lesbare sider som tekst og har
eget avgrenset formål. Den fullstendige TG-prøvens porter er uendret. Originalen
leses på nytt før preflight. Faste felt, kategorier, rå beløp/kvalifikasjoner,
kildespenn og usikkerhet kontrolleres; kandidatresultatet krever menneskelig
fasitsammenligning og blir aldri en ferdig finans-/screeningvurdering.

Root laget en privat enkel fasitoversikt med eksakte originalkilder og tydelige
forbehold. Menneskelig godkjenning er null. Pakke-/request-/fasitforslagets binding
ligger i en separat privat ventende godkjenningsmanifest. Maskinens lokale felt
blir ikke automatisk menneskelig fasit. Originalfiler, tidligere fasitskjemaer og
attestasjoner er bevart; ingen frysing eller budsjettinitialisering er gjort.

Offisiell OpenAI-dokumentasjon ble åpnet og kontrollert på nytt. SDK-count-
støtte og modellmakspriser er kjent, men count-endepunktets egen pris er fortsatt
ikke dokumentert. Ikke anta gratispris eller at et vilkårlig restbeløp dekker
gebyret. Ukjent pris stopper før count/generering; ingen godkjenning er innhentet
eller satt automatisk. Samlet USD 0,20, reasoning/output, separat rapport og
varig historikk gjelder fortsatt. Dagens preflight er ikke API-klar.

Alle dokumentverdier, navn, kildeutdrag, originalhash, ekte request og visuelle
kontroller ligger kun i ignorert private/. Versjonert bevis er anonymisert.
Ingen privat fil er sporet/staget, ingen nøkkel er lest og ingen betalt count,
modellgenerering eller push er utført. Fullt test-/reviewbevis og fortsatt åpne
porter står i [sluttverifikasjon](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/verifikasjon.md).

## Oppfølging etter fasitgodkjenning

Brukeren godkjente deretter det viste fasitforslaget med alle avvik og
forbehold, og opprettholdt kravet om særskilt betalt godkjenning. Godkjenningen
er registrert privat med eksakt fasitdigest etter lokal original-/kilde-/wire-
kontroll. Ingen omfattende testrunde, kodeendring eller betalt kall er utført.
Oppdatert offentlig dokumentsøk etablerte fortsatt ikke count-endepunktets
pris. [Prisavklaring og usendt konkret henvendelse](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/prisavklaring.md)
beskriver dette og hva som må foreligge før sperren kan åpnes. Historiske
beskrivelser av null godkjenning ovenfor gjelder forrige checkpoint.

Brukeren fjernet deretter server-count som obligatorisk for første prøve og
autoriserte lokal konservativ kontroll. [Implementasjon og målrettet bevis](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/lokalt-budsjett.md)
viser ettkallsport, helt request-/schemabudsjett, 4000 output inklusive reasoning,
USD 0,14 modellmaksimum og USD 0,15 varig reservasjon med USD 0,05 margin.
7 nye tester, typecheck og avgrenset lint består; ingen omfattende testrunde.
Første prøve er klar for særskilt betalt godkjenning, men ikke kjørt.

Brukeren godkjente ett betalt kall. Engangsoppstarten ble deretter avvist av
automatisk godkjenningskontroll før prosess/API fordi den krevde uttrykkelig
navngivning av OpenAI API som mottaker av private utdrag. [Avvisning og lokal
null-kallskontroll](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-forsok-avvist.md)
er dokumentert. Ingen omgåelse eller nytt forsøk, ingen API-kostnad eller
modellresultat. Avventer kun den konkrete mottakergodkjenningen.

Brukeren ga deretter uttrykkelig mottaker-/modell-/side-/ettkallsgodkjenning.
Ett faktisk Responses-kall ble utført med kun valgt tekst, og API-et returnerte
HTTP 400 `invalid_json_schema` for arvet lookahead i felt-ID-regexen. Ingen
modellrespons eller usage kom tilbake. [Faktisk resultat, kostnadsusikkerhet,
beholdt reservasjon og lokal schema-retting](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-resultat-1.md)
er dokumentert. Ingen ekstrakall, journalnullstilling eller push. Modellen er
ikke kvalitetsvurdert og PAA bestod ikke denne integrasjonstesten.

Brukeren godkjente ett nytt kall med rettet schema. Hele nye requesten ble
kontrollert lokalt, valgt tekst/fasit ble bevart, og nøyaktig ett nytt kall
ble utført innen den nye uttrykkelig godkjente testrundens egen ramme.
Forrige journal ble ikke nullstilt. [Andre faktiske resultat](../../implementation-artifacts/salgsoppgave-economy-trial-2026-10-30/live-resultat-2.md)
har HTTP 200, men outputtak nådd: 4493 input, 4000 output inklusive 1034
reasoning. Faktisk usage og cache-write gir USD 0,051231 i prisbasert kostnad;
faktura ikke separat verifisert. Delvis fasitkontroll viser riktige tilgjengelige
beløp, men manglende ferdig analyse og kildekontraktfeil. Testen bestod ikke.
Ingen ekstrakall/push; private bevis og historiske reservasjoner beholdes.
