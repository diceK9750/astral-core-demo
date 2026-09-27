#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {environment}=require('./interaction.cjs');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
let count=0;
function ok(value,message){assert.ok(value,message);count++;console.log('PASS '+message);}
async function run(){
 const e=environment({audioAvailable:false});
 ok(/60秒で SYNC 100%/.test(e.el.heroTitle.textContent),'Opening names the 60-second SYNC goal');
 ok(/タップ/.test(e.el.heroSub.textContent)&&/TAP[\s\S]*HOLD[\s\S]*NOVA/.test(html.match(/<p class="hint" id="hint">([^]*?)<\/p>/)[1]),'Core action and all three gesture symbols appear without a help screen');
 ok(html.includes('自分の限界へ')&&html.includes('同じ信号で競う'),'Both mode choices explain their purpose');
 e.el.connect.fire('click');await e.advance(100);
 ok(/コアをタップ/.test(e.el.hint.innerHTML)&&e.el.timeValue.textContent==='60','First run guides TAP while the same 60-second timer starts');
 await e.tap();await e.advance(360);
 ok(/SYNC \+/.test(e.el.eventSubtitle.textContent)&&Number(e.el.syncValue.textContent)>0,'First successful TAP visibly links action to SYNC increase');
 ok(/長押し/.test(e.el.hint.innerHTML),'TAP success advances to HOLD guidance');
 e.pointer('pointerdown');await e.advance(1080);
 ok(e.el.coreStatus.textContent==='RELEASE NOW'&&e.el.app.classList.contains('charge-ready')&&/離す/.test(e.el.hint.innerHTML),'Hold ring and RELEASE cue agree at the scoring window');
 e.pointer('pointerup');await e.advance(100);
 ok(e.el.eventTitle.textContent==='PERFECT CHARGE'&&/TAP TAP/.test(e.el.hint.innerHTML),'Perfect HOLD advances to visual double-TAP cue');
 await e.tap();await e.advance(90);await e.tap();await e.advance(100);
 ok(e.el.eventTitle.textContent==='N O V A'&&Number(e.el.energyValue.textContent)>0,'Double TAP gives distinct NOVA feedback');
 await e.advance(11500,250);
 ok(e.storage()==='1','Guide completion persists without storing identity or gameplay history');
 e.el.reconnect.fire('click');await e.advance(150);
 ok(/TAP · HOLD · ×2/.test(e.el.hint.innerHTML),'Replay offers a concise gesture reminder');
 await e.advance(4000,250);ok(!e.el.hint.innerHTML.includes('TAP · HOLD · ×2'),'Replay guidance clears quickly');
 const veteran=environment({stored:'1',audioAvailable:false});veteran.el.connect.fire('click');await veteran.advance(100);
 ok(/TAP · HOLD · ×2/.test(veteran.el.hint.innerHTML),'Stored guide completion shortens the next visit');
 const limited=environment({storageFail:true,audioAvailable:false});limited.el.connect.fire('click');await limited.tap();await limited.advance(12000,250);
 ok(Number(limited.el.syncValue.textContent)>0&&Number(limited.el.timeValue.textContent)<60,'Storage denial never prevents play or guide expiry');
 const remote=environment({search:'?challenge=A7F291C8',audioAvailable:false});
 ok(remote.el.heroSub.textContent.includes('同じ信号でスコアを競う'),'Direct Challenge URL explains shared-signal competition');
 remote.el.connect.fire('click');const seen=new Set();
 for(let i=0;i<10;i++){
  await remote.advance(Math.max(0,(8.15+i*4.6)*1000-(60-Number(remote.el.timeValue.textContent))*1000),250);
  const kind=remote.el.signalType.textContent.replace('UNKNOWN / ','');
  if(kind.startsWith('UNKNOWN'))continue;
  seen.add(kind);const instruction=remote.el.signalInstruction.textContent;
  ok(remote.el.signalGesture.textContent.length>0,'Signal '+kind+' supplies a visible gesture symbol');
  if(kind==='PULSE')ok(/TAP/.test(instruction),'PULSE explicitly asks for timed TAP');
  if(kind==='JAM')ok(/2回 TAP/.test(instruction),'JAM explicitly asks for spaced two TAPs');
  if(kind==='PHASE SHIFT')ok(/長押し/.test(instruction)&&/離す/.test(instruction),'PHASE SHIFT asks for HOLD release');
  if(kind==='VOID')ok(/触らない/.test(instruction)&&remote.el.app.classList.contains('signal-void'),'VOID directs no touch and dims the CORE');
  if(kind==='OVERLOAD')ok(/NOVA/.test(instruction),'OVERLOAD asks for double TAP NOVA');
  // Timers are approximate in the DOM; the next iteration progresses by the fixed event spacing.
  await remote.advance(4500,250);
 }
 ok(seen.size===5,'All five deterministic signal kinds retain actionable guidance');
 const ghost=environment({search:'?challenge=A7F291C8',audioAvailable:false});
 ok(!ghost.el.app.classList.contains('duel'),'Ordinary Challenge has no ghost display');
 ok(html.includes('友人の記録を追い越せ。')&&html.includes('YOU vs RIVAL'),'Valid ghost prestart copy identifies the archived rival and objective');
 const drive=environment({audioAvailable:false});drive.el.connect.fire('click');
 for(let i=0;i<4;i++){await drive.tap();await drive.advance(480);}
 for(let i=0;i<2;i++){await drive.tap();await drive.advance(85);await drive.tap();await drive.advance(3300,250);}
 let sawReadyPulse=false;for(let i=0;i<16;i++){drive.pointer('pointerdown');await drive.advance(1080,250);drive.pointer('pointerup');await drive.advance(110);sawReadyPulse ||= drive.el.app.classList.contains('drive-ready');}
 ok(!drive.el.overdrive.disabled&&drive.el.overdriveLabel.textContent==='OVERDRIVE READY'&&drive.el.overdriveSub.textContent==='いま解放','Qualifying inputs reveal an actionable OVERDRIVE READY button');
 ok(sawReadyPulse,'Ready state gives one brief button pulse');
 await drive.advance(1250,250);ok(!drive.el.app.classList.contains('drive-ready')&&!drive.el.overdrive.disabled,'Ready pulse ends without blinking while the button stays usable');
 drive.el.overdrive.fire('click');ok(drive.el.overdriveLabel.textContent==='OVERDRIVE ACTIVE','One press engages existing OVERDRIVE');
 ok(html.includes('touch-action:none')&&html.includes("'contextmenu',e=>e.preventDefault()"),'Double TAP and long press suppress browser gesture interference');
 console.log(`${count} first-play UX checks passed.`);
}
run().catch(error=>{console.error(error);process.exitCode=1;});
