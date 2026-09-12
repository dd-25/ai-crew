#!/usr/bin/env bash
# crew-doctor — checks the crew repo's structural invariants. Reports only, never fixes.
# Usage: bash crew-doctor.sh [repo-root]   (default ~/.claude)
set -u

ROOT="${1:-$HOME/.claude}"
FAILED=0

frontmatter() { awk 'NR==1 && $0=="---" {f=1; next} f && /^---$/ {exit} f' "$1" | tr -d '\r'; }

report() { # <check name> <offenders, newline separated, empty = pass>
  if [ -z "$2" ]; then
    printf 'PASS  %s\n' "$1"
  else
    printf 'FAIL  %s\n' "$1"
    printf '%s\n' "${2%$'\n'}" | sed 's/^/        /'
    FAILED=1
  fi
}

[ -d "$ROOT/agents" ] || { printf 'FAIL  %s has no agents/ directory\n' "$ROOT"; exit 2; }

no_skill=""; no_row=""; no_decl=""; bad_name=""
for f in "$ROOT"/agents/*.md; do
  [ -e "$f" ] || continue
  n=$(basename "$f" .md)
  fm=$(frontmatter "$f")

  [ -f "$ROOT/skills/$n/SKILL.md" ] || no_skill="${no_skill}agents/$n.md (expected skills/$n/SKILL.md)"$'\n'
  grep -q "^| *$n *|" "$ROOT/registry/agents.md" 2>/dev/null || no_row="${no_row}agents/$n.md"$'\n'

  missing=""
  printf '%s\n' "$fm" | grep -q '^tools:' || missing="tools:"
  printf '%s\n' "$fm" | grep -q '^model:' || missing="${missing:+$missing }model:"
  [ -z "$missing" ] || no_decl="${no_decl}agents/$n.md (missing $missing)"$'\n'

  declared=$(printf '%s\n' "$fm" | sed -n 's/^name:[[:space:]]*//p' | head -1)
  [ "$declared" = "$n" ] || bad_name="${bad_name}agents/$n.md (name: '${declared:-<none>}')"$'\n'
done

# A line may hold both a correct ~/.claude/agents and a stale one, so blank the good
# occurrences before testing, but print the original line.
stale=$(grep -rn '\.claude/agents' \
          "$ROOT/agents" "$ROOT/skills" "$ROOT/registry" "$ROOT/CLAUDE.md" 2>/dev/null \
        | grep -v '/registry/log\.md:' \
        | awk '{t=$0; gsub(/~\/\.claude\/agents/,"",t); if (t ~ /\.claude\/agents/) print}')

# Model tier is declared twice — agent frontmatter and the registry table. Nothing else
# compares them, so they drift silently and the registry quietly starts lying.
model_drift=""
for f in "$ROOT"/agents/*.md; do
  [ -e "$f" ] || continue
  n=$(basename "$f" .md)
  fm=$(frontmatter "$f" | sed -n 's/^model:[[:space:]]*//p')
  rg=$(awk -F'|' -v n="$n" '{gsub(/^[ 	]+|[ 	]+$/,"",$2); if ($2==n) {gsub(/^[ 	]+|[ 	]+$/,"",$5); print $5; exit}}' "$ROOT/registry/agents.md")
  if [ -n "$rg" ] && [ "$fm" != "$rg" ]; then
    model_drift="${model_drift}agents/$n.md (file: ${fm:-none}, registry: $rg)
"
  fi
done

report "every agent has a matching skills/<name>/SKILL.md" "$no_skill"
report "every agent has a row in registry/agents.md"       "$no_row"
report "every agent declares tools: and model:"            "$no_decl"
report "every agent's name: matches its filename"          "$bad_name"
report "no stale .claude/agents path (log.md exempt)"      "$stale"
report "agent model matches its registry row"              "$model_drift"

exit $FAILED
