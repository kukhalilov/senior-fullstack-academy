# Linux shell permissions processes networking systemd and logs — Big-picture orientation and mental model

Sources: [GNU Bash Reference Manual](https://www.gnu.org/software/bash/manual/bash.html), [Linux man-pages project](https://man7.org/linux/man-pages/), [systemd service unit manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.service.html), [systemd unit manual](https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html), and [journalctl manual](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html).

## Problem and purpose

Linux operations work is the practice of establishing what a program is doing, what identity and resources it has, how it can communicate, how it is started, and what evidence explains its behavior. This module builds the mental model behind commands such as `ps`, `ss`, `systemctl`, and `journalctl`; memorizing commands without the model often leads to changing the wrong layer.

## Plain-language mental model

Treat an application as a process with an identity, environment, current directory, open file descriptors, resource limits, and network namespace. A shell constructs arguments and connects file descriptors. The kernel applies permissions and schedules the process. A service manager such as systemd supervises long-running processes. The network stack resolves names, chooses routes, applies packet filters, and delivers traffic to sockets. Logs preserve observations from several of these layers.

An incident is a chain of hypotheses. “The site is down” may mean the process exited, it is listening only on loopback, DNS points elsewhere, a firewall blocks the port, TLS validation fails, or the app returns an error. Test from the nearest layer outward and keep each observation separate from the conclusion.

## Concept map

| Layer | Question | Useful evidence |
|---|---|---|
| Shell and command | What exact program and arguments ran? | `command -v`, quoted command, exit status, stdout/stderr |
| Identity and filesystem | Which user/group and path permissions apply? | `id`, `namei -l`, `stat`, `getfacl` |
| Process and resources | Is it running, blocked, stopped, or out of resources? | `ps`, `/proc/<pid>/status`, `top`, `free`, `ulimit` |
| Network | Which address/route/name/socket/TLS step fails? | `ip`, `getent`, `ss`, `curl`, `openssl s_client` |
| Service lifecycle | What did the manager start, and under what policy? | `systemctl status`, `cat`, `show`, unit and drop-ins |
| Logs and timeline | What happened before and after the failure? | `journalctl` selectors, boot, invocation ID, app logs |

## How the parts fit together

1. Record host, time zone, time window, deployment/change, and user-visible symptom. Do not paste credentials or personal data into shared notes.
2. Read before changing: `systemctl status app.service`, `systemctl cat app.service`, `journalctl -u app.service --since '15 minutes ago'`, `ps`, `ss -lntup`, and relevant app health output.
3. Separate facts from hypotheses. “No listener on port 8080” is a fact from one host and namespace at one time; it does not by itself explain why.
4. Trace a request in order: name resolution → address and route → firewall → listener/bind address → TLS → HTTP/application. Verify from the same network location as the failing client when possible.
5. Change one reversible variable at a time, capture the before/after evidence, and define rollback. A successful restart can hide a leak or race; investigate the original failure too.

## End-to-end walkthrough

For a failed request, note its time and client. Resolve the same hostname through the service/client's configured resolver; check the selected address and route; inspect whether the process is listening on that address and port; test firewall/TLS/HTTP from the same network path; then correlate the result with service state and a bounded log interval. If the unit never started, trace its executable, identity, working directory, dependency, and exit status. If it is running but cannot read a file, inspect its credentials and every path component. Each observation narrows the next question.

## When to use it and tradeoffs

Use this toolkit for deployment failures, service instability, resource exhaustion, permission errors, and Linux host/network diagnosis. Read-only inspection is low risk but can still reveal secrets; packet captures, process tracing, and environment inspection need additional care. Restarts can restore availability quickly but discard transient state. Hardening can reduce blast radius but may break undocumented app behavior; stage and verify changes.

## What later lessons cover

Start with command construction and streams, then filesystem identity and permissions, then processes and resource inspection. Apply those concepts to sockets and DNS. Learn systemd lifecycle after understanding the process it supervises, and finish with journald and incident reconstruction. The references enumerate the supplied Bash, Linux, networking, systemd, and logging names; the overview exists so you can understand their relationships without studying every command in isolation.

## Version and platform scope

The references were checked against Bash 5.3, systemd 262.2, and Linux man-pages 6.19 on 2026-11-20. Those versions are upstream documentation baselines, not a claim that every distribution ships them. Check `bash --version`, `systemd --version`, and local manual pages before using a newer option. Debian-like, Fedora/RHEL-like, Alpine, and container environments differ in paths, packages, default firewall tools, logging, and service-manager availability.

## Readiness check

Before continuing, explain why an enabled service may be stopped; why a successful ping does not prove HTTP works; why a directory needs execute/search permission; why `SIGKILL` cannot remove a zombie; and why the order of `2>&1` and `>` matters. If you cannot yet, read the concepts lesson and use the reference examples as experiments in a disposable VM.
