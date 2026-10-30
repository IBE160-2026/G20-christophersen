import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFileSync} from 'node:fs';
const root=process.cwd();
const {chromium}=await import(pathToFileURL(resolve(root,'node_modules/@playwright/test/index.mjs')).href);
const {financingSuggestion}=await import(pathToFileURL(resolve(root,'src/domain/financing.ts')).href);
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,...(process.env.PAA_UX_CHROMIUM_PATH?{executablePath:process.env.PAA_UX_CHROMIUM_PATH}:{})});
const checks=[], errors=[], requests=[];
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
 await page.route('http://**/*',r=>r.abort()); await page.route('https://**/*',r=>r.abort());
 await page.goto(pathToFileURL(resolve(root,'.docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-30/mockups/designforslag.html')).href);
 const fmt=(n,d)=>new Intl.NumberFormat('nb-NO',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
 const initialYield=await page.locator('#net-yield').textContent();
 for(const [name,equity,interest,years] of [['base','1000000','5.5','25'],['more-equity','1500000','5.5','25'],['higher-rate','1000000','6.5','25'],['shorter','1000000','5.5','20'],['zero-rate','1000000','0','25'],['all-equity','3075000','5.5','25'],['negative','0','15','25']]){
  for(const [id,value] of Object.entries({equity,interest,years}))await page.locator('#'+id).fill(value);
  const f=financingSuggestion({cashRequired:'3075000',equity,annualInterest:interest,months:String(Number(years)*12),sharedAnnualPayment:'12000'});
  assert.equal(await page.locator('#monthly-payment').textContent(),fmt(Number(f.monthly),2)+' kr');
  assert.equal(await page.locator('#annual-payment').textContent(),fmt(Number(f.J),2)+' kr');
  assert.equal(await page.locator('#cash-flow').textContent(),fmt(204000-Number(f.J),0)+' kr/år');
  assert.equal(await page.locator('#net-yield').textContent(),initialYield);
  assert.equal(await page.locator('#assessment-label').textContent(),'Innhent mer informasjon');
  checks.push(name);
 }
 await page.locator('#reset').click();
 await page.locator('#equity-range').fill('1500000');assert.equal(await page.locator('#equity').inputValue(),'1500000');checks.push('range-sync');
 for(const [id,value] of [['equity',''],['equity','3075001'],['interest','-1'],['interest','101'],['years','0'],['years','25.5']]){
  await page.locator('#reset').click();await page.locator('#'+id).fill(value);
  assert.equal(await page.locator('#'+id).getAttribute('aria-invalid'),'true');
  assert.equal(await page.locator('#cash-flow').textContent(),'Ugyldig input');
  assert.equal(await page.locator('#use-scenario').isDisabled(),true);
  checks.push('invalid-'+id+'-'+value);
 }
 await page.locator('#reset').click();
 for(const [state,cash,yieldText] of [['missing-rent','Leie mangler','Leie mangler'],['missing-debt','Gjeldsbetaling ukjent',initialYield]]){
  await page.locator('#example-state').selectOption(state);
  assert.equal(await page.locator('#cash-flow').textContent(),cash);
  assert.equal(await page.locator('#net-yield').textContent(),yieldText);
  assert.notEqual(await page.locator('#loan').textContent(),'Kan ikke beregnes');checks.push(state);
 }
 await page.locator('#example-state').selectOption('missing-property');
 assert.equal(await page.locator('#property-address').textContent(),'Adresse ikke funnet');
 assert.equal(await page.locator('#property-picture').isVisible(),false);checks.push('missing-property');
 await page.locator('#example-state').selectOption('base');
 await page.locator('#use-scenario').click();assert.match(await page.locator('#scenario-message').textContent(),/endrer ingen bekreftelser/);checks.push('apply-is-prototype-only');
 await page.locator('[data-source=pris]').first().click();assert.equal(await page.locator('#source-dialog').isVisible(),true);
 assert.equal(await page.evaluate(()=>document.activeElement.id),'source-title');
 await page.keyboard.press('Escape');assert.equal(await page.locator('#source-dialog').isVisible(),false);
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.source),'pris');checks.push('source-focus-escape-return');
 await page.screenshot({path:'/private/tmp/paa-r2-investering.png',fullPage:true});
 for(const view of ['risk','sources','start']){
  await page.locator('[data-view='+view+']').first().click();
  assert.equal(await page.locator('#view-'+view).isVisible(),true);
  await page.screenshot({path:'/private/tmp/paa-r2-'+view+'.png',fullPage:true});
 }
 await page.locator('#pdf-file').setInputFiles({name:'kun-prototype.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-fiktiv-test')});
 assert.match(await page.locator('#file-note').textContent(),/kun-prototype.pdf/);checks.push('file-name-only');
 await page.locator('[data-view=investment]:visible').first().click();
 for(const width of [320,390,768,1024,1440]){
  await page.setViewportSize({width,height:900});
  for(const view of ['investment','risk','sources','start']){
   await page.evaluate(name=>document.querySelector('[data-view='+name+']').click(),view);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Overflow '+width+' '+view);
   if(width===390&&['investment','start'].includes(view))await page.screenshot({path:'/private/tmp/paa-r2-mobile-'+view+'.png',fullPage:true});
  }
  checks.push('all-views-width-'+width);
 }
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 const result={scope:'Offline HTML-prototype revision 2 only; not production acceptance',checks:checks.length,passed:checks,pageErrors:errors,networkRequests:requests};
 writeFileSync(resolve(root,'.docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-30/.working/prototype-check-result.json'),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
