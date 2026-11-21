# Docker images Dockerfiles compose networks volumes and security — Big-picture orientation and mental model

Sources: [Docker Engine 29 release notes](https://docs.docker.com/engine/release-notes/29/), [Dockerfile reference](https://docs.docker.com/reference/dockerfile/), [Docker build best practices](https://docs.docker.com/build/building/best-practices/), [Compose Specification](https://docs.docker.com/reference/compose-file/), [Docker Compose jobs](https://docs.docker.com/reference/compose-file/jobs/), and [Docker Compose releases](https://github.com/docker/compose/releases).

## Problem and purpose

Containers package an application process with a filesystem, configuration, and runtime constraints so it can be built, moved, and started consistently. Docker tooling covers separate phases: build an image, distribute it through a registry, create/run containers, connect and persist data, and operate multi-container projects with Compose. Understanding the boundaries helps avoid treating “it builds” or “container is running” as proof that the service is secure or healthy.

## Plain-language mental model

An image is an immutable-ish template made from filesystem layers plus metadata. A tag is a movable name; a digest identifies specific content. A container is a runtime instance: its writable layer, process, environment, network namespace, mounts, resource limits, and security settings are distinct from its image. The Docker client talks to an Engine daemon; a builder may be BuildKit locally or remotely. Compose interprets a YAML application model and asks the platform to reconcile service containers and dependencies.

Think of build and runtime as separate worlds. A build argument is visible to build steps and can leak into history/cache; a BuildKit secret mount limits exposure to the build step but cannot stop that command from printing or copying the secret. A runtime volume is not an image layer. A published host port is not the same as a container port. A Compose dependency condition is not a durable orchestration controller.

## How the parts fit together

| Phase | Main object | Important identity/boundary |
|---|---|---|
| Build | Dockerfile, context, builder | Context files and build inputs can affect cache and secrets |
| Package | Image config, layers, manifest/index | Tag can move; digest pins content and platform selection |
| Distribute | Registry, pull, attestations | Authentication, trust and provenance are separate checks |
| Run | Container process, namespaces, mounts | Container is an isolated process, not a VM by default |
| Connect | Network, DNS, port mapping | Service discovery and host publishing are distinct paths |
| Persist | Named volume, bind mount, tmpfs | Lifetime, ownership, backup and host coupling differ |
| Operate | Compose project and CLI | Local Compose capabilities differ from deploy platforms |

## Concept map

```text
source + context -> Dockerfile/build graph -> image manifest/digest -> registry
                                                          |
                    Compose model -> Engine -> container process + mounts + network
                                             -> health, logs, metrics, updates
```

An image digest identifies the packaged artifact; a container ID identifies one runtime instance. Compose supplies runtime intent, while Engine state shows what was actually created. Persisted data, host ports, secret sources and daemon socket access cross boundaries and deserve separate review.

## End-to-end walkthrough

For a .NET API and database, keep source in a small build context with `.dockerignore`; use a multi-stage Dockerfile to compile in an SDK stage and copy only published output into a runtime base. Use exec-form `ENTRYPOINT` or `CMD` so the app receives termination signals. Build for the target platform and label/tag the artifact, ideally recording its digest and provenance/SBOM. Push to a registry using short-lived credentials. In Compose, define an API service, database service, user-defined network, persistent database volume, health check, and dependency condition. Keep database credentials out of the image and source-controlled YAML. An optional Compose job can run a one-shot migration or backup; scheduled jobs currently require Engine 29.10+, Compose 5.8+, and an explicitly enabled experimental daemon extension. At deploy time, verify the resolved Compose configuration, image digest, network reachability, health endpoint, persistent data, logs, and resource limits.

## When to use it and tradeoffs

Use Docker images for repeatable packaging and containers for process isolation, test environments, and deployments. Containers share the host kernel; they are not automatically equivalent to a VM security boundary. Multi-stage builds and small bases reduce runtime contents but can make debugging harder. Digest pinning increases reproducibility but requires an update process. Bind mounts are convenient for development and host integration; named volumes are usually better for engine-managed persistent data. Compose is useful for local/single-host applications. Its experimental scheduled jobs are daemon-managed on one Engine, not a multi-host scheduler or a substitute for a production orchestration platform.

## What later lessons cover

The reference lessons explain image identity and runtime, every Dockerfile instruction and current modifier in the supplied inventory, storage/network runtime controls, the Compose project and command model, the full set of Compose service keys, lifecycle/dependency/watch features, and container security/supply-chain controls. Practice and interview lessons apply these mechanisms to failures, upgrades, and safe production decisions.

