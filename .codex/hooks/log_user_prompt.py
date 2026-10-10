"""Lagre bare utvalgte UserPromptSubmit-felter, uten nettverk eller miljølesing."""

import datetime as dt
import fcntl
import json
import os
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[2]
LOG_DIR = ROOT / ".docs/process/prompts"

# Kjente nøkkelformater samt eksplisitt navngitte hemmeligheter.
SECRET_PATTERNS = [
    re.compile(r"-----BEGIN (?:[A-Z ]*PRIVATE KEY)-----.*?-----END (?:[A-Z ]*PRIVATE KEY)-----", re.S),
    re.compile(r"\b(?:sk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|(?:AKIA|ASIA)[A-Z0-9]{16})\b"),
    re.compile(r"\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b"),
]
LABEL = r"(?:[\w-]*(?:api[_ -]?(?:key|nøkkel)|access[_ -]?token|refresh[_ -]?token|token|password|passwd|passord(?:et)?|secret|client[_ -]?secret)[\w-]*)"
ASSIGNMENT = re.compile(
    r"(?P<prefix>\b" + LABEL
    + r"(?:\s+(?:mitt|min))?[\"'`]?\s*(?::|=|\ber\b|\bis\b)\s*)"
    + r"(?P<value>\"(?:\\.|[^\"\\])*\"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|[^\s,;\"'`<>]+)",
    re.I,
)
BLOCK_SECRET = re.compile(
    r"(?P<prefix>^[ \t]*[\"']?" + LABEL
    + r"[\"']?[ \t]*:[ \t]*)[|>][+-]?[ \t]*\r?\n(?:[ \t]+[^\n]*(?:\n|$))+",
    re.I | re.M,
)
AUTH = re.compile(r"(?P<prefix>\b(?:Bearer|Basic)\s+)[A-Za-z0-9_~+/=.-]+", re.I)
URL_AUTH = re.compile(r"(?P<prefix>\b[a-z][a-z0-9+.-]*://)[^\s/@:]+:[^\s/@]+@", re.I)


def redact(prompt):
    for pattern in SECRET_PATTERNS:
        prompt = pattern.sub("REDACTED", prompt)
    prompt = BLOCK_SECRET.sub(lambda m: m["prefix"] + "REDACTED\n", prompt)
    prompt = ASSIGNMENT.sub(lambda m: m["prefix"] + "REDACTED", prompt)
    prompt = AUTH.sub(lambda m: m["prefix"] + "REDACTED", prompt)
    return URL_AUTH.sub(lambda m: m["prefix"] + "REDACTED@", prompt)


def log_prompt(event):
    if event.get("hook_event_name") != "UserPromptSubmit":
        raise ValueError("Feil hendelse")
    prompt = event.get("prompt")
    if not isinstance(prompt, str):
        raise ValueError("Mangler prompttekst")
    cwd = Path(event["cwd"]).resolve()
    if cwd != ROOT and ROOT not in cwd.parents:
        raise ValueError("Arbeidsmappe utenfor prosjektet")
    session = event.get("session_id") or None
    turn = event.get("turn_id") or None
    for identifier in (session, turn):
        if identifier is not None and not re.fullmatch(r"[A-Za-z0-9_-]{1,128}", identifier):
            raise ValueError("Ugyldig identifikator")
    now = dt.datetime.now(dt.timezone.utc)
    filename = "session-" + session if session else "day-" + now.date().isoformat()
    record = {"timestamp": now.isoformat(), "session_id": session,
              "turn_id": turn, "prompt": redact(prompt)}
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    if LOG_DIR.is_symlink() or LOG_DIR.resolve() != LOG_DIR:
        raise ValueError("Loggmappen kan ikke være en symbolsk lenke")
    flags = os.O_WRONLY | os.O_CREAT | os.O_APPEND | os.O_NOFOLLOW
    with os.fdopen(os.open(LOG_DIR / (filename + ".jsonl"), flags, 0o600), "a", encoding="utf-8") as stream:
        fcntl.flock(stream, fcntl.LOCK_EX)
        stream.write(json.dumps(record, ensure_ascii=False) + "\n")
        stream.flush()
        os.fsync(stream.fileno())


if __name__ == "__main__":
    try:
        log_prompt(json.load(sys.stdin))
    except Exception:
        # Ikke skriv input eller unntaksverdier: de kan inneholde hemmeligheter.
        print("Promptlogging feilet; prompten ble ikke bekreftet lagret. Kontroller hook og loggmappe.", file=sys.stderr)
        sys.exit(1)
