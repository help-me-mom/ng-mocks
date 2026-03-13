---
name: prepare-dependabot-prs
description: Use when preparing GitHub Dependabot pull requests by listing open PRs, verifying they are authored by app/dependabot, enabling auto-merge, and approving them without merging manually.
---

# Prepare Dependabot PRs

Use this skill for repetitive Dependabot PR preparation in this repository.

## Task List

Use a plain Markdown checklist so the workflow is easy to follow in AI Agent:

```md
- [ ] Confirm GitHub auth and list open Dependabot PRs
- [ ] Enable auto-merge with squash for each PR
- [ ] Approve each PR
- [ ] Summarize prepared PRs and any blockers
```

## Workflow

1. Confirm GitHub CLI access.
2. List open PRs authored by `app/dependabot`.
3. Enable auto-merge with squash for each eligible PR.
4. Approve each eligible PR.
5. Report any PRs skipped because of missing permissions, unexpected changes, or policy blockers.

## Commands

```bash
gh auth status
gh pr list --author app/dependabot --state open --json number,title,url,headRefName
gh pr view <pr-number> --json author,files,title,url
gh pr merge --auto --squash <pr-number>
gh pr review --approve <pr-number>
```

## Validation

- Confirm each acted-on PR now shows auto-merge enabled.
- Confirm each acted-on PR has an approval from the current reviewer.

## Guardrails

- Do not merge PRs manually; this skill only prepares them for CI-driven auto-merge.
- Skip any PR that is not clearly a Dependabot dependency update.
- If branch protection, reviewer rules, or GitHub permissions block the workflow, stop and report the blocker.
