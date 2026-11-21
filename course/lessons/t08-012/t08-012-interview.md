# scaling availability replication sharding load balancing — Interview questions and reasoning

Sources: [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out), [Azure sharding pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding), [Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp), and [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability).

## Core questions

1. When do you scale vertically versus horizontally?
2. Why can adding application instances reduce overall performance?
3. What is the difference between availability, reliability, resilience, and fault tolerance?
4. How do liveness, readiness, and startup checks differ?
5. What are RTO and RPO, and how would you test them?
6. Compare synchronous and asynchronous replication.
7. Why is a replica not a backup?
8. How do you prevent split brain during failover?
9. How do Layer 4 and Layer 7 routing differ?
10. How would you choose a load-balancer algorithm for long-lived connections?
11. What makes a shard key good, and why is it hard to change?
12. What is a hot partition and how might you address it?
13. Compare database sharding with deployment stamps or cells.
14. What can go wrong during online resharding?
15. How does a queue help capacity and what are its limits?

## Concise interview answers

1. Scale vertically while a single unit has practical headroom and simplicity is valuable. Scale horizontally when work can be divided and shared dependencies can support extra demand.
2. New instances can increase concurrent requests against a shared database, queue, or downstream service and move the bottleneck there.
3. Availability is user-visible service usability; reliability concerns correct operation over time; resilience is handling and recovering from disruption; fault tolerance is continued service under defined failures.
4. Liveness decides whether a process should restart; readiness controls whether it receives traffic; startup delays other checks during initialization.
5. RTO is target restore time; RPO is target data-loss window. Measure both through timed restoration and verified recovered data under a realistic failure.
6. Synchronous replication waits for configured acknowledgements and adds latency; asynchronous replication acknowledges sooner but can lag and lose acknowledged writes during some failures.
7. A replica mirrors current changes, including accidental deletion or corruption. A backup preserves a recoverable historical point.
8. Ensure one accepted writer using ownership change, fencing, or another protocol guarantee; do not rely only on routing updates.
9. Layer 4 routes using transport/network connection information; Layer 7 can use application-protocol data.
10. Measure request duration, in-flight work, and multiplexing. Connection count may not reflect workload, so least-connections may be misleading.
11. Prefer a stable, high-cardinality key that balances actual data/load and matches frequent queries. Changing it often requires moving and rerouting data.
12. A hot partition receives disproportionate work. Split/relocate data, isolate a hot tenant/key, redesign the access pattern, or add a suitable cache/read strategy.
13. Sharding divides data ownership; a stamp/cell repeats a larger service slice for a workload subset. A stamp can shard internally.
14. Writes can race with copying, routing can be stale, retries can duplicate work, and cutover can lose or double-apply changes.
15. A queue buffers asynchronous bursts and lets consumers process at a controlled rate. If producers exceed consumers on average, backlog and latency grow without bound.

## Deep follow-up answers

### How do you show that horizontal scaling will help?

Measure a realistic load test and identify saturation, queueing, and latency by tier. Estimate throughput after adding a unit, then retest because bottlenecks migrate. Verify application state can be shared or externalized, that routing distributes work, and that dependencies can absorb the higher concurrency. Test failure reserve as well as normal peak.

### What does a health check actually prove?

A probe proves only that a specific check succeeded at a point in time. Liveness should detect an irrecoverably stuck process; readiness should decide whether new work can be served; startup protects initialization. A shallow response can miss a broken request path, while a broad dependency probe can mark the entire fleet unhealthy when only one shared dependency is down. Make probe semantics and failure policy explicit.

### How do you define a replication guarantee?

Specify the writer model, acknowledgement policy, replica count/quorum, read routing, lag measurement, promotion/fencing, and failures covered. State whether successful writes can be lost and how client read-after-write is preserved. Avoid saying “zero data loss” without a precise guarantee and tested assumptions.

### What should a shard-key review include?

Analyze immutability, cardinality, distribution, hot keys, growth, tenant size, common point/range queries, cross-shard queries, and migration. Check both data volume and request rate. Include how new shards are mapped and how online moves coordinate writes.

### When would you choose cells or stamps?

Use independent slices when tenant or workload isolation, bounded blast radius, regional placement, or controlled rollout is worth repeating infrastructure and operational processes. Keep assignment, shared global dependencies, capacity reserve, and movement between slices explicit. A cell architecture does not magically isolate shared identity, DNS, control plane, or data services.

## Scenario questions

### Scenario A: Adding API nodes doubles database timeouts.

Find the shared bottleneck and describe immediate load controls and the longer-term capacity/design change.

### Scenario B: A replica is promoted after a primary disappears, but the former primary later returns.

Explain how to prevent two writers and how to reconcile any divergent state.

### Scenario C: Customers report that a profile update disappears on refresh only occasionally.

Investigate replica lag and read-after-write routing. Explain how to measure and give a bounded consistency strategy.

### Scenario D: One tenant causes most writes to a shard.

Compare a dedicated shard, a composite partition key, and a separate stamp. Identify migration and routing costs.

### Scenario E: Every readiness check fails during a database outage and the load balancer removes the fleet.

Explain how health policy could amplify failure and propose a service-specific readiness/degradation behavior.

## Tradeoffs and alternatives

| Choice | Helps with | Tradeoff |
|---|---|---|
| Vertical scaling | More capacity in one unit | Finite ceiling and shared failure |
| Horizontal scaling | Parallel capacity | State, coordination, shared dependencies |
| Synchronous replication | Smaller lag/loss window under defined assumptions | Write latency and acknowledgement dependence |
| Asynchronous replication | Lower writer wait | Lag and acknowledged-write loss possibility |
| Sharding | Storage and write distribution | Routing and cross-owner complexity |
| Stamp/cell | Workload isolation and independent rollout | More deployment and assignment operations |
| Active health check | Proactive target assessment | Probe may not match real path |
| Passive health check | Real traffic outcomes | Detection follows user impact |

## Common weak answers

- “Add more servers” without identifying the bottleneck.
- “The service is highly available because it has two instances” without failure-domain analysis.
- “A health check makes failover safe” without defining ownership/data state.
- “Synchronous means no data loss” without failure assumptions.
- “A replica is a backup.”
- “Consistent hashing guarantees balance.”
- “Least connections is always the best algorithm.”
- “The queue absorbs any traffic peak” without checking average rates and backlog.
- “A shard key is just a database detail” despite its effect on queries, routing, and migration.
- “A stamp is a shard” despite their different ownership scopes.

## Self-check rubric

Score each from 0 to 2: 0 = missing/incorrect, 1 = partially correct, 2 = clear and justified.

- Identifies the measured bottleneck and distinguishes capacity from availability.
- Explains state and dependency consequences of horizontal scaling.
- Uses independent failure domains and meaningful health semantics.
- Defines and tests both RTO and RPO.
- Explains lag, read consistency, promotion, and fencing.
- Distinguishes replication from historical recovery.
- Chooses routing with awareness of protocol and request duration.
- Reviews shard key, skew, cross-shard operations, and rebalancing.
- Distinguishes a data shard from a deployment stamp/cell.
- States queue growth and overload controls.

An interview-ready answer scores at least 15/20 and avoids unsupported absolutes such as “zero data loss” or “perfectly balanced.”
