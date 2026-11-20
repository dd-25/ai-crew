# Prompting — how CLAUDE.md, skills, agents and briefs are written

Read when editing any prompt file. A prompt is code for a model: one owner per rule, no dead lines.

## Checklist

1. **Specific over vague.** Name the output, format and constraint. Colleague test: a new hire
   with no context could follow it. Vague verbs ("handle", "consider", "be careful") fail it.
   [bp#be-clear-and-direct](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#be-clear-and-direct)
2. **Every rule carries its why.** The model generalises from the reason; a bare rule gets
   applied too widely or too narrowly. [bp#add-context-to-improve-performance](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#add-context-to-improve-performance)
3. **Say what to do, not only what not to do.** A "never X" needs the "do Y instead".
   [bp#control-the-format-of-responses](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#control-the-format-of-responses)
4. **Calm wording.** Current models over-trigger on `CRITICAL` / `YOU MUST` written for older
   ones. Bold or "never" only for a genuine hard rule; "Use X when..." for the rest.
   [bp#tool-usage](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#tool-usage), [bp#migration-considerations](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#migration-considerations)
5. **Examples where behaviour is subtle.** Relevant, varied, marked as examples (BAD/GOOD block
   or `<example>`), so the model does not copy one surface pattern. [bp#use-examples-effectively](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#use-examples-effectively)
6. **Structure separates kinds of content.** Headers and bullets for rules, numbered lists where
   order matters, tags or fences for templates and data. Prompt style leaks into output style.
   [bp#structure-prompts-with-xml-tags](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices#structure-prompts-with-xml-tags)
7. **No contradictions.** Two rules that disagree get one picked arbitrarily. One owner per
   topic; everything else points to it. [memory#write-effective-instructions](https://code.claude.com/docs/en/memory#write-effective-instructions)
8. **CLAUDE.md is paid every turn.** Under ~200 lines. Only what every session needs; a
   multi-step procedure or one-area rule goes to a skill or standard loaded on demand. Imports
   do not cut the cost. [memory](https://code.claude.com/docs/en/memory#write-effective-instructions)
9. **CLAUDE.md is context, not enforcement.** A rule that must never break needs a hook or a
   permission, not louder wording. [memory#claude-md-vs-auto-memory](https://code.claude.com/docs/en/memory#claude-md-vs-auto-memory)
10. **Skill description is the router.** Key use case first, concrete trigger phrases, scope
    and exclusions; description + `when_to_use` truncate at 1,536 chars. Body: what to do, not
    narration; under 500 lines; detail in referenced files. [skills](https://code.claude.com/docs/en/skills)
11. **Order by weight.** Most-violated, highest-cost rule first; reference material last.
12. **Delete what no longer changes behaviour** — stale paths, obsolete tools, rules the model
    follows anyway. Re-check cross-references after every rename.


## Current audit — 2026-11-19

### Lenses (every file checked against each)

- L1 duplication — same rule in two files, or twice in one
- L2 contradiction — two rules that cannot both hold
- L3 rule without its why
- L4 vague verb / untestable wording
- L5 stale — dead path, wrong helper name, renamed section, obsolete tool
- L6 ordering — heaviest rule first
- L7 structure — what / when / do / return
- L8 skill description — triggers, scope, exclusions, overlap with a neighbour
- L9 load cost — always-loaded text that belongs on demand
- L10 examples where behaviour is subtle
- L11 voice-rule consistency (caveman, ponytail, pushback, action items, plan gate, test cadence)
- L12 agent wrapper works — tools allow what the body tells it to do; receipt matches the skill

### TODO

- [x] Ground in Anthropic docs, write checklist above
- [x] CLAUDE.md (global) — merge the two routing tables, compress code gate, fix contradictions
- [x] standards/style.md, engineering.md, prompting.md (new)
- [x] skills: crew, founder, learn, hiring-a-specialist, senior-developer, senior-code-reviewer,
      principal-architect, product-manager, doc-writer, explorer, mentor
- [x] skills checked, no change needed: senior-tester, engineering-manager, designer,
      career-assistant, legal-writer, deslopify (vendored — re-pull upstream, never hand-edit)
- [x] agents/*.md — skill-loading line, receipt vocabulary aligned with skills
- [x] registry/agents.md, registry/tools.md
- [x] Schl-mgmt project skills — stale helper names and paths; project CLAUDE.md checked
- [x] Self-check: cross-references resolve, `git diff --stat`

### Proposed substantive changes (need Dhruv)

1. **Commit scope.** The living-TODO rule says "commit the doc after each phase"; the crew-repo
   rule says never commit without your word. Edited so `~/.claude` stays uncommitted; does
   "commit after each phase" hold in project repos, or should it read "save" everywhere?
2. **Who edits the team.** CLAUDE.md said "`learn` ... commits. Nothing else edits the team";
   the same file says "edit these files freely as work happens" and `crew` has the supervisor
   edit skills after a dispatch. Edited to: anyone edits, following this checklist; `learn`
   never commits. Confirm.
3. **Regression test vs test cadence.** "No test runs mid-implementation" vs "regression test
   must be seen red before the fix". Edited to allow that one red run as proof. Confirm.
4. **Review severity of a bounded quadratic.** Reviewer table said MINOR, pass 12 said "not a
   finding". Aligned to "not a finding" (matches no-padding rule). Confirm.
5. **Agent tools.** Five agents (product-manager, engineering-manager, senior-tester,
   senior-code-reviewer, doc-writer) lack the `Skill` tool yet were told to invoke their skill.
   Edited all wrappers to read `~/.claude/skills/<name>/SKILL.md` (works with Read). Adding
   `Skill` to their tools is the alternative.
6. **Skill length.** `learn` prunes past ~150 lines; crew (203), senior-code-reviewer (193)
   and senior-developer (181) are over. Splitting reference tables into `references/` files
   would cut load cost; not done, it moves rules.
7. **Global CLAUDE.md length.** Now 239 lines (was 269), still over the ~200 target. Further
   cut means moving the crew section (~60 lines) into `Skill(crew)`, which changes what
   loads every turn.
