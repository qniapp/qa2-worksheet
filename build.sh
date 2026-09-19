#!/usr/bin/env bash
# Generate worksheet HTML, then print to PDF with headless Chrome.
# QA2_LOCALE=en → dist/qa2-en.html + dist/qa2-worksheet-en.pdf
# default (ja)  → dist/qa2.html + dist/qa2-worksheet.pdf
set -euo pipefail
cd "$(dirname "$0")"

LOCALE="${QA2_LOCALE:-ja}"
export QA2_LOCALE="$LOCALE"

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
  echo "Chrome/Chromium not found. Set CHROME=/path/to/chrome" >&2
  exit 1
fi

if [[ "$LOCALE" == "en" ]]; then
  HTML="dist/qa2-en.html"
  OUT="dist/qa2-worksheet-en.pdf"
else
  HTML="dist/qa2.html"
  OUT="dist/qa2-worksheet.pdf"
fi

"$CHROME" --headless=new --disable-gpu --no-sandbox --disable-dev-shm-usage \
  --no-pdf-header-footer --disable-extensions --disable-background-networking \
  --print-to-pdf="$OUT" --virtual-time-budget=8000 \
  "file://$(pwd)/$HTML"

echo "built $OUT"
