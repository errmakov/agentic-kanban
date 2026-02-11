# Agentic Kanban

An autonomous software development pipeline powered by AI agents and GitHub Projects.

Issues flow through a Kanban board. At each stage, a specialized AI agent picks up the work, does its job, and moves the issue forward. A human reviews before anything ships.

```
Todo → Ready for Work → SA/BA → Dev → Test → Human Review → Ready to Deploy → Done
          ↑ human          ↑ agent   ↑ agent  ↑ agent    ↑ human              ↑ agent
```

---

## Architecture

### Infrastructure

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  GitHub Projects V2 ──── Kanban board (8 columns)               │
│         │                                                        │
│         │ polled every 5 min                                     │
│         ▼                                                        │
│  GitHub Actions ─────── Dispatcher (cron) + Agent Workflows      │
│         │                                                        │
│         ├── agent-saba.yml ──── Claude Sonnet 4.5 (analysis)    │
│         ├── agent-dev.yml ───── Claude Opus 4.6 (coding)        │
│         ├── agent-test.yml ──── Claude Sonnet 4.5 (testing)     │
│         ├── agent-deploy.yml ── Shell scripts (deploy)          │
│         └── review-feedback ─── Telegram Bot API (notify human) │
│                                                                  │
│  Anthropic API ──────── Powers all AI agents                    │
│  Telegram Bot API ───── Pings human for review                  │
│  Deploy Target ──────── Vercel / Railway / AWS / your choice    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Pipeline Flow

```
 ┌───────────┐
 │   TODO    │  Human creates an issue with a clear description
 └─────┬─────┘
       │  Human moves to "Ready for Work" when groomed
       ▼
 ┌───────────┐
 │  READY    │  Dispatcher detects → validates → moves to SA/BA
 │  FOR WORK │  Triggers: agent-saba.yml
 └─────┬─────┘
       ▼
 ┌───────────┐  agent-saba:
 │   SA/BA   │  • Reads issue + codebase
 │           │  • Posts analysis comment (affected files, approach, criteria)
 └─────┬─────┘  • Moves to Dev → triggers agent-dev.yml
       ▼
 ┌───────────┐  agent-dev:
 │   DEV     │  • Reads issue + SA/BA analysis
 │           │  • Creates feature branch
 │           │  • Implements the feature using Claude Code
 └─────┬─────┘  • Creates draft PR → moves to Test
       ▼
 ┌───────────┐  agent-test:
 │   TEST    │  • Reads PR diff + acceptance criteria
 │           │  • Writes unit tests + e2e tests
 │           │  • Runs test suite (retries up to 3x)
 └─────┬─────┘  • Pushes test commits → moves to Human Review
       ▼
 ┌───────────┐  Dispatcher:
 │  HUMAN    │  • Sends Telegram notification with PR link
 │  REVIEW   │  • Human reviews the PR
 │           │  • Approve → moves to Ready to Deploy
 └─────┬─────┘  • Request changes → back to Dev with feedback
       ▼
 ┌───────────┐  agent-deploy:
 │  READY TO │  • Merges PR to main
 │  DEPLOY   │  • Triggers deployment
 │           │  • Runs smoke test
 └─────┬─────┘  • Success → Done / Failure → back to Dev
       ▼
 ┌───────────┐
 │   DONE    │  Issue closed. Shipped.
 └───────────┘
```

### Failure & Feedback Loops

```
Test fails (≤3x)     → agent-dev retries with failure context
Test fails (>3x)     → Telegram alert, issue stays in Test
Human requests changes → back to Dev with review comments as context
Deploy fails         → back to Dev + Telegram alert
Agent times out      → issue stays in current status, Telegram alert
```

---

## Setup

### Prerequisites

