import subprocess,os,json,time,hashlib
from pathlib import Path
root=Path('/Users/madschristophersen/IBE160/G20-christophersen');out=root/'.docs/implementation-artifacts/sluttforing-2026-10-27'
env={'HOME':os.environ['HOME'],'PATH':'/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:/opt/homebrew/bin:/usr/bin:/bin','PLAYWRIGHT_BROWSERS_PATH':'/private/tmp/ibe160-story-3-5-browsers','TMPDIR':'/private/tmp','LANG':'en_US.UTF-8','NO_COLOR':'1'}
checks=[('e2e',['npm','run','test:e2e']),('startup',['npm','test','--','tests/integration/server-mode.test.ts','--maxWorkers=1']),('build-key',['node','tests/helpers/verify-analysis-build.mjs'])]
revision=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root).decode().strip();results=[]
for name,command in checks:
 print('START '+name,flush=True);started=time.monotonic();log=out/('standard-port-'+name+'.txt')
 with log.open('w') as stream:
  result=subprocess.run(['/usr/bin/sandbox-exec','-f',str(root/'.docs/implementation-artifacts/story-5-3-nettprofil.sb'),*command],cwd=root,env=env,stdout=stream,stderr=subprocess.STDOUT)
 record={'check':name,'command':command,'cwd':str(root),'port':3000,'sourceRevision':revision,'sourceUnmodified':True,'exitCode':result.returncode,'seconds':round(time.monotonic()-started,2),'log':log.name};results.append(record);(out/'standard-port-regression.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(record),flush=True)
 if result.returncode:raise SystemExit(result.returncode)
