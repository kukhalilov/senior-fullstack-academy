# system design tradeoffs and decision methods — Interview questions and reasoning

Sources: [HLD Handbook](https://hld.handbook.academy/trade-offs/), [reference 1](https://www.rfc-editor.org/rfc/rfc9110), [reference 2](https://www.postgresql.org/docs/current/mvcc.html), [reference 3](https://sre.google/sre-book/table-of-contents/), [reference 4](https://groups.csail.mit.edu/tds/papers/Gilbert/Brewer2.pdf), [reference 5](https://www.cs.umd.edu/~abadi/papers/abadi-pacelc.pdf).

## Core questions

1. What user outcome and invariant does the system protect?
2. What is the workload shape and likely bottleneck?
3. Which data is authoritative, and what can be stale or rebuilt?
4. What happens after timeout, duplicate delivery, or partial failure?
5. How are identity, tenant isolation, privacy, and abuse handled?
6. Which signals prove the design meets its objectives?

## Concise interview answers

For every proposed mechanism, answer: what requirement does it meet; what is the simpler alternative; what guarantee is actually provided; what fails during timeout, partition, retry, or recovery; how is it operated; and what evidence would change the decision? Avoid false dichotomies: hybrids are valid when boundaries and guarantees are clear.

Use a one-sentence format: “I would use **[mechanism]** for **[requirement]**, because **[workload/invariant]**; its main cost is **[cost]**, and if **[failure]** occurs, **[behavior/recovery]**.”

Examples:

- “I would keep inventory reservation in one transactional authority because selling the final unit twice is forbidden; regional browsing can use stale replicas, while an isolated region must queue or reject reservations.”
- “I would publish from a transactional outbox to a retained log because billing and analytics need independent replay; consumers deduplicate event IDs, and lag is monitored against a freshness objective.”
- “I would add cache-aside for public catalog reads only after query profiling; the database remains authoritative, the cache key excludes user-specific data, and invalidation plus TTL bounds staleness.”

## Deep follow-up answers

A strong design starts with a concise requirements summary and states assumptions. It estimates only enough to drive architecture, traces one write and read, then examines hot keys, data growth, backpressure, failure domains, and recovery. It names the limits of every mechanism and leaves time to summarize decisions and unresolved risks.

## Scenario questions

- **A database commit may have succeeded although the caller timed out.** A timeout is an unknown outcome. The API accepts an idempotency key, stores it with the operation result, and returns the prior result for a repeat. For an external provider, reconcile by provider operation ID before charging again.
- **Traffic grows tenfold but one tenant drives it.** First measure request cost, tail latency, quota use, hot keys, and downstream saturation. Apply tenant budgets/fair scheduling or isolate capacity. Partition only after the access pattern shows a storage bottleneck; a single hot tenant can remain on one hot partition.
- **The queue depth is healthy but users report delayed work.** Inspect age of oldest message, enqueue-to-complete latency, consumer lag, retry/DLQ rate, and job traces. Depth alone misses a growing backlog of old work or slow processing.
- **A deployment changes API and schema while old instances remain.** Expand first with backward-compatible fields, deploy tolerant readers, then new writers, backfill, observe, and contract only after old versions are gone. Rollback at each stage must remain compatible.
- **Two regions accept conflicting writes.** Merge only operations with a defined commutative rule. For noncommutative invariants such as balances or last-unit inventory, use one authority, escrow/partitioned rights, or coordination, and explain behavior during a partition.
- **A global read target is low latency but a transfer must not lose money.** Separate read locality from write correctness: regional replicas/caches can serve safe catalog views, while the transfer uses an authoritative transactional ledger and returns confirmed/pending status based on a durable result.

## Tradeoffs and alternatives

| Decision | Prefer option A when | Prefer option B when | Interview trap |
|---|---|---|---|
| SQL / relational vs a specific NoSQL model | Constraints, joins, transactions, and evolving query needs dominate | A concrete key/document/wide-column/graph access pattern benefits from partitioned placement or shape | “NoSQL scales; SQL does not” |
| Normalize vs denormalize | One authoritative fact is frequently updated and must remain consistent | A measured read path benefits from a projection with a clear refresh/rebuild contract | Treating historical snapshots as accidental duplication |
| Stronger coordination vs eventual convergence | A business invariant forbids conflicting accepted writes | Stale reads or mergeable updates are acceptable and the product defines reconciliation | Saying “eventual” as if it sets a freshness deadline |
| Leader-follower vs multi-leader/leaderless | One write authority simplifies conflict and invariant handling | Local writes/availability justify explicit conflict, quorum, and repair logic | Assuming topology alone specifies consistency |
| 2PC vs saga vs TCC | Participants can join a short common atomic commit protocol | Long-running steps need local commits/compensation (saga), or resources can be reserved then confirmed/cancelled (TCC) | Calling compensation a rollback |
| Scale up vs out | A larger node solves the measured bottleneck with acceptable limits | Independent capacity/fault tolerance needs justify statelessness, routing, and coordination | Assuming instances multiply throughput linearly |
| Cache-aside vs write-through vs write-behind | Read misses are cheap enough and stale cache can be invalidated | Warm read-after-write matters (through), or durable async writes are safe (behind) | Making a cache authoritative accidentally |
| Single vs multiple regions | Recovery target permits a simpler single-region authority | Geographic serving or regional recovery justifies replication and tested failover | Promising zero downtime/data loss without contract evidence |
| Monolith vs microservices | A cohesive product benefits from local calls and simpler transactions | Independent team/release/scaling/isolation needs outweigh distributed-system operations | Splitting by code size or technical layers |
| REST vs gRPC vs GraphQL | Resource HTTP/cacheability; typed RPC/streaming; or client-shaped data graph respectively | Caller needs at a different boundary justify a hybrid | Declaring one universally fastest or safest |
| Batch vs stream / Lambda vs Kappa | Bounded recomputation or two distinct completeness/freshness paths matter | Low-latency continuous processing and affordable replay favor one stream path | Ignoring late events, replay capacity, or duplicated logic |
| Polling/SSE/WebSocket/webhook; push vs pull | Choose by initiator, direction, connection lifetime, replay, and consumer pace | Combine transports when the user journey needs different semantics | Assuming transport guarantees durable, exactly-once work |

Always compare options at the same layer. A protocol, consistency model, topology, and storage engine answer different questions and should not be ranked in one flat list.

## Common weak answers

- “Use microservices, a cache, and a queue” without explaining the requirement each solves.
- “The request failed because it timed out” when the remote outcome is unknown.
- “We can scale horizontally” without addressing state, partitioning, or remaining capacity.
- “The system is available” without defining user-visible success, measurement, or recovery.
- Drawing components without explaining data ownership or operations.
- Listing many technologies without stating which one owns each invariant or what evidence supports the choice.

## Self-check rubric

Score 0–2 for each: requirements and assumptions; workload reasoning; correctness and ownership; read/write path; failure and recovery; security and privacy; observability and validation; cost and tradeoffs; clear communication. A strong answer scores 14–18, states uncertainty, and ties every major component to a requirement.
