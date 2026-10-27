from pathlib import Path
exec(Path('/tmp/ibe160-final-regression.py').read_text().split('results=[]')[0])
results=json.loads((out/'final-regression.json').read_text());results[-1]['resolvedBy']='e2e-port-fix.txt; 1/1 bestått etter numerisk porttilpasning, øvrige 194/194 fra fullrunden'
for name,args in checks[5:]:
 started=time.monotonic();print('START '+name,flush=True);path=out/('final-'+name+'.txt')
 with path.open('w') as log:
  result=subprocess.run(['/usr/bin/sandbox-exec','-f',str(root/'.docs/implementation-artifacts/story-5-3-nettprofil.sb'),*args],cwd=copy,env=env,stdout=log,stderr=subprocess.STDOUT)
 record={'check':name,'command':args,'cwd':copy,'exitCode':result.returncode,'seconds':round(time.monotonic()-started,2),'log':path.name};results.append(record);(out/'final-regression.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(record),flush=True)
 if result.returncode:raise SystemExit(result.returncode)
