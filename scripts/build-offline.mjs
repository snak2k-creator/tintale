import {readdirSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
const assets=files('dist').filter(x=>!x.endsWith('/sw.js'));
const hash=createHash('sha256');for(const p of assets){hash.update(p);hash.update(readFileSync(p));}
const cache=`tintale-${hash.digest('hex').slice(0,12)}`;
writeFileSync('dist/sw.js',`const CACHE=${JSON.stringify(cache)};
const ASSETS=${JSON.stringify(assets.map(p=>'/'+p.slice(5)))};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('tintale-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;event.respondWith(caches.open(CACHE).then(cache=>cache.match(event.request,{ignoreVary:true})).then(hit=>hit||fetch(event.request).catch(()=>event.request.mode==='navigate'?caches.match('/index.html'):Response.error())));});
`);
console.log(`Offline cache: ${assets.length} files (${cache})`);
