#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);

function usage() {
  return `Usage: node scripts/render-pdf-pages.mjs <pdf> <output-dir> [--dpi 150]\n\n` +
    `PDF を pdftoppm で page-1.png ... page-N.png に変換します。`;
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

function positionalArgs() {
  const out = [];
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith('--')) {
      i += 1;
      continue;
    }
    out.push(args[i]);
  }
  return out;
}

function run(command, commandArgs) {
  const result = spawnSync(command, commandArgs, { encoding: 'utf8' });
  if (result.error?.code === 'ENOENT') {
    throw new Error(`${command} が見つかりません。poppler-utils をインストールしてください。`);
  }
  if (result.status !== 0) {
    throw new Error([
      `${command} ${commandArgs.join(' ')} が失敗しました。`,
      result.stdout.trim(),
      result.stderr.trim(),
    ].filter(Boolean).join('\n'));
  }
  return result;
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(usage());
  process.exit(0);
}

const [pdfInput, outputInput] = positionalArgs();
if (!pdfInput || !outputInput) {
  console.log(usage());
  process.exit(1);
}

const dpi = Number(readFlag('--dpi', '150'));
if (!Number.isFinite(dpi) || dpi <= 0) {
  throw new Error('--dpi には正の数を指定してください。');
}

const pdfPath = resolve(pdfInput);
const outputDir = resolve(outputInput);
if (!existsSync(pdfPath)) {
  throw new Error(`PDF が見つかりません: ${pdfPath}`);
}

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

run('pdftoppm', ['-png', '-r', String(dpi), pdfPath, join(outputDir, 'page')]);

console.log(`rendered ${pdfPath} -> ${outputDir}`);
