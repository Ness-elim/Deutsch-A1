const SHELL_CACHE='deutschraum-static-v7';
const RUNTIME_CACHE='deutschraum-runtime-v4';
const SHELL=['./','./index.html','./shared/hub.css','./shared/hub.js','./course-meta.json','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./a1-offline-manifest.json','./a2-offline-manifest.json','./b1-offline-manifest.json','./b2-offline-manifest.json'];
self.addEventListener('install',e=>e.waitUntil(caches.open(SHELL_CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>![SHELL_CACHE,RUNTIME_CACHE].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);if(url.origin!==self.location.origin)return;
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(resp=>{if(resp.ok){const copy=resp.clone();caches.open(RUNTIME_CACHE).then(c=>c.put(e.request,copy)).catch(()=>{});}return resp;}).catch(()=>cached||caches.match('./index.html'))));
});
