from pathlib import Path
import subprocess,os,json,time,hashlib
root=Path('/Users/madschristophersen/IBE160/G20-christophersen');out=root/'.docs/implementation-artifacts/pre-submission-2026-10-27'
base=subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()
nodePath='/private/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin'
env={'HOME':'/Users/madschristophersen','PATH':nodePath+':/opt/homebrew/bin:/usr/bin:/bin','PLAYWRIGHT_BROWSERS_PATH':'/private/tmp/ibe160-story-3-5-browsers','TMPDIR':'/private/tmp','LANG':'en_US.UTF-8','NO_COLOR':'1'}
def manifest():
 names=set(subprocess.check_output(['git','ls-files','-co','--exclude-standard','-z'],cwd=root,text=True).split('\0'))
 return [{'path':n,'sha256':hashlib.sha256((root/n).read_bytes()).hexdigest()} for n in sorted(names) if n and (n.startswith(('src/','tests/')) or n in ['package.json','package-lock.json','vite.config.ts','vitest.config.ts','playwright.config.ts','playwright.dev.config.ts','playwright.components.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json']) and (root/n).is_file()]
source=manifest()
(out/'regression-source-manifest.json').write_text(json.dumps({'baselineCommit':base,'workingTreeChanges':True,'node':'24.21.0','npm':'11.19.0','lockSha256':hashlib.sha256((root/'package-lock.json').read_bytes()).hexdigest(),'files':source},indent=2)+'\n')
checks=[('build',['npm','run','build'],False),('targeted-e2e',['node','node_modules/@playwright/test/cli.js','test','report-analysis.spec.ts','--grep','analysefeil/delresultat|pre-submission','--workers=1'],True),('vitest',['npm','test','--','--maxWorkers=1'],False),('e2e',['node','node_modules/@playwright/test/cli.js','test','--workers=2'],True),('dev',['node','node_modules/@playwright/test/cli.js','test','--config','playwright.dev.config.ts','--workers=1'],True),('components',['npm','run','test:components'],False),('build-key',['node','tests/helpers/verify-analysis-build.mjs'],True),('build-helper',['node','--test','tests/helpers/verify-analysis-build.test.mjs'],True),('lint',['npm','run','lint'],False)]
results=[]
for name,cmd,sentinel in checks:
 print('START '+name,flush=True);started=time.monotonic();runEnv=dict(env)
 if sentinel:runEnv.update({'ANALYSIS_MODE':'live','OPENAI_API_KEY':'fictional-pre-submission-inherited-only'})
 with (out/(name+'.txt')).open('x') as stream:
  result=subprocess.run(['/usr/bin/sandbox-exec','-f',str(root/'.docs/implementation-artifacts/story-5-3-nettprofil.sb'),*cmd],cwd=root,env=runEnv,stdout=stream,stderr=subprocess.STDOUT)
 entry={'check':name,'command':cmd,'cwd':str(root),'baselineCommit':base,'sourceManifest':'regression-source-manifest.json','portMappingApplied':False,'externalNetwork':'OS-denied; loopback allowed','fictionalInheritedLiveSentinel':sentinel,'exitCode':result.returncode,'seconds':round(time.monotonic()-started,2),'log':name+'.txt'}
 results.append(entry);(out/'regression.json').write_text(json.dumps(results,indent=2)+'\n');print(json.dumps(entry),flush=True)
 if result.returncode:raise SystemExit(result.returncode)
assert source==manifest(),'Source changed during regression'
(out/'regression-source-stability.json').write_text(json.dumps({'sourceUnchangedDuringChecks':True,'filesChecked':len(source),'baselineCommit':base,'lockUnchangedFromBaseline':subprocess.check_output(['git','show',base+':package-lock.json'],cwd=root)==(root/'package-lock.json').read_bytes()},indent=2)+'\n')
