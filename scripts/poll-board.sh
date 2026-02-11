#!/usr/bin/env bash
# poll-board.sh — Queries the GitHub Project board and returns items with their statuses.
#
# Usage: ./scripts/poll-board.sh <owner> <project_number>
# Output: JSON array of items with status, number, title, item_id
#
# Requires: gh CLI authenticated with project scope

set -euo pipefail

OWNER="${1:?Usage: poll-board.sh <owner> <project_number>}"
PROJECT_NUMBER="${2:?Usage: poll-board.sh <owner> <project_number>}"

# Fetch all project items with their Status field values
ITEMS_JSON=$(gh project item-list "$PROJECT_NUMBER" \
  --owner "$OWNER" \
  --format json \
  --limit 500)

# Transform into a simpler format: [{status, number, title, item_id, type}]
echo "$ITEMS_JSON" | jq '[
  .items[]
  | select(.content.number != null)
  | {
      status: .status,
      number: .content.number,
      title: .content.title,
      item_id: .id,
      type: .content.type
    }
]'
