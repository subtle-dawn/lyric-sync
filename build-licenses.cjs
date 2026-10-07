const fs=require('fs');
const escape=text=>text.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const licenses=[
  {name:'CMUdict',source:'https://github.com/cmusphinx/cmudict',path:'dictionaries/cmudict/LICENSE',credit:'Carnegie Mellon University — English pronunciation dictionary'},
  {name:'kuromoji.js 0.1.2 — Apache License 2.0',source:'https://github.com/takuyaa/kuromoji.js',path:'vendor/kuromoji/LICENSE-2.0.txt',credit:'Takuya Asano — JavaScript morphological analyzer'},
  {name:'MeCab IPADIC — Copyright and notices',source:'https://github.com/takuyaa/kuromoji.js/blob/master/NOTICE.md',path:'vendor/kuromoji/NOTICE.md',credit:'Nara Institute of Science and Technology / ICOT — Japanese dictionary'}
];
fs.writeFileSync('licenses.html',`<!doctype html>
<html lang="ja"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Licenses — Lyric Sync</title><link rel="icon" type="image/png" href="assets/lyric-sync-icon.png"><link rel="stylesheet" href="style.css"><style>
.license-page{max-width:960px;margin:0 auto;padding:36px 20px}.license-page h1{font-size:26px;margin:24px 0}.license-page p{font-size:13px;color:#8492aa;line-height:1.8}.license-page a{color:#6386c5}.license-page section{background:white;border:1px solid #e3e8f1;border-radius:12px;margin:22px 0;padding:24px}.license-page pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.8 monospace;color:#58657d}.license-page h2{margin-bottom:10px}
</style></head><body><main class="license-page"><a id="back" href="index.html">← アプリに戻る</a><h1 id="heading">ライセンス</h1><p id="description">Lyric Syncで使用している辞書・ライブラリの著作権表示、ライセンスおよび免責事項です。原文を掲載しています。</p>
${licenses.map(item=>`<section><h2>${escape(item.name)}</h2><p>${escape(item.credit)}</p><a href="${item.source}" target="_blank" rel="noopener noreferrer">${escape(item.source)}</a><pre lang="en">${escape(fs.readFileSync(item.path,'utf8'))}</pre></section>`).join('\n')}
<script>if(new URLSearchParams(location.search).get('lang')==='en'){document.documentElement.lang='en';document.getElementById('back').textContent='← Back to app';document.getElementById('heading').textContent='Licenses';document.getElementById('description').textContent='Copyright notices, licenses and disclaimers for the dictionaries and libraries used by Lyric Sync. Original texts are reproduced below.'}</script></main></body></html>`);
console.log('License page generated from original license files');
