# end-to-end system design case studies — Problem: Design collaborative document editing

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice concurrent edits, offline merge, presence, and durable history; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a multi-user document editor that supports concurrent typing, disconnection, cursor presence, and version history.

**Worked design.** Choose an operation-transform or CRDT model based on required semantics and clients; neither makes all domain conflicts disappear. Persist document operations or snapshots with version/cursor metadata and broadcast updates over a realtime channel. Presence is ephemeral and should not share the durable write path. Offline clients sync from a cursor and apply deterministic merge rules; authorization is checked at document boundaries. Bound document size and fan-out, compact history with recoverable snapshots, and expose conflict behavior.

## Exercises

1. **Specify the contract.** From this case — Design a multi-user document editor that supports concurrent typing, disconnection, cursor presence, and version history. — write three must-have behaviors, one explicit non-goal, and the invariant that must remain true under concurrency.
2. **Model demand.** Estimate average, peak, and burst requests; identify the work that scales with concurrent edits, offline merge, presence, and durable history. State units and unknowns, and choose one production measurement that would revise your estimate.
3. **Trace ownership and API.** Name the authoritative record, its stable identifier, the read path, and the write/acceptance path. State where authorization and idempotency are checked and which derived data may be stale.
4. **Resolve a failure.** Analyze this case-specific drill: A client reconnects after losing acknowledgements while membership, privacy, or source permissions have changed. Reconcile cursor/version, deduplicate replay, and recheck current authorization before delivery. Identify the state before/after, retry rule, user-visible result, and recovery signal.
5. **Defend a trade-off.** Compare a simple baseline with one scaling mechanism relevant to concurrent edits, offline merge, presence, and durable history. Give the quality metric, latency/cost metric, and failure mode that decide whether to keep the mechanism.

## Progressive hints

Start with the user promise and the invariant, not a vendor diagram. Sketch the smallest correct read/write flow. Put timestamps and operation IDs on the path. Separate authoritative state from cache, index, notification, or analytics. Use the named failure drill to test retry and recovery. Add a scale mechanism only after identifying the bottleneck.

## Complete solutions

1. The contract should make the case-specific promise observable and name one invariant. For Design collaborative document editing, write a distinct browse/read promise and a command/write promise; define which actor is authorized and what happens when the invariant cannot be confirmed.
2. Estimate the busiest interval and skew, not just a daily average. For the supplied patterns (concurrent edits, offline merge, presence, and durable history), account for the dominant fan-out, payload, active-state, or storage multiplier. Keep the estimate as a range and validate it with representative traffic or a replay.
3. Keep one authoritative owner for the critical fact. Use stable IDs and explicit request/response semantics. Authenticate first, authorize at the data/action boundary, record durable acceptance before claiming completion, and mark caches or projections with their freshness/rebuild policy.
4. For the drill, a timeout means outcome unknown. Query durable operation state or retry with the same idempotency identity; never issue a second unguarded effect. Bound retries, expose pending/unknown status, alert on age/backlog, and reconcile external or derived state after recovery.
5. Keep the baseline until measurements show it misses the stated SLO. A cache, queue, partition, fan-out, replica, or specialized index earns its cost only if the chosen measure improves without breaking the invariant, privacy, or recovery contract. Use a rollback/disable path and monitor tail latency, errors, saturation, and the case-specific quality signal.
### Case-specific design answer

Choose an operation-transform or CRDT model based on required semantics and clients; neither makes all domain conflicts disappear. Persist document operations or snapshots with version/cursor metadata and broadcast updates over a realtime channel. Presence is ephemeral and should not share the durable write path. Offline clients sync from a cursor and apply deterministic merge rules; authorization is checked at document boundaries. Bound document size and fan-out, compact history with recoverable snapshots, and expose conflict behavior.

## Tests and edge cases

Test simultaneous insert/delete, offline reconnect, duplicate operations, document permission revocation, snapshot compaction, and large-room fan-out.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?
