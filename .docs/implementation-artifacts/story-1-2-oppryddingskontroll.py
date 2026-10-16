import ast, os, signal, subprocess, tempfile, time, urllib.error
from pathlib import Path
source=Path('.docs/implementation-artifacts/story-1-2-lokal-kontroll.py').read_text()
module=ast.parse(source)
serve_node=next(n for n in module.body if isinstance(n,ast.FunctionDef) and n.name=='serve')
processes=[]
original_popen=subprocess.Popen
def record_process(*args,**kwargs):
 p=original_popen(*args,**kwargs)
 processes.append(p)
 return p
subprocess.Popen=record_process
def refuse(_path): raise ConnectionRefusedError('Kontroll: ingen server lytter')
namespace={'urllib':__import__('urllib'),'subprocess':subprocess,'os':os,'signal':signal,'time':time,'shlex':__import__('shlex'),'env':os.environ.copy(),'clean':Path(tempfile.mkdtemp(prefix='ibe160-story12-cleanup-',dir='/tmp')),'fetch':refuse}
exec(compile(ast.Module(body=[serve_node],type_ignores=[]),'<serve-kontroll>','exec'),namespace)
try:
 namespace['serve'](['python3','-c','import time; time.sleep(30)'])
 raise AssertionError('Oppstartsfristen skulle utløpe')
except RuntimeError as error:
 print('Forventet oppstartsfeil:',error)
assert len(processes)==1
assert processes[0].poll() is not None
print('Faktisk startet kontrollprosess',processes[0].pid,'er stoppet, exit:',processes[0].returncode)
print('Opprydding ved oppstartstimeout: BESTÅTT')
