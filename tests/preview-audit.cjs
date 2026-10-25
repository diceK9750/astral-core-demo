'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),html=fs.readFileSync(path.join(root,'tests/preview.html'),'utf8');
let checks=0;function ok(v,m){assert.ok(v,m);checks++;console.log('PASS '+m);}
const playSource=html.slice(html.indexOf('async function playTrial(){'),html.indexOf("$('play').addEventListener('click',playTrial);"));
async function play({loaded=true,missing=false,waitError=false,observeError=false,expired=false,navigated=false}={},source=playSource){
 const controls={play:{disabled:false},pilot:{value:'full'},runLog:{textContent:''}};let observed=0,disconnected=0,focused=0,runs=0,waits=0,clock=0;
 const nodes=new Proxy({app:{classList:{contains:()=>false}},stageMode:missing?null:{nodeType:1,textContent:'CONNECT'},connect:null,result:{visible:!expired},reconnect:{click(){}}},{get:(o,k)=>k in o?o[k]:{textContent:'fixture'}});
 const context={loaded,$:id=>controls[id],frame:{contentDocument:{getElementById:id=>nodes[id]}},visible:e=>!!e?.visible,focusGame(){focused++;},async waitScenarioReady(){waits++;if(waitError)throw Error('Readiness timeout');},performance:{now:()=>{if(navigated&&clock)context.frame.contentDocument={getElementById:id=>nodes[id]};return clock++?200000:0;}},delay:async()=>{},worldSnapshot:()=>({rules:'R4'}),run(){runs++;},errors:[],MutationObserver:class{observe(node){observed++;if(!node||observeError)throw TypeError("Failed to execute 'observe' on 'MutationObserver': parameter 1 is not of type 'Node'.");}disconnect(){disconnected++;}}};
 vm.runInNewContext(source+';globalThis.invoke=playTrial;',context);let rejected=null;try{await context.invoke();}catch(e){rejected=String(e);}
 return{controls,observed,disconnected,focused,runs,waits,rejected};
}
async function run(){
 for(const [i,m]of [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].entries()){new vm.Script(m[1]);ok(true,'Preview script '+(i+1)+' syntax');}
 const loading=await play({loaded:false});ok(!loading.rejected&&loading.controls.runLog.textContent.includes('読み込み完了'),'Early play gives controlled readiness guidance');ok(!loading.controls.play.disabled&&loading.observed===0&&loading.focused===0,'Early play restores button without touching blank iframe');
 const wait=await play({waitError:true});ok(!wait.rejected&&wait.controls.runLog.textContent.includes('Readiness timeout'),'Readiness timeout remains inside scenario error handling');ok(wait.waits===1&&!wait.controls.play.disabled&&wait.observed===0,'Readiness failure restores button and creates no observer');
 const absent=await play({missing:true});ok(!absent.rejected&&absent.controls.runLog.textContent.includes('未準備'),'Missing stage node gives controlled retry guidance');ok(absent.observed===0&&!absent.controls.play.disabled,'Missing stage never reaches MutationObserver.observe');
 const observer=await play({observeError:true});ok(!observer.rejected&&observer.controls.runLog.textContent.includes('MutationObserver'),'Observer setup failure is caught');ok(observer.disconnected===1&&!observer.controls.play.disabled,'Observer setup failure disconnects and restores button');
 const complete=await play();ok(!complete.rejected&&complete.observed===1&&complete.runs===1,'Ready scenario observes a real node and completes');ok(complete.disconnected===1&&!complete.controls.play.disabled,'Completed scenario disconnects and restores button');
 const expired=await play({expired:true});ok(!expired.rejected&&expired.controls.runLog.textContent.includes('完走は未確認')&&!expired.controls.runLog.textContent.includes('成長シナリオ完了'),'Expired scenario never claims completion without result');ok(expired.disconnected===1&&!expired.controls.play.disabled,'Expired scenario cleans observer and restores button');
 const replaced=await play({navigated:true});ok(!replaced.rejected&&replaced.controls.runLog.textContent.includes('切り替わり')&&!replaced.controls.runLog.textContent.includes('成長シナリオ完了'),'Replaced iframe cannot produce stale completion evidence');ok(replaced.disconnected===1&&!replaced.controls.play.disabled,'Replaced iframe cleans observer and restores button');
 const readySource=html.slice(html.indexOf('async function waitScenarioReady(){'),html.indexOf('async function playTrial(){'));
 for(const phase of ['playing','result','loading','blank']){let ticks=0,delays=0;const state={app:phase==='blank'?null:{classList:{contains:()=>phase==='loading'&&delays===0}}};const c={frame:{contentDocument:{getElementById:()=>state.app}},performance:{now:()=>ticks++*1000},delay:async()=>{delays++;state.app={classList:{contains:()=>false}};}};vm.runInNewContext(readySource+';globalThis.ready=waitScenarioReady;',c);await c.ready();ok(delays===(['loading','blank'].includes(phase)?1:0),'Scenario readiness accepts '+phase+' without requiring a visible START button');}
 const mountSource=html.slice(html.indexOf('function mountPreviewFrame(){'),html.indexOf('mountPreviewFrame();'));
 const raf=[],mountListeners={},frameListeners={},controls=[{disabled:false},{disabled:true}];let mounts=0;const frame={isConnected:false,addEventListener:(k,f)=>frameListeners[k]=f};const boot={document:{readyState:'loading',querySelectorAll:()=>controls},window:{addEventListener:(k,f)=>mountListeners[k]=f},frame,wrap:{appendChild(){frame.isConnected=true;mounts++;}},requestAnimationFrame:f=>raf.push(f)};vm.runInNewContext(mountSource+';mountPreviewFrame();',boot);
 ok(!frame.isConnected&&raf.length===0&&controls.every(x=>x.disabled),'Bootstrap keeps iframe inert and controls gated before parent load');
 mountListeners.load();ok(!frame.isConnected&&raf.length===1,'Parent load schedules first rendering opportunity without iframe');
 raf.shift()();ok(!frame.isConnected&&raf.length===1,'First rendering opportunity keeps iframe detached');
 raf.shift()();ok(frame.isConnected&&mounts===1,'Second rendering opportunity mounts iframe once');
 frameListeners.load();ok(!controls[0].disabled&&controls[1].disabled,'Initial iframe load restores original control disabled states');
 const completeBoot={...boot,document:{readyState:'complete',querySelectorAll:()=>controls}};frame.isConnected=false;vm.runInNewContext(mountSource+';mountPreviewFrame();',completeBoot);ok(raf.length===1,'Already loaded parent still defers iframe mounting');
 const listeners={},docListeners={},log={textContent:'',dataset:{}},head=[...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)][0][1];let parsed=false;
 vm.runInNewContext(head,{window:{addEventListener:(k,f)=>listeners[k]=f},document:{getElementById:()=>parsed?log:null,addEventListener:(k,f)=>docListeners[k]=f}});
 ok(typeof listeners.error==='function'&&typeof listeners.unhandledrejection==='function','Preview installs its own error listeners before body parsing');
 listeners.error({error:{stack:'TypeError: boot fixture\n at original-script:12:3'},filename:'fixture.html',lineno:12,colno:3});parsed=true;docListeners.DOMContentLoaded();
 ok(log.dataset.count==='1'&&log.textContent.includes('original-script:12:3')&&log.textContent.includes('fixture.html:12:3'),'Pre-DOM error retains stack and source coordinates after DOM ready');
 listeners.unhandledrejection({reason:{stack:'Error: rejection fixture'}});ok(log.dataset.count==='2'&&log.textContent.includes('rejection fixture')&&log.textContent.includes('boot fixture'),'Own rejection is retained beside earlier startup error');
 const cleanListeners={},cleanLog={dataset:{}};vm.runInNewContext(head,{window:{addEventListener(){}},document:{getElementById:()=>cleanLog,addEventListener:(k,f)=>cleanListeners[k]=f}});cleanListeners.DOMContentLoaded();ok(cleanLog.dataset.count==='0'&&cleanLog.textContent.includes('0 件'),'Clean startup explicitly reports zero own-document exceptions');
 ok(html.indexOf("window.addEventListener('error'")<html.indexOf('<iframe'),'Own-document error capture starts before iframe markup');
 console.log(checks+' preview audit checks passed. VM lifecycle fixtures; browser evidence remains separate.');
}
module.exports={play};
if(require.main===module)run().catch(e=>{console.error(e);process.exitCode=1;});
