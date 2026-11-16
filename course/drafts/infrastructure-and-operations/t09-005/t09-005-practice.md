# Linux shell permissions processes networking systemd and logs — Exercises and worked solutions

Sources: [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html), [path_resolution(7)](https://man7.org/linux/man-pages/man7/path_resolution.7.html), [systemd service manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), [systemd unit manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html), [systemctl manual](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html), and [journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).

## Goals

Practice diagnosis from evidence, safe shell construction, permissions reasoning, process handling, network-layer isolation, unit lifecycle, and incident timelines. Commands are examples; adapt paths, unit names, and time windows to a disposable Linux VM or container. Never run destructive permission/firewall exercises on a production host.

## Exercise 1: Preserve arguments and report pipeline failures

Write a Bash script that accepts a path containing spaces, verifies it is readable, counts matching lines with `grep`, and reports a clear error if the input is missing or `grep` cannot read it. Avoid `eval`; ensure the filename is not treated as a grep option. Explain why `set -e` alone is insufficient.

### Worked solution

```bash
#!/usr/bin/env bash
set -u
set -o pipefail

if (( $# != 1 )); then
  printf 'usage: %s FILE\n' "$0" >&2
  exit 64
fi
file=$1
if [[ ! -r $file ]]; then
  printf 'not readable: %s\n' "$file" >&2
  exit 66
fi

if count=$(grep -c -- 'MARKER' "$file"); then
  printf '%s\n' "$count"
else
  status=$?
  # grep returns 1 when there are no matches; distinguish that from an error.
  if (( status == 1 )); then
    printf '0\n'
  else
    printf 'grep failed (status %d)\n' "$status" >&2
    exit "$status"
  fi
fi
```

The quoted `"$file"` remains one argv element; `--` ends grep options. `grep -c` status 1 means zero matching lines, so domain semantics must distinguish “no matches” from read/usage error. `set -e` has conditional-context exceptions and would not express this distinction reliably. Test a filename with spaces and one beginning with `-`.

## Exercise 2: Diagnose a service permission failure

`example.service` runs as user `api`. It logs `Permission denied` opening `/srv/api/secrets/config.json`. The file shows owner `root`, group `api`, mode `0640`. Give a read-only diagnostic sequence and explain at least five possible causes before changing anything.

### Worked solution

```sh
systemctl status example.service
systemctl cat example.service
id api
namei -l /srv/api/secrets/config.json
stat -c '%A %a %U:%G %n' /srv/api/secrets/config.json
getfacl -p /srv/api /srv/api/secrets /srv/api/secrets/config.json
findmnt -T /srv/api/secrets/config.json
```

Then test access as the service identity without printing the secret: `sudo -u api -- test -r /srv/api/secrets/config.json; printf 'status=%s\n' "$?"`. Potential causes include missing directory search permission on a parent; wrong numeric UID/GID mapping; service has stale supplementary groups; ACL mask makes effective permission narrower; service mount namespace cannot see the path; read-only or inaccessible mount; SELinux/AppArmor denial; symlink target permission; or app opens a different relative path because `WorkingDirectory=` differs. Grant a narrow group/ACL/path permission only after identifying the failing layer. Do not display secret contents in diagnostic output.

## Exercise 3: A “stuck” process and a full descriptor limit

A service has low CPU, rising request failures, and `Too many open files`. `ps` shows it in state `S`; `ulimit -n` in your interactive shell is 1024. Explain what to inspect before restarting and why the shell limit does not prove the service has the same limit.

### Worked solution

Inspect unit and process identity/cgroup, service logs, effective limit, and descriptors:

```sh
systemctl show example.service -p MainPID -p ControlGroup -p LimitNOFILE
pid=$(systemctl show example.service -p MainPID --value)
cat "/proc/$pid/limits"
find "/proc/$pid/fd" -maxdepth 1 -type l | wc -l
lsof -p "$pid"
journalctl -u example.service --since '20 minutes ago'
```

`ulimit` describes the current shell and its inherited limits, not a separately launched manager service. Determine whether descriptors steadily grow, remain after requests, or are intentionally pooled. Check cgroup/service limits and system-wide pressure. If restarting is required to restore service, capture evidence first, then use `systemctl restart`; fix the leak or right-size a verified limit rather than treating a larger limit as a permanent repair. Do not dump descriptor targets if they may contain secret paths.

## Exercise 4: Works locally, fails from another machine

On a Linux host, `curl http://localhost:8080/health` succeeds, `ss -lntp` shows `127.0.0.1:8080`, and a remote client times out. List likely causes and a safe troubleshooting order. Explain how this differs inside a container.

### Worked solution

The listener is explicitly bound to IPv4 loopback, so remote hosts cannot connect directly. Confirm process/unit, then configure the application to bind to an intended interface or wildcard in its network namespace, and separately check host/cloud firewall, route/NAT, and security rules. Check whether `localhost` selected IPv6 (`::1`) for other tests. In a container, its loopback is container-local; publish/forward the port or attach networks deliberately, and make the app bind inside the container to an address reachable through that network. Validate from the remote client's actual network path with `curl -v` and inspect `ss`, routes, and firewall rules. Do not expose a debug/admin endpoint on all interfaces without authentication and access controls.

## Exercise 5: DNS appears contradictory

`dig api.internal.example` returns the new address, while the application still contacts the old address. Use a sequence to identify which resolver path the app follows. Explain why changing `/etc/resolv.conf` by hand may not last.

### Worked solution

Compare the app's namespace and resolver configuration with the host. Run `getent hosts api.internal.example` using the service identity/namespace; inspect `/etc/nsswitch.conf`, `/etc/hosts`, `/etc/resolv.conf` (including whether it is a symlink), and `resolvectl status/query` if systemd-resolved is active. `dig` may query a DNS server directly and bypass NSS, hosts-file order, app DNS cache, or container resolver. Compare A and AAAA records, TTLs, configured search domains, and caches. A network manager may regenerate `resolv.conf`; change the owning resolver configuration and reload/flush caches intentionally. Test the resulting socket and HTTP path after name resolution; DNS correctness alone does not imply reachability.

## Exercise 6: `systemctl` says active, but the API is unavailable

An operator ran `systemctl enable example.service`; the unit is active and `systemctl status` is green, but requests fail. Describe what enable/active establish, inspect the merged unit, and propose a complete health verification.

### Worked solution

`enable` configures later activation through install symlinks; it does not prove the current process is ready. `active` means systemd's unit state is active according to its service type. Inspect `systemctl cat`, `systemctl show`, `journalctl -u`, process identity, cgroup, working directory, environment files, and `ss -lntp`. Test name resolution, route, expected bind address, firewall and TLS from the same network vantage as the client. Call the real health endpoint and, where relevant, make a representative authenticated request. A `Type=exec` service can be active while its app initialization or dependency is failing. Add a real readiness/health mechanism; do not rely on a green status label alone.

## Exercise 7: Reconstruct a restart incident

At 10:04 UTC users report 502s. A deployment finished 10:01; service restart is logged at 10:02; the current boot has been up for three days. Show a reproducible query set and identify evidence that may be missing.

### Worked solution

```sh
journalctl --list-boots
journalctl -u example.service --since '2026-11-16 09:55:00 UTC' \
  --until '2026-11-16 10:10:00 UTC' -o short-iso-precise
journalctl -k --since '2026-11-16 09:55:00 UTC' \
  --until '2026-11-16 10:10:00 UTC'
systemctl show example.service -p InvocationID -p NRestarts -p Result -p ExecMainStatus
```

Correlate deployment ID/release symlink, unit invocation, process start/exit, application error, kernel/OOM, resource metrics, network probe and client-side 502. Check clock offset, log rate limiting, retention/rotation, other units/proxy logs, and whether the deploy event's timestamp is in UTC. Current status may no longer expose the failed invocation. State what is unknown; temporal correlation is not yet causation.

## Exercise 8: Design a robust service unit change

You need to add a writable state directory, restrict the service's access to home directories, enable automatic restart after crashes, and avoid all application instances restarting simultaneously after a regional outage. Give a safe change-and-rollout checklist; target hosts may run older systemd.

### Worked solution

Use a unit drop-in rather than editing a packaged base file. Confirm the application needs exactly which state path and create/own it narrowly. Consider `ProtectSystem=strict`, `ProtectHome=yes`, `ReadWritePaths=/var/lib/example`, `NoNewPrivileges=yes`, and an appropriate dedicated `User=`. Choose `Restart=on-failure`, a bounded `RestartSec=`, and `RestartRandomizedDelaySec=` only after verifying systemd 262+ compatibility on each host; older versions may reject the directive. Use a version-aware configuration rollout or separate compatible drop-ins. Run `systemd-analyze verify`, inspect `systemctl cat`, stage on one host, reload manager, restart in a safe window, then verify write behavior, readiness, logs, and restart rate. Keep a tested rollback. Jitter reduces synchronized restart pressure; it does not replace backoff, capacity planning, or circuit breaking.

## Worked example

Exercise 4 demonstrates why “localhost succeeds” is a narrow observation: the process is bound only to loopback. The correct next step is to compare listener scope and namespace, not immediately disable the firewall.

## Exercises

The eight numbered scenarios progress from safe shell arguments and permission checks to resource limits, network namespaces, resolver differences, service lifecycle, incident timelines, and fleet-safe unit rollout.

## Progressive hints

1. For shell arguments, ask what exact argv the child receives and what each exit code means.
2. For access errors, inspect the process identity and every ancestor, not just the leaf mode.
3. For resource exhaustion, compare the service process's own limits and open descriptors.
4. For localhost behavior, identify which network namespace owns the listener.
5. For DNS disagreement, compare NSS and direct DNS in the same environment.
6. For active services, distinguish process-manager state from application readiness.
7. For timelines, capture bounded records before resetting or restarting.
8. For fleet restarts, confirm directive support on all target manager versions.

## Complete solutions

Each exercise above includes a worked answer, commands or decision sequence, interpretation, and the safety boundary. The correct response is the reasoning and evidence path, not blind execution of a copied command.

## Tests and edge cases

Try paths with spaces and leading dashes, no matching grep lines, missing parent search permission, stale supplementary groups, and ACL masks. Compare host versus container loopback, DNS A versus AAAA, and a successful ICMP probe with blocked TCP. Check previous-boot logs, service restart counters, a missing unit directive on an older systemd, and a disk-full journal. Use test resources only; do not probe or change systems without authorization.

## Reflection questions

- Which observation in each exercise narrows the hypotheses most, and what does it still fail to prove?
- When is immediate restart justified even if it loses evidence? How would you record that tradeoff?
- How would you adapt DNS, cgroup, and service-manager exercises on a non-systemd distribution?

## Review checklist

- Did I distinguish observation from hypothesis and identify the relevant host/namespace/user?
- Did I preserve argv and shell status instead of using `eval` or assuming `set -e`?
- Did I inspect all parent path permissions, effective credentials, ACL mask, and mount policy?
- Did I confirm PID and cgroup before a signal, and capture evidence before restart?
- Did I test DNS, route, listener, firewall, TLS, and application separately?
- Did I distinguish systemd activation, ordering, process state, and readiness?
- Did I preserve timestamps, boot/invocation identity, and sensitive log data?
