# end-to-end system design case studies — Reference: Build secrets injection

Sources: [HLD Handbook](https://hld.handbook.academy/), [GitHub Actions secrets](https://docs.github.com/en/actions/concepts/security/secrets), [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use), [GitHub Actions script injections](https://docs.github.com/en/actions/concepts/security/script-injections), [GitHub workflow events and forks](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Scope and version

This lesson designs secrets delivery for automated build/test/deploy jobs, with GitHub Actions as a concrete example. Secret availability depends on event type, repository settings, and permissions; check current platform documentation. The principles apply to other CI systems but exact masking, identity, and isolation guarantees differ.

## How this group fits the mental model

A secret is a credential or key whose disclosure enables access or impersonation. A build system may need credentials for package registries, signing, deployment, or cloud APIs. The runner must receive only what the specific trusted step needs, for only as long as needed, while code and logs are treated as possible disclosure paths.

The key design question is not simply “where do I put the secret?” It is “which code can execute while this credential is available, what can that code reach, and how do I limit and detect exposure?” Pull-request code may be attacker-controlled, especially when a contribution comes from a fork. A workflow that checks out or executes that code with privileged secrets can turn a build into credential exfiltration.

## Supplied names explained

- **Secret store:** encrypted platform storage for configured credentials. Storage encryption does not protect a secret from workflow code that is allowed to read and transmit it.
- **Job/step scope:** expose a secret only to the job or step that requires it; avoid passing it to unrelated actions, build scripts, or test processes.
- **Short-lived credential / OIDC federation:** prefer an identity token exchanged for narrowly scoped temporary credentials when supported, instead of a long-lived cloud key. Bind trust to the intended repository, workflow, branch, environment, or deployment context.
- **Least privilege:** grant only the minimum repository, package, cloud, or deployment permissions required, with read-only defaults where possible.
- **Untrusted workflow input:** pull-request title/body, branch name, source code, issue text, artifact contents, and other externally controlled values. Never interpolate these into shell code or run untrusted code in a privileged context without a secure separation design.
- **Masking:** a log-redaction convenience, not a security boundary. GitHub warns that transformed/derived secret values may not be redacted; never print secrets, command environments, tokens, or sensitive generated credentials.
- **Fork event restriction:** GitHub documents that repository secrets are not passed to workflows triggered by pull requests from forks (except the restricted `GITHUB_TOKEN` behavior). Avoid bypassing this safeguard with privileged trigger patterns that execute untrusted PR code.

## Cross-item comparison

| Credential delivery | Benefits | Risks / controls |
| --- | --- | --- |
| Long-lived repository secret | Simple for a small trusted workflow | Broad duration and blast radius; rotate, scope narrowly, restrict workflow access, and never use in untrusted PR jobs |
| Environment-scoped secret with protection rules | Limits which deployment jobs can access it and can add branch/reviewer controls | Review policy and environment access must be configured; compromise of an allowed job still exposes it |
| Short-lived OIDC-issued credential | Avoids storing a permanent cloud key in repository secrets; credential expires | Trust policy must verify repository/workflow/ref/environment claims and grant minimal cloud role; stolen live token can still be abused during its validity |
| Public/fork contribution validation without secrets | Safely tests untrusted code with read-only permissions and no privileged credentials | Some operations such as deployment or private package access must occur later in a separate trusted workflow after checks/approval |

Keep workflows that process untrusted pull-request code separate from privileged workflows. A later trusted workflow should consume carefully validated artifacts or repository commits and must not blindly execute attacker-controlled scripts or artifacts with deployment credentials.

## Examples

A pull-request build runs formatting and tests on code from a fork. It receives no deployment key, cloud role, or write token. The workflow uses a read-only token, pins third-party actions to verified immutable commits or a trusted lockfile, and passes untrusted title/body data through environment variables or safe argument handling rather than composing shell source. It does not use `pull_request_target` to check out and execute the fork’s code while privileged secrets are available.

After a protected branch is updated, a separate deployment job requests a short-lived identity token, exchanges it with the cloud provider for a narrowly scoped role, deploys a known build artifact, and records deployment provenance. The credential is not printed; generated tokens and transformed credentials are also treated as sensitive. The job cannot modify unrelated repositories or access production data except as required for deployment.

For package publishing, split build from publish: build/test can run on untrusted content without publish credentials; a protected release job verifies the source/ref and artifact, then receives a narrowly scoped package token for the publish step only. Restrict who can modify the workflow and action dependencies, since that code defines how secrets are used.

## Common mistakes

- Assuming encrypted secret storage or automatic log masking makes secret exposure impossible.
- Giving secrets to every workflow/job “just in case” or exposing them to every action in a job.
- Running fork pull-request code with deployment secrets, a write-capable token, or privileged cloud credentials.
- Using an elevated trigger to gain secrets and then checking out/executing attacker-controlled pull-request code.
- Interpolating untrusted event fields into shell syntax, creating script injection.
- Printing environment variables or assuming masking catches base64, URL-encoded, concatenated, or otherwise transformed credentials.
- Reusing one broad long-lived key across build, test, staging, and production.
- Forgetting that a compromised third-party action executes with the secrets and permissions available to its job.
- Using a short-lived identity token with a trust policy so broad that any repository or branch can assume the role.
- Publishing artifacts built from untrusted code in a privileged workflow without validating provenance and contents.

## Knowledge checks with answers

1. **A public fork opens a pull request. Should the test job receive a deploy secret if the test needs deployment-shaped config?** No. Use non-secret test configuration or a separate trusted environment; do not expose production credentials to untrusted code.
2. **Does GitHub log masking make printing a transformed secret safe?** No. Redaction is not guaranteed for derived values; do not print secrets or their transformations.
3. **What does OIDC improve?** It can replace a stored long-lived cloud key with a short-lived credential under a trust policy. It does not make an overbroad role or compromised workflow safe.
4. **Why pin third-party actions?** The workflow executes action code in a context that may have credentials or write permissions; immutable, verified references reduce the risk of a moved tag changing that code unexpectedly.
5. **How should deployment differ from pull-request validation?** Separate untrusted test execution from trusted deployment, restrict permissions and credentials, validate the selected ref/artifact, and require protected environment controls appropriate to the risk.

## Review status

Secret availability on fork events, masking limitations, untrusted script-injection inputs, and action pinning are checked against GitHub documentation. This lesson remains pending a full claim-by-claim audit and manifest omission check; it does not replace a threat model for any specific CI platform.
