#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const DEFAULT_REPO = 'qniapp/qa2-worksheet';
const DEFAULT_ORCA = 'orca-ide';
const DEFAULT_BASE_BRANCH = 'origin/master';

function parseArgs(argv) {
  const args = {
    repo: process.env.QA2_WORKSHEET_GITHUB_REPO || DEFAULT_REPO,
    orca: process.env.ORCA_CLI || DEFAULT_ORCA,
    baseBranch: process.env.QA2_WORKSHEET_BASE_BRANCH || DEFAULT_BASE_BRANCH,
    maxActive: 2,
    cleanupCompleted: false,
    start: null,
    watchSeconds: 0,
    intervalSeconds: 60,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--repo') args.repo = argv[++i];
    else if (arg === '--orca') args.orca = argv[++i];
    else if (arg === '--base-branch') args.baseBranch = argv[++i];
    else if (arg === '--max-active') args.maxActive = Number(argv[++i]);
    else if (arg === '--cleanup-completed') args.cleanupCompleted = true;
    else if (arg === '--start') args.start = Number(argv[++i]);
    else if (arg === '--watch-seconds') args.watchSeconds = Number(argv[++i]);
    else if (arg === '--interval-seconds') args.intervalSeconds = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/orca-commander-tick.mjs [options]\n\nOptions:\n  --repo OWNER/REPO          GitHub repository (default: ${DEFAULT_REPO})\n  --orca COMMAND             Orca CLI command (default: ${DEFAULT_ORCA})\n  --base-branch REF          Base branch for new worktrees (default: ${DEFAULT_BASE_BRANCH})\n  --max-active N             Target max active implementation worktrees (default: 2)\n  --cleanup-completed        Remove clean completed/closed issue worktrees\n  --start ISSUE_NUMBER       Create an Orca worktree and Pi worker for one issue\n  --watch-seconds SECONDS    Repeat status ticks for this duration\n  --interval-seconds SECONDS Poll interval when watching (default: 60)\n`);
}

function run(command, args, options = {}) {
  try {
    const output = execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', options.quiet ? 'pipe' : 'inherit'],
      cwd: options.cwd || process.cwd(),
    });
    return output.trim();
  } catch (error) {
    const stderr = error.stderr ? String(error.stderr).trim() : '';
    const detail = stderr ? `\n${stderr}` : '';
    throw new Error(`Command failed: ${command} ${args.join(' ')}${detail}`, { cause: error });
  }
}

function json(command, args, options = {}) {
  const output = run(command, args, { ...options, quiet: true });
  return output ? JSON.parse(output) : null;
}

function tryJson(command, args, fallback = null) {
  try {
    return json(command, args);
  } catch {
    return fallback;
  }
}

function sleep(seconds) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, seconds * 1000);
}

function labelNames(issue) {
  return (issue.labels || []).map((label) => label.name);
}

function isReadyForAgent(issue) {
  return labelNames(issue).includes('ready-for-agent');
}

function blockedBy(issue) {
  const body = issue.body || '';
  const match = body.match(/## Blocked by\s*([\s\S]*?)(?:\n## |$)/i);
  if (!match) return [];
  const section = match[1];
  if (/\bNone\b|なし/.test(section)) return [];
  const blockers = new Set();
  for (const item of section.matchAll(/issues\/(\d+)/g)) blockers.add(Number(item[1]));
  for (const item of section.matchAll(/#(\d+)/g)) blockers.add(Number(item[1]));
  return [...blockers].sort((a, b) => a - b);
}

function issueNumberFromWorktree(worktree) {
  if (Number.isInteger(worktree.linkedIssue)) return worktree.linkedIssue;
  const source = [worktree.displayName, worktree.branch, worktree.comment, worktree.path].filter(Boolean).join('\n');
  const issueNameMatch = source.match(/(?:issue-|issues\/)(\d+)\b/i);
  if (issueNameMatch) return Number(issueNameMatch[1]);
  const hashMatch = source.match(/#(\d+)\b/);
  return hashMatch ? Number(hashMatch[1]) : null;
}

function issueNumbersFromOpenPr(pr) {
  return (pr.closingIssuesReferences || []).map((issue) => issue.number).filter(Number.isInteger);
}

function issueIsUnblocked(issue, openIssueNumbers) {
  if (blockedBy(issue).some((number) => openIssueNumbers.has(number))) return false;
  return true;
}

function isDispatchableIssue(issue) {
  const title = issue.title || '';
  if (/^PRD[:：]/i.test(title)) return false;
  return isReadyForAgent(issue);
}

function short(value) {
  return value ? String(value).slice(0, 8) : '';
}

function gitStatus(path) {
  if (!path || !existsSync(path)) return { ok: false, clean: false, text: 'missing path' };
  try {
    const text = run('git', ['-C', path, 'status', '--short', '--branch'], { quiet: true });
    const lines = text.split('\n').filter(Boolean);
    return { ok: true, clean: lines.length <= 1, text };
  } catch (error) {
    return { ok: false, clean: false, text: error.message };
  }
}

function worktreeSelector(worktree) {
  const issueNumber = issueNumberFromWorktree(worktree);
  if (Number.isInteger(worktree.linkedIssue) && Number.isInteger(issueNumber)) return `issue:${issueNumber}`;
  return `path:${worktree.path}`;
}

function stopAndCloseTerminals(orca, worktree) {
  const terminals = tryJson(orca, ['terminal', 'list', '--worktree', worktreeSelector(worktree), '--json'], {
    result: { terminals: [] },
  });
  for (const terminal of terminals?.result?.terminals || []) {
    spawnSync(orca, ['terminal', 'stop', '--terminal', terminal.handle, '--json'], { stdio: 'ignore' });
    spawnSync(orca, ['terminal', 'close', '--terminal', terminal.handle, '--json'], { stdio: 'ignore' });
  }
}

function getState(args) {
  const issues = json('gh', [
    'issue',
    'list',
    '--repo',
    args.repo,
    '--state',
    'open',
    '--limit',
    '100',
    '--json',
    'number,title,body,labels,state,url',
  ]);
  const openIssueNumbers = new Set(issues.map((issue) => issue.number));
  const prs = json('gh', [
    'pr',
    'list',
    '--repo',
    args.repo,
    '--state',
    'open',
    '--json',
    'number,title,headRefName,isDraft,url,closingIssuesReferences',
  ]);
  const openPrIssueNumbers = new Set(prs.flatMap(issueNumbersFromOpenPr));
  const current = json(args.orca, ['worktree', 'current', '--json']);
  const repoId = current.result.worktree.repoId;
  const worktreeList = json(args.orca, ['worktree', 'list', '--repo', `id:${repoId}`, '--json']);
  const worktrees = worktreeList.result.worktrees || [];
  const activeWorktrees = worktrees.filter((worktree) => {
    const issueNumber = issueNumberFromWorktree(worktree);
    return (
      !worktree.isMainWorktree &&
      Number.isInteger(issueNumber) &&
      worktree.workspaceStatus !== 'completed' &&
      openIssueNumbers.has(issueNumber)
    );
  });
  const activeIssueNumbers = new Set(activeWorktrees.map(issueNumberFromWorktree));
  const cleanupCandidates = worktrees.filter((worktree) => {
    const issueNumber = issueNumberFromWorktree(worktree);
    return (
      !worktree.isMainWorktree &&
      Number.isInteger(issueNumber) &&
      (worktree.workspaceStatus === 'completed' || !openIssueNumbers.has(issueNumber))
    );
  });
  const readyCandidates = issues
    .filter(isDispatchableIssue)
    .filter((issue) => issueIsUnblocked(issue, openIssueNumbers))
    .filter((issue) => !activeIssueNumbers.has(issue.number))
    .filter((issue) => !openPrIssueNumbers.has(issue.number))
    .sort((a, b) => {
      const aHasBlockerHistory = blockedBy(a).length > 0;
      const bHasBlockerHistory = blockedBy(b).length > 0;
      if (aHasBlockerHistory !== bHasBlockerHistory) return aHasBlockerHistory ? 1 : -1;
      return a.number - b.number;
    });

  return { issues, openIssueNumbers, prs, openPrIssueNumbers, worktrees, activeWorktrees, cleanupCandidates, readyCandidates };
}

function printState(state, args) {
  console.log(`\n=== Orca commander tick ${new Date().toISOString()} ===`);

  console.log('\nOpen PRs:');
  if (state.prs.length === 0) console.log('  none');
  for (const pr of state.prs) {
    const issues = issueNumbersFromOpenPr(pr);
    console.log(`  #${pr.number} ${pr.title} issues=[${issues.join(',') || 'unknown'}] head=${pr.headRefName} draft=${pr.isDraft} ${pr.url}`);
  }

  console.log('\nActive worktrees:');
  if (state.activeWorktrees.length === 0) console.log('  none');
  for (const worktree of state.activeWorktrees) {
    const issueNumber = issueNumberFromWorktree(worktree);
    const status = gitStatus(worktree.path);
    console.log(
      `  ${worktree.displayName}: issue=#${issueNumber} status=${worktree.workspaceStatus} branch=${worktree.branch} head=${short(worktree.head)} clean=${status.clean} comment=${JSON.stringify(worktree.comment || '')}`,
    );
  }

  console.log('\nCleanup candidates:');
  if (state.cleanupCandidates.length === 0) console.log('  none');
  for (const worktree of state.cleanupCandidates) {
    const issueNumber = issueNumberFromWorktree(worktree);
    const status = gitStatus(worktree.path);
    console.log(`  ${worktree.displayName}: issue=#${issueNumber} status=${worktree.workspaceStatus} clean=${status.clean} path=${worktree.path}`);
  }

  console.log(`\nReady candidates not active and without open PR (max-active=${args.maxActive}):`);
  if (state.readyCandidates.length === 0) console.log('  none');
  for (const issue of state.readyCandidates) {
    const blockers = blockedBy(issue);
    console.log(`  #${issue.number} ${issue.title} blockers=[${blockers.join(',') || 'none'}] ${issue.url}`);
  }

  const freeSlots = Math.max(0, args.maxActive - state.activeWorktrees.length);
  console.log(`\nParallel slots available: ${freeSlots}`);
  if (freeSlots > 0 && state.readyCandidates.length > 0) {
    console.log(`Suggested start: node scripts/orca-commander-tick.mjs --start ${state.readyCandidates[0].number}`);
  }
}

