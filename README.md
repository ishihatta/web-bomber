# これは何？
ブラウザで動作する簡単な対戦2Dアクションゲームです。キーボードで操作するためスマホやタブレットでは遊べません。

[以前 Kotlin で書いたゲーム](https://github.com/ishihatta/kotlin-bomber/) の Web フロントエンドへの移植になります。

# ゲームの内容
二人対戦専用のボン○ーマンです。人間対人間、人間対AI、AI対AIの対戦ができます。ルールは以下の通りです。

* アイテムは火力アップのみ
* 爆弾は無限に置ける
* 死んだら負け

# プレイ動画
[プレイ動画（AI vs AI）](https://github.com/ishihatta/web-bomber/assets/40629744/b3f485d1-f1a8-4673-a75c-dd60062f4c69)

# 操作方法（キーアサイン）

|       | Player 1 | Player 2 |
|-------|----------|----------|
| 上に移動  | W        | カーソル上    |
| 右に移動  | D        | カーソル右    |
| 下に移動  | S        | カーソル下    |
| 左に移動  | A        | カーソル左    |
| 爆弾を置く | 1        | /        |

# とりあえず遊んでみる
Vercel にデプロイしてあります。よかったら遊んでみてください。

https://web-bomber.vercel.app/

# ビルド

事前に [Node.js](https://nodejs.org/ja), [Rust](https://rustup.rs/), [wasm-pack](https://rustwasm.github.io/wasm-pack/) をインストールしてください。
準備ができたらこのリポジトリを clone して以下のコマンドを実行してください。

```shell
npm install
npm run wasm
npm run build
```

`npm run wasm` コマンドは Rust のコードをコンパイルして WASM に変換し、Node モジュールとしてインストールします。これが終わっていないと `npm run build` でのビルドに失敗します。

ビルド結果は `dist` ディレクトリ配下に出力されます。静的ファイルだけなので適当な Web サーバにデプロイすれば動きます。

# ローカルサーバで実行

```shell
npm run dev
```

# 使用技術

* TypeScript
* Rust (WASM)
* [PixiJS](https://pixijs.com/)
* [howler.js](https://howlerjs.com/)

# WASM の用途
AI (コンピュータプレイヤーの思考ルーチン) のアルゴリズムの実装に WASM を使用しています。比較的単純な探索アルゴリズムを使っています。同様のアルゴリズムを JavaScript で実装したら遅すぎたため Rust の実装を持ってきました。おかげで AI 同士で対戦させてもサクサク動きます。

# 使用素材
## 画像
以下のサイトで無償配布されている画像を使わせていただいています。

* [ぴぽや倉庫](https://pipoya.net/sozai/)

## サウンド
以下のサイトで無償配布されている効果音およびBGMの音源を使わせていただいています。

* [DOVA-SYNDROME](https://dova-s.jp/)
