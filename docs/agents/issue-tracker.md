# Agent Issue Tracker Guide

このリポジトリの issue tracker は GitHub の `qniapp/qa2-worksheet` です。Matt skills や実装エージェントが issue / PR を扱うときは、この文書を最小の手順書として参照します。

## 基本情報

- GitHub repo: `qniapp/qa2-worksheet`
- 主要 label: `ready-for-agent`
- GitHub 上のコメント、PR本文、レビュー、検証メモは原則 **日本語** で書く
- issue 本文が実装 spec の正本になる。特に Acceptance criteria は本文のチェックボックスを更新して管理する
- `/to-issues` 由来で `ready-for-agent` が付いた issue は、原則として追加の `/triage` を挟まず、fresh session の `/implement` で着手する

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
  --base main \
  --head <branch> \
  --title '<日本語タイトル>' \
  --body-file /tmp/qa2-worksheet-pr-body.md
```

PR 本文には最低限、次を日本語で書きます。

- 対応 issue
- 変更概要
- 実行した検証コマンド
- PDF / HTML の見た目や読みやすさに影響する場合は、`npm run build` の結果、全ページ画像確認、Design Critique の PASS 状況
- PDF / HTML の見た目や読みやすさに影響する場合は、確認用スクリーンショットやページ画像の所在
- リサーチを伴った場合は、リポジトリ内に残す必要がある要約と判断（非公開の GBrain slug は共有リンクとして貼らない）

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
- Orca worker の進捗・blocker・PR化準備完了は、terminal 返信だけにせず GitHub issue / PR コメントへ残す。司令塔は GitHub コメントを安定ログとして読む。
- PDF デザイン変更では、`AGENTS.md` の PDF デザイン変更時のルールを完了条件として扱う。
- 仕様変更やファイル責務の変更があれば、同じ変更で `README.md`、`AGENTS.md`、必要な `docs/agents/` も更新する。
- リサーチ結果の一次保存先は GBrain とし、`docs/research/` は新設しない。
