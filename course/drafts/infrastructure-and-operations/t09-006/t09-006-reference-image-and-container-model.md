# Docker images Dockerfiles compose networks volumes and security — Reference: Image identity, layers, registries, container lifecycle, and runtime settings

Sources: [Docker Engine 29 release notes](https://docs.docker.com/engine/release-notes/), [Docker Engine run reference](https://docs.docker.com/engine/containers/run/), [Docker Hub](https://docs.docker.com/docker-hub/), and [Docker Compose releases](https://github.com/docker/compose/releases).

## Scope and version

Checked against Docker Engine 29.10.0 (2026-11-16). Docker Engine, Docker CLI, containerd/image store, BuildKit, Buildx, Dockerfile frontend, and Compose have separate versions and feature gates. Docker 29.10's daemon-managed jobs extension is experimental and opt-in; it is not a default scheduler or a substitute for a production orchestrator.

## How this group fits the mental model

The image is the package identity; a container is an execution instance. The CLI is a client and the daemon is the management API endpoint. Registry authentication, digest identity, platform selection, container lifecycle, and health are separate questions.

## Supplied names explained

### Engine, image, and identity

- **Docker Engine** — Docker's client/server container platform, including daemon and APIs; deployments may use different compatible engines and image stores.
- **Docker daemon** — Long-running `dockerd` service managing images, containers, networks and volumes; control of its socket is highly privileged.
- **Docker CLI** — `docker` client which calls the configured Engine endpoint; `DOCKER_HOST`/context can point somewhere other than the local machine.
- **Docker image** — Read-only layer graph plus config metadata used to create containers.
- **Container image layer** — Reusable filesystem changeset in an image. Shared layers save transfer/storage; a later layer deleting a secret does not erase its earlier layer.
- **Image manifest** — Registry object describing one image's config and layer digests.
- **OCI image manifest** — Open Container Initiative image format for a single platform image.
- **OCI image index** — OCI object mapping platform descriptors to platform-specific manifests; one tag/digest may resolve differently by architecture.
- **Image tag** — Human-readable mutable reference such as `app:1.2`; registry owners can move it to new content.
- **Image digest** — Content-addressed hash reference (commonly `sha256:...`) identifying bytes of a manifest/index; it improves repeatability but does not prove publisher trust.
- **Image ID** — Local Engine identifier for image configuration/content; it is not necessarily the registry manifest digest.
- **Image registry** — Service storing image manifests/blobs and authentication/authorization policy.
- **Docker Hub** — Docker's hosted registry/service with public and private repositories, limits, organizations, and access controls.
- **Private registry** — Registry requiring configured authentication/authorization; a network location being private does not establish artifact integrity.
- **Image pull policy** — Decision about when to retrieve an image. Docker CLI `--pull` and Compose `pull_policy` can differ in syntax/semantics; tag caching affects results.
- **Multi-platform image** — Index of platform variants allowing a client to select a compatible manifest.
- **linux/amd64 image platform** — Linux x86-64 platform descriptor; CPU feature level and runtime compatibility still matter.
- **linux/arm64 image platform** — Linux AArch64 platform descriptor; emulation may allow a build/run on other hosts but can be slower or incompatible.
- **Docker Engine 29.10 experimental jobs extension** — Opt-in experimental daemon extension `org.mobyproject.jobs.v0` for one-shot/cron-style workload management; experimental status and extension enablement are material limitations.
- **Docker Engine job manual and scheduled execution modes** — Engine 29.10 release notes describe native one-shot and cron-scheduled jobs in the experimental extension; Compose 5.7.1 release notes describe only partial manual-trigger job support, so do not conflate both APIs.
- **Docker Engine API OpenAPI specification** — Engine 29.10 moves its API source specification to OpenAPI 3.2; clients pinned to generated older Swagger files need compatibility review.

### Runtime instance and settings

- **Container** — Created runtime instance with namespaces/configuration, writable layer, and process lifecycle. It is not a VM by default.
- **Container writable layer** — Ephemeral per-container filesystem changes above image layers; removed with the container unless state is stored elsewhere.
- **Container process** — Main process plus descendants within the container's namespaces/cgroup; it can spawn more processes and require proper shutdown behavior.
- **PID 1 in container** — Process with PID 1 in that PID namespace; it has special signal/orphan-reaping behavior. Use exec-form entrypoint and consider `--init` for child reaping.
- **Container lifecycle** — Create → start → running → stop/exit → removed; stop sends configured signal and escalates after timeout, while kill sends a signal immediately.
- **Container exit code** — Main process status captured on exit; distinguish it from daemon/API errors and health status.
- **Container restart policy** — Engine policy `no`, `on-failure`, `always`, or `unless-stopped` controlling restart after exits; `on-failure` may limit retries. An unhealthy status alone does not trigger restart.
- **Container name** — Human-readable identifier unique among containers on an Engine at a time; names are not image identity and can be reused after removal.
- **Container environment variable** — Runtime environment passed at creation; it can be visible through inspect/process interfaces and is not a safe secret store against privileged users.
- **Container entrypoint** — Executable/configured program that forms the process command; run arguments combine with or replace defaults according to exec/shell semantics.
- **Container command** — Default command/arguments from image or override at create/run; overriding command does not always replace entrypoint.
- **Container port** — Port where a process listens inside its network namespace.
- **Published host port** — Host address/port mapping to a container port. Binding to a particular host IP narrows exposure; firewall and routing still apply.
- **Container logs** — Output collected by selected logging driver from container stdout/stderr. File logging or application buffering may bypass expectations; rotation/storage must be configured.

### Inspection and operations

- **`docker image inspect`** — Reads image metadata including ID, config, layers, OS/architecture and labels; sensitive values may be present.
- **`docker container inspect`** — Reads runtime configuration/state, mounts, networks, ports, health and process status. Treat output as potentially sensitive.
- **`docker history`** — Shows image-layer history/commands, not a complete source/build audit; secrets in build args may be exposed.
- **`docker stats`** — Live resource snapshot for containers; compare with cgroup limits and host metrics.
- **`docker events`** — Stream of Engine lifecycle events. It is not a durable full audit log; disconnects and retention matter.

## Cross-item comparison

| Reference | Stable identity? | Typical use |
|---|---|---|
| Tag | No | Human-friendly release naming |
| Manifest/index digest | Yes for referenced bytes | Reproducible deploy input |
| Local image ID | Local config identity | Inspect local store |
| Container name/ID | Runtime instance | Operate one created instance |
| Exit code | Process result | Diagnose why main process ended |
| Health status | Probe result | Observe readiness/liveness-like state |

## Examples

Inspect both layers of identity before rollout: `docker image inspect --format '{{index .RepoDigests 0}} {{.Os}}/{{.Architecture}}' IMAGE` (guard against missing RepoDigests), then inspect the created container's actual image ID, selected platform, health and ports. Pulling a mutable tag later can produce different content, while an index digest may still select different platform-specific image manifests.

## Common mistakes

- Assuming a tag is immutable or a digest proves a trusted publisher.
- Treating a container's writable layer as durable application data.
- Assuming a container's PID 1 will reap children and handle SIGTERM correctly.
- Treating `docker stats` as historical monitoring or the whole host's resource view.
- Assuming Docker 29.10 experimental jobs or Compose jobs are stable, interoperable scheduling APIs.

## Knowledge checks with answers

1. If a tag is repointed, what stays the same? **A pinned digest still identifies its referenced manifest/index bytes; the tag name does not.**
2. Can an index digest select platform-dependent bytes? **Yes; the index points to separate platform manifests.**
3. Does an unhealthy status restart a container automatically? **Not by itself under Docker Engine restart policy.**
4. Why is Docker socket access dangerous? **It can grant broad control over the daemon and often host-level privilege through container creation.**

