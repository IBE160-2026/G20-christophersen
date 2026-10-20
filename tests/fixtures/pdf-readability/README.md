# Fiktiv originalfasit for Story 2.3

`expected.json` ble håndskrevet før første generering/produktuttrekk. Generatoren
leser aldri fasiten og importerer ikke produktkode. Alle originaler er fiktive;
ingen private PDF-er eller adapterreturer inngår. Eksisterende property-cases
og deres bytes/fasit er bevart uendret.

| PDF | Originalinnhold og forventning |
|---|---|
| blank-variants | Seks fysiske sider: ingen Contents, tom liste, tom strøm, rå PDF-whitespace, Flate-whitespace, ASCII85+Flate-whitespace. Alle blank; dokumentet gir feil fordi det bare er blankt. |
| textless-content | Seks sider: vektorfigur, fiktivt foto, rasterisert TG3-tekst, tekstannotasjon, Widget med appearance, vektorplantegning. Alle unreadable; ingen rastertekst er et PDF-tekstlag. |
| mixed-status | Lesbar TG2-tekst, blank, vektor, ustøttet filter, avkortet Flate-strøm. Status readable/blank/unreadable/unknown/unreadable og dokumentfeil med sidene 3/4/5. |
| uncertain-content | Ukjent filter, manglende Annots-referanse, manglende Contents-referanse, whitespace + manglende strøm, lesbar tekst + skadet strøm. Unknown på 1–4, incomplete med bevart tekst på 5. |
| structural-content | Feiltype i Contents, PieceInfo, AF, lokal AP, feiltype i Annots. Unknown/unreadable etter fasit; ingen blank. |
| catalog-form / catalog-xfa | Globale felt/XFA uten etablert fysisk mapping gir unknown. Ingen full formtolker inngår. |
| catalog-empty-form / catalog-empty-dict | Tom Fields-liste/tom formdictionary uten annet innhold gir blank. |
| readable-blank | Lesbar TG2-tekst fulgt av bevist blank med tom Annots-liste. Ingen dokumentfeil. |
| nested-count | Faktisk tre blader, mens både rot og nestet gren deklarerer Count 1. «Fysisk side 1/2/3» skal bli på tilsvarende fysisk posisjon. |
| encrypted-content | Tomt brukerpassord lar PDF.js åpne to sider. Rå kryptert tekststrøm gir unknown; siden uten Contents forblir blank. Faste dokument-ID-er og RC4 gjør fixturebytes reproducerbare. |
| layout | Side 1: tabellrad TG2/slitt baderomsgulv og TG3/lekkasje i tak samt æ/ø/å i begge kasus. Side 2: to kolonner med separate grader/beskrivelser. Side 3: digital TG2-tekst og rasterbilde. Side 4: bare A, uten minstelengde. |

Tekst-/statusfasit er uavhengig av PDF.js. Testene kontrollerer også
linje-/blokksammenhengen grad/beskrivelse, uten å påstå generell semantisk
fullstendighet. Root-agenten krysskontrollerte alle layouttekster med pypdf og
inspiserte fire rendrerte layout-sider og seks textless-content-sider med
PyMuPDF 2026-10-20: norske tegn, tabell/kolonner, foto/skann/annotasjon/widget/
plantegning var synlige uten klipping. Dette er egenverifikasjon, ikke separat
code review. Kuraterte kontaktark lagres med storyens verifikasjonsbevis.

Kjør fra reporoten med Python 3.12.14. Et separat verktøymiljø kan opprettes slik
(installasjon krever nett; etterpå er regenerering lokal):

```sh
python3.12 -m venv /tmp/ibe160-pdf-fixtures
/tmp/ibe160-pdf-fixtures/bin/pip install reportlab==4.4.4 Pillow==13.0.0 pypdf==6.1.3
/tmp/ibe160-pdf-fixtures/bin/python tests/fixtures/pdf-readability/generate.py
```

Disse versjonene er brukt i verifikasjonen. PyMuPDF 1.26.6 er et valgfritt
verktøy for den dokumenterte visuelle kontrollen. pypdf lager bare den krypterte testoriginalen og
brukes ellers til uavhengig kontroll; PyMuPDF brukes bare til visuell kontroll.
Ingen Python-pakke er produktavhengighet. `sha256.json` genereres fra bytes,
adskilt fra den håndskrevne fasiten. Generatoren er deterministisk og kan kjøres
uten nett/adapter/API-nøkkel. `nested-count.pdf` har en presis like-lang
sidetremutasjon som bevarer xref-offsetene; alle andre tilsiktede feil er lokalt
avgrenset til innholds-/annotasjonsstruktur.

Den første forhåndsforventningen behandlet global AcroForm/XFA som påvist lokalt
innhold. Før ferdigstilling ble dette rettet til unknown etter R2s krav om kjent
fysisk sidekobling; en ny forhåndsfasit/test ble lagt til for tom formstruktur.
Ingen utfall eller originaltekst ble endret for å skjule et tapt rapportfunn.

## Reviewtillegg 2026-10-20

Forventningene ble ført i separat oracle før generering og testkjøring.
Alle 13 eksisterende PDF-er er byteidentiske. Sju nye originaler:

| PDF | Uavhengig originalfasit |
|---|---|
| annotated-xfa | Digital TG2-tekst og lokal annotasjon skjuler ikke global XFA; unknown. |
| annotated-uncertain | Fem sider med bevart digital TG2-tekst: uavklart AP, uavklart XFA, Stamp med TG3-appearance, Widget med arvet Tx, Widget med Ch. Alle unknown; ingen fullføring. |
| annotation-text-loss | To sider med digital TG2 samt FreeText TG3 med/uten AP. Begge incomplete med bevart sidetekst; annotasjonsteksten er ikke ekstraktert. |
| text-fragments | T, G og 3 i tilstøtende fontfragmenter skal gi TG3 uten oppdiktede mellomrom. |
| parser-diagnostics | Første side har brukbar TG2-tekst og ukjent operator: unknown fra virkelig PDF.js-diagnostikk. Neste identiske tekstside uten operator er readable. |
| cmap-text | Sammensatt font og innebygd CMap; lesbar TG3-tekst fra bare lokal pakke. |
| review-layout | Radvis flettede kolonner beholder TG2/TG3-raden og beskrivelsesraden. Neste side har bare digital topptekst som tekstlag, samt rasterisert TG3: readable gjelder kun toppteksten. |

Root kryssjekket tekst og fysiske sider med pypdf/PyMuPDF og inspiserte
rendret layout, fontfragmenter, CMap og annotation/AP-varianter. PDF.js
er fortsatt eneste produktparser. Regenerering i isolert tmp-mappe ga
alle 20 PDF-er og manifest byteidentisk. Se storyens separate reviewrapport.
