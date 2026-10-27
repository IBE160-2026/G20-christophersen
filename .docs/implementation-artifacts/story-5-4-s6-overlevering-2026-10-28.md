# S6-overlevering — frosset lokal kandidat 2026-10-28

**Eier: Mads. Ekstern S6 er ikke gjennomført.**
Dette identifiserer den faktiske rene kopien, ikke et eksternt testresultat.

| Identitet | Faktisk verdi |
| --- | --- |
| Full kildecommit | `7e55652c8a172a129ca879596ed7fd1bc2f3b4f8` |
| Arkivfil | `ibe160-semester-v1-7e55652c8a17.tar.gz` |
| SHA-256 | `a66e90e4b6ad090968a709ebbe7c2ab7d48080c54885be689b8edb22e00d8f8c` |
| Størrelse | 28661887 byte |
| Kontrollert inventar | 1578 vanlige tracked filer, hver byte/modus mot Git |
| Lokal plassering hos Mads | `/Users/madschristophersen/IBE160/G20-christophersen/private/s6-handoff/2026-10-28-7e55652c8a17` |
| Sidefiler i samme mappe | `S6-version.json` og `SHA256SUMS` |

[Maskinlesbar eksportkvittering](pre-submission-2026-10-27/s6-export.json),
[verifisert varig lokal kopi](pre-submission-2026-10-27/s6-delivery-copy.json) og
[relevans mot faktisk prøvd kilde](pre-submission-2026-10-27/s6-source-relevance.json).
Arkivet har én rotmappe med README, kilde, tester, låsfil, fiktive fixtures
og versjonert dokumentasjon. Det har ingen `.git`-historikk,
`node_modules`, `dist`, private originaler eller ekte miljøfil. Ingen
installasjon eller demo er kjørt i et eksternt miljø som del av eksporten.

## Mads gir testpersonen

Gi arkivet og de to sidefilene, samt
[den korte instruksen](story-5-4-ekstern-instruks.md). Appkjøring skjer kun
fra README. Personen registrerer full **kildecommit fra kvitteringen** og
arkivets SHA-256 i [den eksisterende bevismalen](story-5-4-forberedelse-2026-10-27.md#bevismal--ingen-observasjoner-registrert).
Malen er fortsatt blank; ingen observasjoner er fylt inn av agenten.

Arkivet inneholder nøyaktig kildecommiten over. Senere dokumentasjonscommits
registrerer eksportkvittering, lukking og internt checkpoint; disse er
ikke en ny produkt-/testversjon og finnes ikke inne i dette arkivet. Bruk
ikke en senere HEAD som identitet for denne arkivfilen. Ved senere endring
av produkt/oppskrift må relevant kontroll og ny versjonsbundet overlevering
vurderes. Den varige lokale kopien ligger Git-ignorert under `private/s6-handoff/`;
Mads gir faktisk testperson pakken og sidefilene. Den opprinnelige
eksportkvitteringen viser midlertidig eksportplassering; kopikvitteringen
bekrefter identisk SHA-256 på den varige plasseringen. Ingen sending/push
er gjort her.

## Før innlevering

Mads avtaler en annen person/rent miljø og mottar personens faktiske
kommandoer, utfall og avvik. Nødvendig retting/rekontroll skjer før 5.4
og samlet 5.5 vurderes. S5-W1 og formell 4.5-status beholdes. Eventuell
rett til offentlig deling av kurskilder avklares av Mads. Endelig
leveranseversjon må gjøres tilgjengelig i avtalt innleveringskanal før
fristen; lokal S6-eksport er ingen innlevering og inneholder ikke hele
Git-historikken som sensor skal kunne gjennomgå.
