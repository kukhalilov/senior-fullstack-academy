# scaling availability replication sharding load balancing — Core concepts and how they fit together

Sources: [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out), [Sharding pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/sharding), [Deployment Stamps pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/deployment-stamp), and [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability).

## Learning objectives

- Diagnose a bottleneck before selecting a scaling technique.
- Distinguish throughput, capacity, elasticity, availability, reliability, and resilience.
- Explain independent failure domains, health checks, redundancy, graceful degradation, and recovery objectives.
- Compare replication with partitioning, and live replicas with backups.
- Select a request-distribution policy based on protocol and workload.
- Reason about shard-key skew, hot partitions, rebalancing, and independent service stamps.

## Prerequisites

Assume a service contains request-handling instances, stateful dependencies, network paths, and operational procedures. Capacity is workload-dependent: request size, concurrency, state, and dependency latency all matter. Availability concerns successful user-visible requests over time, not merely whether a process is running.

## Core concepts

### Capacity and scaling

Vertical scaling changes the resources of one unit. Horizontal scaling adds or removes units. Elasticity is the ability to adapt capacity to changing demand; autoscaling policy may react to current metrics, follow a schedule, or forecast demand. Scale-out helps only if work can be distributed and bottlenecks do not remain shared.

Little's Law relates average work in a stable system: average number of in-flight items L = arrival rate λ × average time W. It helps reason about concurrency and queues, but is not a capacity guarantee and does not replace load testing. Amdahl's law explains why speedup is limited by the serial fraction: parallelizing one tier cannot remove a bottleneck elsewhere.

Stateless instances make horizontal distribution easier, but sessions or other state may need an external owner. Sticky routing can preserve local session state but concentrates traffic and complicates draining and failover. Workload isolation and independent scaling boundaries prevent one workload from exhausting shared resources.

### Availability, reliability, and failure

Availability asks whether the service is usable at a given time or over a period; reliability is the probability of performing correctly over a period or operation. Resilience is the ability to withstand disruption and recover. Fault tolerance means a defined failure can be tolerated without unacceptable service interruption. Redundancy creates alternatives, but only independent failure domains reduce correlated failures.

Availability zones, hosts, processes, and regions are different failure boundaries. Two replicas on one host share a host failure; two hosts in one region can share regional dependencies. N+1 means capacity remains sufficient after one unit fails, under the assumed load and failure model. Active-active and active-passive describe how redundant deployments serve work; neither removes data-conflict and routing decisions.

Health probes have different purposes. Liveness indicates whether a process should restart; readiness indicates whether it should receive traffic; startup protects slow initialization from premature liveness failure. Dependency-aware readiness must be designed carefully: marking every instance unready when a shared dependency degrades can remove all capacity and worsen an outage.

RTO is the target maximum time to restore a service. RPO is the target maximum data loss measured in time. Graceful degradation limits functionality while retaining essential service. Disaster recovery tests validate the real end-to-end restoration path, permissions, data, routing, and timing.

### Replication, consistency, and recovery

Replication copies data from a writer or leader to one or more replicas. Synchronous replication waits for defined replica acknowledgements before success; asynchronous replication acknowledges earlier and accepts a larger lag/loss window. The exact guarantee depends on protocol and configuration. A read replica can serve load, but replica reads may be stale.

Strong consistency and eventual consistency describe different visibility guarantees; “eventual” needs assumptions about continued operation and convergence. Read-after-write consistency means a client sees its own completed write on a subsequent read, which may require routing reads to the writer or tracking versions. Quorum read/write rules depend on replica count, acknowledgement thresholds, and failure assumptions; a quorum slogan alone is not a consistency proof.

Split brain means multiple nodes act as authoritative writers at once. Fencing uses a monotonically advancing or otherwise unforgeable ownership token so a former owner cannot continue changing shared state after a new owner takes over. Promotion and failback require explicit data reconciliation/resynchronization, not just changing a route.

