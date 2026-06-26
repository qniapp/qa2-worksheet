# Matt Skills Workflow

このリポジトリでは、開発運用を Matt Pocock skills 前提の流れに寄せます。ワークシート内容とビルド手順の正本は `README.md`、エージェント向けルールの正本は `AGENTS.md` です。この文書は、エージェント作業の進め方、Orca 司令塔運用、GBrain へのリサーチ蓄積だけを扱います。

## 標準フロー

1. `/grill-with-docs`
   - `README.md`、`AGENTS.md`、関連 issue を読み、曖昧な要求や設計判断をユーザーに確認する。
2. `/to-prd`
   - 複数 issue に分かれる大きな企画や配布方針の変更だけ、背景・範囲・受け入れ条件を PRD として残す。
3. `/to-issues`
   - 実装可能な issue に分割し、GitHub issue へ落とす。
   - この流れで作られた issue は、本文が spec として十分な前提なので原則 `/triage` しない。
4. fresh session の `/implement`
   - issue ごとに新しい session で開始する。
   - 最初に `AGENTS.md`、`README.md`、issue 本文を読み、issue 本文を spec として実装する。
   - TDD 可能な seam があれば、1 テストずつ RED → GREEN で進める。
5. `/review`
   - `origin/master...HEAD` など固定点との差分を、spec 適合と documented standards の 2 軸で確認する。
   - spec は原則 GitHub issue 本文、必要に応じて PRD / docs も参照する。
6. PR
   - PR 本文、検証メモ、レビュー応答は日本語で書き、不要な英単語を日本語文に混ぜる「ルー語」を避ける。
   - PR 本文の冒頭に、issue を開かなくても分かる「この PR は何か」「この PR でやること」「この PR でやらないこと」を置く。
   - PDF / HTML の見た目や読みやすさに影響する PR では、修正後のページ画像を PR 本文へ埋め込む。
   - Acceptance criteria の完了状態は issue 本文で更新する。

## fresh `/implement` ルール

- 1 issue = 1 fresh session を基本にする。
- 過去 session の会話を前提にせず、issue URL と repository docs から再構築する。
- `/to-issues` 由来で `ready-for-agent` が付いた issue は、実装前に改めて `/triage` しない。
- scope creep を避け、issue の Non-goals を守る。
- PDF / HTML の見た目や読みやすさに影響する変更では、`AGENTS.md` の PDF デザイン変更時のルールを完了条件にする。
- docs-only / agent-operation-only の変更では、PDF 再生成は不要。代わりに `git diff --check` など、変更種別に合った軽量検証を行う。

## QA² worksheet 固有の品質ゲート

- `build.mjs` のレイアウト・文言・CSS・図版を変更したら、必ず `npm run build` で `dist/qa2-worksheet.pdf` を再生成する。
- 小学生向けページ（特に 1〜7 ページ）の漢字には `furi()` を通す。SVG など `furi()` が使えない場所では、ひらがな併記・疑似ルビ・ひらがな表記で補う。
- PDF の全ページを画像として `docs/review/issue-<number>/` などに保存し、画像を開いて確認し、すべてのページで `interface-craft` の Design Critique が PASS になるまで修正を続ける。
- PR 本文には、変更の主対象ページを直接埋め込み、全ページ画像は必要に応じて折りたたみ内に置く。画像 URL は `https://github.com/qniapp/qa2-worksheet/blob/<commit>/<path>?raw=true` 形式を使い、`/tmp` パスや `raw.githubusercontent.com` 直リンクは使わない。
- 見た目を伴わない運用ドキュメント変更では、上記の PDF 再生成・全ページレビューは不要。

## Orca 司令塔運用

Orca で複数 worktree / agent を使う場合は、1つの Pi セッションを司令塔として残し、実装作業は issue ごとの fresh worktree に分ける。Linux では `orca` の代わりに `orca-ide` を使う。

司令塔の定期チェック:

