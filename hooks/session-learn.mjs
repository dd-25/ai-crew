#!/usr/bin/env node
/**
 * Stop hook: fires the `learn` skill once per session, only when the session
 * did real work. Fully automatic - no approval step.
 *
 * Safety:
 *  - honours stop_hook_active so it can never loop
 *  - one marker file per session id, so it fires at most once
 *  - any error exits 0 silently; a broken hook must never block a session
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const CLAUDE_DIR = path.join(os.homedir(), '.claude');
const STATE_DIR = path.join(CLAUDE_DIR, '.learn-state');

const EDIT_TOOLS = new Set(['Edit', 'Write', 'NotebookEdit', 'MultiEdit']);
const MIN_EDITS = 1;          // any file change counts as real work
const MIN_ASSISTANT_MSGS = 12; // or a long discussion with no edits

const quit = () => process.exit(0);

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function sessionDidWork(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return false;
  let edits = 0;
  let assistantMsgs = 0;
  for (const line of fs.readFileSync(transcriptPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const msg = entry.message;
    if (!msg || msg.role !== 'assistant') continue;
    assistantMsgs++;
    const content = Array.isArray(msg.content) ? msg.content : [];
    for (const block of content) {
      if (block?.type === 'tool_use' && EDIT_TOOLS.has(block.name)) edits++;
    }
  }
  return edits >= MIN_EDITS || assistantMsgs >= MIN_ASSISTANT_MSGS;
}

const PROMPT = [
  'Session ending. Run the `learn` skill now (~/.claude/skills/learn/SKILL.md).',
  '',
  'Review this session for ONE durable lesson worth persisting: a correction I made,',
  'a preference I stated, a mistake repeated, a technique that clearly worked, or a',
  'standard that was wrong.',
  '',
  'If there is one: edit the correct existing file under ~/.claude/standards/ or',
  '~/.claude/skills/ in place (sharpen a rule, do not append a pile), append one line',
  'to ~/.claude/LEARNINGS.md, and report it in a single line prefixed [learn].',
  '',
  'If there is no durable lesson - the normal case - write nothing, say nothing,',
  'and stop immediately. Do not summarise the session. Do not explain that you found',
  'nothing. Do not capture project-specific facts; those belong in the project CLAUDE.md.',
].join('\n');

function main() {
  let input = {};
  try {
    input = JSON.parse(readStdin() || '{}');
  } catch {
    quit();
  }

  // Never loop: if we already blocked this stop, let it end.
  if (input.stop_hook_active) quit();

  const sessionId = input.session_id;
  if (!sessionId) quit();

  fs.mkdirSync(STATE_DIR, { recursive: true });
  const marker = path.join(STATE_DIR, `${String(sessionId).replace(/[^\w.-]/g, '_')}.done`);
  if (fs.existsSync(marker)) quit();

  if (!sessionDidWork(input.transcript_path)) quit();

  fs.writeFileSync(marker, new Date().toISOString());

  // Best-effort cleanup of markers older than 30 days.
  try {
    const cutoff = Date.now() - 30 * 864e5;
    for (const f of fs.readdirSync(STATE_DIR)) {
      const p = path.join(STATE_DIR, f);
      if (fs.statSync(p).mtimeMs < cutoff) fs.unlinkSync(p);
    }
  } catch { /* ignore */ }

  // fs.writeSync, not process.stdout.write: stdout to a pipe is async on Windows,
  // so an immediate process.exit() truncates it and the hook silently emits nothing.
  fs.writeSync(1, JSON.stringify({ decision: 'block', reason: PROMPT }));
  process.exit(0);
}

try {
  main();
} catch {
  quit();
}
