# Uavhengig BMAD-review — første runde 2026-10-29

Tre kontekstfrie reviewere har lest snapshotet fra baseline `9f49aa083b3fdd65cf0765119c33b6aa34a115bc`.
Blind-hunter leverte 10 funn, edge-case-hunter 2 og verification-gap 2. Alle 14 er
triagert før gruppering. B1/E1 har samme rotårsak; begge beholdes. Ingen nye
produktbeslutninger er identifisert. Rettelser skjer innen godkjente AC, uten nye
finans-/screeningregler, betalte kall eller live-aktivering.

| ID | Linse | Vurdering | Funn / bevis | Rute |
| --- | --- | --- | --- | --- |
| B1 | blind-hunter | high | D får finansieringsåret i stedet for dokumentert kostnadsår. Autofill velger p.financing.year for begge felter; reproduksjon fra edge-review bekrefter 2026→2027. | patch |
| B2 | blind-hunter | high | Inline-bilder uten XObject kan unngå rasterflagget. Rasterkontrollen går bare gjennom Resources/XObject; BI-operatør i sidens innholdsstrøm inspiseres ikke. | patch |
| B3 | blind-hunter | high | Intern eiendomsmotstrid i integrert dokument kan bekreftes. Conflict beregnes bare ved separate utfall; comparePropertyIdentity(self,self) må også brukes på kandidater i samme original. | patch |
| B4 | blind-hunter | medium | Vedleggsmetadata kan motsies av tomme dekningslister. Schema kontrollerer lengde ved komplett rapport, men avstemmer ikke faktisk attachment-ID-sett. | patch |
| B5 | blind-hunter | high | Importerte kostnadsrader slettes også etter manuelt eierskap. Filteret fjerner import-prefiks uten å se manualFields, mens D/J-verdiene bevares. | patch |
| B6 | blind-hunter | medium | Urelaterte eksplisitte nullbekreftelser tømmes. autofill setter explicitZeros=[] selv når manuelt felt ikke erstattes. | patch |
| B7 | blind-hunter | medium | Eierform styrer ikke avgiftens relevanskontroll. Draftet mister eierform; dokumentavgiften behandles likt ved ukjent eierform/borettslag. Løs med eksplisitt brukerbegrunnelse, aldri lovtolkning eller ny avgiftsberegning. | patch |
| B8 | blind-hunter | medium | Feil separat rapport kan ikke fjernes til fordel for bevart integrert grunnlag. technicalImport foretrekker report.selected og eksisterende handlinger tømmer den ikke; lokal gjenoppretting kan bruke bevart uttrekk uten nytt kall. | patch |
| B9 | blind-hunter | medium | Belegg for eierform/identitet/område vises ikke ved kontroll. UI viser økonomifeltets kilder, men ikke ownershipSources/propertyIdentity/sections.basis. | patch |
| B10 | blind-hunter | medium | Review-snapshot mangler lenkede verifikasjons-/prosessfiler. Filene ble ferdigstilt etter snapshot, er nå kontrollert på disk og inkluderes i sluttstaging; lenkekontroll er grønn. | patch-resolved |
| E1 | edge-case-hunter | high | D-år samsvarer ikke med kildene. Uavhengig reproduksjon /private/tmp/so1-edge-repro.mjs bekrefter samme rotårsak som B1; beholdes som egen triagerad. | patch |
| E2 | edge-case-hunter | medium | end utenfor sidetekst godtas fordi slice klamper. Kildevalideringen har ingen end<=text.length; reproduksjon viser akseptert ugyldig suffix-range. | patch |
| V1 | verification-gap | medium | Tekstbudsjettets faktiske worker-/HTTP-kobling mangler grenseprøve. Pre-verifisert: helpertestene sender budsjettet selv og oppdager ikke fjernet worker-argument. | patch |
| V2 | verification-gap | medium | Aktiv import testes ikke med gyldig svar bundet til feil dokument/forelder. Pre-verifisert: eksisterende sene svar stoppes før metadata-mismatch-grenen. | patch |

Tillegg fra hovedagentens uavhengige kontroll av review-fixturene:

| R1 | root-independent-pdf | medium | Inline-fixturens footerfont har ugyldig referanse; uavhengig pypdf feiler med KeyError('/Subtype'). Ressurser må klones, og readable footer + ulest raster testes separat. | patch |

## Rettelser og uavhengig nykontroll

Alle 15 registrerte rader er håndtert; B1/E1 er samme rotårsak.
De 136 målrettede testene og den fulle regresjonen med 1314 tester består.
Alle tre opprinnelige reviewere har gjort en fokusert nykontroll og returnert `[]`;
se [nykontroll](review-recheck.json) og [kanonisk triage med løsning](review.json).
Hovedagentens uavhengige kontroll bekrefter gyldig fontreferanse, lesbar digital
footer, inline-raster uten XObject og korrekt visuelt sidegrunnlag.
Ingen funn krevde endring av godkjent produktretning eller finansregler.

Verifisert produktkode er lokalt committet som `c516b8682ae0bac9d38a10a064dcedc9984e5167`.
