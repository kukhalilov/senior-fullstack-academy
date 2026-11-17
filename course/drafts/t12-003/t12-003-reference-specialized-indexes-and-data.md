# data systems storage engines analytics streams and search — Reference: Search, time-series, graph, and vector workloads

Sources: [HLD Handbook](https://hld.handbook.academy/), [reference 1](https://www.postgresql.org/docs/current/mvcc.html), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://learn.microsoft.com/en-us/azure/architecture/guide/), [reference 4](https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Inverted index` — Maps terms to documents containing them, supporting efficient text retrieval and ranking.
- `BM25` — A probabilistic term-ranking function using term frequency, inverse document frequency, and document length normalization.
- `Time-series database` — Optimizes timestamped observations, retention, and time-window queries; cardinality and downsampling need attention.
- `Graph database` — Models vertices and edges for relationship traversals; traversal depth and high-degree nodes drive cost.
- `Vector database` — Indexes embedding vectors for approximate or exact similarity search; recall/latency tradeoffs and metadata filters matter.
- `Approximate nearest neighbor (ANN) index` — Finds likely close vectors faster than exhaustive search while accepting a tunable recall tradeoff.
- `Bloom filter` — A compact probabilistic membership structure that may say “possibly present” falsely but should not say absent for an inserted key.
- `Materialized view` — Stores a derived query result for faster reads; refresh timing and staleness become design concerns.

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