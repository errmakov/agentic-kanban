#!/usr/bin/env bash
# get-issue-context.sh — Fetches an issue's full context (body + all comments).
#
# Usage: ./scripts/get-issue-context.sh <repo> <issue_number>
# Output: Markdown document with issue title, body, labels, and all comments
#
# Requires: gh CLI authenticated with repo scope

set -euo pipefail

REPO="${1:?Usage: get-issue-context.sh <repo> <issue_number>}"
ISSUE_NUMBER="${2:?Usage: get-issue-context.sh <repo> <issue_number>}"

# Fetch issue details
ISSUE_JSON=$(gh issue view "$ISSUE_NUMBER" \
  --repo "$REPO" \
  --json title,body,labels,assignees,comments,state)

TITLE=$(echo "$ISSUE_JSON" | jq -r '.title')
BODY=$(echo "$ISSUE_JSON" | jq -r '.body // "No description provided."')
LABELS=$(echo "$ISSUE_JSON" | jq -r '[.labels[].name] | join(", ") // "none"')

# Output as structured markdown
cat <<EOF
# Issue #${ISSUE_NUMBER}: ${TITLE}

**Labels**: ${LABELS}

## Description

${BODY}
EOF

# Append all comments
COMMENT_COUNT=$(echo "$ISSUE_JSON" | jq '.comments | length')

if [ "$COMMENT_COUNT" -gt 0 ]; then
  echo ""
  echo "## Comments"
  echo ""

  echo "$ISSUE_JSON" | jq -r '.comments[] | "### Comment by \(.author.login) (\(.createdAt))\n\n\(.body)\n"'
fi
