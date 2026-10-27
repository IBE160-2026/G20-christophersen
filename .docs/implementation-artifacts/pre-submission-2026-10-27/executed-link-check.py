from pathlib import Path
import re,json,urllib.parse
r=Path.cwd();names=['README.md','.docs/implementation-artifacts/sluttforing-leveringsreview-2026-10-27.md','src/backend/README.md','src/contracts/README.md','.docs/implementation-artifacts/story-5-4-ekstern-instruks.md','.docs/implementation-artifacts/story-5-4-forberedelse-2026-10-27.md','.docs/implementation-artifacts/story-5-5-leveringskontroll-2026-10-27.md','.docs/implementation-artifacts/spec-kontrollert-sluttforing-2026-10-27.md','.docs/implementation-artifacts/sluttforing-2026-10-27-review.md','.docs/process/arbeidsokter/2026-10-27-kontrollert-sluttforing.md'];names+=['.docs/implementation-artifacts/pre-submission-quality-gate-2026-10-27.md','.docs/implementation-artifacts/pre-submission-review-2026-10-27.md','.docs/implementation-artifacts/spec-pre-submission-quality-gate-2026-10-27.md','.docs/implementation-artifacts/deferred-work.md','.docs/process/arbeidsokter/2026-10-27-pre-submission-quality-gate.md'];bad=[];count=0
for name in names:
 p=r/name
 for target in re.findall(r'\]\(([^)]+)\)',p.read_text()):
  if re.match(r'^[a-zA-Z]+:',target):continue
  count+=1;rel,_,anchor=target.partition('#');q=(p.parent/urllib.parse.unquote(rel)).resolve() if rel else p
  if not q.exists():bad.append({'source':name,'target':target,'reason':'missing path'});continue
  if anchor and q.is_file() and q.suffix=='.md':
   headings=[]
   for line in q.read_text().splitlines():
    if re.match(r'^#{1,6} ',line):
     s=re.sub(r'^#{1,6} +','',line).strip().lower();s=re.sub(r'[^\w\- ]','',s);headings.append(s.replace(' ','-'))
   if urllib.parse.unquote(anchor) not in headings:bad.append({'source':name,'target':target,'reason':'missing anchor'})
record={'checkedDocuments':names,'localLinksChecked':count,'failures':bad};(r/'.docs/implementation-artifacts/pre-submission-2026-10-27/local-links.json').write_text(json.dumps(record,indent=2)+'\n');print(json.dumps(record));raise SystemExit(bool(bad))
