from pathlib import Path
import os, sys, subprocess, tempfile, shutil, signal, time, urllib.request, urllib.error, shlex, json, hashlib, socket
root=Path(__file__).resolve().parents[2]
clean=Path(tempfile.mkdtemp(prefix='ibe160-story-1-2-(2026)-',dir='/tmp'))
env=os.environ.copy()
env['PATH']='/tmp/ibe160-story-1-1-runtime/node-v24.21.0-darwin-arm64/bin:'+env['PATH']
env['npm_config_cache']='/tmp/ibe160-story-1-2-clean-cache'
env['npm_config_update_notifier']='false'
env['PLAYWRIGHT_BROWSERS_PATH']='/tmp/ibe160-story-1-2-browsers'
env['VITE_IBE160_TEST_SECRET']='FICTIONAL-STORY12-BOUNDARY-PROBE'
profile='(version 1) (allow default) (deny network-outbound) (allow network-outbound (remote ip "localhost:*"))'
for name in ['package.json','package-lock.json','.npmrc','.nvmrc','.oxlintrc.json','index.html','vite.config.ts','tsconfig.json','tsconfig.app.json','tsconfig.node.json','tsconfig.e2e.json','playwright.config.ts','playwright.dev.config.ts','src','tests']:
 source=root/name
 if source.is_dir(): shutil.copytree(source,clean/name)
 else: shutil.copy2(source,clean/name)
print('Ren prosjektmappe:',clean,flush=True)
print('Dedikert installasjonscache (gjenbrukes ved nytt forsøk):',env['npm_config_cache'],flush=True)
print('Node-PATH:',env['PATH'].split(':')[0],flush=True)
print('Sandboxprofil for build/demo:',profile,flush=True)

def run(args,expected=0,input=None):
 print('$ '+shlex.join(args),flush=True)
 result=subprocess.run(args,cwd=clean,env=env,text=True,input=input,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
 print(result.stdout+'Exit: '+str(result.returncode),flush=True)
 assert result.returncode==expected,(args,result.returncode)
 return result.stdout

def fetch(path,script=False):
 try:
  with urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:3000'+path, headers={'Sec-Fetch-Dest': 'script'} if script else {}),timeout=2) as r: return r.status,r.read().decode()
 except urllib.error.HTTPError as e: return e.code,e.read().decode()

def serve(args):
 with socket.socket() as probe:
  probe.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)
  try: probe.bind(('127.0.0.1',3000))
  except OSError as error: raise RuntimeError('Port 3000 må være ledig før lokal kontroll starter') from error
 print('$ '+shlex.join(args),flush=True)
 p=subprocess.Popen(args,cwd=clean,env=env,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,start_new_session=True)
 try:
  for _ in range(80):
   if p.poll() is not None: raise RuntimeError('Serverprosessen avsluttet under oppstart')
   try:
    status,body=fetch('/')
    if status==200: return p,body
   except (OSError,urllib.error.URLError): pass
   time.sleep(.1)
  raise RuntimeError('Lokal server startet ikke')
 except BaseException:
  try: os.killpg(p.pid,signal.SIGTERM)
  except ProcessLookupError: pass
  output,_=p.communicate(timeout=10)
  print('Ryddet prosessgruppe etter oppstartsfeil:\n'+output,flush=True)
  raise

def stop(p):
 os.killpg(p.pid,signal.SIGTERM)
 out,_=p.communicate(timeout=10)
 print('Serverutskrift:\n'+out,flush=True)
 # npm kan returnere -15 etter at prosessgruppen termineres av kontrollen.
 print('Prosessgruppe stoppet. Forelder-exit:',p.returncode,flush=True)

