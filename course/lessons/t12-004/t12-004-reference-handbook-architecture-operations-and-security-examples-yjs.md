# architecture patterns multi-region tenancy and reliability — Reference: Yjs

Sources: [HLD Handbook](https://hld.handbook.academy/), [Yjs documentation](https://docs.yjs.dev/), [Yjs shared types](https://docs.yjs.dev/getting-started/working-with-shared-types), [Yjs document updates API](https://docs.yjs.dev/api/document-updates), [Yjs offline editing](https://docs.yjs.dev/getting-started/allowing-offline-editing), [Yjs awareness and presence](https://docs.yjs.dev/getting-started/adding-awareness), [Yjs security guidance](https://docs.yjs.dev/).

## Scope and version

Yjs is an open-source CRDT framework for collaborative applications. The lesson focuses on its data model and system-design responsibilities, not a complete API reference or provider-specific operational instructions. Verify the exact package versions and provider behavior when implementing; Yjs itself does not prescribe one network transport or persistence service.

## How this group fits the mental model

In an ordinary centralized editor, clients send edits to one server that serializes changes. With a conflict-free replicated data type (CRDT), replicas can accept edits independently and later exchange updates that converge according to the data type’s merge rules. This is useful when users need to continue editing during disconnection or latency. Convergence means replicas that receive the same updates reach compatible state; it does not mean the merged result matches every user’s intent or satisfies business invariants.

Yjs separates the shared document from its provider. The document stores shared data types and generates updates. A network provider transports those updates and may add awareness/presence; a persistence provider stores document updates. Your application still chooses authentication, room/document authorization, retention, storage, snapshotting, abuse limits, and recovery.

## Supplied names explained

- **Yjs** — A high-performance CRDT framework for collaborative software. Its `Y.Doc` contains shared types such as `Y.Text`, `Y.Array`, `Y.Map`, and `Y.XmlFragment`; providers connect peers or persistence systems and distribute updates. Optional awareness state can carry ephemeral presence such as cursors or online status.

### Core pieces and guarantees

- **Shared types and document.** Use shared types for fields that must merge under concurrent edits. Bind `Y.Text` to an editor integration when rich-text semantics are needed; ordinary JSON replacement may discard useful operation granularity. Shared types must belong to a document to participate in synchronization.
- **Updates and state vectors.** Yjs exposes binary document updates. The documented update operations are commutative, associative, and idempotent, so they can be applied in different orders and more than once; replicas converge when they eventually receive the needed updates. State vectors help calculate missing differences. This is not a promise of message delivery or persistence—the provider and backend must supply those.
- **Provider.** A provider connects a Yjs document to peers, a network, or a database. Network choice may be WebSocket, WebRTC, or another supported/custom transport. Decide room membership, reconnection, fan-out, backpressure, authorization checks, and offline queue behavior for the actual provider.
- **Persistence and offline use.** The Yjs ecosystem includes local persistence such as IndexedDB and server/provider storage options. Local edits can survive a browser reload when persisted locally, but browser storage can be cleared, quota-limited, or lost with a device. Define which replica is durable and how backups, compaction, and restore work.
- **Awareness.** Presence/cursor data is separate from durable document content and is generally ephemeral. Avoid putting durable business state or secrets in awareness. Treat user-supplied presence as untrusted, size-limited input.
- **Garbage collection and history.** Document updates and deletion history have storage implications. A merged update representation may not remove all deleted content; compaction/garbage collection requires appropriate document loading and product-specific policy. If audit history is required, preserve a deliberate audit record rather than assuming CRDT history is a regulated audit log.

## Cross-item comparison

| Need | Yjs facility or surrounding system | Boundary to remember |
|---|---|---|
| Merge concurrent collaborative edits | Shared CRDT types and updates | The merge policy can converge while still surprising a user |
| Exchange edits | Provider plus transport | Yjs document semantics do not guarantee transport availability or access control |
| Work offline | Local persistence provider plus cached app shell as needed | Local persistence is device-local and can be cleared or compromised |
| Show cursors/online users | Awareness protocol/provider | Ephemeral presence is distinct from durable shared document data |
| Recover deleted/old data | Explicit snapshots, backups, retention and restore process | Update convergence alone is not backup, erasure, or archival policy |
| Enforce who can read or edit | Application authentication and per-document authorization | Knowing a room identifier is not authorization |

Compared with server-authoritative editing, Yjs can reduce the need for a single central sequencer and enable local-first edits, but requires careful data-model choices and conflict UX. Compared with Automerge, both are CRDT-based collaborative-data options; compare supported data types, editing semantics, language ecosystem, sync and storage integrations, and workload-specific benchmarks rather than assuming one universally wins.

## Examples

**Shared document.** A user types in a `Y.Text` while temporarily offline. A local persistence provider retains document updates. On reconnect, the chosen network provider exchanges missing state with other authorized peers; updates merge into the shared state. The application shows a “syncing” or “offline changes saved locally” status until the product’s durability condition is met. If two users concurrently edit nearby text, the CRDT merges operations, but product testing must verify the resulting text and editor cursor behavior are acceptable.

**Tenant workspace.** The server authenticates a user and authorizes access to a specific tenant/document before joining a synchronization room. Updates are validated for size and rate; server-side storage records durable updates. A tenant ID in the document name is only routing information and must not replace a server-side authorization check. Backups and erasure workflows cover persisted document state and any retained update data.

## Common mistakes

- Assuming CRDT convergence means semantic correctness for counters, inventory, money, or other invariants. A collaborative quantity field should not silently replace a transactional stock authority.
- Assuming Yjs includes a production-ready provider, database, ACL, backup, or server deployment model.
- Treating “offline edits persisted locally” as equivalent to cloud durability or backup.
- Mixing ephemeral awareness data with durable state or leaking sensitive identity information to all room participants.
- Trusting client-supplied document names, user IDs, or updates without authentication, authorization, validation, and resource limits.
- Using coarse whole-object replacement where shared-type operations would preserve concurrent intent.
- Assuming update merging alone satisfies audit, erasure, or compaction requirements.

## Knowledge checks with answers

1. **What does idempotent update application guarantee?** Applying the same update repeatedly does not create repeated logical changes in the document; it does not guarantee the update is delivered or saved durably.
2. **Does Yjs require a central server to resolve every concurrent edit?** No. Its CRDT updates can merge across replicas, while an application may still choose a server for persistence, authorization, or transport.
3. **Is a cursor stored in the durable document?** Typically it belongs to optional awareness/presence state, which is separate and ephemeral.
4. **Can a CRDT safely enforce a global inventory invariant?** Not automatically. Such invariants may need a transactional authority or a specially designed coordination/CRDT model.
5. **What protects a tenant’s document from another authenticated tenant?** Explicit per-document authorization at the service/provider boundary, not obscurity of a room ID.
