import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderContentMarkup } from '../src/worksheet/artwork.mjs';
import { buildWorksheetHtml } from '../src/worksheet/site.mjs';

const readDist = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const readRepo = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const visibleText = html => html
  .replace(/<rt>.*?<\/rt>/gs, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, '');

test('worksheet HTML contains the expected eight printable pages', async () => {
  const html = await readDist('qa2.html');

  assert.equal(html.match(/class="page/g)?.length, 8);
  assert.match(html, /QA²/);
  assert.match(html, /<ruby>自由研究<rt>じゆうけんきゅう<\/rt><\/ruby>/);
});

test('child-facing pages keep axis wording in hiragana and adult page uses kanji', async () => {
  const html = await readDist('qa2.html');
  const [childPages, adultPage] = html.split('<div class="page about">');

  assert.ok(adultPage);
  assert.doesNotMatch(childPages, /軸/);
  assert.doesNotMatch(html, /<ruby>軸/);
  assert.match(childPages, /xじく/);
  assert.match(childPages, /zじく/);
  assert.match(adultPage, /軸/);
  assert.match(adultPage, /x軸/);
  assert.match(adultPage, /z軸/);
});

test('worksheet guidance and operation captions use the current wording', async () => {
  const html = await readDist('qa2.html');
  const text = visibleText(html);

  assert.match(text, /まわるじくとまわる量のちがいを、よく観察しよう。/);
  assert.doesNotMatch(text, /色だけでなくラベルでも見よう/);
  assert.doesNotMatch(text, /1回目のあと/);
  assert.doesNotMatch(text, /2回目のあと/);
  assert.doesNotMatch(text, /1こ目のあと/);
  assert.doesNotMatch(text, /2こ目のあと/);
  assert.match(html, /<ruby>まん中<rt>まんなか<\/rt><\/ruby>が<ruby>変身<rt>へんしん<\/rt><\/ruby>する/);
  assert.doesNotMatch(html, /class="cruby"/);
  assert.doesNotMatch(html, /まん<ruby>中<rt>なか<\/rt><\/ruby>/);
  assert.doesNotMatch(text, /まんなかがへんしんする/);
  assert.match(html, /<ruby>同<rt>おな<\/rt><\/ruby>じ/);
  assert.doesNotMatch(html, /<ruby>同じ<rt>おなじ<\/rt><\/ruby>/);
  assert.match(html, /<ruby>高<rt>こう<\/rt><\/ruby>とくてん/);
  assert.doesNotMatch(html, /<ruby>高<rt>たか<\/rt><\/ruby>とくてん/);
  assert.match(html, /からね。 <span class="inlinegates">[\s\S]*?＝ <span class="red">/);
  assert.doesNotMatch(html, /からね。 ＝ <span class="red">/);
  assert.match(text, /xじくとzじくのまん中のななめじくで半周。/);
  assert.doesNotMatch(text, /アダマール/);
  assert.match(text, /2つの道（レーン）をいれかえる命令/);
  assert.match(html, /class="statecap"/);
});

test('heading layout does not add flex gaps around ruby text', async () => {
  const html = await readDist('qa2.html');

  assert.doesNotMatch(html, /h2 \{[^}]*display:\s*flex/);
  assert.doesNotMatch(html, /h2 \{[^}]*gap:/);
  assert.match(html, /h2 \.dot \{[^}]*margin-right:\s*8px/);
});

test('adult page omits the removed quick-summary strip', async () => {
  const html = await readDist('qa2.html');

  assert.doesNotMatch(html, /3分でわかる要点/);
  assert.doesNotMatch(html, /class="adultsummary"/);
});

test('landing page links to the generated worksheet PDF and HTML preview', async () => {
  const html = await readDist('index.html');

  assert.match(html, /href="\.\/qa2-worksheet\.pdf"/);
  assert.match(html, /href="\.\/qa2\.html"/);
});

test('worksheet HTML rendering is idempotent in one process', () => {
  assert.equal(buildWorksheetHtml(), buildWorksheetHtml());
});

test('content gate markup renders to icons and does not leak raw tags', async () => {
  const html = await readDist('qa2.html');
  const sample = renderContentMarkup('<Gate name="X" /><GatePair name="Y" /><GateSeq names="H, Z, T" />');

  assert.doesNotMatch(html, /<Gate(?:Pair|Seq)?\b/);
  assert.doesNotMatch(sample, /<Gate(?:Pair|Seq)?\b/);
  assert.match(sample, /class="inlinegate"/);
  assert.match(sample, /class="inlinegates"/);
});

test('manuscript content is separated from the build entrypoint', async () => {
  const build = await readRepo('build.mjs');
  const content = await readRepo('content/worksheet-content.mjs');
  const worksheetCss = await readRepo('src/worksheet/worksheet.css');
  const pages = await readRepo('src/worksheet/pages.mjs');
  const artwork = await readRepo('src/worksheet/artwork.mjs');

  assert.ok(build.split('\n').length < 30);
  assert.match(build, /buildWorksheetHtml/);
  assert.doesNotMatch(build, /const PAIRS/);
  assert.doesNotMatch(build, /const TRIPLES_/);
  assert.doesNotMatch(build, /<style>/);
  assert.match(content, /export const PAIRS/);
  assert.match(content, /<Gate name="X" \/>/);
  assert.match(content, /subtitle: 'パズルゲーム <b>QA²<\/b> で あそびながら 完成させる 観察ノート'/);
  assert.match(content, /heroName: 'キュービット'/);
  assert.match(content, /sakuraStamp: \['よく', 'できました'\]/);
  assert.doesNotMatch(pages, /パズルゲーム <b>QA²<\/b> で あそびながら/);
  assert.doesNotMatch(pages, /キュービット\$\{/);
  assert.doesNotMatch(pages, /そろう！/);
  assert.doesNotMatch(artwork, /よく/);
  assert.doesNotMatch(artwork, /できました/);
  assert.match(worksheetCss, /@page \{ size: A4 portrait; margin: 0; \}/);
});

test('GitHub Pages nojekyll marker is generated', async () => {
  const marker = await readDist('.nojekyll');

  assert.equal(marker, '');
});
