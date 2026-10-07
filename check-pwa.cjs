const fs=require('fs'),vm=require('vm'),assert=require('assert');
const manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
assert.equal(manifest.display,'standalone');
assert.equal(manifest.scope,'./');
for(const icon of manifest.icons){const png=fs.readFileSync(icon.src);assert.equal(icon.sizes,png.readUInt32BE(16)+'x'+png.readUInt32BE(20))}
const handlers={},storage=new Map(),deleted=[];
const origin='https://example.test/lyrics/';
let online=true,claimed=false;
async function network(request){if(!online)throw Error('offline');const url=new URL(typeof request==='string'?request:request.url);const path=decodeURIComponent(url.pathname.replace('/lyrics/',''));return new Response(fs.readFileSync(path))}
const caches={
  async open(name){if(!storage.has(name))storage.set(name,new Map());const data=storage.get(name);return {
    async addAll(requests){for(const request of requests)data.set(request.url,await network(request))},
    async match(url){return data.get(typeof url==='string'?url:url.url)?.clone()},
    async put(url,response){data.set(typeof url==='string'?url:url.url,response)}
  }},
  async keys(){return [...storage.keys()]},async delete(name){deleted.push(name);return storage.delete(name)}
};
storage.set('other-app-cache',new Map());storage.set('lyric-sync:/other/:old',new Map());storage.set('lyric-sync:/lyrics/:old',new Map());
const ctx={URL,Request,Response,caches,fetch:network,self:{registration:{scope:origin},clients:{async claim(){claimed=true}},addEventListener:(event,handler)=>handlers[event]=handler}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('sw.js','utf8'),ctx);
async function lifecycle(name){let work;handlers[name]({waitUntil:promise=>work=promise});await work}
async function cached(url){let work;handlers.fetch({request:{url,method:'GET'},respondWith:promise=>work=promise});return work?await work:null}
async function run(){
  await lifecycle('install');await lifecycle('activate');assert(claimed);
  assert(deleted.includes('lyric-sync:/lyrics/:old'));assert(!deleted.includes('other-app-cache'));assert(!deleted.includes('lyric-sync:/other/:old'));
  online=false;
  const page=await cached(origin);assert((await page.text()).includes('manifest.webmanifest'));
  assert((await (await cached(origin+'licenses.html?lang=en')).text()).includes('Apache License'));
  assert((await (await cached(origin+'dictionaries/cmudict/cmudict.dict')).text()).includes('beautiful'));
  assert((await (await cached(origin+'vendor/kuromoji/dict/tid.dat.gz')).arrayBuffer()).byteLength>0);
  assert.equal(await cached('https://fonts.googleapis.com/css2'),null);
  assert.equal(await cached('https://example.test/other/index.html'),null);
  assert.equal(await cached(origin+'not-found'),null);
  for(const secure of [true,false]){
    let registration;const listeners={};let saves=0;
    const client={navigator:{serviceWorker:{register:async(path,options)=>{registration={path,options}}}},window:{isSecureContext:secure,addEventListener:(key,handler)=>listeners[key]=handler},document:{visibilityState:'hidden',addEventListener:(key,handler)=>listeners[key]=handler},clearTimeout(){},timer:0,save:()=>saves++,console};
    vm.createContext(client);vm.runInContext(fs.readFileSync('pwa.js','utf8'),client);
    if(listeners.load)listeners.load();assert.equal(!!registration,secure);
    listeners.pagehide();listeners.visibilitychange();assert.equal(saves,2);
  }
  console.log('PWA manifest/icons, offline app/licenses/dictionaries, scoped cache cleanup, secure registration and save flush passed');
}
run().catch(error=>{console.error(error);process.exitCode=1});
