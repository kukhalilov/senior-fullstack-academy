# Git commits branches merge rebase conflict resolution and workflows — Reference: Remote refs, fetch/pull/push, review integration, and safe publication

Sources: [official reference 1](https://git-scm.com/docs/gitworkflows), [official reference 2](https://git-scm.com/docs/gittutorial), [official reference 3](https://docs.github.com/en/get-started/using-git/about-git).

## Scope and version

This guide covers the exact assigned inventory for Git 2.56.1 documentation checked 2026-11-20. Git’s availability and defaults depend on the installed version and configuration; check `git --version` and command help before relying on a new option. Path-oriented `git checkout` remains explained for compatibility, while focused `git switch` and `git restore` commands make intent clearer. [Git 2.56.1 documentation](https://git-scm.com/docs/git/2.56.1)

## How this group fits the mental model

Remote commands synchronize objects and references between independent repositories. Fetch makes remote state visible locally; integration is a separate decision; push publishes a ref update. Team workflows add review, protection, and coordination policies around those primitives.

## Supplied names explained

- `git remote` — Manages names and URLs for other repositories.
- `git remote add` — Adds a named remote URL to repository configuration.
- `git remote -v` — Shows fetch and push URLs for configured remotes.
- `git fetch` — Downloads objects and updates selected remote-tracking refs without integrating into the current branch.
- `git pull` — Fetches and then integrates a remote branch according to options/configuration; inspect before assuming merge or rebase.
- `git pull --rebase` — Fetches and rebases local commits onto the fetched upstream, rewriting those local commit IDs.
- `git push` — Publishes objects and updates remote refs when the update is permitted.
- `git push --set-upstream` — Pushes and configures the local branch’s upstream tracking reference.
- `git push --force-with-lease` — Requests a non-fast-forward update only if the remote ref still matches an expected observed value; it does not replace coordination.
- `Remote-tracking ref` — A local ref recording the last fetched value of a remote branch; it changes only when fetch/update occurs.
- `Upstream branch` — The configured remote branch used for tracking and default pull/push behavior for a local branch.
- `Tracking branch` — A local branch associated with an upstream reference for status and synchronization defaults.
- `Refspec` — A mapping that selects which source refs are fetched or pushed and where destination refs are updated.
- `FETCH_HEAD` — A file recording refs fetched by the most recent fetch, used by some integration operations.
- `Fetch before integrate` — Update local knowledge of remote commits before choosing merge, rebase, or another integration step.
- `Push rejection (non-fast-forward)` — The remote tip contains history not included in the proposed update; fetch and integrate rather than overwrite it blindly.
- `Pull request` — A hosting-platform proposal for review and integration; it is not a Git object or command.
- `Fork-based workflow` — Contributors publish branches to separate repository copies and request integration into the canonical repository.
- `Centralized workflow` — Contributors push branches to a shared central repository subject to its access and review policy.
- `Feature-branch workflow` — A unit of work is developed on a separate branch and integrated after review; long-lived branches accumulate divergence.
- `GitHub flow` — A lightweight hosted workflow using branches, pull requests, and deployment/integration after review.
- `Trunk-based development` — A workflow emphasizing frequent integration into a shared mainline, typically using small changes and compatible releases.
- `Release branch` — A maintained branch used to stabilize or service a release while other work continues elsewhere.
- `Long-lived branch cost` — Prolonged divergence increases merge conflicts, delayed feedback, and risk of integrating incompatible assumptions.
- `Protected branch` — A hosting rule restricting updates, often requiring review or checks; protection is not inherent Git behavior.
- `Required status check` — A hosting policy requiring a named CI result before a protected ref can be updated.
- `Code owner review` — A repository review policy requiring designated owners to approve changes to specified paths.
- `Merge queue` — A hosting workflow that validates queued changes against an expected integration order before merging.
- `Branch deletion after merge` — Removing the temporary branch ref after integration; ensure it is merged or otherwise recoverable first.
- `Signed-off-by commit trailer` — A message trailer representing a sign-off under a project’s contribution policy; it is not automatically a cryptographic signature.

## Cross-item comparison

Fetch updates local knowledge of remote refs; pull fetches and integrates; push publishes. Force push can replace a remote ref; force-with-lease checks expected state but still requires coordination. Fork workflows use separate repositories; centralized workflows share a central remote. Branch policies add server-side review and status constraints.

## Examples

After a push rejection, fetch, inspect divergence, integrate the remote commits, test, and push again. Do not respond to an unexplained rejection with force. For a private branch rewrite, fetch first and coordinate; use force-with-lease only after verifying the expected remote tip.

## Common mistakes

Assuming remote-tracking refs update automatically; assuming pull always merges; force-pushing over unseen work; treating a fork or branch name as a permission boundary; deleting a branch before confirming merge and backup policy.

## Knowledge checks with answers

1. **What does fetch update?** Remote-tracking references and downloaded objects; it does not automatically merge into the current branch.
2. **What is the difference between remote-tracking and a local branch?** One records the observed remote state; the other is a local movable branch you can commit on.
3. **Why use a lease-protected force push?** It refuses the rewrite if the remote ref advanced beyond the expected state.
