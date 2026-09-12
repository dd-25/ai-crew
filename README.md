# crew

Dhruv's standing team, as Claude Code agents and skills. Not a framework, not a runtime —
files that Claude Code already reads.

## How to use it

    cd D:\Coding\Projects\crew
    claude

The main thread becomes the supervisor. Ask for anything; it routes.

To use the team on another project, dispatch from here with paths into that project, or
symlink `.claude/agents/` into `~/.claude/agents/` to make every role available everywhere.

## What is in here

    CLAUDE.md              the supervisor's standing orders
    .claude/agents/        11 specialists, dispatchable by name
    .claude/skills/
      crew/                routing table, dispatch contract, auto-update rules
      hiring-a-specialist/ how a new role gets created when nobody fits
      tool-scouting/       how a candidate tool gets evaluated and mostly rejected
    registry/
      agents.md            who exists, what they own, what they refuse
      tools.md             validated tools, and the rejections that stop re-litigation
      log.md               append-only record of every dispatch
    domains/
      career/              job hunt context; pipeline lives in ../jopply
      build/               side projects

## The design in four lines

The supervisor is the main thread, not an agent — it already holds the conversation, and a
dispatch-only agent burns a context window forwarding messages.

Specialists are separated by their **refusals**, not their titles. The reviewer has no Edit
tool; the explorer cannot install; nothing ships without a review. Two roles with the same
refusals are one role wearing two hats.

Hiring happens on the **second** occurrence of an unowned task, never the first. The
`hiring-a-specialist` skill writes the agent file and returns a prompt usable immediately,
because new agent files only register as `subagent_type` at session start.

No LangGraph. It needs an API key that does not exist here, and skills plus agents do the
same routing at zero cost. Revisit when there is a key and a reason to run unattended.

## Auto-update

The team edits itself: a correction that will recur goes into that agent's file, a proven
tool goes into `registry/tools.md`, a new role goes into `registry/agents.md`, and every
dispatch appends one line to `registry/log.md`. `registry/log.md` is append-only.