```bash
gh issue list --repo qniapp/qa2-worksheet --state open --limit 80
gh pr list --repo qniapp/qa2-worksheet --state open
orca-ide status --json
orca-ide repo list --json
orca-ide worktree list --repo id:<repoId> --json
orca-ide terminal list --worktree <selector> --json
```

運用ルール:

- 司令塔は、GitHub issue / PR、Orca worktree、terminal の状態を見て「今動いている issue」「blocked な issue」「次に着手可能な issue」を判断する。
- 既に `linkedIssue` 付き worktree がある issue には、別 agent を重複投入しない。
- 新しく実装を始めるときは、Orca の worktree 作成を使う。raw `git worktree` より `orca-ide worktree create` を優先する。
- worker には issue URL、必要 docs、検証条件、Matt workflow の fresh `/implement` 前提を渡す。
- worktree comment は、進捗・blocker・review 待ちなどの短い状態メモとして更新する。
- worker は、重要な進捗・blocker・PR化準備完了を GitHub issue / PR コメントに日本語で残す。Orca terminal の本文は司令塔から読めない場合があるため、GitHub コメントを安定ログとして扱う。
- worker が PR を作ったら、司令塔が PR / issue 本文 / 生成 PDF / ページ画像 / 検証ログを確認し、人間レビューが必要な場合は明示的に依頼する。
- merge、リポジトリ rename、issue の大量編集、配布 PDF の大幅な内容変更は、人間の明示指示を待つ。
- 状況報告は日本語で、issue / PR / worktree のリンクや番号を含める。

### 司令塔の自律ループ

人間の介入を最小化するため、司令塔は次のループを回す。Orca terminal の本文は補助情報に留め、GitHub issue / PR コメントを安定ログとして扱う。

1. **Discover**
   - `gh issue list`, `gh pr list`, `orca-ide worktree list`, `orca-ide terminal list` で、open PR、active worktree、blocked issue、ready issue を確認する。
2. **Prioritize / Parallelize**
   - open PR がある場合は、新規実装より PR レビュー・検証を優先する。
   - active worktree がある dependency root issue を優先する。
   - active worktree がない ready issue は、依存関係が解けているものだけ fresh worktree / fresh `/implement` に流す。
   - 人間を待たせないため、依存関係と編集対象が独立している ready issue は並行 worktree として追加してよい。目安は active implementation worktree 2〜3 本まで。
   - 並行投入前に、既存 active worktree の linkedIssue、予想される変更ファイル、open PR を見て、同じファイルを大きく編集しそうな issue は待機または明示的にスコープ分離する。
3. **Dispatch / Continue**
   - worker には issue URL、必読 docs、検証条件、GitHub コメントでの進捗報告、draft PR までで止めることを渡す。
   - 既存 worker がいる場合は、terminal 返信ではなく issue コメントへ状況報告させる。
4. **Wait with timeout**
   - PR 作成、issue コメント、orchestration `worker_done` / `escalation` を待つ。
   - 一定時間コメント・PR・commit が動かなければ、issue コメントと terminal send で状況報告を再依頼する。
   - さらに停滞し、差分が安定していて blocker がない場合は、司令塔が差分確認・commit・review・draft PR 化を引き継いでよい。
5. **Quality gates**
   - PR 前に該当テスト、`npm run build` が必要な変更なら PDF 再生成、`git diff --check` を実行する。
   - PDF / HTML の見た目や読みやすさに影響する変更は、全ページ画像確認と Design Critique PASS を確認する。
   - PDF / HTML の見た目や読みやすさに影響する PR では、`docs/review/issue-<number>/` などの再現可能な場所にページ画像を保存し、PR 本文へ埋め込む。変更の主対象ページは直接表示し、全ページ確認画像は必要に応じて折りたたみ内にまとめる。
   - 画像埋め込みは `https://github.com/qniapp/qa2-worksheet/blob/<commit>/<path>?raw=true` 形式を使う。`/tmp` パスや `raw.githubusercontent.com` 直リンクは使わない。
   - PR 作成後は Matt `/review` の考え方で、Standards と Spec の 2 軸を確認する。
   - 指摘があれば worker へ戻し、GitHub コメントに修正方針と結果を残させる。
