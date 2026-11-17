# end-to-end system design case studies — Reference: Firecracker microVM

Sources: [HLD Handbook](https://hld.handbook.academy/), [Firecracker design](https://github.com/firecracker-microvm/firecracker/blob/main/docs/design.md), [Firecracker production host setup](https://github.com/firecracker-microvm/firecracker/blob/main/docs/prod-host-setup.md), [Firecracker jailer](https://github.com/firecracker-microvm/firecracker/blob/main/docs/jailer.md), [Firecracker seccomp](https://github.com/firecracker-microvm/firecracker/blob/main/docs/seccomp.md).

## Scope and version

This lesson describes Firecracker as a lightweight virtual-machine monitor for running microVMs, often for multi-tenant or short-lived workloads. Firecracker’s design and production recommendations evolve; verify the current documentation for kernel, VMM, host, jailer, device, and configuration requirements. A microVM is an isolation component, not a complete security architecture.

## How this group fits the mental model

Containers share the host kernel; a VM runs a guest kernel behind a virtual-machine boundary. Firecracker uses KVM and a deliberately small virtual device model to reduce the VMM’s exposed surface and enable fast lifecycle operations. Host-side isolation still matters: a guest controls input to the VMM, and a VMM/kernel vulnerability could cross boundaries. Firecracker documentation recommends running with the jailer and applying host hardening such as namespaces/cgroups and seccomp, plus regular patching.

For untrusted workloads, use multiple layers: minimal guest image, least-privilege guest, VMM/jailer isolation, CPU/memory/disk limits, restricted networking, host patching, and monitoring. Avoid exposing the Firecracker API socket or host paths to tenant code. The control plane that creates VMs and injects credentials is part of the trusted computing base.

## Supplied names explained

- **MicroVM:** virtual machine configured for a small device model and fast provisioning, still with a guest kernel and VM boundary.
- **KVM:** Linux kernel virtualization facility used for hardware-assisted virtualization; host kernel and hardware support are dependencies.
- **Jailer:** Firecracker companion process for production setup that establishes isolation/resource context and drops privileges according to its configuration.
- **Seccomp filters:** constrain system calls available to the VMM process; a filter that is too permissive increases attack surface, while an incorrect filter may break operation.
- **cgroups/namespaces/chroot:** host controls that can limit resources and process/filesystem visibility; configure and verify them as part of the sandbox, not as substitutes for virtualization.
- **Guest kernel/image:** software running inside the microVM; guest patching and image provenance remain the workload owner’s responsibility.
- **Control plane/API socket:** privileged interface to configure/start/stop a microVM; restrict to a trusted manager and protect its credentials and filesystem permissions.

## Cross-item comparison

| Isolation option | Boundary | Trade-offs |
| --- | --- | --- |
| Process/container | OS process and namespace controls, shared host kernel | Lower overhead and fast startup; kernel is shared and configuration mistakes can expose host resources |
| MicroVM (Firecracker) | Guest kernel and virtual devices behind VMM/KVM | Stronger separation model for many workloads with added VM/host complexity; not invulnerable, still depends on host kernel, KVM, VMM, config, and operations |
| Full general-purpose VM | Hypervisor-managed guest OS/device environment | Broad compatibility and established tooling; typically larger device/model/resource footprint than a specialized microVM setup |

These comparisons are architectural tendencies, not universal performance or security rankings. Benchmark the actual workload and threat model.

## Examples

A build service executes customer-provided code. It creates a fresh microVM with a pinned guest image, constrained vCPU/memory/disk, no host filesystem mounts, minimal network egress, and a per-job identity. The controller starts Firecracker through the jailer with seccomp enabled and a protected API socket, streams input/artifacts through explicit channels, then destroys the VM and scratch disks. Customer code cannot access the host’s cloud credentials because those credentials remain in the control plane and are never mounted into the guest.

Before production, test guest escape assumptions, malformed device/API input, VM startup/termination failure, resource-exhaustion attempts, network policy, noisy-neighbor limits, image rollback, host reboot, and cleanup of disk snapshots. Monitor host kernel/VMM versions, seccomp/jailer errors, VM lifecycle latency, per-tenant resource use, unexpected egress, and orphaned VMs. A successful microVM boot does not prove isolation or patch compliance.

## Common mistakes

- Calling Firecracker “secure by default” or “unbreakable” without its production hardening and patching requirements.
- Running it with broad host privileges or exposing its API socket to untrusted processes.
- Forgetting that a VMM processes guest-controlled inputs and that the host kernel/KVM are in the trust boundary.
- Assuming a guest’s isolation means its network egress, credentials, or resource consumption are safe.
- Sharing writable host paths, secrets, disks, or snapshots across tenants without explicit isolation.
- Failing to apply CPU/memory/disk/PID/network controls and monitor noisy-neighbor exhaustion.
- Treating containers inside a microVM or namespaces alone as proof that configuration is correct.
- Leaving scratch disks or VM state after termination, exposing one tenant’s data to another.
- Basing capacity claims on launch-rate anecdotes without measuring the target host, guest image, and workload.

## Knowledge checks with answers

1. **What does a microVM boundary add compared with a container?** It includes a guest kernel behind a VM/VMM boundary instead of sharing only the host kernel, with added host/hypervisor dependencies and overhead.
2. **Does the VM alone secure cloud credentials?** No. Keep credentials in a restricted control plane or inject narrowly scoped short-lived credentials only when necessary; restrict metadata/network access.
3. **Why use the jailer and seccomp?** They add host process isolation and syscall restrictions around a VMM that processes guest-controlled input; they complement patching and resource/network controls.
4. **What if a VM fails to terminate cleanly?** Quarantine the host/resources, revoke identities, verify disk/snapshot cleanup, and avoid reusing state until isolation is restored.

## Review status

Firecracker’s design and host/jailer/seccomp recommendations are checked against its official repository docs. This lesson remains pending full claim-by-claim audit and manifest omission check.
