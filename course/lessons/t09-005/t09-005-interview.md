# Linux shell permissions processes networking systemd and logs — Interview questions and reasoning

Sources: [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html), [credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html), [signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html), [systemd unit manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html), [systemd service manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), and [journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).

## Core questions

### 1. A shell command works manually but fails in a service. What do you compare?

Compare executable and argv, interpreter, PATH, environment, user and supplementary groups, working directory, umask, limits, inherited descriptors, namespace, and startup files. A service generally does not inherit an interactive login environment. Inspect the merged unit and process environment carefully because it may contain secrets. Reproduce as the service identity and with the same paths; do not “fix” it by running the service as root without identifying the missing requirement.

### 2. Why can `cmd >out 2>&1` differ from `cmd 2>&1 >out`?

Redirections apply left to right. In the first command, stdout is opened to `out`, then stderr duplicates that new stdout. In the second, stderr first duplicates the original stdout; then only stdout moves to the file. File-descriptor duplication copies the current destination; it is not a symbolic link that follows later changes.

### 3. Is `set -euo pipefail` enough to make Bash safe?

No. `-u` detects many unset expansions, and `pipefail` exposes upstream pipeline failures, but `-e` has context-dependent exceptions and does not validate input, quote expansions, prevent injection, or define what a nonzero result means. Use arrays and quoting, explicit checks around critical commands, deliberate cleanup traps, and tests for empty values, spaces, globs, and failures.

### 4. What does directory execute permission mean, and why is read not enough?

Directory execute means search/traversal: resolve a known child name. Read allows listing directory names. To open a file by path, search permission is generally needed on each parent directory, and then the file's permission and other policy are checked. Diagnose the complete path, not only the final file's mode.

### 5. What is the difference between mode bits and an ACL?

Mode bits provide owner/group/other classes. An extended POSIX ACL adds named users/groups; the ACL mask limits effective permissions for the group class entries. `chmod` can update the ACL mask, so a displayed named entry may promise less effective access than its raw bits suggest. ACLs do not override mount, namespace, or mandatory access controls.

### 6. Why can’t SIGKILL remove a zombie?

A zombie has already exited. The kernel retains its PID and exit status until the parent (or adopting subreaper/init) calls a wait operation. Signals cannot make a terminated process exit again. Investigate the parent and reaping behavior; killing the parent may only transfer cleanup responsibility.

### 7. A process is in D state. What does that tell you?

It is in uninterruptible sleep, often waiting on kernel I/O. The state does not by itself identify the device or prove permanent deadlock. Inspect kernel logs, storage/network filesystem health, blocked task stack where authorized, and dependencies. Signals can remain pending until the wait returns; repeated SIGKILL is not a repair.

### 8. How do TERM, KILL, and STOP differ?

TERM is a catchable graceful termination request; KILL cannot be caught or ignored and terminates when deliverable; STOP suspends execution and cannot be caught, while CONT resumes. Confirm the exact PID or process group first. Prefer service-manager/application shutdown because it can preserve cleanup and cgroup accounting.

### 9. Why does `ping` succeed while the API is down?

Ping tests ICMP to an address, not TCP port acceptance, TLS identity, HTTP routing, authentication, or application dependencies. ICMP may also be filtered independently. Probe the actual protocol and endpoint from the failing client's network path, then inspect listener and application evidence.

### 10. `localhost` works in a container but the host cannot connect. Explain.

Loopback is namespace-local. A service bound to container `127.0.0.1` is not reachable through the container's external interface; host port publication cannot change what address the process listens on. Bind to an appropriate container interface, publish/firewall narrowly, and verify the route and listener from both namespaces.

### 11. Why can `dig` and an application return different IP addresses?

`dig` performs DNS queries using selected DNS servers; an application commonly uses libc/NSS, which can include `/etc/hosts`, mDNS/LDAP modules, a local stub, search domains, caches, and application-level caching. Compare from the same namespace and identity, inspect resolver config/NSS order and A/AAAA answers, and observe the actual connection destination.

### 12. What is the difference between `After=`, `Wants=`, and `Requires=`?

`After=` orders jobs only when both are present; it does not pull in the other unit or wait for application readiness. `Wants=` pulls in a weak dependency whose failure generally does not fail this unit. `Requires=` is a stronger activation dependency, but ordering still needs an ordering directive. Readiness is an application protocol/health check, not implied by unit ordering.

### 13. What does `enable` do, and how is it different from `start`?

Enable creates install symlinks according to `[Install]`, arranging future activation by a target. Start requests activation now. A unit can be enabled but stopped, or running but disabled. `enable --now` requests both; `disable` does not necessarily stop a running process.

### 14. Is systemd `active` equivalent to application healthy?

No. It means the service manager's state machine considers the unit active based on configured type and notifications. `Type=exec` confirms executable launch, not full initialization; `Type=notify` can signal readiness if the application implements the protocol, but health can degrade afterward. Verify a meaningful endpoint and dependencies.

### 15. What is different between `Type=simple`, `exec`, `forking`, and `notify`?

Simple treats the service as started early after process creation; exec waits until execution succeeds; forking expects a daemon to fork and needs reliable main-PID tracking; notify waits for an explicit readiness message. Choose the type matching the program's lifecycle and supported protocol, and check minimum systemd version. None alone guarantees ongoing request health.

### 16. How do you troubleshoot a service restart loop without losing evidence?

