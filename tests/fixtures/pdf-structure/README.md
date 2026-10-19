# Alternative PDF-strukturer — Story 2.2-review

Begge filene er avledet fra den eksisterende fiktive `text-30-pages.pdf` i
`property-cases/`. Ingen private originaler, ny semantisk fasit eller adapterretur.
Originalfilen og de ti opprinnelige fixturebytes er uendret.

- `text-30-pages-object-stream.pdf`: PyMuPDF 1.26.6, komprimerte objektstrømmer
  og xref-strøm. Verifiserer at formatsteget ikke forutsetter klartekstobjekter
  eller en klassisk xref-tabell.
- `text-30-pages-linearized.pdf`: pikepdf 10.17.0, linearisert PDF med gyldige
  hints. Verifiserer den eksisterende PDF.js-lineariseringsbanen.

Alle 30 sider i begge varianter er kontrollert med uavhengig pypdf, pikepdfs
syntakskontroll og PyMuPDF. Tekst og renderte piksler er identiske med
originalfilens tilsvarende sider. Dette er container-/strukturtester, ingen
lesbarhetsmetode eller Story 2.3-leveranse.

Vanlig `npm test` leser de innsjekkede filene og krever ingen Python-verktøy.
Valgfri regenerering fra reporoten i det midlertidige forfattermiljøet:

```sh
/private/tmp/ibe160-story-2-2-pdf-venv/bin/python .docs/implementation-artifacts/story-2-2-review-structure-fixtures.py
```

Miljøet bruker Python 3.12.14, PyMuPDF 1.26.6, pikepdf 10.17.0 og pypdf 6.1.3.
`sha256.json` er byteinventar, ikke semantisk fasit. Verktøyene er ikke nye
produktavhengigheter. R2 er fortsatt åpen.
