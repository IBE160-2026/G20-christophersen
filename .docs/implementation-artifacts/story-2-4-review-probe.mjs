import assert from 'node:assert/strict';
import { readFile, writeFile, unlink, cp, mkdtemp, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import net from 'node:net';
// Kjør med Node 24.21.0 under dokumentert OS-nettverkssperre og env -i.
// Alle lagringsmutasjoner skjer i en midlertidig kildekopi; repoet røres ikke.
const repo = fileURLToPath(new URL('../../', import.meta.url));
const scratch = await mkdtemp(join(tmpdir(), 'ibe160-story-2-4-review-'));
try {
await cp(join(repo, 'src'), join(scratch, 'src'), { recursive: true });
await writeFile(join(scratch, 'package.json'), '{"type":"module"}');
await symlink(join(repo, 'node_modules'), join(scratch, 'node_modules'), 'dir');
const local = path => pathToFileURL(join(scratch, path));
const { validatePdf } = await import(local('src/backend/documents/validate-pdf.ts'));
const { extractPdf } = await import(local('src/backend/documents/extract-pdf.ts'));
const { analyzeDocument } = await import(local('src/backend/analysis/analyze-document.ts'));
const { AnalysisOutcomeSchema } = await import(local('src/contracts/document-analysis.ts'));
assert(!Object.keys(process.env).some(key => /KEY|TOKEN|SECRET/.test(key)));
await new Promise((resolve,reject)=>{ const socket=net.connect({host:'127.0.0.1',port:43210}); socket.once('connect',()=>{socket.destroy();reject(Error('Network unexpectedly available'))}); socket.once('error',error=>{try {assert.equal(error.code,'EPERM');console.log('OS network probe: EPERM');resolve()}catch(e){reject(e)}}) });
async function basis(bytes,name) {
 const validated=await validatePdf(bytes,name);assert.equal(validated.status,'format-validated');
 const extracted=await extractPdf(validated,{requestId:'independent-review',mode:'demo'});assert.equal(extracted.error,null);
 assert.equal(extracted.document.reportHash,createHash('sha256').update(bytes).digest('hex'));return extracted.document;
}
const documents=[];
for(const id of [1,2,3,4]) {
 const name=`F${id}-tilstandsrapport.pdf`;const bytes=await readFile(repo+'tests/fixtures/property-cases/'+name);
 const document=await basis(bytes,name);documents.push(document);
 const result=await analyzeDocument(document);assert.equal(result.status,'completed');assert(AnalysisOutcomeSchema.safeParse(result).success);
 assert.deepEqual(result.findings.map(f=>[f.grade,f.source.pdfPage]),id===4?[['TG2',2],['TG3',4]]:[['TG2',2]]);
 assert.deepEqual(await analyzeDocument(document),result);console.log(`F${id}: exact hash, physical pages, deterministic, keyless offline PASS`);
}
const first=documents[0];
async function fails(document,code) {const result=await analyzeDocument(document);assert.equal(result.status,'failed');assert.equal(result.error.code,code);assert.equal(result.partialResult,null);assert(AnalysisOutcomeSchema.safeParse(result).success);return result;}
const file=local(`src/backend/analysis/data/${first.reportHash}.json`);const original=await readFile(file,'utf8');const stored=JSON.parse(original);
const other=await readFile(local(`src/backend/analysis/data/${documents[3].reportHash}.json`),'utf8');
try {
 await writeFile(file,other);await fails(first,'metadata-mismatch');console.log('default FS loader: wrong-bound actual fixture PASS');
 await unlink(file);await fails(first,'adapter-failure');console.log('default FS loader: missing actual fixture PASS');
 await writeFile(file,'{ malformed');await fails(first,'invalid-response');console.log('default FS loader: invalid JSON PASS');
 for(const location of ['envelope','outcome']) for(const version of ['contractVersion','extractionVersion']) {
  const value=structuredClone(stored);(location==='envelope'?value:value.outcome)[version]='999';await writeFile(file,JSON.stringify(value));await fails(first,'incompatible-version');console.log(`${location} ${version} mismatch PASS`);
 }
} finally {await writeFile(file,original)}
const originalBytes=await readFile(repo+'tests/fixtures/property-cases/F1-tilstandsrapport.pdf');
const altered=Buffer.concat([originalBytes,Buffer.from('\n% independent review byte mutation\n')]);
const changed=await basis(altered,first.documentName);assert.notEqual(changed.reportHash,first.reportHash);await fails(changed,'adapter-failure');console.log('new PDF byte mutation under known filename PASS');
const unknown=await basis(await readFile(repo+'tests/fixtures/property-cases/text-30-pages.pdf'),first.documentName);await fails(unknown,'adapter-failure');console.log('unknown document under known filename PASS');
console.log('Independent review probes: ALL PASS');
} finally { await rm(scratch, { recursive: true, force: true }); }
