# Git commits branches merge rebase conflict resolution and workflows — Reference: Branch creation, merge strategies, rebase, cherry-pick, and conflict repair

Sources: [official reference 1](https://git-scm.com/docs/git-rebase), [official reference 2](https://git-scm.com/docs/gitworkflows), [official reference 3](https://git-scm.com/docs/gittutorial).

## Scope and version

This guide covers the exact assigned inventory for Git 2.54 documentation checked 2026-11-14. Git’s availability and defaults depend on the installed version and configuration; check `git --version` and command help before relying on a new option. Path-oriented `git checkout` remains explained for compatibility, while focused `git switch` and `git restore` commands make intent clearer. [Git 2.54 documentation](https://git-scm.com/docs/git/2.54.0)

## How this group fits the mental model

Integration combines independent histories while preserving or rewriting their shape. The choice between merge, rebase, and cherry-pick is a collaboration decision as well as a command decision. Resolve conflicts by constructing the intended result, not by assuming one side is always correct.

## Supplied names explained

- `git branch` — Lists, creates, renames, or deletes branch references depending on options.
- `git switch` — Changes the current branch or detached checkout; it is focused on branch switching.
- `git switch -c` — Creates a branch and switches to it in one operation.
- `git checkout` — Legacy multi-purpose command for switching branches or restoring paths; prefer focused switch/restore forms for clarity.
- `git merge` — Integrates another history into the current branch, potentially fast-forwarding or creating a merge commit.
- `Fast-forward merge` — Moves the current branch ref to a descendant commit when histories have not diverged; no merge commit is needed.
- `Three-way merge` — Combines two tips using their common ancestor as a base, allowing Git to integrate independent edits.
- `Merge commit` — A commit with multiple parents that records the integration point and preserves branch ancestry.
- `Squash merge` — Combines a branch’s changes into one resulting commit without recording its individual commits as parents.
- `Octopus merge` — A merge strategy for combining more than two heads, suited mainly to straightforward independent branches rather than complex conflicts.
- `Merge strategy ort` — Git’s modern default two-head merge strategy, designed to perform three-way merges and report conflicts.
- `Merge strategy ours` — A strategy that records the other history as merged while keeping the current tree’s content; distinct from the `ours` option of other strategies.
- `Merge strategy subtree` — A strategy that adjusts trees to merge a project stored under a subdirectory; not a general substitute for subtree management.
- `Merge conflict` — An unresolved path where Git cannot produce a safe combined result automatically.
- `Conflict marker` — Temporary text delimiters showing competing regions; remove all markers and construct the actual final content before staging.
- `Merge base` — A best common ancestor of the histories being combined, used as the comparison base for three-way integration.
- `git merge-base` — Finds a best common ancestor used to understand divergence and three-way integration.
- `git mergetool` — Launches a configured merge tool for conflicted paths; inspect and test the result afterward.
- `git merge --continue` — Completes a merge after conflicts are resolved and staged.
- `git merge --abort` — Attempts to return to the pre-merge state; preserve unrelated edits before starting risky operations.
- `git rebase` — Replays commits onto a new base, creating new commit identities.
- `git rebase --interactive` — Lets you reorder, edit, squash, or drop commits in a private history sequence.
- `git rebase --onto` — Replays a selected range onto a specified new base, useful for moving a branch subset.
- `git rebase --continue` — Resumes replay after the current conflict has been resolved and staged.
- `git rebase --skip` — Omits the current patch from the replay; use only after confirming the change is redundant or intentionally dropped.
- `git rebase --abort` — Stops the rebase and restores the branch to its state before the operation.
- `Rebase conflict-side meaning` — The replay process makes current and incoming sides operation-relative; inspect index stages and the patch rather than assuming familiar labels.
- `git cherry-pick` — Applies a selected commit’s change onto the current branch as a new commit.
- `git cherry-pick --continue` — Continues a cherry-pick after resolving and staging its conflict.
- `git cherry-pick --abort` — Returns to the state before the current cherry-pick sequence.
- `Revert commit` — A new commit that reverses the selected commit’s effect; unlike reset, it preserves the shared history and is generally safer for published changes.
- `Conflict resolution stage 1/2/3` — The index’s conflict entries: stage 1 is the merge base, stage 2 the current side, and stage 3 the other side for the active operation.
- `git rerere` — Records and reuses a prior conflict resolution for a matching conflict; review reused results because context and intent may differ.
- `git range-diff` — Compares two commit ranges as patch series, helping review what changed after a rebase or series revision.
- `Patch-equivalent commits` — Different commits with equivalent changes, often detected by patch identity; equal patch content does not make their history ancestry identical.
- `Commit history rewrite` — Changing/recreating commits changes object IDs and references; local/private work is easier to rewrite than shared work.
- `Public-branch rewrite coordination` — Before rewriting a branch others may use, agree on timing and recovery steps so collaborators can rebase or reset safely.

## Cross-item comparison

Fast-forward avoids a merge commit when histories are linear. Three-way merge records both parent histories; squash merge records a combined change without those individual branch commits as parents. Rebase replays commits with new IDs. Cherry-pick copies selected changes; revert adds an inverse change. Choose according to history policy and who already depends on the branch.

## Examples

A safe rebase conflict flow is inspect status and current operation; open each conflict; compare base, current, and replayed content; construct the correct final file; stage it; inspect staged diff; run tests; continue. If the assumptions are wrong, abort rather than guessing. A shared branch should normally use coordination and a merge/revert strategy consistent with team policy.

## Common mistakes

Rebasing shared work without coordination; choosing ours/theirs based on intuition during rebase; continuing before staging a verified resolution; using a strategy option without knowing its semantics; skipping a patch without confirming it is redundant.

## Knowledge checks with answers

1. **Which state contains the proposed next snapshot?** The index.
2. **Why does amending or rebasing change commit identity?** The commit object and/or parent relationship changes, producing a different object.
3. **What is the safe response to a conflict?** Inspect operation roles, edit the desired result, stage and review, then continue or abort.
4. **How do restore, reset, and revert differ?** Restore targets paths, reset moves local HEAD/ref and may reset index/worktree, and revert records an inverse commit.
5. **What does fetch do without pull?** It downloads objects and updates local remote-tracking references without integrating into the current branch.
6. **What are reflog limits?** It records local ref movements, can expire, and is not available as another clone’s backup.

