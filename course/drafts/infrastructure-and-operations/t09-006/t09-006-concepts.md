# Docker images Dockerfiles compose networks volumes and security — Core concepts and how they fit together

Sources: [Dockerfile reference](https://docs.docker.com/reference/dockerfile/), [Build secrets](https://docs.docker.com/build/building/secrets/), [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/), [Docker Engine run reference](https://docs.docker.com/engine/containers/run/), [Compose service reference](https://docs.docker.com/reference/compose-file/services/), and [Docker rootless mode](https://docs.docker.com/engine/security/rootless/).

## Learning objectives

Explain the image/container distinction, trace build inputs and cache, choose safe image/runtime boundaries, reason about network and storage lifetimes, interpret Compose dependencies and readiness, and verify security and supply-chain evidence without confusing local Compose with a cluster orchestrator.

## Prerequisites

Know basic command-line usage, files and processes, YAML mapping/list syntax, environment variables, HTTP ports, and the idea of a build artifact. Docker Engine/Compose installations vary by operating system. Examples assume current Docker CLI with BuildKit and Compose plugin; check each version independently.

## Core concepts

### Image versus container

An image consists of ordered filesystem layers and configuration such as default user, environment, entrypoint, command, exposed ports, health check, labels, and volumes. A container adds runtime configuration and a writable layer. Deleting a container normally removes its writable layer but not a named volume; deleting a tag does not necessarily delete shared layers. Tags can be retargeted, whereas a digest is a content-addressed identifier. Multi-platform references can resolve through an OCI index to a platform-specific manifest.

### Build context, instruction graph, and cache

The build context is the set of files the builder is permitted to read; `.dockerignore` removes irrelevant or sensitive files before transfer. Dockerfile instructions produce a dependency graph of build steps, and cache reuse depends on instruction inputs and builder behavior. Put stable dependency installation before frequently changed application source when that improves reuse, but do not optimize by hiding stale dependencies. Multi-stage builds let a final stage copy artifacts from named earlier stages without shipping compilers. BuildKit mounts can provide ephemeral input/cache/secrets without committing the mount contents into the layer, subject to correct use.

### Runtime isolation and persistence

The container process uses namespaces and cgroups, but shares the host kernel. CPU/memory/PID limits constrain resource use; a published host port maps a host address/port to a container port. User-defined bridge networks provide DNS-based service discovery between attached containers. A named volume is managed by the engine, a bind mount exposes a host path, and tmpfs is ephemeral memory-backed storage. Choose by lifecycle, backup, permissions, and coupling to the host.

### Compose is a declarative project description

Compose YAML describes services plus shared networks, volumes, configs, secrets, and other top-level objects. `docker compose config` resolves merges/interpolation; inspect its output because environment and file inputs can reveal secrets. `depends_on` can order creation and wait on declared health/completion conditions, but does not create durable recovery or prove end-to-end readiness. Compose Specification fields have implementation and version requirements; optional `deploy` keys may be ignored by a local platform.

As of Compose 5.8, a top-level `jobs` map can describe manual or scheduled one-shot work. Scheduling requires Docker Engine 29.10+ and its experimental jobs extension enabled; the schedule is run by the daemon, so it continues without a Compose client connected. The extension is off by default, and its gRPC API is served on daemon listener addresses; Docker authorization plugins apply to the HTTP API and do not authorize this jobs API. For scheduled runs the Engine does not start or wait for `depends_on` services, so dependencies must already be available. Treat this feature as experimental, protect daemon access, and use a production scheduler when its maturity, observability, or multi-host guarantees are required.

### Security and artifact confidence

Run as a non-root user where practical; minimize capabilities, use read-only filesystems and restricted mounts, avoid privileged mode, and keep the Docker socket away from untrusted containers. Rootless Docker and user-namespace remapping reduce some host privilege exposure but do not eliminate all kernel/runtime risks. Scan known vulnerabilities, inspect an SBOM, verify signatures/attestations under a trust policy, and update bases. A scan or signature is evidence with scope and time; neither proves software is safe.

## Mechanisms and relationships

1. `FROM` selects the base for a stage; `ARG` before the first `FROM` can parameterize it, while stage-scoped args must be redeclared as needed.
2. `RUN` changes build filesystem state; `CMD` and `ENTRYPOINT` configure runtime behavior. Exec form avoids an implicit shell and improves PID 1 signal delivery.
3. `COPY` is explicit context/stage transfer. `ADD` has extra URL/Git/archive behavior; choose it only when those semantics are intended.
4. `ENV` persists runtime image configuration; build args are build inputs; secret mounts are temporary build access. None is a magic guarantee against a malicious/verbose build command.
5. Image layers are shared read-only; a container writable layer is disposable; explicit volumes persist independently.
6. Container port describes the listener inside the namespace. `ports` publishes host access; `expose` is documentation/network metadata and does not publish a host port.
7. A Compose health check can mark a container unhealthy. The engine does not automatically restart solely because health is unhealthy; a supervisor/policy must react.

## Worked examples

**Image unexpectedly contains credentials:** inspect Dockerfile history, build args, layers, build context, and cache/export paths. Removing a secret in a later layer does not erase it from earlier layers; rebuild from a clean history and rotate the exposed credential.

**API cannot resolve `db`:** check whether both containers share the same user-defined network, inspect Compose's resolved project/network names, and use service DNS from inside the API container. Host `localhost` points to the container itself; service-to-service traffic uses the database's container port, not the host-published port.

**Database data vanished after recreation:** determine whether data was in the writable layer, anonymous/named volume, or bind mount; inspect `docker inspect` and Compose volume declarations. `docker compose down -v` removes named and anonymous volumes associated with the project and can destroy data.

## Misconceptions and edge cases

- An image tag such as `latest` is not immutable; the local cached image can differ from a later pull.
- `EXPOSE` does not publish a port and `depends_on` alone does not wait for readiness.
- A health check is not a process restart policy; inspect both health state and restart conditions.
- A container `USER` setting does not constrain a privileged daemon API socket bind mount.
- `ARG` values can be recorded in build metadata/history/cache; do not put secrets there.
- `docker compose config` can print resolved secret values from environment interpolation; handle output as sensitive.
- Compose `deploy` support is optional in the specification and platform-dependent.
- “Read-only rootfs” still allows writes to mounted volumes or tmpfs and does not itself drop capabilities.
- An SBOM lists observed components; completeness depends on generation method and artifact coverage.

## Knowledge checks with answers

1. What survives container deletion by design? **Image layers/tags and separately managed volumes may survive; the writable container layer does not.**
2. Does a digest pin both manifest and platform? **A digest can refer to an index or a platform-specific manifest; inspect which object and selected platform it identifies.**
3. Why does Compose API → DB use `db:5432`, not the published host port? **Containers on the same project network use service DNS and the container port.**
4. Why is a later `RUN rm secret` inadequate? **The prior layer still contains the secret.**
5. What distinguishes readiness from startup ordering? **A health/readiness contract checks service state; creation order alone does not.**

