# Issue #1 / PR #6 レビュー用ページ画像

PR #6 の人間レビュー用に、修正後の `dist/qa2-worksheet.pdf` をページ画像へ変換したものです。

## 生成コマンド

```bash
pdftoppm -png -r 150 dist/qa2-worksheet.pdf docs/review/issue-1/page
```

## 確認範囲

- 変更の主対象: 4〜6ページ（2つ / 3つのブロックでマッチする説明図）
- 全体確認: 1〜8ページすべて

PR 本文では、変更確認に必要な 4〜6ページを直接埋め込み、全ページ画像は折りたたみ内に掲載します。
