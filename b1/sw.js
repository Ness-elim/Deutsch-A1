const CACHE='aspekte-b1-v1.4.0';
const CORE=['./','./index.html','./styles.css','./app.js','./data/content.js','./data/activities.js','./data/stage3.js','./manifest.webmanifest','./assets/icon-192.png','./assets/icon-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(x=>{if(x.ok){const y=x.clone();caches.open(CACHE).then(c=>c.put(e.request,y))}return x}).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):Response.error()))) });
