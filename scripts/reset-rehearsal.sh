#!/usr/bin/env bash
# reset-rehearsal.sh — restore a clean slate between pipeline rehearsals (Option C).
#
# Usage: ./scripts/reset-rehearsal.sh <owner> <repo> <project_number>
#   Optional: ARCHIVE_TAG=attempt-3 ./scripts/reset-rehearsal.sh ...   # keep this run's history
#
# What it does:
#   1. (optional) archive current master as tag rehearsal/<ARCHIVE_TAG>
#   2. force-reset master to the immutable `baseline` tag (restores app code + workflows)
#   3. delete all agent/issue-* remote branches
#   4. close the previous demo-backlog issues and remove their board items
#   5. re-seed a fresh backlog into Todo
#   6. remind you to run the `deploy-baseline` workflow to restore the VPS
#
# Requires: gh authenticated (repo + project scopes), git remote `origin`,
# branch protection on `master` OFF (or a PAT that can force-push).
#
# One-time setup (when the demo is first ready on master):
#   git tag baseline && git push origin baseline

set -euo pipefail

OWNER="${1:?Usage: reset-rehearsal.sh <owner> <repo> <project_number>}"
REPO="${2:?Usage: reset-rehearsal.sh <owner> <repo> <project_number>}"
PROJECT="${3:?Usage: reset-rehearsal.sh <owner> <repo> <project_number>}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Fetching refs..."
git fetch origin --tags --prune

# 0. Safety: baseline tag must exist.
if ! git ls-remote --tags origin baseline | grep -q 'refs/tags/baseline'; then
  echo "ERROR: 'baseline' tag not found on origin."
  echo "Create it once when the demo is ready:  git tag baseline && git push origin baseline"
  exit 1
fi

# 1. Optional archive of the run we are about to wipe.
if [ -n "${ARCHIVE_TAG:-}" ]; then
  echo "==> Archiving current master as rehearsal/${ARCHIVE_TAG}..."
  git push origin "origin/master:refs/tags/rehearsal/${ARCHIVE_TAG}" || true
fi

# 2. Force-reset master to baseline.
echo "==> Force-resetting master to baseline..."
git push --force origin "refs/tags/baseline:refs/heads/master"

# 3. Delete agent feature branches.
echo "==> Deleting agent/issue-* branches..."
for b in $(git ls-remote --heads origin 'agent/issue-*' | awk '{print $2}' | sed 's#refs/heads/##'); do
  echo "    - $b"
  git push origin --delete "$b" || true
done

# 4. Close previous demo issues and remove their board items.
echo "==> Closing previous demo-backlog issues..."
CLOSED_NUMS=$(gh issue list --repo "${OWNER}/${REPO}" --label demo-backlog --state open --limit 200 --json number -q '.[].number' || true)
for n in $CLOSED_NUMS; do
  gh issue close "$n" --repo "${OWNER}/${REPO}" --reason "not planned" 2>/dev/null || true
done

if [ -n "$CLOSED_NUMS" ]; then
  echo "==> Removing their items from the board..."
  ITEMS_JSON=$(gh project item-list "$PROJECT" --owner "$OWNER" --format json --limit 500)
  for n in $CLOSED_NUMS; do
    ID=$(echo "$ITEMS_JSON" | jq -r --argjson num "$n" '.items[] | select(.content.number == $num) | .id')
    if [ -n "$ID" ] && [ "$ID" != "null" ]; then
      gh project item-delete "$PROJECT" --owner "$OWNER" --id "$ID" 2>/dev/null || true
    fi
  done
fi

# 5. Re-seed a fresh backlog.
echo "==> Re-seeding backlog..."
chmod +x "${SCRIPT_DIR}/seed-backlog.sh"
"${SCRIPT_DIR}/seed-backlog.sh" "$OWNER" "$REPO" "$PROJECT"

echo ""
echo "==> Reset complete."
echo "    Next: run the 'Deploy: baseline' workflow to restore the VPS to the clean app."
echo "    (Actions tab -> 'Deploy: baseline' -> Run workflow, or: gh workflow run deploy-baseline.yml)"
