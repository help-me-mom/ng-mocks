---
name: prepare-dependabot-prs
description: Use when preparing GitHub Dependabot pull requests by listing open PRs, verifying they are authored by app/dependabot, closing package.json major-version updates, and enabling auto-merge and approval for eligible updates without merging manually.
---

# Prepare Dependabot PRs

Use this skill for repetitive Dependabot PR preparation in this repository.

## Task List

Use a plain Markdown checklist so the workflow is easy to follow in AI Agent:

```md
- [ ] Confirm GitHub auth and list open Dependabot PRs in the upstream repository
- [ ] Verify authors, changed files, and package.json version changes
- [ ] Close every PR containing a package.json major-version change
- [ ] Enable auto-merge with squash for each remaining eligible PR
- [ ] Approve each remaining eligible PR
- [ ] Summarize prepared PRs and any blockers
```

## Workflow

1. Confirm GitHub CLI access.
2. List open PRs authored by `app/dependabot` in `help-me-mom/ng-mocks`.
3. Verify each candidate's author and changed files.
4. Inspect every changed `package.json`. Compare the before and after versions in all dependency declarations. Treat the PR as a major-version update when any dependency's SemVer major number changes.
5. Close each major-version update. Do not enable auto-merge or approve it.
6. Enable auto-merge with squash for each remaining eligible PR.
7. Approve each remaining eligible PR.
8. Report prepared and closed PRs, plus any PRs skipped because of missing permissions, unexpected changes, ambiguous versions, or policy blockers.

## Commands

```bash
REPO=help-me-mom/ng-mocks

gh auth status
gh pr list --repo "$REPO" --author app/dependabot --state open --json number,title,url,headRefName
gh pr view <pr-number> --repo "$REPO" --json author,files,title,url
gh api --paginate "repos/$REPO/pulls/<pr-number>/files" --jq '.[] | select(.filename | endswith("package.json")) | {filename,patch}'
gh pr close <pr-number> --repo "$REPO"
gh pr merge <pr-number> --repo "$REPO" --auto --squash
gh pr review <pr-number> --repo "$REPO" --approve
gh pr view <pr-number> --repo "$REPO" --json state,autoMergeRequest,reviews
```

## Validation

- Confirm every detected major-version update is closed.
- Confirm each prepared PR shows auto-merge enabled.
- Confirm each prepared PR has an approval from the current reviewer.

## Guardrails

- Do not merge PRs manually; this skill only prepares them for CI-driven auto-merge.
- Skip any PR that is not clearly a Dependabot dependency update.
- Never enable auto-merge or approve a PR when any dependency changes SemVer major in a `package.json`.
- If a changed version is ambiguous or a `package.json` patch is unavailable or truncated, do not assume eligibility; retrieve the base and head file contents or stop and report the blocker.
- Always target `help-me-mom/ng-mocks`; do not default to the checkout's `origin` remote.
- If branch protection, reviewer rules, or GitHub permissions block the workflow, stop and report the blocker.
