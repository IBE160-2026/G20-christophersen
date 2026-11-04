# Offentlige SSB-data for deterministiske tester

Uendrede JSON-responser fra Statistisk sentralbyrå hentet 4. november 2026,
CC BY 4.0. Dette er offentlig statistikk, ikke bolig-/persondata.

- `09897-metadata.json`: https://data.ssb.no/api/pxwebapi/v2/tables/09897/metadata?lang=no
- `09897-2025.json`: https://data.ssb.no/api/pxwebapi/v2/tables/09897/data?lang=no&valueCodes%5BSoner2%5D=%2A&valueCodes%5BAntRomBRA%5D=%2A&valueCodes%5BContentsCode%5D=Husleie&valueCodes%5BTid%5D=2025

Tester injiserer disse svarene. Produktet henter nyeste år fra SSB og bruker ikke
fixture som nettverksfallback. Se [undersøkelsesnotatet](../../../.docs/implementation-artifacts/leieagent-ssb-research.md)
for datakontroll, metode og begrensninger.
