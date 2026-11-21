# system design tradeoffs and decision methods — Reference: Vertical vs horizontal scaling

Sources: [HLD Handbook trade-off index](https://hld.handbook.academy/trade-offs/), [Azure autoscale concepts](https://learn.microsoft.com/en-us/azure/azure-monitor/autoscale/autoscale-overview), [Azure scale-out design](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out).

## Scope and version

Vertical scaling gives one instance more CPU, memory, storage, or network capacity. Horizontal scaling adds or removes instances, often requiring stateless request handling, load distribution, shared or partitioned data, and coordination.

## How this group fits the mental model

Scale up when one larger resource is simpler and within hardware/product limits; it can be a practical first move and avoids distributed coordination. Scale out when capacity, redundancy, or elasticity requires multiple instances. It does not multiply throughput automatically: locks, shared databases, hot keys, network, and synchronization can become bottlenecks. Scale out/in also changes membership and requires graceful draining and state management.

## Supplied names explained

- `Vertical vs horizontal scaling` — Vertical scaling increases resources within a node and may simplify stateful operation until limits or failure concentration dominate; horizontal scaling adds nodes and requires distribution, coordination, and capacity management.

## Cross-item comparison

Diagnose CPU, memory, I/O, lock contention, queue depth, and downstream saturation before selecting. Scale vertically for quick, low-complexity headroom when a suitable tier exists. Scale horizontally for independent stateless capacity or fault tolerance, after removing per-instance state and validating that dependencies scale too. Autoscaling has detection/cold-start delay and should include scale-in safety.

## Examples

An API fleet scales from 3 to 8 instances but stores login sessions only in process memory. Requests routed to a new instance appear logged out. Move sessions to a shared store or use stateless protected tokens, make background jobs single-owner/partitioned, and check the database connection pool before scaling further. Then test scale-in while requests and jobs are active.

## Common mistakes

- Scaling app instances while the bottleneck is a saturated database or external API.
- Assuming doubling instance count doubles throughput despite shared bottlenecks.
- Scaling in without draining connections, handling in-flight jobs, or preserving data.
- Ignoring per-instance sessions, caches, timers, and key material.

## Knowledge checks with answers

1. **What changes when scaling vertically?** Capacity of one instance.
2. **What new design requirement usually appears when scaling horizontally?** Distributing requests/state and handling shared bottlenecks and instance membership.
3. **Why can adding web servers make the database slower?** More concurrent requests and connection pools can overload the shared database.
