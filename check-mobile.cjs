const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const app=fs.readFileSync('app.js','utf8');
for(const cryptoMode of ['http','legacy']){
  const nodes=new Map();
  const node=key=>{
    if(!nodes.has(key))nodes.set(key,{innerHTML:'',value:'',textContent:'',style:{setProperty(){}},dataset:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},addEventListener(){},getBoundingClientRect:()=>({height:110}),showModal(){this.open=true},close(){this.open=false},focus(){},scrollIntoView(){}});
    return nodes.get(key);
  };
  const buttons=['ja','en'].map(lang=>({...node(lang),dataset:{lang}}));
  const document={querySelector:node,querySelectorAll:key=>key==='[data-lang]'?buttons:[],getElementById:node,documentElement:{style:{setProperty(){}}},body:node('body')};
  let saved;
  const ctx={document,window:{addEventListener(){}},crypto:cryptoMode==='http'?{getRandomValues:crypto.getRandomValues.bind(crypto)}:undefined,localStorage:{getItem:()=>null,setItem:(key,value)=>saved=value},console,setTimeout(){},clearTimeout(){},FormData:class{get(key){return key==='name'?'New Part':'4'}},LyricCounter:{language:()=> 'en',load:()=>Promise.resolve(),analyze:()=>({count:0,lang:'en'})}};
  vm.createContext(ctx);
  vm.runInContext(fs.readFileSync('compatibility.js','utf8')+'\n'+fs.readFileSync('i18n.js','utf8')+'\n'+app,ctx);
  assert(node('#editor').innerHTML.includes('Verse 1'));
  assert.equal(node('.title-label').textContent,'タイトル');
  node('#add-section').onclick();assert.equal(node('#dialog').open,true);
  node('#dialog-form').onsubmit({preventDefault(){}});
  assert.equal(vm.runInContext('state.sections.length',ctx),2);
  vm.runInContext('duplicateSection(state.sections[0])',ctx);
  assert.equal(vm.runInContext('state.sections.length',ctx),3);
  assert.equal(vm.runInContext('new Set(state.sections.map(s=>s.id)).size',ctx),3);
  assert.equal(JSON.parse(saved).sections.length,3);
  buttons[1].onclick();assert.equal(node('.title-label').textContent,'Title');
  node('#reset-song').onclick();node('#dialog-form').onsubmit({preventDefault(){}});
  assert.equal(vm.runInContext('state.sections.length',ctx),1);
  console.log(cryptoMode+': startup, section add/duplicate, save, language switching and reset passed without randomUUID / structuredClone / ResizeObserver');
}
