"""Ren, lokal S6-eksport. Ingen installasjon eller ekstern test utføres."""
from pathlib import Path, PurePosixPath
import subprocess, tempfile, tarfile, hashlib, json, sys
root=Path.cwd()
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
revision=git('rev-parse','--verify',(sys.argv[1] if len(sys.argv)>1 else 'HEAD')+'^{commit}').decode().strip()
# Ikke gi testpersonen eldre produkt/oppskrift enn arbeidskopien som nettopp er kontrollert.
subprocess.run(['git','diff','--exit-code',revision,'--'],cwd=root,check=True,stdout=subprocess.DEVNULL)
# Alle ikke-ignorerte arbeidsfiler er leveransekandidater og må være committet først.
assert not git('ls-files','--others','--exclude-standard','-z'), 'Usporede leveransefiler må committes før eksport'
entries={}
for entry in git('ls-tree','-rz',revision).split(b'\0'):
 if not entry:continue
 header,name=entry.split(b'\t',1);mode,kind,oid=header.decode().split();name=name.decode()
 assert kind=='blob' and mode in {'100644','100755'},'Ikke-støttet filtype i eksport'
 parts=PurePosixPath(name).parts
 assert not any(p in {'node_modules','dist','build','private','test-results','playwright-report','.git'} for p in parts)
 assert not (parts[-1].startswith('.env') and not parts[-1].endswith('.example'))
 entries[name]={'blob':oid,'mode':mode}
directory=Path(tempfile.mkdtemp(prefix='ibe160-s6-',dir='/private/tmp'))
archive=directory/f'ibe160-semester-v1-{revision[:12]}.tar.gz'
prefix='ibe160-semester-v1/'
with archive.open('xb') as stream:
 subprocess.run(['git','archive','--format=tar.gz','--prefix='+prefix,revision],cwd=root,stdout=stream,check=True)
# Les alle arkivfiler og sammenlign byte for byte med Git-objektene. Ingen utpakking/kjøring.
oids=list(dict.fromkeys(v['blob'] for v in entries.values()))
raw=subprocess.check_output(['git','cat-file','--batch'],cwd=root,input=('\n'.join(oids)+'\n').encode())
blobHashes={};position=0
for oid in oids:
 end=raw.index(b'\n',position);size=int(raw[position:end].split()[-1]);data=raw[end+1:end+1+size]
 blobHashes[oid]=hashlib.sha256(data).hexdigest();position=end+size+2
seen=set()
with tarfile.open(archive,'r:gz') as tar:
 assert tar.pax_headers.get('comment')==revision,'Arkivets Git-revisjon stemmer ikke'
 for member in tar.getmembers():
  if member.isdir():
   assert member.name==prefix.rstrip('/') or member.name.startswith(prefix)
   continue
  assert member.name.startswith(prefix)
  assert member.isfile(),'Bare vanlige filer tillates'
  name=member.name[len(prefix):];assert name in entries and name not in seen
  data=tar.extractfile(member).read()
  assert hashlib.sha256(data).hexdigest()==blobHashes[entries[name]['blob']],name
  assert bool(member.mode & 0o111)==(entries[name]['mode']=='100755'),name
  seen.add(name)
assert seen==set(entries),'Arkiv-/Git-inventar avviker'
record={'purpose':'Intern klargjøring; ikke ekstern S6','sourceCommit':revision,'gitTree':git('rev-parse',revision+'^{tree}').decode().strip(),'archive':str(archive),'archiveSha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'archiveBytes':archive.stat().st_size,'archivePrefix':prefix,'trackedFilesByteVerified':len(seen),'containsGitHistory':False,'containsNodeModulesDistPrivateOrRealEnv':False,'externalS6Executed':False,'installExecuted':False,'versionNote':'Arkivet inneholder nøyaktig kildecommiten, ikke senere dokumentasjonscommits eller denne kvitteringen. Personen registrerer sourceCommit og archiveSha256.'}
(directory/'S6-version.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
(directory/'SHA256SUMS').write_text(record['archiveSha256']+'  '+archive.name+'\n')
print(json.dumps(record,ensure_ascii=False,indent=2))
