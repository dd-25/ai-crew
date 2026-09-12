# claude-crew

Dhruv's Claude Code setup as one repo: a standing team of agents, the skills that hold
their rules, the standards they work to, and the config that ties it together.

This repo **is** `~/.claude`. Clone it there and everything is live in every project on
that machine — no per-project install, no symlinks, nothing to copy.

    git clone https://github.com/dd-25/claude-crew.git ~/.claude

A machine that already has a `~/.claude` needs the recovery path in [SETUP.md](SETUP.md).

## Layout

    CLAUDE.md        standing orders. Loaded every session, so it stays short.
    SETUP.md         machine bootstrap. Read only when setting up or when a tool is missing.
    settings.json    portable config: model, permissions, hooks, plugins, marketplaces.

    agents/          11 specialists, dispatchable by name as subagent_type.
    skills/          19 skills. Every rule lives here, exactly once.
    standards/       engineering, performance, architecture, docs, style.
    hooks/           session-end hook.

    registry/        agents.md (roster), tools.md (validated + rejected), log.md (dispatches).
    domains/         standing context per area: career/, build/.

## How it holds together

**The supervisor is the main thread, not an agent.** It already holds the conversation and
the correction history. An agent whose only job is dispatching other agents burns a whole
context window forwarding messages — and a subagent cannot dispatch a subagent anyway.

**Agents are thin; skills are thick.** An agent file carries only what is agent-specific:
its tools, its model, and the receipt shape it returns. The rules live in
`skills/<name>/SKILL.md`, one copy. Two copies of a rule drift, and the drift is silent.

**Specialists are separated by their refusals, not their titles.** `senior-code-reviewer`
has no Edit tool, so it cannot start fixing instead of reviewing. `explorer` cannot install.
`career-assistant` cannot send. Two roles with the same refusals are one role in two hats.

**State lives in the target repo, not in anyone's memory.** The first dispatch into a repo
scaffolds `.claude/crew/` — `CONTEXT.md`, `DECISIONS.md` (append-only), `BOARD.md`,
`QUESTIONS.md`. Agents are stateless; those four files are what survives the session.

**Blocks escalate, they do not interrupt.** An agent checks `DECISIONS.md` first, then tags
a question for a peer, and only reaches Dhruv for the things that are genuinely his — money,
priority, an external account, a taste call with no precedent. One batched message, never a
queue of interruptions.

**Nothing invents a value.** A field that cannot be derived is written `UNSET` and left
that way. A guessed stack or test command becomes a fact every later agent inherits.

## What is deliberately not in here

| Excluded | Why |
|---|---|
| `.credentials.json`, OAuth tokens | secrets, never in git |
| `settings.local.json` | machine-specific paths that feed safety decisions |
| `plugins/` | declared in `settings.json`; reinstalled from their marketplaces |
| MCP server config | lives in `~/.claude.json` next to API keys — see SETUP.md |
| `projects/`, `sessions/`, `history.jsonl`, `shell-snapshots/` | transcripts: large, machine-local, and full of project content |
| every cache | regenerates |

`.gitignore` is an allowlist — ignore everything, re-include named paths — so the next
cache file Claude Code invents does not leak by default.

## Keeping it current

A change to an agent, skill, standard, hook, registry or domain is a change to the team, so
it gets its own commit as it happens. The session-end hook pushes. Another machine runs
`git pull` in `~/.claude`.
