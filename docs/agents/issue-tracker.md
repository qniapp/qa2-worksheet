# Agent Issue Tracker Guide

このリポジトリの issue tracker は GitHub の `qniapp/qa2-worksheet` です。Matt skills や実装エージェントが issue / PR を扱うときは、この文書を最小の手順書として参照します。

## 基本情報

- GitHub repo: `qniapp/qa2-worksheet`
- 主要 label: `ready-for-agent`
- GitHub 上のコメント、PR本文、レビュー、検証メモは原則 **日本語** で書き、不要な英単語を日本語文に混ぜる「ルー語」を避ける
- issue 本文が実装 spec の正本になる。特に Acceptance criteria は本文のチェックボックスを更新して管理する
- `/to-tickets` 由来で `ready-for-agent` が付いた issue は、原則として追加の `/triage` を挟まず、fresh session の `/implement` で着手する

## labels

- `ready-for-agent`: エージェントが fresh `/implement` で着手できる issue。
- `documentation`: ドキュメント整理・追記が主目的の issue。
- `enhancement`: 機能追加や開発支援の追加が主目的の issue。
- `bug`: 出力、ビルド、表示、配布フローなどの不具合。

## issue を読む

```bash
gh issue view <number> \
  --repo qniapp/qa2-worksheet \
  --json number,title,body,state,labels,comments,url
```

関連 issue も確認する場合:

```bash
gh issue view <number> --repo qniapp/qa2-worksheet
gh issue list --repo qniapp/qa2-worksheet --label ready-for-agent
```

## Acceptance criteria を更新する

完了した項目は新規コメントでチェックボックスを複製せず、issue 本文を編集して更新します。

```bash
gh issue view <number> \
  --repo qniapp/qa2-worksheet \
  --json body --jq .body > /tmp/qa2-worksheet-issue-<number>.md

# /tmp/qa2-worksheet-issue-<number>.md の該当チェックボックスを編集する

gh issue edit <number> \
  --repo qniapp/qa2-worksheet \
  --body-file /tmp/qa2-worksheet-issue-<number>.md
```

検証ログや補足説明が必要な場合だけ、日本語コメントを追加します。

```bash
gh issue comment <number> \
  --repo qniapp/qa2-worksheet \
  --body '検証: npm run build が pass し、dist/qa2-worksheet.pdf を再生成しました。'
```

## PR を作る

```bash
gh pr create \
  --repo qniapp/qa2-worksheet \
  --base master \
  --head <branch> \
  --title '<日本語タイトル>' \
  --body-file /tmp/qa2-worksheet-pr-body.md
```

PR 本文には最低限、次を日本語で書きます。冒頭には、issue を開かなくても分かるように「この PR は何か」「この PR でやること」「この PR でやらないこと」を置きます。不要な英単語を日本語文に混ぜる「ルー語」は避け、固有名詞・コマンド名・ファイル名・ライブラリ名・GitHub の自動処理キーワードだけ英語のまま残します。

- この PR は何か
- この PR でやること / やらないこと
- 対応 issue
- 変更概要
- 実行した検証コマンド
- PDF / HTML の見た目や読みやすさに影響する場合は、`npm run build` の結果、全ページ画像確認、Design Critique の PASS 状況
- 見た目を変えない PDF / HTML 生成まわりの構造変更では、`npm run test:visual` の差分 0 確認
- PDF / HTML の見た目や読みやすさに影響する場合は、確認用スクリーンショットやページ画像を PR 本文へ埋め込む
- リサーチを伴った場合は、リポジトリ内に残す必要がある要約と判断（非公開の GBrain slug は共有リンクとして貼らない）

### 画像の貼り方

PDF / HTML の見た目や読みやすさに影響する PR では、レビュー用画像を `docs/review/issue-<number>/` などに保存して commit し、push 後の commit SHA を使って PR 本文に埋め込みます。

```markdown
![p4 2つのブロックでマッチ](https://github.com/qniapp/qa2-worksheet/blob/<commit>/docs/review/issue-1/page-4.png?raw=true)
```

- `/tmp/...` などローカルだけのパスは PR 本文に書かない。
- `raw.githubusercontent.com` 直リンクではなく、`https://github.com/qniapp/qa2-worksheet/blob/<commit>/<path>?raw=true` 形式を使う。
- 変更の主対象ページは PR 本文から直接見えるようにする。
- 全ページ確認画像は、必要に応じて `<details>` 折りたたみ内にまとめる。
- 投稿前に画像を開いて、読めること・重なりがないこと・レビュー対象が伝わることを確認する。

## PR を確認・merge する

```bash
gh pr view <number> --repo qniapp/qa2-worksheet --web
gh pr checks <number> --repo qniapp/qa2-worksheet
```

merge は明示的に指示された場合だけ行います。

```bash
gh pr merge <number> \
  --repo qniapp/qa2-worksheet \
  --squash \
  --delete-branch
```

## 運用メモ

- issue / PR の実装報告は日本語で要約する。subagent の英語出力をそのまま貼らない。
- `ready-for-agent` は、エージェントが実装に着手できる粒度・情報量になった issue に付ける。
- 実装の進捗・blocker・PR化準備完了は、GitHub issue / PR コメントに日本語で残し、安定ログとして扱う。
- PDF デザイン変更では、`AGENTS.md` の PDF デザイン変更時のルールを完了条件として扱う。
- 仕様変更やファイル責務の変更があれば、同じ変更で `README.md`、`AGENTS.md`、必要な `docs/agents/` も更新する。
- リサーチ結果の一次保存先は GBrain とし、`docs/research/` は新設しない。
