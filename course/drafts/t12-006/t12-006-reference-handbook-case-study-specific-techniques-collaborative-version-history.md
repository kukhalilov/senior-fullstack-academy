# end-to-end system design case studies — Reference: Collaborative version history

Sources: [HLD Handbook](https://hld.handbook.academy/), [Shapiro et al., Conflict-free Replicated Data Types](https://pages.lip6.fr/Marc.Shapiro/papers/CRDTs-Springer2018-authorversion.pdf), [Peritext: A CRDT for Collaborative Rich Text Editing](https://groups.csail.mit.edu/sdg/pubs/2022/Peritext_PACM_HCI_2022.pdf), [RFC 6902: JSON Patch](https://www.rfc-editor.org/rfc/rfc6902.html).

## Scope and version

This lesson covers history and recovery for shared documents edited concurrently, including operation logs, snapshots, and replicated editing models. OT and CRDT algorithms have many variants; the correct choice depends on document semantics and implementation. The CRDT research cited here describes families and properties, not a claim that any particular product uses one design.

## How this group fits the mental model

Collaborative editing has two related but distinct needs: converge to a shared current state when users edit concurrently, and retain enough history to explain or restore earlier states. An operation log can support replay and audit, while periodic snapshots bound replay time. A CRDT or operational-transformation algorithm addresses how concurrent operations are reconciled; neither automatically supplies durable history, authorization, retention, or backups.

History policy also affects privacy and deletion. A “restore” may create a new version rather than erase subsequent edits. Users need clear permissions for who can read history, restore, or permanently delete content, and retention rules must cover logs, snapshots, exports, and backups consistently.

## Supplied names explained

- **Operation log:** ordered/causally identified edits such as insert, delete, format, or metadata changes. Define actor, operation ID, base version, timestamp semantics, and authorization context.
- **Snapshot/checkpoint:** serialized document state at a known version used to load quickly; replay subsequent operations to reconstruct later state.
- **Operational transformation (OT):** transforms concurrent operations relative to operations already applied so replicas can maintain agreed behavior; correctness depends on transformation functions, ordering, and operation semantics.
- **Conflict-free replicated data type (CRDT):** replicated data structure designed so replicas applying the same updates converge under its assumptions. Convergence does not guarantee that the result matches user intent for every rich-text formatting or semantic conflict.
- **Version DAG/branch:** represents histories with multiple parents or divergent edits; merges require explicit semantics and user-facing conflict behavior.
- **Compaction/garbage collection:** reduces stored history or obsolete CRDT metadata; must preserve needed recovery, undo, audit, and replica synchronization guarantees.
- **Undo/redo:** user operation with collaboration-specific scope. A local inverse may not safely undo another user’s intervening edit; the system must target the original operation and preserve subsequent work.

## Cross-item comparison

| Model | Concurrency handling | History/recovery implication |
| --- | --- | --- |
| Server-serialized edits | One authority orders writes; stale clients may be rejected or rebased | Simple total order, but availability/latency depend on authority and history retention is still separate |
| OT | Transforms concurrent operations under defined transformation/ordering rules | Can retain operations, but log replay requires compatible algorithm/version and operation context |
| CRDT | Replicas can accept updates and converge under the data type’s assumptions | Metadata/history can grow; compaction and replica state management are necessary design concerns |
| Periodic snapshots plus event log | Snapshot accelerates reconstruction; log records later changes | Supports history/restore if versions and retention are preserved; does not itself resolve concurrent edits |

## Examples

Two users edit the same paragraph while offline. User A inserts “not” before a phrase; user B deletes the phrase’s final word. When both reconnect, the sync protocol identifies their base versions and operations. OT/CRDT/server-merge rules determine the merged document. Save the resulting state/version and enough operation metadata to replay or inspect it. A snapshot at version 500 plus operations 501–540 lets a restore/review process reconstruct later state without replaying the document’s entire lifetime.

If a user chooses “restore version 480,” avoid silently replacing the present document without concurrency checks. Create a new version derived from 480 or require a conditional write against the current version; preserve later edits in history and clearly show the restore event. If clients have been offline beyond retained history, force a fresh snapshot and reconcile local edits rather than accepting operations against an unknown base.

Test concurrent insert/delete/format operations, duplicate and reordered messages, offline duration, reconnect from stale state, snapshot/log corruption, compaction, permission revocation, undo after another edit, and restore racing with new edits. Measure log growth, replay latency, conflict/merge outcomes, and snapshot restoration integrity.

## Common mistakes

- Assuming CRDT convergence means every merge preserves user intent or application invariants.
- Treating a version log as a collaboration algorithm; storing edits does not resolve concurrency.
- Compacting operations or CRDT metadata without checking offline replicas, undo, audit, and restore requirements.
- Replaying old operation schemas with new code without versioned migrations or compatibility handling.
- Assigning timestamps and treating them as a globally reliable total order without a clock/order model.
- Implementing undo as “restore prior whole document,” overwriting other users’ later changes.
- Letting any collaborator read or restore history regardless of document permissions.
- Calling a restore permanent deletion while old versions, snapshots, or backups retain the content.
- Failing to recover clients whose sync cursor predates the retained operation log.

## Knowledge checks with answers

1. **Does a CRDT automatically provide durable undo/history?** No. It addresses convergence under defined update semantics; persistence, history, retention, and undo are separate concerns.
2. **Why keep snapshots if there is an operation log?** To reduce reconstruction/replay cost, while the log after the snapshot records newer changes.
3. **Can a stale offline client always submit its operations after compaction?** Not necessarily. If the required causal/history context has expired, it may need a full resync and explicit merge path.
4. **Why is whole-document rollback risky in collaboration?** It may erase other users’ intervening changes; restore should be version-aware and create an auditable new state.

## Review status

CRDT convergence properties and rich-text intent caveats are checked against the cited research; JSON patch scope is linked for state-delta context. This lesson remains pending full claim-by-claim audit and manifest omission check.
