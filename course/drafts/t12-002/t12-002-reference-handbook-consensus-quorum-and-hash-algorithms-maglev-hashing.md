# distributed systems consistency coordination and convergence — Reference: Maglev hashing

Sources: [Handbook module 3.9](https://hld.handbook.academy/curriculum/distributed-systems-theory/), [Google Research, Maglev: A Fast and Reliable Software Network Load Balancer](https://research.google.com/pubs/archive/44824.pdf), [Google Research publication page](https://research.google/pubs/maglev-a-fast-and-reliable-software-network-load-balancer/).

## Scope and version

This lesson describes the Maglev algorithm from Google's published load-balancer design. It is a network traffic distribution method; details of Google's production deployment are implementation-specific.

## How this group fits the mental model

For a network load balancer, a packet or connection must be mapped to a healthy backend quickly and consistently. Maglev precomputes a fixed-size lookup table. Each backend receives a deterministic preference permutation over table slots, commonly generated from backend-specific offset and skip values with prime table size M. Backends take turns claiming their next unfilled preferred slot until all M slots are assigned. Runtime selection hashes the flow/key and indexes the precomputed table, making lookup fast.

## Supplied names explained

With equal turns, each backend receives either ⌊M/N⌋ or ⌈M/N⌉ slots, so table shares differ by at most one slot. The paper prioritizes even balance over the strongest minimal-remapping property of ring/rendezvous approaches; rebuilding after backend changes can remap some flows, though experiments show disruption is limited and a larger table reduces it. A larger table also consumes memory and takes longer to build. Weighted shares are possible by changing turn frequency, but the paper does not specify those implementation details. Connection tracking provides affinity for established flows while entries remain valid and the backend is healthy; it does not guarantee old connections survive backend failure or membership changes. Maglev does not replicate application data or guarantee application-level session state.

The original paper notes that weighted backends can be supported by changing how often backends take turns, but does not specify the implementation details. Do not infer a particular weight algorithm from the paper.

## Cross-item comparison

Maglev is tuned for fast network load-balancer lookup with a precomputed table. Jump consistent hash uses little memory and computes a bucket from a sequential bucket count but is not a weighted arbitrary-backend table. Rendezvous hashing directly ranks candidate nodes per key and can be computed independently, though naive evaluation scores each candidate. A classic ring supports token ranges and replica walks. Compare lookup work, table memory/build time, weights, membership agreement, connection affinity, and how much reassignment a change creates.

## Examples

An edge load balancer hashes a flow identifier and uses the table to select one of 100 backends. If backend B fails its health checks, the control plane removes B and rebuilds the table. New flows map using the new table; existing-flow behavior depends on connection tracking and the failure policy. Evaluate the fraction of other flows remapped, table rebuild time, health-check delay, and whether application sessions are stored outside the backend.

## Common mistakes

- Calling the table lookup a health check; health and membership are maintained separately.
- Assuming minimum disruption means zero remapping or that old connections never reset.
- Assuming Maglev minimizes remapping as strongly as ring/rendezvous hashing; Maglev prioritizes even backend shares.
- Assuming every Maglev implementation provides the same connection tracking or weighted-backend policy as Google’s system.
- Treating consistent backend selection as durable session state or replicated data.
- Assuming arbitrary backend weights are handled by the paper's fully specified algorithm.

## Knowledge checks with answers

1. **Why can Maglev perform a fast runtime lookup?** Backend assignment is precomputed in a fixed-size table, so selection is a hash plus a table lookup.
2. **What happens when a backend is removed?** The table is rebuilt to limit disruption, but some mappings change; connection tracking and health policy affect live flows.
3. **Does Maglev copy application data or preserve application session state?** No. It maps traffic; state ownership and replication are separate design problems.
