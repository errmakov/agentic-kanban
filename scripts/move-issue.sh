#!/usr/bin/env bash
# move-issue.sh — Moves a project item to a target status column.
#
# Usage: ./scripts/move-issue.sh <owner> <project_number> <item_id> <target_status>
#
# Example: ./scripts/move-issue.sh my-org 5 PVTI_abc123 "Dev"
#
# Requires: gh CLI authenticated with project scope

set -euo pipefail

OWNER="${1:?Usage: move-issue.sh <owner> <project_number> <item_id> <target_status>}"
PROJECT_NUMBER="${2:?Usage: move-issue.sh <owner> <project_number> <item_id> <target_status>}"
ITEM_ID="${3:?Usage: move-issue.sh <owner> <project_number> <item_id> <target_status>}"
TARGET_STATUS="${4:?Usage: move-issue.sh <owner> <project_number> <item_id> <target_status>}"

# Get the project ID
PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.id')

if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
  echo "Error: Could not find project #${PROJECT_NUMBER} for owner ${OWNER}" >&2
  exit 1
fi

# Get the Status field ID and option IDs
FIELDS_JSON=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)

STATUS_FIELD_ID=$(echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Status") | .id')

if [ -z "$STATUS_FIELD_ID" ] || [ "$STATUS_FIELD_ID" = "null" ]; then
  echo "Error: Could not find Status field in project" >&2
  exit 1
fi

# Find the target option ID
TARGET_OPTION_ID=$(echo "$FIELDS_JSON" | jq -r \
  --arg status "$TARGET_STATUS" \
  '.fields[] | select(.name == "Status") | .options[] | select(.name == $status) | .id')

if [ -z "$TARGET_OPTION_ID" ] || [ "$TARGET_OPTION_ID" = "null" ]; then
  echo "Error: Status '${TARGET_STATUS}' not found. Available statuses:" >&2
  echo "$FIELDS_JSON" | jq -r '.fields[] | select(.name == "Status") | .options[].name' >&2
  exit 1
fi

# Move the item
gh project item-edit \
  --id "$ITEM_ID" \
  --project-id "$PROJECT_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --single-select-option-id "$TARGET_OPTION_ID" \
  --format json > /dev/null

echo "Moved item ${ITEM_ID} to '${TARGET_STATUS}'"
