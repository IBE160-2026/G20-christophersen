"""Pure guard: loads classifier without executing repository/history audit."""
from pathlib import Path
import importlib.util
import json
import re
import unittest

base = Path(__file__).resolve().parent
root = base.parents[2]
spec = importlib.util.spec_from_file_location('repository_audit', base / 'executed-repository-audit.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)

class WorkingMatchGuard(unittest.TestCase):
 def test_same_path_different_content_requires_review(self):
  known = json.loads((root / '.docs/implementation-artifacts/sluttforing-2026-10-27/repository-hygiene.json').read_text())['matchesWithoutValues']
  allowed = {(item['object'], item['pattern']) for item in known}
  original = next(item for item in known if (root / item['path']).is_file()
                  and (audit.git_blob_hash((root / item['path']).read_bytes()), item['pattern']) in allowed)
  path = root / original['path']
  data = path.read_bytes()
  self.assertEqual(audit.classify_match(audit.git_blob_hash(data), original['pattern'], allowed), 'known fictional redaction test')
  # Keep synthetic matching content out of source/output; do not mutate the path.
  changed = data + b'\n' + b'sk-' + b'z' * 40
  self.assertTrue(re.search(rb'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b', changed))
  self.assertEqual(audit.classify_match(audit.git_blob_hash(changed), 'openai-key', allowed), 'REQUIRES_REVIEW')
  self.assertEqual(audit.classify_match(audit.git_blob_hash(data), 'unrecognized-pattern', allowed), 'REQUIRES_REVIEW')

if __name__ == '__main__':
 unittest.main()
