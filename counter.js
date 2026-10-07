// Local dictionaries only; lyrics are never sent to an external service.
const LyricCounter = (() => {
  const dictionaries = { en: null, ja: null };
  const status = { en: 'idle', ja: 'idle' };
  const pending = {};
  const cache = new Map();
  function parseCMU(text) {
    const dictionary = new Map();
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.startsWith(';;;')) continue;
      const fields = line.split(/\s+/);
      const word = fields.shift().replace(/\(\d+\)$/, '').toLowerCase();
      const n = fields.filter(phone => /[012]$/.test(phone)).length;
      if (!n) continue;
      if (!dictionary.has(word)) dictionary.set(word, []);
      if (!dictionary.get(word).includes(n)) dictionary.get(word).push(n);
    }
    return dictionary;
  }
  function load(lang) {
    if (pending[lang]) return pending[lang];
    status[lang] = 'loading';
    pending[lang] = (lang === 'en'
      ? fetch('dictionaries/cmudict/cmudict.dict').then(response => {
          if (!response.ok) throw Error('CMUdict: ' + response.status);
          return response.text();
        }).then(text => {
          const dictionary = parseCMU(text);
          if (dictionary.size < 100000) throw Error('Incomplete CMUdict');
          dictionaries.en = dictionary;
        })
      : new Promise((resolve, reject) => {
          if (typeof kuromoji === 'undefined') return reject(Error('kuromoji unavailable'));
          kuromoji.builder({ dicPath: 'vendor/kuromoji/dict/' }).build((error, tokenizer) => {
            if (error) return reject(error);
            dictionaries.ja = tokenizer;
            resolve();
          });
        })
    ).then(() => { status[lang] = 'ready'; cache.clear(); })
     .catch(error => { status[lang] = 'error'; cache.clear(); throw error; });
    return pending[lang];
  }
  function estimateEnglish(word) {
    const trimmed = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
    return Math.max(1, (trimmed.match(/[aeiouy]+/g) || []).length);
  }
  function normalizeReading(text) {
    return text.normalize('NFKC').replace(/[\s\p{P}\p{S}]/gu, '');
  }
  function toHiragana(text) {
    return text.normalize('NFKC').replace(/[ァ-ヶヽヾ]/g, char =>
      String.fromCharCode(char.charCodeAt(0) - 0x60));
  }
  function moraCount(text) {
    const reading = normalizeReading(text);
    if (!/^[\u3041-\u3096\u309d\u309e\u30a1-\u30fa\u30fd\u30feー]*$/.test(reading)) return null;
    let count = 0, previous = '';
    for (const char of reading) {
      // Small kana combine with the preceding full kana; standalone kana still count.
      const combines = /[ゃゅょャュョぁぃぅぇぉァィゥェォゎヮ]/.test(char)
        && previous && !/[んンっッーゃゅょャュョぁぃぅぇぉァィゥェォゎヮ]/.test(previous);
      if (!combines) count++;
      previous = char;
    }
    return count;
  }
  function language(line) {
    const text = line.text.normalize('NFKC');
    if (/[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text)) return 'ja';
    if (/[a-z]/i.test(text)) return 'en';
    return /[\p{Script=Hiragana}\p{Script=Katakana}]/u.test(line.reading || '') ? 'ja' : 'en';
  }
  function analyze(line, lang = language(line)) {
    const key = JSON.stringify([lang, line.text, line.reading, status[lang]]);
    if (cache.has(key)) return cache.get(key);
    let result;
    if (lang === 'en') {
      const text = line.text.normalize('NFKC').toLowerCase().replace(/[’‘]/g, "'");
      const words = text.match(/'?[a-z]+(?:'[a-z]+)*'?/g) || [];
      let count = 0, estimated = /[\p{L}\p{N}]/u.test(text.replace(/'?[a-z]+(?:'[a-z]+)*'?/g, '')), ambiguous = false;
      for (const word of words) {
        const alternatives = dictionaries.en?.get(word);
        if (alternatives) { count += alternatives[0]; ambiguous ||= alternatives.length > 1; }
        else { count += estimateEnglish(word); estimated = true; }
      }
      result = { count, estimated, ambiguous, reading: '', status: status.en };
    } else {
      let reading = line.reading.trim() ? line.reading : line.text;
      if (!line.reading.trim() && moraCount(line.text) === null && dictionaries.ja) {
        reading = dictionaries.ja.tokenize(line.text.normalize('NFKC')).map(token => {
          const reading = token.reading && token.reading !== '*' ? token.reading : token.pronunciation;
          return reading && reading !== '*' ? reading : token.surface_form;
        }).join('');
      }
      if (!line.reading.trim()) reading = toHiragana(reading);
      const count = moraCount(reading);
      result = { count, reading, estimated: count === null, ambiguous: false, status: status.ja };
    }
    result.lang = lang;
    if (cache.size >= 1000) cache.clear();
    cache.set(key, result);
    return result;
  }
  return { load, analyze, language, moraCount, parseCMU };
})();
