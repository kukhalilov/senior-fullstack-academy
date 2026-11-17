# distributed systems consistency coordination and convergence — Reference: Consistency, transactions, and consensus

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 5](https://hld.handbook.academy/curriculum/distributed-systems-theory/).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Linearizability` — Requires each operation to appear to take effect atomically at one point between invocation and response while respecting real-time order.
- `Sequential consistency` — Requires a single order consistent with each process order but need not preserve real-time order between processes.
- `Eventual consistency` — Promises convergence after updates stop and communication/reconciliation proceed; it does not specify a freshness bound by itself.
- `Read-your-writes` — A session guarantee that a client sees its own completed writes in subsequent reads, often implemented with routing or version tokens.
- `Quorum read/write` — Requires acknowledgements from selected replica counts; intersection can help observe writes, but safety depends on protocol assumptions and membership.
- `Consensus` — A fault-tolerant agreement protocol for a value or log order under stated failure and network assumptions; it is not a synonym for replication.
- `Raft` — A consensus algorithm organized around leader election and replicated logs; production behavior also depends on membership changes, snapshots, and storage durability.
- `Two-phase commit (2PC)` — Coordinates commit across participants through prepare and decision phases; a coordinator failure can block participants, so it is not equivalent to consensus.

## Cross-item comparison

Use the item descriptions above to compare purpose, guarantee, and cost. Choose the smallest mechanism that provides the needed behavior; similar names may operate at different layers or under different assumptions.

## Examples

For a new feature, trace one successful operation and one failure through the relevant items. Identify the authoritative component, the state that is copied or derived, and what happens when a request is delayed, repeated, or interrupted.

## Common mistakes

- Selecting a component by popularity before defining the requirement.
- Treating a protocol or product name as a guarantee without reading its contract.
- Ignoring cost, operational ownership, observability, and recovery.
- Applying one consistency or caching rule to data with different correctness needs.

## Knowledge checks with answers

1. **Which item is the source of truth?** That is an explicit application data-ownership decision, not implied by a cache or replica.
2. **What if an acknowledgement is lost?** Treat the outcome as unknown; use idempotency or verification before repeating an effect.
3. **How do you choose among alternatives?** Compare them against the named workload, guarantee, cost, operational skill, and failure scenario.