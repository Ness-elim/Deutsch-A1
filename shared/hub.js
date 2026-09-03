(()=>{
'use strict';
const $=s=>document.querySelector(s);
const LEVELS={
  a1:{label:'A1+',storage:'spektrum-a1-study-v1',url:'a1/index.html',source:'a1/data/content.json',kind:'spektrum'},
  a2:{label:'A2+',storage:'spektrum-a2-study-v1',url:'a2/index.html',source:'a2/data/content.json',kind:'spektrum'},
  b1:{label:'B1',storage:'deutschPathB1AdvancedStateV1',url:'b1/index.html',source:'b1/course-data.js',kind:'aspekte'},
  b2:{label:'B2',storage:'deutschPathB2UltraStateV1',url:'b2/index.html',source:'b2/course-data.js',kind:'aspekte'}
};
let meta={};
let courseData={a1:null,a2:null,b1:null,b2:null};
const json=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch{return null}};

async function loadMeta(){
  try{const r=await fetch('course-meta.json',{cache:'no-store'});meta=r.ok?await r.json():{}}catch{meta={}}
}
function parseWindowAssignment(text){
  const m=text.match(/^\s*window\.([A-Z0-9_]+)\s*=\s*/);
  if(!m)return null;
  const raw=text.slice(m[0].length).replace(/;\s*$/,'');
  return JSON.parse(raw);
}
async function loadCourseData(id){
  const c=LEVELS[id];
  try{
    const r=await fetch(c.source,{cache:'no-store'});
    if(!r.ok)throw new Error(`HTTP ${r.status}`);
    const text=await r.text();
    const data=c.kind==='spektrum'?JSON.parse(text):parseWindowAssignment(text);
    if(!data||typeof data!=='object')throw new Error('Invalid course data');
    if(c.kind==='spektrum'){
      const activities=Array.isArray(data.activities)?data.activities:[];
      const valid=activities.filter(a=>a&&a.chapter&&!['Overview','Übersichten'].includes(a.section));
      courseData[id]={type:'spektrum',total:valid.length,ids:new Set(valid.map(a=>String(a.id)))};
    }else{
      const units=Array.isArray(data.units)?data.units:[];
      courseData[id]={type:'aspekte',total:units.length,ids:new Set(units.map(u=>String(u.id)))};
    }
  }catch(error){
    console.warn(`Deutschraum: could not load ${id} course data`,error);
    courseData[id]=null;
  }
}
async function loadAllCourseData(){await Promise.all(Object.keys(LEVELS).map(loadCourseData))}

function progress(id){
  const c=LEVELS[id],s=json(c.storage),d=courseData[id];
  if(!d)return{done:null,total:null,pct:null,ready:false};
  if(!s)return{done:0,total:d.total,pct:0,ready:true};
  if(d.type==='spektrum'){
    const completed=s.completed&&typeof s.completed==='object'?
      Object.entries(s.completed).filter(([k,v])=>v===true&&d.ids.has(String(k))).map(([k])=>k):[];
    const done=completed.length,total=d.total;
    return{done,total,pct:total?Math.round(done/total*100):0,ready:true};
  }
  const raw=Array.isArray(s.lessonsCompleted)?s.lessonsCompleted.map(String):[];
  const done=raw.filter(x=>d.ids.has(x)).length,total=d.total;
  return{done,total,pct:total?Math.round(done/total*100):0,ready:true};
}

function addEventDates(events,set){if(!Array.isArray(events))return;for(const e of events){if(!e||typeof e!=='object')continue;if(String(e.kind||'')==='error')continue;const m=String(e.date||e.day||'').match(/^\d{4}-\d{2}-\d{2}/);if(m)set.add(m[0])}}
function addDateKeyMap(obj,set){if(!obj||typeof obj!=='object')return;for(const[k,v]of Object.entries(obj)){if(!/^\d{4}-\d{2}-\d{2}$/.test(k)||!v)continue;if(v&&typeof v==='object'){if(Array.isArray(v.sections)&&v.sections.length===0)continue;if(v.parts&&typeof v.parts==='object'&&!Object.values(v.parts).some(x=>Number(x)>0))continue}set.add(k)}}
function globalDates(){const set=new Set();for(const id of Object.keys(LEVELS)){const s=json(LEVELS[id].storage);if(!s)continue;addEventDates(s.events,set);if(s.learningDB?.events)addEventDates(s.learningDB.events,set);addDateKeyMap(s.daily?.dates,set);addDateKeyMap(s.contribution,set);addDateKeyMap(s.contributions,set);addDateKeyMap(s.daily?.partsByDate,set)}return set}
function localDayKey(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function globalStreak(){const set=globalDates(),now=new Date();let d=new Date(now),n=0;if(!set.has(localDayKey(d)))d.setDate(d.getDate()-1);for(let i=0;i<10000;i++){if(!set.has(localDayKey(d)))break;n++;d.setDate(d.getDate()-1)}return{n,today:set.has(localDayKey(now))}}

function sharedConfig(){try{const n=JSON.parse(localStorage.getItem('deutschraum-cloud-config-v2')||'null');if(n)return n;const oldA1=JSON.parse(localStorage.getItem('spektrum-a1-cloud-sync-v1')||'null')||{};const oldA2=JSON.parse(localStorage.getItem('spektrum-a2-cloud-sync-v1')||'null')||{};return{url:oldA1.url||oldA2.url||'',a1Key:oldA1.key||'',a2Key:oldA2.key||'',b1Key:'',b2Key:''}}catch{return{url:'',a1Key:'',a2Key:'',b1Key:'',b2Key:''}}}
function saveSharedConfig(cfg){const cur=sharedConfig();const out={url:String(cfg.url??cur.url??'').trim(),a1Key:String(cfg.a1Key??cur.a1Key??'').trim(),a2Key:String(cfg.a2Key??cur.a2Key??'').trim(),b1Key:String(cfg.b1Key??cur.b1Key??'').trim(),b2Key:String(cfg.b2Key??cur.b2Key??'').trim()};localStorage.setItem('deutschraum-cloud-config-v2',JSON.stringify(out));localStorage.setItem('spektrum-a1-cloud-sync-v1',JSON.stringify({url:out.url,key:out.a1Key}));if(out.a2Key)localStorage.setItem('spektrum-a2-cloud-sync-v1',JSON.stringify({url:out.url,key:out.a2Key}));}
function syncKey(id){return sharedConfig()[id+'Key']||''}
function cleanUrl(v){return String(v||'').trim().replace(/[?#].*$/,'').replace(/\/$/,'')}
function validUrl(v){return /^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec$/i.test(cleanUrl(v))}
function jsonp(url,params){return new Promise((resolve,reject)=>{const cb='__dr_cb_'+Date.now()+'_'+Math.random().toString(36).slice(2);const script=document.createElement('script');const q=new URLSearchParams({...params,callback:cb});let done=false;const finish=(err,data)=>{if(done)return;done=true;clearTimeout(timer);delete window[cb];script.remove();err?reject(err):resolve(data)};window[cb]=data=>finish(null,data);script.onerror=()=>finish(new Error('Cloud request failed.'));const timer=setTimeout(()=>finish(new Error('Cloud request timed out.')),15000);script.src=cleanUrl(url)+'?'+q.toString();document.head.appendChild(script)})}
async function pullCloud(id){const cfg=sharedConfig(),key=syncKey(id);if(!validUrl(cfg.url)||key.length<16)throw Error(`Add the ${LEVELS[id].label} Sync key first.`);const data=await jsonp(cfg.url,{action:'pull',key});if(!data?.ok)throw Error(data?.error||'Cloud pull failed.');return data.record||null}
function markLastLevel(id){try{localStorage.setItem('deutschraum-last-level',id)}catch{}}
async function cacheFiles(id){const res=await fetch(`${id}-offline-manifest.json`,{cache:'no-store'});if(!res.ok)throw Error('Offline manifest unavailable');const list=(await res.json()).files||[],c=await caches.open('deutschraum-runtime-v3');let done=0,failed=0;for(const url of list){try{const r=await fetch(url,{cache:'no-store'});if(r.ok)await c.put(url,r);else failed++}catch{failed++}done++;updateOffline(id,`Downloading ${done}/${list.length}…`)}localStorage.setItem(`deutschraum-offline-${id}`,JSON.stringify({version:meta[id]?.version||'v1',at:Date.now(),files:list.length,failed}));updateOffline(id,failed?`Offline ready with ${failed} unavailable files`:'Available offline ✓')}
function updateOffline(id,t){const e=document.querySelector(`[data-offline="${id}"]`);if(e){e.textContent=t;e.className='offline '+(t.includes('Available')?'ok':t.includes('failed')?'err':'')}}
async function removeOffline(id){const res=await fetch(`${id}-offline-manifest.json`,{cache:'no-store'});if(!res.ok)throw Error('Offline manifest unavailable');const list=(await res.json()).files||[],c=await caches.open('deutschraum-runtime-v3');await Promise.all(list.map(u=>c.delete(u)));localStorage.removeItem(`deutschraum-offline-${id}`);updateOffline(id,'Online only')}
function theme(v){const next=v==='dark'?'dark':'light';document.documentElement.dataset.theme=next;document.documentElement.style.colorScheme=next;try{localStorage.setItem('deutschraum-theme',next)}catch{}const metaTheme=$('#themeMeta');if(metaTheme)metaTheme.setAttribute('content',next==='dark'?'#0b1514':'#0e6b5c');const b=$('#themeBtn');if(b){b.textContent=next==='dark'?'☀ Light':'◐ Dark';b.setAttribute('aria-label',next==='dark'?'Switch to light mode':'Switch to dark mode')}}
function render(){for(const id of Object.keys(LEVELS)){const p=progress(id),card=document.querySelector(`[data-level="${id}"]`);if(!card)continue;if(p.ready){card.querySelector('.progress-text').textContent=`${p.done}/${p.total} tasks · ${p.pct}%`;card.querySelector('.bar span').style.width=`${p.pct}%`}else{card.querySelector('.progress-text').textContent='Progress unavailable';card.querySelector('.bar span').style.width='0%';}const saved=json(`deutschraum-offline-${id}`);updateOffline(id,saved&&saved.version===meta[id]?.version?'Available offline ✓':'Online only')}const gs=globalStreak();$('#globalStreak').textContent=`${gs.n} day${gs.n===1?'':'s'}`;$('#streakPill').classList.toggle('pending',!gs.today);let last=null;try{last=localStorage.getItem('deutschraum-last-level')}catch{}const box=$('#continueBox');if(last&&LEVELS[last]){box.classList.remove('hidden');$('#continueText').textContent=`Last path: ${LEVELS[last].label}`;$('#continueLink').href=LEVELS[last].url}}
function applyImported(id,state){if(!state||typeof state!=='object')throw Error('Invalid progress file.');localStorage.setItem(LEVELS[id].storage,JSON.stringify(state));render()}
function bind(){
 document.querySelectorAll('[data-open]').forEach(a=>a.addEventListener('click',()=>markLastLevel(a.dataset.open)));
 document.querySelectorAll('[data-download]').forEach(b=>b.addEventListener('click',async()=>{const id=b.dataset.download;try{b.disabled=true;await cacheFiles(id)}catch{updateOffline(id,'Download failed')}finally{b.disabled=false}}));
 document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',async()=>{try{b.disabled=true;await removeOffline(b.dataset.remove)}catch{updateOffline(b.dataset.remove,'Remove failed')}finally{b.disabled=false}}));
 const cfg=sharedConfig(),urlInput=$('#cloudUrl'),keyInput=$('#cloudKey'),a2Input=$('#a2Key'),b1Input=$('#b1Key'),b2Input=$('#b2Key');
 if(urlInput)urlInput.value=cfg.url||'';if(keyInput)keyInput.value=cfg.a1Key||'';if(a2Input)a2Input.value=cfg.a2Key||'';if(b1Input)b1Input.value=cfg.b1Key||'';if(b2Input)b2Input.value=cfg.b2Key||'';
 $('#saveCloud')?.addEventListener('click',()=>{saveSharedConfig({url:urlInput?.value||'',a1Key:keyInput?.value||'',a2Key:a2Input?.value||'',b1Key:b1Input?.value||'',b2Key:b2Input?.value||''});const st=$('#cloudStatus');if(st)st.textContent='Saved. A1 keeps the existing key; other course keys are optional.'});
 $('#restoreA1')?.addEventListener('click',async()=>{try{saveSharedConfig({url:urlInput?.value||'',a1Key:keyInput?.value||'',a2Key:a2Input?.value||'',b1Key:b1Input?.value||'',b2Key:b2Input?.value||''});const rec=await pullCloud('a1');if(!rec?.state){$('#cloudStatus').textContent='No A1 cloud progress was found for this key.';return}localStorage.setItem(LEVELS.a1.storage,JSON.stringify(rec.state));render();$('#cloudStatus').textContent='A1 progress restored from the existing cloud copy.'}catch(e){$('#cloudStatus').textContent=e.message}});
 const importFile=$('#importFile');if(importFile)importFile.onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const raw=JSON.parse(await f.text());const id=$('#importLevel').value;let state=raw;if(raw&&raw.state&&typeof raw.state==='object')state=raw.state;applyImported(id,state);$('#importStatus').textContent=`Imported progress into ${LEVELS[id].label}.`;e.target.value=''}catch{$('#importStatus').textContent='This file could not be imported.'}};
 theme(localStorage.getItem('deutschraum-theme')||'light');$('#themeBtn')?.addEventListener('click',()=>theme(document.documentElement.dataset.theme==='dark'?'light':'dark'));$('#refreshDashboard')?.addEventListener('click',render);
}
Promise.all([loadMeta(),loadAllCourseData()]).finally(()=>{bind();render();setInterval(render,15000)});
})();
