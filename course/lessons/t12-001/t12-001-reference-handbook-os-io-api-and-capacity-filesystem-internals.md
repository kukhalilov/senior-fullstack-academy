# system design foundations and infrastructure building blocks — Reference: Filesystem internals

Sources: [Linux kernel ext4 overview](https://docs.kernel.org/filesystems/ext4/), [ext4 inodes](https://docs.kernel.org/filesystems/ext4/inodes.html), [ext4 directory entries](https://docs.kernel.org/filesystems/ext4/directory.html), [ext4 journal](https://docs.kernel.org/filesystems/ext4/journal.html), [Linux `fsync(2)`](https://man7.org/linux/man-pages/man2/fsync.2.html).

## Scope and version

This is a learner-level tour of common Unix-like filesystem ideas with ext4 and Linux as concrete examples. It does not claim that every filesystem uses inodes, journals, extents, or the same durability rules. On-disk formats, mount options, cache behavior, and crash guarantees differ by filesystem, operating system, storage device, and configuration.

## How this group fits the mental model

Applications name files and ask to read, write, create, rename, and delete them. A filesystem translates those operations into metadata and data updates over storage. Several layers intervene: pathname lookup, in-memory caches, filesystem allocation and journaling, the block layer, device caches, and physical media. Understanding the layers explains why “write returned” and “survives power loss” are different claims.

## Supplied names explained

- `Filesystem internals` — The structures and mechanisms that map names and file offsets to metadata and storage blocks, cache data, allocate space, recover from interruption, and define persistence behavior.

## Names, directory entries, inodes, and file data

A pathname such as `/var/data/report.json` is resolved by looking up directory components. In ext4, a directory entry maps a name to an inode number; the inode stores metadata about the object, such as ownership, permissions, timestamps, size, and mappings to file content. The inode is not the filename. Multiple hard-link directory entries can refer to the same inode, while a symbolic link is a separate object containing a path-like target.

An open file descriptor refers to an open file description/object in the kernel. Renaming or unlinking a name does not necessarily invalidate already-open descriptors. An unlinked file can continue to occupy storage while a process still has it open; its content becomes reclaimable after the last reference is gone. This separation between name and object matters for atomic replacement, log rotation, and deployment patterns.

Filesystems divide storage into allocation units such as blocks and use metadata structures to locate them. ext4 groups blocks and inodes and can describe contiguous file ranges with extents. Extents reduce the need to store a separate pointer for every block in long sequential files. Allocation tries to balance locality, fragmentation, free-space availability, and concurrency; the exact policy is filesystem-specific.

## The kernel cache path

Many buffered reads and writes pass through the page cache. A read may be served from memory when the needed page is cached; a buffered write can update cached pages and mark them dirty before storage writes complete. The kernel later writes dirty data according to filesystem and system policies. This makes ordinary operations fast, but it means a successful write call alone may not mean that data has reached durable media.

Direct I/O and memory mapping provide different paths and constraints, not a universal “faster” switch. Memory mapping changes how an application accesses file-backed pages but still interacts with filesystem and memory-management behavior. Direct I/O can impose alignment and coherence constraints and does not remove the need to understand device durability. Select these mechanisms from measured access patterns and documented guarantees.

## Journaling and crash recovery

A metadata journal records enough information to recover a filesystem to a structurally consistent state after interruption. Journaling does not automatically mean every recent application byte is preserved. In ext4, the default `data=ordered` mode journals metadata and orders associated data writes before relevant metadata is committed; `data=writeback` and `data=journal` have different data guarantees and performance costs. These are ext4-specific modes, not generic names for every filesystem’s behavior.

After a crash, journal replay can complete or discard transactions according to the filesystem’s rules. This protects filesystem structure from certain partial updates; it does not replace application-level transactions or backups. A database still needs its own write-ahead log and durability protocol because it must preserve application invariants and commit semantics across multiple records.

Copy-on-write filesystems use another broad strategy: write changed data/metadata to new locations and then update references, often enabling snapshots and checksums. “Copy-on-write” alone does not specify which writes are durable at each moment or what a completed sync guarantees. Consult the concrete filesystem documentation.

## Durability: what `fsync` is for

Durability depends on the complete chain: application buffers, kernel page cache, filesystem ordering/journal, block layer, device cache, and hardware. On Linux, `fsync(file_fd)` requests that modified file data and associated metadata be transferred to permanent storage and waits for completion as reported through that stack. It can fail; applications must handle the error. Device and filesystem correctness still matter.

Synchronizing a file does not necessarily make a newly created or renamed directory entry durable. Linux `fsync(2)` documentation says the containing directory needs its own `fsync` for that. A common durable replacement sequence is:

1. Create a temporary file in the target directory.
2. Write the complete new contents and check every write result.
3. `fsync` the temporary file and handle errors.
4. Rename the temporary file over the target (atomic name replacement is scoped to the filesystem and operation semantics).
5. `fsync` the containing directory so the name change is persisted.

This sequence aims to ensure that after a crash the old or new name/content is recoverable according to filesystem semantics; exact guarantees depend on the filesystem and platform. A rename’s atomic visibility to concurrent processes is not the same as crash durability. Cross-filesystem rename generally cannot be treated as one atomic rename operation.

## Common application patterns

- **Append-only log:** batch writes for throughput, but choose a sync policy based on acceptable data-loss window. Acknowledging an event before its durable commit can lose it on crash.
- **Database files:** rely on the database’s documented write-ahead log, flush ordering, and recovery; do not assume filesystem journaling makes multi-page transactions atomic.
- **Configuration replacement:** write a full temp file, sync it, rename it, and sync the directory when crash durability is required. Readers with an old file descriptor may continue reading the old object until they reopen.
- **Temporary files:** place them on the intended filesystem when rename semantics matter, and define cleanup for crashes and abandoned files.

## Cross-item comparison

| Mechanism | Main job | Does not imply |
|---|---|---|
| Page cache | Speed buffered file access and defer writes | That a successful write is already durable |
| Metadata journal | Recover filesystem metadata consistency | That all recently written user data survives |
| Data journaling | Journal file data as well as metadata in a documented mode | That it is the best performance choice or universal behavior |
| Copy-on-write | Write new versions/locations and switch references | A particular sync, atomicity, or backup guarantee without a filesystem contract |
| `fsync(file)` | Request persistence of file data and associated metadata | Persistence of the containing directory entry on Linux |
| `fsync(directory)` | Request persistence of directory changes on Linux | A guarantee that hardware or a broken storage stack honors flushes |

## Examples

A service updates a JSON configuration file. It writes `settings.tmp`, checks for short writes/errors, syncs the temporary file, renames it to `settings.json`, then syncs the containing directory. A crash before rename leaves the old name; a crash after rename but before directory sync may leave uncertain name persistence depending on the filesystem. The service should validate the new content before replacement and have a recovery policy for leftover temporary files.

A database acknowledges a transaction only after its own WAL and required storage flushes complete. If it only updates a page-cache buffer and acknowledges immediately, a power failure can erase the acknowledged change even if the filesystem can replay its metadata journal cleanly.

## Common mistakes

- Confusing filename, inode, open descriptor, and file contents as one object.
- Assuming `write()` means data reached stable storage.
- Assuming a metadata journal journals all user data or gives application transactions.
- Treating rename visibility as crash durability or assuming file `fsync` persists the directory entry.
- Ignoring `fsync` errors, short writes, device flush behavior, or filesystem-specific mount modes.
- Assuming ext4-specific modes apply to XFS, Btrfs, APFS, NTFS, or network filesystems.
- Treating a cache hit, memory mapping, or direct I/O as proof of persistence.
- Using a filesystem guarantee as a substitute for database WAL, backups, or recovery testing.

## Knowledge checks with answers

1. **Is an inode the filename?** No. In ext4 a directory entry maps a name to an inode, which represents file metadata and data mapping; names and object identity are separate.
2. **Does metadata journaling guarantee that the latest file contents survive a crash?** No. Journaling modes differ; ext4’s default ordered mode journals metadata and orders related data writes, but does not journal every file byte.
3. **Why sync the directory after a durable rename on Linux?** Syncing the file flushes file contents/metadata, while the directory entry change has separate persistence requirements.
4. **Does atomic rename guarantee durable replacement?** No. Atomic visibility and crash durability are different properties; file and directory synchronization may be needed.
5. **Why does a database need its own WAL if the filesystem has a journal?** The filesystem journal protects filesystem consistency; the database log records and recovers application transactions and invariants.

## Practice

Design a crash-safe update for a service’s critical configuration file. State the exact write/sync/rename sequence, what concurrent readers may observe, what failures must be checked, and what recovery does with leftover temporary files.

**Suggested answer:** Write and validate a temporary file in the target directory, handle partial writes and errors, sync the file, rename it over the target, then sync the directory on Linux if the name change must survive a crash. Readers that already opened the old file may continue to see the old object; new opens see the replacement according to rename semantics. Treat sync or rename errors as failed/uncertain updates and retain a recoverable previous copy if the product requires rollback. On startup, validate the active file and clean or reconcile temp files using a deterministic rule. Verify this behavior on the actual filesystem and storage stack.
