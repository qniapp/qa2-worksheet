#!/usr/bin/env bash
# dist/qa2.html を生成し、ヘッドレス Chrome で印刷用 PDF を書き出す。
set -euo pipefail
cd "$(dirname "$0")"

node build.mjs

CHROME="${CHROME:-}"
if [[ -z "$CHROME" ]]; then
  for candidate in google-chrome-stable google-chrome chromium chromium-browser; do
    if command -v "$candidate" >/dev/null 2>&1; then
      CHROME="$candidate"
      break
    fi
  done
fi
if [[ -z "$CHROME" ]]; then
  echo "Chrome/Chromium が見つかりません。CHROME=/path/to/chrome を指定してください。" >&2
  exit 1
fi

OUT="dist/qa2-worksheet.pdf"
"$CHROME" --headless=new --disable-gpu --no-sandbox --no-pdf-header-footer \
  --print-to-pdf="$OUT" --virtual-time-budget=4000 \
  "file://$(pwd)/dist/qa2.html"

echo "built $OUT"
