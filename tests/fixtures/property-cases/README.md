# Fiktive rapporter og uavhengig fasit — Story 2.2

Alle filer er laget for IBE160. De har ingen virkelig adresse, person,
privat original eller faktisk modellkjøring. Den håndskrevne `expected.json`
ble fastsatt før PDF-generering/adapterbruk fra Story 2.2 og
[Brief-addendum](../../../.docs/planning-artifacts/briefs/brief-IBE160-2026-09-15/addendum.md).
Generatoren leser ikke fasiten, parserretur eller adapterretur. Ingen lagret
adapterretur er etablert i denne storyen. `sha256.json` er et generert
byteinventar, ikke semantisk fasit eller demo-oppslag.

| Fil | Fastlagt formål |
|---|---|
| `F1-tilstandsrapport.pdf` | Fire sider; TG2 «Slitt overflate på baderomsgulv» på PDF-side 2, ingen TG3. |
| `F2-tilstandsrapport.pdf` | Samme funnplassering som F1; separat rapportidentitet. |
| `F3-tilstandsrapport.pdf` | Samme funnplassering som F1; L forblir `null` i det separate finansgrunnlaget. |
| `F4-tilstandsrapport.pdf` | Samme TG2, i tillegg TG3 «Alvorlig lekkasje i tak» på PDF-side 4 / trykt side 2 (RT-5). |
| `F1-tilstandsrapport-endret.pdf` | Gyldig F1 med tilleggskommentar i bytes; samme sideantall, ny hash. |
| `text-30-pages.pdf` / `text-31-pages.pdf` | Faktisk tekst på hver av 30/31 sider; RT-1s formatdel og RT-2. |
| `without-text-layer.pdf` | Én gyldig vektorside uten tekstlag. Formatgodkjenning sier ingenting om lesbarhet. |
| `invalid-format.pdf` | Ren tekst med PDF-filnavn; faktisk format avgjør. |
| `damaged-container.pdf` | PDF-signatur med uleselig container; rå testmarkør må aldri inngå i feilårsaken. |

Funnfasiten fastsetter alle eksplisitte TG2/TG3, dokumentnavn, filposisjon,
eventuelt trykt sidenummer og avklaringsstatus. Finansdata er kontrollerte
brukerforutsetninger utenfor PDF-rapportene. Kanoniske strenger, kostnadsinnhold
D=400000 og separat J=800000, forventede nøkkeltall og anbefalinger følger
det låste vedlegget. Forventet anbefaling gjelder bare forutsetningene i
fasiten; Story 2.2 har ingen finans-/screeningimplementasjon. F3 gir ingen
gyldig S5-hovedstart før manglende leie er rettet og bekreftet.

Vanlige `npm test` bruker de innsjekkede filene og krever bare prosjektets
Node/npm-installasjon. Valgfri regenerering bruker Python 3.12 og
ReportLab 4.4.4, med fast metadata (`invariant=1`) og standardfont Helvetica:

```sh
python3.12 -m venv /tmp/ibe160-pdf-fixtures
/tmp/ibe160-pdf-fixtures/bin/pip install reportlab==4.4.4
/tmp/ibe160-pdf-fixtures/bin/python tests/fixtures/property-cases/generate.py
```

Kjør fra reporoten. Regenerering overskriver de ti navngitte fixturefilene
og byteinventaret. Den er kontrollert byte-identisk med den dokumenterte
Python-/ReportLab-versjonen. De to ugyldige filene skal fortsatt være ugyldige.
Endrede rapportbytes gir ny identitet og må senere håndteres eksplisitt av
demo-/evalueringsstoryene; fasiten skal ikke tilpasses et modelluttrekk.

For uavhengig inspeksjon/rendering kan samme midlertidige miljø installere
`pypdf==6.1.3 pymupdf==1.26.6 pillow==13.0.0` og kjøre:

```sh
/tmp/ibe160-pdf-fixtures/bin/python .docs/implementation-artifacts/story-2-2-fixture-inspection.py
```

Dette sjekker fixtureinnhold og lager kontaktark; det implementerer ingen
lesbarhetsmetode. [Verifikasjonen](../../../.docs/implementation-artifacts/story-2-2-verifikasjon.md)
beskriver faktisk visuell kryssjekk og bevisgrenser. R2 er lukket som beslutningsport 2026-10-20; faktiske tekst-/blankdeteksjonstester gjenstår i Story 2.3.