6. **Human gate**
   - merge、repo rename、依存関係の大きな変更、仕様判断、未解決のレビュー指摘、見た目の主観判断が必要なときだけ人間に止めて依頼する。
7. **Cleanup**
   - PR merge / issue close が完了した worktree は、未コミット差分がないことを確認してから terminal を停止し、`orca-ide worktree rm --worktree issue:<number>` で削除する。
   - cleanup 後は master を `git pull --ff-only` で最新化し、司令塔 worktree comment を次の active issue に更新する。
   - squash merge 後の feature branch は master に fast-forward できないことがあるため、Orca worktree 削除は PR / issue の完了状態とローカル差分の有無で判断する。
8. **Advance chain**
   - PR が merge されたら、依存が解けた次 issue を確認し、同じループで fresh worktree / fresh `/implement` を開始する。
   - worker を待っている間も、独立した ready issue がないか確認し、conflict risk が低ければ追加 worktree を作って並行度を上げる。

このループでは、無期限に terminal を待ち続けない。GitHub 上に安定ログが出ない場合は、timeout → 再依頼 → 必要なら引き継ぎの順で進める。待つ必要があるときは、司令塔が自分で timeout 付き polling / sleep を行い、人間に「終わったら教えて」と依頼しない。

繰り返し確認は、可能な限りスクリプト化した安定手順を使う。

```bash
# 現在の PR / active worktree / cleanup候補 / 着手候補を表示
node scripts/orca-commander-tick.mjs --max-active 2

# 完了済みで clean な worktree を削除候補として処理
node scripts/orca-commander-tick.mjs --cleanup-completed

# 5分間、60秒ごとに司令塔状態を polling
node scripts/orca-commander-tick.mjs --watch-seconds 300 --interval-seconds 60

# 特定 issue を fresh Orca worktree + Pi worker で開始
node scripts/orca-commander-tick.mjs --start 20
```

スクリプトは完全自動判断の代替ではなく、同じ確認・cleanup・dispatch 手順を毎回同じ形で実行するための司令塔補助とする。

worker に状況報告を依頼するときは、terminal 返信ではなく issue / PR コメントに残すよう明示する。例:

```text
司令塔からの状況確認です。Orca terminal の本文が読めない場合があるため、返信はこの terminal ではなく GitHub issue #<number> に日本語コメントとして残してください。現在の変更内容、未コミット差分、検証済みコマンド、blocker、PR化可否を箇条書きで報告してください。
```

必要になったら `orchestration` skill を使い、worker_done / escalation / decision_gate を使う。ただし通常の worktree 作成・terminal 読み取り・進捗確認は `orca-cli` で十分。

## 司令塔の引き継ぎ

司令塔セッションの context が長くなった、または別セッションへ移る必要がある場合は `/handoff` で引き継ぎファイルを作り、新しい司令塔セッションでそのファイルとこの文書を読む。引き継ぎファイルは会話の代替であり、GitHub issue / PR と Orca 状態を再確認してから信用する。

引き継ぎに最低限入れるもの:

- 現在の open PR と対応 issue
- active worktree / terminal / worker と担当 issue
- blocked issue と blocker
- 最後に確認したコマンドと時刻
- 次に取るべき action
- 人間判断待ちの項目
- GBrain に保存したリサーチの要約（非公開 slug は共有 docs のリンクとして使わない）

新しい司令塔は、まず `gh issue list`、`gh pr list`、`orca-ide status --json`、`orca-ide worktree list`、`orca-ide terminal list` を実行し、引き継ぎ内容が古くなっていないことを確認する。

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
