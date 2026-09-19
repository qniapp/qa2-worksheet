// QA2 worksheet HTML entrypoint.
// Manuscript: content/  Rendering: src/worksheet/
// Locale: QA2_LOCALE=en writes English outputs; default is Japanese.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocale } from './content/locale.mjs';
import { buildLandingHtml, buildWorksheetHtml } from './src/worksheet/site.mjs';

const OUT = dirname(fileURLToPath(import.meta.url));
const DIST = join(OUT, 'dist');
const locale = getLocale();
const worksheetName = locale === 'en' ? 'qa2-en.html' : 'qa2.html';
const landingName = locale === 'en' ? 'index-en.html' : 'index.html';

mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, worksheetName), buildWorksheetHtml());
writeFileSync(join(DIST, landingName), buildLandingHtml());
writeFileSync(join(DIST, '.nojekyll'), '');
console.log(`wrote dist/${worksheetName} and dist/${landingName} (locale=${locale})`);