- GitHub account with a repository for your webapp
- [Anthropic API key](https://console.anthropic.com/) (pay-per-token)
- [Telegram Bot](https://core.telegram.org/bots#how-do-i-create-a-bot) (via @BotFather)
- `gh` CLI installed locally (for setup script)

### Step 1: Create the GitHub Project Board

Run the setup helper:

```bash
./scripts/setup-project.sh
```

Or manually:
1. Go to your GitHub repo → Projects → New Project → Board view
2. Create these status columns (exact names matter):
   - `Todo`
   - `Ready for Work`
   - `SA/BA`
   - `Dev`
   - `Test`
   - `Human Review`
   - `Ready to Deploy`
   - `Done`

### Step 2: Configure Secrets

In your GitHub repo → Settings → Secrets and variables → Actions:

| Secret | Value |
|--------|-------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (`sk-ant-...`) |
| `PROJECT_PAT` | GitHub PAT with `project`, `repo`, `workflow` scopes |
| `TELEGRAM_BOT_TOKEN` | From @BotFather |
| `TELEGRAM_CHAT_ID` | Your Telegram user/group ID |

### Step 3: Configure Variables

In your GitHub repo → Settings → Secrets and variables → Actions → Variables:

| Variable | Value |
|----------|-------|
| `PROJECT_NUMBER` | Your GitHub Project number (from the URL) |
| `PROJECT_OWNER` | GitHub org or username that owns the project |
| `PRODUCTION_URL` | Your production URL (for smoke tests) |
| `DEPLOY_HOOK_URL` | (Optional) Vercel/Railway deploy hook URL |

### Step 4: Copy Workflows

Copy the `.github/workflows/` directory and `scripts/` directory into your webapp repository.

### Step 5: Customize

1. Edit `CLAUDE.md` in your webapp repo to describe your project conventions
2. Edit the prompts in `prompts/` to match your project's domain
3. Adjust `agent-deploy.yml` for your deploy target

---

## File Structure

```
.github/workflows/
  dispatcher.yml        # Cron poller — detects board changes, dispatches agents
  agent-saba.yml        # SA/BA analysis agent
  agent-dev.yml         # Development agent
  agent-test.yml        # Test-writing agent
  agent-deploy.yml      # Deployment agent
  review-feedback.yml   # PR review → board status sync

scripts/
  poll-board.sh         # Queries GitHub Project, returns items by status
  move-issue.sh         # Moves a project item to a target status
  get-issue-context.sh  # Fetches issue body + all comments as context
  notify-telegram.sh    # Sends a Telegram message
  setup-project.sh      # One-time project board setup

prompts/
  saba-system.md        # System prompt for the SA/BA analysis agent
  dev-system.md         # System prompt for the development agent
  test-system.md        # System prompt for the testing agent

CLAUDE.md               # Project conventions (customize for your webapp)
```

---

## Cost Estimates

Per-issue estimates using the recommended model mix:

| Agent | Model | Est. Cost/Issue |
|-------|-------|-----------------|
| agent-saba | Sonnet 4.5 | $0.50 – $2 |
| agent-dev | Opus 4.6 | $5 – $15 |
| agent-test | Sonnet 4.5 | $1 – $3 |
| **Total** | | **$6.50 – $20** |

For 20 issues/month: **~$130 – $400/month** on Anthropic API.

### Optimization Tips

- Use prompt caching for CLAUDE.md and large context (50% discount)
- Sonnet handles analysis and test-writing well — reserve Opus for coding
- Set `--max-turns` to prevent runaway loops
- Monitor with `/cost` in Claude Code locally

---

## How Context Flows Between Agents

Each agent writes its output as a **comment on the GitHub issue**. The next agent reads all prior comments as input. This creates a natural paper trail:

```
Issue #42: "Add user profile page"
  ├── Body (human):     "Users should see name, email, avatar..."
  ├── Comment (saba):   "## SA/BA Analysis\n- Files: /api/user, /components/..."
  ├── Comment (dev):    "## Implementation Notes\n- Created ProfilePage..."
  └── Comment (test):   "## Test Report\n- 12 unit tests, 3 e2e tests, all passing"
```

---

## Git Isolation Strategy

Agents work on isolated branches to prevent conflicts:

```
main                           ← production branch (protected)
  ├── agent/issue-42           ← agent-dev working on #42
  ├── agent/issue-57           ← agent-dev working on #57
  └── agent/issue-63           ← agent-dev working on #63
```

If two issues are in-flight simultaneously, they get separate branches and separate PRs. The merge-to-main step in agent-deploy handles conflicts.

---

## Customization

### Different Deploy Targets

Edit `agent-deploy.yml` and replace the deploy step:

**Vercel:**
```yaml
- run: curl -X POST "${{ vars.DEPLOY_HOOK_URL }}"
```

**Railway:**
```yaml
- run: railway up --service your-service
```

**AWS (via CDK/SAM):**
```yaml
- run: npx cdk deploy --require-approval never
```

### Different Tech Stacks

The agents are stack-agnostic — they read your `CLAUDE.md` to understand conventions. Just describe your stack there:
- Framework (Next.js, Rails, Django, etc.)
- Test runner (Jest, Pytest, RSpec, etc.)
- Package manager (npm, bun, pip, etc.)
- Build commands
- Lint/format commands

---

## License

MIT
