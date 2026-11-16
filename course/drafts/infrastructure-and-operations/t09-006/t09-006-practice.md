# Docker images Dockerfiles compose networks volumes and security — Exercises and worked solutions

Sources: [Dockerfile reference](https://docs.docker.com/reference/dockerfile/), [Build secrets](https://docs.docker.com/build/building/secrets/), [Docker volumes](https://docs.docker.com/engine/storage/volumes/), [Compose startup order](https://docs.docker.com/compose/how-tos/startup-order/), [Compose service reference](https://docs.docker.com/reference/compose-file/services/), [Docker Scout SBOMs](https://docs.docker.com/guides/docker-scout/sbom/), and [Docker Engine release notes](https://docs.docker.com/engine/release-notes/).

## Goals

Apply image/build/runtime distinctions to packaging, data persistence, health/readiness, Compose behavior, and supply-chain decisions. Run exercises in a disposable project and local Engine; never mount sensitive host paths or publish test services to untrusted networks.

## Worked example

Given a container that works on localhost but not from another container, first inspect both containers' networks and listeners. If the application listens on `127.0.0.1` inside its own namespace, connecting a second container to the same bridge does not help; reconfigure the application to bind to its container interface and use service DNS plus the container port. Host port mapping is unnecessary for service-to-service communication.

## Exercises

### Exercise 1: Design a multi-stage image without leaking source or credentials

An API builds with an SDK and runs with a runtime. Write a small Dockerfile plan that produces a runtime-only image, excludes local secrets/build outputs, and passes a package-feed credential to one restore step without embedding it in the resulting layers. Explain how you would test the final image.

### Exercise 2: A deleted secret is still visible

An engineer puts `TOKEN` in `ARG`, writes a config during one build step, and removes it in a later step. The value appears in `docker history`. Explain why removal failed, what must be rotated, and a safer BuildKit pattern.

### Exercise 3: Container stops slowly and ignores termination

`docker stop` waits and then kills the container. The Dockerfile uses shell-form `ENTRYPOINT dotnet App.dll`. Explain the likely PID/signal problem and propose verification and repair.

### Exercise 4: API cannot reach database in Compose

The database has `ports: ["15432:5432"]`. API code tries `localhost:15432`, while both services are on the default project network. Correct the host/port, then explain what the database health condition does and does not guarantee.

### Exercise 5: Data vanished after recreation

The database container was removed and recreated. Its files had been written to `/var/lib/db` but there was no Compose `volumes` entry. Explain which storage was used and show how you would preserve future data and verify backups before migration.

### Exercise 6: Compose file review before `up`

A downloaded Compose file contains `privileged: true`, mounts `/var/run/docker.sock`, publishes an admin port on all interfaces, uses `build: .`, and prints `docker compose config` in public CI logs. Identify the boundaries and provide a safer review procedure.

### Exercise 7: A health check reports unhealthy

The app responds correctly to requests, but a healthcheck invokes `curl` that is not installed in a minimal image. It keeps reporting unhealthy, yet the container does not restart. Diagnose and redesign the probe/policy.

### Exercise 8: Promote a verifiable multi-platform release

Your team publishes amd64 and arm64 images. Consumers deploy a mutable tag. Design a release pipeline that builds both targets, records the exact artifact identity, emits SBOM/provenance, evaluates vulnerabilities, verifies a signature, and avoids relying on Docker Content Trust/Notary v1.

### Exercise 9: Compose startup hook and migration race

Two Compose projects may start against the same database. Each API service has a `pre_start` hook that applies schema migrations. Explain the race risk and choose a safer migration design.

### Exercise 10: CPU/memory pressure in a service

The host appears idle, but one container is throttled and another is OOM-killed. Explain the distinction between host metrics and cgroup limits, and list evidence to inspect before changing limits.

## Progressive hints

1. Keep SDK and runtime in separate stages; treat context filtering and secret mounts as different controls.
2. Image layers are additive; removing a file later does not erase earlier layer content.
3. Use exec form and observe whether the actual app receives the configured stop signal.
4. Container-to-container calls use service DNS and container ports, not `localhost` or host-published ports.
5. Container writable layers are disposable; attach a named volume before writing durable state.
6. A Compose file is executable/host-access configuration; inspect mounts, build steps, ports, privileges, secrets, and engine access before running.
7. A probe must exist in the image and measure useful readiness; unhealthy state is separate from restart policy.
8. An index digest and a platform manifest digest identify different objects; bind attestations to the intended subject.
9. Startup ordering does not provide a distributed migration lock or exactly-once behavior.
10. Inspect cgroup throttling, memory events, and limits, not only host-wide utilization.

## Complete solutions

### Solution 1

Use an SDK stage for restore/build/publish and a runtime stage with only runtime dependencies. Place `bin/`, `obj/`, `.git/`, local settings, and credential files in `.dockerignore`; verify the effective build context does not contain the credential. Pass the feed token with Buildx `--secret id=feed,env=FEED_TOKEN` and a Dockerfile `RUN --mount=type=secret,id=feed` step. Ensure package tooling reads it without echoing, and that it is not copied into output/cache artifacts. Run the final image as a non-root user, inspect image layers/metadata, execute a smoke test, then scan/record its digest.

### Solution 2

ARG values and build output may appear in history, metadata, provenance, cache, or logs. A later deletion creates another layer and cannot erase the earlier bytes. Revoke/rotate the token immediately, audit pushed tags/caches/logs, and rebuild cleanly after removing it from history. Use a scoped secret mount only for the restore step and restrict network/repository permissions. Test by inspecting history and exported artifacts, recognizing that output inspection alone is not a guarantee against a compromised build command.

### Solution 3

Shell form inserts `/bin/sh -c`, often placing the shell at PID 1 and the app as a child. Signal handling may not forward TERM correctly, so Docker's grace period expires. Change to exec form, e.g. `ENTRYPOINT ["dotnet", "App.dll"]`, or use a deliberate tini/init wrapper when child reaping is needed. Verify with `docker top`, send TERM in a test, observe graceful logs/exit code, and set a realistic stop timeout. Do not simply enlarge timeout if the app never handles the signal.

### Solution 4

Inside the Compose network use `db:5432`; `localhost` is the API container itself. Host mapping `15432:5432` is for host clients and is not needed by API. A `service_healthy` dependency waits until the configured healthcheck succeeds at startup, but it does not guarantee continued availability, successful authentication, the API's full query, or that later network failures are recovered. Keep app retry/backoff and independent health monitoring.

### Solution 5

Without a volume, writes went to the container writable layer, which is removed with the container. Declare a named volume mounted at the database's actual data directory; verify path and ownership, then use the database's supported consistent backup process. Before changing production data, test restore into an isolated instance and document retention/encryption/access. Do not test with `docker compose down -v` on valuable data.

### Solution 6

Review the YAML and all included/merged files; resolve it with `docker compose config` in a controlled environment without publishing output. `privileged` broadly reduces isolation; the Docker socket grants engine control; the host-wide admin port exposes a sensitive interface; `build: .` executes Dockerfile/build scripts and sends context; config interpolation can disclose environment secrets. Remove unjustified privileges/socket mount, restrict or remove the admin port, review Dockerfile/context/dependencies, pin trusted images, use scoped secrets, and run in a disposable least-privilege environment. Establish provenance and runtime policy before deployment.

### Solution 7

The probe depends on a binary absent from the image; install a suitable probe tool or use an application-native health command/endpoint, ensure bounded timeout and correct startup interval, and avoid a probe that adds meaningful load. Confirm `docker inspect` health log and exit code. Engine restart policy reacts to process exit, not unhealthy alone, so any automated remediation must be explicit (or handled by a higher-level orchestrator). Separate liveness/restart from readiness/traffic routing to avoid restart loops.

### Solution 8

Use Buildx with explicit `--platform linux/amd64,linux/arm64`, a builder that supports multi-platform output, immutable base references, and registry push. Attach `--provenance` and `--sbom`, then inspect the resulting index/digest and platform descriptors. Scan the exact digest, verify a supported signature/attestation under an independently managed signer policy (for example a current Sigstore/Cosign or Notation workflow), then promote the same digest. Do not infer that a mutable tag remains unchanged. Migrate DCT/Notary v1 workflows before the documented 2026-12-08 shutdown.

### Solution 9

Both projects can run migrations concurrently; Compose's `pre_start` ordering is local project lifecycle, not distributed mutual exclusion. Run migrations as a separately controlled deployment step or use transactional, idempotent, database-locked migrations with backward-compatible expand/contract changes. Make application startup tolerate schema rollout order. Verify hook support on installed Compose and do not rely on a hook to execute exactly once.

### Solution 10

The container may be constrained by its own CPU quota or memory cgroup even if host has spare capacity. Inspect `docker stats`, `docker inspect` limits, cgroup CPU throttling and memory/OOM events, restart count, workload peak, and application latency/logs. Compare configured limits/reservations with real demand and concurrency. Change one limit in a staged test; increasing memory without a capacity plan can move the OOM to the host, and removing CPU quota can harm neighbors.

## Tests and edge cases

Verify paths containing spaces and secret-looking file names stay out of context; test non-root write permissions; confirm an image pulled by digest selects both intended architectures; test TERM and timeout behavior; confirm healthcheck command exists; check service DNS from inside its network; test host-only port binding; remove/recreate a test container and confirm named-volume data remains; inspect `down` behavior with and without volume removal; check old Compose rejects recent fields cleanly; and run a restore test rather than only checking backup file existence.

## Reflection questions

- Which boundary failed in each exercise: build, registry, runtime, network, storage, orchestration, or trust?
- Which evidence proves the exact artifact and platform that actually ran?
- What behavior remains unsafe even after running as non-root?
- Where can secrets be exposed despite use of a secret mount?
- How would you roll back a service image without restoring incompatible database state?

