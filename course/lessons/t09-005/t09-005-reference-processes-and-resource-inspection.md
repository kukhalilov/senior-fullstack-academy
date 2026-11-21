# Linux shell permissions processes networking systemd and logs — Reference: Process identities, lifecycle, signals, jobs, resource usage, and procfs

Sources: [credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html), [proc_pid_status(5)](https://man7.org/linux/man-pages/man5/proc_pid_status.5.html), [ps(1)](https://man7.org/linux/man-pages/man1/ps.1.html), and [signal(7)](https://man7.org/linux/man-pages/man7/signal.7.html).

## Scope and version

This reference describes Linux process observations and common procfs tools. Kernel versions, procfs mount options, permissions, container PID namespaces, and tool implementations can change what is visible. Treat a PID as a time-sensitive identifier: it can be reused after a process exits.

## How this group fits the mental model

A process is an executing program with credentials, memory, open descriptors, signal state, and scheduling/resource constraints. A command name alone is weak evidence. Confirm PID, start time, executable, parent, identity, and cgroup before sending a signal. Prefer graceful application or service-manager shutdown, then escalate deliberately.

## Supplied names explained

### Identity, hierarchy, and procfs

- **Process ID (PID)** — Kernel identifier for a process in a PID namespace; it can be reused, so avoid delayed actions based only on a stale number.
- **Parent process ID (PPID)** — PID of the process that created/reparented this process; the parent normally collects its terminated child's status.
- **Process tree** — Parent/child relationship view (e.g. `ps -ef --forest`, `pstree`); it is a snapshot and may omit processes hidden by namespaces or access controls.
- **Thread group ID (TGID)** — Linux identifier commonly shown as the process PID for a multithreaded process; individual threads have distinct task IDs.
- **Real UID** — User identity associated with the process origin/authentication context; exact authorization uses multiple credential fields.
- **Effective UID** — User ID used for many discretionary permission checks. It can differ from real UID after set-ID execution or credential changes.
- **Saved UID** — Saved set-user-ID used by programs to regain a prior effective identity after temporarily dropping privilege; inspect credentials carefully in privileged software.
- **Real GID** — Group identity analogous to real UID.
- **Effective GID** — Group used for many permission checks; supplementary groups are also relevant.
- **Process environment** — Key/value strings inherited at creation and possibly modified by the process; may expose secrets through `/proc` or diagnostics, depending on permissions.
- **Process working directory** — Per-process current directory, visible through `/proc/<pid>/cwd` when permitted; relative path resolution depends on it.
- /proc filesystem — Kernel-provided virtual view of processes and system state. It is not ordinary persistent files; entries are generated and access may be restricted.
- **`/proc/<pid>/status`** — Human-readable status including IDs, state, threads, memory, and capabilities. Fields can vary with kernel version; parse machine-facing interfaces cautiously.

### Process states and job control

- **Process state R** — Running or runnable (eligible to run). A short snapshot does not imply high CPU consumption.
- **Process state S** — Interruptible sleep, commonly waiting for an event; this is normal for idle services.
- **Process state D** — Uninterruptible sleep, typically waiting in kernel I/O. Signals may remain pending until the wait completes; SIGKILL is not an immediate cure for a stuck device/filesystem.
- **Process state T** — Stopped, usually by job control or a stop signal; `SIGCONT` can resume it.
- **Process state Z (zombie)** — Process has exited, but its parent has not collected status. It consumes a process-table entry, not normal execution resources; signaling the zombie cannot make it exit again.
- **Process state I (idle)** — Idle kernel thread state on Linux; interpretation depends on kernel and `ps` formatting.
- **Zombie process reaping** — Parent calls a wait operation to collect child termination status. Diagnose/fix the parent or allow reparenting/reaping; do not repeatedly kill the zombie.
- **Orphan process** — A process whose parent exited; it is adopted by a subreaper or PID 1 in its namespace and can continue running normally.
- **Foreground process** — Shell job currently associated with terminal input and terminal-generated signals such as Ctrl-C.
- **Background process** — Shell job not currently occupying terminal foreground; it may still receive terminal-related errors/signals if it tries to read or the session closes.
- **Bash job control** — Shell management of pipelines/process groups through terminal foreground/background state; differs from systemd supervision.
- **`jobs`** — Bash builtin listing jobs known to the current shell; it does not list all system processes.
- **`fg`** — Brings a shell job into foreground and gives it terminal control.
- **`bg`** — Resumes a stopped job in background; it does not detach it from the shell session.
- **`wait`** — Bash builtin waits for child jobs and returns status; use it to collect asynchronous pipeline/job results.
- **PID process group** — Group ID used to deliver terminal signals and manage related processes. A negative PID with `kill` targets a process group, so verify the group carefully.
- **Session ID** — Groups process groups, often tied to a login/terminal session; `setsid` and service managers affect session relationships.

### Signals and inspection tools

- **Signal** — Asynchronous notification to a process. Some signals can be handled, blocked, or ignored; `SIGKILL` and `SIGSTOP` cannot.
- **`SIGTERM`** — Conventional graceful termination request. Applications can flush state and exit, but are not required to comply.
- **`SIGKILL`** — Uncatchable immediate termination request when deliverable; use only after graceful shutdown and identity confirmation. It cannot fix a task stuck in uninterruptible kernel wait.
- **`SIGINT`** — Interrupt signal commonly generated for the terminal foreground group by Ctrl-C; behavior depends on handlers and terminal settings.
- **`SIGHUP`** — Historically terminal hangup; some daemons use it to reload configuration. Never assume its meaning without the program's contract.
- **`SIGSTOP`** — Uncatchable stop; process does not run until continued or killed.
- **`SIGCONT`** — Continue a stopped process; may also notify a process already running.
- **`kill`** — Sends a signal to PID or process group; despite the name, default signal is TERM. Check the target and signal syntax before use.
- **`pkill`** — Selects processes by pattern/attributes and signals them. Broad patterns can hit unrelated processes; preview with `pgrep -a` and constrain user/cgroup.
- **`pgrep`** — Searches process table by criteria; output is still a snapshot and names may be truncated unless options request full command lines.
- **`ps`** — Snapshot of process attributes. Choose explicit columns, such as PID/PPID/user/state/elapsed/command, and beware output format differences.
- **`top`** — Interactive process and system resource monitor; CPU percentages depend on interval and multi-core convention.
- **`htop`** — Optional interactive monitor with richer navigation; may not be installed or available in minimal/container images.
- **`free`** — Summarizes memory and swap, including reclaimable cache; “used” memory alone is not a reliable pressure diagnosis.
- **`uptime`** — Shows uptime, logged-in users, and load averages. Load includes runnable and some uninterruptible tasks, not just CPU utilization.
- **`nice`** — Starts a process with a CPU scheduling nice value; it is not a hard resource cap and does not directly set I/O priority.
- **`renice`** — Changes nice value of existing processes subject to privilege and scheduler rules; it does not fix blocking I/O or memory pressure.
- **`ulimit`** — Bash builtin that reads/sets resource limits for the shell and children; soft/hard limit behavior and units vary by resource.
- **Resource limit (rlimit)** — Per-process limit such as open file count or address space, inherited by children; distinct from cgroup aggregate controls.
- **File descriptor leak** — Unintended retained descriptors can exhaust per-process/system limits or keep pipes/files/sockets alive. Compare `/proc/<pid>/fd`, `lsof`, and open-file limits.
- **Out-of-memory kill** — Kernel may kill a process under memory pressure or cgroup OOM; inspect kernel/journal evidence and cgroup counters rather than guessing from a restart.
- **cgroup resource limit** — Control-group limits/accounting for a process group (CPU, memory, I/O, pids); services and containers often use cgroups. A process can be constrained despite host-wide free resources.
- **`strace`** — Traces system calls and signals for a process. It can expose arguments, paths, and secrets and perturb timing; use narrowly with authorization.
- **`lsof`** — Lists open files/sockets by process; may be absent or permission-limited and can produce a large snapshot.

## Safe inspection and escalation

```sh
ps -eo pid,ppid,user,uid,stat,lstart,etime,cmd --sort=-%cpu | head
cat /proc/1234/status
readlink /proc/1234/cwd
ls -l /proc/1234/fd
```

Replace `1234` only after confirming the current process and service. For a managed service, collect `systemctl status NAME`, then ask systemd to stop/restart it. For a shell job, use `jobs -l`, `fg`/`wait`, or send TERM to a confirmed PID. If escalation to KILL is necessary, record why graceful shutdown failed and check dependent state afterward.

## Cross-item comparison

| State/tool | What it tells you | What it does not prove |
|---|---|---|
| `R`/`S`/`D` | Scheduler or wait state snapshot | Root cause or service health |
| `Z` | Process exited, awaiting reap | That KILL can remove it |
| `ps`/`top` | Snapshot of process/resource data | Complete cgroup or historical view |
| `ulimit` | Shell/process resource limit | The systemd unit's configured limit |
| `strace`/`lsof` | Syscall or open-resource evidence | Safe disclosure; outputs can be sensitive |

## Examples

If `pgrep -a -u app server` identifies a candidate, confirm its PID start time, executable, parent and cgroup with `ps`/`/proc` before signaling. To distinguish a zombie from a blocked process, inspect the state and parent: a zombie is already exited, while `D` is waiting in the kernel. A descriptor leak hypothesis is stronger when descriptor count grows with requests and remains high after requests complete.

## Common mistakes

PID namespaces mean host and container PIDs differ. A process in state D is not necessarily CPU-busy. Zombie versus orphan are different lifecycle conditions. `kill -0 PID` checks existence/permission, not application health. `ulimit -n` and a cgroup's PID limit are separate constraints. `strace` and `/proc` inspection can reveal credentials; protect captured output.

## Knowledge checks with answers

1. Can a zombie be terminated with SIGKILL? **No; it has already exited and needs reaping.**
2. Does `kill -0` prove the service is healthy? **No; it checks existence/permission for a signal operation, not behavior.**
3. Why compare cgroup memory with host memory? **A cgroup can hit its own limit while the host still has free memory.**
4. What should happen before `pkill`? **Preview the exact matching processes and constrain selection by identity/context.**

## Summary

Use process identity, state, hierarchy, resources, and cgroup context together. Read-only inspection precedes action; TERM precedes KILL; and service-manager controls are usually safer than pattern-based termination.
