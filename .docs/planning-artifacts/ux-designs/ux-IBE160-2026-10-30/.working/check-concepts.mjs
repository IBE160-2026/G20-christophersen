// Offline prototype QA only; does not run or alter the application.
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const root=process.cwd(), workspace=resolve(root,'.docs/planning-artifacts/ux-designs/ux-IBE160-2026-10-30');
const {chromium}=await import(pathToFileURL(resolve(root,'node_modules/@playwright/test/index.mjs')).href);
const {financingSuggestion}=await import(pathToFileURL(resolve(root,'src/domain/financing.ts')).href);
const browser=await chromium.launch({headless:true,...(process.env.PAA_UX_CHROMIUM_PATH?{executablePath:process.env.PAA_UX_CHROMIUM_PATH}:{})});
const passed=[],errors=[],requests=[],resources=[];
const fmt=(n,d=0)=>new Intl.NumberFormat('nb-NO',{minimumFractionDigits:d,maximumFractionDigits:d}).format(n);
const norm=s=>s.replace(/\s/g,'').replaceAll('−','-');
const scenarios=[['base','1000000','5.5','25'],['equity','1500000','5.5','25'],['interest','1000000','6.5','25'],['shorter','1000000','5.5','20'],['zero-rate','1000000','0','25'],['no-loan','3075000','5.5','25'],['negative','0','15','25'],['one-year','1000000','5.5','1'],['hundred-years','1000000','5.5','100'],['max-interest','1000000','100','25']];
try{
 for(const concept of ['a','b']){
  const page=await browser.newPage({viewport:{width:1440,height:1100},reducedMotion:'reduce'});
  page.on('pageerror',e=>errors.push(concept+': '+e.message));
  page.on('console',e=>{if(e.type()==='error')resources.push(concept+': '+e.text());});
  page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.route('http://**/*',r=>r.abort());await page.route('https://**/*',r=>r.abort());
  await page.goto(pathToFileURL(resolve(workspace,'mockups/konsept-'+concept+'.html')).href);
  assert.equal(await page.locator('img').first().evaluate(img=>img.complete&&img.naturalWidth===2400),true);
  assert.equal(await page.evaluate(()=>new Set([...document.querySelectorAll('[id]')].map(e=>e.id)).size===document.querySelectorAll('[id]').length),true);
  const cfg=concept==='a'?{gross:'#gross-value',net:'#net-value',cash:'#cash-value',monthly:'#payment-value',annual:'#annual-value',monthlyDecimals:0,annualDecimals:0,open:'data-open',table:'#chart-data',rate:'rates',file:'#filename',error:'#input-error'}:{gross:'#gross',net:'#net',cash:'#cash',monthly:'#monthly',annual:'#annual',monthlyDecimals:2,annualDecimals:2,open:'data-dialog',table:'#data-rows',rate:'rate',file:'#file-status',error:'#finance-error'};
  const gross=norm(await page.locator(cfg.gross).innerText()),net=norm(await page.locator(cfg.net).innerText());
  for(const [label,equity,rate,years] of scenarios){
   for(const [id,v] of Object.entries({equity,rate,years}))await page.locator('#'+id).fill(v);
   const expected=financingSuggestion({cashRequired:'3075000',equity,annualInterest:rate,months:String(Number(years)*12),sharedAnnualPayment:'12000'});
   const actual=await page.evaluate(()=>window.PAA.calculate(Object.fromEntries(['equity','rate','years'].map(id=>[id,document.getElementById(id).value]))));
   assert.equal(actual.monthlyPayment,Number(expected.monthly),concept+label+' monthly');
   assert.equal(actual.annualDebtService,Number(expected.J),concept+label+' annual');
   assert.ok(Math.abs(actual.cashFlow-(204000-Number(expected.J)))<.001);
   assert.equal(norm(await page.locator(cfg.monthly).innerText()),norm(fmt(Number(expected.monthly),cfg.monthlyDecimals)+'kr'));
   assert.equal(norm(await page.locator(cfg.annual).innerText()),norm(fmt(Number(expected.J),cfg.annualDecimals)+'kr'));
   assert.match(norm(await page.locator(cfg.cash).innerText()),new RegExp('^'+norm(fmt(actual.cashFlow))+'kr'));
   assert.equal(norm(await page.locator(cfg.gross).innerText()),gross);assert.equal(norm(await page.locator(cfg.net).innerText()),net);
   assert.match(await page.locator(concept==='a'?'.verdict':'.assessment').innerText(),/Innhent mer informasjon/);
   assert.equal(await page.locator('#chart').evaluate(e=>/NaN|Infinity/.test(e.innerHTML)),false);
   assert.equal(actual.series[0].balance,Number(expected.loan));assert.equal(actual.series.at(-1).balance,0);
   assert.equal(actual.series[0].cumulativeCashFlow,0);assert.ok(Math.abs(actual.series.at(-1).cumulativeCashFlow-actual.cashFlow*Number(years))<.001);
   passed.push(concept+':'+label);
  }
  for(const [id,value] of [['equity',''],['equity','-1'],['equity','3075001'],['rate','101'],['years','0'],['years','25.5']]){
   await page.locator('#reset').click();await page.locator('#'+id).fill(value);
   assert.equal(await page.locator('#'+id).getAttribute('aria-invalid'),'true');
   assert.equal((await page.locator(cfg.error).innerText()).length>0,true);
   assert.equal(norm(await page.locator(cfg.net).innerText()),net);
   assert.equal(await page.locator('#chart path').count(),0);
   passed.push(concept+':invalid-'+id+'-'+value);
  }
  await page.locator('#reset').click();await page.locator('#equity-range').fill('1500000');assert.equal(await page.locator('#equity').inputValue(),'1500000');passed.push(concept+':range-sync');await page.locator('#reset').click();
  for(const chart of ['cash','debt',cfg.rate]){
   await page.locator('[data-chart='+chart+']').click();
   if(concept==='b')await page.locator('[data-dialog=chart-data-dialog]').click();
   const rows=page.locator(cfg.table+' tr');
   assert.equal(await rows.count(),chart===cfg.rate?21:26);
   if(chart==='cash')assert.match(norm(await rows.last().textContent()),/977304/);
   if(chart==='debt')assert.match(norm(await rows.first().textContent()),/2075000/);
   if(chart===cfg.rate){assert.match(norm(await rows.first().textContent()),/86460/);assert.match(norm(await rows.last().textContent()),/-70253|-70252,80/);}
   if(concept==='b')await page.keyboard.press('Escape');
   passed.push(concept+':chart-'+chart);
  }
  await page.locator('#rate').fill('5.7');
  if(concept==='b')await page.locator('[data-dialog=chart-data-dialog]').click();
  assert.equal(await page.locator(cfg.table+' tr').count(),22);
  if(concept==='b')await page.keyboard.press('Escape');
  await page.locator('#rate').fill('15');assert.match(await page.locator(concept==='a'?'#chart-description':'#economy-signal').innerText(),/utenfor/);passed.push(concept+':current-rate-and-outside');
  await page.locator('#reset').click();await page.locator('[data-chart=cash]').click();
  if(concept==='a'){
   await page.locator('#missing-rent').click();assert.equal(await page.locator('#cash-value').innerText(),'—');assert.equal(await page.locator('#net-value').innerText(),'—');assert.notEqual(await page.locator('#payment-value').innerText(),'—');assert.match(await page.locator('#chart').textContent(),/mangler/);await page.locator('[data-chart=debt]').click();assert.ok(await page.locator('#chart path').count()>0);await page.locator('#reset').click();await page.locator('[data-chart=cash]').click();passed.push('a:missing-rent-independent-debt');
   await page.locator('#chart circle').first().focus();assert.equal(await page.locator('#chart-tooltip').isVisible(),true);passed.push('a:keyboard-chart-tooltip');
  }else{await page.locator('#chart-point').focus();await page.keyboard.press('ArrowLeft');assert.match(await page.locator('#chart-readout').innerText(),/År 24/);passed.push('b:keyboard-chart-inspection');}
  const opener=page.locator('['+cfg.open+'=sources-dialog]:visible').first();await opener.click();assert.equal(await page.locator('#sources-dialog').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#sources-dialog').isVisible(),false);assert.equal(await opener.evaluate(e=>e===document.activeElement),true);passed.push(concept+':dialog-focus-escape-return');
  const upload=page.locator('['+cfg.open+'=upload-dialog]:visible').first();await upload.click();await page.locator('#pdf-file').setInputFiles({name:'fiktiv-design.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-no-analysis')});assert.match(await page.locator(cfg.file).innerText(),/fiktiv-design.pdf/);await page.locator('#finn-url').fill('https://www.finn.no/realestate/homes/ad.html?finnkode=123456789');assert.equal(await page.locator('#upload-dialog button:disabled').count(),1);await page.keyboard.press('Escape');passed.push(concept+':filename-only-finn-blocked');
  for(const width of [320,390,768,1024,1440]){
   await page.setViewportSize({width,height:900});await page.evaluate(()=>scrollTo(0,0));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,concept+' page overflow '+width);
   for(const dialog of ['upload-dialog','risk-dialog','sources-dialog',concept==='a'?'basis-dialog':'formulas-dialog']){
    await page.evaluate(({attr,id})=>document.querySelector('['+attr+'='+id+']').click(),{attr:cfg.open,id:dialog});
    assert.equal(await page.locator('#'+dialog).evaluate(e=>e.scrollWidth>e.clientWidth+1),false,concept+' dialog overflow '+width+' '+dialog);
    await page.keyboard.press('Escape');
   }
   passed.push(concept+':responsive-'+width);
  }
  await page.setViewportSize({width:1440,height:1100});await page.reload();await page.screenshot({path:'/private/tmp/paa-r3-'+concept+'-desktop.png',fullPage:true});
  await page.screenshot({path:resolve(workspace,'mockups/assets/preview-'+concept+'.jpg'),type:'jpeg',quality:82,fullPage:false});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'/private/tmp/paa-r3-'+concept+'-mobile.png',fullPage:true});
  await page.close();
 }
 assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);assert.deepEqual(resources,[]);
 const result={scope:'Two offline design prototypes, revision 3; not product acceptance',checks:passed.length,passed,pageErrors:errors,networkRequests:requests,resourceErrors:resources};
 writeFileSync(resolve(workspace,'.working/concept-check-result.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
}finally{await browser.close();}
