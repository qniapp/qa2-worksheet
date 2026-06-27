// QA2 夏休み自由研究ワークシート生成の entrypoint。
// 原稿データは content/、描画・ページ合成は src/worksheet/ に分離する。
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildLandingHtml, buildWorksheetHtml } from './src/worksheet/site.mjs';

const OUT = dirname(fileURLToPath(import.meta.url));
const DIST = join(OUT, 'dist');

mkdirSync(DIST, { recursive: true });
writeFileSync(join(DIST, 'qa2.html'), buildWorksheetHtml());
writeFileSync(join(DIST, 'index.html'), buildLandingHtml());
writeFileSync(join(DIST, '.nojekyll'), '');
console.log('wrote dist/qa2.html and dist/index.html');
