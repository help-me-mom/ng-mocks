---
name: prepare-dependabot-prs
description: Use when preparing GitHub Dependabot pull requests by listing open PRs, verifying they are authored by app/dependabot, enabling auto-merge, and approving them without merging manually.
---

# Prepare Dependabot PRs

Use this skill for repetitive Dependabot PR preparation in this repository.

## Task List

Use a plain Markdown checklist so the workflow is easy to follow in AI Agent:

```md
- [ ] Confirm GitHub auth and list open Dependabot PRs in the upstream repository
- [ ] Enable auto-merge with squash for each PR
- [ ] Approve each PR
- [ ] Summarize prepared PRs and any blockers
```

## Workflow

1. Confirm GitHub CLI access.
2. List open PRs authored by `app/dependabot` in `help-me-mom/ng-mocks`.
3. Verify each candidate's author and changed files, then enable auto-merge with squash.
4. Approve each eligible PR.
5. Report any PRs skipped because of missing permissions, unexpected changes, or policy blockers.

## Commands

```bash
REPO=help-me-mom/ng-mocks

gh auth status
gh pr list --repo "$REPO" --author app/dependabot --state open --json number,title,url,headRefName
gh pr view <pr-number> --repo "$REPO" --json author,files,title,url
gh pr merge <pr-number> --repo "$REPO" --auto --squash
gh pr review <pr-number> --repo "$REPO" --approve
gh pr view <pr-number> --repo "$REPO" --json autoMergeRequest,reviews
```

## Validation

- Confirm each acted-on PR now shows auto-merge enabled.
- Confirm each acted-on PR has an approval from the current reviewer.

## Guardrails

- Do not merge PRs manually; this skill only prepares them for CI-driven auto-merge.
- Skip any PR that is not clearly a Dependabot dependency update.
- Always target `help-me-mom/ng-mocks`; do not default to the checkout's `origin` remote.
- If branch protection, reviewer rules, or GitHub permissions block the workflow, stop and report the blocker.
