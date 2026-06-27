# QA² なつやすみ じゆうけんきゅう ワークシート

パズルゲーム **QA²** を題材にした、小学生向けの夏休み自由研究テンプレート（量子ゲートの「観察ノート」）。
ダウンロード → 印刷 → QA² で遊びながら手書きで穴埋め → 提出・教室の壁に掲示、という使い方を想定した **A4・全8ページの印刷用 PDF** を、データから手続き的に生成します（大阪大学との共同企画）。

## 成果物

- `dist/qa2-worksheet.pdf` … 配布・印刷用の最終PDF（全8ページ）
- GitHub Pages 公開URL
  - ダウンロードページ: <https://qniapp.github.io/qa2-worksheet/>
  - PDF直リンク: <https://qniapp.github.io/qa2-worksheet/qa2-worksheet.pdf>

### ページ構成

1. 表紙＋「この自由研究でやること」＋キュービット君しょうかい
2. 物語：キュービット君は地球の一点を指す（X² で 北極→南極→北極＝消える）
3. ブロックのなかまたち（X〜T の6種：名前・回転軸・回転量。H はアダマール由来）
4. 2つのブロックでマッチ（H² X² Y² Z² S²→Z T²→S）
5. 3つのブロックでマッチ① H ではさむ（HXH→Z, HZH→X, HYH→Y）
6. 3つのブロックでマッチ② S・T ではさむ（SXS→X, SYS→Y, SZS→消える, TST→Z）
7. はってん：SWAP（あみだくじ式の説明）＋自由記入
8. おうちの方・先生へ（量子ビット＝キュービット君、状態ベクトル＋ユニタリ行列＝回転行列、図との対応）

## ビルド

```sh
npm install      # 初回のみ（実行時依存は budoux、開発用に ESLint など）
npm run build    # dist/qa2-worksheet.pdf を生成
```

`npm run build` は `build.sh` を実行し、`node build.mjs` で `dist/qa2.html` を生成したのち、
ヘッドレス Chrome（`google-chrome-stable`）で印刷用 PDF を書き出します。
Chrome の実行ファイル名が違う場合は環境変数で指定できます:

```sh
CHROME=chromium npm run build
```

HTML だけ生成したいときは `npm run html`。

## 検証

```sh
npm run audit        # npm audit で moderate 以上の脆弱性がないことを確認
npm run lint         # ESLint で build.mjs / scripts / tests / 設定ファイルを確認
npm test             # HTML を再生成し、Node.js 標準 test runner で smoke test
npm run test:visual  # dist/qa2-worksheet.pdf を基準画像と比較
```

`npm run test:visual` は `pdftoppm`（poppler-utils）と ImageMagick の `compare` / `magick compare` を使い、`dist/qa2-worksheet.pdf` を `tests/visual/baseline/page-*.png` とピクセル単位で比較します。差分が出た場合は、現在画像と差分画像の一時ディレクトリを表示します。

基準画像は、意図的に PDF の見た目を変え、全ページ画像確認と人間レビューが済んだ場合だけ更新します。

```sh
npm run build
npm run update:visual-baseline
```

PDF / HTML の見た目に関係する PR では、通常の検証に加えて `npm run test:visual` を実行し、必要に応じて `REVIEW_DIR=docs/review/issue-<番号> npm run render:review-pages` で PR 用のページ画像を再生成します。

pull request と `master` への push では、GitHub Actions の CI が `npm ci` → `npm run audit` → `npm run lint` → `npm run build` → `npm test` を実行します。配布用の GitHub Pages workflow は従来どおり `dist/` を公開します。

## 設計の要点

- **1つの投影を全図で共有**：`project()` という単一の正射影をすべての図が使うため、地球／ブロッホ球・針・回転弧・軸が原理的にズレません。
- **同じ部品を skin で出し分け**：`globe()` が、物語ページの「地球（顔つきキュービット君）」と、観察ノートの「ブロッホ球」を兼ねます。
- **データ駆動**：`PAIRS` / `TRIPLES_*` / `INTRO_BLOCKS` の配列に1行足すだけでパターンが増えます。各ステップの矢印には、その段で渡すブロックを自動で載せます。
- **回転は物理準拠**：ゲームのアニメーション軸や下書き画像には頼らず、物理的に正しい (軸, 角度) を持ち、`X·X=I`, `S²=Z`, `T²=S`, `SZS=I` などと整合（例: SXS はゲームでも X が残るため「消える」ではなく X）。
- **ブロック色**：QA²（Unity）の `BlockColors.cs` の HSV を再現し、ガラス質（斜めグラデ＋ハイライト＋白文字）に。
- **低学年配慮**：本文の漢字に `furi()`（辞書ベースのふりがな）、角度は「半周／4分の1周／8分の1周」、長文は **BudouX** で自然な文節改行。図は SVG ベクターなので印刷でくっきり。

## 構成

```
build.mjs              生成スクリプト（データ＋SVG部品＋ページ合成）
build.sh               HTML生成→Chromeで印刷PDF化
scripts/               PDF ページ画像化・視覚回帰確認の補助スクリプト
tests/                 生成 HTML の smoke test と視覚回帰の基準画像
dist/                  出力（qa2-worksheet.pdf を配布。qa2.html は中間生成物）
```
