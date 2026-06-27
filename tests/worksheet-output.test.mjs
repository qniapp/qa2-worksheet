import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const readDist = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
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
});

test('landing page links to the generated worksheet PDF and HTML preview', async () => {
  const html = await readDist('index.html');

  assert.match(html, /href="\.\/qa2-worksheet\.pdf"/);
  assert.match(html, /href="\.\/qa2\.html"/);
});

test('GitHub Pages nojekyll marker is generated', async () => {
  const marker = await readDist('.nojekyll');

  assert.equal(marker, '');
});
