# Linux shell permissions processes networking systemd and logs — Reference: Paths, users, groups, ownership, modes, ACLs, and privilege elevation

Sources: [credentials(7)](https://man7.org/linux/man-pages/man7/credentials.7.html), [path_resolution(7)](https://man7.org/linux/man-pages/man7/path_resolution.7.html), [chmod(1)](https://man7.org/linux/man-pages/man1/chmod.1.html), [getfacl(1)](https://man7.org/linux/man-pages/man1/getfacl.1.html), [setfacl(1)](https://man7.org/linux/man-pages/man1/setfacl.1.html), and [sudo(8)](https://man7.org/linux/man-pages/man1/sudo.8.html).

## Scope and version

This covers ordinary Linux credentials and POSIX-style discretionary access controls. Filesystem ACL support, id-mapped mounts, network filesystems, containers, SELinux/AppArmor, and distribution account-management policy may add behavior. Confirm with local `man` pages and the actual mount/security configuration.

## How this group fits the mental model

Access is evaluated for a process identity while traversing every directory component of a path. The displayed owner and mode are evidence, not the entire policy: supplementary groups, ACL entries and their mask, mount flags, namespaces, read-only state, capabilities, and mandatory-access-control systems can also matter. Diagnose the failing operation using the same account and environment that runs the service.

## Supplied names explained

### Paths and filesystem names

- **Absolute path** — Starts at `/` and does not depend on the current directory; symlinks can still redirect traversal.
- **Relative path** — Resolved from a process's current working directory (or a directory file descriptor for `*at` APIs); service working directories may differ from an operator's shell.
- **Current working directory** — Per-process directory used to resolve relative paths. `pwd -P` displays a physical path; a logical path can preserve symlink spelling.
- Filesystem root / — Root of the process's visible path tree, which may be altered by chroot, mount namespaces, or containers.
- **Home directory** — Conventionally a user's personal directory, recorded in account data; not necessarily `/home/name` and not necessarily available at service startup.
- **Symbolic link** — Directory entry containing a path reference. Resolution follows it unless a command/API requests link metadata; dangling links are possible.
- **Hard link** — Another directory entry for the same inode. Removing one name does not remove data while another hard link remains. Hard links normally cannot span filesystems and directories are restricted.
- **Mount point** — Location where a filesystem is attached into a namespace tree. Mount options such as `ro`, `noexec`, or `nosuid` may alter behavior despite mode bits.
- **Filesystem mount namespace** — Isolated view of mount points for a process. A path visible on the host may be absent or mapped differently inside a container/service namespace.

### Identities and account tools

- **File owner UID** — Numeric user ID stored as inode ownership; names shown by tools come from account lookup and may differ across systems.
- **File group GID** — Numeric group ID associated with inode; group-name display depends on local identity databases.
- **Supplementary group** — Additional group credentials considered for access. A process usually receives these at login/start; changing account membership does not update an already-running process.
- **User private group** — Convention where a user has a same-named primary group, common in some distributions; it is policy, not a Linux requirement.
- **`/etc/passwd`** — Traditional local account database with name, UID/GID, home and shell fields; password hashes generally reside elsewhere.
- **`/etc/shadow`** — Protected local password-aging/hash data; never expose or copy its contents into logs or lessons.
- **`/etc/group`** — Traditional local group database and membership list; NSS can combine files with LDAP/SSSD or other sources.
- **`useradd`** — Creates local users according to options and distribution defaults. Home creation, skeleton files and group policy vary; inspect `man useradd` locally.
- **`usermod`** — Changes local account attributes. Supplementary membership options can replace rather than append lists if used incorrectly; inspect current groups first.
- **`userdel`** — Removes a local account record; home deletion is a separate option and can destroy user data. Confirm ownership/data disposition first.
- **`passwd`** — Changes a password or account password state according to privilege and policy; password authentication can be disabled while other authentication remains.
- **`groupadd`** — Creates a local group; numeric GID allocation and system-group conventions depend on distribution configuration.
- **`id`** — Displays effective user/group identity and, for a named account, database identity information.
- **`groups`** — Displays group memberships; current process credentials can differ from changed database membership until a new session/process is created.
- **`getent`** — Queries Name Service Switch databases, e.g. `getent passwd app`; unlike reading `/etc/passwd` alone, it may include remote identity sources.

### Modes, ACLs, and authority

- **`chmod`** — Changes mode bits and, on ACL-aware systems, may affect the ACL mask. Use `--` before untrusted path arguments where supported.
- **Symbolic chmod mode** — Forms such as `u=rw,go=r` express class-specific changes. `+`/`-` and omitted class have `umask`-sensitive rules; verify with `stat`.
- **Octal chmod mode** — Three/four octal digits encode rwx bits and special bits (e.g. `0640`, `2750`). Octal changes are absolute assignments, not relative grants.
- **`chown`** — Changes owner and optionally group, usually requiring privilege. Recursive use can cross mount boundaries or change unintended trees; inspect paths and use narrow scopes.
- **`chgrp`** — Changes group ownership, subject to privilege and membership rules.
- **Read permission** — For a regular file, permits reading contents; for a directory it permits listing names but is insufficient to open entries without search permission.
- **Write permission** — For a regular file, permits modifying contents; for a directory, permits changing entries, usually together with search permission. Sticky bit can restrict deletion/rename.
- **Execute permission** — For a regular file, permits execution subject to format, mount options, and security policy; on a directory it means search/traverse.
- **Directory search permission** — Allows path traversal and lookup of known names in a directory. Every ancestor directory needs search permission for normal pathname access.
- **set-user-ID bit** — On executable files can make execution use file owner's effective UID, subject to filesystem/kernel/security rules; commonly ignored on scripts and dangerous if misconfigured.
- **set-group-ID bit** — On executables can establish effective GID; on directories it commonly makes new entries inherit the directory group, subject to filesystem behavior.
- **Sticky bit** — On a shared writable directory, usually restricts unlink/rename to entry owner, directory owner, or privileged user (e.g. `/tmp`).
- **`umask`** — Per-process mask that clears requested permission bits for newly created objects; it is not applied as a simple subtraction to an existing mode and ACL defaults can change creation behavior.
- **POSIX access control list (ACL)** — Extends owner/group/other mode model with named users/groups. ACL entries are evaluated with the mask and credentials; ACLs do not replace other security layers.
- **Default ACL** — Directory ACL inherited by newly created children, with requested creation mode still limiting permissions. It is distinct from a child's access ACL.
- **`getfacl`** — Displays access/default ACL entries and often the computed mask/effective permissions; use it alongside `stat` and identity checks.
- **`setfacl`** — Adds, modifies, removes, or restores ACLs. `-m` modifies; `-x` removes entries; `-b` removes extended ACL entries. A subsequent chmod may change the mask and alter effective rights.
- **ACL mask** — Upper bound on effective permissions for named users, named groups, and the owning-group class when an extended ACL exists. It does not limit the file owner or `other` entry.
- **Effective ACL permission** — Permission after applying the ACL mask to the relevant ACL entry, further subject to credentials, path traversal, mounts, and security modules.
- **`sudo`** — Runs an authorized command under configured target credentials. It does not sanitize arguments, validate a path, fix DNS, or grant a lasting root shell by itself.
- **`sudo -u`** — Selects a target user (often with `-g` for a group) subject to sudoers policy. Environment and working directory behavior depend on options/configuration.
- **`sudo -i`** — Requests a login-style shell as the target user, typically root; this gives a broad interactive authority context, so prefer a narrow command for routine administration.
- **Root user** — UID 0, with broad discretionary authority but still subject to namespaces, capabilities, read-only mounts, LSM policy, and kernel restrictions.
- **Least-privilege service account** — Dedicated non-login or restricted identity with only required file access and capabilities. It limits blast radius but does not replace input validation or isolation.

## Diagnose “permission denied” safely

```sh
id
namei -l /srv/app/releases/current/config.json
stat -c '%A %a %U:%G %n' /srv/app /srv/app/releases/current/config.json
getfacl -p /srv/app /srv/app/releases/current/config.json
findmnt -T /srv/app/releases/current/config.json
```

Check the exact runtime identity, every path component, symlink target, ACL mask, mount flags, and service namespace. Then reproduce a read-only access check as that identity (for example, `sudo -u app -- test -r /srv/app/config.json`). Do not “fix” uncertainty with `chmod 777`; grant the narrow owner/group/ACL access required and retest the real operation.

## Cross-item comparison

| Control | Applies to | Important interaction |
|---|---|---|
| Mode bits | Owner/group/other | Directory search differs from file execute |
| Extended ACL | Named users/groups | Mask limits effective group-class access |
| `umask` | New object creation | Does not rewrite existing modes |
| Mount/security policy | Process view and operation | Can deny access despite permissive mode bits |
| `sudo` | A specific command/session | Elevation does not fix incorrect path assumptions |

## Examples

`chmod 640 report.txt` typically yields owner read/write and group read, but the process still needs search access to parent directories. If `getfacl` shows `user:deploy:rwx` and `mask::r--`, the deploy entry's effective rights are read only. Use a disposable directory to observe how a default ACL and umask combine for newly created files.

## Common mistakes

Mode `0640` means owner read/write and group read; it says nothing about parent directory access. A named ACL may display `rwx` but have lower effective rights due to a mask. `chmod` can alter ACL masks. Numeric IDs matter on shared storage and across containers. `sudo` may preserve or reset environment variables based on policy, which can change PATH and configuration selection. Recursive changes are difficult to undo unless ownership/modes were recorded first.

## Knowledge checks with answers

1. What does directory `x` allow? **Searching/traversing names in that directory.**
2. Can `chmod` affect an ACL? **Yes; with an extended ACL, mode group bits correspond to and can modify the ACL mask.**
3. Why use `getent` instead of only reading `/etc/passwd`? **NSS may provide identities from other configured sources.**
4. What should precede a recursive ownership change? **A verified narrow path, understanding mount/symlink boundaries, and a recorded rollback plan.**

## Summary

Permission analysis is a path-and-identity problem. Identify the real process credentials and namespace, inspect every path component and ACL, check mount/security constraints, and grant only the access the operation requires.
