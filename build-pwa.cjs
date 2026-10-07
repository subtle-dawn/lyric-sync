const fs=require('fs'),crypto=require('crypto');
const assets=[
  'index.html','style.css','app.js','counter.js','i18n.js','compatibility.js','pwa.js',
  'manifest.webmanifest','licenses.html','assets/lyric-sync-icon.png',
  'assets/icons/icon-180.png','assets/icons/icon-192.png','assets/icons/icon-512.png',
  'vendor/kuromoji/build/kuromoji.js','vendor/kuromoji/LICENSE-2.0.txt','vendor/kuromoji/NOTICE.md',
  'dictionaries/cmudict/cmudict.dict','dictionaries/cmudict/LICENSE',
  ...fs.readdirSync('vendor/kuromoji/dict').filter(name=>name.endsWith('.dat.gz')).sort().map(name=>'vendor/kuromoji/dict/'+name)
];
const hash=crypto.createHash('sha256');
for(const path of assets){hash.update(path);hash.update(fs.readFileSync(path))}
const template=fs.readFileSync('sw-template.js','utf8');hash.update(template);
const version=hash.digest('hex').slice(0,16);
fs.writeFileSync('sw.js',template.replace('__VERSION__',version).replace('__ASSETS__',JSON.stringify(assets,null,2)));
console.log('PWA cache '+version+': '+assets.length+' local files');
