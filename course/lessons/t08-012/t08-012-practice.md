# scaling availability replication sharding load balancing — Exercises and worked solutions

Sources: [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out), [Azure sharding pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding), [Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp), and [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability).

## Goals

Practice diagnosing bottlenecks, choosing a scaling unit, setting recovery objectives, explaining replica freshness, selecting a routing policy, and evaluating sharding/stamp tradeoffs. State assumptions before choosing a design.

## Worked example

A multi-tenant API has one application instance and a primary database. CPU on the application is 90%, database CPU is 35%, requests are mostly stateless, and sessions are stored in process memory.

1. Confirm that the load test represents realistic request sizes and concurrency.
2. The application tier is the current bottleneck; adding application instances may help only after session state can be externalized or safely represented per request.
3. Put the instances behind health-aware routing and ensure drain behavior for deployments and scale-in.
4. Retest. If database load rises into saturation, the bottleneck migrated. Do not add application nodes indefinitely.
5. Use queueing only for work that can be asynchronous; bound accepted work and ensure consumers do not overload the database.
6. Define failure reserve: the target throughput should still work if one instance is unavailable.

The design decision follows measured evidence and an explicit capacity target rather than “horizontal scaling is always better.”

## Exercises

### Exercise 1 — Bottleneck migration

A service doubles its web instances. Throughput rises by 20%, database latency triples, and the queue grows. Explain the bottleneck migration and name two controls to prevent a cascading failure while the database is addressed.

### Exercise 2 — Set RTO and RPO

A payment service can tolerate at most 15 minutes of downtime and 30 seconds of acknowledged-write loss. Translate these into recovery objectives and describe one test for each. Why is a live replica alone not sufficient?

### Exercise 3 — Choose a read path

A user changes a profile and immediately reloads it. Reads are normally routed to a replica with measurable lag. Give two ways to preserve the user's read-after-write behavior and state the tradeoff.

### Exercise 4 — Find a health-check failure

Every application instance marks itself unready when one shared database has a brief outage; liveness also fails and restarts all processes. Explain the failure amplification and propose how liveness, readiness, and graceful degradation should differ.

### Exercise 5 — Select load routing

A fleet handles short and long requests, and some connections multiplex many requests. Compare round robin, least connections, and response-time routing. What measurements would you use before selecting one?

### Exercise 6 — Partition-key review

A tenant-ID hash puts tenants across shards, but one tenant creates half of all writes. What is the hot-partition problem? Compare isolating that tenant in a dedicated shard with assigning it to a separate deployment stamp.

### Exercise 7 — Failover safety

An old primary is slow but not fully disconnected when a replica is promoted. What is split brain, and what role does a fencing token play?

## Progressive hints

1. More workers can increase pressure on a shared dependency. Check queue depth, throughput, latency percentiles, and resource headroom by tier.
2. RTO is time to restore; RPO is acceptable data loss. A restore test must include timing and point-in-time validation.
3. Route a just-written client's read to the write owner or use a documented version/consistency mechanism.
4. Liveness asks about process progress; readiness asks whether it should receive work. Avoid restarting every process for a shared dependency outage.
5. A connection is not always one request or equal work. Collect active requests, duration, and target latency.
6. Hashing spreads tenants, not individual writes within one hot tenant. Both shard and stamp choices need routing/migration.
7. Promotion without fencing allows two writers. The token must be checked by the protected resource, not merely recorded in logs.

## Complete solutions

### Solution 1

The database became the bottleneck after the web tier gained capacity; the extra concurrency raised database latency and backlog. Apply admission control and bound concurrency/queue depth so work does not accumulate without limit. Reduce unnecessary database calls or scale/partition the data tier based on measurement. A queue is useful only if the work can wait and consumer rate remains within database capacity.

### Solution 2

RTO is 15 minutes; RPO is 30 seconds. For RTO, run a timed failover or restoration exercise and measure from declared failure to validated user-facing service. For RPO, generate acknowledged writes with timestamps, trigger the failure model, recover, and compare the newest durable record with the 30-second threshold. A live replica may lag, copy corruption/deletion, or lack historical state; backup and point-in-time restoration are also needed.

### Solution 3

One approach is to route that user's immediate reads to the primary for a bounded interval or until the read sees the written version. Another is a mechanism that waits until the replica has applied a known version/position, if the datastore supports that documented guarantee. The first concentrates reads on the writer; the second adds waiting and protocol-specific complexity. Do not claim read-after-write from an asynchronously lagging replica without such a mechanism.

### Solution 4

The shared database outage causes all instances to fail liveness, restart together, and lose capacity even if their processes are otherwise healthy. Liveness should detect a process unable to make progress, not simply a failed external dependency. Readiness can stop routing requests that require the database, while unrelated routes may remain ready. Graceful degradation may serve safe cached/read-only functionality and admission control can limit pressure until the dependency recovers.

### Solution 5

Round robin is simple but ignores current occupancy and request duration. Least connections can approximate load if each connection represents similar active work, but multiplexing makes the count misleading. Response-time routing can adapt to observed performance but feedback can lag or oscillate. Measure per-request duration, in-flight work, queueing, tail latency, errors, connection reuse/multiplexing, and target capacity under realistic load.

### Solution 6

Tenant-ID hashing spreads tenant count/volume only if tenant workloads are balanced; a dominant tenant becomes a hot partition. A dedicated shard isolates data/write load while keeping application deployment shared, but needs shard-map and migration management. A separate stamp isolates a larger service slice and can protect other tenants from noisy-neighbor effects, but duplicates more infrastructure and requires tenant assignment, capacity, and failover routing. Choose using observed resource, security, rollout, and isolation needs.

### Solution 7

Split brain is when the old and new primary both accept authoritative writes, creating divergent histories. A fencing token advances when ownership changes and the protected storage/resource rejects operations with an older token. Stopping old traffic alone may be insufficient if a paused former primary later resumes.

## Tests and edge cases

- Sudden peak arrives faster than autoscaling can provision.
- A shared dependency fails while application processes remain healthy.
- One availability zone fails during peak load.
- The primary fails immediately after acknowledging a write that replicas have not applied.
- A stale replica serves a read-after-write request.
- DNS caches keep clients routed to a failed region.
- A single tenant dominates one partition despite many balanced tenants.
- A shard move overlaps writes and retries.
- A long-lived connection remains during scale-in.
- An automatic retry repeats an operation whose commit status is unknown.

## Reflection questions

1. What is the measured bottleneck and what evidence supports it?
2. What throughput and latency target must remain available after one unit fails?
3. Which acknowledged writes can be lost in each failure scenario?
4. Does the chosen partition key match dominant queries and distribute actual load?
5. What breaks if a routing map, health signal, or regional control plane is unavailable?
