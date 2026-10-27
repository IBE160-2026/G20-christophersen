# Duplicate announcement regression — 2026-10-27

Runtime: Node v24.21.0 at the explicit path below. Working directory: repository root. Unit run started 23:47:59 local time (the filename suffix is only a unique evidence identifier).

```sh
/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin/node node_modules/vitest/vitest.mjs run tests/unit/report-session.test.ts > .docs/implementation-artifacts/pre-submission-2026-10-27/gate-duplicate-announcement-unit-2354.txt 2>&1
```

Exit 0; 34 tests passed. The pure reducer/status checks now assert that repeated duplicate rejection announces the duplicate barrier and the original timeout/transport-failure code. E2E assertions for the existing single `#report-announcement` were added to both duplicate scenarios; browser execution remains with the root agent. No server, browser, build, or other tests were run for this follow-up.
