# distributed systems consistency coordination and convergence — Reference: Data placement and mergeable state

## Scope and version

This conceptual lesson covers eight manifest items: consistent hashing, rendezvous hashing, hot partition, CRDT, state-based CRDT, operation-based CRDT, last-write-wins register, and split brain. Consistent-hash and rendezvous descriptions use their original research papers; the hot-partition and lease/fencing examples use current official guidance. CRDT claims are about the named formal models and their assumptions, not every library that uses the term.

## How this group fits the mental model

When a dataset outgrows one machine, first decide **which machine owns each key**. Then decide **what happens to that ownership when machines join, leave, or become overloaded**. If multiple places may accept changes to the same logical object, decide **how versions merge**. Finally, if one node is supposed to be the sole writer, decide **how the data resource rejects a stale former owner**.

These questions are related but separate. Consistent hashing and rendezvous hashing assign placement; they do not replicate data or resolve edits. CRDTs define merge behavior for specific data types; they do not choose shard placement. A hash placement scheme also cannot make a single hot key’s operations parallel without changing the workload or data model.

## Supplied names explained

### Consistent hashing

Consistent hashing maps keys and nodes into a common hash space. In a ring design, a key is assigned to a node encountered according to the ring’s ownership rule. The key property is **limited remapping** when the set of destinations changes: adding or removing one node need not reassign nearly every key, as a simple `hash(key) mod nodeCount` scheme often does. It does not guarantee perfectly balanced data or request load. Virtual nodes, weights, replication factor, token assignment, rebalancing, and skewed keys affect the result and operational cost.

### Rendezvous hashing (highest random weight)

For a key and each candidate node, compute a deterministic score from the pair; assign the key to the node with the highest score. Clients with the same key, node set, and scoring function choose the same owner. When a node is added or removed, the winners change only for keys whose ranking is affected. Basic evaluation scores every candidate, so routing cost grows with the candidate set; more advanced variants can reduce that cost. It is often simpler than maintaining a ring, but neither method inherently balances a hot key’s request volume.

## Cross-item comparison

### Consistent hashing versus rendezvous hashing

Both aim for stable mappings as the node set changes. A ring makes ordered token ranges and replica walks natural; rendezvous ranking is a direct per-key ranking over the candidate set and is straightforward to compute independently at clients. Compare memory and lookup cost, weighted-node support, replication needs, failure/removal behavior, and how node membership stays consistent. The name “consistent” does not mean strongly consistent data.

### Placement algorithms named by the Handbook

The Handbook's consistent-hashing module also names bounded-load hashing, Maglev, and jump consistent hash. They solve different placement constraints:

- **Bounded-load consistent hashing** adds a capacity rule to a preferred consistent-hash assignment. The cited construction bounds the maximum number of keys per server under its mathematical model while keeping expected reassignment low. That does not bound request rate or bytes when keys are skewed.
- **Maglev** precomputes a fixed-size lookup table for fast network load-balancer backend selection and aims for near-equal table shares with limited disruption after membership changes. Table size trades memory/build work against balance and remapping; connection tracking is a separate mechanism.
- **Jump consistent hash** maps keys to consecutively numbered buckets using little memory and computation. It is a natural fit when bucket count changes by appending/removing the final bucket; it is not a direct weighted mapping over arbitrary server IDs.

These algorithms do not automatically copy data, migrate partitions, replicate state, or solve a hot key. A production design needs a membership/configuration source, a versioned assignment rule, and a safe data-movement or connection transition plan. The Handbook's examples are a syllabus map, not a claim that these methods are drop-in substitutes.

### Hot partition

A partition is hot when it receives far more requests or work than the others. The cause may be a skewed partition key, a popular tenant, or a single high-traffic key. Adding machines does not help if the hot traffic still maps to one partition. Remedies depend on semantics: choose a more even key, split a tenant or range, add read replicas/caches, isolate noisy tenants, or salt a write key and aggregate later. Salting spreads writes but can turn a simple read or update into a fan-out/merge operation and can complicate transactions and ordering. Measure request rate, bytes, CPU, storage, and contention per partition; equal data sizes do not imply equal load.

