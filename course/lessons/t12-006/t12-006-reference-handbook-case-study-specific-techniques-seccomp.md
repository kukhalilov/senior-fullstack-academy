# end-to-end system design case studies — Reference: seccomp

Sources: [Linux kernel seccomp filter documentation](https://docs.kernel.org/userspace-api/seccomp_filter.html), [Linux seccomp(2) manual](https://man7.org/linux/man-pages/man2/seccomp.2.html), [libseccomp documentation](https://github.com/seccomp/libseccomp).

## Scope and version

Seccomp (secure computing mode) is a Linux kernel facility that restricts system calls a thread may make. The classic filter mode uses a restricted Berkeley Packet Filter program over syscall metadata. Kernel capabilities and actions vary by kernel version; distributions, runtimes, and container platforms may supply their own profiles. This lesson describes the Linux interface, not a complete sandbox by itself.

## How this group fits the mental model

An untrusted process reaches kernel services through system calls. Seccomp can reduce the set of calls or arguments available to that process, lowering reachable kernel attack surface. It is a layer of defense-in-depth alongside namespaces, capabilities, filesystem and network restrictions, LSM policy (such as SELinux or AppArmor), resource limits, and application-level isolation.

Seccomp is not a filesystem path policy or a general object-capability system. Its filter examines syscall number, architecture and ABI metadata, and raw argument values. It cannot safely dereference arbitrary userspace pointers to inspect strings or structures. A filter that blocks `openat` may reduce file access, but it cannot express a robust rule such as “allow opening only this pathname” by comparing pointed-to text inside the filter.

## Supplied names explained

- **Strict mode**: a highly restrictive mode allowing a small fixed syscall set. It is useful only for programs that can function within those limitations; it is not a general-purpose modern application profile.
- **Filter mode**: installs one or more filters that return an action for each syscall. Filters can be stacked; the kernel applies action precedence, and data returned with an action follows documented rules.
- **`seccomp()` / `PR_SET_SECCOMP`**: system-call and `prctl` interfaces for installing modes/filters. Filter installation generally requires `no_new_privs` to be set or suitable `CAP_SYS_ADMIN` in the caller’s user namespace.
- **`PR_SET_NO_NEW_PRIVS`**: prevents the thread and its descendants from gaining new privileges through `execve`; it is a prerequisite for unprivileged filter installation and helps prevent privilege escalation through a filter.
- **BPF program and `seccomp_data`**: the filter input includes syscall number, architecture, instruction pointer, and six argument values. Validate architecture and syscall ABI so a 32-bit compatibility syscall cannot bypass an x86-64-only rule.
- **Actions**: policies can allow, return an errno, kill the thread/process, trap with `SIGSYS`, trace, notify a userspace supervisor where supported, or log/allow according to the kernel’s documented action set. Unsupported actions can differ across kernels; query and test target systems.
- **Thread synchronization**: filters are associated with threads and inherited across fork/exec under documented conditions. Multithreaded programs need to ensure the policy covers all relevant threads; use supported synchronization mechanisms or install before creating worker threads.
- **libseccomp**: a library that helps express syscall rules and translate them to kernel filter programs. It reduces hand-written BPF complexity but does not guarantee that the selected policy matches the application’s actual runtime behavior.

## Cross-item comparison

Seccomp restricts syscall entry points. Linux capabilities divide certain privileged operations; namespaces isolate views of resources; cgroups constrain resource consumption; SELinux/AppArmor apply broader mandatory-access-control policies. A container runtime commonly combines these controls. Seccomp cannot replace them: allowing a syscall does not grant filesystem permission, and denying one syscall does not automatically eliminate an attack path through other syscalls.

An allow-list can fail closed when a newer library or kernel begins using a syscall the profile omitted. A deny-list keeps compatibility but allows newly introduced calls unless explicitly blocked. Choose based on threat model, compatibility strategy, and update testing; neither pattern is universally safe without maintaining the profile.

## Examples

For a CI runner executing submitted code, start from a runtime’s maintained profile and add restrictions based on observed required syscalls. Test the full build/test workload under the target kernel and architecture. On denial, record enough diagnostic context to identify syscall and action without leaking secrets. Roll the profile gradually, alert on unexpected denials, and ensure the process cannot ask a privileged supervisor to approve arbitrary syscalls.

For an application-specific profile, include required calls such as memory management, file descriptor operations, threading, and runtime-specific calls only after tracing the supported workload. Do not build a production policy from one successful startup trace: uncommon error handling, DNS, TLS, child processes, diagnostics, and upgrades may call additional syscalls.

## Common mistakes

- Treating seccomp as complete container isolation.
- Assuming filters can inspect pointed-to file paths or arbitrary memory.
- Forgetting syscall architecture/ABI checks and compatibility ABIs.
- Installing a filter on one thread while leaving other threads unrestricted.
- Choosing `KILL` or `TRAP` without testing how the runtime and supervisor handle the failure.
- Copying a profile across kernel versions without checking supported actions and runtime syscalls.
- Assuming a tracing-derived allow-list includes rare but necessary paths.
- Ignoring compatibility costs of strict allow-lists or security costs of broad deny-lists.

## Knowledge checks with answers

1. **What does a seccomp filter evaluate?** Syscall metadata and raw argument values, not arbitrary memory behind user pointers.
2. **Why set `no_new_privs` before installing an unprivileged filter?** It prevents the filtered task and descendants from gaining privileges through execution and satisfies the kernel’s unprivileged-installation requirement.
3. **Does allowing `openat` grant access to every file?** No. Normal permission checks and other security layers still apply; seccomp itself cannot generally authorize by pathname contents.
4. **Why test on every target architecture and kernel family?** Syscall numbers, compatibility ABIs, supported actions, and application syscall behavior can differ.
