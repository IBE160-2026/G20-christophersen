from pathlib import Path
import subprocess,json,re,hashlib
root=Path.cwd();out=root/'.docs/implementation-artifacts/sluttforing-2026-10-27'
paths=set(subprocess.check_output(['git','diff','--name-only','8497fe584387636d7bd715c009682c6e72899a99']).decode().splitlines())
paths.update(x for x in subprocess.check_output(['git','ls-files','--others','--exclude-standard','-z']).decode().split('\0') if x)
patterns={'openai-key':rb'\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b','aws-key':rb'\bAKIA[0-9A-Z]{16}\b','private-key':rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----'}
files=[];hits=[]
for name in sorted(paths):
 path=root/name
 if not path.is_file() or path==out/'repository-final-scan.json':continue
 data=path.read_bytes();files.append({'file':name,'sha256':hashlib.sha256(data).hexdigest()})
 for kind,pattern in patterns.items():
  if re.search(pattern,data):hits.append({'file':name,'pattern':kind})
(out/'repository-final-scan.json').write_text(json.dumps({'basis':'8497fe584387636d7bd715c009682c6e72899a99 + leveringsendringer','fileCount':len(files),'patterns':list(patterns),'matchesWithoutValues':hits,'files':files,'limitation':'Mønstergjenkjenning; historikkskann separat; egen rapportfil utelatt for å unngå selvrefererende hash.'},indent=2)+'\n')
print('Sluttskann:',len(files),'filer,',len(hits),'treff')
raise SystemExit(bool(hits))
