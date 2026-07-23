import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { renderContentMarkup } from '../src/worksheet/artwork.mjs';
import { buildWorksheetHtml } from '../src/worksheet/site.mjs';

const readDist = path => readFile(new URL(`../dist/${path}`, import.meta.url), 'utf8');
const readRepo = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const visibleText = html => html
  .replace(/<rt>.*?<\/rt>/gs, '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, '');

// dist / repo のアーティファクトは全テストで共有するため一度だけ読み込む。
// 各 it を「アサーション 1 つ」に保つと同じファイルを何度も読み直すことになるので、
// トップレベル await で読み込んだ結果を使い回す。
const worksheetHtml = await readDist('qa2.html');
const worksheetText = visibleText(worksheetHtml);
const [childPages, adultPage] = worksheetHtml.split('<div class="page about">');
const landingHtml = await readDist('index.html');
const nojekyllMarker = await readDist('.nojekyll');
const buildSource = await readRepo('build.mjs');
const contentSource = await readRepo('content/worksheet-content.mjs');
const worksheetCss = await readRepo('src/worksheet/worksheet.css');
const pagesSource = await readRepo('src/worksheet/pages.mjs');
const artworkSource = await readRepo('src/worksheet/artwork.mjs');
const gateSample = renderContentMarkup('<Gate name="X" /><GatePair name="Y" /><GateSeq names="H, Z, T" />');

describe('ワークシート HTML のページ構成', () => {
  it('印刷ページがちょうど 8 ページある', () => {
    assert.equal(worksheetHtml.match(/class="page/g)?.length, 8);
  });

  it('QA² のタイトルを表示する', () => {
    assert.match(worksheetHtml, /QA²/);
  });

  it('自由研究 にふりがなを振る', () => {
    assert.match(worksheetHtml, /<ruby>自由研究<rt>じゆうけんきゅう<\/rt><\/ruby>/);
  });
});

describe('じく の表記が子ども向けページと大人向けページで異なる', () => {
  it('大人向けの解説ページが存在する', () => {
    assert.ok(adultPage);
  });

  it('子ども向けページには漢字の 軸 を出さない', () => {
    assert.doesNotMatch(childPages, /軸/);
  });

  it('どこでも 軸 をルビで囲まない', () => {
    assert.doesNotMatch(worksheetHtml, /<ruby>軸/);
  });

  it('子ども向けページでは x じくを xじく と書く', () => {
    assert.match(childPages, /xじく/);
  });

  it('子ども向けページでは z じくを zじく と書く', () => {
    assert.match(childPages, /zじく/);
  });

  it('大人向けページでは漢字の 軸 を使う', () => {
    assert.match(adultPage, /軸/);
  });

  it('大人向けページでは x軸 と書く', () => {
    assert.match(adultPage, /x軸/);
  });

  it('大人向けページでは z軸 と書く', () => {
    assert.match(adultPage, /z軸/);
  });
});

describe('ワークシートの説明文と操作キャプション', () => {
  it('まわるじくとまわる量のちがいを見くらべるよう促す', () => {
    assert.match(worksheetText, /まわるじくとまわる量のちがいを、よく見くらべよう。/);
  });

  it('まん中 と 変身 をそれぞれルビで囲む', () => {
    assert.match(worksheetHtml, /<ruby>まん中<rt>まんなか<\/rt><\/ruby>が<ruby>変身<rt>へんしん<\/rt><\/ruby>する/);
  });

  it('同 を おな とルビし じ は素のまま残す', () => {
    assert.match(worksheetHtml, /<ruby>同<rt>おな<\/rt><\/ruby>じ/);
  });

  it('同じ をまとめてルビにしない', () => {
    assert.doesNotMatch(worksheetHtml, /<ruby>同じ<rt>おなじ<\/rt><\/ruby>/);
  });

  it('高とくてん の 高 を こう とルビする', () => {
    assert.match(worksheetHtml, /<ruby>高<rt>こう<\/rt><\/ruby>とくてん/);
  });

  it('高とくてん の 高 を たか とルビしない', () => {
    assert.doesNotMatch(worksheetHtml, /<ruby>高<rt>たか<\/rt><\/ruby>とくてん/);
  });

  it('「いい！」のゲート例をインラインゲートアイコンで囲む', () => {
    assert.match(worksheetHtml, /いい<\/b>！ <span class="inlinegates">[\s\S]*?＝ <span class="red">/);
  });

  it('「いい！」の例をゲートアイコンなしで出さない', () => {
    assert.doesNotMatch(worksheetHtml, /いい<\/b>！ ＝ <span class="red">/);
  });

  it('H ゲートを「ななめじくで半周」と説明する', () => {
    assert.match(worksheetText, /xじくとzじくのまん中のななめじくで半周。/);
  });

  it('「アダマール」という語を使わない', () => {
    assert.doesNotMatch(worksheetText, /アダマール/);
  });

  it('SWAP を「2つの道（レーン）をいれかえる命令」と説明する', () => {
    assert.match(worksheetText, /2つの道（レーン）をいれかえる命令/);
  });

  it('状態キャプションに statecap クラスを付ける', () => {
    assert.match(worksheetHtml, /class="statecap"/);
  });
});

describe('見出しのレイアウト', () => {
  it('h2 を flex コンテナにしない', () => {
    assert.doesNotMatch(worksheetHtml, /h2 \{[^}]*display:\s*flex/);
  });

  it('h2 に gap を付けない', () => {
    assert.doesNotMatch(worksheetHtml, /h2 \{[^}]*gap:/);
  });

  it('h2 のドットに 8px の右マージンを保つ', () => {
    assert.match(worksheetHtml, /h2 \.dot \{[^}]*margin-right:\s*8px/);
  });
});

describe('ランディングページのリンク', () => {
  it('ワークシート PDF へリンクする', () => {
    assert.match(landingHtml, /href="\.\/qa2-worksheet\.pdf"/);
  });

  it('HTML プレビューへリンクする', () => {
    assert.match(landingHtml, /href="\.\/qa2\.html"/);
  });
});

describe('ワークシート HTML の生成', () => {
  it('同一プロセス内で冪等である', () => {
    assert.equal(buildWorksheetHtml(), buildWorksheetHtml());
  });
});

describe('コンテンツのゲート記法のレンダリング', () => {
  it('生成された HTML に素のゲートタグを残さない', () => {
    assert.doesNotMatch(worksheetHtml, /<Gate(?:Pair|Seq)?\b/);
  });

  it('新たにレンダリングしたサンプルに素のゲートタグを残さない', () => {
    assert.doesNotMatch(gateSample, /<Gate(?:Pair|Seq)?\b/);
  });

  it('単一ゲートをインラインゲートアイコンとして描画する', () => {
    assert.match(gateSample, /class="inlinegate"/);
  });

  it('ゲート列をインラインゲートアイコン群として描画する', () => {
    assert.match(gateSample, /class="inlinegates"/);
  });
});

describe('原稿コンテンツがビルドエントリポイントから分離されている', () => {
  it('ビルドエントリポイントを 30 行未満に保つ', () => {
    assert.ok(buildSource.split('\n').length < 30);
  });

  it('エントリポイントから buildWorksheetHtml を呼ぶ', () => {
    assert.match(buildSource, /buildWorksheetHtml/);
  });

  it('エントリポイントに PAIRS データを置かない', () => {
    assert.doesNotMatch(buildSource, /const PAIRS/);
  });

  it('エントリポイントに TRIPLES_ データを置かない', () => {
    assert.doesNotMatch(buildSource, /const TRIPLES_/);
  });

  it('エントリポイントにインラインスタイルを置かない', () => {
    assert.doesNotMatch(buildSource, /<style>/);
  });

  it('コンテンツモジュールから PAIRS をエクスポートする', () => {
    assert.match(contentSource, /export const PAIRS/);
  });

  it('コンテンツモジュールに X ゲートの記法を置く', () => {
    assert.match(contentSource, /<Gate name="X" \/>/);
  });

  it('コンテンツモジュールにサブタイトル文言を置く', () => {
    assert.match(contentSource, /subtitle: 'パズルゲーム <b>QA²<\/b> で あそびながら 完成させる 観察ノート'/);
  });

  it('コンテンツモジュールに heroName を置く', () => {
    assert.match(contentSource, /heroName: 'キュービット'/);
  });

  it('コンテンツモジュールに sakuraStamp を置く', () => {
    assert.match(contentSource, /sakuraStamp: \['よく', 'できました'\]/);
  });

  it('ページモジュールにサブタイトル文言を置かない', () => {
    assert.doesNotMatch(pagesSource, /パズルゲーム <b>QA²<\/b> で あそびながら/);
  });

  it('ページモジュールに キュービット の文字列補間を置かない', () => {
    assert.doesNotMatch(pagesSource, /キュービット\$\{/);
  });

  it('ページモジュールに そろう！ の文言を置かない', () => {
    assert.doesNotMatch(pagesSource, /そろう！/);
  });

  it('アートワークモジュールに よく のスタンプ文字を置かない', () => {
    assert.doesNotMatch(artworkSource, /よく/);
  });

  it('アートワークモジュールに できました のスタンプ文字を置かない', () => {
    assert.doesNotMatch(artworkSource, /できました/);
  });

  it('ワークシート CSS に @page ルールを保つ', () => {
    assert.match(worksheetCss, /@page \{ size: A4 portrait; margin: 0; \}/);
  });
});

describe('GitHub Pages のマーカー', () => {
  it('空の .nojekyll マーカーを生成する', () => {
    assert.equal(nojekyllMarker, '');
  });
});