The Handbook's data-systems examples include consistent-hash placement for Dynamo-style databases, distributed caches, and Kafka partition assignment. These are application contexts, not a single shared implementation: Kafka's partition assignment and consumer-group protocols have their own rules, while cache/database systems may use ring tokens, replica walks, or different balancing mechanisms. Choose based on the actual system contract.

### Conflict-free replicated data type (CRDT)

A CRDT is a replicated data type designed so replicas can accept operations and later converge according to formally defined merge rules. “Conflict-free” does not mean that updates can never conflict with product intent. The chosen data type determines the meaning of concurrent updates. A counter may safely add independently; an account balance with a nonnegative invariant may need coordination or a different design. Check the type’s assumptions about delivery, causal order, duplicate operations, metadata growth, and deletion before using it.

### State-based CRDT (CvRDT)

Replicas periodically send state (or a delta representing state changes) and merge the received state. In the classic CvRDT model, states form a join-semilattice, local updates move state monotonically upward, and merge computes a least upper bound. The join is associative, commutative, and idempotent, so order and duplicate delivery do not change the result; eventual delivery and terminating operations are still assumptions. Sending state can be expensive, motivating delta-state variants and careful anti-entropy design.

### Operation-based CRDT (CmRDT)

Replicas disseminate operations rather than full state. In the classic CmRDT model, concurrent operations must commute and updates are delivered reliably in causal order (with relevant delivery preconditions satisfied). This can reduce communication for small operations, but puts stronger demands on the dissemination layer and operation semantics. “Operations commute” must hold for every permitted concurrent pair and reachable state; it is not enough that the happy-path example works.

### State-based versus operation-based CRDTs

State-based designs send mergeable state and can tolerate reordered/duplicate state merges under the semilattice rules, but state payloads may be larger. Operation-based designs send compact operations but require causal delivery and concurrent-operation commutativity in the original model. Real implementations include delta-state and other variants, so compare the library’s formal contract instead of assuming the classic model from its label.

### Last-write-wins register (LWW register)

An LWW register stores a value with a timestamp or ordered version and chooses the maximum according to a deterministic comparison rule, often including a tie-breaker. This provides convergence only if all replicas apply the same ordering rule and receive the updates under the model’s assumptions. It may discard a concurrent value that represents a meaningful user action. Physical-clock skew can make “last” differ from actual causality. Prefer explicit versions, conflict presentation, domain merges, or coordination when losing concurrent writes is unacceptable. Cassandra and DynamoDB global tables are examples of specific implementations with their own documented reconciliation behavior; they are not interchangeable contracts.

### Split brain

Split brain occurs when isolated parts of a system each act as the authoritative owner for overlapping data or work. They can accept conflicting writes or both perform a supposedly exclusive side effect. A timeout or lease by itself does not stop a paused old owner from resuming and sending a delayed write. A common defense is a monotonically increasing fencing token that the protected resource checks on every write; stale tokens are rejected. Consensus/quorum rules can determine who may lead, but any downstream resource outside that authority boundary must still enforce ownership or fencing. Split brain is about conflicting authority, not merely having two healthy replicas.

## Examples

### Partitioning a live order feed

Suppose order records are distributed by customer ID.

1. `hash(customerId) mod N` is simple, but increasing `N` can remap a large share of keys. Consistent hashing or rendezvous hashing can reduce remapping when the node set changes.
2. A very large retailer becomes a hot partition even though the hash function spreads ordinary customers evenly. The issue is concentration of traffic for that tenant, not a defective hash function.
3. Split the retailer’s activity by order ID or time bucket, or salt the write key and aggregate for reads. Check how this affects “show my newest orders,” updates, and cross-shard pagination.
4. If users can edit separate profile fields while disconnected, a map CRDT may merge them. If two edits target the same scalar field, an LWW register may choose one and discard the other; decide whether that is acceptable.
5. If a worker owns payment reconciliation, a partition may cause another worker to become leader while the first is paused. Require a fencing token at the payment database or gateway before accepting the old worker’s delayed action.

### When a counter is a CRDT fit

