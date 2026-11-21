# Git commits branches merge rebase conflict resolution and workflows — Big-picture orientation and mental model

Sources: [Git tutorial](https://git-scm.com/docs/gittutorial), [Git core tutorial](https://git-scm.com/docs/gitcore-tutorial), [Git workflows](https://git-scm.com/docs/gitworkflows), and [GitHub: About Git](https://docs.github.com/en/get-started/using-git/about-git).

## Problem and purpose

Software changes over time and often involve multiple people. Git records snapshots, explains how they relate, lets contributors work independently, and gives teams deliberate ways to combine and publish changes. It is distributed: a clone contains repository history locally, so much work can happen offline.

Git is easiest to use safely when you distinguish three states: files you are editing, the proposed snapshot you have staged, and the committed snapshot. A branch is a movable name for a line of history. A merge joins histories; a rebase recreates commits on a new base. Recovery tools have different effects, so identify which state you intend to change before undoing anything.

## Plain-language mental model

Think of Git as a camera archive with labeled bookmarks. A commit is a complete project snapshot plus its parent links and metadata. The index is a tray where you assemble the next snapshot. A branch is a bookmark that moves as commits are added. HEAD tells Git which branch or commit your working directory is based on. A remote is another repository with its own references.

Git stores file contents and directory relationships as objects, then commits point to trees and parent commits. This content-addressed model explains why identical content can be shared efficiently and why changing a commit changes its identity. Branching is cheap because making a branch mostly creates or moves a reference.

## How the parts fit together

1. Clone or initialize a repository, then inspect the current branch and working tree.
2. Edit files. Use status and diff to understand unstaged changes.
3. Stage the specific changes that belong together; inspect the staged diff separately.
4. Commit the staged snapshot with a message that explains why the change exists.
5. Create a branch to isolate a unit of work. Update it from shared history with a deliberate merge or rebase.
6. Resolve conflicts by understanding both sides, editing the desired result, and checking the index and complete diff. Git 2.56 adds `git add --resolved` to stage only resolved conflict paths after checking for leftover markers; use it when available, while retaining the deliberate edit-stage-review workflow for every version.
7. Fetch remote history before integrating. Push a fast-forward update, or coordinate carefully if shared history must be rewritten.
8. Use restore for path-level discard, reset to move local state/references, revert to add an inverse commit, and reflog for local reference recovery.

## Concept map

| Git area | Main question | Safe starting point |
|---|---|---|
| Repository state | What is committed, staged, or only edited? | status, then unstaged and staged diff |
| Object history | What snapshots and parents exist? | show and log |
| Branch integration | How should independent work be combined? | inspect merge base and graph first |
| Recovery | Which state should change: file, index, or history? | identify desired source snapshot before command |
| Collaboration | What has the remote seen? | fetch and compare before push/integration |
| Repository tools | How can bugs or isolated work be managed? | bisect, worktree, hooks, and maintenance within scope |

## End-to-end walkthrough

Suppose you implement a feature on a short-lived branch. You make several edits, stage only the feature files, and review the staged diff before committing. A teammate publishes a change to the target branch while you work. Fetch the remote branch and inspect the graph. If the feature branch is private, rebase its commits onto the updated target to keep a linear local series; if the branch is already shared, coordinate because rebasing changes commit identities. If Git reports a conflict, inspect the base and both sides, edit the correct combined result, stage it, and continue. Run project checks, review the final diff, then push and open a pull request. A non-fast-forward rejection means the remote has work you have not integrated; fetch and inspect rather than forcing the update.

## When to use it and tradeoffs

Use merge when preserving the fact that histories diverged is valuable or a branch is shared. Use rebase to replay private work on a newer base when a linear series helps review. Use revert to undo a published change without erasing shared history. Reset is useful for private local staging/history edits but can discard work. Reflogs can help recover recent local reference movement but are local and expire; they are not a remote backup.

## What later lessons cover

The concepts lesson explains snapshots, staging, references, identity, integration, and recovery. Reference guides cover repository state, commits, branches/conflicts, undo, remotes/team workflows, and hooks/diagnostic tools. Practice walks through integration and recovery; interview questions test tradeoffs and collaboration safety.

