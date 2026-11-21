# Git commits branches merge rebase conflict resolution and workflows — Reference: Hooks, bisect, worktrees, and focused repository maintenance tools

Sources: [official reference 1](https://git-scm.com/docs/githooks), [official reference 2](https://git-scm.com/docs/gitworkflows).

## Scope and version

This guide covers the exact assigned inventory for Git 2.56.1 documentation checked 2026-11-20. Git’s availability and defaults depend on the installed version and configuration; check `git --version` and command help before relying on a new option. Path-oriented `git checkout` remains explained for compatibility, while focused `git switch` and `git restore` commands make intent clearer. [Git 2.56.1 documentation](https://git-scm.com/docs/git/2.56.1)

## How this group fits the mental model

Hooks and advanced tools extend everyday workflows. Hooks run at particular local operations but are not automatically shared with clones; diagnostic tools such as bisect narrow causes by testing revisions. Worktree and repository maintenance features change how a local clone is organized, not team-level hosting policy.

## Supplied names explained

- `Git hook` — An executable invoked by Git at a defined local event to validate or automate an operation.
- `core.hooksPath` — Git configuration selecting a hooks directory instead of the repository’s default hooks location.
- `pre-commit hook` — Runs before a commit is created, often for quick checks; it is local unless separately distributed and enforced.
- `commit-msg hook` — Runs with the proposed message file and can validate message format or policy.
- `prepare-commit-msg hook` — Can edit or prepare a message before the editor; unlike commit-msg it is intended to prepare message content.
- `post-commit hook` — Runs after a commit has been created; it cannot prevent that commit from being made.
- `pre-push hook` — Runs before push updates are sent and can perform local checks; remote policy still needs server-side enforcement.
- `post-merge hook` — Runs after a successful merge, commonly to perform local follow-up actions.
- `Hook executable permission` — On platforms that honor executable mode, the hook must be executable for Git to run it.
- `Git filter` — A transformation that can convert file content between working-tree and repository forms; filters affect checkout/add behavior.
- `Git clean/smudge filter` — Clean transforms content on add; smudge transforms content on checkout, so transformations must be predictable and safe.
- `Git LFS pointer file` — A small text pointer identifying large content stored by Git LFS; a clone without the object may contain only this pointer.
- `git bisect` — Uses repeated good/bad revisions to narrow which commit introduced a regression.
- `git bisect start` — Begins a bisect session and marks the search range.
- `git bisect bad` — Marks the current revision as containing the regression.
- `git bisect good` — Marks a known non-regression revision.
- `git bisect run` — Automates tests across bisect-selected commits using a command’s exit status.
- `git grep` — Searches tracked repository content at a revision or in the working tree.
- `git archive` — Creates an archive from a tree without including repository metadata.
- `git notes` — Attaches supplemental text or metadata to Git objects without changing the object itself; notes are not part of normal commit content and need deliberate sharing.
- `git replace` — Uses refs to substitute one object for another during local object lookup, useful for controlled history experiments but potentially confusing if enabled unknowingly.
- `git bundle` — Packages repository objects and refs for offline transfer or backup-like transport.
- `Git shallow clone` — A clone with truncated history depth; operations needing older ancestry may not work until more history is fetched.
- `Partial clone` — A clone that defers fetching some objects until needed, reducing initial transfer while depending on the promisor remote.
- `Sparse checkout` — A working-tree mode that limits checked-out paths while retaining repository history and object behavior outside the visible subset.
- `git sparse-checkout` — Controls sparse checkout patterns through its subcommands.
- `Multiple worktrees` — Several working directories sharing one repository’s object database and metadata, with branch checkout constraints.
- `Repository maintenance task` — Background or explicit housekeeping that optimizes repository storage and indexes without changing project semantics.

## Cross-item comparison

Hooks react to local events; CI and protected-branch rules are needed for team-wide enforcement. Bisect identifies a likely introducing revision only when good/bad tests are reliable. Sparse checkout reduces the working-tree path set; shallow and partial clones reduce fetched history/object content in different ways. A bundle packages refs and objects for transfer without a hosted remote.

## Examples

Use bisect after defining a deterministic command that succeeds on a known-good revision and fails on a known-bad one. Use worktrees for a hotfix checkout alongside ongoing work, avoiding duplicated clones. Use sparse checkout only when its partial working-tree view is understood by tools and build scripts.

## Common mistakes

Relying on local hooks as the only policy; bisecting flaky checks; removing a worktree with valuable uncommitted work; assuming sparse/shallow clones contain all content/history; mistaking an LFS pointer for the underlying large file.

## Knowledge checks with answers

1. **When does a client-side hook run?** In a local operation such as commit, under the configured hook path; it can be bypassed and is not a server trust boundary.
2. **What does a filter change?** How content is transformed between repository objects and the working tree; configuration and clean/smudge symmetry matter.
3. **Why use worktrees?** To check out multiple branches into separate working directories sharing repository data, while respecting worktree-specific restrictions.
