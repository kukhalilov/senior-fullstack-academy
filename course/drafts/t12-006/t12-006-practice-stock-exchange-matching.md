# end-to-end system design case studies — Problem: Design an exchange matching engine

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE](https://sre.google/sre-book/table-of-contents/), [Azure architecture guidance](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Goals

Practice deterministic ordering, market data fan-out, auditability, and latency; state assumptions, draw a correct baseline, and reason through a failure rather than reciting a memorized diagram.

## Worked example

Design a simplified exchange order book that accepts orders, matches buyers and sellers, publishes market data, and supports replay/audit.

**Worked design.** Define price-time priority, order types, cancel/replace rules, and authoritative sequence before scaling. Route each instrument or order book to a single deterministic owner or consensus-backed log; parallelize across independent books. Persist an ordered event log and derive book state and market-data projections. Keep matching fast and bounded; risk checks happen before acceptance under a clear contract. Replicate read-only market data separately from the matching authority. Audit every state transition and recover by replaying a validated log/snapshot.

## Exercises

1. **Specify the contract.** From this case — Design a simplified exchange order book that accepts orders, matches buyers and sellers, publishes market data, and supports replay/audit. — write three must-have behaviors, one explicit non-goal, and the invariant that must remain true under concurrency.
2. **Model demand.** Estimate average, peak, and burst requests; identify the work that scales with deterministic ordering, market data fan-out, auditability, and latency. State units and unknowns, and choose one production measurement that would revise your estimate.
3. **Trace ownership and API.** Name the authoritative record, its stable identifier, the read path, and the write/acceptance path. State where authorization and idempotency are checked and which derived data may be stale.
4. **Resolve a failure.** Analyze this case-specific drill: A caller times out after a provider or database may have committed the operation. Reconcile by stable operation ID before any retry; protect the invariant against duplicate effects. Identify the state before/after, retry rule, user-visible result, and recovery signal.
5. **Defend a trade-off.** Compare a simple baseline with one scaling mechanism relevant to deterministic ordering, market data fan-out, auditability, and latency. Give the quality metric, latency/cost metric, and failure mode that decide whether to keep the mechanism.

## Progressive hints

Start with the user promise and the invariant, not a vendor diagram. Sketch the smallest correct read/write flow. Put timestamps and operation IDs on the path. Separate authoritative state from cache, index, notification, or analytics. Use the named failure drill to test retry and recovery. Add a scale mechanism only after identifying the bottleneck.

## Complete solutions

1. The contract should make the case-specific promise observable and name one invariant. For Design an exchange matching engine, write a distinct browse/read promise and a command/write promise; define which actor is authorized and what happens when the invariant cannot be confirmed.
2. Estimate the busiest interval and skew, not just a daily average. For the supplied patterns (deterministic ordering, market data fan-out, auditability, and latency), account for the dominant fan-out, payload, active-state, or storage multiplier. Keep the estimate as a range and validate it with representative traffic or a replay.
3. Keep one authoritative owner for the critical fact. Use stable IDs and explicit request/response semantics. Authenticate first, authorize at the data/action boundary, record durable acceptance before claiming completion, and mark caches or projections with their freshness/rebuild policy.
4. For the drill, a timeout means outcome unknown. Query durable operation state or retry with the same idempotency identity; never issue a second unguarded effect. Bound retries, expose pending/unknown status, alert on age/backlog, and reconcile external or derived state after recovery.
5. Keep the baseline until measurements show it misses the stated SLO. A cache, queue, partition, fan-out, replica, or specialized index earns its cost only if the chosen measure improves without breaking the invariant, privacy, or recovery contract. Use a rollback/disable path and monitor tail latency, errors, saturation, and the case-specific quality signal.
### Case-specific design answer

Define price-time priority, order types, cancel/replace rules, and authoritative sequence before scaling. Route each instrument or order book to a single deterministic owner or consensus-backed log; parallelize across independent books. Persist an ordered event log and derive book state and market-data projections. Keep matching fast and bounded; risk checks happen before acceptance under a clear contract. Replicate read-only market data separately from the matching authority. Audit every state transition and recover by replaying a validated log/snapshot.

## Tests and edge cases

Test simultaneous crossing orders, cancel race, duplicate client order ID, sequence gap, recovery replay, and market-data consumer lag.

## Reflection questions

Which assumption could change your data model? What is the most expensive failure to recover from? What production metric proves the chosen tradeoff is working?
