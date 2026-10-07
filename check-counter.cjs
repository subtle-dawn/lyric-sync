const fs=require('fs'),vm=require('vm'),assert=require('assert');
// Exercise the shipped browser build and compressed dictionaries without a server.
class LocalXHR {
  open(method,url){this.url=url}
  send(){setImmediate(()=>{try{const data=fs.readFileSync(this.url);this.status=200;this.response=data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength);this.onload()}catch(error){this.onerror(error)}})}
}
const ctx={console,setTimeout,clearTimeout,setImmediate,XMLHttpRequest:LocalXHR,
  fetch:async path=>({ok:true,text:async()=>fs.readFileSync(path,'utf8')})};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('vendor/kuromoji/build/kuromoji.js','utf8'),ctx);
vm.runInContext(fs.readFileSync('counter.js','utf8')+'\nglobalThis.counter=LyricCounter;',ctx);
async function run(){
  const counter=ctx.counter;
  assert.equal(counter.analyze({text:'学校',reading:''},'ja').count,null);
  assert.equal(counter.analyze({text:'学校',reading:'がっこう'},'ja').count,4);
  await counter.load('en');
  for(const [text,count] of [['beautiful',3],['people',2],['breathe',1],["Tell me what you're looking for",7],['Close your eyes, breathe in slow',6],['I’ll make your pain begin to go',8],["'cause",1]]){
    const result=counter.analyze({text,reading:''},'en');
    assert.equal(result.count,count,text);assert.equal(result.estimated,false,text);
  }
  assert.equal(counter.analyze({text:'zzyyxxword',reading:''},'en').estimated,true);
  const variants=counter.parseCMU('test T EH1 S T\ntest(2) T EH1 S T AH0\n').get('test');
  assert.equal(variants.join(','),'1,2');
  await counter.load('ja');
  for(const [text,count] of [['学校',4],['今日は学校へ行く',10],['東京',4],['キャット',3],['ミュージック',5],['ティー',2],['ｶﾞｯｺｳ',4],['きょう',2]]){
    const result=counter.analyze({text,reading:''},'ja');
    assert.equal(result.count,count,text+' / '+result.reading);
  }
  assert.equal(counter.analyze({text:'明日',reading:'あす'},'ja').count,2);
  assert.equal(counter.analyze({text:'明日',reading:'あした'},'ja').count,3);
  assert.equal(counter.analyze({text:'学校',reading:'学校'},'ja').count,null);
  const line={text:'東京',reading:''};counter.analyze(line,'ja');assert.equal(line.reading,'');
  assert.equal(counter.analyze({text:'学校',reading:''},'ja').count,4);
  for(const [text,lang,count] of [['学校','ja',4],['beautiful','en',3],['きょう','ja',2],['Ｔｅｌｌ ｍｅ','en',2]]){
    const result=counter.analyze({text,reading:''});assert.equal(result.lang,lang);assert.equal(result.count,count);
  }
  assert.equal(counter.analyze({text:'beautiful',reading:'がっこう'}).lang,'en');
  assert.equal(counter.analyze({text:'君とlove',reading:'きみとらぶ'}).count,5);
  assert.equal(counter.analyze({text:'君とlove',reading:''}).lang,'ja');
  assert.equal(counter.analyze({text:'学校',reading:''},'ja').reading,'がっこう');
  assert.equal(counter.analyze({text:'ミュージック',reading:''},'ja').reading,'みゅーじっく');
  assert.equal(counter.analyze({text:'学校',reading:'ガッコウ'},'ja').reading,'ガッコウ');
  console.log('Real CMUdict and browser kuromoji: syllables, morae, loading, overrides and unknown words passed');
}
run().catch(error=>{console.error(error);process.exitCode=1});
