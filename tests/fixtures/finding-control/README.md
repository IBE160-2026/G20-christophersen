# Originalfasit for korrigering, RT-11

Håndskrevet fasit i `expected.json`: TG2 «Slitt takoverflate» på fysisk
PDF-side 5 og et separat TG2 «Slitt gulv» på side 2. Side 4 har ingen
teknisk grad. Kontrolladapteren leverer med hensikt feil TG3/tak på side 4.
Fasiten er separat fra generator og adapter. Ingen reell eiendom.

Kjør `node tests/fixtures/finding-control/generate.mjs` for deterministisk
PDF med fem faktiske tekstsider, standardfont og korrekte xref-posisjoner.
Generatoren leser ingen forventninger eller adaptersvar. Bygget-app-prøven
kontrollerer originalens faktiske tekstlag før retting; den rene reducerprøven
kontrollerer revisjoner, originalbevaring og kontrollstatus separat.
