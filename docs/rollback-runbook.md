# Production rollback runbook

How to put the last known-good version of the website back into production
when a deployment goes wrong. Production is Azure App Service
`nexyronix-web-app` (resource group `nexyronix-production-rg`, Central India),
serving `https://www.nexyronix.com`.

## How production deployment works (and what rollback must respect)

- Deployments run only through `.github/workflows/azure-app-service.yml`.
- Only the `main` branch can deploy. The GitHub `production` environment
  allows `main` and nothing else, and **every deployment waits for approval**
  by the required reviewer. Administrators cannot bypass it.
- `main` accepts changes only through pull requests, with the
  `Build and verify` check passing. Direct pushes, force pushes and deletion
  are blocked for everyone.
- A deployment only succeeds once `/api/health` on the app reports the exact
  commit that was deployed.

**Rollback never relaxes any of this.** Do not add other branches to the
`production` environment, do not turn on administrator bypass, and do not
deploy from outside the workflow. Both procedures below go through `main` and
the approval gate.

### Two different approvals — don't confuse them

| | Pull-request approval | Deployment approval |
|---|---|---|
| What it guards | Merging into `main` | A specific run's deploy job reaching Azure |
| Where it's set | Repository ruleset on `main`: one approving review | GitHub `production` environment: required reviewer |
| Can it be bypassed? | Yes, by the repository administrator **at merge time only** (`gh pr merge --admin`), and the bypass is logged. Pull request, `Build and verify` and resolved conversations stay mandatory for everyone. | **No.** Administrator bypass is off. |
| Who gives it | Another maintainer — or, with a single maintainer, the logged `--admin` bypass | `nexyronix`, on the run page or with `gh api … pending_deployments` |

Merging never deploys by itself: the run started by the merge stops and waits
for a deployment approval. `gh pr merge --admin` never approves a deployment.

### Never deploy something you haven't checked

- **Before approving any deployment, confirm what it will deploy** — the
  branch must be `main` and the commit must be the one you intend:

  ```bash
  gh run view <run-id> --json headBranch,headSha,event,displayTitle \
    --jq '"\(.headBranch)  \(.headSha)  \(.event)  \(.displayTitle)"'
  ```

  If either doesn't match, reject the deployment instead.
- **Don't roll back with a manual workflow run** (`gh workflow run`, or **Run
  workflow** in the Actions tab). It deploys the current tip of `main` — which
  still contains the bad change.

All commands are run from a clone of the repository with the GitHub CLI
(`gh`) signed in as `nexyronix` — the repository administrator, and the
`production` environment's required reviewer. Approving a deployment needs
that reviewer; administrator rights alone are not enough.

## Choose the procedure

| Situation | Use |
|---|---|
| A deployment is **still waiting for approval** and should not go out | Nothing to roll back: on its run page choose **Review deployments → Reject**. |
| The latest deployment broke the site, and an **earlier `main` deployment** (less than 30 days old) was healthy | **A. Re-run a known-good build** — fastest, no code change. Then do **B** before anything else is merged. |
| A specific change merged into `main` is the cause, or there is no earlier `main` deployment to go back to, or it is more than 30 days old | **B. Revert the bad change** |
| No deployment happened recently and the site is down (container won't start, Azure incident) | This is not a code rollback. Check the App Service log stream and Azure status; restart the app from the portal if appropriate. |

The difference matters:

- **A. Re-running a known-good build** redeploys an older commit, but `main`
  still contains the bad change. The next deployment from `main` would put it
  straight back. A is a stop-gap.
- **B. Reverting the bad change** removes it from `main` itself, through a
  normal pull request, so every later deployment stays fixed.

## Step 0 — Find the known-good deployment

A run is known-good when its **Deploy to Azure App Service** job succeeded,
which includes the check that the app reported the run's commit.

```bash
# Successful runs on main, newest first
gh run list --workflow azure-app-service.yml --branch main --status success --limit 20 \
  --json databaseId,headSha,createdAt,event \
  --jq '.[] | "\(.databaseId)  \(.headSha[0:7])  \(.createdAt)  \(.event)"'

# Confirm a candidate actually deployed (not just built)
gh run view <run-id> --json jobs --jq '.jobs[] | "\(.name): \(.conclusion)"'

# What production is running right now
curl -s https://www.nexyronix.com/api/health
```

The first deployment from `main` is run `44886376639` (commit `0cdc749`,
21 November 2026, 08:45 UTC). Every earlier deployment — up to 08:10 UTC that
same day — ran from the `azure-migration` branch. The `production`
environment no longer accepts that branch, so those runs cannot be re-run into
production; use procedure B to reach that code.

The `production` environment's ID, used when approving from the command line:

```bash
gh api repos/nexyronix/nexyronix-solutions-website/environments/production --jq .id   # 27960937240
```

## Procedure A — Re-run a known-good build

1. **Free the deployment slot.** All deployments share one queue. If any
   other run is waiting for approval, reject it on its run page (or cancel it)
   first:

   ```bash
   gh run list --workflow azure-app-service.yml --status waiting
   gh run cancel <waiting-run-id>
   ```

2. **Re-run the known-good run.** GitHub allows re-runs up to 30 days after
   the original run (and at most 50 times per run), and a re-run keeps the
   original commit (`GITHUB_SHA`) and ref. There are two ways:

   - **Rebuild the same commit and deploy it** — re-run every job:

     ```bash
     gh run rerun <known-good-run-id>
     ```

   - **Redeploy the exact original package — UNTESTED.** Re-run only the
     deploy job, so that it uses the package the original build produced
     (packages are kept for 30 days):

     ```bash
     JOB_ID=$(gh run view <known-good-run-id> --json jobs \
       --jq '.jobs[] | select(.name=="Deploy to Azure App Service") | .databaseId')
     gh run rerun <known-good-run-id> --job "$JOB_ID"
     ```

     This has never been tried here and its behaviour isn't documented
     consistently: GitHub's documentation says re-running one job also
     re-runs the jobs that *depend on* it, while `gh run rerun --help`
     describes `--job` as "including dependencies". Prefer the full re-run
     above unless the exact package matters.

   **Neither form has been exercised in this repository yet.** GitHub's
   documentation does not say whether a re-run attempt can download the
   package uploaded by the original attempt, or whether a full re-run's upload
   clashes with the original package's name (`upload-artifact` rejects a
   duplicate artifact name within a run). If the re-run fails at **Download
   deployment package** or **Upload deployment package**, stop and use
   procedure B — it does not depend on either.

