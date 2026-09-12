#!/usr/bin/env node
/**
 * Stop hook: fires the `learn` skill once per session, and only when the session
 * carried a durable-lesson signal. Fully automatic - no approval step.
 *
 * Gating on "did real work" fired on every session with a single edit, which is
 * most of them. A file edit is not a lesson. What predicts a lesson is Dhruv
 * correcting something or stating a standing preference, and both of those appear
 * in HIS messages - which the old gate never read.
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

const MIN_ASSISTANT_MSGS = 6; // floor: a two-line exchange has nothing to teach

// A correction ("don't do that", "I said X") or a standing preference ("from now on",
// "always") is what `learn` exists to capture. Phrases over bare words: "no" matches
// "no problem", "actually" matches half of ordinary speech.
const LESSON_SIGNAL =
  /\b(?:do ?n[o']?t|i said|i told you|you keep|did it again|should ?n[o']?t|should have|why (?:did|are) you|that'?s (?:not|wrong)|not like that|revert that|undo that|from now on|going forward|always|never|remember to|instead of|stop (?:doing|adding|writing|using))\b/i;

// System reminders are injected into user turns and are full of imperatives. Matching
// them would fire the hook on every session regardless of what Dhruv actually said.
const stripInjected = (s) => s.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, ' ');

const quit = () => process.exit(0);

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

// One pass over the transcript: O(n) in its byte size, one regex test per user turn.
// Transcripts reach a few MB; this stays well under the hook's budget.
function sessionHasLesson(transcriptPath) {
  if (!transcriptPath || !fs.existsSync(transcriptPath)) return false;
  let assistantMsgs = 0;
  let signal = false;

  for (const line of fs.readFileSync(transcriptPath, 'utf8').split('\n')) {
    if (!line.trim()) continue;
    let entry;
    try {
      entry = JSON.parse(line);
    } catch {
      continue;
    }
    const msg = entry.message;
    if (!msg) continue;

    if (msg.role === 'assistant') {
      assistantMsgs++;
      continue;
    }
    if (msg.role !== 'user' || signal) continue;

    // Only what the human typed. Tool results arrive as user turns too, and a stderr
    // dump containing "do not" is not Dhruv correcting anything.
    const blocks = Array.isArray(msg.content)
      ? msg.content.filter((b) => b?.type === 'text').map((b) => b.text)
      : typeof msg.content === 'string'
        ? [msg.content]
        : [];
    for (const text of blocks) {
      if (text && LESSON_SIGNAL.test(stripInjected(text))) {
        signal = true;
        break;
      }
    }
  }

  return signal && assistantMsgs >= MIN_ASSISTANT_MSGS;
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

  if (!sessionHasLesson(input.transcript_path)) quit();

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
