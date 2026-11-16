# Git commits branches merge rebase conflict resolution and workflows — Interview questions and reasoning

Sources: [Git tutorial](https://git-scm.com/docs/gittutorial), [Git workflows](https://git-scm.com/docs/gitworkflows), [git-rebase](https://git-scm.com/docs/git-rebase), and [GitHub: About Git](https://docs.github.com/en/get-started/using-git/about-git).

## Core questions

1. What is the difference among the working tree, index, and HEAD?
2. What does a Git commit contain?
3. How do branches, tags, and remote-tracking refs differ?
4. How do merge and rebase differ?
5. How do restore, reset, and revert differ?
6. Why can a conflict happen, and how do you resolve it?
7. What does fetch do that pull also does?
8. How would you recover a seemingly lost local commit?
9. What workflow would you choose for a team shipping frequently?
10. Why are hooks not enough to enforce team policy?

## Concise interview answers

1. The working tree is editable files; the index is the proposed next snapshot; HEAD identifies the current commit, usually through a branch.
2. A commit points to a tree and parent commit(s), plus author/committer metadata and a message.
3. A branch normally moves with new work; a tag names a point; a remote-tracking ref is a local record of the last fetched remote state.
4. Merge joins histories and can preserve divergence; rebase replays commits on a new base and creates new identities.
5. Restore targets paths, reset moves HEAD/ref and optionally resets index/worktree, and revert adds a new inverse commit.
6. Git cannot safely combine overlapping or structurally incompatible changes. Inspect the base and sides, edit the intended result, stage, review, and continue or abort.
7. Fetch downloads objects and updates local remote-tracking refs without integrating into the current branch; pull then integrates.
8. Inspect the local reflog, locate the commit ID, and create a branch at it before further cleanup.
9. Choose based on release cadence and collaboration: short-lived reviewed branches or trunk-based integration keep changes small; release branches may support parallel maintenance at added cost.
10. Hooks are local and may be missing or bypassed. Required checks need shared CI and server-side branch protection.

## Deep follow-up answers

### Why is the index useful?

It makes the next snapshot explicit and lets a developer stage selected paths or hunks. That enables small coherent commits, but creates another state to review. A good commit check includes both unstaged and staged diffs; status alone does not show the content.

### Does Git store only diffs?

The logical model is snapshots linked by commits. Objects store contents and tree relationships; packfiles may use delta compression as an implementation optimization. Understanding snapshots is safer than assuming each commit is a patch against only its parent.

### When is rebase appropriate?

Rebase can place private commits on top of updated upstream work and make a review series easier to follow. Because it recreates commits, avoid rewriting published work without explicit team coordination. Merge preserves the existing ancestry relationship and is often suitable for shared integration.

### What do “ours” and “theirs” mean during a rebase conflict?

They are operation-relative labels, and the replay process can make them counterintuitive. Inspect the current operation, conflict stages, and actual file content. Do not resolve by choosing a side globally: the correct result may combine both edits.

### How do you distinguish a missing file change from a missing commit?

Inspect status, unstaged diff, staged diff, and commit log separately. An edit may only be in the working tree, staged but not committed, committed on another branch, or unreachable after a reference move. Reflog may help with the last case.

### What does force-with-lease protect?

It checks that the remote reference still matches the value the client expects before allowing a non-fast-forward update. It reduces the chance of overwriting unseen remote progress, but it does not coordinate teammates, preserve discarded commits, or make rewriting shared history harmless.

## Scenario questions

### Your teammate says “just reset main to origin/main” after a failed push. What do you do?

First inspect local status and the divergent graph. Determine whether local commits or edits need preservation and why the push failed. Fetch and compare. If remote commits are missing, integrate them rather than discarding them. Never move a shared branch until the team agrees and a recovery point exists.

### A commit accidentally includes a secret. Is amending enough?

Not if the secret was pushed or otherwise exposed. Remove it from the current tree, rotate/revoke the credential, notify affected owners, and follow repository incident policy. Rewriting history may reduce ordinary visibility but cannot retract clones, caches, logs, or forks. Prevention through secret scanning and protected review is important.

### How do you choose merge, squash, or rebase for pull requests?

Consider whether preserving individual commits helps audit/review, whether a single integration commit is the team convention, and whether linear history simplifies navigation. Ensure the selected method preserves required status checks and attribution. Git permits multiple shapes; repository policy and deployment/release needs determine the best fit.

### A bisect session points to different commits on repeated runs. Why?

The test may be flaky, depend on external services, use time-sensitive data, or classify an unbuildable revision incorrectly. Stabilize the test environment, define exit statuses for good/bad and untestable revisions, then restart or mark skipped revisions carefully. Bisect narrows only the signal supplied to it.

## Tradeoffs and alternatives

- **Merge versus rebase:** merge preserves branch topology; rebase produces a linear replayed series but rewrites IDs.
- **Reset versus revert:** reset changes local reference/history state; revert records a compensating commit suitable for shared history.
- **Feature branches versus trunk-based development:** branches can isolate review but long-lived divergence increases integration risk; trunk-based work emphasizes small changes and frequent integration.
- **Centralized versus fork-based collaboration:** centralized work shares a repository with access policy; forks separate contributor namespaces but add remote coordination.
- **Stash versus worktree:** stash shelves changes in one checkout; a worktree offers another checkout for parallel work without copying the repository.

## Common weak answers

- “Git saves every file automatically.” Only committed snapshots are durable project history; working-tree and index edits are separate.
- “A branch is a folder.” It is a reference to a commit.
- “Rebase is always cleaner.” It changes identities and can disrupt shared work.
- “Reset and revert both undo commits.” They have very different effects on shared history.
- “Force-with-lease cannot overwrite work.” It protects only against a changed expected ref and still needs coordination.
- “Theirs means the incoming developer’s version.” Operation context can reverse intuition.
- “Reflog can recover anything forever.” It is local and expires.
- “A pre-commit hook guarantees quality.” It is not shared enforcement.

## Self-check rubric

Score 0–2: 0 = incorrect; 1 = correct but shallow; 2 = explains mechanism and collaboration tradeoff.

- I can distinguish the working tree, index, HEAD, and remote-tracking refs.
- I can explain commit parentage and why rewritten commit IDs differ.
- I can choose merge/rebase/cherry-pick based on sharing and intent.
- I can resolve a conflict without guessing the sides.
- I can choose a safe undo action for local and published work.
- I can recover from local reference movement and state reflog limits.
- I can explain the difference between Git mechanics and GitHub policy.

