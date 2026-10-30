/* Offline design prototype only. Production uses src/domain/financing.ts and Big.js.
   No persistence, file processing, API calls or assessment state. */
(() => {
  'use strict';
  const base = Object.freeze({price:3000000, sharedDebt:200000, purchaseCosts:75000,
    cashRequired:3075000, rent:252000, costs:48000, sharedPayment:12000,
    equity:1000000, rate:5.5, years:25, address:'Eksempelveien 14', area:86, rooms:2});
  const money = (n, decimals=0) => n === null || !Number.isFinite(n) ? 'Ukjent' :
    new Intl.NumberFormat('nb-NO',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(n)+' kr';
  const percent = (n, decimals=2) => n === null || !Number.isFinite(n) ? 'Ukjent' :
    new Intl.NumberFormat('nb-NO',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}).format(n)+' %';
  const parse = value => value === null || value === undefined || String(value).trim() === '' ? null : Number(String(value).replace(',','.'));
  const cents = n => Math.round((n + Number.EPSILON)*100)/100;
  function payment(loan, rate, years) {
    const r = rate/1200, months = years*12;
    return cents(loan === 0 ? 0 : r === 0 ? loan/months : loan*r/(1-Math.pow(1+r,-months)));
  }
  function calculate(input={}) {
    const p = {...base,...input};
    const equity=parse(p.equity), rate=parse(p.rate), years=parse(p.years);
    const rent=parse(p.rent), costs=parse(p.costs), sharedPayment=parse(p.sharedPayment);
    const denominator=base.price+base.sharedDebt;
    const grossYield=Number.isFinite(rent)&&rent!==null&&rent>=0 ? rent/denominator*100 : null;
    const noi=grossYield!==null&&costs!==null&&Number.isFinite(costs)&&costs>=0 ? rent-costs : null;
    const netYield=noi===null ? null : noi/denominator*100;
    const error = equity===null||!Number.isFinite(equity)||equity<0||equity>base.cashRequired ? 'Egenkapital må være mellom 0 og 3 075 000 kr.' :
      rate===null||!Number.isFinite(rate)||rate<0||rate>100 ? 'Renten må være mellom 0 og 100 %.' :
      years===null||!Number.isInteger(years)||years<1||years>100 ? 'Nedbetaling må være 1–100 hele år.' : null;
    if(error) return {valid:false,error,grossYield,netYield,noi,loan:null,monthlyPayment:null,annualDebtService:null,cashFlow:null,monthlyCashFlow:null,loanToValue:null,series:[],sensitivity:[]};
    const loan=base.cashRequired-equity;
    const monthlyPayment=payment(loan,rate,years);
    const knownShared=sharedPayment!==null&&Number.isFinite(sharedPayment)&&sharedPayment>=0;
    const annualDebtService=knownShared?cents(monthlyPayment*12+sharedPayment):null;
    const cashFlow=noi!==null&&annualDebtService!==null?cents(noi-annualDebtService):null;
    const series=[{year:0,balance:loan,cumulativeCashFlow:cashFlow===null?null:0,interest:0,principal:0}];
    let balance=loan;
    for(let year=1;year<=years;year++) {
      let interest=0, principal=0;
      for(let month=0;month<12;month++) {
        const monthlyInterest=balance*rate/1200;
        const amortization=Math.min(balance,Math.max(0,monthlyPayment-monthlyInterest));
        interest+=monthlyInterest; principal+=amortization; balance=Math.max(0,balance-amortization);
      }
      // The existing finance rule uses the cent-rounded monthly payment × 12.
      // The curve keeps that annual scenario constant; the last payment can differ by rounding.
      series.push({year,balance:year===years?0:cents(balance),cumulativeCashFlow:cashFlow===null?null:cents(cashFlow*year),interest:cents(interest),principal:cents(principal)});
    }
    const sensitivity=Array.from({length:21},(_,i)=>{
      const r=2+i*.5;
      return {rate:r,cashFlow:noi!==null&&knownShared?cents(noi-cents(payment(loan,r,years)*12+sharedPayment)):null};
    });
    if(rate>=2&&rate<=12&&!sensitivity.some(point=>Math.abs(point.rate-rate)<1e-9)) {
      sensitivity.push({rate,cashFlow}); sensitivity.sort((a,b)=>a.rate-b.rate);
    }
    return {valid:true,error:null,loan,monthlyPayment,annualDebtService,cashFlow,
      monthlyCashFlow:cashFlow===null?null:cashFlow/12,grossYield,netYield,noi,
      loanToValue:loan/denominator*100,series,sensitivity};
  }
  window.PAA=Object.freeze({base,calculate,money,percent});
})();
