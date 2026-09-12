# Learnings Log

One line per persisted lesson. `learn` skill appends here automatically at session end.

Format: `YYYY-MM-DD | <file changed> | <the rule>`

Prune when this passes ~80 lines: merge duplicates, delete rules that never fired.

---

2026-07-25 | (bootstrap) | Global skill system created: founder, product-manager, engineering-manager, principal-architect, senior-developer, senior-tester, senior-code-reviewer, doc-writer, mentor, learn.
2026-07-25 | CLAUDE.md + founder + senior-developer | Plan gate: design plan then implementation plan then wait for approval before coding; skip only for genuinely small reversible changes.
2026-07-25 | skills/senior-tester | Tests asserting an absence (empty output, no error) pass vacuously when the harness never reaches the code — break them on purpose to confirm they can go red.
2026-07-25 | standards/engineering | A green lint/typecheck/test exit proves nothing until you read the script scope — partial scripts return 0 while the changed code goes unchecked.
2026-07-26: A turn that ends on TaskUpdate/TaskCreate alone with no text produces a blank response the harness flags as "no visible output" - style.md now requires at least one closing line after bookkeeping-only tool calls.
2026-07-29 | skills/founder | Never label an option "Recommended" before checking what incumbents in that specific market do - a default imported from another market is a guess, and the user living there will catch it.
2026-08-15 | skills/founder | A finding that invalidates a choice the user already made gets its own turn - deliver the constraint, let it land, then ask them to re-choose; bundling blocker + new options gets the question rejected.
2026-08-15 | style.md | proposals in conversation stay a few lines, no headers/sections until asked to expand
2026-08-18 | standards/architecture | Rewrite-or-continue verdicts come from measured evidence (gates run, LOC, marker density, migration history, uncommitted size), never from the project's own status docs - those rot and are usually the source of the mess feeling.
2026-08-18 | skills/founder | A question asking the user to define their own vague term goes in its own turn - batching it with decisions that depend on the answer gets the whole batch rejected.
2026-08-19 | skills/founder | "Add a skill/standard for X" means check ~/.claude/skills and ~/.claude/standards first and extend the file that already owns X - a second copy forks the rules and they drift.
2026-08-20 | skills/founder | An option bundling several distinct actions forces a package vote - split the option per action, or name the axis and let the user draw the line.
2026-08-22 | skills/founder | multiSelect on a scoping question invites "all of the above" - single-select it, or price the breadth into each option label.
2026-08-22 | standards/engineering | Install into a project venv, never the shared interpreter - a global `pip install` upgraded a transitive pin, broke another project, and reported it as warning text on exit code 0.
2026-08-22 | skills/senior-code-reviewer/SKILL.md | review pass 9: execute a doc's claims against code and data, don't read them as prose
2026-08-23 | standards/engineering | A bulk rewrite proves itself with a replacement count and a predicted byte delta - 0 matches from an over-escaped pattern exits 0, and Windows text mode silently rewrites every newline.
2026-09-05 | standards/engineering | Scheduled/unattended jobs assert output count, not exit status - a routine drafted zero mails for two weeks while every run reported SUCCEEDED.
2026-09-08 | standards/engineering | Repo-wide search uses the Grep tool, not shell `grep -r` - the shell walks node_modules and times out; "prefer Bash" modes mean commands, not searches a dedicated tool already wins.
