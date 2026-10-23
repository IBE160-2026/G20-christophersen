# IBE160 project instructions

For work related to scope, planning, testing, documentation, README, repository structure, or submission quality, use the following course guidance as authoritative references:

- `.docs/reference/course/Sensorveiledning-IBE160-Del-1.pdf`
- instructor feedback stored under `.docs/planning-artifacts/`

Use these references when relevant, but do not invent requirements that are not supported by them.

Keep the project aligned with the approved product direction and preserve traceability from planning artifacts to implementation.

Store important prompts and AI work sessions in the repository so the development process remains auditable.

## Prompt logs and working-tree checks

- An untracked `.docs/process/prompts/session-*.jsonl` belonging to the active Codex session is expected process evidence and must not, by itself, trigger a dirty-tree stop.
- Normally include the active session's prompt log in the same local commit as the story or review it documents.
- Do not delete, rewrite, or move earlier prompt logs.
- Dirty-tree stops still apply to other unexpected or unknown files and changes.
- If it is unclear whether a prompt log belongs to the active session, stop and clarify rather than assuming.
