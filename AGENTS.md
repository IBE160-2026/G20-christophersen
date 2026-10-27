# IBE160 project instructions

For work related to scope, planning, testing, documentation, README, repository structure, or submission quality, use the following course guidance as authoritative references:

- `.docs/reference/course/Sensorveiledning-IBE160-Del-1.pdf`
- instructor feedback stored under `.docs/planning-artifacts/`

Use these references when relevant, but do not invent requirements that are not supported by them.

Keep the project aligned with the approved product direction and preserve traceability from planning artifacts to implementation.

Store important prompts and AI work sessions in the repository so the development process remains auditable.

## Issue tracking

- `.docs/implementation-artifacts/deferred-work.md` is the only central overview of deferred bugs and improvements. Story and review documents remain supporting evidence; link to them from the overview rather than maintaining parallel issue lists.
- Preserve original entries and their history. Record explicit open/closed status. Close an item only with documented resolution, approved relevant tests/review, resolution date, relevant commit and verification links. A completed story or an implementation claim alone is not sufficient. Entries without explicit closure remain open.
- Use the existing `.docs/process/` structure for necessary session evidence and keep automatic Codex prompt logging unchanged. Do not create `.logs/` or separate `issues.md` systems, or invoke `sesjonslogg` to create them. This project rule overrides the generic session-log skill's output and commit instructions.

## Prompt logs and working-tree checks

- An untracked `.docs/process/prompts/session-*.jsonl` belonging to the active Codex session is expected process evidence and must not, by itself, trigger a dirty-tree stop.
- Normally include the active session's prompt log in the same local commit as the story or review it documents.
- Do not delete, rewrite, or move earlier prompt logs.
- Dirty-tree stops still apply to other unexpected or unknown files and changes.
- If it is unclear whether a prompt log belongs to the active session, stop and clarify rather than assuming.
