#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const code=html.split('// SYNC_MODEL_BEGIN')[1].split('// SYNC_MODEL_END')[0];
const SyncTest=vm.runInNewContext('//'+code+'\nSyncTest');
let count=0;function ok(value,label){assert.ok(value,label);console.log('PASS '+label);count++;}
function fresh(){const g=new SyncTest();g.start();return g;}
let g=fresh();g.advance(59.95);ok(g.state==='playing','Timer continues before 60 seconds');g.advance(.05);ok(g.state==='result'&&g.elapsed===60,'60 seconds ends exactly');const points=g.score;g.input('tap');ok(g.score===points,'No scoring after result');g.start();ok(g.elapsed===0&&g.score===0&&g.maxCombo===0&&!g.singularity,'Replay clears every run statistic');
g=fresh();g.advance(.5);g.input('tap');ok(g.score>0&&g.energy>0&&g.goodTaps===0,'First input is accepted without fabricated rhythm accuracy');g.advance(.55);g.input('tap');ok(g.goodTaps===1&&g.combo===2,'Timed tap increases accuracy and combo');const score=g.score;g.advance(.1);ok(!g.input('tap').ok&&g.score===score,'Fast tapping earns no points');g.advance(3.3);ok(g.combo===0,'Idle time breaks combo');
g=fresh();g.advance(1);let r=g.input('hold',1.1);ok(r.perfect&&g.holds===1,'Hold success window');g.advance(2);r=g.input('hold',2);ok(!r.perfect&&g.holds===1&&g.combo===1,'Overcharge loses success and combo');g.advance(.5);r=g.input('hold',.5);ok(!r.perfect&&g.holds===1,'Early release is lower value');
g=fresh();g.input('nova');const after=g.score;ok(!g.input('nova').ok&&g.score===after,'NOVA cooldown prevents duplicates');g.advance(3.2);ok(g.input('nova').ok&&g.novas===2,'NOVA can return after 3.2 seconds');ok(!g.overdrive(),'Overdrive cannot be entered without requirements');
g=fresh();for(let i=0;i<100;i++){g.advance(.5);g.input('tap');}ok(g.sync<=69.9&&g.rank[0]==='B','Only tapping is capped at B even at high score');
g=fresh();for(let i=0;i<599;i++){g.advance(.1);g.input('tap');}ok(g.rank[0]==='C','Extreme spam is ineffective');
function mixed({drive=true}={}){const g=fresh();const events=[];while(g.elapsed<58){for(const [kind,wait,hold]of[['tap',.55,0],['tap',.55,0],['hold',1.1,1.1],['nova',.4,0]]){g.advance(wait);const r=g.input(kind,hold);if(r.awakened)events.push(g.elapsed);if(drive&&g.ready)g.overdrive();}g.advance(.65);}return {g,events};}
let simulation=mixed();g=simulation.g;ok(g.chains>0,'TAP TAP HOLD NOVA grants a chain');ok(g.driveCount>0,'Mixed play can unlock OVERDRIVE');ok(g.singularity&&g.rank[0]==='SS','A complete skilled run can attain SS');ok(simulation.events[0]>=40,'SINGULARITY is reserved for final 20 seconds');console.log('BALANCE skilled:',JSON.stringify({sync:g.sync,rank:g.rank,combo:g.maxCombo,holds:g.holds,novas:g.novas,drives:g.driveCount,awakens:simulation.events}));
const noDrive=mixed({drive:false}).g;ok(!noDrive.singularity&&noDrive.rank[0]==='A','High score alone cannot unlock S or SINGULARITY');
const reference={elapsed:45,score:1300,combo:20,maxCombo:20,goodTaps:12,holds:6,novas:6,taps:20,driveLeft:8,driveCount:2,driveActions:7,driveHold:true,driveNova:true,lastInput:44.4,lastAction:44.4};for(const [key,value]of[['elapsed',30],['score',100],['combo',5],['goodTaps',0],['holds',0],['novas',0],['driveLeft',0],['driveActions',0],['driveHold',false],['driveNova',false]]){g=fresh();Object.assign(g,reference,{[key]:value});g.input('tap');ok(!g.singularity,'SINGULARITY requires '+key);}
g=fresh();Object.assign(g,reference);g.input('tap');ok(g.singularity,'All simultaneous SINGULARITY requirements work');g.advance(10);ok(g.driveLeft===0,'OVERDRIVE expires');
const id=g.coreId;ok(/^[0-9A-F]{4}-[0-9A-F]{4}$/.test(id)&&id===g.coreId,'CORE ID is short and deterministic from results');g.advance(NaN);g.advance(Infinity);ok(Number.isFinite(g.elapsed),'Invalid clock values cannot corrupt state');
console.log(`${count} game checks passed.`);
