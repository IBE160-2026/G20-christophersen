# Lagrede demosvar — Story 2.4

Disse fire JSON-filene er kontrollerte, fiktive uttrekk skrevet for demoen.
De er ikke resultat av en faktisk KI-/live-kjøring. Rapportoriginalene finnes
under `tests/fixtures/property-cases/`; svarene er skrevet separat fra den
uavhengige `expected.json`-fasiten. Produktkode leser aldri testfasiten.

| PDF | SHA-256 / JSON-fil | Funn på fysisk PDF-side |
|---|---|---|
| F1-tilstandsrapport.pdf | c3a92dc24004601803928b5ad479165d042cf199f099e190d40b732a58a388cb | TG2, side 2 |
| F2-tilstandsrapport.pdf | 458414c5c4556e999d7c6ca045bfc25e0de7d8f39185edb85d49e812de56ce86 | TG2, side 2 |
| F3-tilstandsrapport.pdf | ae2bc258d529ff2b231e553e22281644b3281ea909afd735073eed4cdf3ceace | TG2, side 2 |
| F4-tilstandsrapport.pdf | 545f888a4ae0c9d4b9836c0f6c6317aaa89cf38478ca27f1ed32d3c775f93c9b | TG2, side 2; TG3, side 4 (trykt side 2) |

Filnavnet er den eksakte SHA-256 av originalbytes; konvolutten kontrollerer
hashen igjen. Konvolutt og uttrekk krever kontraktversjon 2 / uttrekksversjon 1.
Selve `outcome` valideres med felles `AdapterOutcomeSchema`. RequestId og
kjøremodus lagres ikke her; de bindes fra gjeldende dokumentkontekst i kode.
Originale funn/kilder bevares. Omdøping av identiske PDF-bytes finner samme
uttrekk, men avvikende originalt kildenavn blir synlig usikkerhet gjennom den
felles kildevalideringen. Navn brukes aldri til oppslag eller som filsti.

Manglende, feilbundet, ugyldig eller uleselig lokal fil gir eksplisitt feil.
Ingen generering, oppdatering, eksternt kall eller live-fallback skjer under
kjøring. Nye/endret rapportbytes krever et eksplisitt nytt kontrollert svar;
filnavn eller «liknende» innhold kan aldri gjenbruke et annet svar. Uavhengig
rapportfasit skal fortsatt fastsettes før uttrekket og ikke tilpasses det.
