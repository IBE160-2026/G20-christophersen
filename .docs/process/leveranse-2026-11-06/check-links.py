"""Kontroller lokale Markdown-filmål i leveransens endrede/nye dokumenter.
Eksterne URL-er og fragmentankre inngår ikke i denne filkontrollen.
Kjør fra reporoten; tidligere historiske dokumenter endres ikke.
"""
from pathlib import Path
import json
import re
import subprocess

BASELINE = '639291814886a6058a24adf95c69e8633b645944'
paths = set(subprocess.check_output(['git', 'diff', '--name-only', BASELINE], text=True).splitlines())
paths.update(subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], text=True).splitlines())
checked, missing, links = [], [], 0
for name in sorted(paths):
    path = Path(name)
    if path.suffix != '.md' or not path.is_file():
        continue
    checked.append(name)
    for line_number, line in enumerate(path.read_text().splitlines(), 1):
        for raw in re.findall(r'!?\[[^\]]*\]\(([^)]+)\)', line):
            target = raw.split('#', 1)[0]
            if not target or re.match(r'\w+://|mailto:', target):
                continue
            links += 1
            if not (path.parent / target).exists():
                missing.append({'file': name, 'line': line_number, 'target': target})
record = {'baseline': BASELINE, 'files': checked, 'localFileTargets': links, 'missing': missing,
          'limitation': 'Kontrollerer fil/dirmål; ikke eksterne kilder eller fragmentankre.'}
Path('.docs/process/leveranse-2026-11-06/linkcheck.json').write_text(json.dumps(record, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'markdownFiles': len(checked), 'localFileTargets': links, 'missing': missing}, ensure_ascii=False))
raise SystemExit(bool(missing))
