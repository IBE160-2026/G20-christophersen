const errorMessages: Record<string, string> = {
    'missing-file': 'Velg en PDF for å starte importen.', 'payload-too-large': 'Filbudsjettet er overskredet. Velg mindre filer; salgsoppgave og separat rapport kan samlet være høyst 50 MiB.',
    'page-limit': 'PDF-en har mer enn 200 fysiske sider. Velg en fil innen støtteprofilen.', 'unsupported-synthetic': 'Denne originalen har ikke et lagret demosvar. Bruk en av de oppgitte syntetiske PDF-ene.',
    'analysis-active': 'En dokumentbehandling pågår. Vent til den er avsluttet før du velger filen på nytt.', 'duplicate-analysis': 'Dokumentet er allerede forsøkt i denne økten. Ingen ny analyse er startet. Behold kontrollgrunnlaget eller start en ny vurdering.',
    'invalid-format': 'PDF-en kunne ikke kontrolleres. Velg en intakt tekstbasert PDF.', 'text-limit': 'Dokumentets tekstgrunnlag er for stort for denne støtteprofilen. Velg en mindre tekstbasert PDF.',
    'response-limit': 'Uttrekkssvaret overskred ressursgrensen. Analysen er stoppet; velg et annet støttet dokument.', 'memory-limit': 'Dokumentbehandlingen overskred minnegrensen og er stoppet. Velg en enklere tekstbasert PDF.',
    'processing-timeout': 'Dokumentbehandlingen overskred tidsfristen og er stoppet. Velg et annet støttet dokument.', 'live-disabled': 'Live-import er stengt. Lokale eksplisitte uttrekk kan kontrolleres, men uløst tekst sperrer rapportbekreftelse.',
    'interrupted': 'Importen er avbrutt. Ingen fullføring er bekreftet.', 'transport-failure': 'Forbindelsen til den lokale serveren ble avbrutt. Kontroller at serveren kjører; grunnlaget er ufullført.',
    'incompatible-context': 'Det bevarte uttrekket har en annen analysekontekst. Start en ny vurdering med gjeldende versjon.',
  }

export const importErrorMessage = (code: string) => errorMessages[code] ?? 'Dokumentimporten kunne ikke fullføres. Velg en tekstbasert PDF og kontroller det nye grunnlaget.'