run(['node','--version'])
run(['npm','--version'])
run(['npm','ci'])
run(['npm','ls','--depth=0'])
run(['npm','run','typecheck'])
run(['npm','run','lint'])
run(['npm','run','demo'],expected=1)
probe="import net from 'node:net'; const socket=net.connect({host:'1.1.1.1',port:443}); socket.on('connect',()=>{console.log('Uventet ekstern tilgang');process.exit(1)}); socket.on('error',e=>{console.log('Eksternt TCP-forsøk:',e.code);process.exit(e.code==='EPERM'?0:1)}); setTimeout(()=>process.exit(2),3000);"
run(['sandbox-exec','-p',profile,'node','--input-type=module','-e',probe])
run(['sandbox-exec','-p',profile,'npm','run','build'])
assert not any(b'FICTIONAL-STORY12-BOUNDARY-PROBE' in p.read_bytes() for p in (clean/'dist').rglob('*') if p.is_file())
print('Fiktiv miljømarkør finnes ikke i byggeutdata.',flush=True)
(clean/'private').mkdir()
(clean/'private/report.pdf').write_text('FICTIONAL-PRIVATE-DOCUMENT-STORY12')
p,html=serve(['sandbox-exec','-p',profile,'npm','run','demo'])
try:
 run(['lsof','-nP','-iTCP:3000','-sTCP:LISTEN'])
 for path in ['/private/report.pdf','/../private/report.pdf','/%2e%2e/private/report.pdf','/package.json','/.git/HEAD','/.env','/src/backend/server.ts','/api/analysis','/assets/missing.js']:
  status,body=fetch(path)
  print('HTTP',path,status,repr(body),flush=True)
  assert status==404
  assert 'FICTIONAL-PRIVATE-DOCUMENT-STORY12' not in body
 run(['npm','run','demo'],expected=1)
finally: stop(p)
p,html=serve(['npm','run','dev'])
try:
 for path in ['/src/frontend/main.tsx','/src/frontend/styles.css','/@vite/client']:
  status,_=fetch(path,script=True)
  print('DEV HTTP',path,status,flush=True)
  assert status==200
 status,env_module=fetch('/node_modules/vite/dist/client/env.mjs')
 print('DEV miljøressurs:',status,'fiktiv markør eksponert:', 'FICTIONAL-STORY12-BOUNDARY-PROBE' in env_module,flush=True)
 assert status==200 and 'FICTIONAL-STORY12-BOUNDARY-PROBE' not in env_module
 status,private_body=fetch('/private/report.pdf')
 print('DEV privat kontrollfil:',status,flush=True)
 assert status in (403,404) and 'FICTIONAL-PRIVATE-DOCUMENT-STORY12' not in private_body
 script="""import { chromium } from './node_modules/playwright/index.mjs';
import { readFile, writeFile } from 'node:fs/promises';
const browser=await chromium.launch();
try {
 const page=await browser.newPage();
 page.setDefaultTimeout(10000);
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const connected=new Promise(resolve=>page.on('websocket',ws=>ws.on('framereceived',({payload})=>{
  if(JSON.parse(String(payload)).type==='connected') resolve(ws.url());
 })));
 await page.goto('http://127.0.0.1:3000');
 await page.getByRole('heading',{name:'Ingen tall registrert'}).waitFor();
 let connectionDeadline;
 const ws=await Promise.race([connected,new Promise((_,reject)=>{
  connectionDeadline=setTimeout(()=>reject(Error('HMR koblet ikke til')),10000);
 })]).finally(()=>clearTimeout(connectionDeadline));
 if(new URL(ws).origin!=='ws://127.0.0.1:3000') throw Error('HMR har feil origin');
 const source='src/frontend/App.tsx';
 const original=await readFile(source,'utf8');
 try {
  await writeFile(source,original.replace('Ingen tall registrert','Kontrollert HMR-oppdatering'));
  await page.getByRole('heading',{name:'Kontrollert HMR-oppdatering'}).waitFor();
 } finally { await writeFile(source,original); }
 await page.getByRole('heading',{name:'Ingen tall registrert'}).waitFor();
 if(errors.length) throw Error('Dev-nettleserfeil: '+JSON.stringify(errors));
 console.log('Dev-nettleser: synlig skall, feilfri HMR-tilkobling og synlig oppdatering/retur på',ws.split('?')[0]);
} finally { await browser.close(); }
"""
 run(['node','--input-type=module','-'],input=script)
finally: stop(p)
for filename in ['package.json','package-lock.json']:
 digest=hashlib.sha256((root/filename).read_bytes()).hexdigest()
 assert digest==hashlib.sha256((clean/filename).read_bytes()).hexdigest()
 print(filename,'SHA-256 identisk:',digest,flush=True)
print('Ren installasjon, manglende build, offline build/demo, HTTP-grense, opptatt port og dev/HMR: BESTÅTT.',flush=True)
