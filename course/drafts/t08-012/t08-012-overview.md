# scaling availability replication sharding load balancing — Big-picture orientation and mental model

Sources: [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out), [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability), and [highly available systems](https://docs.cloud.google.com/architecture/framework/reliability/build-highly-available-systems).

## Problem and purpose

A successful service eventually faces limits in compute, memory, storage, network, or a shared dependency. Scaling adds useful capacity. Availability design keeps the service usable when components fail. Replication provides additional copies; partitioning divides ownership; load balancing directs work; recovery planning defines what data loss and downtime the business will accept.

These techniques solve related but different problems. Adding web instances does not fix a database bottleneck. A replica can improve recovery or read capacity but does not automatically make data current. A shard can distribute storage but creates routing and rebalancing work. Redundant instances in the same failure domain can fail together.

## Plain-language mental model

Imagine a busy workshop. Vertical scaling gives one workstation a stronger machine. Horizontal scaling adds workstations. A load balancer assigns incoming jobs. A queue can smooth bursts when jobs may be processed later. Replication keeps another copy of records; sharding assigns each record to one owner. A deployment stamp is a whole independent workshop serving a defined group of customers.

The workshop is only available if the entire path works: routing, application, data, network, and required dependencies. A spare workstation does not help if every workstation depends on the same failed power supply. Recovery objectives describe how long customers may wait and how much acknowledged data the business can lose.

## How the parts fit together

1. Measure demand and identify the bottleneck before adding capacity.
2. Scale a resource vertically while a single larger unit remains practical; scale horizontally when independent instances or partitions can share work.
3. Remove unnecessary shared state and coordination; bound work with admission control, queues, and back-pressure.
4. Place redundancy across independent failure domains and ensure health decisions reflect whether an instance can actually serve traffic.
5. Replicate data when copies help availability or read distribution; partition data when ownership, storage, or throughput must be divided.
6. Route requests using a policy suited to protocol, request duration, health, locality, and session state.
7. Set RTO and RPO, test restore/failover/failback, and separate recoverable backups from live replicas.
8. Use shards, deployment stamps, or cells when the operational isolation and scaling benefit outweighs routing and coordination complexity.

## Concept map

| Goal | Tool or design dimension | Key risk |
|---|---|---|
| More capacity on one node | Vertical scaling | Physical and economic ceiling |
| Add independent capacity | Horizontal scaling and elasticity | Shared bottlenecks and state |
| Stay available after failure | Redundancy and independent failure domains | Correlated failures and unsafe promotion |
| Copy data | Replication | Lag, stale reads, split brain, lost writes |
| Divide data ownership | Partitioning or sharding | Skew, hot partitions, cross-shard work |
| Distribute requests | Load balancing and routing | Health mistakes, connection state, uneven work |
| Isolate a customer group | Deployment stamps or cells | More deployments, routing, and operations |
| Recover to business tolerance | RTO, RPO, backups, tested procedures | Unverified recovery assumptions |

## End-to-end walkthrough

Suppose a multi-tenant API has growing traffic and a single primary database. First measure request rates, queueing, CPU, storage, and database latency. If the application tier is the bottleneck, stateless instances can be added behind a health-aware router; session state must not depend on one process. If the database is saturated, more API instances may increase pressure. Read copies can serve selected reads when staleness is acceptable, while partitioning can divide stored ownership and write load.

If tenants differ greatly in size, one partition key may create a hot tenant. A shard map or tenant-to-stamp assignment can route work, but global queries and cross-owner transactions become more complicated. Deploying whole isolated stamps may contain failures and allow controlled rollout, but increases operational overhead.

For a regional outage, the team needs a tested recovery plan: define acceptable downtime and acknowledged-write loss, know which copy is promotable, fence the former writer, restore or replay data when required, and verify application routing. A replica may have recent data but is not a substitute for a backup against accidental deletion or corruption.

## When to use it and tradeoffs

Scale vertically first when the resource and budget have headroom and operational simplicity matters. Scale horizontally when work can be distributed and shared dependencies can also support the added demand. Add replication for availability/read scale only after defining consistency and promotion behavior. Partition when a single data owner has reached a real capacity limit, not as a default complexity tax. Choose request routing based on observed workload, and use independent stamps/cells where isolation, tenant locality, or controlled rollout justifies duplicated infrastructure.

Every design needs load and failure tests. An architecture diagram with multiple boxes does not prove that failure domains are independent, health checks are meaningful, or recovery meets the stated objectives.

## What later lessons cover

Reference lessons explain capacity and scaling, availability and failure domains, replication and recovery, routing/load-balancing algorithms, and partitioning/shards/stamps. Practice and interview lessons apply them to bottlenecks, region loss, hot partitions, replica staleness, and customer isolation.
