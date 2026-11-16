# Git commits branches merge rebase conflict resolution and workflows — Reference: Creating, inspecting, comparing, and recovering commits

Sources: [official reference 1](https://git-scm.com/docs/gittutorial), [official reference 2](https://git-scm.com/docs/gitcore-tutorial).

## Scope and version

This guide covers the exact assigned inventory for Git 2.54 documentation checked 2026-11-14. Git’s availability and defaults depend on the installed version and configuration; check `git --version` and command help before relying on a new option. Path-oriented `git checkout` remains explained for compatibility, while focused `git switch` and `git restore` commands make intent clearer. [Git 2.54 documentation](https://git-scm.com/docs/git/2.54.0)

## How this group fits the mental model

A commit is a durable snapshot with parentage and metadata. The command sequence in this group lets you create a repository, assemble snapshots, inspect authorship and differences, mark releases, and recover recent local movement. Review the exact staged tree before recording a commit.

## Supplied names explained

- `git init` — Creates repository metadata in a directory so it can record future snapshots.
- `git clone` — Creates a local repository from a source and normally configures its origin remote and initial checkout.
- `git status` — Summarizes branch and differences among HEAD, index, working tree, and untracked paths.
- `git add` — Copies the current content of selected paths into the index; it does not create a commit.
- `git add -p` — Interactively stages selected diff hunks, allowing a commit to contain only part of an edited file.
- `git commit` — Records the index as a new commit with parentage and metadata.
- `git commit --amend` — Replaces the current commit with a new one; the old commit identity changes and published history may need coordination.
- `git show` — Displays an object or commit and its associated change summary/content.
- `git log` — Lists commits reachable from selected references; options control ordering, formatting, and revision range.
- `git log --graph` — Shows ancestry connections in an ASCII graph, useful for spotting divergence and merge commits.
- `git diff` — Compares trees or working-tree/index states; specify the intended endpoints to avoid reviewing the wrong layer.
- `git diff --staged` — Compares index with HEAD, showing what the next ordinary commit would include.
- `git diff-tree` — Compares tree objects, often to inspect files changed by one or more commits.
- `git blame` — Shows the commit/author attribution for lines in a file; attribution does not prove who caused a bug.
- `git shortlog` — Summarizes commit history, often grouped by author.
- `Commit parent` — The parent link that makes a commit part of the history graph; merge commits can have multiple parents.
- `Root commit` — A commit with no parent, which establishes the initial project tree in that history.
- `Commit message` — Human-readable explanation of the change’s purpose; concise subject and useful context help future debugging.
- `Author identity` — Metadata naming the original change author; it can differ from the committer after replay or patch application.
- `Committer identity` — Metadata naming who created this particular commit object; a rebase may change it while preserving the author.
- `Commit trailer` — A structured line at the end of a message used by repository conventions for metadata such as review references or sign-off.
- `Signed commit` — A commit carrying a cryptographic signature verifiable against a configured public key and trust policy.
- `GPG commit signature` — A commit signature created with GPG; verification depends on having the right public key and trusting its identity.
- `SSH commit signature` — A commit signature created with SSH key material; verification still requires an explicit trust configuration.
- `Commit signing verification` — Checks signature validity and configured identity trust; it does not review the code’s correctness.
- `git tag` — Creates, lists, or deletes tag references; use annotated tags when release metadata or signatures are important.
- `Annotated tag` — A tag object with message and tagger metadata and optional signature, useful for release points.
- `Lightweight tag` — A direct reference to an object without a tag object’s message/tagger metadata.
- `git describe` — Produces a human-readable name based on a reachable tag and distance/commit identity, according to its options.
- `git reflog` — Shows recent local reference movements; useful for finding prior branch or HEAD values.
- `Reflog expiration` — Prunes old reflog entries by configured policy; once references and unreachable objects are pruned, recovery can become impossible.
- `Reachability` — Whether an object can be found by traversing from a reference; unreachable commits may eventually be removed.
- `Dangling object` — An object not referenced by another reachable object; it may be recoverable temporarily but should be named promptly if needed.
- `git fsck` — Checks object connectivity and validity, and can report dangling objects for investigation.
- `git gc` — Optimizes repository storage and prunes objects according to reachability/expiration policy; do not run before recovering needed objects.
- `git maintenance` — Runs repository housekeeping tasks such as repacking and commit-graph maintenance, often scheduled in the background.
- `Commit object identity after amend` — Amend creates a new commit object; its ID differs because commit content/metadata or parent linkage changed.

## Cross-item comparison

Initialization creates a repository; cloning copies an existing one. Add stages, commit records, and show/log/diff inspect different aspects. Annotated tags store metadata/signatures in an object, while lightweight tags are direct references. Amend replaces a local tip commit; reflog helps locate earlier local refs but is not remote recovery.

## Examples

A disciplined sequence is: inspect status, stage selected paths, inspect the staged diff, commit, then inspect the commit. When correcting a private message or accidentally staged content, amend only after checking whether the commit has been published. For an accidental branch move, inspect reflog and create a safety branch at the desired object.

## Common mistakes

Committing without inspecting staged changes; amending published history without coordination; assuming author equals committer; treating signatures as quality review; assuming reflog is shared or permanent; running maintenance before recovering an unreachable commit.

## Knowledge checks with answers

1. **Which state contains the proposed next snapshot?** The index.
2. **Why does amending or rebasing change commit identity?** The commit object and/or parent relationship changes, producing a different object.
3. **What is the safe response to a conflict?** Inspect operation roles, edit the desired result, stage and review, then continue or abort.
4. **How do restore, reset, and revert differ?** Restore targets paths, reset moves local HEAD/ref and may reset index/worktree, and revert records an inverse commit.
5. **What does fetch do without pull?** It downloads objects and updates local remote-tracking references without integrating into the current branch.
6. **What are reflog limits?** It records local ref movements, can expire, and is not available as another clone’s backup.

