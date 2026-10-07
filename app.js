const STORAGE='lyric-sync-v1';
const colors=[['#6999ed','#edf3fe'],['#80b9ac','#edf7f3'],['#d9a08f','#fcf1ed'],['#a894d4','#f4effb'],['#d692b3','#fcf0f6'],['#d4b276','#fbf6eb']];
const makeLine=(text='')=>({text,reading:''});
const makeSection=(name,lines=4)=>({id:createSectionId(),name,lines:Array.from({length:lines},()=>makeLine()),baseline:null,reference:null});
const initial=()=>({title:'',lang:'ja',options:{counts:true,dots:true,readings:true},sections:[makeSection('Verse 1',4)]});
let state=initial();try{state=validate(JSON.parse(localStorage.getItem(STORAGE)))}catch{state=initial()}let active=state.sections[0].id;let timer;
const $=s=>document.querySelector(s);const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validate(s){if(!s||typeof s.title!=='string'||!['en','ja'].includes(s.lang)||!Array.isArray(s.sections)||!s.sections.length||s.sections.length>100)throw Error(t('ファイル形式が正しくありません'));const ids=new Set();for(const sec of s.sections){if(typeof sec.id!=='string'||ids.has(sec.id)||typeof sec.name!=='string'||!Array.isArray(sec.lines)||!sec.lines.length||sec.lines.length>500)throw Error(t('セクションの形式が正しくありません'));ids.add(sec.id);for(const l of sec.lines){if(typeof l.text!=='string')throw Error(t('歌詞の形式が正しくありません'));l.reading=typeof l.reading==='string'?l.reading:''}if(sec.baseline!==null&&sec.baseline!==undefined&&(!Array.isArray(sec.baseline)||!sec.baseline.every(n=>Number.isInteger(n)&&n>=0&&n<=1000)))throw Error(t('基準の形式が正しくありません'))}s.options={counts:true,dots:true,readings:true,...s.options};return s}
function count(line){return LyricCounter.analyze(line).count}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(state));}catch{toast(t('ブラウザーに保存できません。ファイルに書き出してください。'))}}
function changed(){ clearTimeout(timer);timer=setTimeout(save,300)}
function toast(t){$('#toast').textContent=t;$('#toast').classList.add('visible');setTimeout(()=>$('#toast').classList.remove('visible'),3000)}
function baseline(sec){return state.sections.find(s=>s.id===sec.reference)?.lines.map(line=>LyricCounter.analyze(line))}
function render(){ localizeShell(); $('#title').value=state.title;document.querySelectorAll('[data-lang]').forEach(b=>b.classList.toggle('active',b.dataset.lang===state.lang));document.body.classList.toggle('hide-counts',!state.options.counts);document.body.classList.toggle('hide-dots',!state.options.dots);$('#sections').innerHTML=state.sections.map((s,i)=>`<button class="section-tab ${active===s.id?'active':''}" data-jump="${esc(s.id)}" style="--accent:${colors[i%6][0]}"><span class="drag-handle" draggable="true" role="button" tabindex="0" aria-label="${esc(t('並び替え説明',{name:s.name}))}" title="${esc(t('ドラッグで並び替え'))}">≡</span><strong>${esc(s.name)}</strong><small>${s.lines.length} ${t('行')}</small></button>`).join('');$('#editor').innerHTML=state.sections.map((s,i)=>`<section class="section-card" id="section-${esc(s.id)}" data-id="${esc(s.id)}" style="--accent:${colors[i%6][0]};--tint:${colors[i%6][1]}"><div class="card-header"><span class="section-mark"></span><input class="section-name" aria-label="${esc(t('パート名'))}" maxlength="80" value="${esc(s.name)}"><div class="card-tools"><select class="baseline-select" data-reference="${esc(s.id)}" aria-label="${esc(t('比較ラベル',{name:s.name}))}"><option value="">${t('比較なし')}</option>${state.sections.filter(x=>x.id!==s.id).map(x=>`<option value="${esc(x.id)}" ${s.reference===x.id?'selected':''}>${esc(t('比較先',{name:x.name}))}</option>`).join('')}</select><button class="part-action action-icon" data-duplicate-section="${esc(s.id)}" title="${esc(t('複製'))}" aria-label="${esc(t('パートを複製'))}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/></svg></button><button class="part-action danger action-icon" data-delete-section="${esc(s.id)}" title="${esc(t('削除'))}" aria-label="${esc(t('パートを削除'))}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14M10 10v7M14 10v7"/></svg></button></div></div><div class="lyric-group">${s.lines.map((l,j)=>`<div class="lyric-row" data-line="${j}"><span class="line-num">${j+1}</span><input class="line-input" aria-label="${esc(t('歌詞ラベル',{name:s.name,line:j+1}))}" placeholder="${state.lang==='en'?'Write your next line…':'歌詞を入力…'}" value="${esc(l.text)}">${LyricCounter.language(l)==='ja'&&state.options.readings?`<input class="reading-input" aria-label="${esc(t('読みラベル',{line:j+1}))}" placeholder="${esc(t('よみがな'))}" value="${esc(l.reading)}">`:''}<span class="count"></span><span class="dots" aria-hidden="true"></span><span class="line-actions"><button class="line-action duplicate-line action-icon" aria-label="${esc(t('行複製ラベル',{line:j+1}))}" title="${esc(t('複製'))}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4"/></svg></button><button class="line-action delete-line danger action-icon" aria-label="${esc(t('行削除ラベル',{line:j+1}))}" title="${esc(t('削除'))}"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M5 6l1 14a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1l1-14M10 10v7M14 10v7"/></svg></button><button class="line-drag" draggable="true" aria-label="${esc(t('行並び替えラベル',{line:j+1}))}" title="${esc(t('ドラッグで並び替え'))}">≡</button></span></div>`).join('')}</div><button class="add-line" data-add-line="${esc(s.id)}">＋ ${t('行を追加')}</button></section>`).join('');updateCounts()}
function updateCounts(){
  state.sections.forEach(section=>section.lines.forEach(line=>{if(line.text.trim()||line.reading.trim())ensureDictionary(LyricCounter.language(line))}));
  document.querySelectorAll('.section-card').forEach(card=>{
    const section=state.sections.find(s=>s.id===card.dataset.id),target=baseline(section);
    card.querySelectorAll('.lyric-row').forEach(row=>{
      const index=Number(row.dataset.line),line=section.lines[index],analysis=LyricCounter.analyze(line),n=analysis.count;
      const expected=target?.[index]?.lang===analysis.lang?target[index].count??undefined:undefined;
      const c=row.querySelector('.count');
      c.textContent=`${n===null?(analysis.status==='loading'?'…':'?'):(analysis.estimated?'≈ ':'')+n} ${t(analysis.lang==='en'?'音節':'モーラ')}`;
      c.title=t(n===null?'読みが必要':analysis.estimated?'辞書外推定':analysis.ambiguous?'複数発音':'辞書カウント');
      let readingInput=row.querySelector('.reading-input');
      if(analysis.lang==='ja'&&state.options.readings){
        if(!readingInput){readingInput=document.createElement('input');readingInput.className='reading-input';readingInput.value=line.reading;row.insertBefore(readingInput,c)}
        readingInput.setAttribute('aria-label',t('読みラベル',{line:index+1}));
        readingInput.placeholder=n!==null&&line.text?analysis.reading:t('よみがな');readingInput.title=t('読み自動説明');
      }else readingInput?.remove();
      const missingReferenceLine=!!target&&index>=target.length;
      c.classList.toggle('mismatch',missingReferenceLine||(n!==null&&expected!==undefined&&n!==expected&&!!line.text));
      row.querySelector('.dots').innerHTML=Array.from({length:n===null?0:Math.min(Math.max(n,expected||0),32)},(_,k)=>`<i class="dot ${k>=n?'empty':missingReferenceLine||(expected!==undefined&&k>=expected)?'extra':''}"></i>`).join('');
    });
  });
}
function openDialog(title,body,actions,onSubmit){$('#dialog-title').textContent=title;$('#dialog-body').innerHTML=body;$('#dialog-actions').innerHTML=actions;$('#dialog-form').onsubmit=e=>{e.preventDefault();onSubmit?.(new FormData(e.target))};$('#dialog').showModal()}
$('#close-dialog').onclick=()=>$('#dialog').close();
function sectionDialog(){openDialog(t('新しいセクション'),`<label>${t('セクション名')}<input type="text" name="name" value="Verse ${state.sections.length+1}" required maxlength="80"></label><label>${t('行数')}<input name="lines" type="number" value="4" min="1" max="64" required></label>`,`<button class="primary" type="submit">${t('追加')}</button>`,data=>{const name=data.get('name').trim();if(!name)return;const s=makeSection(name,Number(data.get('lines')));state.sections.push(s);active=s.id;save();render();$('#dialog').close();jump(active)})}
function deleteSection(sec){if(state.sections.length===1)return toast(t('セクションは1つ以上必要です'));openDialog(t('セクションを削除'),`<p>${esc(t('パート削除確認',{name:sec.name}))}</p>`,`<button class="danger" type="submit">${t('削除する')}</button>`,()=>{state.sections=state.sections.filter(s=>s!==sec);state.sections.forEach(s=>{if(s.reference===sec.id)s.reference=null});if(active===sec.id)active=state.sections[0].id;save();render();$('#dialog').close()})}
function duplicateSection(sec){const copy=cloneSongData(sec);copy.id=createSectionId();copy.name+=t('コピー接尾辞');state.sections.splice(state.sections.indexOf(sec)+1,0,copy);active=copy.id;save();render();jump(active)}
function jump(id){active=id;document.querySelectorAll('[data-jump]').forEach(b=>b.classList.toggle('active',b.dataset.jump===id));document.getElementById('section-'+id)?.scrollIntoView({behavior:'smooth',block:'start'})}
$('#sections').onclick=e=>{const b=e.target.closest('[data-jump]');if(b&&!e.target.closest('.drag-handle'))jump(b.dataset.jump)};
$('#add-section').onclick=$('#bottom-add').onclick=()=>sectionDialog();
$('#title').oninput=e=>{state.title=e.target.value;changed()};
document.querySelectorAll('[data-lang]').forEach(b=>b.onclick=()=>{state.lang=b.dataset.lang;save();render()});
$('#editor').oninput=e=>{const card=e.target.closest('.section-card'),row=e.target.closest('.lyric-row');if(!card)return;const s=state.sections.find(s=>s.id===card.dataset.id);if(e.target.matches('.section-name')){s.name=e.target.value;changed();syncNames();return}if(!row)return;s.lines[Number(row.dataset.line)][e.target.classList.contains('reading-input')?'reading':'text']=e.target.value;changed();updateCounts()};
$('#editor').onchange=e=>{if(e.target.matches('[data-reference]')){state.sections.find(s=>s.id===e.target.dataset.reference).reference=e.target.value||null;save();updateCounts()}};
$('#editor').onclick=e=>{const b=e.target.closest('button');if(!b)return;const s=state.sections.find(s=>s.id===b.closest('.section-card').dataset.id);if(b.dataset.deleteSection)deleteSection(s);else if(b.dataset.duplicateSection)duplicateSection(s);else if(b.dataset.addLine){s.lines.push(makeLine());save();render();document.getElementById('section-'+s.id).querySelectorAll('.line-input')[s.lines.length-1].focus()}else if(b.classList.contains('duplicate-line')){duplicateLine(s.id,Number(b.closest('.lyric-row').dataset.line))}else if(b.classList.contains('delete-line')){if(s.lines.length===1)return toast(t('各セクションには1行以上必要です'));const j=Number(b.closest('.lyric-row').dataset.line);if(s.lines[j].text||s.lines[j].reading){openDialog(t('行を削除'),`<p>${esc(t('行削除確認',{line:j+1,text:s.lines[j].text}))}</p>`,`<button class="danger" type="submit">${t('削除する')}</button>`,()=>{s.lines.splice(j,1);save();render();$('#dialog').close()})}else{s.lines.splice(j,1);save();render()}}};
function download(content,type,extension){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=(state.title||'Untitled Song').replace(/[<>:"/\\|?*]/g,'_')+'.'+extension;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
$('#export').onclick=()=>{openDialog(t('エクスポート'),`<p class="dialog-help">${t('JSONは読みも保存し、再び読み込めます。')}</p><button type="button" class="dialog-option" id="export-json">JSON</button><button type="button" class="dialog-option" id="export-text">${t('テキスト')}</button>`,'');$('#export-json').onclick=()=>{download(JSON.stringify(state,null,2),'application/json','json');$('#dialog').close()};$('#export-text').onclick=()=>{download(state.sections.map(s=>'['+s.name+']\n'+s.lines.map(l=>l.text).join('\n')).join('\n\n'),'text/plain;charset=utf-8','txt');$('#dialog').close()}};
$('#import').onclick=()=>$('#file-input').click();$('#file-input').onchange=async e=>{const file=e.target.files[0];if(!file)return;try{if(file.size>5000000)throw Error(t('ファイルは5MB以下にしてください'));const text=await file.text();let next;if(file.name.toLowerCase().endsWith('.json'))next=validate(JSON.parse(text));else next=parseTextProject(text,file.name);openDialog(t('ファイルを読み込む'),`<p>${esc(t('インポート確認',{name:next.title}))}</p><p class="dialog-help">${t('残したい歌詞は先にエクスポートしてください。')}</p>`,`<button type="submit" class="primary">${t('読み込む')}</button>`,()=>{state=next;active=state.sections[0].id;save();render();$('#dialog').close();toast(t('ファイルを読み込みました'))})}catch(err){toast(t('読み込めませんでした：')+err.message)}finally{e.target.value=''}};
const dictionaryRequests=new Set();
render();

if(typeof ResizeObserver!=="undefined"){new ResizeObserver(([entry])=>document.documentElement.style.setProperty("--header-height",entry.target.getBoundingClientRect().height+"px")).observe($(".topbar"));}else{const updateHeaderHeight=()=>document.documentElement.style.setProperty("--header-height",$(".topbar").getBoundingClientRect().height+"px");updateHeaderHeight();window.addEventListener("resize",updateHeaderHeight)}

function syncNames(){state.sections.forEach(s=>{const tab=document.querySelector('[data-jump="'+s.id+'"]');tab.querySelector('strong').textContent=s.name;tab.querySelector('.drag-handle').setAttribute('aria-label',t('並び替え説明',{name:s.name}));document.querySelectorAll('[data-reference] option').forEach(o=>{if(o.value===s.id)o.textContent=t('比較先',{name:s.name})})})}
function moveSection(id,targetId,after){if(id===targetId)return;const from=state.sections.findIndex(s=>s.id===id);if(from<0)return;const [section]=state.sections.splice(from,1);const to=state.sections.findIndex(s=>s.id===targetId);state.sections.splice(to+(after?1:0),0,section);save();render()}
let draggedSection=null;
$('#sections').addEventListener('dragstart',e=>{const handle=e.target.closest('.drag-handle');if(!handle){e.preventDefault();return}draggedSection=handle.closest('[data-jump]').dataset.jump;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',draggedSection);handle.closest('.section-tab').classList.add('dragging')});
$('#sections').addEventListener('dragover',e=>{const tab=e.target.closest('[data-jump]');if(!tab||!draggedSection)return;e.preventDefault();e.dataTransfer.dropEffect='move';document.querySelectorAll('.drop-before,.drop-after').forEach(t=>t.classList.remove('drop-before','drop-after'));const r=tab.getBoundingClientRect();const after=window.innerWidth<=760?e.clientX>r.left+r.width/2:e.clientY>r.top+r.height/2;tab.classList.add(after?'drop-after':'drop-before')});
$('#sections').addEventListener('drop',e=>{e.preventDefault();const tab=e.target.closest('[data-jump]');if(tab&&draggedSection)moveSection(draggedSection,tab.dataset.jump,tab.classList.contains('drop-after'));draggedSection=null});
$('#sections').addEventListener('dragend',()=>{draggedSection=null;document.querySelectorAll('.dragging,.drop-before,.drop-after').forEach(t=>t.classList.remove('dragging','drop-before','drop-after'))});
$('#sections').addEventListener('keydown',e=>{if(!e.target.matches('.drag-handle')||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const id=e.target.closest('[data-jump]').dataset.jump;const index=state.sections.findIndex(s=>s.id===id);const target=state.sections[index+(e.key==='ArrowUp'?-1:1)];if(target){moveSection(id,target.id,e.key==='ArrowDown');document.querySelector('[data-jump="'+id+'"] .drag-handle').focus()}});

function duplicateLine(id,index){const s=state.sections.find(s=>s.id===id);s.lines.splice(index+1,0,cloneSongData(s.lines[index]));save();render();document.getElementById('section-'+id).querySelectorAll('.line-input')[index+1].focus()}
function moveLine(id,from,to,after=false){const s=state.sections.find(s=>s.id===id);if(!s||from===to||from<0||to<0||from>=s.lines.length||to>=s.lines.length)return;const [line]=s.lines.splice(from,1);const destination=to-(from<to?1:0)+(after?1:0);s.lines.splice(destination,0,line);save();render();return destination}
let draggedLine=null;
function clearLineDrag(){document.querySelectorAll('.line-dragging,.line-drop-before,.line-drop-after').forEach(row=>row.classList.remove('line-dragging','line-drop-before','line-drop-after'))}
$('#editor').addEventListener('dragstart',e=>{const handle=e.target.closest('.line-drag');if(!handle){e.preventDefault();return}const row=handle.closest('.lyric-row');draggedLine={id:row.closest('.section-card').dataset.id,index:Number(row.dataset.line)};e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',JSON.stringify(draggedLine));row.classList.add('line-dragging')});
$('#editor').addEventListener('dragover',e=>{const row=e.target.closest('.lyric-row');if(!row||!draggedLine||row.closest('.section-card').dataset.id!==draggedLine.id)return;e.preventDefault();e.dataTransfer.dropEffect='move';document.querySelectorAll('.line-drop-before,.line-drop-after').forEach(r=>r.classList.remove('line-drop-before','line-drop-after'));const rect=row.getBoundingClientRect();row.classList.add(e.clientY>rect.top+rect.height/2?'line-drop-after':'line-drop-before')});
$('#editor').addEventListener('drop',e=>{if(!draggedLine)return;e.preventDefault();const row=e.target.closest('.lyric-row');if(row&&row.closest('.section-card').dataset.id===draggedLine.id)moveLine(draggedLine.id,draggedLine.index,Number(row.dataset.line),row.classList.contains('line-drop-after'));draggedLine=null;clearLineDrag()});
$('#editor').addEventListener('dragend',()=>{draggedLine=null;clearLineDrag()});
$('#editor').addEventListener('keydown',e=>{if(!e.target.matches('.line-drag')||!['ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const row=e.target.closest('.lyric-row'),id=row.closest('.section-card').dataset.id,index=Number(row.dataset.line);const destination=moveLine(id,index,index+(e.key==='ArrowUp'?-1:1),e.key==='ArrowDown');if(destination!==undefined)document.getElementById('section-'+id).querySelectorAll('.line-drag')[destination].focus()});

function parseTextProject(text,filename){
  const normalized=text.replace(/^﻿/,'').replace(/\r\n?/g,'\n');
  const headers=[...normalized.matchAll(/^\[([^\n]+)\](?:\n|$)/gm)];
  let sections;
  if(headers.length){
    sections=headers.map((header,index)=>{
      const start=header.index+header[0].length;
      const end=headers[index+1]?.index??normalized.length;
      let lyrics=normalized.slice(start,end);
      // Remove only the export separator, preserving empty lyric rows.
      if(index<headers.length-1&&lyrics.endsWith('\n\n'))lyrics=lyrics.slice(0,-2);
      const section=makeSection(header[1],1);
      section.lines=lyrics.split('\n').map(makeLine);
      return section;
    });
  }else{
    if(!normalized.trim())throw Error(t('歌詞が見つかりません'));
    const section=makeSection('Verse 1',1);
    section.lines=normalized.split('\n').map(makeLine);
    sections=[section];
  }
  return validate({title:filename.replace(/\.txt$/i,''),lang:state.lang,options:{...state.options},sections});
}

function ensureDictionary(lang){if(dictionaryRequests.has(lang))return;dictionaryRequests.add(lang);LyricCounter.load(lang).then(updateCounts).catch(()=>{updateCounts();toast(t('辞書読込失敗'))})}

$('#reset-song').onclick=()=>{
  openDialog(t('曲を初期化しますか？'),`<p>${t('タイトル・すべてのパート・歌詞・よみがなを削除し、空の曲に戻します。')}</p><p class="dialog-help">${t('残したい歌詞は先にエクスポートしてください。')}</p>`,
    `<button type="submit" class="danger">${t('初期化する')}</button>`,()=>{
      clearTimeout(timer);
      state={title:'',lang:state.lang,options:{...state.options},sections:[makeSection('Verse 1',4)]};
      active=state.sections[0].id;
      save();render();$('#dialog').close();$('#title').focus();toast(t('曲を初期化しました'));
    });
};