Replication is a live-copy mechanism. Backup and point-in-time recovery preserve recoverable historical state and protect against corruption or deletion; restore tests prove those copies and procedures work. Cross-region replication adds network delay, regional failure, conflict, and data-location considerations. Acknowledged-write loss window is the set of writes a system reported as successful but may lose under its failure model.

### Request distribution and data ownership

Layer 4 distributes connections using network transport information; Layer 7 understands application protocol and can route by request attributes. Global routing selects among regions or locations; local routing distributes within a site. DNS-based steering has resolver and cache behavior that can delay traffic changes. Latency or geographic routing must account for health and locality.

Round robin rotates assignments; weighted round robin allocates in proportion to configured weights; least connections favors fewer active connections; least response time uses observed latency; random samples a target; IP hash maps a source address consistently. Consistent hashing and rendezvous hashing aim to limit remapping when members change, but neither solves skew or hot keys by itself.

Active probes send checks; passive health uses observed request outcomes. Slow start gradually increases traffic to a newly healthy target. Connection draining stops new work while allowing in-flight work to finish. Retries at a router can duplicate non-idempotent operations and amplify overload. Fail-open/closed policies choose whether traffic continues when health evidence is unavailable.

Partitioning divides a data set by rows, columns, function, or geography. Database sharding is horizontal partitioning across independent data stores. A shard key maps records and queries to a shard; range, hash, and directory-based strategies have different locality, skew, and routing tradeoffs. Hot partitions and cross-shard queries can erase the expected scale benefit.

Deployment stamps and cells are independently deployed service slices. A stamp often serves a bounded tenant group; cells isolate capacity and failure impact. They may contain sharded data internally, but a whole service stamp is not the same thing as one database shard.

## Mechanisms and relationships

Scaling changes capacity; availability design changes how a system behaves when capacity or dependencies fail. Replication creates copies; partitioning assigns data subsets. A system may replicate each partition. Load balancing routes work; it does not make the destination scalable by itself. Autoscaling adds/removes capacity; safe scale-in requires draining work and releasing ownership. Recovery objectives translate reliability needs into procedures and storage guarantees.

## Worked examples

### Reading from a lagging replica

A write commits on the primary and returns success. An immediate read routed to a lagging replica can return the previous value. If read-your-write behavior is required, route the client's follow-up read to the primary or use a version/consistency mechanism whose guarantee is verified. “The data is replicated” is not enough.

### Choosing a shard key

Sharding by tenant ID may keep tenant queries local, but a single very large tenant can become a hot partition. A composite key or separating very large tenants may improve balance, at the cost of more routing and cross-partition operations. Measure skew and the dominant query patterns before deciding.

## Misconceptions and edge cases

- More instances do not fix a saturated shared database.
- Redundancy in the same failure domain may fail together.
- A running process is not necessarily ready to serve correct requests.
- A replica is not a backup, and neither automatically satisfies RPO.
- Asynchronous replication can lose acknowledged writes during certain failures.
- A load-balancer retry can duplicate a write or make an overloaded dependency worse.
- Consistent hashing reduces remapping; it does not guarantee even load.
- A queue smooths bursts but grows without bound if average production exceeds consumption.
- Deployment stamps isolate whole service slices; database shards divide a data store.

## Knowledge checks with answers

1. Why measure the bottleneck first? **Adding capacity to a non-bottleneck tier may not improve throughput and can increase load on the actual bottleneck.**
2. What is the difference between replication and partitioning? **Replication copies data; partitioning divides ownership/data into subsets.**
3. What is RPO? **The target maximum acceptable data loss, commonly expressed as elapsed time.**
4. How does readiness differ from liveness? **Readiness controls traffic eligibility; liveness indicates whether a process should be restarted.**
5. Why is a shard key consequential? **It determines routing, query locality, skew, hotspots, and potentially expensive live migration.**
