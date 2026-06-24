#!/usr/bin/env bash
# dist/qa2.html を生成し、ヘッドレス Chrome で印刷用 PDF を書き出す。
set -euo pipefail
cd "$(dirname "$0")"

node build.mjs

CHROME="${CHROME:-google-chrome-stable}"
OUT="dist/qa2-worksheet.pdf"
"$CHROME" --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$OUT" --virtual-time-budget=4000 \
  "file://$(pwd)/dist/qa2.html"

echo "built $OUT"
