#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {environment}=require('./interaction.cjs');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const code=html.split('// SYNC_MODEL_BEGIN')[1].split('// SYNC_MODEL_END')[0];
const SyncTest=vm.runInNewContext('//'+code+'\nSyncTest');
let checks=0;
function ok(value,label){assert.ok(value,label);checks++;console.log('PASS '+label);}
async function touch(e,hold=35){e.pointer('pointerdown');await e.advance(hold);e.pointer('pointerup');}
async function cadence(interval,count=5){const e=environment();e.el.connect.fire('click');await e.advance(400);const energies=[],scores=[],vibrations=[];
 for(let i=0;i<count;i++){await touch(e);energies.push(Number(e.el.energyValue.textContent));scores.push(Number(e.el.syncValue.textContent));vibrations.push(e.vibrations.length);if(i<count-1)await e.advance(interval-35);}
 return {e,energies,scores,vibrations};}
async function captureFallback(){
 const core={clientX:195,clientY:365.4},outside={clientX:400,clientY:365.4};
 const outsideEvent=(e,type,id,coords=outside)=>e.win.fire(type,{pointerId:id,isPrimary:id===1,button:0,...coords});
 for(const rules of ['R1','R2','R3','R4']){
  const e=environment({search:'?qa=input&rules='+rules,audioAvailable:false});e.el.connect.fire('click');await e.advance(100);
  e.el.stage.setPointerCapture=()=>{throw new Error('Pointer capture unavailable');};
  e.pointer('pointerdown',core);await e.advance(1100);
  outsideEvent(e,'pointerup',2);outsideEvent(e,'pointercancel',2);
  ok(e.el.coreStatus.textContent==='RELEASE NOW',rules+' ignores another finger releasing or cancelling outside the stage');
  outsideEvent(e,'pointerup',1,rules==='R4'?outside:core);
  ok(e.el.eventTitle.textContent===(rules==='R4'?'CORE IMPULSE':'PERFECT CHARGE'),rules+' completes a hold released outside the stage when capture fails');
  const score=e.el.syncValue.textContent,cells=e.el.burstCells.getAttribute('aria-label');
  e.pointer('pointerup',core);outsideEvent(e,'pointerup',1);
  ok(e.el.syncValue.textContent===score&&e.el.burstCells.getAttribute('aria-label')===cells,rules+' handles repeated or bubbled release exactly once');
  e.pointer('pointerdown',{...core,pointerId:3});await e.advance(1100);
  outsideEvent(e,'pointercancel',1);
  outsideEvent(e,'pointercancel',3);await e.advance(150);
  ok(!['CHARGING','RELEASE NOW','OVERCHARGE'].includes(e.el.coreStatus.textContent)&&e.el.burstCells.getAttribute('aria-label')===cells,rules+' cancels the owning outside pointer without consuming a burst');
  e.pointer('pointerdown',{...core,pointerId:4});await e.advance(1100);outsideEvent(e,'pointerup',4,core);
  ok(e.el.eventTitle.textContent===(rules==='R4'?'CORE IMPULSE':'PERFECT CHARGE')&&Number(e.el.syncValue.textContent)>Number(score),rules+' accepts a fresh gesture after outside release and cancellation');
 }
 for(const capture of ['missing','silent']){
  const e=environment({audioAvailable:false});e.el.connect.fire('click');await e.advance(100);
  e.el.stage.setPointerCapture=capture==='missing'?undefined:()=>{};
  e.pointer('pointerdown',core);await e.advance(1100);outsideEvent(e,'pointerup',1,core);
  ok(e.el.eventTitle.textContent==='PERFECT CHARGE',capture+' capture support still completes the owning gesture');
 }
 for(const move of [true,false]){
  const e=environment({audioAvailable:false});e.el.connect.fire('click');await e.advance(100);e.el.stage.setPointerCapture=()=>{};
  e.pointer('pointerdown',core);await e.advance(35);if(move)outsideEvent(e,'pointermove',1);
  outsideEvent(e,'pointerup',1);
  ok(e.el.syncValue.textContent==='0.0','An outside short drag does not become a tap '+(move?'with':'without')+' a delivered move event');
  await e.tap();ok(Number(e.el.syncValue.textContent)>0,'A normal tap recovers after the outside drag '+move);
 }
 const captured=environment({search:'?qa=input&rules=R4',audioAvailable:false});captured.el.connect.fire('click');await captured.advance(100);
 const release=captured.el.stage.releasePointerCapture.bind(captured.el.stage);
 captured.el.stage.releasePointerCapture=id=>{release(id);captured.pointer('lostpointercapture',{pointerId:id});};
 captured.pointer('pointerdown',core);await captured.advance(1100);captured.pointer('pointerup',core);outsideEvent(captured,'pointerup',1,core);
 ok(captured.el.burstCells.getAttribute('aria-label').includes('2回')&&!captured.el.stage.hasPointerCapture(1),'Capture-loss reentrancy and subsequent window delivery complete one charge');
 const returned=environment({audioAvailable:false});returned.el.connect.fire('click');await returned.advance(100);returned.el.stage.setPointerCapture=()=>{};
 returned.pointer('pointerdown',core);await returned.advance(35);outsideEvent(returned,'pointermove',1);outsideEvent(returned,'pointerup',1,core);
 ok(returned.el.syncValue.textContent==='0.0','Moving outside and back to the origin stays a drag');
}
async function run(){
 await captureFallback();
 ok(!html.includes('pendingTap')&&!html.includes('flushTap'),'No pending single tap or 330ms flush remains');
 ok(/DOUBLE_TAP_MS=240/.test(html),'NOVA gesture uses a short 240ms window');
 let {e,energies,scores,vibrations}=await cadence(400,1);
 ok(energies[0]>0&&scores[0]>0&&vibrations[0]>0,'First release synchronously scores and gives haptic feedback');
 ok(e.el.eventTitle.textContent==='GOOD / SYNC UP','First tap immediately explains SYNC increase');
 for(const interval of [150,200,250,300,400]){
  ({e,energies,scores,vibrations}=await cadence(interval,5));
  ok(energies.every((v,i)=>v>(energies[i-1]??0)),`${interval}ms cadence recognizes all five inputs`);
  ok(scores.every((v,i)=>v>(scores[i-1]??0)),`${interval}ms cadence immediately increases SYNC each time`);
  ok(vibrations.every((v,i)=>v>(vibrations[i-1]??0)),`${interval}ms cadence gives haptic feedback for each input`);
  ok(e.el.result.hidden&&e.el.coreTarget.disabled===false,`${interval}ms cadence leaves game running`);
  if(interval<=200)ok(e.el.eventTitle.textContent!=='NOVA RECHARGING'&&energies[1]>=energies[0]+14,`${interval}ms intentional double activates NOVA then cooldown taps continue`);
  if(interval>=250)ok(energies[1]-energies[0]<14,`${interval}ms rhythm is not misread as NOVA`);
 }
 ({e,energies}=await cadence(50,5));
 ok(energies.every((v,i)=>v>(energies[i-1]??0)),'Even 50ms taps are never silently discarded');
 e.pointer('pointerdown');await e.advance(1100);e.pointer('pointerup');
 ok(e.el.eventTitle.textContent==='PERFECT CHARGE','HOLD works after rapid input');
 await e.advance(3500);await touch(e);await e.advance(145);await touch(e);
 ok(e.el.eventTitle.textContent==='N O V A'||e.el.eventTitle.textContent==='SYNC CHAIN','NOVA works after rapid input and cooldown');
 const game=new SyncTest();game.start();game.advance(.5);game.input('tap');
 for(const interval of [.05,.2,.25,.3]){game.advance(interval);const previous=game.score;const result=game.input('tap');ok(result.ok&&game.score>previous,`${interval*1000}ms model tap scores`);}
 ok(game.goodTaps===1&&game.combo===2,'Only rhythmic tap earns full quality and combo');
 const spam=new SyncTest();spam.start();for(let i=0;i<500;i++){spam.advance(.1);spam.input('tap');}
 ok(spam.rank[0]!=='S'&&spam.rank[0]!=='SS'&&!spam.ready,'Rapid tapping alone cannot reach OVERDRIVE or top class');
 await e.advance(61000,1000);ok(!e.el.result.hidden,'Rapid play still completes 60-second NORMAL result');
 const remote=environment({search:'?challenge=A7F291C8&rules=R1'});remote.el.connect.fire('click');await touch(remote);await remote.advance(61000,1000);ok(!remote.el.result.hidden&&!remote.el.remoteResult.hidden,'Rapid play still completes a seeded Challenge');
 console.log(`${checks} rapid-input checks passed.`);
}
run().catch(error=>{console.error(error);process.exitCode=1;});
