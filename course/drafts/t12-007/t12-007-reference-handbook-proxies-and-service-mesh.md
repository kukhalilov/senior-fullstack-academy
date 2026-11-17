# system design technology landscape and selection — Reference: Proxies and service mesh

Sources: [HLD Handbook](https://hld.handbook.academy/technologies/), [reference 1](https://www.postgresql.org/docs/current/), [reference 2](https://kafka.apache.org/documentation/), [reference 3](https://grpc.io/about/), [reference 4](https://grpc.io/docs/what-is-grpc/core-concepts/), [reference 5](https://graphql.org/learn/), [reference 6](https://cloud.google.com/spanner), [reference 7](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Introduction.html), [reference 8](https://vitess.io/docs/24.0/overview/whatisvitess/), [reference 9](https://docs.scylladb.com/manual/master/using-scylla/cassandra-compatibility.html).

## Scope and version

This is a conceptual reference, not a vendor configuration guide. The supplied list below is the complete named scope for this lesson. Exact service limits and implementation details vary; consult the cited standard or current product documentation before deployment.

## How this group fits the mental model

These concepts are tools for solving different parts of the system path. Select them from workload, correctness, and failure requirements. Combining tools does not automatically compose their guarantees.

## Supplied names explained

- `Nginx` — Web server and reverse proxy; evaluate routing, TLS, caching, and configuration needs. Selection check: compare workload fit, consistency and durability needs, query/access pattern, latency, failure/recovery behavior, deployment and operational ownership, ecosystem, cost, and migration path. Validate exact current behavior against the product's own documentation.
- `Envoy` — Programmable proxy used for service and edge traffic; evaluate dynamic configuration, protocol support, and operations. Selection check: compare workload fit, consistency and durability needs, query/access pattern, latency, failure/recovery behavior, deployment and operational ownership, ecosystem, cost, and migration path. Validate exact current behavior against the product's own documentation.
- `HAProxy` — Load balancer and proxy; evaluate transport/application routing, health, and deployment needs. Selection check: compare workload fit, consistency and durability needs, query/access pattern, latency, failure/recovery behavior, deployment and operational ownership, ecosystem, cost, and migration path. Validate exact current behavior against the product's own documentation.
- `Kong` — API gateway platform; compare gateway policy and plugin requirements with a general-purpose proxy. Selection check: compare workload fit, consistency and durability needs, query/access pattern, latency, failure/recovery behavior, deployment and operational ownership, ecosystem, cost, and migration path. Validate exact current behavior against the product's own documentation.
- `Istio` — Service-mesh platform; evaluate identity, traffic policy, telemetry, sidecar/control-plane complexity, and alternatives. Selection check: compare workload fit, consistency and durability needs, query/access pattern, latency, failure/recovery behavior, deployment and operational ownership, ecosystem, cost, and migration path. Validate exact current behavior against the product's own documentation.
- `Linkerd` — Service-mesh platform; compare its operating model and feature scope against the actual service-network requirements. Selection check: compare workload fit, consistency and durability needs, query/access pattern, latency, failure/recovery behavior, deployment and operational ownership, ecosystem, cost, and migration path. Validate exact current behavior against the product's own documentation.

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