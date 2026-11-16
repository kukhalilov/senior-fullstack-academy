# Git commits branches merge rebase conflict resolution and workflows — Core concepts and how they fit together

Sources: [Git core tutorial](https://git-scm.com/docs/gitcore-tutorial), [Git tutorial](https://git-scm.com/docs/gittutorial), [git-rebase](https://git-scm.com/docs/git-rebase), and [git-reset](https://git-scm.com/docs/git-reset).

## Learning objectives

You will be able to describe Git’s object and reference model, explain the separation among HEAD, index, and working tree, predict what merge/rebase/reset/restore/revert change, and recover safely from a conflict or a mistaken local reference update.

## Prerequisites

A file can have a current editable version and a saved version. A snapshot records a project state. A directed graph represents relationships where commits point to parent commits. A distributed repository gives each clone its own local history and references.

## Core concepts

### Objects form immutable snapshots

Git stores file content in blobs, directories in trees, and history in commits. A commit refers to a tree and its parent commit or commits, plus metadata. A root commit has no parent; a merge commit commonly has multiple parents. Object IDs identify content-addressed objects. If the content and metadata change, a new object identity results.

References are human-readable names pointing to objects. A branch reference normally points to the tip commit of a line of work and moves when new commits are made. A tag names a point intended to remain fixed. HEAD usually symbolizes the current branch; in detached HEAD state it names a commit directly, so new commits may not be reachable from a branch unless you create a reference.

### Working tree, index, and HEAD are separate

The working tree contains files you inspect and edit. The index (staging area) records the exact content proposed for the next commit. HEAD identifies the current commit (usually through the current branch). Status compares these layers.

After editing a tracked file, the working tree differs from the index. After staging it, the index differs from HEAD. Staging is not an upload and does not create a commit. It is a deliberate snapshot boundary: a single file can have staged and later unstaged edits simultaneously. Always inspect both unstaged and staged diffs before committing.

Untracked files have not been added to Git. Ignored files match ignore rules but may still be force-added. Tracked means present in Git’s index/history, not necessarily currently modified.

### Commits and identity

A commit captures the tree in the index, parent link(s), author and committer metadata, and message. Author identifies who originally wrote the change; committer identifies who created this commit object, which can differ after a rebase or cherry-pick. Amend creates a replacement commit rather than modifying the old object in place. Signed commits provide cryptographic evidence tied to a configured key and verification policy; a signature alone does not prove code quality or authorization.

### Integration preserves or recreates history

A merge joins lines of history using their common ancestor. A fast-forward simply moves a branch reference when no divergence exists; a three-way merge creates a result from base plus both sides, often recorded as a merge commit. Rebase replays commits onto another base, creating new commit identities. It can simplify review but changes history. Do not rebase commits others already use without coordination.

Cherry-pick applies a selected commit’s change onto the current branch as a new commit. Revert creates a new commit that reverses a previous change. These operations can conflict when surrounding context changed; conflict resolution is a deliberate edit, not an automatic choice of one whole file side.

### Conflict stages and rebase wording

During a merge conflict, Git records multiple stages in the index: common ancestor (stage 1), current side (stage 2), and incoming side (stage 3). The words “ours” and “theirs” depend on the operation. In a rebase, the branch being replayed is temporarily applied onto the new base; intuitive assumptions about those labels can be reversed. Inspect the file, operation, and stages rather than selecting a side blindly.

Resolve by editing the intended final file, removing conflict markers, staging it, reviewing the staged result, then continuing the merge/rebase/cherry-pick. Abort when you want to return to the pre-operation state. Never continue before understanding the result.

### Distributed collaboration and recovery

Fetch updates remote-tracking references without integrating them into the current branch. Pull fetches and then integrates according to configuration/options. Push updates remote references if the server permits it. Non-fast-forward rejection protects remote history from being overwritten by an update that does not contain its existing commits.

A reflog records recent local reference movements, including HEAD changes, and can help locate a lost commit. It is local, subject to expiration, and not a backup. Unreachable objects can remain temporarily but may be pruned by maintenance. Before destructive operations, make a branch or bundle backup when the data matters.

## Mechanisms and relationships

### Safely prepare a commit

1. Run status and identify tracked, untracked, and ignored content.
2. Inspect unstaged changes; stage selected paths or interactive hunks.
3. Inspect the staged diff and check for secrets, generated artifacts, and unrelated edits.
4. Commit with a message explaining intent; review the resulting commit.
5. Run relevant checks and verify the branch tip and working tree.

### Integrate recent shared work

1. Fetch.
2. Compare local and remote tracking histories, including divergence.
3. Choose merge or rebase based on branch sharing and repository policy.
4. Resolve conflicts using the operation’s actual base/current/incoming roles.
5. Review range or final diff and run checks.
6. Push normally; if rejected again, fetch and diagnose the new remote change.

### Choose an undo operation

- Restore edits a path in the working tree or index from a source tree, without moving the branch.
- Reset moves HEAD/current branch and may reset the index and working tree depending on mode; a hard reset can discard local state.
- Revert creates an inverse commit and is usually safer for published history.
- Stash stores selected changes for temporary cleanup, but is not a durable backup or collaboration mechanism.
- Reflog helps find prior local reference values; recover quickly and create a branch at the needed commit.

## Worked examples

### Split staging from later edits

Change a file, stage it, then make a second change. The staged diff shows only the first version; the unstaged diff shows the second. A commit includes only the staged state. This is useful for separating unrelated changes, but forgetting the second diff can leave work uncommitted.

### Rebase private work

Feature history is A—B—C and the target has advanced from A to A—D. Rebasing the private feature replays B and C onto D, yielding new commits B′ and C′. The patch may be similar, but IDs differ because parents changed. If teammates based work on B or C, they must coordinate with the rewrite.

## Misconceptions and edge cases

- “Git stores only diffs.” Git’s user model is snapshots; storage packs and delta-compresses objects internally.
- “Staged means committed.” The index is only the proposed next tree.
- “A branch contains files.” A branch is a reference to history; the working tree is a checkout.
- “Reset deletes a commit from every copy.” It moves local references and state; other clones and remotes remain independent.
- “Revert erases the old commit.” It adds a new commit that reverses changes.
- “A clean status proves no recoverable objects remain.” Objects can be unreachable and later pruned.
- “Force-with-lease makes rewriting safe.” It checks an expected remote state but does not coordinate people or protect uncommitted local work.
- “A conflict means both people changed the same line.” Rename, delete/edit, binary, and structural conflicts can also occur.
- “Reflog is a backup.” It is local and expires.

## Knowledge checks with answers

1. **What does a commit capture?** The index tree, parents, identities, and message.
2. **How can one file be staged and also modified?** Stage one version, then edit the working-tree copy; index and work tree now differ.
3. **Why does rebase change IDs?** Replayed commits have different parent relationships and therefore new commit objects.
4. **Which is appropriate for undoing a published commit?** Usually revert, because it adds an inverse change without rewriting collaborators’ history.
5. **What should you do after a conflict?** Understand roles, edit the intended result, stage and inspect it, then continue or abort deliberately.
6. **Can reflog recover a commit on another device?** No; reflogs belong to the local repository.