function cleanupCompleted(state, args) {
  for (const worktree of state.cleanupCandidates) {
    const issueNumber = issueNumberFromWorktree(worktree);
    const status = gitStatus(worktree.path);
    if (!status.clean) {
      console.log(`skip cleanup ${worktree.displayName}: git status is not clean`);
      continue;
    }

    console.log(`cleanup ${worktree.displayName}: issue #${issueNumber}`);
    stopAndCloseTerminals(args.orca, worktree);
    run(args.orca, ['worktree', 'rm', '--worktree', worktreeSelector(worktree), '--json'], { quiet: true });
  }
}

function buildWorkerPrompt(issue) {
  return `Issue #${issue.number} を fresh /implement として開始してください。\n\nIssue: ${issue.url}\nParent/PRD が issue 本文にある場合はそれも読んでください。\n\n必ず最初に読む:\n- AGENTS.md\n- README.md\n- docs/agents/issue-tracker.md\n- docs/agents/matt-workflow.md\n- GitHub issue #${issue.number} body\n\n運用:\n- /to-issues 由来の ready-for-agent issue なら /triage は不要です。\n- scope creep を避け、issue の Non-goals / Blocked by を守ってください。\n- PDF / HTML の見た目に影響する変更では、AGENTS.md の PDF デザイン変更時ルールを完了条件にしてください。\n- PDF / HTML の見た目に影響する変更では、docs/review/issue-${issue.number}/ などに全ページ画像を保存し、PR 本文へ確認用画像を埋め込んでください。\n- 画像埋め込みは https://github.com/qniapp/qa2-worksheet/blob/<commit>/path?raw=true 形式を使ってください。raw.githubusercontent.com 直リンクや /tmp パスは使わないでください。\n- Acceptance criteria の進捗は issue 本文を編集して管理してください。\n- GitHub issue / PR コメントは日本語で書いてください。\n\n完了条件:\n- 該当テスト / npm run build が必要な変更なら PDF 再生成 / git diff --check を実行してください。\n- PDF / HTML の見た目に影響する変更では、全ページ画像確認と Design Critique PASS を確認してください。\n- /review master 相当で Standards / Spec を確認してください。\n- 問題なければ draft PR を作成してください。\n- merge はしないでください。\n- 進捗・blocker・PR URL は terminal 返信ではなく GitHub issue #${issue.number} に日本語コメントとして残してください。`;
}

