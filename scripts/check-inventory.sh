#!/usr/bin/env bash
# Verifies that the skill/category counts documented across the repo match the
# actual contents on disk. Prevents inventory drift (see issue #54, where
# CLAUDE.md, CONTRIBUTING.md, README.md and the npm package all disagreed).
#
# Source of truth = number of SKILL.md files and top-level category directories.
# Run locally with:  bash scripts/check-inventory.sh
set -euo pipefail

cd "$(dirname "$0")/.."

ACTUAL_SKILLS=$(find . -name SKILL.md -not -path '*/node_modules/*' | wc -l | tr -d ' ')
ACTUAL_CATS=$(find . -maxdepth 1 -type d -name '[0-9]*-*' | wc -l | tr -d ' ')

echo "Actual repository contents: ${ACTUAL_SKILLS} skills across ${ACTUAL_CATS} categories"
echo "--------------------------------------------------------------"

fail=0

# check <file> <label> <regex> <expected>
# Extracts the first number from the first line matching <regex> and compares it
# to <expected>. Skips (with a warning) if the file or pattern is missing, so the
# guard never blocks on unrelated wording changes.
check() {
  local file="$1" label="$2" regex="$3" expected="$4"
  if [ ! -f "$file" ]; then
    echo "  ⚠️  ${label}: ${file} not found (skipped)"
    return
  fi
  local found
  found=$(grep -oiE "$regex" "$file" | head -1 | grep -oE '[0-9]+' | head -1 || true)
  if [ -z "$found" ]; then
    echo "  ⚠️  ${label}: pattern not found in ${file} (skipped)"
    return
  fi
  if [ "$found" != "$expected" ]; then
    echo "  ❌ ${label}: ${file} says ${found}, expected ${expected}"
    fail=1
  else
    echo "  ✅ ${label}: ${found}"
  fi
}

echo "Skill counts:"
check "CLAUDE.md"                              "CLAUDE.md header"   'Directory Structure \(([0-9]+) Skills' "$ACTUAL_SKILLS"
check "packages/ai-research-skills/README.md"  "npm package README" '\*\*([0-9]+) skills\*\*'                "$ACTUAL_SKILLS"
check "WELCOME.md"                             "WELCOME.md"         'installs ([0-9]+) skills'               "$ACTUAL_SKILLS"

echo "Category counts:"
check "CLAUDE.md"                              "CLAUDE.md header"   'Skills Across ([0-9]+) Categories'     "$ACTUAL_CATS"
check "packages/ai-research-skills/README.md"  "npm package README" 'across ([0-9]+) categories'            "$ACTUAL_CATS"

echo "--------------------------------------------------------------"
if [ "$fail" -ne 0 ]; then
  cat <<EOF
❌ Inventory drift detected.

Update the file(s) flagged above to match the actual counts:
    ${ACTUAL_SKILLS} skills across ${ACTUAL_CATS} categories

Recompute any time with:
    find . -name SKILL.md -not -path '*/node_modules/*' | wc -l
EOF
  exit 1
fi
echo "✅ Documented inventory counts are in sync (${ACTUAL_SKILLS} skills / ${ACTUAL_CATS} categories)."
