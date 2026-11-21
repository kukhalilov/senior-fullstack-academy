# architecture patterns multi-region tenancy and reliability — Reference: Automerge

Sources: [HLD Handbook](https://hld.handbook.academy/), [Automerge documentation](https://automerge.org/docs/), [Automerge concepts and repositories](https://automerge.org/docs/reference/concepts/), [Automerge document data model](https://automerge.org/docs/reference/documents/), [Automerge conflicts](https://automerge.org/docs/reference/documents/conflicts/), [Automerge counters](https://automerge.org/docs/reference/documents/counters/), [Automerge sync protocol](https://automerge.org/docs/reference/under-the-hood/), [Automerge lists](https://automerge.org/docs/reference/documents/lists/).

## Scope and version

Automerge is a CRDT family and implementation for collaborative, local-first data. This lesson describes current documented concepts, with JavaScript `automerge` and `automerge-repo` terminology where useful; exact APIs differ across language bindings and releases. Consult the package-specific docs before coding.

## How this group fits the mental model

Automerge lets each replica make changes locally, even when disconnected, and later merge histories. Its document model resembles nested maps, lists, text, and scalar values, but it records operations with metadata so concurrent edits can be reconciled. The application can sync through peers, servers, files, or other transports. Convergence does not mean “the application decides the right business answer”: conflict rules are data-type-specific, and same-field conflicts may require explicit user or domain handling.

The JavaScript ecosystem separates the core document/CRDT and transport-agnostic sync protocol from `automerge-repo`, which manages documents, local storage, and network connections through pluggable implementations. That separation is useful, but it means a complete production system still needs identity, document access control, backup, retention, indexing, and operational monitoring.

## Supplied names explained

- **Automerge** — A CRDT library and ecosystem for concurrent, offline-capable document changes. Documents keep change history and merge changes from replicas; repositories and adapters provide storage and synchronization conveniences.

### Data and merge semantics

- **Document and history.** An Automerge document is a root map with nested maps, lists, text, and scalar values. Changes form a history and are identified independently of wall-clock time. A document’s change history can support branching or inspection, but it is not automatically a compliant audit log or a guarantee of permanent retention.
- **Fine-grained updates.** Change the property or list element that represents the user’s intent instead of replacing a whole nested object. Fine-grained operations give the merge algorithm more information to combine independent work. Replacing an entire object can turn separate edits into a conflict on that object.
- **Concurrent same-property writes.** Automerge retains concurrent conflicting values and chooses a deterministic visible winner for ordinary reads; applications can inspect conflicts with APIs such as `getConflicts` and present or resolve them. The winner is not necessarily the latest wall-clock edit or the semantically correct business decision.
- **Lists and text.** Sequence-aware operations preserve concurrent insertions and deletions more meaningfully than replacing a whole array or text value. Choose list and text operations that express the actual edit; test the result for simultaneous edits to the same logical item.
- **Counters.** A plain number updated with read-modify-write can lose concurrent increments. Use the documented counter datatype for values intended to increment/decrement concurrently. This does not make a counter suitable for money or a globally constrained inventory total without additional invariants.
- **Sync and repository.** The sync protocol exchanges the changes needed between document replicas and is transport-agnostic. A repository tracks documents, storage, and connections. Transport delivery, server durability, authorization, and retention are separate responsibilities.

## Cross-item comparison

| Design concern | Automerge choice | Trade-off |
|---|---|---|
| Two replicas update distinct properties | Merge both fine-grained changes | Easy convergence, but application still validates combined invariants |
| Two users replace the same field concurrently | Inspect and resolve the recorded conflict | Deterministic default read avoids replica divergence but may not express user intent |
| Concurrent additive count | Counter datatype | Correctly merges increments, but does not enforce arbitrary upper bounds or financial rules |
| Collaborative list/text | Use sequence-aware operations | Requires modeling each edit precisely and validating UX for concurrent edits |
| Network and persistence | `Repo` with selected storage/network adapters | Pluggable does not imply secure, durable, or available by default |
| Server-authoritative workflow | Central transaction or coordinator | Stronger control of invariants, but online dependency and coordination costs |

Automerge and Yjs both use CRDT techniques, but their document types, operation models, conflict APIs, transport/storage ecosystems, and language support differ. Select by the shape of edits, target platforms, conflict UX, document size/history behavior, interoperability, operational ownership, and measured workload. Do not choose based on “CRDT” as a complete feature checklist.

## Examples

**Offline task editor.** A device changes the title of task A while another device marks task B complete. Fine-grained map changes can merge both independent edits. If both devices edit the same task title while offline, Automerge can converge while surfacing competing values; the UI can expose the conflict or define a domain-specific resolution. A task database service may later validate access and index the merged document, but the CRDT does not decide tenant authorization.

**Concurrent counter.** A shared document starts with `clicks = 3`. Two disconnected clients each add one. If both simply assign the number 4, one increment can be lost under last-writer-style conflict handling. An Automerge counter records additive operations so the merged value becomes 5. If the value is instead “remaining seats” with a rule that it cannot become negative, an unconstrained offline counter may violate the rule; use a reservation/coordination protocol designed for that invariant.

## Common mistakes

- Equating deterministic convergence with semantic correctness or user-intent preservation.
- Updating a whole nested object or array when the operation should modify one field or insert/remove one item.
- Using an ordinary numeric field for a concurrently incremented count.
- Assuming conflict-free means no conflicts are observable or that a library can decide every same-field conflict.
- Treating the Automerge sync protocol as the whole product: network authorization, persistence durability, access control, backups, and deletion are still design work.
- Using Automerge’s history as a regulated audit trail without independent immutability, access, retention, and erasure design.
- Assuming all Automerge language bindings expose identical API or performance characteristics.

## Knowledge checks with answers

1. **Two users change separate fields while offline. What does the CRDT help with?** It can merge those independent operations so replicas converge after syncing.
2. **Two users set the same property to different values. Is the default winner necessarily the newest by clock time?** No. Automerge selects a deterministic winner based on operation identifiers; inspect and resolve conflicts when product semantics require it.
3. **Why use `Automerge.Counter` instead of `n += 1`?** A counter represents concurrent increments as operations, avoiding the lost-update result from replacing the same numeric property.
4. **Does Automerge guarantee the document is backed up on a server?** No. The chosen repository storage/network adapters and operational backup process determine durability.
