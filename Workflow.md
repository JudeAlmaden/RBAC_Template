
## Commit Policy — Never Commit Without Permission

**Do not run `git commit` unless the user explicitly requests it** using instructions such as "commit", "make a commit", "commit this", or "version this".

- Finishing a feature, passing tests, having a clean diff, or an empty working tree is **never** a reason to commit automatically.
- Never run `git commit --amend`, rebase, reset, force-push, or push unless the user explicitly requests that specific action.
- When asked to commit, stage only files belonging to the requested task. Do not include unrelated deletions or tooling artifacts (e.g., `.freebuff/project-id`), local databases, `.env*` files, or AI scratch files.
- Prefer explicit paths (`git add <file> ...`) over `git add -A` to prevent unrelated files from being staged.
- A commit request does not automatically authorize a version bump. Versioning and releasing follow the separate workflow below.

## Changelog Policy — Always Maintain `[Unreleased]`

**Every feature, fix, improvement, or other meaningful change must be individually documented in the existing `## [Unreleased]` section of `CHANGELOG.md` as part of implementing that change.**

This is mandatory. Do not wait until the end of a development session, commit, or release to document changes.

### Rules

- Record each feature or change as soon as it is implemented and verified.
- Each independently implemented feature or change must have its own meaningful changelog entry. Do not combine unrelated changes into vague summary bullets.
- Use the existing categories:
  - `### Added`
  - `### Changed`
  - `### Fixed`
  - `### Removed`
  - `### Technical`
- Append entries under the appropriate existing category. Create a category only if it does not already exist.
- Always update the existing `[Unreleased]` section. Never create duplicate `[Unreleased]` headings.
- Do not create a versioned changelog heading or bump `package.json` unless the user explicitly requests versioning or a release.
- Keep the `### Technical` section accurate, including:
  - `Modified:` key modified files.
  - `New:` newly created files.
  - `Deleted:` removed files.
  - `Tests:` actual test and verification results.

**Important:** Before considering a feature or task complete, verify that its corresponding changelog entry exists. Documentation is part of implementation, not an optional final step.

## Release / Versioning Workflow

**Only execute this workflow when the user explicitly requests a version bump or release.**

A plain commit request does not trigger this workflow.

### 1. Review All Changes

Read `.agents/RECENT_CHANGES.md` to understand changes accumulated since the previous commit.

Also review:
- The current Git status and diff.
- The existing `CHANGELOG.md` and its `[Unreleased]` section.
- Relevant changes that may not yet have been recorded.

Do not rely exclusively on the scratch file. Cross-check it against the actual repository changes.

### 2. Audit the `[Unreleased]` Section

Before versioning, ensure **every feature, fix, improvement, and meaningful change since the previous release has an appropriate changelog entry**.

- Compare `.agents/RECENT_CHANGES.md` against `CHANGELOG.md`.
- Check the actual Git diff for undocumented changes.
- Add any missing entries under the appropriate categories.
- Remove duplicate or obsolete entries.
- Ensure entries accurately describe the implemented behavior.

**Do not proceed to the version bump until this audit is complete.**

### 3. Determine the Version Bump

Follow semantic versioning:

- **Patch (`x.x.X`):** Bug fixes, minor corrections, and small improvements.
- **Minor (`x.X.0`):** New features, UI overhauls, and removed subsystems.
- **Major (`X.0.0`):** Breaking API, database schema, or compatibility changes.

Choose the appropriate bump based on the cumulative changes since the previous release, not just the most recent feature.

### 4. Finalize `CHANGELOG.md`

Once every change has been documented under `[Unreleased]`, move its contents into a new versioned entry.

Follow the existing changelog format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- ...

### Changed
- ...

### Removed
- ...

### Fixed
- ...

### Technical
- Modified: <key files>
- New: <new files>
- Deleted: <deleted files>
- Tests: <actual test results>
```

- Place the new version entry directly below the `[Unreleased]` heading.
- Leave an empty `## [Unreleased]` section above the new release.
- Preserve the existing changelog structure and formatting.
- Do not omit changes simply because they seem small or technical.

### 5. Update `package.json`

Update the project version to match the new changelog release version.

Ensure the version numbers are consistent across relevant project metadata files, if applicable.

### 6. Verify Before Committing

Run the required checks:

```bash
npm run lint
npm run test
```

- Verify that both commands pass.
- Never claim a check passed without actually running it.
- Never weaken, remove, or skip failing tests just to produce a successful release.
- If a check fails, report the failure and do not proceed with the release commit until resolved.

### 7. Create the Final Release Commit

Only after all changes have been documented, audited, versioned, and verified should the final release commit be created.

Stage only the relevant project files using explicit paths.

Example:

```bash
git add package.json CHANGELOG.md <other-relevant-files>
git commit -m "chore: release vX.Y.Z"
```

Use conventional commit prefixes where appropriate:

- `feat:` — New functionality.
- `fix:` — Bug fixes.
- `chore:` — Maintenance and release commits.
- `refactor:` — Code restructuring.
- `docs:` — Documentation.
- `test:` — Tests.

**The release commit is the final step of the versioning workflow. Do not create an intermediate commit just to record the changelog or version bump.**

### Release Workflow Summary

The required sequence is:

1. Review all accumulated changes.
2. Audit every feature and change against `[Unreleased]`.
3. Add any missing changelog entries.
4. Determine the appropriate semantic version bump.
5. Move `[Unreleased]` entries into the versioned release section.
6. Update `package.json`.
7. Run lint and tests.
8. Stage the relevant files.
9. Create one final release commit.

Do not skip or reorder these steps.

## `.agents/RECENT_CHANGES.md` — How to Maintain It

This file is an AI-maintained scratchpad for tracking work across sessions.

- Keep it at `.agents/RECENT_CHANGES.md`.
- Ensure it remains Git-ignored under the `# AI assistant artifacts` section in `.gitignore`.
- Never include it in commits.
- Update it continuously as changes are implemented, including changes across multiple sessions.
- Organize entries into numbered feature/fix sections with descriptive headings.
- Record enough detail to identify what changed, why it changed, and which files were affected.
- Keep it synchronized with the actual implementation.

**After a successful release commit:**
- Reset or truncate the file.
- Retain only changes made after the release commit.
- Do not discard uncommitted work or changes that were not included in the release.

## General Rules

- Always run `npm run lint` and `npm run test` and verify they pass before committing.
- Never commit `.env` files, `*.db` files, or AI scratch files.
- Never report checks as passing without actually executing them.
- Never weaken or skip failing tests to obtain a green result.
- Keep changelog entries accurate, concise, and understandable.
- Do not document planned or unfinished functionality as completed.
- Do not silently discard unrelated user changes.
- Preserve existing Git history unless explicitly instructed otherwise.

**Core Principle: Implement → Document → Verify.**

Every feature or meaningful change must have its own entry under `[Unreleased]` immediately after implementation. When the user requests a release, audit all entries, bump the version, finalize the changelog, and create one final release commit.