For a “likes received” display, independent per-replica increments may merge into a grow-only counter if the implementation tracks each replica’s contribution and operations are not double-counted. For “available seats,” independent increments and decrements may violate the rule that inventory never becomes negative. A CRDT can be built with escrow/rights allocation for some constrained operations, but that adds a protocol and changes how rights move. Define the invariant before selecting the data type.

## Common mistakes

- Assuming consistent hashing means balanced load; it primarily limits remapping and needs balancing mechanisms/measurement.
- Assuming rendezvous hashing or a hash ring copies the data or makes it consistent.
- Adding nodes to fix a hot key when that key still routes all work to one owner.
- Salting keys without designing the read, aggregation, and update path.
- Calling an object a CRDT without checking its delivery, merge, concurrency, and metadata assumptions.
- Treating LWW as “the user’s true last edit” when clocks or tie-breakers define the winner.
- Treating a lease holder as exclusive without making the protected resource reject stale owners.
- Believing a leader-election service protects external side effects that do not validate a fencing token or current authority.

## Knowledge checks with answers

1. **A cluster grows from 10 nodes to 11. What does consistent hashing mainly help reduce?** The amount of key remapping compared with naive modulo placement; it does not guarantee balanced request rates.
2. **All customers are evenly distributed, but one celebrity customer gets 40% of writes. Is the hash function necessarily wrong?** No. The tenant’s partition is hot because its workload is skewed; split, salt, isolate, or redesign that tenant’s access pattern.
3. **Why can a state-based CRDT tolerate duplicate or reordered state merges in the classic model?** Join is idempotent, commutative, and associative, assuming valid monotonic states and eventual delivery.
4. **What extra network assumption does the classic operation-based CRDT model use?** Reliable causal delivery, plus concurrent operations that commute and any delivery preconditions being satisfied.
5. **Does LWW mean the update performed later in real life always wins?** No. The comparison uses the implementation’s timestamp/version and tie-break rule; clock skew can disagree with real-world causality.
6. **Why can two workers both act after a lease timeout?** The old worker may be paused or partitioned and later resume with a delayed request. The resource must check fencing/current ownership, not rely only on the coordinator’s lease view.

## Sources and scope

- Karger et al., “Consistent Hashing and Random Trees”: [paper](https://people.csail.mit.edu/karger/Papers/web.pdf)
- Thaler and Ravishankar, “A Name-Based Mapping Scheme for Rendezvous”: [technical report](https://www.eecs.umich.edu/techreports/cse/96/CSE-TR-316-96.pdf)
- DeCandia et al., “Dynamo: Amazon’s Highly Available Key-value Store”: [paper](https://assets.amazon.science/ac/1d/eb50c4064c538c8ac440ce6a1d91/dynamo-amazons-highly-available-key-value-store.pdf)
- Azure Architecture Center, [Data partitioning guidance](https://learn.microsoft.com/en-in/azure/architecture/best-practices/data-partitioning)
- Shapiro et al., “Conflict-free Replicated Data Types”: [paper](https://pages.lip6.fr/Marc.Shapiro/papers/CRDTs_SSS-2011.pdf)
- Cassandra 5.0, [Dynamo architecture and consistency](https://cassandra.apache.org/doc/stable/cassandra/architecture/dynamo.html)
- Amazon DynamoDB, [global tables conflict resolution](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/globaltables_HowItWorks.html)
- Burrows, “The Chubby Lock Service for Loosely-coupled Distributed Systems”: [paper](https://research.google/pubs/the-chubby-lock-service-for-loosely-coupled-distributed-systems/)
- etcd v3.6, [lease and lock limitations](https://etcd.io/docs/v3.6/learning/why/)
- Handbook, [Distributed Systems Theory module 3.9](https://hld.handbook.academy/curriculum/distributed-systems-theory/)
- Mirrokni, Thorup, and Zadimoghaddam, [Consistent Hashing with Bounded Loads](https://arxiv.org/abs/1608.01350)
- Google Research, [Maglev: A Fast and Reliable Software Network Load Balancer](https://research.google.com/pubs/archive/44824.pdf)
- Lamping and Veach, [A Fast, Minimal Memory, Consistent Hash Algorithm](https://arxiv.org/abs/1406.2294)