Capture `systemctl status/show/cat`, recent unit logs, invocation ID, `NRestarts`, exit status, cgroup/process state, resource limits, and kernel/OOM evidence before clearing failed state or restarting. Compare deployment/config changes and dependency health. Then fix one cause, validate the unit, roll out with rollback, and monitor restart rate and readiness. `reset-failed` only clears state/counters.

### 17. What does `RestartRandomizedDelaySec=` solve, and what does it not solve?

On systemd 262+, it adds a uniformly random delay within a configured bound to automatic restart timing, helping spread simultaneous failures across service instances. It does not provide exponential backoff by itself, fix bad health checks, prevent overload, guarantee capacity, or exist on older managers. Verify version and combine with bounded restart policy and application-level resilience.

### 18. How do you harden a service without breaking it?

Establish actual file, identity, capability, network, and writable-path requirements first. Run with a dedicated user, then progressively add controls such as `NoNewPrivileges=`, `ProtectSystem=`, `ProtectHome=`, `PrivateTmp=`, capability bounding, and explicit writable paths. Test startup, upgrades, logs, and failure paths on the target version. Hardening directives reduce access but do not equal a complete container/VM security boundary.

### 19. How do you build an incident timeline from logs?

Bound the time range, include boot ID and service invocation, normalize to UTC while preserving offsets, correlate service/application/proxy/kernel/deploy/client records, and check clock drift, rotation, retention, rate limiting, and missing sources. Treat timestamps as observations with uncertainty; correlation alone does not prove cause. Restrict and redact collected data.

### 20. Which evidence should you collect before restarting a failing process?

Record unit state and merged configuration, PID/start time/identity/cgroup, process state and resource use, open descriptors where safe, listener addresses, recent logs, request/health symptoms, and relevant time/deployment context. Avoid collecting secret values unnecessarily. A restart may restore service but destroys transient state and is not a root-cause analysis.

## Concise interview answers

| Prompt | Core answer in one sentence |
|---|---|
| Why does a local request work but remote fail? | Check bind scope, namespace, and the remote route/filter path. |
| What does `enable` mean? | Install future activation links; it does not necessarily start the unit now. |
| Why quote a shell variable? | Preserve argument boundaries and prevent splitting/globbing. |
| Can KILL remove a zombie? | No; it has exited and must be reaped by its parent/adopter. |
| What does `After=` guarantee? | Ordering only when both unit jobs participate, not startup or readiness. |

## Deep follow-up answers

Interviewers may ask what the first probe proves, what it does not prove, and what evidence changes your next step. State the vantage point, identity, namespace, time, and version. For example, `ss` proves a socket exists in the inspected namespace at that instant; it does not prove firewall reachability or TLS. `Type=notify` is a readiness contract only if the application sends correct notifications. A systemd `Restart=` policy acts on process outcomes, not HTTP health, unless the app converts health failure into a supervised process outcome.

For shell correctness, explain that the shell constructs argv and descriptors before exec; quotes are syntax that affects expansion, not characters passed to the program. For permissions, explain identity plus path traversal and ACL mask before proposing a mode change. For incident response, explain service restoration versus evidence preservation as competing priorities and document an emergency restart.

## Scenario questions

“After deploy, the API returns connection refused from one subnet, timeout from another, and works on localhost. The unit is active. Walk me through your diagnosis.”

## Strong scenario approach

Clarify exact host, client subnet, name/IP, port/protocol, timestamp, and recent changes. From the service namespace verify process, bind address, and socket (`systemctl`, `ss`). Check host and cloud route/filter/NAT differences for each subnet. Verify DNS answers and TLS/HTTP separately. Compare probes from host, container, and each client vantage. Inspect unit logs and invocation/deploy IDs for startup errors. Avoid restarting until capturing transient evidence unless service restoration urgency requires it; if restarted, record the action and compare before/after. Finish with a narrowly scoped, reversible fix and an externally observed health check.

## Tradeoffs and alternatives

| Choice | Benefit | Cost or alternative |
|---|---|---|
| Restart now | May restore availability quickly | Loses transient state; capture first when time allows |
| `strace`/packet capture | Reveals syscall/packet behavior | Performance and sensitive-data exposure; use narrow filters |
| Direct DNS query | Isolates DNS server response | Does not reproduce application NSS/cache behavior |
| Strong sandboxing | Reduces blast radius | More configuration/testing; stage progressively |
| Fixed restart delay | Predictable recovery timing | Fleet synchronization; add supported jitter/backoff |
| Full root service | May avoid immediate permission friction | Very broad blast radius; prefer dedicated identity/capabilities |

## Common weak answers

- “Just restart it” without recording status, logs, deployment ID, or reason for urgency.
- “Open the firewall” before proving a listener exists and identifying the failing network segment.
- “The file is readable because `ls -l` shows 644” without checking parent directories, service UID, ACLs, and namespace.
- “systemd starts it after the network” without distinguishing ordering from connectivity/readiness.
- “Ping works, so the server is reachable” without testing the actual TCP/TLS/application path.
- “Use `chmod 777`” rather than diagnosing and granting narrow access.

## Self-check rubric

Score each answer from 0 to 2: **0** guesses or proposes a broad risky change; **1** names relevant commands but confuses what they prove; **2** gives a layered hypothesis, a discriminating read-only probe, its limits, a minimal reversible fix, and verification/rollback. A strong senior answer consistently states identity, namespace, vantage point, version constraints, and evidence preservation needs.

## Answering well in interviews

Say what evidence would distinguish hypotheses, not only a command list. Explain what a probe proves and does not prove. Name the identity and network vantage. Include version constraints for newer directives. A strong operator protects users and evidence while restoring service, then investigates the underlying cause.
