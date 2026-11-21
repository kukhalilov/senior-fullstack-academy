# end-to-end system design case studies — Reference: Linux cgroups

Sources: [HLD Handbook](https://hld.handbook.academy/), [Linux kernel cgroup v2 documentation](https://docs.kernel.org/admin-guide/cgroup-v2.html), [Linux kernel cgroup namespaces documentation](https://docs.kernel.org/admin-guide/namespaces/cgroup.html).

## Scope and version

This lesson covers Linux control groups (cgroups), focusing on the unified cgroup v2 hierarchy. Controller files and behavior vary by kernel/configuration and host manager; consult the running kernel’s documentation and systemd/container runtime setup. Cgroups limit/account for resource use but do not by themselves provide a complete security boundary.

## How this group fits the mental model

A process group can be placed in a cgroup hierarchy so the kernel can account for and control resources used by that group and its descendants. A parent can apply limits/protections to a workload subtree; child limits may be overcommitted relative to the parent’s available capacity. Cgroups support workload management (for example containers and services), noisy-neighbor control, and resource accounting.

The cgroup hierarchy is not a process namespace and not a VM. It controls selected resources under kernel semantics; namespaces change views/isolation for other resources, and a virtual machine has a different boundary. A process may still exhaust resources not limited at the cgroup or host boundary, so configure the relevant controllers and system-level safeguards.

## Supplied names explained

- **cgroup v2 unified hierarchy:** single hierarchy rooted at `/sys/fs/cgroup`, with controller interfaces enabled for subtrees according to kernel rules.
- **CPU weight (`cpu.weight`):** relative distribution of CPU cycles among active siblings; it is not a fixed CPU quota.
- **CPU quota (`cpu.max`):** limits CPU time over a configured period, potentially throttling tasks after quota is consumed.
- **Memory control (`memory.max`, `memory.high`, `memory.low`):** maximum, pressure/throttling, and best-effort protection controls with distinct semantics; memory pressure/OOM behavior must be observed and tested.
- **I/O control (`io.max`, `io.weight`):** controls/weights for I/O against devices where supported; effective behavior depends on device and kernel configuration.
- **cpuset:** constrains eligible CPU and memory-node placement; can affect locality and capacity.
- **Accounting/statistics:** per-cgroup usage and pressure indicators help diagnose throttling, memory pressure, or I/O saturation; interpret them with host and parent limits.
- **Delegation:** granting a subtree manager permission to control descendants without giving it unrestricted host control; controller enabling and ownership rules matter.

## Cross-item comparison

| Control | What it expresses | Common misconception |
| --- | --- | --- |
| Weight | Relative share under contention | Does not reserve that many cores or cap total usage when others are idle |
| Quota/limit | Maximum consumption over a configured period/resource | Hitting a cap may throttle or trigger pressure; setting a limit too low harms latency |
| Protection (`memory.low`) | Best-effort protection subject to ancestor availability and competition | Not an unconditional reservation if ancestors/children overcommit |
| Accounting | Observed usage/events | Measurement alone does not constrain workload |
| Namespace | Process/resource view isolation (PID, mount, network, etc.) | Not a CPU/memory quota; often combined with cgroups |

## Examples

A multi-tenant build host assigns each job to a dedicated cgroup subtree. The parent runner cgroup protects host services; a job receives a CPU quota and memory maximum, plus I/O controls if supported. `cpu.weight` can prioritize interactive control-plane work over batch compilation during contention, while `cpu.max` prevents one job from consuming all CPU time. A memory limit can lead to reclaim pressure or OOM termination, so the job controller monitors memory events and reports an actionable failure rather than treating it as a generic build error.

For a container platform, verify that the runtime actually places every process/child process in the intended cgroup, that systemd/runtime delegation is compatible, that required controllers are enabled in parent subtrees, and that host-level services remain protected. Test burst behavior, cgroup migration, process forks, memory pressure, CPU throttling, device I/O, and cleanup. Inspect cgroup stats together with host metrics to distinguish a tenant cap from host-wide saturation.

## Common mistakes

- Treating CPU weight as a hard cap or guaranteed reservation.
- Treating a configured memory protection as absolute despite ancestor limits/overcommit.
- Setting memory limits without understanding reclaim, OOM, and application failure behavior.
- Assuming cgroups isolate files, processes, or networks like namespaces/VMs.
- Applying cgroup controls only to the main process while child processes escape the intended subtree.
- Ignoring controller enablement/delegation constraints in the hierarchy.
- Confusing per-cgroup usage with host capacity or not accounting for parent overhead.
- Assuming I/O limits behave identically across devices, filesystems, and kernel versions.
- Reusing a cgroup path or failing to remove stale cgroups after jobs exit.

## Knowledge checks with answers

1. **Does `cpu.weight` cap a workload to a fixed number of cores?** No. It expresses relative CPU share under contention; use a quota/placement control for different requirements.
2. **Does a cgroup create a complete security sandbox?** No. It controls selected resources; namespaces, permissions, seccomp, VM boundaries, and host hardening address other risks.
3. **Why can a child with `memory.low` still experience pressure?** Protection is best-effort and depends on available parent/ancestor protection and competing usage.
4. **What should happen if a job hits `memory.max`?** The service should monitor and surface the kernel’s resulting pressure/termination behavior, classify the failure, and allow safe retry only when the job side effects permit it.

## Review status

The cgroup v2 controller descriptions and overcommit/protection caveats are checked against the Linux kernel’s cgroup v2 and namespace documentation. Exact controller availability and effects depend on the running kernel, device, and host manager as stated above.
