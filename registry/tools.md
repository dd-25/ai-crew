# Tools

Only the explorer writes here, and only after running the thing on a real task. An entry
without a `verified` date and a named task is a rumour, not a tool.

## In use

## mcp-server-linkedin
what: authenticated LinkedIn reads through a local browser session
good at: finding named engineers at a company that public search misses
costs: a logged-in session in `~/.linkedin-mcp/profile/`, outside any repo
risk: write calls (`connect_with_person`, `send_message`) get accounts restricted — read
      calls only, never in a loop
verified: 2026-08 on people-sourcing for the jopply queue
who uses it: career-assistant

## claude-in-chrome
what: drives the real Chrome session
good at: filling application forms on pages with no API
costs: none beyond the extension; needs per-site permission
risk: a triggered JS dialog freezes the extension until dismissed by hand
verified: 2026-08 filling the Policybazaar Google Form (11 fields via browser_batch)
who uses it: career-assistant, daily-task-doer

## context7
what: current library documentation
good at: API shapes that changed after the knowledge cutoff
costs: none
risk: none
verified: in standing use
who uses it: code-writer, software-architect

## Rejected

- **LangGraph orchestration** — 2026-08. Needs an API key Dhruv does not have. Claude Code
  skills and agents cover the same routing at zero cost. Revisit if an API key appears and
  the graph needs to run unattended.
- **Apollo.io cookie extraction** — 2026-08. Accounts terminated for it through 2025;
  Apollo has an official API instead. Never scrape the session.
- **Seamless.ai / HeyReach style LinkedIn automation** — 2026-08. Banned 2025; HeyReach
  took a cease-and-desist in March 2026 affecting 30,000 users.