function startIssue(issueNumber, state, args) {
  const issue = state.issues.find((candidate) => candidate.number === issueNumber);
  if (!issue) throw new Error(`Issue #${issueNumber} is not open or was not in the fetched issue list`);
  if (!isReadyForAgent(issue)) throw new Error(`Issue #${issueNumber} does not have ready-for-agent label`);
  if (!issueIsUnblocked(issue, state.openIssueNumbers)) {
    throw new Error(`Issue #${issueNumber} is still blocked by open issue(s): ${blockedBy(issue).join(', ')}`);
  }
  if (state.activeWorktrees.some((worktree) => issueNumberFromWorktree(worktree) === issueNumber)) {
    throw new Error(`Issue #${issueNumber} already has an active worktree`);
  }
  if (state.openPrIssueNumbers.has(issueNumber)) {
    throw new Error(`Issue #${issueNumber} already has an open PR`);
  }

  const prompt = buildWorkerPrompt(issue);
  console.log(`starting issue #${issueNumber}: ${issue.title}`);
  run(args.orca, [
    'worktree',
    'create',
    '--name',
    `issue-${issueNumber}`,
    '--base-branch',
    args.baseBranch,
    '--issue',
    String(issueNumber),
    '--agent',
    'pi',
    '--prompt',
    prompt,
    '--setup',
    'run',
    '--comment',
    `#${issueNumber} started: fresh /implement`,
    '--json',
  ]);

  const comment = `司令塔メモ: #${issueNumber} の fresh \`/implement\` を Orca worktree \`issue-${issueNumber}\` で開始しました。\n\nworker には、進捗・blocker・PR URL を terminal ではなくこの issue の日本語コメントに残すよう依頼しています。`;
  run('gh', ['issue', 'comment', String(issueNumber), '--repo', args.repo, '--body', comment], { quiet: true });
}

function tick(args) {
  const state = getState(args);
  printState(state, args);
  if (args.cleanupCompleted) cleanupCompleted(state, args);
  if (args.start !== null) startIssue(args.start, state, args);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.watchSeconds > 0 && args.start !== null) {
    throw new Error('--start cannot be combined with --watch-seconds');
  }

  const started = Date.now();
  while (true) {
    tick(args);
    const elapsedSeconds = Math.floor((Date.now() - started) / 1000);
    if (args.watchSeconds <= 0 || elapsedSeconds >= args.watchSeconds) break;
    sleep(Math.min(args.intervalSeconds, args.watchSeconds - elapsedSeconds));
  }
}

try {
  main();
} catch (error) {
  console.error(`orca-commander-tick failed: ${error.message}`);
  process.exit(1);
}
