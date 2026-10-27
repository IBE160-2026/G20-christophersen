"""Negative eksportprøver i isolert, fiktivt Git-repo; ingen ekstern S6."""
from pathlib import Path
import tempfile,subprocess,json,hashlib
root=Path.cwd();out=root/'.docs/implementation-artifacts/pre-submission-2026-10-27';script=out/'executed-s6-export.py'
records=[]
with tempfile.TemporaryDirectory(prefix='ibe160-export-guards-',dir='/private/tmp') as name:
 fixture=Path(name)
 def git(*args):return subprocess.check_output(['git',*args],cwd=fixture,stderr=subprocess.DEVNULL)
 git('init','-q')
 (fixture/'README.md').write_text('Fiktiv lokal guard-fixture, ikke produkt/testbevis.\n')
 (fixture/'tsconfig.json').write_text('{}\n')
 git('add','README.md','tsconfig.json');git('-c','user.name=IBE160 guard fixture','-c','user.email=fixture@example.invalid','commit','-qm','fixture for local negative export guard')
 revision=git('rev-parse','HEAD').decode().strip()
 for case in ['untracked-source','modified-tsconfig']:
  if case=='untracked-source':
   (fixture/'src').mkdir();(fixture/'src/uncommitted.ts').write_text('// fiktiv, ikke produkt\n')
  else:(fixture/'tsconfig.json').write_text('{"compilerOptions":{}}\n')
  before=set(Path('/private/tmp').glob('ibe160-s6-*'))
  result=subprocess.run(['python3',str(script),revision],cwd=fixture,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=20)
  created=set(Path('/private/tmp').glob('ibe160-s6-*'))-before
  records.append({'scenario':case,'exitCode':result.returncode,'archiveCreated':bool(created),'expected':'Avvist før eksport','fixtureOnly':True})
  assert result.returncode!=0 and not created
  if case=='untracked-source':(fixture/'src/uncommitted.ts').unlink();(fixture/'src').rmdir()
  else:(fixture/'tsconfig.json').write_text('{}\n')
record={'scriptSha256':hashlib.sha256(script.read_bytes()).hexdigest(),'externalS6Executed':False,'scenarios':records}
(out/'export-guards.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(record,ensure_ascii=False))
