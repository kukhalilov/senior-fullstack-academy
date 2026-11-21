# system design technology landscape and selection — Reference: Coordination and service discovery

Sources: [HLD Handbook technology index](https://hld.handbook.academy/technologies/), [ZooKeeper internals and guarantees](https://zookeeper.apache.org/doc/r3.9.3/zookeeperInternals.html), [etcd API guarantees](https://etcd.io/docs/v3.6/learning/api_guarantees/), [etcd data model](https://etcd.io/docs/v3.6/learning/data_model/), [Consul service discovery](https://developer.hashicorp.com/consul/docs/discover), [Consul service definitions](https://developer.hashicorp.com/consul/docs/fundamentals/service).

## Scope and version

This lesson compares ZooKeeper, etcd, and Consul for coordination and service discovery. These systems have different data models and interfaces; exact guarantees should be checked against the deployed version. A registry provides information used to route to services. It does not itself make a service healthy, reachable, or safe to call.

## How this group fits the mental model

Coordination systems help independent processes agree on small, shared pieces of control-plane state: membership, configuration, leader ownership, or a lease. This is distinct from storing high-volume application records. They typically use a quorum/consensus protocol for strongly coordinated writes, which means operations depend on a functioning quorum and incur coordination cost.

Service discovery answers “where are instances of this logical service?” Registration, health reporting, name resolution, and load balancing are separate parts of the path. A DNS answer or watch event can become stale before a client uses it; clients still need connection timeouts, retries with limits, and graceful handling of unavailable instances.

## Supplied names explained

- **ZooKeeper** — A coordination service exposing a hierarchical namespace, data nodes (znodes), sessions, and watches. It is used for coordination metadata and patterns built on ephemeral/session-related state. Its documented atomic broadcast and quorum model provide ordering and consistency properties; client reads and watches have specific semantics and are not equivalent to a global transaction over an application database. Watches are notifications to re-read state, not a durable event bus. ZooKeeper is not intended as a general high-throughput application database.
- **etcd** — A distributed key-value store commonly used for configuration, membership, and coordination (including as Kubernetes’ backing store). It offers revisioned key-value data, transactions, watches, and leases. Its KV operations are linearizable by default through Raft consensus; serializable reads can trade freshness for lower latency. Watches are ordered/reliable within retained history but are not themselves linearizable and may need resumption from a revision. Compaction bounds history. Leases expire keys after keepalive stops, but a lease alone does not prevent a paused former owner from making stale writes to an external system; fencing tokens or downstream validation may be needed.
- **Consul** — A service networking platform with a catalog, service registration, health checks, DNS/API discovery, and service-mesh capabilities. Health checks update catalog information and discovery can return healthy instances. Consul can support service-to-service connectivity and policy, but its registry and mesh functions should be evaluated separately from any orchestrator’s built-in discovery. Consul’s use of Raft for catalog replication does not imply every lookup is a linearizable read under every mode; consult its consistency settings and API contract.

## Cross-item comparison

| Requirement | ZooKeeper | etcd | Consul |
|---|---|---|---|
| Coordination namespace and watches | Core fit, with session/watch patterns | Revisioned KV, transactions, leases, resumable watches | KV/catalog and service-network features |
| Service registry/DNS as primary workflow | Possible via clients/ecosystem, not the core framing | Usually a building block rather than full service catalog UX | Explicit first-class discovery/catalog workflow |
| Lease/session semantics | Sessions and ephemeral nodes support membership patterns | TTL leases attach to keys; design fencing for external effects | Health checks and catalog state; service-mesh options also exist |
| Main caution | One-shot watch and client-session semantics require careful re-read/re-register logic | Watch history compaction, quorum dependency, lease/fencing limits | Health is a sampled signal; registry visibility and live reachability can diverge |

Do not use any of these as a lock without defining ownership, lease expiry, fencing, and stale-client behavior. For many applications, platform DNS or orchestrator-native service discovery is sufficient and simpler.

## Examples

### Leader ownership

Workers need one active scheduler. A candidate acquires an expiring lease and publishes its ownership record. The scheduler receives a monotonically increasing fencing token. Every downstream write validates that token, so a paused old leader cannot resume after lease expiration and overwrite newer work. The system monitors quorum health; if quorum is unavailable, it stops safely rather than allowing two leaders.

### Service lookup

An API service resolves the logical name `catalog` through DNS or a registry API. It gets a set of endpoints, connects with a deadline, and applies bounded retries only for operations safe to retry. Registry health reduces the chance of selecting a bad instance, but connection errors and stale endpoint data remain normal runtime cases.

## Common mistakes

- Storing ordinary business records or large payloads in a coordination store.
- Treating a lease as a complete distributed lock without fencing stale owners.
- Treating a watch notification as a complete event log instead of re-reading authoritative state.
- Assuming a healthy registry entry proves that the next network call will work.
- Forgetting that quorum loss can stop coordinated writes and that this is a safety property, not necessarily a defect.
- Introducing a separate registry when the deployment platform already provides adequate discovery.

## Knowledge checks with answers

1. **What does a service registry tell a caller?** It provides a current-ish mapping from a service identity to candidate instances, not a guarantee of their future availability.
2. **Why use a fencing token in addition to an expiring lease?** A paused former lease holder can continue running after expiry; downstream systems can reject its older token.
3. **Are etcd watches linearizable?** No. The documented watch stream is ordered and resumable within history, but KV operations have the default linearizability guarantee; watch clients must reason about revisions and compaction.
4. **When is a coordination database the wrong tool?** When ordinary application data, high-volume event history, or a durable business workflow is being placed there without a clear coordination need.
