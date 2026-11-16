# Git commits branches merge rebase conflict resolution and workflows — Reference: Object database, references, HEAD, index, and working-tree snapshots

Sources: [official reference 1](https://git-scm.com/docs/gitcore-tutorial), [official reference 2](https://git-scm.com/docs/gitglossary), [official reference 3](https://git-scm.com/docs/gitdatamodel).

## Scope and version

This guide covers the exact assigned inventory for Git 2.54 documentation checked 2026-11-14. Git’s availability and defaults depend on the installed version and configuration; check `git --version` and command help before relying on a new option. Path-oriented `git checkout` remains explained for compatibility, while focused `git switch` and `git restore` commands make intent clearer. [Git 2.54 documentation](https://git-scm.com/docs/git/2.54.0)

## How this group fits the mental model

Git’s object/reference model is the foundation for understanding what status, staging, branching, and recovery actually change. Objects store immutable content and snapshots; references provide movable or named entry points into that graph. The working tree and index are separate mutable states layered over the commit selected by HEAD.

## Supplied names explained

- `Git repository` — A repository contains the object database, references, configuration, and associated metadata needed to manage project history.
- `Working tree` — The checked-out files and directories where edits happen; it can differ from both the index and HEAD.
- `Index (staging area)` — The proposed tree for the next commit. It can hold a version different from the current working-tree file.
- `Git object database` — The content-addressed store for blobs, trees, commits, and tags; Git may pack and delta-compress objects internally.
- `Blob object` — Stores file content without its pathname; a tree connects that content to names and modes.
- `Tree object` — Represents a directory snapshot by mapping names and modes to blobs or subtrees.
- `Commit object` — Points to a tree and parent commit(s), with author/committer metadata and a message.
- `Annotated tag object` — A tag object containing a target, tagger metadata, message, and optionally a signature.
- `Object ID` — The identifier derived from object contents; changing the object produces a different identity.
- `Content-addressed storage` — Objects are named by their contents, allowing integrity checks and reuse of identical data.
- `HEAD` — The checkout pointer, usually a symbolic reference to a branch but sometimes directly a commit.
- `Symbolic reference` — A reference whose value names another reference, such as HEAD naming the current branch.
- `Detached HEAD` — A state where HEAD points to a commit rather than a branch; commits made here need a new reference to remain easy to find.
- `Branch reference` — A movable name pointing to a commit, usually the tip of one line of development.
- `Tag reference` — A named reference intended to identify a particular object, commonly a release point.
- `Remote-tracking branch` — A local reference recording a remote branch as last observed by fetch; it is not the live remote branch.
- `Repository configuration` — Settings stored at system, global, or repository scope that affect Git behavior; inspect scope when a value surprises you.
- `.git directory` — The repository’s administrative data location in a normal non-bare repository; worktree setups can use linked metadata.
- `Git ignore pattern` — A pattern controlling whether untracked paths are reported; ignore rules do not remove already tracked files.
- `.gitignore file` — A versioned file of ignore patterns that can be shared with the project.
- `Global excludes file` — A user-specific ignore list for files that should not usually enter any repository.
- `Git attributes file` — Rules that assign path-specific behavior such as text normalization, diff/merge treatment, and filters.
- `Line-ending normalization` — Converting configured text files to a consistent repository representation while allowing platform working-tree forms.
- `End-of-line attribute` — A path attribute that controls text detection or line-ending behavior; inconsistent settings can create noisy diffs.
- `Untracked file` — A path not yet recorded in the index or repository history.
- `Ignored file` — An untracked path hidden by ignore rules; force-add is possible, so inspect before publishing.
- `Tracked file` — A path represented in Git’s index/history, whether currently modified or clean.
- `Staged change` — A difference between the index and HEAD that is eligible for the next commit.
- `Unstaged change` — A difference between the working tree and index that will not enter the next commit unless staged.
- `Unmerged index entry` — Multiple index stages for a conflicted path, preserving base/current/incoming versions until resolution.

## Cross-item comparison

The working tree is editable content, the index is the proposed next tree, and HEAD names the current committed baseline. Blobs hold contents, trees map names to objects, commits connect trees and parents, and tag objects add a named annotated target. A branch normally moves; a tag is intended to mark a point.

## Examples

After editing a tracked file, status reports a working-tree change. Stage it, edit it again, and status will show both an index change and a later working-tree change. The next commit records only the index version. If the path is ignored but already tracked, edits remain visible because ignore rules do not untrack it.

## Common mistakes

Confusing the index with the working tree; assuming ignore removes already tracked files; using global ignores to hide required project files; changing line-ending settings without checking attributes; treating an object ID as a branch name.

## Knowledge checks with answers

1. **Which state contains the proposed next snapshot?** The index.
2. **Why does amending or rebasing change commit identity?** The commit object and/or parent relationship changes, producing a different object.
3. **What is the safe response to a conflict?** Inspect operation roles, edit the desired result, stage and review, then continue or abort.
4. **How do restore, reset, and revert differ?** Restore targets paths, reset moves local HEAD/ref and may reset index/worktree, and revert records an inverse commit.
5. **What does fetch do without pull?** It downloads objects and updates local remote-tracking references without integrating into the current branch.
6. **What are reflog limits?** It records local ref movements, can expire, and is not available as another clone’s backup.

