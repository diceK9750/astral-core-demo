#!/usr/bin/env node
'use strict';
// Step 12 behavior checks; visual appearance and real touch remain browser/device checks.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const extract=name=>{const part=html.split('// '+name+'_BEGIN')[1];assert.ok(part,'Missing model section '+name);return '//'+part.split('// '+name+'_END')[0];};
const model=vm.runInNewContext(['SYNC_MODEL','REMOTE_MODEL','GHOST_MODEL','STAR_MODEL','ORBIT_MODEL','GALAXY_MODEL','GALAXY_FIELD'].map(extract).join('\n')+'\n({SyncTest,RemoteTest,OrbitTest,OrbitRemoteTest,OrbitalField,GalaxyTest,GalaxyRemoteTest,GalaxyField,parseChallenge,challengeURL,dailySeed,parseGhost,ghostURL,ghostEncode,ghostDecode,ghostSample,GhostRecorder,GhostRace,duelOutcome})',{URL,URLSearchParams});
const {environment}=require('./interaction.cjs');
let checks=0;function ok(value,label){assert.ok(value,label);checks++;console.log('PASS '+label);}
const seed='A7F291C8',base='https://dicek9750.github.io/astral-core-demo/',geo={W:390,H:844,cx:195,cy:365.4,R:99.45,top:146,bottom:557};
const dust={type:'dust',mass:1},named={type:'named-star',mass:4.5,name:'Sirius'};
let chainSerial=0;
function absorbChain(g,count,{simultaneous=0,star=dust}={}){const group={id:++chainSerial,count:0,simultaneous};for(let i=1;i<=count;i++){group.count=i;g.absorb({...star},i,group);}return group;}
function game(Type=model.GalaxyTest){const g=Type===model.GalaxyRemoteTest?new Type(seed):new Type();g.start();return g;}
let g=game();
ok(g.duration===60&&g.remaining===60&&g.timeBonus===0,'Fresh growth run begins with exactly sixty world seconds');
ok(g.growth===0&&g.level===0&&Math.abs(g.coreScale-.48)<.001,'CORE starts at Seed level and visibly smaller scale');
g.absorb({...dust},1,{id:1,count:1,simultaneous:0});
ok(g.growth>0&&g.coreScale>.48,'An absorbed body grows the CORE');
ok(g.timeBonus===0,'One clear alone awards no time');
g=game();absorbChain(g,2);ok(g.timeBonus===0,'Two-body chain still awards no time');
g=game();const three=absorbChain(g,3);ok(g.timeBonus===.5&&g.duration===60.5,'Three-body chain awards half a second');
three.count=4;g.absorb({...dust},4,three);ok(g.timeBonus===.5,'Chain milestone is not awarded a second time');
three.count=5;g.absorb({...dust},5,three);ok(g.timeBonus===1,'Five-body chain awards one second in total');
for(let n=6;n<=8;n++){three.count=n;g.absorb({...dust},n,three);}ok(g.timeBonus===1.5,'Eight-body chain awards one and a half seconds in total');
g=game();absorbChain(g,3,{simultaneous:3});ok(g.timeBonus===1.5,'Three simultaneous clears add one second beside chain bonus');
const group=absorbChain(g,5,{simultaneous:5});const bonus=g.timeBonus;group.count=6;g.absorb({...dust},6,group);ok(g.timeBonus===bonus,'Simultaneous bonus is paid only once per shared chain');
g=game();for(let i=0;i<30;i++)absorbChain(g,8,{simultaneous:3});ok(g.timeBonus===30&&g.duration===90,'Total awarded time is capped at thirty seconds');
const single=game(),chained=game(),simultaneous=game();for(let i=0;i<8;i++)absorbChain(single,1);absorbChain(chained,8);absorbChain(simultaneous,8,{simultaneous:3});
ok(chained.growth>single.growth,'Chains grow the CORE more efficiently than identical single clears');
ok(simultaneous.growth>chained.growth,'Simultaneous ignition adds growth efficiency');
const small=game(),large=game();absorbChain(small,1);absorbChain(large,1,{star:named});ok(large.growth>small.growth,'A larger celestial body contributes more absorbed energy');
ok(large.largestBody==='Sirius','Result records the largest absorbed named body');
g=game();for(let i=0;i<60;i++)absorbChain(g,8,{simultaneous:3,star:named});ok(g.level===4&&g.coreScale<=1&&g.coreScale>.9,'Growth reaches final level with bounded CORE size');
ok(typeof g.bestPhenomenon==='string'&&/^[A-Z][A-Z ]+$/.test(g.bestPhenomenon),'Highest chain phenomenon is recorded as an English cosmic name');
g.reset();ok(g.growth===0&&g.level===0&&g.timeBonus===0&&g.duration===60&&g.coreBursts===3,'Replay/reset clears growth, bonus and three burst cells');
g=game();absorbChain(g,8);g.advance(60);ok(g.state==='playing'&&g.elapsed===60&&g.remaining===1.5,'Chain time rewards keep the run active beyond sixty seconds');g.advance(1.5);ok(g.state==='result'&&g.elapsed===61.5&&g.remaining===0,'Extended run ends exactly at its rewarded duration');
const quiet=game();quiet.advance(60);ok(quiet.state==='result'&&quiet.elapsed===60,'A run without time awards still finishes at sixty seconds');
g=game();Object.assign(g,{energy:100,score:650,absorbed:7});ok(!g.ready,'OVER DRIVE remains locked before eight absorbed bodies');g.absorbed=8;ok(g.ready,'Energy, sync and eight absorptions visibly qualify OVER DRIVE');
ok(g.overdrive()&&g.timeLockLeft===5&&g.driveCount===1,'OVER DRIVE activates a five real-second freeze');const at=g.elapsed,left=g.remaining,growth=g.growth;g.advance(2);ok(g.elapsed===at&&g.remaining===left&&g.growth===growth,'OVER DRIVE consumes neither world time nor growth');g.advance(3);ok(g.timeLockEnded&&g.elapsed===at,'Restart follows five real seconds while preserving world clock');g.energy=100;ok(!g.ready,'Restart cannot immediately trigger another OVER DRIVE');g.advance(14);g.energy=100;ok(g.ready&&g.overdrive(),'Second OVER DRIVE becomes available after fourteen world seconds');g.advance(5);g.advance(14);g.energy=100;ok(!g.ready&&!g.overdrive(),'At most two OVER DRIVE activations are allowed');
g=game();const lowEnergy=game(),lowSync=game();Object.assign(lowEnergy,{energy:79,score:650,absorbed:8});Object.assign(lowSync,{energy:100,score:100,absorbed:8});ok(!lowEnergy.ready&&!lowSync.ready,'Energy and sync qualification both remain necessary');
let field=new model.GalaxyField(seed),same=new model.GalaxyField(seed),different=new model.GalaxyField('91C8A7F2');
ok(field.stars.length>0&&field.stars.every(s=>['dust','debris','gas'].includes(s.type)),'Seed-sized CORE attracts only dust, debris and gas');
ok(JSON.stringify(field.stars)===JSON.stringify(same.stars),'Same R3 seed and growth level reproduce initial celestial influx');
ok(JSON.stringify(field.stars)!==JSON.stringify(different.stars),'Different seed changes the celestial influx');
const allowed=[['dust','debris','gas'],['fragment','mineral','ice'],['proto-star','star'],['star','proto-star'],['named-star']];
const names=['Sirius','Vega','Polaris','Rigel','Betelgeuse','Antares','Aldebaran','Procyon'];
for(let level=0;level<=4;level++){const f=new model.GalaxyField(seed);f.stars=[];f.setLevel(level);for(let i=0;i<18;i++)f.spawn(i);ok(f.stars.length===18&&f.stars.every(s=>allowed[level].includes(s.type)),'Growth level '+level+' attracts its intended body family');if(level===4)ok(f.stars.every(s=>names.includes(s.name)),'Final stage named bodies use recognizable English star names');}
const existing=field.stars.map(s=>s.type);field.setLevel(4);ok(JSON.stringify(field.stars.map(s=>s.type))===JSON.stringify(existing),'Growth promotion preserves existing bodies until absorption');
field.stars=[];for(let i=0;i<30;i++)field.spawn(i);ok(field.stars.length===18,'Evolved celestial bodies retain eighteen-object active cap');
field.update(90,geo,()=>{});ok(field.stars.length<=18&&field.waves.length<=24,'Ninety-second growth field remains bounded');
const late=new model.GalaxyField(seed);late.update(60,geo,()=>{});for(const star of late.stars)star.alive=false;late.update(65,geo,()=>{});ok(late.stars.length>0,'Rewarded time continues seeded celestial influx beyond sixty seconds');
for(const [label,g2]of [['small',{W:320,H:568,cx:160,cy:285,R:59,top:135,bottom:427}],['landscape',{W:844,H:390,cx:422,cy:200,R:59,top:112,bottom:320}],['desktop',{W:1920,H:1080,cx:960,cy:530,R:180,top:120,bottom:900}]]){const f=new model.GalaxyField(seed);f.setLevel(4);f.update(85,g2,()=>{});ok(f.stars.every(s=>{const p=f.point(s,g2);return Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=27&&p.x<=g2.W-27&&p.y>=g2.top&&p.y<=g2.bottom;}),label+' late-stage bodies stay within the play area');}
ok(model.parseChallenge('?challenge='+seed+'&rules=R3').rules==='R3'&&!model.parseChallenge('?challenge='+seed+'&rules=R3').invalid,'New R3 Challenge URL parses safely');
for(const rules of ['R1','R2'])ok(!model.parseChallenge('?challenge='+seed+'&rules='+rules).invalid&&new URL(model.challengeURL(seed,base,rules)).searchParams.get('rules')===rules,rules+' legacy Challenge preserves original rules');
ok(new URL(model.challengeURL(seed,base)).searchParams.get('rules')==='R3','New Challenge shares explicitly use R3');
ok(model.parseChallenge('?challenge='+seed+'&rules=R99').invalid,'Unknown future rules fail safely');
function complete(Type,rules,{bonus=false}={}){const run=Type===model.GalaxyRemoteTest||Type===model.OrbitRemoteTest||Type===model.RemoteTest?new Type(seed):new Type();run.start();const rec=new model.GhostRecorder(seed,rules);rec.observe(run);if(bonus){absorbChain(run,8,{simultaneous:3});rec.observe(run);}while(run.state==='playing'){run.advance(.5);rec.observe(run);}return {run,record:rec.finish(run)};}
const r3=complete(model.GalaxyRemoteTest,'R3',{bonus:true});
ok(r3.record&&r3.record.frames.length===61,'Growth Ghost recorder still writes exactly sixty-one samples');
ok(r3.record.duration===r3.run.duration&&r3.record.duration>60&&r3.record.duration<=90,'Growth Ghost includes its actual extended world duration');
const r3url=model.ghostURL(seed,r3.record,base,'R3'),r3decoded=model.parseGhost(new URL(r3url).search,seed).data;
ok(new URL(r3url).searchParams.get('gver')==='3'&&r3decoded?.version===3,'R3 Ghost shares an explicit version-three binary record');
ok(r3decoded.duration===r3.run.duration&&r3decoded.score===r3.run.totalScore,'Ghost binary round trip preserves duration and exact final score');
ok(model.ghostSample(r3decoded,90).score===r3decoded.score&&model.ghostSample(r3decoded,r3decoded.duration).score===r3decoded.score,'Rival score reaches exact final result by its own world duration');
ok(model.ghostSample(r3decoded,-5).score===0,'Negative Ghost playback time safely starts at zero');
const paced={seed,rules:'R3',duration:90,score:6000,sync:60,rank:'B',maxCombo:0,novas:0,coreId:'A7F2-91C8',frames:Array.from({length:61},(_,i)=>({score:i*100,sync:i,combo:0,flags:i===3?8:0}))};
const pacedGhost=model.ghostDecode(model.ghostEncode(paced,seed,'R3'),seed,'R3');
ok(model.ghostSample(pacedGhost,1.5).score===100&&model.ghostSample(pacedGhost,2.25).score===150,'R3 playback interpolates the fixed one-and-a-half-second sample clock');
ok(model.ghostSample(pacedGhost,60).score===4000&&model.ghostSample(pacedGhost,90).score===6000,'R3 rival timeline spans ninety world seconds without stretching sixty-second data');
const pacedRace=new model.GhostRace(pacedGhost);pacedRace.update(4.4,0);ok(pacedRace.update(4.5,0).events&8,'Archived OVER DRIVE event replays at its world timeline boundary');ok(pacedRace.update(4.5,0).events===0,'Frozen rival clock cannot repeat an archived OVER DRIVE echo');
const manyNova={...paced,novas:28,frames:paced.frames.map((f,i)=>({...f,flags:i>0&&i<=56&&i%2===0?4:0}))};
ok(model.ghostDecode(model.ghostEncode(manyNova,seed,'R3'),seed,'R3')?.novas===28,'Ninety-second R3 Ghost preserves more than twenty NOVA successes');
ok(r3url.length<1000&&/^[A-Za-z0-9_-]+$/.test(new URL(r3url).searchParams.get('ghost')),'Growth Ghost stays URL-safe and below one thousand characters');console.log('R3_GHOST_URL_LENGTH',r3url.length);
ok(model.ghostEncode(r3decoded,seed,'R3')===new URL(r3url).searchParams.get('ghost'),'R3 binary format is canonical after decode/encode');
ok(model.parseGhost(new URL(r3url.replace('rules=R3','rules=R2')).search,seed).invalid,'R3 Ghost cannot be relabeled as R2');
ok(model.parseGhost(new URL(r3url.replace('gver=3','gver=999')).search,seed).invalid,'Unknown Ghost version safely falls back to Challenge');
ok(model.parseGhost('?challenge='+seed+'&rules=R3&gver=3&ghost='+'A'.repeat(1000000),seed).invalid,'Giant Ghost payload is rejected before decoding');
for(const [Type,rules,version]of [[model.RemoteTest,'R1',1],[model.OrbitRemoteTest,'R2',2]]){const old=complete(Type,rules),oldURL=model.ghostURL(seed,old.record,base,rules),decoded=model.parseGhost(new URL(oldURL).search,seed).data;ok(decoded?.version===version&&decoded.frames.length===61&&model.ghostSample(decoded,60).score===decoded.score,rules+' archived Ghost codec and sixty-second playback stay compatible');}
const rematch=new URL(model.ghostURL(seed,r3.record,r3url,'R3'));ok(rematch.searchParams.getAll('ghost').length===1&&rematch.searchParams.get('rules')==='R3','R3 Rematch replaces rival record and retains fair rules');
const remote=game(model.GalaxyRemoteTest);absorbChain(remote,8,{simultaneous:3});remote.advance(remote.duration);ok(remote.state==='result'&&remote.challengeId.includes('R3'),'R3 Challenge completes with extended duration and explicit rule identity');
const d1=model.dailySeed(new Date('2026-09-29T15:00:00Z')),d2=model.dailySeed(new Date('2026-09-30T01:00:00Z'));ok(d1.seed===d2.seed&&d1.day==='2026.09.30','Daily date remains deterministic on JST boundaries');
const markup=html.split('<script')[0];ok(!markup.includes('TIME LOCK')&&markup.includes('OVER DRIVE'),'Visible markup uses OVER DRIVE and never TIME LOCK');
ok(/SELECT STARS|星.*選/.test(html)&&/RESTART IN|再始動/.test(html),'Freeze interaction explicitly tells players to select stars before restart');
ok(html.includes('OVER DRIVE READY'),'Ready state has a distinct OVER DRIVE READY label');
ok(names.every(name=>html.includes(name)),'All supported named stars have English display names');
ok(/METEOR SHOWER|SOLAR FLARE|MILKY WAY|SUPERNOVA|COSMIC CASCADE/.test(html),'Cosmic chain feedback has restrained English phenomenon names');
async function ui(){const e=environment({audioAvailable:false});ok(e.el.overdriveLabel.textContent==='OVER DRIVE','Normal initial control exposes the unified OVER DRIVE name');e.el.connect.fire('click');await e.advance(100);ok(e.el.timeValue.textContent==='60'&&e.el.burstCells.getAttribute('aria-label').includes('3回'),'Fresh normal play retains sixty seconds and three CORE BURST cells');await e.tap();ok(Number(e.el.syncValue.textContent)>0,'Immediate TAP feedback and SYNC scoring remain available');await e.advance(92000,1000);ok(!e.el.result.hidden,'Normal growth mode completes without an unhandled exception');e.el.reconnect.fire('click');ok(e.el.timeValue.textContent==='60'&&e.el.result.hidden,'Reconnect resets extended timer to sixty seconds');const challenge=environment({search:'?challenge='+seed+'&rules=R3',audioAvailable:false,storageFail:true});challenge.el.connect.fire('click');await challenge.advance(92000,1000);ok(!challenge.el.result.hidden,'R3 Challenge completes even when localStorage fails');challenge.el.shareChallenge.fire('click');await new Promise(r=>setImmediate(r));ok(!challenge.el.sharePanel.hidden&&challenge.el.shareUrl.selected&&new URL(challenge.el.shareUrl.value).searchParams.get('rules')==='R3','No Share or Clipboard APIs still leave selectable R3 Ghost URL');const incoming=environment({search:new URL(r3url).search,audioAvailable:false});ok(incoming.el.app.classList.contains('duel'),'R3 Ghost URL opens archived rival Duel');incoming.el.connect.fire('click');await incoming.advance(92000,1000);ok(!incoming.el.duelResult.hidden&&['VICTORY','DEFEAT','DRAW'].includes(incoming.el.duelOutcome.textContent),'Growth Ghost Duel reaches a valid final outcome');const normal=environment({audioAvailable:false});normal.el.challengeMode.fire('click');normal.el.dailyMode.fire('click');ok(normal.el.challengeLabel.textContent.includes('DAILY CORE'),'Daily remains directly selectable');console.log(checks+' galaxy checks passed.');}
ui().catch(error=>{console.error(error);process.exitCode=1;});
