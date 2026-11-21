# Git commits branches merge rebase conflict resolution and workflows — Reference: Restore, reset, revert, stash, clean, and worktree recovery boundaries

Sources: [official reference 1](https://git-scm.com/docs/git-reset), [official reference 2](https://git-scm.com/docs/git-restore).

## Scope and version

This guide covers the exact assigned inventory for Git 2.56.1 documentation checked 2026-11-20. Git’s availability and defaults depend on the installed version and configuration; check `git --version` and command help before relying on a new option. Path-oriented `git checkout` remains explained for compatibility, while focused `git switch` and `git restore` commands make intent clearer. [Git 2.56.1 documentation](https://git-scm.com/docs/git/2.56.1)

## How this group fits the mental model

Undo commands target different layers: working-tree files, index, current branch, or shared history. Before using a destructive option, identify which state should be restored and whether another person depends on the commit. Reflog and backup branches are recovery aids, not guarantees.

## Supplied names explained

- `git restore` — Restores selected paths in the working tree from a source tree; it can discard uncommitted edits.
- `git restore --staged` — Restores index entries from a source (normally HEAD), thereby unstaging without discarding working-tree content.
- `git reset` — Moves the current branch/HEAD and optionally resets index and working tree; options determine which layers change.
- `git reset --soft` — Moves HEAD while leaving index and working tree unchanged.
- `git reset --mixed` — Moves HEAD and resets the index while leaving working-tree files; this is the default reset mode.
- `git reset --hard` — Moves HEAD and resets index and working tree, discarding conflicting local state; inspect and back up first.
- `git reset path` — Resets selected index paths from a tree without moving the branch; use restore --staged for the focused modern form.
- `git revert` — Creates a new commit that reverses the effect of an earlier commit, suitable for shared history.
- `git checkout path (legacy form)` — Legacy path-restoration form that copies content into the working tree; use focused `git restore` syntax to make the intent clearer.
- `git stash` — Stores selected working-tree/index changes temporarily and cleans the worktree according to the operation.
- `git stash push` — Creates a stash entry from selected changes; include untracked paths only with appropriate options.
- `git stash list` — Lists saved stash entries.
- `git stash show` — Shows the changes represented by a stash entry.
- `git stash apply` — Applies a stash but keeps the stash entry, useful when recovery may need another attempt.
- `git stash pop` — Applies a stash and removes it only when application succeeds; conflicts require careful resolution.
- `git stash branch` — Creates a branch from the stash’s original base and applies that stash there.
- `git clean` — Removes untracked files; ignored-file removal requires additional options. Preview first.
- `git clean -n` — Dry-run preview of untracked paths that a clean operation would remove.
- `git worktree` — Manages multiple working directories associated with one repository.
- `git worktree add` — Creates another checkout at a path, optionally on a branch or detached commit.
- `git worktree list` — Shows linked worktrees and their checked-out references.
- `git worktree remove` — Removes a linked working directory subject to cleanliness checks.
- `git worktree prune` — Removes administrative records for worktrees whose directories no longer exist.
- `ORIG_HEAD` — A pseudo-reference some commands set to a previous tip; useful for recovery but overwritten by later operations and not a durable backup.
- `Reflog recovery` — Find the earlier reference value in a local reflog, then create a branch or tag before it expires or objects are pruned.
- `Unreachable commit recovery` — Locate a lost commit through reflog or object inspection, immediately add a reference, then inspect before integrating.
- `Working-tree backup before destructive reset` — Preserve edits with a commit, patch, copy, or other durable method before a hard reset because uncommitted content may be discarded.
- `Undoing a public commit with revert` — Creates a new commit that reverses the published change while preserving history other clones already reference.
- `Undoing a private local commit with reset` — Moves local history to an earlier point and can keep or discard staged/worktree state depending on the reset mode.

## Cross-item comparison

Restore targets paths, reset moves the current reference and optionally resets other layers, and revert adds an inverse commit. Stash apply keeps the saved entry; pop removes it after successful application. Clean targets untracked paths and is distinct from resetting tracked files.

## Examples

Before cleanup, run status and preview untracked deletions. To unstage while keeping edits, restore the path from HEAD into the index. To undo a pushed bad commit, create a revert and publish it. To remove a private local commit while keeping its files, choose a reset mode deliberately and verify the resulting index/worktree.

## Common mistakes

Using hard reset as a general undo; confusing path restore with ref reset; cleaning before preview; assuming stash is durable; using reset to undo a public commit; forgetting untracked files are outside ordinary reset protection.

## Knowledge checks with answers

1. **Which command family safely undoes a committed public change?** Revert creates a new inverse change without rewriting shared history.
2. **When can reset discard work?** Depending on mode, it moves HEAD/index and may overwrite the working tree; inspect status and preserve needed changes first.
3. **What is the first recovery step after an accidental operation?** Stop modifying refs, inspect status/reflog, and create a rescue ref or backup before attempting repair.
