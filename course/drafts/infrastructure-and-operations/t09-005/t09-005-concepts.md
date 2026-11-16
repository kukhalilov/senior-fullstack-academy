# Linux shell permissions processes networking systemd and logs — Core concepts and how they fit together

Sources: [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html), [credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html), [path_resolution(7)](https://man7.org/linux/man-pages/man7/path_resolution.7.html), [signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html), [systemd unit manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html), [systemd service manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), and [journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).

## Learning objectives

Explain how shell parsing produces an argument vector; reason about file descriptor flow, identities, path permissions, process states, sockets, unit dependencies, and log evidence; choose a diagnostic sequence that distinguishes failure layers; and make minimal, reversible changes.

## Prerequisites

Know basic command-line navigation, files, environment variables, IP addresses and ports, and the idea that a process is a running program. No administration experience is assumed. Use a disposable Linux VM/container; some commands require elevated privileges and may be unavailable on managed hosts.

## Core concepts

Suppose a web process is expected to serve `https://example.test`. The shell used for deployment resolves `deploy`, expands variables, and launches a command with a particular environment and working directory. The process receives real/effective credentials and inherited file descriptors. The service manager determines when it starts, whether its child remains supervised, and what happens after exit. The process binds a socket in its network namespace. DNS and routes determine where clients send packets; firewall policy and TLS determine whether the connection succeeds. Logs provide records, but only if their clock, retention, and metadata are understood.

This path is a dependency graph, not a single “server is up” flag. A local `curl http://127.0.0.1:8080/health` proves a different path from an external HTTPS request. Record the exact source host, destination, protocol, time, and namespace for every test.

## Mechanisms and relationships

The same request crosses process, filesystem, network, service-manager, and logging boundaries. A failure message is emitted at one boundary but may be caused upstream. For example, an app's “connection refused” may arise because the service never bound its port, while “timeout” may point toward a dropped packet or a stalled handler. Neither message alone identifies root cause.

## Worked examples

If `systemctl status` says active but `ss -lntp` shows no expected listener, check the service type, main PID, app startup logs, bind configuration, and namespace before changing firewall rules. If a process can read a file in an interactive shell but not as a unit, compare `id`, `WorkingDirectory=`, environment, mount namespace, ACLs, and each parent directory. If `dig` succeeds but the app uses an old address, compare its NSS resolver path, caches, A/AAAA results, and actual remote socket.

## Misconceptions and edge cases

- `systemctl enable` and `systemctl start` change different state.
- Read permission on a file does not bypass missing search permission on a parent directory.
- A process in D state can retain pending signals while waiting in the kernel.
- `set -e` does not provide reliable exception semantics for every Bash control-flow context.
- A successful local probe may use a different interface, resolver, firewall path, and namespace from the failing client.
- Logs can be missing because of volatile storage, rate limiting, rotation, clock skew, or access controls.

## Knowledge checks with answers

1. Why does `After=network.target` not prove the network is online? **It orders unit jobs and does not guarantee connectivity or remote application readiness.**
2. What does `0.0.0.0` mean for a listener? **Bind all local IPv4 addresses in that namespace; it is not a remote destination nor proof of reachability.**
3. Why can `chmod 640 file` still leave a service unable to read it? **Parent path traversal, effective UID/GID, ACL mask, mount/namespace, or mandatory access controls may deny access.**
4. What does a zombie need? **Its parent or adopter must reap its exit status; signals cannot terminate an already-exited task.**
5. What is the difference between active and healthy? **Active is manager lifecycle state; health requires an application-level check.**

## One request, end to end

The shell first parses syntax and performs expansions, then forms words/arguments, applies redirections, and runs builtins or external programs. Quoting changes parsing, not merely appearance: `"$value"` usually preserves one argument; unquoted `$value` may split into several words and undergo glob expansion. Redirection is applied left to right: `cmd >out 2>&1` sends both streams to `out`, while `cmd 2>&1 >out` leaves stderr on the original stdout destination.

A pipeline connects one process's stdout to another's stdin. By default Bash reports the last command's status; `set -o pipefail` makes a pipeline fail if any command fails, but does not make every shell construct safe. `set -e` has context-dependent exceptions (including tests in conditions and parts of pipelines); use explicit status checks for critical operations. `SIGTERM` asks a process to stop, while `SIGKILL` cannot be caught or cleaned up. A zombie is already terminated and awaiting its parent to reap its exit status.

## Shells and processes

The shell first parses syntax and performs expansions, then forms words/arguments, applies redirections, and runs builtins or external programs. Quoting changes parsing, not merely appearance: `"$value"` usually preserves one argument; unquoted `$value` may split into several words and undergo glob expansion. Redirection is applied left to right: `cmd >out 2>&1` sends both streams to `out`, while `cmd 2>&1 >out` leaves stderr on the original stdout destination.

A pipeline connects one process's stdout to another's stdin. By default Bash reports the last command's status; `set -o pipefail` makes a pipeline fail if any command fails, but does not make every shell construct safe. `set -e` has context-dependent exceptions (including tests in conditions and parts of pipelines); use explicit status checks for critical operations. `SIGTERM` asks a process to stop, while `SIGKILL` cannot be caught or cleaned up. A zombie is already terminated and awaiting its parent to reap its exit status.

## Identity and filesystem access

Linux checks a process's credentials against each path component. For a file, read/write/execute govern content access. For a directory, read lists names, write changes directory entries, and execute searches/traverses names; reaching a file requires search permission along the path. Owner/group/other mode bits and ACLs interact; an ACL mask can limit named-user and group-class effective rights. `umask` removes permissions from newly requested mode bits; it does not retroactively change existing files. Symlinks resolve through another path; hard links are additional names for the same inode and generally cannot cross filesystems.

Elevation changes authority, not correctness. `sudo -u` selects a target identity under policy; `sudo -i` creates a login-like root environment. Quoting, path validation, and least privilege remain necessary. Avoid `chmod -R 777` and blind recursive ownership changes: they can expose secrets, break deployment ownership, or follow assumptions that do not match the filesystem.

## Networking and evidence

Test link/address, route, resolver, socket, firewall, TLS, and application in order. `getent hosts` follows the host's configured name service path; `dig` asks DNS directly and may not reproduce NSS or local hosts-file behavior. A wildcard bind such as `0.0.0.0` listens on IPv4 interfaces in that namespace; it is not a promise that the service is externally reachable. `localhost` refers to the current network namespace. A ping tests ICMP reachability where allowed, not TCP or HTTP health.

`systemctl enable` arranges activation at a later boot/target; `start` requests runtime activation now. `After=` establishes ordering only; it does not pull another unit in. `Wants=` and `Requires=` express different dependency strengths and neither guarantees an application-level dependency is ready. A restart can restore service but erase transient evidence, so capture status and logs first when practical.

The journal stores structured records with metadata and cursors. Query by unit, boot, priority, and time; compare application timestamps with host clock/time zone and deployment events. Logs can be rate-limited, volatile, forwarded, rotated, or incomplete. Treat them as evidence with provenance, not as a complete recording of reality.

## Operational decision procedure

1. State the expected behavior and reproduce with a bounded, read-only probe.
2. Identify the exact process, user, unit, namespace, path, socket, and time involved.
3. Inspect the nearest failing boundary and one adjacent layer on each side.
4. Change the smallest configuration or permission needed; validate syntax before reload/restart.
5. Verify from the original client path, inspect logs after the change, and write down rollback and remaining uncertainty.

## Common reasoning failures

- Treating command text as a string instead of shell syntax plus argv and file descriptors.
- Assuming root fixes path, mount, ACL, namespace, or read-only filesystem problems.
- Killing every process matching a broad pattern before confirming PID and ownership.
- Concluding a port is available because `ps` shows the expected process; inspect the actual socket and bind address.
- Treating `systemctl active` as application readiness; add a meaningful health check.
- Reading only the newest error without the earlier failure, restart, or boot context.
