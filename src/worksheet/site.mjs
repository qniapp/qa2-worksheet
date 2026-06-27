import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LANDING_COPY } from '../../content/worksheet-content.mjs';
import { resetArtworkIds } from './artwork.mjs';
import { worksheetPages } from './pages.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const worksheetCss = readFileSync(join(HERE, 'worksheet.css'), 'utf8');
const landingCss = readFileSync(join(HERE, 'landing.css'), 'utf8');

export function buildWorksheetHtml() {
  resetArtworkIds();

  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<style>
${worksheetCss}</style></head>
<body>
  ${worksheetPages().join('\n  ')}
</body></html>`;
}

export function buildLandingHtml() {
  const copy = LANDING_COPY;
  return `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${copy.title}</title>
<meta name="description" content="${copy.description}">
<style>
${landingCss}</style></head><body><main>
  <section class="card">
    <div class="kicker">${copy.kicker}</div>
    <h1>${copy.heading}</h1>
    <p>${copy.body}</p>
    <div class="actions">
      <a class="button primary" href="./qa2-worksheet.pdf" download>${copy.pdfButton}</a>
      <a class="button secondary" href="./qa2.html">${copy.htmlButton}</a>
    </div>
    <div class="note">${copy.note}</div>
  </section>
</main></body></html>`;
}
