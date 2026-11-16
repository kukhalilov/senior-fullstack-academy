# Docker images Dockerfiles compose networks volumes and security — Reference: Compose service attributes for process, network, storage, resources, and security

Sources: [Compose service reference](https://docs.docker.com/reference/compose-file/services/), [Compose Build Specification](https://docs.docker.com/reference/compose-file/build/), [Compose network reference](https://docs.docker.com/reference/compose-file/networks/), [Compose volume reference](https://docs.docker.com/reference/compose-file/volumes/), [Compose secrets](https://docs.docker.com/reference/compose-file/secrets/), and [Compose Deploy Specification](https://docs.docker.com/reference/compose-file/deploy/).

## Scope and version

The full service attribute surface was checked against current Docker documentation on 2026-11-16. Docker Compose v5.7.1 is the latest tagged plugin release checked. Attributes such as `attach`, `post_start`, `pre_start`, `provider`, `models`, `use_api_socket`, and various resource controls have minimum-version or implementation constraints. `docker compose config` validates the installed implementation's accepted model, not every runtime/platform effect.

## How this group fits the mental model

Each service key contributes to the container creation/build request or to a platform-specific deployment model. The service name is a DNS identity; the image/build selects artifacts; command/user/environment set process behavior; networks, ports and mounts create boundaries; resource/security keys constrain the container. YAML can be syntactically valid while a requested feature is unsupported or unsafe.

## Supplied names explained

### Identity, artifact, command, and environment keys

| Key | Meaning and operational notes |
|---|---|
| `image` | Image reference. If combined with `build`, pull/build policy determines which artifact is used; pin a digest where reproducibility matters. |
| `build` | Build Specification object or context shorthand; supports named contexts, Dockerfile, args, cache and attestations. Build support is optional to an implementation. |
| `command` | Overrides image CMD; list form preserves argv and shell behavior must be explicit. Null can restore image default; empty can suppress it. |
| `entrypoint` | Overrides image ENTRYPOINT; list form is exec-like and empty/null handling changes default behavior. |
| `container_name` | Sets fixed Engine name. It prevents scaling that service beyond one container and can cause collisions; prefer generated project names. |
| `hostname` | Sets container hostname; it is not the Compose service DNS name and may not alter external DNS. |
| `domainname` | Sets container DNS domain field; resolver/search behavior still depends on runtime configuration. |
| `user` | Runtime UID/GID/name override. Match mounted file ownership; numeric IDs avoid image name lookup ambiguity. |
| `working_dir` | Runtime current directory override; relative paths and app assumptions should be tested. |
| `environment` | Map/list of variables passed to process; interpolation/precedence includes shell, env files, image defaults and explicit values. Avoid secret values. |
| `env_file` | Reads service environment entries from file; distinct from project interpolation `.env`. Required/format options have version-specific support. Protect file and resolved output. |
| `init` | Adds a small init process for signal forwarding/child reaping; does not fix an application that ignores shutdown or leak processes. |
| `stdin_open` | Keeps stdin open (`-i` behavior); useful for interactive tools, rarely needed for daemon services. |
| `tty` | Allocates pseudo-terminal; can alter buffering and signal behavior, usually avoid for noninteractive production services. |
| `attach` | Controls whether Compose attaches to/collects service output during `up`; requires Compose 2.20+. Logs can still be requested later if retained. |
| `annotations` | Adds OCI/runtime annotations to container metadata; accepted keys and downstream consumers vary. |
| `labels` | Adds metadata key/value labels for tools/policy; do not store secrets in labels. |
| `label_file` | Loads labels from files, with precedence relative to inline labels; protect source and verify support. |
| `models` | Connects a Compose service to top-level AI model resources and injects endpoint/model environment names; requires Compose 2.38+. |
| `provider` | Defines a provider-managed external service rather than a normal Compose container; requires Compose 2.36+ and a compatible provider executable/plugin. |
| `credential_spec` | Windows container credential-spec configuration (e.g. gMSA); platform-specific identity integration, not a portable Linux key. |
| `extends` | Reuses service configuration from another service/file; resolves/merges fields and can obscure final settings. Inspect normalized config. |

### Build, lifecycle, and image acquisition

| Key | Meaning and operational notes |
|---|---|
| `pull_policy` | Controls image pulls (`always`, `never`, `missing`, `build`, and time-based forms depending on version); policy affects mutable tags and offline operation. |
| `platform` | Selects target OS/architecture/variant for image/build; builder/emulation and published manifest must support it. |
| `post_start` | Runs hooks after container start, but exact timing relative to entrypoint readiness is not guaranteed; requires Compose 2.30+. |
| `pre_start` | Runs ordered init containers before service start, after dependencies; Compose 5.3+ feature. It is not a general migration lock/distributed job system. |
| `pre_stop` | Runs hooks before Compose-initiated stop; it is not guaranteed on spontaneous crash/kill and requires Compose 2.30+. |
| `restart` | Engine restart policy for process exit; it does not necessarily restart on unhealthy status. Compose restart policy differs from deploy.restart_policy. |
| `stop_signal` | Signal sent when stopping the service; must match app behavior and can be overridden by image/runtime details. |
| `stop_grace_period` | Time allowed before forceful termination; size for graceful request draining and durable writes. |

### Networking and discovery keys

| Key | Meaning and operational notes |
|---|---|
| `ports` | Publishes host-to-container ports; long syntax supports host_ip, target, published, protocol, app_protocol, mode, name. Avoid accidental public bind. |
| `expose` | Documents/opens container ports for inter-container use without host publishing; it is not a firewall rule or a listener. |
| `networks` | Attaches service to top-level networks with aliases/address/priority options; shared network membership defines reachability. |
| `network_mode` | Uses modes such as host, none, service/container namespace; conflicts with `networks` and reduces/changes isolation. |
| `dns` | Overrides DNS server addresses for container resolver; does not configure host DNS. |
| `dns_opt` | Adds resolver options such as timeout/attempts; validate libc/resolver support. |
| `dns_search` | Adds DNS search suffixes; can unexpectedly expand unqualified names and expose queries. |
| `extra_hosts` | Adds static host mappings, analogous to `/etc/hosts`; can become stale and bypass DNS management. |
| `links` | Legacy connectivity/alias feature; user-defined networks and service DNS are preferred. It is not a strong isolation boundary. |
| `external_links` | Legacy cross-project link naming; use explicit shared external networks and aliases instead. |
| `mac_address` | Requests container MAC; support is platform/engine/version sensitive and duplicate addresses create network problems. |
| `priority` / `gw_priority` / `interface_name` | Per-network attachment ordering, default gateway preference, and interface naming; modern and version-dependent, not a service startup priority. |
| `ipv4_address` / `ipv6_address` / `link_local_ips` | Requests addresses on attached network; configure IPAM and avoid collisions. These are attributes within the networks mapping. |

### Filesystem, secrets, and configurations

| Key | Meaning and operational notes |
|---|---|
| `volumes` | Mount declarations in short or long syntax. A mount hides image files at its target and has independent lifecycle/ownership semantics. |
| `configs` | Grants non-secret top-level configs to the service; mounted file target/mode depends on platform implementation. |
| `secrets` | Grants top-level secret sources only to selected service; local file-backed secrets require host access controls and may not have Swarm's encrypted distribution guarantees. |
| `tmpfs` | Mounts temporary memory-backed paths with optional mode/uid/gid; contents are not durable and consume resources. |
| `read_only` | Makes the container root filesystem read-only; required writable paths must be declared as mounts/tmpfs. |
| `volumes_from` | Mounts volumes from another container/service. It couples lifecycle/permissions and is generally less explicit than declaring shared named volumes. |
| `shm_size` | Sizes `/dev/shm` shared-memory mount; relevant to browsers/databases and constrained by platform. |
| `storage_opt` | Engine-specific writable-layer storage settings; may be unsupported with some storage drivers/platforms. |
| `driver_opts` | Options for a configured volume/network driver; scope is the driver resource, not arbitrary service configuration. |

### Linux identity, namespace, security, and device keys

| Key | Meaning and operational notes |
|---|---|
| `group_add` | Adds supplementary groups; numeric/name mapping and host volume ownership matter. |
| `userns_mode` | Selects user-namespace mode where supported; daemon-wide remapping and rootless mode affect UID mapping. |
| `cap_add` / `cap_drop` | Adds/removes Linux capabilities. Start from defaults, drop unnecessary privileges, and add narrowly only after identifying the required operation. |
| `privileged` | Grants broad device/capability/security access; avoid for ordinary workloads because it weakens isolation substantially. |
| `security_opt` | Configures security options such as seccomp/AppArmor/SELinux labels or no-new-privileges; syntax/platform support varies. |
| `cgroup` | Selects cgroup namespace behavior where available; not a resource limit by itself. |
| `cgroup_parent` | Places service container under a specified cgroup parent; daemon/cgroup-driver dependent. |
| `pid` | Shares/uses a PID namespace mode such as host or another service; sharing exposes process information and changes isolation. |
| `ipc` | Selects IPC namespace mode; host/container/service sharing affects shared memory and isolation. |
| `uts` | Selects UTS namespace mode for hostname/domainname; sharing means names are not isolated. |
| `isolation` | Platform-specific container isolation implementation (notably Windows); not portable between operating systems. |
| `runtime` | Selects alternate runtime where configured, e.g. GPU runtime; many modern GPU integrations use device requests instead. |
| `gpus` | Requests GPU devices/count/capabilities using supported Compose syntax and Engine/device drivers. Requires compatible hardware/runtime. |
| `devices` | Maps host devices into container; grants direct hardware access and requires narrow explicit access.
| `device_cgroup_rules` | Adds cgroup device allow rules; does not create or map the device itself. |
| `credential_spec` | On Windows, references credential-spec identity material; it is separate from Linux user/group settings. |
| `use_api_socket` | Mounts/forwards container-engine API access and credentials into service; effectively grants delegated daemon control and should be treated as highly privileged. |

### Resource and I/O controls

| Key | Meaning and operational notes |
|---|---|
| `cpus` | Fractional CPU quota shorthand (e.g. 1.5 CPUs); scheduler throttling can affect latency. |
| `cpu_count` | Windows-specific CPU count limit. |
| `cpu_percent` | Windows-specific CPU percentage limit. |
| `cpu_shares` | Relative CPU weight under contention, not a hard CPU cap. |
| `cpu_period` / `cpu_quota` | CFS scheduling period and quota; their ratio defines bandwidth cap. |
| `cpu_rt_period` / `cpu_rt_runtime` | Real-time scheduler period/runtime settings; require kernel/runtime support and privilege. |
| `cpuset` | Restricts eligible CPUs; pinning can harm scheduling/NUMA locality if misconfigured. |
| `mem_limit` | Hard memory limit; OOM can kill a process inside the container. |
| `mem_reservation` | Soft memory reservation/pressure target; not a guaranteed allocation. |
| `mem_swappiness` | Controls swap tendency on supported Linux Engine; behavior depends on host swap/cgroup mode. |
| `memswap_limit` | Combined memory+swap ceiling with special values; understand host swap and cgroup version semantics. |
| `oom_kill_disable` | Attempts to disable OOM killer behavior for service; can endanger host and is not a substitute for sizing. |
| `oom_score_adj` | Adjusts process OOM preference; does not create memory capacity or guarantee survival. |
| `pids_limit` | Caps process/task count; too low can break thread-heavy runtimes. |
| `blkio_config` | Block I/O weights/throttles, including device read/write bytes or IOPS; driver/cgroup support varies. |
| `logging` | Selects driver and options for container log delivery/rotation; a full disk or unbounded JSON logs can affect host health. |
| `ulimits` | Sets process resource soft/hard limits such as `nofile`/`nproc`; distinguish from cgroup limits. |
| `shm_size` | Also constrains shared-memory area used by apps; often confused with container memory limit. |

## Cross-item comparison

### Additional supplied attribute combinations

- Service port long-syntax host_ip published target protocol app_protocol mode name — The long form makes host and container ports, address scope, transport, application protocol metadata, ingress/host mode, and descriptive name explicit. `app_protocol` is metadata, not a TLS configuration.
- Service volume long-syntax type source target read_only consistency bind propagation volume nocopy tmpfs — Long-form mount fields separate the source from destination and driver-specific options. `read_only` is independent from host source permissions; `nocopy` controls initial volume content copy where supported.
- Service healthcheck test interval timeout retries start_period start_interval — The test defines the probe command/none; timing/retry fields bound load and readiness delay. `start_interval` is version gated; health status alone does not restart.
- Service build context dockerfile dockerfile_inline args ssh secrets cache_from cache_to additional_contexts target — These build fields identify sources, Dockerfile, scoped arguments/SSH/secrets, cache import/export, named inputs and target stage. Secret/SSH access must be explicitly consumed in Dockerfile and never copied into output.
- Service environment precedence and interpolation — Shell environment, project interpolation files, service `env_file`, explicit service values and image defaults have distinct precedence; unresolved/empty values can change behavior. Resolved output can disclose secrets.
- Service deploy.resources limits reservations — Deployment-model resource ceilings/requests; local Engine/Compose support differs and must be verified from effective container limits.
- Service deploy.resources device reservations — Requests devices such as GPUs through deployment resource model; support depends on platform/device driver.
- Service GPU request gpus — `gpus` requests accelerator device access; it requires compatible host hardware, Engine/runtime and Compose syntax.
- Service lifecycle hook command user environment working_dir privileged — Hook-specific command and execution identity/environment/path/privilege; do not assume it shares every main-process detail or startup ordering.
- Service user and group identity — `user` selects primary process identity and `group_add` supplements groups; filesystem and user-namespace mappings determine actual host access.
- Service network aliases and static addresses — Network attachment aliases and requested IPv4/IPv6 addresses are scoped to a network and require compatible IPAM; names can map to multiple replicas.
- Service logging driver and options — `logging` config selects backend and rotation/delivery options; a remote driver or disabled attachment changes what `docker compose logs` can retrieve.
- Compose cgroup namespace settings — `cgroup` and `cgroup_parent` govern namespace/placement integration; separate them from resource limits and host cgroup policy.
- Compose service models key — `models` links service to a declared top-level model and injects configured endpoint/model environment variable names; it does not supply inference code by itself.
- Compose service provider key — `provider` delegates service configuration to a provider executable/plugin, so provider trust and returned endpoints/credentials are part of the security boundary.
- `profiles` — Service key controlling optional profile membership; profile selection belongs to project activation, not container health.
- `scale` — Legacy service replica count setting; prefer current CLI `--scale` for ad hoc scaling or a deployment platform's supported replica model. Fixed `container_name` prevents scaling.
- `sysctls` — Service kernel parameters must be namespaced; host-global sysctls cannot safely be changed from a container declaration.

| Setting family | Example | Core boundary |
|---|---|---|
| Image command | `command`, `entrypoint` | Main process/argv and signal handling |
| Port exposure | `expose`, `ports`, `network_mode` | Internal metadata versus host publication versus namespace sharing |
| Mounts | `volumes`, `configs`, `secrets`, `tmpfs` | Persistence and sensitivity differ |
| CPU/memory | `cpus`, `cpu_shares`, `mem_limit` | Hard cap versus relative weight/soft reservation |
| Isolation | `user`, `cap_drop`, `security_opt`, `privileged` | Least privilege versus broad host access |
| Restart | `restart`, deploy `restart_policy` | Local Engine process policy versus optional deployment model |

## Examples

For a web service, use an immutable image reference, `user` matching file ownership, explicit `read_only: true`, a writable named state volume, `cap_drop: [ALL]` plus only proven requirements, a healthcheck, bounded CPU/memory/PIDs, and a published host port bound intentionally. Validate the accepted field set with `docker compose config`, inspect the container, and test startup, writes, graceful stop, health and logs. Add one control at a time because security constraints can expose hidden app assumptions.

## Common mistakes

- Treating every field in the schema as supported by every Compose implementation.
- Using `privileged`, host namespaces, devices, or `use_api_socket` to silence a permission problem.
- Setting `mem_limit` without observing peak usage or OOM recovery behavior.
- Putting secrets in `environment`, labels, config files, or resolved CI output.
- Combining `network_mode` with `networks` or assuming `expose` publishes a port.
- Using `container_name` and then expecting replicas or collision-free project isolation.
- Copying outdated `links`/`external_links` examples instead of using explicit networks and DNS.

## Knowledge checks with answers

1. Which key publishes a host port? **`ports`; `expose` alone does not.**
2. Why can `cpu_shares` fail to cap a service? **It is a relative weight under contention, not an absolute quota.**
3. Does `read_only` prevent all writes? **No; mounted volumes/tmpfs can remain writable.**
4. Why is `use_api_socket` high risk? **It grants access to the container engine API, often equivalent to broad host control.**
5. Is `restart` identical to `deploy.restart_policy`? **No; they operate in different Compose/Engine deployment contexts.**

