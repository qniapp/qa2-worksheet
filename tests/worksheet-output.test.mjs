import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const readDist = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');

test('worksheet HTML contains the expected eight printable pages', async () => {
  const html = await readDist('qa2.html');

  assert.equal(html.match(/class="page/g)?.length, 8);
  assert.match(html, /QA²/);
  assert.match(html, /<ruby>自由研究<rt>じゆうけんきゅう<\/rt><\/ruby>/);
});

test('worksheet keeps axis wording in hiragana', async () => {
  const html = await readDist('qa2.html');

  assert.doesNotMatch(html, /軸/);
  assert.match(html, /xじく/);
  assert.match(html, /zじく/);
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
