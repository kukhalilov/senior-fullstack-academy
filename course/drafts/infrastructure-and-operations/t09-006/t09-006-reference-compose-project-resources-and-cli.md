# Docker images Dockerfiles compose networks volumes and security — Reference: Compose project structure, resources, merge behavior, and operator commands

Sources: [Compose Specification](https://docs.docker.com/reference/compose-file/), [Compose network reference](https://docs.docker.com/reference/compose-file/networks/), [Compose volume reference](https://docs.docker.com/reference/compose-file/volumes/), [Compose configs](https://docs.docker.com/reference/compose-file/configs/), [Compose secrets](https://docs.docker.com/reference/compose-file/secrets/), [Compose Deploy Specification](https://docs.docker.com/reference/compose-file/deploy/), [Docker Compose CLI](https://docs.docker.com/reference/cli/docker/compose/), and [Compose trust model](https://docs.docker.com/compose/trust-model/).

## Scope and version

Docker Compose v5.8.0 is the latest tagged release checked on 2026-11-20. Compose implementations do not necessarily support every optional specification field identically. The top-level `version` key is obsolete and informational; the installed Compose implementation determines supported fields. Validate with `docker compose version` and `docker compose config` while protecting resolved output. Experimental scheduled jobs also require Docker Engine 29.10+ and its opt-in jobs extension.

## How this group fits the mental model

A Compose project is a named collection of services and shared resources. The YAML file is input to a client-side model resolver; commands then ask an Engine/platform to create resources. Project naming scopes default networks and volumes. Merging files, environment interpolation, profiles, and CLI flags can change the effective model. Review the resolved model before operating, especially when the file came from an untrusted source.

## Supplied names explained

### File, project, and top-level model

- Docker Compose — Docker CLI plugin for defining and operating application projects across one or more containers; it is not a cluster scheduler by itself.
- Compose Specification — Cross-implementation model for services, networks, volumes and related application resources. Optional keys may be ignored by an implementation.
- `compose.yaml` — Recommended Compose file name.
- `compose.yml` — Equivalent YAML extension accepted by Compose.
- `docker-compose.yaml legacy filename` — Historical filename still commonly discovered/accepted; prefer the current `compose.yaml` naming in new work.
- Compose top-level version obsolete field — Old schema selector that current Compose treats as obsolete/informational; it does not select an implementation version.
- Compose project name / Top-level name — Project namespace used to prefix generated resources unless explicit names are supplied. CLI/environment precedence can override top-level name.
- Top-level include — Incorporates other Compose projects/files with their own project/resource behavior; understand path and trust boundaries.
- Top-level services — Map of service names to image/build and runtime configuration; service names become DNS names on shared project networks.
- Top-level networks — Declares reusable networks, drivers/options, external networks, and IPAM; services attach by name.
- Top-level volumes — Declares named, engine-managed storage; declaration does not itself mean the data is backed up.
- Top-level configs — Non-sensitive configuration files exposed to services, commonly read-only; behavior/platform support varies.
- Top-level secrets — Sensitive file/environment-backed data exposed only to services explicitly granted access. Local Compose has platform-specific limitations; file-backed secrets are not automatically encrypted at rest.
- Compose top-level models — Declares model resources for Compose services that link to AI models; current service support is version-gated (models require Compose 2.38+ per service reference).
- Top-level models — The map declares model resources referenced by service `models`; it does not itself embed weights or make the model endpoint secure.
- Top-level fragments — Reusable Compose fragments where supported by the current specification/implementation; verify the actual feature version.
- Compose extension fields x- prefix — Custom extension keys conventionally beginning `x-`, often used with YAML anchors; ignored by standard Compose semantics unless a tool interprets them.
- Compose YAML anchors and merge keys — YAML reuse mechanism; map merge behavior is constrained and does not replace Compose's own file merge rules.
- Compose interpolation syntax — Substitutes environment values using forms such as `${VAR}`, `${VAR:-default}`, `${VAR-default}`, `${VAR:?error}`, and `${VAR+alt}`; escaping and unset/empty distinctions matter.
- Compose .env file — Supplies interpolation values by default from project directory context; it is not automatically an in-container environment file for every service.
- Compose env-file CLI option — `--env-file` selects interpolation input; service `env_file` separately populates a container's environment.
- COMPOSE_FILE environment variable — Selects one or more Compose files; separators differ by platform and can affect relative-path base behavior.
- COMPOSE_PROJECT_NAME environment variable — Overrides project name selection for resource scoping.
- Service profiles — Service-level optional groups activated with `--profile`; unprofiled services are the normal default set.
- Compose multiple files and merge order — `-f base.yaml -f override.yaml` merges in order with later values overriding/combining according to type-specific merge rules; relative paths are resolved from the first file/project directory unless configured otherwise.
- Compose project directory — Base directory for relative paths and project context; explicit `--project-directory` changes resolution.

### Shared network and data resources

- Top-level network driver driver_opts attachable internal external ipam enable_ipv6 — `driver` chooses implementation; `driver_opts` configures it; `attachable` allows standalone containers on overlay networks; `internal` removes external connectivity; `external` uses a preexisting network; `ipam` configures address pools/gateways; IPv6 enablement is platform/version dependent.
- Compose network aliases ipv4_address ipv6_address link_local_ips priority gw_priority interface_name — Per-service attachment settings. Static addressing requires compatible IPAM; interface and gateway priority have version/implementation constraints; DNS alias can resolve multiple replicas.
- Top-level volume driver driver_opts external name labels — Driver creates storage; options configure backend; `external` refers to an existing volume; `name` sets actual engine name; labels support management. Never assume volume naming is portable across projects when explicitly named.
- Compose bind mount short and long syntax — Short `./data:/data:ro` is concise; long syntax names type/source/target and controls read-only/create-host-path/propagation more clearly.
- Compose volume long syntax subpath — Mounts a subdirectory of a volume when supported; ensure the subpath exists and has intended ownership.
- Compose volume bind create_host_path propagation selinux — `create_host_path` controls source directory creation; propagation governs mount-event sharing on Linux; SELinux relabel flags have platform-specific meaning. Avoid exposing broad host paths.
- Top-level secret file and environment sources — Sources may be file or environment variable where supported; source lifecycle and host permissions remain the operator's responsibility.
- Compose secret target uid gid mode — Controls in-container path and access metadata when implemented; file-backed secret uid/gid/mode semantics can be limited by bind-mount implementation.
- Top-level config file and environment sources — Non-secret config source made available to service. Do not place passwords/tokens here merely because it is convenient.
- Compose config target uid gid mode — Mount target and permission metadata; support differs by platform and source type.
- Compose deploy specification — Optional deployment model with resources, replicas, placement and update policy. Local Compose may implement a subset or ignore fields; Swarm/platform behavior is separate.

### Operator CLI

- `docker compose config` — Parses/normalizes and merges configuration, interpolates variables, and prints resolved model. It can reveal credentials/secrets; do not paste raw output into public logs.
- `docker compose up` — Builds/pulls as needed and creates/starts project services. `-d`, `--wait`, `--build`, `--force-recreate`, and other options affect behavior; verify their version support.
- `docker compose down` — Stops/removes project containers and networks. Volumes remain unless `-v` is specified; orphans can be removed separately.
- `docker compose build` — Builds service images from configured build contexts; build args/secrets/platform can be supplied.
- `docker compose pull` — Pulls service images according to configured references/policies.
- `docker compose logs` — Displays service/container logs; `-f`, `--since`, and service filters are useful, subject to logging driver and retention.
- `docker compose exec` — Starts a command in a running service container; interactive state changes are not declarative or durable.
- `docker compose run` — Creates a one-off container from a service configuration, overriding command and optionally ports; it does not publish service ports by default in the same way as `up`.
- `docker compose ps` — Lists containers in the project and their state/ports; it is a snapshot, not readiness verification.
- `docker compose --profile` — Activates one or more named profiles for optional services.
- `docker compose watch` — Starts file-watch-based sync/rebuild workflows where configured; intended for development and version-gated behavior, not a production deploy loop.
- `docker compose version` — Displays installed Compose plugin version; compare it with field minimums and release notes.
- Compose CLI -f --project-name --project-directory --env-file — `-f` selects/merges files, project-name selects resource namespace, project-directory controls relative paths, and env-file selects interpolation input.
- Compose pull_policy always missing never build — `always` pulls each time; `missing` pulls only if absent (with special `latest` behavior); `never` requires local image; `build` builds from source. Verify exact policy/version semantics.
- Compose down volume and orphan removal flags — `-v` removes declared/attached anonymous volumes and may destroy data; `--remove-orphans` removes containers not represented in the current model.
- Compose up detach wait build force-recreate flags — Detach for background operation; `--wait` waits for running/healthy state subject to health checks; `--build` rebuilds; force-recreate replaces containers even when config/image checks would not require it.
- Compose config resolved output and secret exposure — Normalized output may materialize environment values and local paths. Treat as sensitive and review before running untrusted project YAML.
- Compose trust model for untrusted YAML — Compose files can mount/read host paths, access environment values, build arbitrary commands, and expose engine/API capabilities; inspect source and resolved configuration before `up`.

## Cross-item comparison

| Object | What persists | Typical risk |
|---|---|---|
| Project-generated network | Until removed | Names collide or old resources remain |
| Named volume | Beyond container recreation | Data loss by `down -v`/prune, no automatic backup |
| Config | Source-managed non-secret data | Treating it as secret storage |
| Secret | Explicit service grant | Local file/env source permissions and implementation limits |
| Resolved config output | Terminal/log file lifetime | Expanded sensitive values disclosed |

## Examples

For a safe review, run `docker compose --env-file .env.production config` in a controlled terminal, inspect names/ports/mount paths/interpolation, and avoid capturing sensitive output. Then use `docker compose pull` or build intentionally, `up -d --wait` only if supported, and verify `ps`, health, application response, and storage. Use a project-specific name to avoid colliding with another developer's resources.

## Common mistakes

- Assuming obsolete `version:` selects the Compose parser.
- Treating `.env` and service `env_file` as the same feature.
- Believing top-level `secrets` encrypts all local files at rest.
- Assuming all `deploy` fields work with local Compose.
- Running `down -v` without understanding which persistent data it removes.
- Printing `docker compose config` to an unrestricted CI log.
- Running a repository's Compose file without checking bind mounts, build commands and socket access.

## Knowledge checks with answers

1. Why use a project name? **It scopes generated resources so separate projects can coexist.**
2. Does `docker compose config` only validate? **It also resolves/interpolates and may print sensitive values.**
3. Does `down` delete named volumes by default? **No; `-v` requests volume removal and can destroy data.**
4. Is Compose Deploy Specification universally implemented locally? **No; it is optional and platform-dependent.**

