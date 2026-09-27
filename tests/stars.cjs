#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const StarField=vm.runInNewContext('//'+html.split('// STAR_MODEL_BEGIN')[1].split('// STAR_MODEL_END')[0]+'\nStarField');
const SyncTest=vm.runInNewContext('//'+html.split('// SYNC_MODEL_BEGIN')[1].split('// SYNC_MODEL_END')[0]+'\nSyncTest');
const {environment}=require('./interaction.cjs');
let checks=0;function ok(value,label){assert.ok(value,label);checks++;console.log('PASS '+label);}
const phone={W:390,H:844,cx:195,cy:365.4,R:99.45,top:146,bottom:557};
function snapshot(field){return JSON.stringify(field.stars.map(s=>[s.id,s.ax,s.ay,s.flare,s.born]));}
function runModel(){
 const one=new StarField('A7F291C8'),same=new StarField('A7F291C8'),other=new StarField('91C8A7F2');
 ok(one.stars.length===15,'15 visible stars appear immediately');
 ok(snapshot(one)===snapshot(same),'Same Challenge Seed creates the same initial constellation');
 ok(snapshot(one)!==snapshot(other),'Different Seed changes the constellation');
 ok(one.stars.some(s=>s.flare),'Wide-radius flare star is present');
 for(const [label,g] of Object.entries({phone,small:{W:320,H:568,cx:160,cy:285,R:59,top:135,bottom:427},landscape:{W:844,H:390,cx:422,cy:200,R:59,top:112,bottom:320}})){
  const f=new StarField('A7F291C8');f.update(60,g,()=>{});
  ok(f.stars.length<=18&&f.waves.length<=24,`${label}: sixty seconds keeps star and wave arrays bounded`);
  ok(f.stars.every(s=>{const p=f.point(s,g);return p.x>=28&&p.x<=g.W-28&&p.y>=g.top&&p.y<=g.bottom;}),`${label}: every star remains inside the touch-safe playfield`);
 }
 const f=new StarField('A7F291C8'),first=f.stars[0],p=f.point(first,phone),hits=[];
 ok(f.hit(p.x+18,p.y,phone)!==null,'Small visual star has a forgiving touch target');
 const chain=f.trigger(p.x,p.y,0,phone,(star,count)=>hits.push([star.id,count]));
 ok(!!chain&&hits.length===1&&!first.alive,'Tapping a star bursts it immediately');
 for(let t=.04;t<=1;t+=.04)f.update(t,phone,(star,count)=>hits.push([star.id,count]));
 ok(hits.length>=5&&chain.count>=5&&f.bestChain>=5,'Expanding waves cause at least five linked bursts');
 ok(hits.every(([,count],i)=>count===i+1),'Linked bursts keep one increasing chain count');
 ok(new Set(hits.map(([id])=>id)).size===hits.length,'A star cannot be scored twice');
 const empty=f.hit(-100,-100,phone);ok(empty===null,'Miss outside the playfield never triggers a burst');
 const hold=new StarField('A7F291C8'),holdP=hold.point(hold.stars[0],phone),normal=new StarField('A7F291C8');let a=0,b=0;
 hold.trigger(holdP.x,holdP.y,0,phone,()=>a++,1.8);normal.trigger(holdP.x,holdP.y,0,phone,()=>b++);
 for(let t=.04;t<=1;t+=.04){hold.update(t,phone,()=>a++);normal.update(t,phone,()=>b++);}ok(a>=b,'Successful HOLD expands the blast radius');
 const nova=new StarField('A7F291C8');let burst=0;const direct=nova.nova(phone.cx,phone.cy,0,phone,()=>burst++);ok(direct>=3&&burst===direct,'NOVA lights several nearby stars at once');
 const score=new SyncTest();score.start();score.advance(.5);score.input('tap');const before=score.sync,combo=score.combo;for(let i=1;i<=5;i++)ok(score.starBurst(i),'Each chained star is a valid score event');ok(score.sync>before&&score.combo===combo+5&&score.energy>3,'Chain raises SYNC, COMBO, and ENERGY');
 score.advance(60);ok(!score.starBurst(6),'No chain scoring after the 60-second result');
}
async function runUI(){
 const first=environment({search:'?challenge=A7F291C8&rules=R1',audioAvailable:false}),opening=new StarField('A7F291C8'),firstPoint=opening.point(opening.stars[0],phone);
 first.pointer('pointerdown',{clientX:firstPoint.x,clientY:firstPoint.y});await first.advance(35);first.pointer('pointerup',{clientX:firstPoint.x,clientY:firstPoint.y});
 ok(first.el.connect.hidden&&Number(first.el.syncValue.textContent)>0,'The very first star touch starts play and bursts immediately');
 const e=environment({search:'?challenge=A7F291C8&rules=R1',audioAvailable:false});
 ok(/星/.test(e.el.heroSub.textContent)&&/連鎖/.test(e.el.heroSub.textContent),'First screen explains the star-chain objective');
 e.el.connect.fire('click');const f=new StarField('A7F291C8'),p=f.point(f.stars[0],phone);
 e.pointer('pointerdown',{clientX:p.x,clientY:p.y});await e.advance(35);e.pointer('pointerup',{clientX:p.x,clientY:p.y});
 ok(Number(e.el.syncValue.textContent)>0,'Live star TAP raises visible SYNC at release');
 await e.advance(800,40);
 ok(Number(e.el.chainValue.textContent)>=5&&e.el.chainBurst.classList.contains('visible'),'Live canvas chain shows CHAIN ×5 or higher');
 ok(Number(e.el.comboValue.textContent)>=5,'Live chain grows HUD combo');
 await e.advance(61000,1000);ok(!e.el.result.hidden&&!e.el.remoteResult.hidden,'Seeded Challenge with stars finishes at 60 seconds');
 e.el.reconnect.fire('click');ok(e.el.result.hidden&&e.el.timeValue.textContent==='60'&&Number(e.el.chainValue.textContent)>=0,'Reconnect resets the star field and timer');
}
runModel();runUI().then(()=>console.log(`${checks} star-chain checks passed.`)).catch(error=>{console.error(error);process.exitCode=1;});
