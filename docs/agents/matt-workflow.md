# Matt Skills Workflow

このリポジトリでは、開発運用を Matt Pocock skills 前提の流れに寄せます。ワークシート内容とビルド手順の正本は `README.md`、エージェント向けルールの正本は `AGENTS.md` です。教材本文・問題データの正本は `content/worksheet-content.mjs`、描画とページ合成は `src/worksheet/` です。この文書は、エージェント作業の進め方と GBrain へのリサーチ蓄積だけを扱います。

## 標準フロー

1. `/grill-with-docs`
   - `README.md`、`AGENTS.md`、関連 issue を読み、曖昧な要求や設計判断をユーザーに確認する。
2. `/to-spec`
   - 複数 issue に分かれる大きな企画や配布方針の変更だけ、背景・範囲・受け入れ条件を spec として残す。
3. `/to-tickets`
   - 実装可能な issue に分割し、GitHub issue へ落とす。
   - この流れで作られた issue は、本文が spec として十分な前提なので原則 `/triage` しない。
4. fresh session の `/implement`
   - issue ごとに新しい session で開始する。
   - 最初に `AGENTS.md`、`README.md`、issue 本文を読み、issue 本文を spec として実装する。
   - TDD 可能な seam があれば、1 テストずつ RED → GREEN で進める。
5. `/code-review`
   - `origin/master...HEAD` など固定点との差分を、spec 適合と documented standards の 2 軸で確認する。
   - spec の正本は原則 GitHub issue 本文で、必要に応じて `/to-spec` の spec / docs も参照する。
6. PR
   - PR 本文、検証メモ、レビュー応答は日本語で書き、不要な英単語を日本語文に混ぜる「ルー語」を避ける。
   - PR 本文の冒頭に、issue を開かなくても分かる「この PR は何か」「この PR でやること」「この PR でやらないこと」を置く。
   - PDF / HTML の見た目や読みやすさに影響する PR では、修正後のページ画像を PR 本文へ埋め込む。
   - Acceptance criteria の完了状態は issue 本文で更新する。

## fresh `/implement` ルール

- 1 issue = 1 fresh session を基本にする。
- 過去 session の会話を前提にせず、issue URL と repository docs から再構築する。
- `/to-tickets` 由来で `ready-for-agent` が付いた issue は、実装前に改めて `/triage` しない。
- scope creep を避け、issue の Non-goals を守る。
- PDF / HTML の見た目や読みやすさに影響する変更では、`AGENTS.md` の PDF デザイン変更時のルールを完了条件にする。
- docs-only / agent-operation-only の変更では、PDF 再生成は不要。代わりに `git diff --check` など、変更種別に合った軽量検証を行う。

## QA² worksheet 固有の品質ゲート

- `content/worksheet-content.mjs`、`src/worksheet/`、`build.mjs` など、生成 PDF / HTML に影響するファイルを変更したら、必ず `npm run build` で `dist/qa2-worksheet.pdf` を再生成する。
- 見た目を変えない構造変更・リファクタリングでは、`npm run test:visual` で基準画像との差分が 0 であることを確認する。意図的に見た目を変える変更では、全ページ確認と人間レビューが済んだ後だけ基準画像を更新する。
- 小学生向けページ（特に 1〜7 ページ）の漢字には `furi()` を通す。SVG など `furi()` が使えない場所では、ひらがな併記・疑似ルビ・ひらがな表記で補う。
- PDF の全ページを画像として `docs/review/issue-<number>/` などに保存し、画像を開いて確認し、すべてのページで `interface-craft` の Design Critique が PASS になるまで修正を続ける。
- 画像確認と Design Critique では、文字・ルビ・ブロック・矢印・球・枠線などの要素が重なっていないことを明示的に確認する。特に小さな操作ラベル、アイコン、矢印、図中の軸線は拡大して確認する。
- 繰り返し行・表・図解では、縦横の基準線と余白も確認する。カード端、点線枠、区切り線、右端罫線、図の列位置、上下左右のパディングが意図なくずれていないか、同じページ内で見比べる。
- PR 本文には、変更の主対象ページを直接埋め込み、全ページ画像は必要に応じて折りたたみ内に置く。画像 URL は `https://github.com/qniapp/qa2-worksheet/blob/<commit>/<path>?raw=true` 形式を使い、`/tmp` パスや `raw.githubusercontent.com` 直リンクは使わない。
- 見た目を伴わない運用ドキュメント変更では、上記の PDF 再生成・全ページレビューは不要。

## GBrain と repository docs

- 外部調査や依存調査の一次保存先は GBrain にする。
- Pi / MCP からは `gbrain_search` で過去調査を探し、`gbrain_put_page` で調査結果を保存する。
- リサーチ開始時は、まず GBrain を検索して過去の調査を再利用できないか確認する。
- リサーチ完了時は、GBrain に次の形で保存する。

```markdown
---
title: QA2 worksheet: <調査テーマ>
tags: [qa2-worksheet, research]
project: qniapp/qa2-worksheet
date: YYYY-MM-DD
---

## Question

## Sources

## Findings

## Decision / Recommendation

## Repository summary
```

- repository には、他の開発者が読む必要のある要約・判断・受け入れ条件だけを残す。
- 非公開の GBrain slug は issue / PR / docs の共有リンクとして使わない。
- `docs/research/` は新設しない。
