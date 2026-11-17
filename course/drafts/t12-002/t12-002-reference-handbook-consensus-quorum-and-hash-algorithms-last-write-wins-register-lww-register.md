# distributed systems consistency coordination and convergence — Reference: Last-Write-Wins Register (LWW-Register)

Sources: [Shapiro et al., Conflict-free Replicated Data Types](https://www.csa.iisc.ac.in/~raghavan/CleanedPods2021/crdt-shapiro-2011.pdf), [Lamport, Time, Clocks, and the Ordering of Events](https://lamport.azurewebsites.net/pubs/time-clocks.pdf).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Last-Write-Wins Register (LWW-Register)` — Stores a value with a timestamp (often plus a deterministic tie-breaker) and resolves concurrent versions by choosing the greatest timestamp/order key. This yields a deterministic winner if every replica applies the same total comparison, but it does not establish which user action happened later in real time: physical clocks can skew, and concurrent events have no inherent global order. The losing value is discarded from the register’s visible state unless separately retained.

## Choose by data semantics

LWW is appropriate only when “one value wins by this ordering” is an acceptable product rule, such as a replaceable preference where losing a concurrent edit is tolerable. It is dangerous for counters, inventory, payments, collaborative text, or any state where both concurrent intents matter. Use causal versions and merge logic, a CRDT designed for the operation, explicit conflict presentation, or a coordinated transaction when those semantics are required. A tie-breaker makes choice repeatable, not meaningful.

In Cassandra, for example, mutations are timestamped and the latest timestamp wins under its conflict-resolution model; clients and servers must account for timestamp generation and skew. That implementation detail should not be generalized to every LWW register or treated as consensus ordering.

## Cross-item comparison

Compare LWW with a causal register: LWW always collapses concurrent values according to a scalar order, while a causal register can detect concurrency and retain multiple siblings for application resolution. Compare both with a CRDT for the actual field type; convergence does not make a poor merge rule semantically correct.

## Examples

Two offline devices edit the same profile field. Device A’s clock is five minutes fast; device B’s later human edit gets the smaller timestamp and loses. Explain why a deterministic tie-breaker does not fix that semantic loss, and propose a product-appropriate alternative.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Treating the largest physical timestamp as proof of the latest real-world user intent.
- Assuming deterministic conflict resolution is lossless conflict resolution.

## Knowledge checks with answers

1. **What does LWW guarantee?** A deterministic winner under the chosen comparison rule, assuming replicas apply the same rule.
2. **Does the winning timestamp prove which edit happened last?** No; clock skew and concurrency prevent that inference.
3. **When is LWW unsafe?** When silently losing concurrent intent violates the data’s meaning or a business invariant.
