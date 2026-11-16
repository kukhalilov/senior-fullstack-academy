# Docker images Dockerfiles compose networks volumes and security — Reference: Least privilege, supply-chain confidence, and runtime attack-surface controls

Sources: [Docker rootless mode](https://docs.docker.com/engine/security/rootless/), [user namespace remapping](https://docs.docker.com/engine/security/userns-remap/), [seccomp profiles](https://docs.docker.com/engine/security/seccomp/), [AppArmor profiles](https://docs.docker.com/engine/security/apparmor/), [Docker daemon access protection](https://docs.docker.com/engine/security/protect-access/), [Docker run reference](https://docs.docker.com/reference/cli/docker/container/run), [Docker Scout](https://docs.docker.com/scout/), [Scout SBOMs](https://docs.docker.com/guides/docker-scout/sbom/), [Docker Content Trust retirement](https://docs.docker.com/retired/), and [Docker content trust](https://docs.docker.com/engine/security/trust/).

## Scope and version

This reference covers Engine containers and image supply-chain practices, not Kubernetes policy or cloud-registry IAM. Docker Content Trust (DCT)/Notary v1 is being retired; Docker documents Notary v1 shutdown for 2026-12-08, so treat DCT as legacy terminology and do not build a new long-lived trust process around it. Rootless/userns, Linux security modules, device drivers, and attestations require compatible hosts and toolchains.

## How this group fits the mental model

Container security is layered: reduce daemon privileges, constrain the process identity/capabilities, limit syscall/device/filesystem/network access, cap resource consumption, minimize image contents, and verify what was built and published. Each control narrows a different attack path. A container shares the host kernel, and daemon API access can bypass many in-container restrictions. No single “secure image” badge proves runtime isolation or absence of exploitable code.

## Supplied names explained

### Identity, privilege, and runtime boundaries

- **Non-root container user** — Configure an unprivileged UID/GID using Dockerfile `USER` or runtime override; make required files readable/writable to that identity and avoid assuming names map identically across hosts.
- **Root inside container** — UID 0 in the container namespace; namespace mapping may reduce host identity, but root can still exploit granted capabilities, devices, mounts or kernel vulnerabilities.
- **User namespace remapping** — Maps container UIDs/GIDs to unprivileged host IDs, limiting host ownership equivalence. Existing bind mounts need compatible ownership and it can complicate shared storage.
- **Rootless Docker** — Runs both daemon and containers as an unprivileged user when prerequisites are met. It mitigates some daemon/runtime vulnerability impact but changes networking, storage, cgroup and port capabilities.
- **Linux capability** — Fine-grained privilege units splitting traditional root powers; defaults are not zero and required capabilities depend on the application.
- **Drop Linux capabilities** — Remove unneeded capability set (e.g. `--cap-drop=ALL`) and add only verified requirements. Test startup and operations; adding a broad capability can reintroduce dangerous power.
- **Linux capability names CAP_CHOWN CAP_DAC_OVERRIDE CAP_NET_BIND_SERVICE CAP_NET_RAW CAP_SYS_ADMIN** — `CAP_CHOWN` changes ownership; `CAP_DAC_OVERRIDE` bypasses ordinary discretionary access checks; `CAP_NET_BIND_SERVICE` binds privileged ports; `CAP_NET_RAW` enables raw/packet sockets; `CAP_SYS_ADMIN` covers a very broad set of administration operations and is especially risky.
- **Privileged container** — Broadly grants capabilities/device access and relaxes confinement. It can approach host-level control; avoid as routine compatibility fix.
- **Docker Engine socket authorization boundary** — Access to `/var/run/docker.sock` or a remote daemon API lets a client create containers/mount host paths or alter workloads. Treat it like root-equivalent administration unless a strong authorization proxy constrains calls.
- **Docker socket access** — Mounting the socket inside a container gives code in that container control of the Engine; a read-only bind mount does not make API calls read-only.
- **Host bind-mount privilege boundary** — A container bind mount exposes host files according to path and permissions. Writable mounts let container processes modify host data; read-only is narrower but may still expose secrets.
- **Read-only root filesystem** — Runtime setting such as `--read-only` prevents writes to container root layer; explicitly mount writable state, tmpfs, and runtime paths needed by the app.
- **No-new-privileges flag** — Prevents process from gaining new privilege through exec/setuid mechanisms; does not remove privilege already held or replace capability/seccomp policy.
- **Seccomp profile** — Filters system calls; Docker's default profile is an allowlist and usually safer than unconfined. Customize only with syscall evidence and maintain compatibility tests.
- **AppArmor profile** — Linux LSM profile constraining process filesystem/capability access on AppArmor hosts; behavior depends on loaded policy and distro.
- **SELinux container label** — SELinux label/type/level applied to container processes/files. Bind mounts may need `:z` shared or `:Z` private relabeling; relabeling broad host paths can damage host policy.
- **Container resource exhaustion** — CPU/memory/PID/I/O abuse can degrade host and neighbors. Apply realistic limits, monitor cgroup throttling/OOM, and ensure logging/storage do not fill the host.
- **docker run --user** — Selects runtime UID/GID; pair with image file ownership and supplementary groups.
- **docker run --userns** — Selects user-namespace mode where supported; coordinate daemon remap and mounted-file ownership.
- **docker run --cap-add** — Grants a named capability; use exact least-required capability and document why.
- **docker run --cap-drop** — Removes capabilities; often start with dropping ALL then add back specific required capabilities after testing.
- **docker run --security-opt** — Controls seccomp/AppArmor/SELinux/no-new-privileges and other security settings; disabling confinement is a risk, not a generic fix.
- **docker run --read-only** — Enables read-only container rootfs; writable mounts remain writable.
- **docker run --pids-limit** — Caps tasks/processes to constrain fork bombs; set above realistic thread/process needs.
- **docker run --memory** — Applies a cgroup memory ceiling; OOM can terminate workloads, so combine with observability and recovery design.
- **docker run --cpus** — Applies CPU bandwidth limit; it can cause throttling and latency under load.
- **docker run --mount** — Declares bind/volume/tmpfs mounts. Treat source path selection as a security decision.
- **docker run --network** — Selects network attachment/mode; host networking weakens namespace isolation and broad reachability may expose services.
- **docker run --no-new-privileges** — Runtime shorthand for preventing privilege gain via exec; confirm `docker run --security-opt no-new-privileges` behavior on the target.
- **docker run --init** — Inserts a small init process to forward signals/reap children; it does not fix application lifecycle bugs.
- **docker run --pull** — Controls image pulling; use digest-pinned references where exact artifact identity is required.

### Image integrity, vulnerabilities, and trust

- **Image vulnerability scanning** — Matches observed OS/app packages against an advisory database. Results depend on scanner freshness, package recognition, distro backports, exploitability and artifact digest.
- **Base image provenance** — Evidence of base image source/build. Check publisher identity and attestations; official-name appearance alone is not proof.
- **Digest-pinned base image** — Pins a manifest/index digest to prevent tag retargeting. Pinning requires planned updates to receive security fixes.
- **Image tag mutability** — Tags are human-readable pointers that can be repointed. Verify resolved digest and promote immutable release IDs where possible.
- **Image update policy** — Balance reproducibility and patch currency: monitor new bases, rebuild/test, scan, sign/attest, and deploy the reviewed digest. Never treat `latest` as a patch-management plan.
- **Docker Scout** — Docker image analysis/policy product that consumes image packages and attestations to identify vulnerabilities, recommendations and posture; it is not a runtime firewall.
- **Docker Scout policy evaluation** — Evaluates configured policies such as vulnerabilities, default non-root user, and SBOM/provenance presence. “No data” or missing evidence is not a pass.
- **Container SBOM** — Software bill of materials listing detected components/licenses/versions. Completeness depends on generator, package formats, image contents, and whether build/runtime artifacts are included.
- **Image SBOM generation and inspection** — BuildKit can attach SBOM attestations; `docker scout sbom` can display/generate a bill of materials. Inspect subject digest and format; avoid publishing sensitive build details unintentionally.
- **Image signature verification** — Verify signature against an independently managed identity/key/trust policy and bind verification to the exact digest. A valid signature proves an authorized signer signed data, not that the image is harmless.
- **Docker Content Trust (legacy naming)** — DCT refers to Docker's legacy Notary v1 tag-signing integration. Notary v1 service retirement is scheduled for 2026-12-08; this term remains useful to identify old `DOCKER_CONTENT_TRUST` and `docker trust` workflows.
- **Content trust and signature terminology distinction** — “Trust” is a policy decision about signer identity, artifact digest, and verification rules; signatures/attestations are evidence objects. Current options include Sigstore/Cosign or Notation workflows, but keyless/key-managed identity and verification policy must be designed explicitly.
- **Docker Content Trust retirement** — DCT/Notary v1 is being fully retired with brownouts and shutdown; migrate old workflows before service shutdown and verify the new signature format/toolchain end to end.
- **Minimal base image tradeoff** — Smaller images reduce packages/attack surface and transfer size, but may omit shells/diagnostic tools, certificates/locales or compatibility libraries. Choose a maintainable base and keep debug tooling outside production image when possible.

### Build secret and supply-chain boundaries

- **Build secret exposure** — Secret is accessible to the build instruction; malicious dependency scripts or shell tracing can exfiltrate it even when mounted ephemerally.
- **Docker build arg secret leak** — ARG values may appear in image history, provenance, cache metadata, or logs. Use secret mounts and rotate any exposed credentials.
- **Secret mount scope** — A BuildKit secret mount is available only during declared RUN instruction, but it is not a sandbox against that command. Restrict repository/network permissions and prevent logs/artifacts from containing it.
- **Image layer secret persistence** — Removing a credential in a later Dockerfile layer does not erase bytes from earlier layers or exported caches; rebuild cleanly and revoke the secret.
- **Supply-chain attestation** — Signed metadata about build provenance or SBOM. Verify signature, signer identity, subject digest, predicates and builder policy.
- **BuildKit provenance attestation modes** — `--provenance` can emit provenance with different detail/mode levels; inspect sensitive source/material fields and enforce expected builder identity.
- **Docker Scout policy evaluation** — Combine SBOM/provenance and vulnerability information with organization policy; findings require triage and remediation, not automatic trust.

## Cross-item comparison

| Control | Limits | Does not limit |
|---|---|---|
| Non-root user | Process UID/GID authority | Kernel attack surface or daemon socket access |
| User namespace/rootless | Host privilege mapping | All host resources or all kernel vulnerabilities |
| Capabilities/seccomp/LSM | Specific operations/syscalls/policy | Application vulnerabilities within allowed behavior |
| Read-only rootfs | Writes to root layer | Mounted writable paths or network access |
| Digest pin | Artifact bytes | Publisher trust or outdated vulnerabilities |
| Signature | Authorized signer statement | Safety or policy correctness of the signed image |
| SBOM/scanning | Known component/vulnerability visibility | Undetected components, unknown CVEs, exploitability certainty |

## Examples

Build a minimal final stage, set a non-root UID, remove unnecessary capabilities, retain default seccomp/AppArmor/SELinux confinement, use read-only rootfs plus narrow state mounts, and set memory/PID limits. At build time mount credentials as a scoped BuildKit secret, generate provenance/SBOM, push the image, and record the digest. Verify attestations/signatures against a separate trusted identity, scan the digest, and promote that same digest after review. Rotate credentials if they appear in build logs/history.

## Common mistakes

- Treating rootless mode, userns remapping, or a non-root process as complete isolation.
- Mounting the daemon socket or the host root filesystem into an otherwise restricted container.
- Adding `CAP_SYS_ADMIN` or `privileged` to fix an unknown error.
- Treating a signature, SBOM, scanner score, or “official” image label as proof of safety.
- Pinning a vulnerable digest forever without an update/rebuild policy.
- Continuing to rely on DCT/Notary v1 as it approaches retirement.
- Assuming a mounted build secret cannot be copied or printed by the command using it.

## Knowledge checks with answers

1. Is container root always host root? **Not necessarily; namespaces/rootless mapping can change host identity, while capabilities/mounts and daemon control still affect risk.**
2. Does a read-only socket mount make Docker API calls read-only? **No; filesystem mount mode does not constrain API methods.**
3. What does a signature prove? **That a signer identity signed a particular artifact/statement under a key/trust system; safety requires further policy and analysis.**
4. Why pin and update? **Digest pinning gives stable identity; a regular review/rebuild process keeps that identity from becoming stale and vulnerable.**
5. What is the DCT shutdown date in current Docker docs? **2026-12-08 for the Notary v1 service; migrate earlier and verify the replacement.**

