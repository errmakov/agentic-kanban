#!/usr/bin/env bash
# seed-backlog.sh — files the FactoryWall demo backlog as GitHub issues and drops
# them into the project board's "Todo" column.
#
# Usage: ./scripts/seed-backlog.sh <owner> <repo> <project_number>
#
# Requires: gh CLI authenticated with repo + project scopes.
#
# NOTE: Each card is a one-line human request. Acceptance criteria are intentionally
# NOT written here — producing them is the SA/BA agent's job (the first pipeline stage).
# Every issue is labelled `demo-backlog` so reset-rehearsal.sh can find and clear them.

set -euo pipefail

OWNER="${1:?Usage: seed-backlog.sh <owner> <repo> <project_number>}"
REPO="${2:?Usage: seed-backlog.sh <owner> <repo> <project_number>}"
PROJECT="${3:?Usage: seed-backlog.sh <owner> <repo> <project_number>}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Ensure the tracking label exists (idempotent).
gh label create demo-backlog --repo "${OWNER}/${REPO}" \
  --color BFD4F2 --description "FactoryWall demo backlog card" 2>/dev/null || true

# "title|one-line intent"
BACKLOG=(
  "Add a dark/light theme toggle|Let visitors switch FactoryWall between a light and a dark theme, and remember the choice."
  "Show a live attendee counter in the header|Display a number in the header representing how many people are viewing the wall."
  "Add an emoji reaction bar to the wall|Let visitors tap emoji reactions on the wall and see the running counts."
  "Add a countdown to the next break|Show a countdown timer to the next scheduled break."
  "Add a now-speaking banner|Show a banner naming the session that is currently on."
  "Show the day's agenda as a list|Display the day's agenda as a simple list of sessions and times."
  "Add speaker bio cards|Show a few speaker bio cards with name, role and a short bio."
  "Add a share-this-session button|Add a button that copies the current page link to the clipboard."
  "Add an FAQ accordion|Add a short FAQ section where each question expands to reveal its answer."
  "Add a thumbs up/down feedback widget|Let visitors leave a quick thumbs up or thumbs down on the session."
  "Add a footer with a venue map link|Add a footer link that points to the venue map."
  "Add a jump-to-top button|Add a button that scrolls the page back to the top."
)

echo "Seeding ${#BACKLOG[@]} backlog issues into ${OWNER}/${REPO} (project ${PROJECT})..."
chmod +x "${SCRIPT_DIR}/move-issue.sh"

for entry in "${BACKLOG[@]}"; do
  TITLE="${entry%%|*}"
  BODY="${entry#*|}"

  ISSUE_URL=$(gh issue create --repo "${OWNER}/${REPO}" --title "$TITLE" --body "$BODY" --label demo-backlog)
  echo "Created: $ISSUE_URL"

  ITEM_ID=$(gh project item-add "$PROJECT" --owner "$OWNER" --url "$ISSUE_URL" --format json | jq -r '.id')

  if [ -n "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
    "${SCRIPT_DIR}/move-issue.sh" "$OWNER" "$PROJECT" "$ITEM_ID" "Todo" \
      || echo "  (could not set status to Todo automatically; set it in the board UI)"
  fi
done

echo "Done. Open the board — all cards should be in Todo."
