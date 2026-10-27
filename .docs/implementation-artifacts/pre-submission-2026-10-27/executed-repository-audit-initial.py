from pathlib import Path
import subprocess,re,json,hashlib
root=Path.cwd();out=root/'.docs/implementation-artifacts/pre-submission-2026-10-27'
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
revision=git('rev-parse','HEAD').decode().strip()
patterns={'openai-key':rb'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b','aws-key':rb'\bAKIA[0-9A-Z]{16}\b','private-key':rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'}
known=json.loads((root/'.docs/implementation-artifacts/sluttforing-2026-10-27/repository-hygiene.json').read_text())['matchesWithoutValues']
allowed={(v['object'],v['pattern']) for v in known}
objects={}
for line in git('rev-list','--objects','HEAD').decode().splitlines():
 oid,_,path=line.partition(' ');objects[oid]=path
raw=subprocess.check_output(['git','cat-file','--batch-check=%(objectname) %(objecttype)'],input=('\n'.join(objects)+'\n').encode(),cwd=root)
blobs=[line.split()[0].decode() for line in raw.splitlines() if line.endswith(b' blob')]
raw=subprocess.check_output(['git','cat-file','--batch'],input=('\n'.join(blobs)+'\n').encode(),cwd=root)
position=0;matches=[]
for oid in blobs:
 end=raw.index(b'\n',position);header=raw[position:end].split();size=int(header[-1]);data=raw[end+1:end+1+size];position=end+2+size
 for kind,pattern in patterns.items():
  if re.search(pattern,data):matches.append({'object':oid,'path':objects[oid],'pattern':kind,'classification':'known fictional redaction test' if (oid,kind) in allowed else 'REQUIRES_REVIEW'})
tracked=[x for x in git('ls-files','-z').decode().split('\0') if x]
forbidden=[]
for n in tracked:
 p=Path(n)
 if any(part in {'node_modules','dist','build','private','test-results','playwright-report','.venv','venv'} for part in p.parts) or (p.name.startswith('.env') and not p.name.endswith('.example')):forbidden.append(n)
probes={n:subprocess.run(['git','check-ignore','-q',n],cwd=root).returncode==0 for n in ['node_modules/probe','dist/probe','private/probe','.env','.env.local','test-results/probe','playwright-report/probe']}
preserved=json.loads((root/'.docs/implementation-artifacts/sluttforing-2026-10-27/preserved-evidence-final.json').read_text())
changed=[v['file'] for v in preserved['files'] if hashlib.sha256((root/v['file']).read_bytes()).hexdigest()!=v['sha256']]
working=set(tracked)|{x for x in git('ls-files','--others','--exclude-standard','-z').decode().split('\0') if x}
workingHits=[]
for n in sorted(working):
 p=root/n
 if not p.is_file() or n.endswith('repository-audit.json'):continue
 data=p.read_bytes()
 for kind,pattern in patterns.items():
  if re.search(pattern,data):workingHits.append({'path':n,'pattern':kind,'classification':'known fictional redaction test' if n in {v['path'] for v in known} else 'REQUIRES_REVIEW'})
record={'historyRevision':revision,'historyBlobCount':len(blobs),'patterns':list(patterns),'matchesWithoutValues':matches,'workingFilesChecked':len(working),'workingMatchesWithoutValues':workingHits,'forbiddenTrackedPaths':forbidden,'ignoreProbes':probes,'originalEvidenceFilesChecked':len(preserved['files']),'originalEvidenceChanged':changed,'limitation':'Mønstergjenkjenning, ikke garanti mot alle hemmelighetstyper eller rettighetsvurdering. Arbeidsfiler kontrolleres ved kjøring; fremtidige filer inngår ikke.'}
(out/'repository-audit.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:record[k] for k in ['historyBlobCount','workingFilesChecked','forbiddenTrackedPaths','originalEvidenceFilesChecked','originalEvidenceChanged']}))
assert not forbidden and all(probes.values()) and not changed
assert not any(v['classification']=='REQUIRES_REVIEW' for v in matches+workingHits),'Unexpected pattern match; see value-free metadata'
