import subprocess,os,json,time
from pathlib import Path
root=Path('/Users/madschristophersen/IBE160/G20-christophersen'); copy=Path('/tmp/ibe160-sluttforing-copy-path').read_text(); out=root/'.docs/implementation-artifacts/sluttforing-2026-10-27'
runtime='/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin'
env={'HOME':os.environ['HOME'],'PATH':runtime+':/opt/homebrew/bin:/usr/bin:/bin','PLAYWRIGHT_BROWSERS_PATH':'/private/tmp/ibe160-story-3-5-browsers','TMPDIR':'/private/tmp','LANG':'en_US.UTF-8','NO_COLOR':'1'}
checks=[('typecheck',['npm','run','typecheck']),('lint',['npm','run','lint']),('build',['npm','run','build']),('vitest',['npm','test','--','--maxWorkers=1']),('e2e',['node','node_modules/@playwright/test/cli.js','test','--workers=2']),('dev',['node','node_modules/@playwright/test/cli.js','test','--config','playwright.dev.config.ts','--workers=1']),('components',['npm','run','test:components']),('build-key',['node','tests/helpers/verify-analysis-build.mjs']),('build-helper',['node','--test','tests/helpers/verify-analysis-build.test.mjs'])]
results=[]
for name,args in checks:
 started=time.monotonic();print('START '+name,flush=True)
 path=out/('final-'+name+'.txt')
 with path.open('w') as log:
  result=subprocess.run(['/usr/bin/sandbox-exec','-f',str(root/'.docs/implementation-artifacts/story-5-3-nettprofil.sb'),*args],cwd=copy,env=env,stdout=log,stderr=subprocess.STDOUT)
 record={'check':name,'command':args,'cwd':copy,'exitCode':result.returncode,'seconds':round(time.monotonic()-started,2),'log':path.name}
 results.append(record);(out/'final-regression.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(record),flush=True)
 if result.returncode:break
raise SystemExit(any(x['exitCode'] for x in results))
