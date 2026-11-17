# end-to-end system design case studies — Reference: Ephemeral CI runner

Sources: [HLD Handbook](https://hld.handbook.academy/), [GitHub Actions self-hosted runners reference](https://docs.github.com/en/actions/reference/runners/self-hosted-runners), [GitHub Actions secure use](https://docs.github.com/en/actions/reference/security/secure-use), [GitHub Actions runner removal](https://docs.github.com/en/actions/how-tos/manage-runners/self-hosted-runners/remove-runners).

## Scope and version

This lesson covers one-job or short-lived CI runners that are created for a job and removed afterward. GitHub documents its ephemeral and just-in-time runner mechanisms; cloud VM lifecycle, image sanitation, registration, and log handling depend on the chosen implementation.

## How this group fits the mental model

CI executes repository code, tests, build scripts, and third-party actions. If a runner is reused, one job can leave processes, files, credentials, modified tools, or persistence mechanisms for the next job. A fresh runner per job limits cross-job residue and makes resource ownership clearer, but does not make the current job’s code trustworthy or secure the host/management plane by itself.

A robust lifecycle is: create an isolated runner from a patched image, register it with a limited scope and short-lived credentials, assign one job, provide only necessary secrets/permissions, collect logs/artifacts, revoke/remove registration, and destroy the VM/disks/network state. If startup/cleanup fails, quarantine the host and alert rather than returning it to a trusted pool.

## Supplied names explained

- **Persistent runner:** remains registered and may execute multiple jobs; caches and tool installations can be warm, but state may persist across trust boundaries.
- **Ephemeral runner:** designed to take one job and then be removed from the service/runner pool; infrastructure must still be destroyed or reset securely.
- **Just-in-time (JIT) runner:** registered for a specific job with a one-time configuration token/process under the platform’s supported lifecycle.
- **Runner image:** base OS/toolchain image. Keep it patched, reproducible, minimal, and free of baked-in credentials.
- **Runner control plane:** orchestrates creation, registration, job assignment, logs, and destruction; protect its tokens and API access separately from job code.
- **Untrusted workload:** pull-request or customer-controlled code. Ephemeral lifetime reduces persistence but the job can still exfiltrate any network-accessible secret or attack the host/kernel during execution.

## Cross-item comparison

| Runner type | Strength | Risk/operational cost |
| --- | --- | --- |
| Managed hosted runner | Provider handles lifecycle and clean VM provisioning within documented service model | Less host control; limits, network, hardware, and image versions follow provider offerings |
| Persistent self-hosted runner | Warm tools, local network access, and hardware control | Residual compromise/state across jobs; untrusted code may persist or access host data |
| Ephemeral self-hosted runner | Fresh environment per job, can use custom hardware/network | Requires secure provisioning, one-job registration, patching, cleanup, capacity and failure handling |
| Container-only isolation on persistent host | Fast and resource efficient | Container boundary does not automatically erase or isolate host/kernel state; workload may attack shared host or daemon |

## Examples

A public pull request runs tests on a one-job ephemeral VM with read-only repository token and no deployment secrets. The VM is created from a signed/verified image, has restricted egress, and is destroyed after log/artifact upload. A later protected-branch deployment uses a separate runner pool and short-lived deployment identity. The PR runner does not receive that identity, even though it is ephemeral.

If a job is canceled or the VM loses network access before deregistration, a controller expires the registration, revokes tokens, deletes disks/snapshots, and marks the host unusable until cleanup is confirmed. Log secrets and runner registration tokens are never emitted. Monitor provisioning delay, runner queue time, image age, job assignment, termination failures, orphaned resources, and unexpected outbound traffic.

## Common mistakes

- Treating “one job per runner” as proof the job cannot exfiltrate its current secrets or attack the host.
- Running untrusted pull-request code on a persistent host with repository/cloud secrets.
- Deleting the runner registration but leaving VM disks, snapshots, credentials, or network interfaces alive.
- Reusing a supposedly ephemeral VM image that contains mutable state or credentials from a prior boot.
- Giving every runner broad repository scope, long-lived registration tokens, or unrestricted network access.
- Sending untrusted artifacts/logs into privileged follow-up jobs without validation.
- Ignoring host kernel/hypervisor patching and control-plane compromise.
- Returning a runner to service after incomplete cleanup instead of quarantining it.
- Failing to account for cold-start costs, queue capacity, image updates, and runner service rate limits.

## Knowledge checks with answers

1. **Does an ephemeral runner make malicious PR code safe to run with a deploy secret?** No. It limits persistence between jobs, but code can still read/exfiltrate secrets provided during its job.
2. **What must be destroyed after a job?** The runner registration and underlying mutable resources such as VM, disks, snapshots, credentials, and attached network state according to the infrastructure design.
3. **Why use separate trust tiers?** Validation of untrusted contributions and privileged deployment have different code trust and credential requirements.
4. **What should happen when cleanup is uncertain?** Quarantine the host/resources and revoke access rather than reusing the runner as clean.

## Review status

GitHub’s ephemeral/JIT runner model and self-hosted runner security caveats are checked against official docs. This lesson remains pending complete claim-by-claim audit and manifest omission check.
