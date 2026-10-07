const englishUI = {
  'ライセンス':'Licenses',
  '曲を初期化':'Reset song','曲を初期化しますか？':'Reset this song?',
  'タイトル・すべてのパート・歌詞・よみがなを削除し、空の曲に戻します。':'Delete the title, all sections, lyrics and readings, and start with an empty song.',
  'キャンセル':'Cancel','初期化する':'Reset','曲を初期化しました':'Song reset.',
  '音節':'syllables','モーラ':'morae',
  '読みが必要':'Enter a kana reading to count this line. Dictionary loading or an unknown word may prevent automatic reading.',
  '辞書外推定':'Estimated: includes words not found in the pronunciation dictionary.',
  '複数発音':'This line includes words with different syllable counts across pronunciations. The first dictionary pronunciation is used.',
  '辞書カウント':'Counted from dictionary pronunciation or kana reading.',
  '読み自動説明':'Automatic pronunciation is shown as a hint. Enter a kana reading to override it.',
  '辞書読込失敗':'Could not load the local dictionary. Serve this folder over HTTP. English uses estimates; enter kana readings for Japanese.',
  'タイトル':'Title','曲のタイトル':'Song title','分析言語':'Language','曲の構成':'Song Structure','曲のセクション':'Song sections',
  'セクションを追加':'Add section','新しいセクションを追加':'Add new section','閉じる':'Close','パート名':'Part name',
  '比較なし':'No comparison','複製':'Duplicate','削除':'Delete','パートを複製':'Duplicate section','パートを削除':'Delete section',
  'ドラッグで並び替え':'Drag to reorder','行を追加':'Add line','行':'lines','歌詞を入力…':'Write your next line…',
  'よみがな':'Reading (kana)','新しいセクション':'New section','セクション名':'Section name','行数':'Number of lines','追加':'Add',
  'セクションは1つ以上必要です':'At least one section is required.','セクションを削除':'Delete section','削除する':'Delete',
  '各セクションには1行以上必要です':'Each section needs at least one line.','行を削除':'Delete line',
  'エクスポート':'Export','インポート':'Import','テキスト':'Text',
  'JSONは読みも保存し、再び読み込めます。':'JSON also saves readings and can be imported again.',
  'ファイルを読み込む':'Import file','読み込む':'Import','残したい歌詞は先にエクスポートしてください。':'Export any lyrics you want to keep first.',
  'ファイルを読み込みました':'File imported.','ファイルは5MB以下にしてください':'Please choose a file smaller than 5 MB.',
  '読み込めませんでした：':'Could not import: ',
  'ブラウザーに保存できません。ファイルに書き出してください。':'Could not save in this browser. Please export your song.',
  'ファイル形式が正しくありません':'Invalid file format.','セクションの形式が正しくありません':'Invalid section format.',
  '歌詞の形式が正しくありません':'Invalid lyric format.','基準の形式が正しくありません':'Invalid comparison pattern.',
  '歌詞が見つかりません':'No lyrics found.',
  '並び替え説明':'Reorder {name} (or use the up/down arrow keys)',
  '比較先':'Compare with {name}','比較ラベル':'Comparison for {name}',
  '歌詞ラベル':'{name}, line {line} lyrics','読みラベル':'Line {line} reading',
  '行複製ラベル':'Duplicate line {line}','行削除ラベル':'Delete line {line}',
  '行並び替えラベル':'Reorder line {line} (or use the up/down arrow keys)',
  'パート削除確認':'Delete “{name}” and all its lyrics?',
  '行削除確認':'Delete line {line}: “{text}”?',
  'インポート確認':'Replace the current song with “{name}”?','コピー接尾辞':' (copy)'
};
const japaneseTemplates={
  '読みが必要':'かなの読みを入力してください。辞書の読み込み中や未知語では自動で読めない場合があります。',
  '辞書外推定':'推定値です。発音辞書にない単語を含みます。',
  '複数発音':'発音によって音節数が異なる単語があります。辞書の最初の発音を使用しています。',
  '辞書カウント':'辞書の発音またはかなの読みからカウントしています。',
  '読み自動説明':'自動で取得した発音をヒントとして表示します。読みを入力すると手入力を優先します。',
  '辞書読込失敗':'ローカル辞書を読み込めません。HTTPで配信してください。英語は推定、日本語はかなの読み入力でカウントできます。',
  '並び替え説明':'{name}を並び替え（上下キーでも移動）','比較先':'{name} と比較','比較ラベル':'{name}の比較パターン',
  '歌詞ラベル':'{name} {line}行目の歌詞','読みラベル':'{line}行目の読み','行複製ラベル':'{line}行目を複製',
  '行削除ラベル':'{line}行目を削除','行並び替えラベル':'{line}行目を並び替え（上下キーでも移動）',
  'パート削除確認':'「{name}」と、その歌詞を削除します。','行削除確認':'{line}行目「{text}」を削除します。',
  'インポート確認':'現在の曲を「{name}」に置き換えます。','コピー接尾辞':'（複製）'
};
function t(key,values={}){const template=state.lang==='en'?(englishUI[key]||key):(japaneseTemplates[key]||key);return template.replace(/\{(\w+)\}/g,(_,name)=>values[name]??'')}
function localizeShell(){
  document.documentElement.lang=state.lang;
  document.querySelector('.title-label').textContent=t('タイトル');
  const title=document.querySelector('#title');title.placeholder=t('曲のタイトル');title.setAttribute('aria-label',t('曲のタイトル'));
  document.querySelector('.language').setAttribute('aria-label',t('分析言語'));
  document.querySelectorAll('[data-lang]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.lang===state.lang)));
  document.querySelector('.sidebar-label').textContent=t('曲の構成');
  document.querySelector('#sections').setAttribute('aria-label',t('曲のセクション'));
  document.querySelector('#add-section span').textContent=t('セクションを追加');
  document.querySelector('#bottom-add').textContent='＋ '+t('新しいセクションを追加');
  document.querySelector('#close-dialog').setAttribute('aria-label',t('閉じる'));
  const licenseLink=document.querySelector('#licenses-link');
  licenseLink.textContent=t('ライセンス');licenseLink.href='licenses.html?lang='+state.lang;
  for(const [id,key] of [['import','インポート'],['export','エクスポート'],['reset-song','曲を初期化']]){const button=document.getElementById(id);button.title=t(key);button.setAttribute('aria-label',t(key))}
}
