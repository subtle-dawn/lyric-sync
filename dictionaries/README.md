# ダウンロード済み辞書

- 英語：`cmudict/cmudict.dict`。CMUdict、コミット `74790861f652b15e4ac49015a90074ad62a27690`。配布元：https://github.com/cmusphinx/cmudict 。著作権・利用条件は同じフォルダの `LICENSE` に保存。
- 日本語：`../vendor/kuromoji/dict/`。kuromoji.js 0.1.2に同梱されたMeCab IPADICのバイナリ辞書。ブラウザー用JSも `../vendor/kuromoji/build/kuromoji.js` に保存。配布元：https://github.com/takuyaa/kuromoji.js 。ライブラリの利用条件は `LICENSE-2.0.txt`、辞書の著作権・利用条件は `NOTICE.md` に保存。

取得元・バージョン・整合性情報は `sources.json` に記録。日本語の元配布アーカイブも `../vendor/kuromoji-0.1.2.tgz` に保持しています。

`counter.js` からアプリのカウント処理に接続しています。CMUdictは発音に含まれる母音を数え、IPADICは日本語の読み取得に使用します。辞書は各行の歌詞から判定した言語について初回のみ読み込みます。ブラウザーから辞書を読み込む際はHTTP経由で静的ファイルを配信してください。サーバーは起動していません。
