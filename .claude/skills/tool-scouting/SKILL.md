---
name: tool-scouting
description: Use when the explorer is looking for a better tool, MCP server, plugin, or approach, or when someone proposes adopting one. Covers how to evaluate a candidate before it enters registry/tools.md and how to reject most of them.
---

# Tool scouting

Most new tools are worse than the thing already installed. The job is not finding tools,
it is **rejecting them cheaply** and being right about the few that stay.

## The bar

A candidate enters `registry/tools.md` only if it beats the current approach on something
measurable, not on its README. Write the number down.

## Evaluate in this order — stop at the first failure

1. **Does the current setup already do this?** Claude Code has WebSearch, WebFetch, Bash,
   a Chrome MCP, context7. Most proposals duplicate one of these. Stop here usually.
2. **What does it cost to run?** API key, paid tier, a daemon, a login session. Dhruv has
   Claude Code and no spare API keys. A tool needing a key is not adoptable today — say so
   and stop.
3. **What does it need access to?** A tool wanting a session cookie, a password, or an
   OAuth token gets escalated to Dhruv, never adopted by an agent. Cookie-scraping tools
   get accounts terminated — this already came up with Apollo and LinkedIn.
4. **Is it maintained?** Last commit, open issue count, whether the vendor it wraps has
   already sued or banned similar tools.
5. **Try it on one real task.** Not the demo. A real task from `registry/log.md` that was
   annoying. Record what it did.

## Recording a keeper

In `registry/tools.md`:

```
## <name>
what: <one line>
good at: <the specific job it beats the alternative on>
costs: <key / session / latency / money>
risk: <ban, data exposure, breakage>
verified: <date> on <the real task you ran>
who uses it: <which agents>
```

`verified` is a date and a task, never "looks good". An unverified entry is a rumour.

## Recording a rejection

Rejections are the more valuable half — they stop the same tool being re-proposed every
month. One line in `registry/tools.md` under `## Rejected`: name, date, the one reason.

## Reporting to the supervisor

```
FOUND     <name> — <what it beats and by how much>
COSTS     <access, money, risk>
VERIFIED  <the real task it ran on, and what happened>
REJECTED  <the other candidates, one line each>
```

Nothing gets installed by the explorer. The explorer recommends; the supervisor and Dhruv
decide. Installing a server that runs on this machine is Dhruv's call, always.
