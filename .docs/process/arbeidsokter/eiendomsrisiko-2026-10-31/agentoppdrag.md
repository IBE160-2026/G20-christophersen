# Viktige agentoppdrag og presiseringer

Kilde til produktbestillingen: den uendrede automatiske promptloggen
`../../prompts/session-01a18ff5-c8a5-7c42-965c-65c87cafbaf1.jsonl`.
Dette er prosessunderlag, ikke en ny sentral oppgaveliste.

## Parallelle implementeringsoppdrag

- Agent legal: undersøk eksisterende lokal import og implementer juridiske/praktiske begrensninger i salgsoppgaver. Verifiser Øvre Blekeveien 8 fysisk side 58 lokalt. Bevar originalkilder, aldri utled generelt utleieforbud fra manglende godkjenning av bruksenhet. Eierskap: felles kilde-/risikokontrakter, legal-risk.ts og unitprøver.
- Agent technical: utvid konservative eksplisitte TG2/TG3-format, finn tekniske avviksblokker og skill ikke undersøkt fra feil. Grafiske grader skal ikke gjettes. Eierskap: technical-risk.ts, local-plan.ts og unitprøver. Manifest/residualer og eksisterende kontrollsperrer bevares.
- Agent risk_ui: implementer risikooversikt og detaljer i Konsept A med dokumentert/mulig/ikke undersøkt. Kilder skal binde hash/navn/fysisk side. Separate rapporter skal kunne lastes opp fra hovedsiden. Eierskap: selector, RiskOverview, InvestmentOverview, CSS og UI-prøver. Ingen finansendringer.

Alle startet med lesing av AGENTS.md og relevant eksisterende kode/BMAD-materiale. Hovedagent avklarte felles kontrakt før implementeringsstart og eide integrasjon/runtimevalidering. Ingen agent fikk tillatelse til betalte API-kall, push eller private PDF-er i Git.

## Viktig korrigering fra lokal undersøkelse

Teknisk agent fant at eksisterende PDF-inspeksjon markerer rapporttekst som unknown/incomplete, selv om PDF.js har bevart teksten. Hovedagentens presisering var:

> Implementer retained-text-kandidater kun i analyzeTechnicalRisks: unknown/incomplete med ikke-tom tekst kan undersøkes, men alle funn fra slike sider må være possible, grade:null og sourceQuality partial-text, med tydelig varsel. Ikke endre kontrollerbare TG-funn eller rapportdekning. Eksakt hash/offset/quote og ulest-sideliste valideres separat.

Dette ble testet negativt for oppgradering til documented/TG3, fjernet kvalitetsmerking, tapt ulestside og forfalsket originaltekst.

## Uavhengige BMAD-reviewoppdrag

Tre nye agenter uten implementasjonssamtalen fikk samme frosne diff fra systemets tempmappe:

1. Blind Hunter: se etter mangler og feil; beregn finding floor fra diffstørrelse; returner konkrete funn uten prioritering.
2. Edge Case Hunter: les den renderte BMAD-instruksen og følg dataflyt/kanttilfeller; spesifikasjonen gis separat som claims_file.
3. Verification Gap: les den renderte BMAD-instruksen og undersøk faktiske tester, kallere og manglende verifikasjon.

Ingen reviewer kunne redigere eller delegere videre. Hovedagent reproduserte funnene og førte alle 17 individuelt i spesifikasjonens Review Triage Log. De samme tre revieweragentene kontrollerte egne funn på nytt etter rettingene. Testreviewer kontrollerte deretter også de små portkonfigurasjonsrettingene i eldre nettlesertester. Endelige testutdata og vurdering finnes i arbeidsøkten.
