# end-to-end system design case studies — Reference: Operational Transformation (OT)

Sources: [HLD Handbook](https://hld.handbook.academy/), [Sun et al.: Achieving convergence, causality preservation, and intention preservation](https://www.cs.cityu.edu.hk/~jia/research/reduce98.pdf), [Sun and Ellis: OT in real-time group editors](https://doi.org/10.1145/289444.289469), [Sun et al.: Real Differences between OT and CRDT for Co-Editors](https://arxiv.org/abs/1810.02137).

## Scope and version

Operational Transformation (OT) is a family of algorithms and control protocols for reconciling concurrent operations on shared data, especially collaborative documents. There is no single universal OT transform function: operation types, transformation rules, causal model, history management, and coordination protocol must be designed together. This lesson explains the core intuition and the correctness obligations, not one vendor's wire protocol. The cited research was checked on 2026-11-17.

## How this group fits the mental model

In a collaborative editor, users should be able to type locally without waiting for every network round trip. A user's edit is an operation relative to the document version they saw. Meanwhile, another user's edit may already have been applied. OT adjusts one operation's positions or meaning so it can be applied to a document that has changed concurrently.

For a text sequence, represent an insertion as `(position, text)` and a deletion as `(position, length)` relative to a known document version. The server or peers maintain a common logical order of operations. When a remote edit arrives, the system transforms it against concurrent operations since its base version, then applies and broadcasts the transformed operation. The exact tie-breaking rule determines how simultaneous inserts appear.

OT is not “merge text by diff” and not automatic semantic conflict resolution. A correct system must preserve applicable operations, causal order, convergence, and intended effects as defined by the editor. Different document models require different operations: rich text, objects, tables, and comments need more than insert/delete character offsets.

## Supplied names explained

- `Operational Transformation (OT)` — A collaboration technique that transforms operations so concurrent edits can be applied against different document contexts while preserving the system's specified consistency properties. Correctness depends on the operation model, transformation functions, and control algorithm working together.

### Worked concurrent insertion

Initial document: `cat`.

- User A inserts `X` at position 1: `cXat`.
- Concurrently, user B inserts `Y` at position 1 against the original `cat`.

If A's insert is ordered first, B's operation must be transformed to position 2 so applying it after A produces `cXYat`. A's client must also process the remote operation in a way that yields the same final sequence. If the chosen tie-break order puts B first, the converged result may instead be `cYXat`. Either can be valid if all participants apply the same deterministic rule and the user-facing semantics are documented.

For a deletion, transformation must account for inserts/deletes before, inside, or at the deletion range. A remote insert before a pending local deletion shifts the deletion's position; an overlapping deletion may shorten or eliminate its target range. The rules are operation-specific, so do not infer a correct implementation from insertion-only examples.

## Correctness properties and architecture

**Convergence** means replicas that have processed the same set of operations reach equivalent document state. **Causality preservation** means operations that depend on earlier observed edits do not take effect before those edits. **Intention preservation** describes retaining the meaningful effect a user intended despite concurrent edits; it requires a precise operation model and is not automatically guaranteed by any arbitrary transform.

The client-server path often maintains a server revision and a client pending-operation buffer. A client applies local edits optimistically, labels each with its base revision, and sends them. The server orders accepted operations, transforms stale operations against intervening history, applies them, and broadcasts the resulting operation/revision. Clients acknowledge their own operations, remove acknowledged pending entries, and transform incoming remote operations against local unacknowledged edits before applying them. This is a family of architecture, not one canonical protocol; the classic Jupiter approach and later OT algorithms differ in details.

The transform/control algorithm must account for operation context. Pairwise transform rules may satisfy one property but fail when operations are transformed through different histories. Systems therefore need defined transformation conditions and a control algorithm that applies operations in a consistent causal order. Testing only two simultaneous inserts is not sufficient; include insert/delete overlap, repeated positions, multiple clients, delayed/duplicate messages, and undo.

### History, reconnect, and scale

To transform an old operation, the server may need the operations since its base revision. Bound and compact history, but retain enough information for active clients or require a safe resynchronization when history has expired. A disconnected client may have a long pending operation chain; do not blindly apply it to a changed document without rebasing under the protocol or asking the client to reload/merge.

Use document IDs and revision numbers to partition work. A single authoritative sequencer simplifies operation ordering but can become a hot spot and requires failover. Partitioning documents allows independent collaboration groups; a single document still needs a consistent ordering authority or a proven decentralized protocol. Persist snapshots plus a durable operation log so restart can reconstruct state and audit changes. Acknowledgement should distinguish “accepted in memory” from “durably recorded” if crash durability matters.

Undo is another operation, not simply restoring an old snapshot: it should reverse a user's intent while preserving later edits by others. Store enough origin/operation context and define how inverse operations are transformed. Cursor and selection positions also need transformation as the document changes.

## Cross-item comparison

This group has one assigned item, so no within-group comparison applies. A conflict-free replicated data type (CRDT) encodes data and operation identities so supported updates can be merged according to the CRDT's convergence rules, often without a central transform server. OT typically transforms operations relative to histories and commonly uses a server or coordination protocol. Both are families, not plug-in guarantees; each must choose a data model, preserve intended editing behavior, manage metadata/history, and handle rich-text structure.

There is no universal rule that OT is faster, smaller, more correct, or simpler than CRDT. The cited comparative research emphasizes that claims depend on concrete algorithms and working systems. Compare offline duration, network topology, server authority, metadata growth, rich-text semantics, undo, implementation maturity, and operational requirements with representative workloads.

## Examples

### Delayed client operation

Client A last saw revision 50 and locally inserted `red` at position 4. While offline, the server accepted edits through revision 57. A reconnects with base revision 50. The server must either transform A's operation against revisions 51–57 using the correct history, reject and request a resync if history is unavailable, or use another explicitly designed merge path. Applying the original offset directly to revision 57 can insert text at the wrong place.

### Duplicate network delivery

The server commits operation ID `A:103` and sends an acknowledgement, but the acknowledgement is lost. The client retries the same operation. Deduplicate by stable operation ID and return the prior result; do not apply the insertion twice. Message ordering and duplicate handling are protocol responsibilities even when the transformation math is correct.

### Rich-text formatting

One user inserts a word while another applies bold formatting to a range at the same time. The system needs a document model that defines whether formatting attaches to positions, text identities, or spans, and how concurrent insertion inherits or avoids formatting. A plain-text insert/delete transform is insufficient to answer this product question.

## Common mistakes

- Saying OT is one algorithm with one universal transform function.
- Assuming any pairwise transformation guarantees convergence under arbitrary multi-operation histories.
- Transforming positions but ignoring causal context, operation order, duplicates, or acknowledgements.
- Applying an old client offset directly to the latest document revision.
- Treating rich-text formatting, cursors, comments, or undo as if they were plain string insert/delete.
- Claiming that convergence automatically preserves user intention or resolves semantic conflicts.
- Compacting operation history while connected/offline clients still require it.
- Treating OT and CRDT as universally ordered by performance, correctness, or simplicity.
- Failing to distinguish an optimistic local edit from a server-accepted and durably persisted operation.

## Knowledge checks with answers

1. **Why transform a remote operation?** It was created against an earlier document state; transformation adapts it to the state after concurrent operations while preserving the protocol's chosen semantics.
2. **What is convergence?** Replicas that process the same operations reach equivalent state. It is necessary but does not by itself prove users' intentions were preserved.
3. **Can pairwise transform rules be tested only two operations at a time?** No. The control algorithm and operation context matter across multiple histories and causally ordered operations.
4. **What should happen when an old client reconnects after history was compacted?** Use a supported snapshot/resync or rebase protocol, or reject safely; applying stale offsets directly is incorrect.
5. **Is CRDT always better for offline editing?** No universal choice follows from the labels. Compare concrete algorithms, data semantics, topology, metadata costs, and recovery behavior.

## Practice

Specify an OT protocol for a shared text document with optimistic local edits. Define operation IDs, base revisions, server ordering, transformation context, acknowledgements, deduplication, history compaction, reconnect behavior, cursor transforms, and undo. Walk through two concurrent inserts, an insert overlapping a delete, a delayed client operation, and a duplicated request. State which invariants your tests must verify.
