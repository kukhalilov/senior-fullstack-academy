# Linux shell permissions processes networking systemd and logs — Reference: Unit files, dependencies, service types, restart behavior, and hardening controls

Sources: [systemd unit manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html), [systemd service manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), [systemctl manual](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html), and [systemd releases](https://github.com/systemd/systemd/releases).

## Scope and version

The documentation baseline is systemd 262.1 checked 2026-11-16. Unit directives and service types have version-introduction metadata in upstream documentation; a distribution may ship an older release or backport features. Check `systemd --version`, `man systemd.service`, and `systemd-analyze verify` on the target. User services, system services, containers, and non-systemd hosts differ.

## How this group fits the mental model

systemd is a manager that loads units, orders jobs, starts processes, tracks cgroups, and applies lifecycle/resource policy. It is not the application itself and `active` does not necessarily mean requests succeed. A unit's dependency graph and ordering graph are distinct: requiring another unit does not necessarily mean the application-level dependency is ready.

## Supplied names explained

### Managers, units, and unit files

- **systemd** — A suite including PID 1 system manager, user manager, tools, and services; not every Linux installation uses it as init.
- **systemd system manager** — System-wide manager, normally PID 1, controlling system services and system units.
- **systemd user manager** — Per-user manager for user units; lifecycle, environment and privileges differ from system units.
- **Unit** — Named managed object such as service, socket, target, timer, path, or mount. Unit names and aliases resolve through unit search paths/drop-ins.
- **Service unit (.service)** — Describes a process or oneshot action and its lifecycle policy.
- **Socket unit (.socket)** — Defines listening sockets and can activate a service on demand; socket activation changes when the process starts, not the protocol contract.
- **Target unit (.target)** — Synchronization/grouping point for dependencies, often used to represent boot or operating modes; targets do not themselves execute a daemon.
- **Timer unit (.timer)** — Activates a target/service by calendar or monotonic schedule; pair with its target unit and consider missed-time/persistence semantics.
- **Path unit (.path)** — Watches paths for changes and activates another unit; it is not a general recursive file watcher.
- **Mount unit (.mount)** — Represents a mount; unit naming derives from escaped path names, and mount ordering can affect service startup.
- [Unit] section — Describes unit metadata, dependencies, ordering, conflicts, and conditions.
- [Service] section — Service execution, identity, resource, restart, and sandbox settings.
- [Install] section — Instructions used by enable/disable to create/remove dependency symlinks; it is not needed for a unit to be started manually.
- **`Description=`** — Human-readable unit summary, not a command or identity.

### Dependency and ordering directives

- **`After=`** — Orders this unit after listed units when both jobs are in the transaction; it does not pull them in or imply readiness.
- **`Before=`** — Inverse ordering relation. Combined contradictory ordering can produce cycles; inspect `systemd-analyze verify` and transaction output.
- **`Wants=`** — Weak requirement that pulls another unit into the start transaction; failure generally does not fail this unit.
- **`Requires=`** — Stronger activation dependency; failure to start a required unit affects the requiring unit, but ordering requires a separate `After=` when needed.
- **`PartOf=`** — Propagates stop/restart operations from listed units to this unit in specified directions; it is not a general startup dependency.
- **`WantedBy=`** — In `[Install]`, names a target that should want the unit when enabled; enabling creates a symlink. It does not mean the target is always active.

### Execution commands and service types

- **`ExecStart=`** — Main command. systemd parses executable and arguments itself; shell operators (`|`, `>`, `$VAR`) are not interpreted by a shell unless explicitly invoking one. Prefixes modify execution behavior; check the manual before relying on them.
- **`ExecStartPre=`** — Commands run before start; failure normally fails service start. They are not a substitute for robust application readiness checks.
- **`ExecStartPost=`** — Commands after the service start action; failure can affect start result, with exact semantics depending on service type.
- **`ExecReload=`** — Command to request reload; systemd does not infer application reload semantics. A reload signal via `systemctl reload` only works if configured/implemented.
- **`ExecStop=`** — Stop command, followed by systemd's configured termination behavior. Ensure it does not wait forever; timeout and kill policy still apply.
- **`Type=simple`** — Considered started shortly after process creation; process setup failures after `fork` may not be reported as cleanly as with exec.
- **`Type=exec`** — Waits until the configured executable has been successfully invoked; this catches missing executable/user setup earlier, but still does not mean the application is ready.
- **`Type=forking`** — Expects startup program to fork and parent to exit; usually needs correct main-PID detection or `PIDFile=` for reliable tracking.
- **`Type=oneshot`** — Runs a command to completion; `RemainAfterExit=yes` can keep unit active after success. It is suitable for finite setup tasks, not long-running daemons.
- **`Type=notify`** — Service sends readiness notification via sd_notify protocol; the application must support it and `NotifyAccess=` constrains who may send.
- **`Type=notify-reload`** — Newer protocol lets a notifying service report reload completion. Requires compatible systemd and app; do not assume older distributions understand it.
- **`Type=dbus`** — Considered started when the configured D-Bus name is acquired; requires the matching bus/name behavior.

### Identity, environment, and restart/lifecycle settings

- **`User=`** — User credential for service process. It does not by itself restrict filesystem visibility or grant only specific capabilities.
- **`Group=`** — Primary group credential; supplementary groups may be configured separately and depend on manager support/configuration.
- **`WorkingDirectory=`** — Working directory set before execution; use explicit paths because a service does not inherit an operator's shell directory.
- **`Environment=`** — Sets environment assignments in the unit; values are not shell-expanded like an interactive command and should not hold secrets visible to privileged inspection.
- **`EnvironmentFile=`** — Reads environment assignments from a file, with optional missing-file behavior depending on prefix/syntax. Protect file ownership/mode; syntax is not identical to shell scripting.
- **`Restart=`** — Policy such as `no`, `on-success`, `on-failure`, `on-abnormal`, or `always`; manually requested stops are treated differently. Pair with rate limiting and root-cause analysis.
- **`RestartSec=`** — Delay before automatic restart. A fixed delay can synchronize fleets; use jitter where supported and plan for backoff.
- **`RestartPreventExitStatus=`** — Prevents restart for specified exit statuses/signals; useful to distinguish permanent/configuration failures from transient ones.
- **`TimeoutStartSec=`** — Maximum start wait, with special notify extension semantics; it is not an HTTP health check timeout.
- **`TimeoutStopSec=`** — Grace period for stopping before kill escalation, with service type and kill mode affecting which processes are targeted.
- **`KillMode=`** — Determines which processes in the service cgroup are signaled (common choices include `control-group`, `mixed`, `process`, `none`); avoid leaving unmanaged children unintentionally.
- **`KillSignal=`** — Initial signal used for termination (default typically SIGTERM); the final kill behavior is governed by timeout and kill mode.
- **`WatchdogSec=`** — Enables watchdog supervision for services that send regular keepalive notifications; a configured interval without application support can cause failure/restarts.
- **`RemainAfterExit=`** — For oneshot services, keeps the unit active after its process exits successfully; it records completed state, not a live process.
- **`RestartRandomizedDelaySec=`** — systemd 262 directive adding a random delay from zero to the configured duration on top of automatic restart delay, reducing simultaneous fleet restarts. Check target version before use.
- **`ExitType=`** — Controls when a service is considered exited: `main` tracks the main process; `cgroup` remains active while processes remain in its cgroup. It changes tracking semantics, not the need to clean up children.
- **`ExitType=main`** — Default behavior in which the main process exit ends the service even if other child processes remain, subject to service-type details.
- **`ExitType=cgroup`** — Considers service running while at least one process remains in the service cgroup; useful for workloads without a stable main process but requires understanding all descendants.

### Operator commands, overrides, and hardening

- **`systemctl start`** — Requests activation now; it does not enable activation at boot.
- **`systemctl stop`** — Requests stop and applies service termination policy.
- **`systemctl restart`** — Stops and starts a unit; can interrupt traffic and erase transient state. Prefer reload only when the app supports it and reload is safe.
- **`systemctl reload`** — Invokes configured reload action; does not restart a service and may fail if no reload mechanism exists.
- **`systemctl enable`** — Creates install symlinks for future activation; with `--now`, also starts immediately. Enabling alone does not start a currently stopped service.
- **`systemctl disable`** — Removes install symlinks; does not necessarily stop a currently running unit.
- **`systemctl mask`** — Links a unit to `/dev/null` to prevent activation, including dependencies/manual requests; `unmask` is required before use.
- **`systemctl daemon-reload`** — Makes manager reread unit files after edits. It does not restart/reload the application process.
- **`systemctl status`** — Human-oriented summary of unit state, recent log lines, and process details; not a stable scripting API or complete log.
- **`systemctl cat`** — Displays base unit and drop-ins as loaded from disk; useful for identifying overrides.
- **`systemctl list-units`** — Lists loaded units, optionally filtered by state/type; inactive units may not appear unless requested.
- **`systemctl list-unit-files`** — Shows installed unit-file enablement state, not necessarily runtime state.
- **`systemctl reset-failed`** — Clears failed state and start-rate-limit counters; it does not fix the underlying failure.
- **systemd drop-in override** — Additional `.conf` fragment under a unit-specific `.d/` directory; common for local changes that survive package updates. Empty assignment resets list-valued settings; inspect the merged result.
- **`systemd-analyze verify`** — Parses/verifies unit files and reports errors/warnings using the local systemd version. It cannot prove runtime correctness or application readiness.
- **`ProtectSystem=`** — Makes selected parts of filesystem read-only to the service; choices include `strict`, `full`, or `yes` semantics depending on version. Pair with explicit writable paths needed by the application.
- **`ProtectHome=`** — Restricts service access to home directories; selected modes may hide or make them inaccessible/read-only.
- **`PrivateTmp=`** — Gives service private temporary directories, isolating `/tmp` and `/var/tmp` views; not a complete filesystem sandbox.
- **`NoNewPrivileges=`** — Prevents gaining new privileges through exec mechanisms such as setuid/setgid; does not remove privileges already held.
- **`CapabilityBoundingSet=`** — Limits capability set available to service; derive required capabilities from actual behavior and test carefully.
- **`ReadWritePaths=`** — Explicitly permits write access to paths otherwise restricted by read-only filesystem sandboxing; it does not create directories or override all other controls.
- **`DynamicUser=`** — Allocates a transient service identity when supported; persistent file ownership needs compatible mechanisms such as managed state/runtime directories.
- **Unit sandboxing versus containerization** — systemd sandboxing composes kernel controls around a service; a container typically adds namespaces/rootfs/network lifecycle and image packaging. Neither is automatically a VM or complete security boundary.

## Example unit and deployment procedure

```ini
[Unit]
Description=Example API
After=network.target

[Service]
Type=exec
User=example-api
Group=example-api
WorkingDirectory=/srv/example-api
ExecStart=/usr/bin/dotnet /srv/example-api/Example.Api.dll
Restart=on-failure
RestartSec=3s
RestartRandomizedDelaySec=20s
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ProtectHome=yes
ReadWritePaths=/var/lib/example-api

[Install]
WantedBy=multi-user.target
```

This illustrative unit assumes systemd 262 for `RestartRandomizedDelaySec=` and an application that can write only to the declared state directory. Validate executable paths, ownership, readiness needs, writable paths, and local version before using it. A deployment sequence is: install a versioned release; update a controlled symlink/config; run `systemd-analyze verify`; inspect `systemctl cat`; `daemon-reload`; restart during a planned window; verify process, listener, health endpoint, and logs; roll back to the previous release if checks fail.

## Cross-item comparison

| Question | Relevant controls | Key distinction |
|---|---|---|
| What starts together? | `Wants=`, `Requires=` | Pull-in strength differs from ordering |
| In what order? | `After=`, `Before=` | Ordering does not imply readiness |
| When is startup complete? | `Type=` and notification | Manager state differs from health |
| What is tracked as running? | `ExitType=`, main PID, cgroup | Child lifecycle matters |
| What happens after exit? | `Restart=`, delay, prevent status | Rate limits and version support matter |
| What can it access? | User, capabilities, sandbox paths | Test the actual app behavior |

## Examples

For a long-running foreground .NET process, `Type=exec` with an explicit executable and working directory is usually a clearer baseline than `Type=forking`. If the application supports sd_notify, `Type=notify` can communicate readiness. A drop-in changing `Restart=` should be verified with `systemd-analyze verify`, then reloaded and checked with `systemctl cat` before the controlled restart.

## Common mistakes

`After=network.target` provides ordering, not guaranteed online connectivity. `network-online.target` is meaningful only when the relevant wait-online service is enabled and still cannot guarantee a remote dependency is healthy. `Requires=` does not automatically order units. Shell syntax in `ExecStart=` is not interpreted unless the executable is a shell. Editing a unit needs `daemon-reload`; editing app config may need reload/restart. `enable`, `start`, and `active` answer different questions.

## Knowledge checks with answers

1. Does `After=database.service` start the database? **No; ordering does not pull a unit into the transaction.**
2. Does `daemon-reload` restart the program? **No; it makes the manager reread unit files.**
3. What does `Type=exec` confirm? **That execution succeeded, not that the app is ready for traffic.**
4. Why verify a new directive against host version? **Older systemd may reject or ignore unsupported settings.**

## Summary

Read the merged unit, understand its process model, dependency graph, and target systemd version, then validate before changing lifecycle state. Hardening is a least-privilege exercise: test the real app with progressively narrower filesystem, identity, capability, and namespace access.