3. **Check, then approve the deployment.** The deploy job stops at the
   `production` environment. First confirm the run is on `main` and its commit
   is the known-good one (see [Never deploy something you haven't
   checked](#never-deploy-something-you-havent-checked)). Then, on the run
   page, choose **Review deployments**, tick **production**, add a comment such
   as "Rollback to `<sha>`", and choose **Approve and deploy**. From the
   command line, the same approval is:

   ```bash
   gh api --method POST \
     repos/nexyronix/nexyronix-solutions-website/actions/runs/<known-good-run-id>/pending_deployments \
     -F "environment_ids[]=27960937240" -f state=approved -f comment="Rollback to <sha>"
   ```

4. **Wait for the run to finish.** It succeeds only when `/api/health`
   reports the known-good commit. Then follow [Verify](#verify).

5. **Immediately do procedure B** for the bad change. Until it is reverted on
   `main`, the next merge would redeploy it.

## Procedure B — Revert the bad change

1. **Find the commit that brought the change into `main`.** Changes arrive as
   pull-request merge commits:

   ```bash
   git fetch origin
   git log --first-parent --oneline origin/main -15
   ```

2. **Create the revert on its own branch** (never on `main`):

   ```bash
   git switch -c revert-<short-sha> origin/main
   git revert -m 1 <merge-commit-sha>   # for a merge commit
   # git revert <commit-sha>            # for an ordinary (non-merge) commit
   npm ci && npm run build && npm test
   git push -u origin revert-<short-sha>
   ```

   Pushing this branch does not deploy anything; only `main` deploys.

3. **Open the pull request and wait for CI:**

   ```bash
   gh pr create --base main --head revert-<short-sha> \
     --title "Revert <merge-commit-sha>: <reason>" \
     --body "Rolls back <what broke>. Incident: <link or notes>."
   gh pr checks <pr-number> --watch
   ```

4. **Merge it.** `Build and verify` must pass and review conversations must be
   resolved; nobody can skip those. With a single maintainer, the
   pull-request approval rule is bypassed explicitly (and logged) at merge
   time. This is the pull-request approval only — it does not approve any
   deployment:

   ```bash
   gh pr merge <pr-number> --merge --admin
   ```

5. **Check, then approve the deployment** of the new `main` commit. Find the
   run the merge started, confirm its commit is the revert's merge commit, and
   approve it exactly as in procedure A, step 3. Wait for it to succeed, then
   follow [Verify](#verify).

   ```bash
   gh run list --workflow azure-app-service.yml --branch main --limit 3 \
     --json databaseId,headSha,status \
     --jq '.[] | "\(.databaseId)  \(.headSha[0:7])  \(.status)"'
   git rev-parse --short origin/main   # after `git fetch origin`: must match the run's commit
   ```

6. **Later**, once the problem is fixed, bring the change back with a new
   pull request (for example by reverting the revert) — never by pushing to
   `main`.

## Verify

```bash
curl -s https://www.nexyronix.com/api/health                  # "version" must be the intended commit
curl -s -o /dev/null -w '%{http_code}\n' https://www.nexyronix.com/                # 200
curl -s -o /dev/null -w '%{http_code}\n' https://www.nexyronix.com/privacy-policy  # 200
curl -s -o /dev/null -w '%{http_code}\n' https://www.nexyronix.com/api/contact     # 405 (GET is not allowed)
```

Then open the site in a browser and check the home page, the 3D sections and
the contact form (without submitting, unless a test enquiry is intended).

## What to expect

- Every deployment restarts the app: about a minute of unavailability on the
  current single-instance Basic (B1) plan, which has no deployment slots.
- Rollback restores **code only**. Azure app settings, Key Vault secrets, DNS
  and GitHub settings are not part of a deployment: before changing any of
  them, record the current value, and roll them back by restoring it.
- No visitor data is stored by the site (enquiries are only emailed), so there
  is no data to roll back.

## After a rollback

- Note what happened, the run IDs involved, and the commit now in production.
- Fix forward through a normal pull request into `main`.
