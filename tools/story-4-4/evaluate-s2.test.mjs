// Explicit offline method checks, not a claim about paid model quality.
import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluateS2 } from './evaluate-s2.ts'
const expected = [...Array.from({length:10},(_,i)=>({expectedId:`TG2-${i}`,grade:'TG2'})),...Array.from({length:2},(_,i)=>({expectedId:`TG3-${i}`,grade:'TG3'}))]
const rows = () => expected.map(row=>({...row,originalCorrectDescriptionAndGrade:row.expectedId!=='TG2-9',originalCorrectPhysicalPage:true}))
test('RT-16/18: complete 9/10 TG2 and 2/2 TG3 passes with missed TG2 recorded',()=>{
  const result=evaluateS2(expected,rows(),0)
  assert.equal(result.passed,true); assert.deepEqual(result.tg2.missedOrWrong,['TG2-9'])
})
test('RT-16: missing TG3 finding, invented finding, wrong physical page below threshold, or 8/10 fails',()=>{
  for(const variant of ['missingTG3','invented','wrongPage','8of10']) {
    const assessed=rows()
    if(variant==='missingTG3') assessed[10].originalCorrectDescriptionAndGrade=false
    if(variant==='wrongPage') assessed[0].originalCorrectPhysicalPage=false
    if(variant==='8of10') assessed[0].originalCorrectDescriptionAndGrade=false
    assert.equal(evaluateS2(expected,assessed,variant==='invented'?1:0).passed,false,variant)
  }
})
test('RT-17/18: reject omitted TG3 row or omitted missed TG2 row rather than shrinking denominator',()=>{
  for (const omitted of ['TG3-1','TG2-9']) assert.throws(()=>evaluateS2(expected,rows().filter(row=>row.expectedId!==omitted),0),/coverage/)
})
test('Reject extra, mismatched, duplicate assessment and duplicate expected rows',()=>{
  const extra=[...rows(),{...rows()[0],expectedId:'extra'}]
  const mismatch=rows(); mismatch[0].grade='TG3'
  const wrongId=rows(); wrongId[0].expectedId='unknown'
  const duplicate=rows(); duplicate[0]={...duplicate[1]}
  for(const assessed of [extra,mismatch,wrongId,duplicate]) assert.throws(()=>evaluateS2(expected,assessed,0),/coverage/)
  assert.throws(()=>evaluateS2([...expected,expected[0]],rows(),0),/coverage/)
})
test('Evaluation preserves expected and original assessment inputs; no corrections argument exists',()=>{
  const assessed=rows(); assessed[11].originalCorrectPhysicalPage=false
  const original=structuredClone({expected,assessed})
  assert.equal(evaluateS2(expected,assessed,0).passed,false)
  assert.deepEqual({expected,assessed},original)
})
