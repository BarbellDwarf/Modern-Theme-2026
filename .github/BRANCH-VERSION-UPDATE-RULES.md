# Branch Version Update Rules

Purpose: enforce version metadata updates whenever a new release branch is created.

Scope: all release branches named in this pattern:
- VMAJOR.MINOR.PATCH
- Example: V1.0.4

## Mandatory Rule

When a release branch is created, version metadata MUST be updated in the same branch before PR merge.

Required file updates:
1. module.json
- Set version to branch version without V prefix.
- Example: branch V1.0.4 -> "version": "1.0.4"

2. package.json
- Set version to the same value.
- Example: "version": "1.0.4"

3. CHANGELOG.md
- Add a new top section in this format:
  ```md
  ## [1.0.4] - YYYY-MM-DD
  ```
- Include concise Fixed/Changed notes for the branch changes.

## Branch-to-Version Mapping

- Branch: V1.0.4
- Version: 1.0.4
- Rule: strip only the leading V.

## Required PR Checklist

Every PR from a release branch to main must include this checklist and all boxes checked:

- [ ] module.json version matches release branch version
- [ ] package.json version matches release branch version
- [ ] CHANGELOG.md includes release section with matching version and date
- [ ] PR title and description mention the release version

## Fast Verification Commands

Run from module root:

- grep -n '"version"' module.json package.json
- head -n 40 CHANGELOG.md
- git --no-pager diff --name-only main...HEAD

Expected result:
- module.json and package.json show the same version as branch.
- CHANGELOG top entry matches that version.

## Standard Workflow for New Release Branches

1. Create branch:
- git checkout -b V1.0.4

2. Immediately update:
- module.json
- package.json
- CHANGELOG.md

3. Commit metadata first (recommended):
- git add module.json package.json CHANGELOG.md
- git commit -m "chore: bump version metadata to 1.0.4"

4. Implement feature/fix commits.

5. Before opening PR, re-verify versions match branch.

## Non-Release Branches

If branch name does not follow VMAJOR.MINOR.PATCH, this rule is optional.
Do not bump versions unless the branch is intended to ship.
