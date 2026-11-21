# Docker images Dockerfiles compose networks volumes and security — Interview questions and reasoning

Sources: [Dockerfile reference](https://docs.docker.com/reference/dockerfile/), [Docker Engine run reference](https://docs.docker.com/engine/containers/run/), [Compose service reference](https://docs.docker.com/reference/compose-file/services/), [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/), [Docker Scout SBOMs](https://docs.docker.com/guides/docker-scout/sbom/), [Docker Content Trust retirement](https://docs.docker.com/retired/), and [Docker Engine 29 release notes](https://docs.docker.com/engine/release-notes/).

## Core questions

1. What is the difference between an image and a container?
2. Why are tags weaker deployment identities than digests?
3. How does an OCI image index support multi-platform delivery?
4. What belongs in a build context, and how does `.dockerignore` affect it?
5. Explain why a multi-stage Dockerfile can reduce the runtime attack surface.
6. Compare `RUN`, `CMD`, and `ENTRYPOINT`.
7. Why can shell-form `ENTRYPOINT` break graceful shutdown?
8. Can a Docker build argument safely carry a private token?
9. What do BuildKit secret and SSH mounts protect, and what remains possible?
10. Compare image layers, writable container layer, named volume, bind mount, and tmpfs.
11. What is the difference between a container port, `expose`, and published host port?
12. Why does a Compose service call a database by service name and container port?
13. What does `depends_on: condition: service_healthy` guarantee?
14. Does an unhealthy container restart under Engine restart policy?
15. Compare rootless Docker and user-namespace remapping.
16. What can access to the Docker socket permit?
17. What do capabilities, seccomp, AppArmor/SELinux, and read-only rootfs each control?
18. What does a container SBOM tell you, and what does it not tell you?
19. What does a valid image signature prove?
20. What is happening to Docker Content Trust/Notary v1?
21. Which Compose service attributes are platform-dependent, deprecated, or version-gated?
22. How would you build and verify an amd64/arm64 release with attestations?
23. What is the difference between Compose `pre_start`, `post_start`, and `pre_stop` hooks?
24. What changed in Docker Engine 29.10 and Compose 5.8 jobs, and what is experimental or risky?

## Concise interview answers

- An image is a layered filesystem/config template; a container is one configured runtime instance with a writable layer and process.
- Tags are mutable names; a digest pins referenced manifest/index bytes. Verify publisher/signature separately.
- An OCI index maps platform descriptors to platform-specific manifests; inspect the selected platform.
- The context limits build-visible input; `.dockerignore` reduces transfer, cache churn, and accidental secret inclusion.
- Multi-stage builds leave build tools/source out of the final stage unless explicitly copied.
- RUN executes at build time; CMD sets defaults; ENTRYPOINT defines the executable. Exec form generally handles signals better.
- ARG is not secret storage; use one-step secret/SSH mounts but prevent commands from logging/copying secret content.
- A named volume is Engine-managed persistent data; bind mount is host-path coupled; writable layer is per-container; tmpfs is ephemeral.
- `expose` is not host publication. `ports` maps host to container; container peers normally use service DNS plus container port.
- `service_healthy` waits for a configured probe at startup, not perpetual availability or end-to-end readiness.
- Engine restart policy observes process exit; unhealthy state alone does not restart.
- Rootless runs daemon and workloads as unprivileged user; userns remaps container IDs under a privileged daemon. Both have compatibility and residual kernel risk.
- Docker socket access can create privileged containers or mount host paths, making it a high-authority boundary.
- Controls compose; each limits a different path and no single one is full isolation.
- SBOM lists detected components; it does not prove the app is safe or the list complete.
- A signature connects a signer identity to a digest/statement; trust policy decides whether that signer/artifact is acceptable.
- DCT/Notary v1 is retiring, with service shutdown documented for 2026-12-08; migrate and verify a current signing approach.

## Deep follow-up answers

### Tag, digest, and platform selection

A tag can move between pulls. A digest fixes the referenced content-addressed manifest or index, but an index intentionally points to multiple platform manifests. Record both requested digest and platform-specific resolution. A digest is not a trust decision: verify registry, publisher identity/signature and provenance under policy.

### Build cache and secrets

BuildKit's dependency graph determines cache reuse. A cache hit may reuse a previous result; a secret value may not itself invalidate a step cache, so model inputs deliberately. Secret mounts reduce persistence in image layers but the executing command has access and can exfiltrate it. A leaked secret is revoked/rotated, not merely deleted from a later layer.

### Runtime boundaries

Containers package processes while sharing the host kernel. Namespaces/cgroups and capability/syscall controls reduce reach, but a Docker API socket or broad writable host mount can override much of that isolation. `privileged` is not a normal troubleshooting option. Rootless or remapping changes host privilege mapping but does not make hostile workloads harmless.

### Compose semantics

Compose Specification validity does not mean the local Engine implements each optional deploy feature. `depends_on` controls initial orchestration progression; healthchecks evaluate configured probes; `restart` handles process outcomes. `pre_start` init steps can gate start in recent Compose, but concurrent projects still require migration locks/idempotence. `post_start` timing relative to entrypoint is not guaranteed and pre-stop hooks do not run on every failure mode.

Compose 5.8 adds manual and scheduled one-shot jobs. Scheduled jobs need Engine 29.10+ with its experimental jobs extension enabled; the daemon stores run records and evaluates schedules. A schedule uses five-field cron syntax, UTC by default (or an IANA `timezone`), `concurrency: forbid` skips overlapping firings by default, and `missed_fires: one` runs one catch-up after daemon downtime by default. Scheduled execution does not start or wait for job `depends_on` services. The jobs API uses gRPC on daemon listener addresses, and Docker authorization plugins do not authorize it. Keep it experimental and do not expose daemon listeners to untrusted clients.

### Supply-chain evidence

SBOM records observed packages; provenance describes declared build source/process. A scanner compares packages to an advisory feed. A signature authenticates a signer assertion. Review subject digest, builder identity, policy, completeness and time freshness. Docker Scout can evaluate policy and recommend remediation, but it does not replace runtime controls or code review.

## Scenario questions

1. A container is healthy but an external client times out. How do you distinguish app bind, container DNS, port publishing, host firewall and upstream routing?
2. A secret was accidentally passed as `ARG` and pushed. What do you do first, and how do you establish the exposure scope?
3. A database loses data after every deploy. Which image/mount/lifecycle evidence do you inspect, and how do you recover safely?
4. An API's Compose dependency is healthy at start but becomes unavailable later. What should application and deployment behavior be?
5. A least-privilege container fails because it cannot bind a privileged port or write a directory. Which narrow controls might address the actual requirement?
6. A team asks to mount the Docker socket into a CI job. What is the threat model and what alternatives reduce authority?
7. The same image tag runs different code on amd64 and arm64. How do you inspect the index and verify the rollout?
8. A Compose file from a public repository includes `pre_start` migration, `privileged`, and a host bind mount. How do you review and test it?

## Tradeoffs and alternatives

| Choice | Advantage | Cost/alternative |
|---|---|---|
| Mutable release tag | Easy to promote/update | Pin digest in deployment and automate reviewed updates |
| Digest pinning | Reproducible artifact identity | Requires controlled rebuild/redeploy process for patches |
| Rootless daemon | Reduces daemon root privilege | Networking/storage/cgroup compatibility constraints |
| Non-root process | Reduces app UID authority | Needs deliberate file ownership and capability decisions |
| Bind mount | Direct host integration | Host coupling and potential data exposure; prefer named volume for managed persistence |
| Local Compose | Simple development/single host | Use orchestrator/platform for multi-host scheduling and reconciliation |
| Minimal base | Smaller surface | Distroless/debug friction; separate debug tooling and maintain base updates |
| Security scan | Finds known component issues | False positives/unknowns; combine with exploitability and update policy |

## Common weak answers

- “The image is signed, so it is safe.”
- “We removed the password in the next layer.”
- “The container is isolated, so mounting the Docker socket is fine.”
- “Expose 5432 and the database is reachable from the host.”
- “Compose waits for the database because it has depends_on.”
- “The container is unhealthy, so Docker will restart it.”
- “Pinning to a digest means we never need to update it.”
- “Use privileged mode/root to get past the error.”

## Self-check rubric

Score each answer 0–2. **0:** confuses image/runtime, proposes broad privilege, or asserts unsupported guarantees. **1:** names a relevant feature but omits its boundary/version or verification. **2:** identifies build/runtime/network/data/trust boundary, states what evidence proves and does not prove, chooses a least-privilege reversible change, and includes health/update/rollback verification. Strong senior answers distinguish stable features from labs/experimental work and Compose from cluster orchestration.

