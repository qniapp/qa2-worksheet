#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);

function usage() {
  return `Usage: node scripts/check-visual-regression.mjs [options]\n\n` +
    `Options:\n` +
    `  --pdf <path>              比較する PDF。既定: dist/qa2-worksheet.pdf\n` +
    `  --baseline <dir>         基準画像ディレクトリ。既定: tests/visual/baseline\n` +
    `  --work-dir <dir>         現在画像と差分画像の出力先。未指定なら /tmp に作成\n` +
    `  --dpi <number>           PDF 変換時の DPI。既定: 150\n` +
    `  --pages <number>         比較するページ数。既定: 8\n` +
    `  --max-diff-pixels <n>    許容する差分ピクセル数。既定: 0\n` +
    `  --update                 現在の PDF 画像で基準画像を更新する\n`;
}

function readFlag(name, fallback) {
  const index = args.indexOf(name);
  if (index === -1) return fallback;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) {
    throw new Error(`${name} の値を指定してください。`);
  }
  return value;
}

function readNumberFlag(name, fallback) {
  const value = Number(readFlag(name, String(fallback)));
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} には 0 以上の数を指定してください。`);
  }
  return value;
}

function run(command, commandArgs, options = {}) {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8', ...options });
  if (result.error?.code === 'ENOENT') {
    throw new Error(`${command} が見つかりません。必要な OS パッケージをインストールしてください。`);
  }
  return result;
}

function requireSuccess(command, commandArgs) {
  const result = run(command, commandArgs);
  if (result.status !== 0) {
    throw new Error([
      `${command} ${commandArgs.join(' ')} が失敗しました。`,
      result.stdout.trim(),
      result.stderr.trim(),
    ].filter(Boolean).join('\n'));
  }
  return result;
}

function commandExists(command) {
  const result = spawnSync(command, ['-version'], { stdio: 'ignore' });
  return result.status === 0;
}

function compareCommand() {
  if (commandExists('magick')) return { command: 'magick', argsPrefix: ['compare'] };
  if (commandExists('compare')) return { command: 'compare', argsPrefix: [] };
  throw new Error('ImageMagick の compare または magick が見つかりません。');
}

function parseMetric(result) {
  const text = `${result.stderr}\n${result.stdout}`.trim();
  const match = text.match(/([0-9]+(?:\.[0-9]+)?(?:e[+-]?\d+)?)/i);
  if (!match) {
    throw new Error(`ImageMagick の差分値を読み取れませんでした: ${text}`);
  }
  return Number(match[1]);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(usage());
  process.exit(0);
}

const pdfPath = resolve(readFlag('--pdf', 'dist/qa2-worksheet.pdf'));
const baselineDir = resolve(readFlag('--baseline', 'tests/visual/baseline'));
const configuredWorkDir = readFlag('--work-dir', null);
const workDir = configuredWorkDir ?? mkdtempSync(join(tmpdir(), 'qa2-worksheet-visual-'));
const actualDir = resolve(workDir, 'actual');
const diffDir = resolve(workDir, 'diff');
const dpi = readNumberFlag('--dpi', 150);
const pageCount = readNumberFlag('--pages', 8);
const maxDiffPixels = readNumberFlag('--max-diff-pixels', 0);
const updateBaseline = args.includes('--update');

if (!existsSync(pdfPath)) {
  throw new Error(`PDF が見つかりません: ${pdfPath}`);
}
if (!updateBaseline && !existsSync(baselineDir)) {
  throw new Error(`基準画像ディレクトリが見つかりません: ${baselineDir}`);
}

rmSync(actualDir, { recursive: true, force: true });
rmSync(diffDir, { recursive: true, force: true });
mkdirSync(actualDir, { recursive: true });
mkdirSync(diffDir, { recursive: true });

requireSuccess('pdftoppm', ['-png', '-r', String(dpi), pdfPath, join(actualDir, 'page')]);

if (updateBaseline) {
  mkdirSync(baselineDir, { recursive: true });
  for (let page = 1; page <= pageCount; page += 1) {
    const actualPath = join(actualDir, `page-${page}.png`);
    if (!existsSync(actualPath)) {
      throw new Error(`現在画像が見つかりません: ${actualPath}`);
    }
    copyFileSync(actualPath, join(baselineDir, `page-${page}.png`));
  }
  console.log(`updated visual baseline: ${baselineDir}`);
  console.log(`source images: ${actualDir}`);
  process.exit(0);
}

const tool = compareCommand();
const failures = [];
for (let page = 1; page <= pageCount; page += 1) {
  const baselinePath = join(baselineDir, `page-${page}.png`);
  const actualPath = join(actualDir, `page-${page}.png`);
  const diffPath = join(diffDir, `page-${page}.png`);
  if (!existsSync(baselinePath)) {
    failures.push({ page, diffPixels: Number.POSITIVE_INFINITY, reason: `基準画像がありません: ${baselinePath}` });
    continue;
  }
  if (!existsSync(actualPath)) {
    failures.push({ page, diffPixels: Number.POSITIVE_INFINITY, reason: `現在画像がありません: ${actualPath}` });
    continue;
  }
  const result = run(tool.command, [...tool.argsPrefix, '-metric', 'AE', baselinePath, actualPath, diffPath]);
  if (result.status !== 0 && result.status !== 1) {
    failures.push({ page, diffPixels: Number.POSITIVE_INFINITY, reason: result.stderr.trim() || result.stdout.trim() });
    continue;
  }
  const diffPixels = parseMetric(result);
  console.log(`page ${page}: ${diffPixels} diff pixels`);
  if (diffPixels > maxDiffPixels) {
    failures.push({ page, diffPixels, reason: `許容値 ${maxDiffPixels} を超えました` });
  }
}

if (failures.length > 0) {
  console.error('\n視覚回帰チェックで差分が見つかりました。');
  for (const failure of failures) {
    console.error(`- page ${failure.page}: ${failure.diffPixels} diff pixels (${failure.reason})`);
  }
  console.error(`現在画像: ${actualDir}`);
  console.error(`差分画像: ${diffDir}`);
  process.exit(1);
}

console.log(`visual regression: PASS (${pageCount} pages matched baseline)`);
console.log(`current images: ${actualDir}`);
console.log(`diff images: ${diffDir}`);
