import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocale } from '../../content/locale.mjs';
import { LANDING_COPY } from '../../content/active.mjs';
import { resetArtworkIds } from './artwork.mjs';
import { worksheetPages } from './pages.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const worksheetCss = readFileSync(join(HERE, 'worksheet.css'), 'utf8');
const landingCss = readFileSync(join(HERE, 'landing.css'), 'utf8');

export function buildWorksheetHtml() {
  resetArtworkIds();
  const lang = getLocale() === 'en' ? 'en' : 'ja';
  const localeClass = lang === 'en' ? ' locale-en' : '';

  return `<!doctype html><html lang="${lang}" class="${localeClass.trim()}"><head><meta charset="utf-8">
<style>
${worksheetCss}</style></head>
<body>
  ${worksheetPages().join('\n  ')}
</body></html>`;
}

export function buildLandingHtml() {
  const copy = LANDING_COPY;
  const lang = getLocale() === 'en' ? 'en' : 'ja';
  const pdfHref = copy.pdfHref || './qa2-worksheet.pdf';
  const htmlHref = copy.htmlHref || './qa2.html';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
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
      <a class="button primary" href="${pdfHref}" download>${copy.pdfButton}</a>
      <a class="button secondary" href="${htmlHref}">${copy.htmlButton}</a>
      ${copy.altLangHref ? `<a class="button secondary" href="${copy.altLangHref}">${copy.altLangLabel}</a>` : ''}
    </div>
  </section>
</main></body></html>`;
}
