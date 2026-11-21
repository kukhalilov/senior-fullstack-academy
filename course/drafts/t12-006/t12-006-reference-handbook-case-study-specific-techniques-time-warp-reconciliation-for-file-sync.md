# end-to-end system design case studies — Reference: Time-warp/reconciliation for file sync

Sources: [Syncthing: Understanding Synchronization](https://docs.syncthing.net/users/syncing.html), [Syncthing: Untrusted Device Encryption specification](https://docs.syncthing.net/specs/untrusted.html), [RFC 3229: Delta Encoding in HTTP](https://www.rfc-editor.org/rfc/rfc3229.html), [RFC 9110: HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html).

## Scope and version

This lesson covers reconciling replicated files when devices have edited offline, clocks differ, updates arrive late, or a delete races with a modification. It is a design pattern, not a claim that every sync product uses Syncthing’s algorithm. The cited Syncthing documentation describes its own implementation; RFC 3229 describes optional delta encoding for HTTP representation transfer, not a complete multi-device file synchronization protocol.

## How this group fits the mental model

Each device has a local copy and records what version it has observed. On reconnection, peers exchange compact metadata first: path, size, modification metadata, version history, and block hashes or manifests. They compare this index to determine which file is newer, which blocks differ, and whether two edits are concurrent. Only missing or changed blocks need to move across the network. A content hash detects identical content; it does not by itself say which change is causally later or decide which edit should win.

Clock time is a weak conflict arbiter. A laptop clock may be minutes ahead, a file may preserve an old timestamp, and two changes can occur while disconnected. A version vector or other causal history can distinguish “A descends from B” from “A and B diverged.” If versions are concurrent, the system must apply an explicit policy: preserve both as conflict copies, merge at the application level, or choose a winner while retaining recoverability. Silent last-writer-wins based only on wall-clock timestamp can destroy a valid edit.

## Supplied names explained

- **Index/manifest:** metadata that lets peers compare file paths and blocks without transferring every full file.
- **Block hashing:** identifies matching content chunks; chunking and hash choice affect CPU, metadata size, and detection of shifted content.
- **Causal version history:** records which updates observed which earlier updates; concurrent branches cannot be safely ordered by causality alone.
- **Conflict copy:** preserves a concurrent divergent version under a separate name so the user can reconcile it.
- **Tombstone:** retained metadata for deletion, needed so a disconnected peer does not resurrect a deleted file simply because it still has an old copy.
- **Delta encoding:** transfers differences relative to a known base representation; both sides must agree on the base and format, or a full transfer is safer.
- **Reconciliation:** repeats metadata exchange and transfer until replicas converge according to the system’s conflict and deletion policy.

## Cross-item comparison

| Technique | Answers | Does not answer |
| --- | --- | --- |
| Modification timestamp | When a filesystem reports a file was changed | Whether one edit causally includes another; clocks may skew or have coarse precision |
| Content hash | Whether two byte sequences/chunks match | Which version is authoritative or how to merge different content |
| Version vector/causal metadata | Whether versions are ordered or concurrent | How to merge arbitrary file formats |
| Delta/block transfer | How to reduce bytes sent when peers share a base | Conflict resolution, deletion semantics, or integrity without verification |
| Full-file transfer | Simple recovery when no trustworthy base exists | Bandwidth efficiency for large mostly unchanged files |

## Examples

Device A edits paragraph 2 while offline. Device B edits paragraph 8 from the same earlier version. After reconnect, causal metadata shows both branches descend from the same base and neither includes the other. For a structured document, an application-aware merge may safely combine them; for opaque binary data, preserve both versions and ask the user. If A’s entire file is newer by clock time, that alone is not evidence that A contains B’s edit.

Now suppose B deletes a file while A is offline. The server retains a deletion tombstone long enough for A to learn about it. If A did not modify the old file, it removes its stale copy. If A independently modified it, the policy may preserve the modification as a conflict rather than discard it. Tombstone retention must account for device absence and rejoining; deleting tombstones too soon risks resurrection, while retaining them forever costs metadata.

## Common mistakes

- Treating modification time or server arrival order as causal truth.
- Assuming a cryptographic hash resolves concurrent edits; it only identifies content equality with a collision-resistance assumption.
- Applying a delta to the wrong base version or skipping integrity verification after patching.
- Forgetting deletion tombstones and allowing stale replicas to resurrect files.
- Automatically merging opaque binary formats that have no safe merge semantics.
- Assuming conflict copies are temporary; they may propagate as normal files and need an explicit cleanup policy.
- Trusting a single “sync complete” flag without specifying which peers, folders, and versions have converged.
- Claiming HTTP delta encoding is a full synchronization protocol; RFC 3229 only describes a compatible HTTP extension for delta-encoded representations.

## Knowledge checks with answers

1. **Can hashes tell which edit is newer?** No. Hashes compare content; causal metadata or a defined policy is needed to order versions.
2. **Why keep tombstones?** They communicate deletion to offline replicas and prevent an old copy from being mistaken for a new file.
3. **What should happen to concurrent edits of an unmergeable file?** Preserve both or use a clearly documented winner policy with recoverability; do not silently assume timestamps are reliable.
4. **When is a full transfer preferable to a delta?** When the base is unknown, incompatible, corrupted, or the delta would cost more than sending the whole file.
