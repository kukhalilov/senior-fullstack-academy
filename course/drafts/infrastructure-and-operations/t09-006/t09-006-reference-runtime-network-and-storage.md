# Docker images Dockerfiles compose networks volumes and security — Reference: Container runtime controls, network discovery, ports, and persistent data

Sources: [Docker Engine run reference](https://docs.docker.com/engine/containers/run/), [Docker network](https://docs.docker.com/engine/network/), [Docker volumes](https://docs.docker.com/engine/storage/volumes/), and [Docker Engine release notes](https://docs.docker.com/engine/release-notes/).

## Scope and version

Commands are Docker CLI operations against a selected Engine context. Network drivers and storage options differ by platform and daemon configuration. Examples use current Docker Engine behavior; inspect `docker version`, `docker context show`, and local `docker run --help` before relying on a recent flag.

## How this group fits the mental model

At runtime, Docker creates a process with namespaces, mounts, environment and cgroup controls. The container's loopback, filesystem and process IDs are scoped views. Network publication creates a host-to-container path; storage mounts replace or augment paths in the image. Inspect the effective container configuration rather than infer it from a Compose file or Dockerfile alone.

## Supplied names explained

### Lifecycle and per-container operations

- `docker run` — Creates and starts a container from an image. Options set identity, environment, mounts, resources, networks, signals and port publication.
- `docker create` — Creates a stopped container with configuration but does not launch its main process.
- `docker start` — Starts an existing created/stopped container using its stored configuration.
- `docker stop` — Sends the configured stop signal (often SIGTERM), waits for a grace period, then escalates. Set an adequate timeout and handle the signal in the application.
- `docker kill` — Sends a selected signal immediately (default SIGKILL); it skips graceful stop and can interrupt data writes.
- `docker rm` — Removes a stopped container and its writable layer; `-v` can also remove associated anonymous volumes, so treat it as destructive.
- `docker exec` — Starts a secondary process in a running container; it is useful for diagnosis but a manual change is ephemeral and may not reproduce the main process environment exactly.
- `docker cp` — Copies files between host and container filesystem paths, including stopped containers. Confirm direction, symlink semantics and sensitivity.
- `docker logs` — Reads container stdout/stderr through the configured logging driver; availability and options depend on driver.
- `docker inspect` — Displays object configuration/state as JSON; it may expose environment values, mount paths, labels, or credential references.
- `docker container update resource options` — Updates selected live resource constraints (e.g. memory/CPU) without recreating when supported; inspect current limits and platform-specific behavior.
- Docker container health status — `starting`, `healthy`, or `unhealthy` from configured check. It is not a restart action.
- HEALTHCHECK start period — Startup grace period during which probe failures do not count until a successful probe or period behavior transitions; configure for real startup latency.
- Docker stop timeout — Grace interval before stop escalation; an application needs enough time to finish accepted work and flush durable state.
- STOPSIGNAL delivery — Stop uses image/configured signal and sends it to the container's main process model. PID 1 signal semantics and shell wrappers can interfere.

### Network modes and addressing

- Docker bridge network — Local Engine-managed Layer-2/3 connectivity typically NATed through host; default bridge behavior differs from user-defined bridges.
- User-defined bridge network — User-created bridge with automatic DNS resolution by container/service name and isolation from unrelated networks by default.
- Host network mode — Shares host network namespace on supported Linux; port publishing is unnecessary/ignored and isolation is reduced. Docker Desktop support/semantics differ.
- None network mode — No external network interfaces beyond loopback; useful for isolation, not for workloads requiring network access.
- Overlay network — Multi-host network driver commonly associated with Swarm; requires proper cluster/control-plane setup and should not be confused with a basic local bridge.
- Network namespace — Isolated interface/address/route/socket view. Container loopback is not host loopback.
- Container DNS service discovery — Engine DNS resolves attached container/service names on user-defined networks; names are network scoped and replacement containers may receive new IPs.
- Container DNS — Resolver configuration inside the container, potentially using an Engine-managed embedded resolver and upstream DNS from the host.
- Network alias — Additional name assigned to a container on a specific network; multiple replicas may share an alias and resolution can return multiple addresses.
- Container-to-container port — Destination port where the receiving process listens inside its network namespace. Other containers use service DNS and this port.
- Host-to-container port mapping — Forwarding from a host address/port to container address/port, e.g. `127.0.0.1:8080:80`; host firewall/NAT and address scope matter.
- Port publishing — `-p` or Compose `ports` requests host mapping. Omitting the host IP often binds beyond loopback; verify actual binding and firewall policy.
- Docker published-port host IP binding — Selects host interface address for a published port. Bind to loopback for local-only development or a specific intended interface for controlled exposure.
- `docker network connect` — Attaches a running/stopped container to a network, adding reachability/aliases; runtime mutation should be reflected in declarative config.
- `docker network disconnect` — Detaches a container; can break live connections and name-based paths.

### Storage and mount lifetimes

- Docker volume — Engine-managed persistent data location mounted into containers; lifecycle is independent of one container but can still be explicitly deleted.
- Named volume — User/project-named Docker volume, reusable and inspectable; use for engine-managed app data and define backup/restore separately.
- Anonymous volume — Engine-assigned volume mounted at a declared/selected path; may outlive the container until removed or pruned.
- Bind mount — Maps a host path directly into the container. It couples deployment to host layout and permissions, and can expose sensitive host files.
- tmpfs mount — Temporary memory-backed mount removed with the container/host lifecycle; not durable and may consume memory.
- Volume driver — Engine/plugin backend that provisions storage; driver options and durability depend on the implementation.
- Mount read-only flag — Prevents writes through that mount from the container; does not make other paths read-only.
- Mount source path — Host/volume source path. Bind source path must exist or behavior may create directories depending on syntax/tool option.
- Mount target path — Destination inside container; mounting over existing image content hides that content for the container.
- Container storage lifetime — Writable layer lasts only as long as that container; persist important state via explicit volume/external store and backup.
- `docker volume create` — Creates a named/driver-backed volume; inspect driver and labels before attaching valuable data.
- `docker volume inspect` — Displays volume mountpoint/driver/options; host mountpoint details are daemon-host-specific.
- `docker volume ls` — Lists volumes, not their data consistency or backup status.

### Resource constraints

- Container resource limit — Runtime constraint such as CPU, memory, PIDs, I/O; set limits to contain noisy neighbors but account for workload peaks.
- CPU quota — CFS quota/period rate limit; it can throttle bursts even if host has idle cores.
- Memory limit — Cgroup memory ceiling. OOM termination may occur before the host runs out of memory; observe cgroup events and app behavior.

## Cross-item comparison

| Data/network feature | Lifetime or scope | Use when |
|---|---|---|
| Writable layer | One container instance | Temporary image-derived changes only |
| Named volume | Engine volume lifecycle | Persistent app data managed by Docker |
| Bind mount | Host path lifecycle | Development or deliberate host integration |
| tmpfs | Runtime memory | Ephemeral scratch/secrets with careful swap policy |
| Container port | Container namespace | Service-to-service destination |
| Published port | Host address plus container port | Access from host/external network |

## Examples

For local-only access publish `127.0.0.1:8080:80`; verify with `docker port CONTAINER` and `ss` on the host. On a user-defined bridge, an API can connect to `db:5432` without publishing database port 5432. Persist database files on a named volume and verify `docker inspect CONTAINER` shows the intended mount before running migrations.

## Common mistakes

- Publishing to all host interfaces unintentionally.
- Connecting container-to-container using the host-mapped port rather than the receiving container port.
- Assuming `docker rm` removes all volumes or that anonymous data is safe from prune.
- Mounting an empty host directory over a populated image directory and then wondering where the image files went.
- Using `docker exec` manual edits as a durable deployment fix.
- Treating host-level free memory as proof a container is below its cgroup limit.

## Knowledge checks with answers

1. Where does `localhost` point inside a container? **The container's own network namespace.**
2. What is usually the best default for persistent database data? **A deliberately managed named/external volume with verified backup and restore.**
3. Does publishing a host port alter the app's bind address? **No; the app must listen on an address reachable within its container network.**
4. What does `docker stop` do before escalation? **Sends the configured stop signal and waits for the grace timeout.**

