# AGENTS.md

## 自律実行ルール

タスクを受けたら「やります」と返事するだけで止まらず、実際に必要な作業・検証まで進めてください。

## 最初に読むもの

- `README.md` — 成果物、ページ構成、ビルド方法、設計の要点
- `docs/agents/issue-tracker.md` — GitHub issue / PR 操作の最小手順
- `docs/agents/matt-workflow.md` — Matt skills 前提の標準開発フロー、Orca 司令塔運用、GBrain 運用

PDF の見た目や読みやすさに関係する変更では、必要に応じて `build.mjs` と生成済み `dist/qa2.html` / `dist/qa2-worksheet.pdf` の現状も確認してください。

## 共通運用ルール

1. **GitHub 上のやり取りは日本語で書くこと**
   - issue / PR / review コメント、実装完了報告、検証メモは原則日本語にする。
   - PR 本文やコメントでは、不要な英単語を日本語文に混ぜる「ルー語」を避ける。固有名詞、コマンド名、ファイル名、ライブラリ名、GitHub の自動処理キーワードなど、翻訳すると不正確になる語だけ英語のまま残してよい。
   - subagent / worker の英語出力を貼る場合も、そのまま貼らず日本語で要約する。

2. **生成物とソースを混同しないこと**
   - PDF / HTML の正本は `build.mjs` と関連データで、`dist/` は生成物として扱う。
   - ただし配布物である `dist/qa2-worksheet.pdf` を更新する必要がある変更では、必ず再生成して差分に含める。

3. **リサーチ結果は GBrain を一次保存先にすること**
   - 依存調査、OSS 調査、技術選定、外部ドキュメント調査、教育表現の裏取りなどのリサーチ結果は、新規ファイル作成・既存ファイルへの追記を問わず、一次保存先を GBrain にする。
   - 設計書・計画書・GitHub Issues では、他の開発者が読めるように必要な要約と判断をリポジトリ内に残す。
   - 非公開の GBrain slug は共有ドキュメントの参照リンクとして使わない。
   - 今後 `docs/research/` は作らない。既に存在する調査メモを見つけた場合は、必要に応じて GBrain へ移す。

4. **Matt skills 前提の開発運用に寄せること**
   - 新規実装は issue ごとに fresh `/implement` で進め、完了後に `/review` を通す。
   - `/to-issues` 由来で `ready-for-agent` が付いた issue は、原則として追加の `/triage` を挟まない。
   - 詳細な issue / PR 操作や skill の使い分けは `docs/agents/` に置く。

5. **Orca では司令塔セッションを置いて進めること**
   - 1つの Pi セッションが司令塔として GitHub issue / PR と Orca worktree / terminal を定期確認し、重複作業を避けながら次の実装 issue を fresh worktree へ配る。
   - 司令塔は `orca-cli` / `orca-ide` で worktree・terminal・agent 状態を確認し、必要に応じて作業者へ状況確認や human review 依頼を行う。
   - 依存関係と編集対象が独立している ready issue は、重複作業と大きな conflict を避けながら複数 worktree で並行して進める。
   - Orca terminal のログは読めない場合があるため、worker は重要な進捗・blocker・PR化準備完了を GitHub issue / PR コメントに日本語で残し、司令塔はそれを安定ログとして読む。
   - PR merge / issue close 済みの worktree は、未コミット差分がないことを確認してこまめに削除する。
   - merge、リポジトリ rename、大きな方針変更、PDF 配布内容の大幅変更などの不可逆・広範囲な操作は、人間の明示指示を待つ。

6. **人間レビュー用の画像を PR 本文に貼ること**
   - PDF / HTML の見た目や読みやすさに影響する変更では、修正後のページ画像を `docs/review/issue-<number>/` などの repo 内パスに保存し、PR 本文へ埋め込む。
   - PR 本文に画像を埋め込むときは、push 後の commit SHA を使って `https://github.com/qniapp/qa2-worksheet/blob/<commit>/<path>?raw=true` 形式にする。`/tmp/...` のようなローカルパスや `raw.githubusercontent.com` 直リンクは使わない。
   - 変更の主対象ページは PR 本文で直接見えるようにし、全ページ確認画像は必要に応じて折りたたみ内に置く。
   - 投稿前に画像を開いて、読めること・重なりがないこと・レビュー対象が伝わることを確認する。

## PDFデザイン変更時のルール

`build.mjs` のレイアウト・文言・CSS・図版など、生成される PDF の見た目や読みやすさに影響する変更をした場合は、必ず次を行ってください。

1. 小学生向けページ（特に 1〜7 ページ）の漢字には必ずルビを振る。`furi()` を通らない生文字列を置かない。SVG 内の文字など `furi()` が使えない場所は、ひらがな併記・疑似ルビ・ひらがな表記で補う。
2. 低学年（小学1〜2年生）でも読めることを前提に、難しい漢字・専門語・ラベルのルビ漏れを必ず確認する。
3. `npm run build` で `dist/qa2-worksheet.pdf` を再生成する。
4. 見た目を変えない構造変更・リファクタリングでは `npm run test:visual` を実行し、基準画像との差分が 0 であることを確認する。意図的に見た目を変える変更では、全ページ確認と人間レビューが済んだ後だけ基準画像を更新する。
5. PDF の全ページを画像として `docs/review/issue-<number>/` などに保存し、画像を開いて確認する。
6. 画像確認と Design Critique では、文字・ルビ・ブロック・矢印・球・枠線などの要素が重なっていないことを明示的に確認する。特に小さな操作ラベル、アイコン、矢印、図中の軸線は重なりやすいので、拡大して確認する。
7. 繰り返し行・表・図解では、縦横の基準線と余白も確認する。カード端、点線枠、区切り線、右端罫線、図の列位置、上下左右のパディングが意図なくずれていないか、同じページ内で見比べる。
8. すべてのページについて `interface-craft` の Design Critique スキルでレビューする。
9. コメントが出た場合は修正し、再ビルド・再レビューを繰り返す。
10. PR 本文に、変更の主対象ページと全ページ確認画像へのリンク / 埋め込みを置く。
11. 全ページでコメントがなくなり PASS になり、PR 本文から人間が画像確認できるまで完了扱いにしない。

## 関連ファイル

- `README.md` — ワークシートの目的、構成、ビルド方法
- `content/worksheet-content.mjs` — 教材本文・ページ見出し・ワークシート問題データ
- `src/worksheet/` — ルビ処理、SVG部品、ブロッホ球描画、ページ合成、CSS
- `build.mjs` — HTML / 静的サイトを `dist/` に書き出す entrypoint
- `build.sh` — HTML 生成から PDF 書き出しまでのビルド手順
- `docs/agents/issue-tracker.md` — GitHub issue / PR 操作の最小手順
- `docs/agents/matt-workflow.md` — Matt skills、Orca 司令塔、GBrain 運用
