# Git commits branches merge rebase conflict resolution and workflows — Exercises and worked solutions

Sources: [Git tutorial](https://git-scm.com/docs/gittutorial), [git-rebase](https://git-scm.com/docs/git-rebase), [git-reset](https://git-scm.com/docs/git-reset), and [Git workflows](https://git-scm.com/docs/gitworkflows).

## Goals

- Inspect all three repository states before committing.
- Integrate private and shared work without losing collaborators’ changes.
- Resolve a conflict by constructing and verifying the intended result.
- Choose an undo operation based on whether a change is private or published.

## Worked example

You edit a tracked file, stage it, edit another line, then check status. The first version is in the index and the later edit is only in the working tree. Reviewing both diffs prevents either accidental inclusion or omission. Stage the second edit only if it belongs in this commit, then inspect the complete staged diff and commit.

## Exercises

Try to solve each before opening the progressive hints.

1. **Staged and unstaged state.** You staged a config change, then edited the same file again to fix a typo. What will the next commit contain? How do you inspect and stage the typo separately?
2. **Remote rejection.** Your push is rejected as non-fast-forward. List a safe sequence to publish your work.
3. **Shared commit mistake.** A bad commit is already pushed and a teammate has based work on it. Which undo approach is safest and why?
4. **Private history cleanup.** You have three private local commits and want to combine them before review. Which tool and collaboration constraint apply?
5. **Merge conflict.** A file has conflict markers during rebase. Explain how to identify the base, current, and replayed sides without assuming “ours” is the side you want.
6. **Accidental hard reset.** A local branch tip moved and a commit seems lost. What should you inspect and do immediately?
7. **Cleanup.** You want to remove generated untracked files before switching tasks. What preview and safeguards should precede deletion?
8. **Repo automation.** A local pre-commit hook passes, but CI fails for another contributor. Why is the hook insufficient as a team guarantee?

## Progressive hints

1. The index and working tree can hold different versions of one path.
2. Fetch first, compare divergence, integrate, test, and push normally.
3. Shared history should be corrected with a new commit, not rewritten under the teammate.
4. Interactive rebase rewrites commit identities; coordinate and keep it private.
5. During rebase, replayed commits are applied to a new base, making intuitive ours/theirs labels easy to misread.
6. Reflog tracks local reference movement. Create a safety branch at the recovered ID before more cleanup.
7. Clean targets untracked paths; preview, inspect the path list, and preserve anything valuable.
8. Hooks are local and may not be installed or trusted by others. Use server-side protected checks/CI for shared policy.

## Complete solutions

### 1. Staged and unstaged state

The commit contains the staged index version, not the later unstaged typo correction. Inspect the staged diff against HEAD and the unstaged diff against the index. Stage the typo hunk or path after deciding it belongs in the commit, then inspect the combined staged diff. If it is unrelated, leave it for a later commit.

### 2. Remote rejection

Run fetch, inspect status and the graph, identify which remote commits are missing locally, integrate them using the repository’s merge/rebase policy, resolve and verify conflicts, run checks, then push normally. If the remote advances again, repeat. Do not use force to bypass an unexplained rejection.

### 3. Shared commit mistake

Use revert to create a new commit that reverses the published change. This preserves the shared ancestor and lets the teammate’s branch remain based on existing history. Coordinate the repair and resolve any conflicts. A revert may need a later corrective commit if the original change is partially useful.

### 4. Private history cleanup

Use interactive rebase to reorder, edit, squash, or drop commits before publishing. Review the resulting range and run checks. Rebase creates new commit identities; if another person has based work on the old commits, stop and coordinate rather than silently rewriting their expectations.

### 5. Merge conflict

Identify the active operation and inspect the conflicted file plus index stages. Stage 1 is the merge base; stages 2 and 3 are the operation’s current and incoming versions. During rebase, the current/replayed sides can feel reversed compared with a normal merge. Build the intended combined content manually, remove markers, stage, inspect the staged diff, and test. Continue only after verification; otherwise abort.

### 6. Accidental hard reset

Stop destructive cleanup. Inspect reflog for the previous branch/HEAD tip and identify the lost commit. Create a new branch at that commit immediately so it has a named reference. Inspect its tree and history before deciding how to restore the work. Reflog is local and expires, so it is not a substitute for a remote or independent backup.

### 7. Cleanup

Preview the clean operation, review every listed path, and ensure no untracked work matters. Back up valuable content or commit it first. Then run the non-preview deletion only for the intended scope. Ignored paths require special options and deserve extra caution because they may contain local data.

### 8. Repo automation

Git hooks are local scripts and are not guaranteed to be installed or configured identically in each clone. They provide quick feedback, not shared enforcement. Put required checks in CI and configure protected branches or equivalent server policy so a contributor cannot bypass the shared requirement by lacking a local hook.

## Tests and edge cases

- A staged file may still have unstaged edits.
- A non-fast-forward push may contain someone else’s work.
- A revert can conflict even though it does not rewrite the old commit.
- Rebase may replay commits that become empty or conflict; inspect before skipping.
- A stash can conflict when reapplied to changed files.
- Reset does not protect untracked data from separate cleanup commands.
- Reflog entries are local and subject to expiration.
- A local hook can be bypassed or absent; CI policy must enforce team requirements.

## Reflection questions

1. Before undoing a change, can you name which layer you want changed?
2. How does your team communicate before rewriting a shared branch?
3. What local recovery path exists if a branch reference moves unexpectedly?
4. Which checks must be enforced in CI rather than trusted to contributors’ machines?

