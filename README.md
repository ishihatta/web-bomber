# これは何？
ブラウザで動作する簡単な対戦2Dアクションゲームです。キーボードで操作するためスマホやタブレットでは遊べません。

[以前 Kotlin で書いたゲーム](https://github.com/ishihatta/kotlin-bomber/) の Web フロントエンドへの移植になります。

# ゲームの内容
二人対戦専用のボン○ーマンです。人間対人間、人間対AI、AI対AIの対戦ができます。ルールは以下の通りです。

* アイテムは火力アップのみ
* 爆弾は無限に置ける
* 死んだら負け

# ビルド

```shell
npm install
npm run wasm
npm run build
```

# 実行

```shell
cargo run dev
```

# 操作方法（キーアサイン）

|       | Player 1 | Player 2 |
|-------|----------|----------|
| 上に移動  | W        | カーソル上    |
| 右に移動  | D        | カーソル右    |
| 下に移動  | S        | カーソル下    |
| 左に移動  | A        | カーソル左    |
| 爆弾を置く | 1        | /        |

# 使用技術

* TypeScript
* Rust (WASM)
* [PixiJS](https://pixijs.com/)
* [howler.js](https://howlerjs.com/)

# 使用素材
## 画像
以下のサイトで無償配布されている画像を使わせていただいています。

* [ぴぽや倉庫](https://pipoya.net/sozai/)

## サウンド
以下のサイトで無償配布されている効果音およびBGMの音源を使わせていただいています。

* [DOVA-SYNDROME](https://dova-s.jp/)