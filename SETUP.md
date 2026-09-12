# Setting up a machine

Read this when setting up a new machine, or when a tool is missing. It is **not** context
for normal work — `CLAUDE.md` is.

No step here fails hard. Anything that cannot be configured degrades that one capability
and is listed as UNSET, never guessed.

## 1. Prerequisites

| Need | Check |
|---|---|
| Claude Code | `claude --version` |
| git | `git --version` |
| Node (for MCP servers, run via npx) | `node --version` |
| GitHub CLI, authenticated | `gh auth status` |

## 2. Clone into the config directory

    git clone https://github.com/dd-25/ai-crew.git ~/.claude

**If `~/.claude` already exists** — Claude Code created it on first run — do not delete it.
Attach the repo to it instead:

    cd ~/.claude
    git init
    git remote add origin https://github.com/dd-25/ai-crew.git
    git fetch origin main
    git checkout -f -B main origin/main

Local credentials, transcripts and caches are untracked, so they survive that checkout.

## 3. Restart Claude Code

Agents register as `subagent_type` only at session start. Until you restart, the skills
work and the agents do not.

## 4. Plugins — automatic

`settings.json` carries `enabledPlugins` and `extraKnownMarketplaces`, so these install on
first start with no action:

| Plugin | Marketplace |
|---|---|
| frontend-design, superpowers, code-review, context7, expo | `anthropics/claude-plugins-official` |
| ponytail | `DietrichGebert/ponytail` |
| ui-ux-pro-max | `nextlevelbuilder/ui-ux-pro-max-skill` |
| caveman | `JuliusBrussee/caveman` |

If one is missing, `/plugin` lists them and reinstalls. `skill-creator` is installed but
disabled on purpose.

`ui-ux-pro-max` installs the same way — its marketplace is already declared.

`deslopify` is **not** a plugin: it is a plain skill, vendored into `skills/deslopify/`, so
it travels with this repo and needs no install. Re-pull it from
`github.com/iurysza/agent-skills` (`skills/deslopify`) to update.

## 5. MCP servers — manual, one per machine

These live in `~/.claude.json`, outside this repo, because they sit next to API keys.
Nothing here is committed. Run what you need:

    # Gemini — needs a key from https://aistudio.google.com/apikey
    claude mcp add gemini --env GEMINI_API_KEY=<your-key> -- npx -y @rlabs-inc/gemini-mcp

    # Gmail — browser OAuth on first run, no key
    claude mcp add gmail -- npx -y @gongrzhe/server-gmail-autoauth-mcp

Skip any you do not need. A missing MCP degrades that one capability; it never blocks work
that does not use it. Verify with `claude mcp list`.

Known broken: `gmail` currently fails with `CONNECTION_CLOSED`. Re-running its OAuth is the
first thing to try.

## 6. Machine-specific settings

`settings.local.json` is gitignored and regenerates itself. It holds the auto-mode
environment — trusted repo paths, org posture — which is wrong if copied between machines.
Nothing to do; absent is a valid state.

## 7. Verify

    ls ~/.claude/agents | wc -l          # 11
    ls ~/.claude/skills | wc -l          # 18
    git -C ~/.claude status --short      # clean
    bash ~/.claude/scripts/crew-doctor.sh # 5 PASS lines, exit 0
    claude mcp list                      # whatever you configured in step 5

Then, inside Claude Code:

    /crew                                 # protocol loads
    /founder                              # routing loads

## 8. Push access

The session-end hook pushes `~/.claude` when it has commits. It needs `gh auth status` to
be green and the remote to be reachable. If either is missing the hook logs it and the
session ends normally — commits simply wait for the next successful push.
