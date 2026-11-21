# scaling availability replication sharding load balancing — Reference: Request distribution, health-aware routing, and connection lifecycle

Sources: [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out), [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability), and [highly available systems](https://docs.cloud.google.com/architecture/framework/reliability/build-highly-available-systems).

## Scope and version

This provider-neutral lesson covers routing, request distribution, health, and connection handling. Specific cloud load-balancer features and SKU behavior are outside this group.

## How this group fits the mental model

A router chooses where new work should go. Its policy should reflect what it can observe: connection count, request duration, health, location, or an affinity key. Existing connections and in-flight requests need a separate lifecycle policy when a target is removed.

## Supplied names explained

- `Load balancer` distributes incoming traffic across eligible destinations to improve capacity, availability, or locality. It cannot fix an overloaded shared dependency.
- `Layer 4 load balancing` routes at transport/network connection level, typically using address/port information. It generally cannot decide from application request contents.
- `Layer 7 load balancing` understands application protocols and can route using request attributes. This adds flexibility and parsing/work; encrypted traffic visibility depends on where termination occurs.
- `Reverse proxy` accepts client requests and forwards them to upstream services. It may handle TLS termination, routing, buffering, and policy; it is not proof of backend health.
- `Global load balancing` chooses among regions or sites. It needs regional health, locality, data consistency, and failover policy.
- `Local load balancing` distributes traffic among instances within a site or region. It cannot provide regional failover by itself.
- `DNS-based traffic steering` changes DNS answers to influence client destination. Resolver and client caches can delay a shift, so DNS changes are not instant failover.
- `Latency-based routing` chooses a destination using observed or estimated latency. Measurements can be stale and may conflict with data locality or capacity needs.
- `Geographic routing` selects a destination based on user or resource location. It can improve locality or meet data-location policy, but needs fallback if the local target is unhealthy.
- `Round-robin scheduling` cycles through eligible targets. It is simple but assumes targets and requests have similar capacity/work.
- `Weighted round robin` allocates turns according to target weights. Weights can represent capacity, but static weights may not reflect sudden load or long-running requests.
- `Least-connections scheduling` favors the target with fewest active connections. It helps when connection duration correlates with work; persistent connections may not reflect request load.
- `Least-response-time scheduling` favors targets with lower observed response times, sometimes alongside connection count. Sampling delay can cause oscillation or overload a temporarily fast target.
- `Random scheduling` selects a target randomly. It is simple and can distribute sufficiently large request counts, but short windows can be uneven.
- `IP-hash scheduling` maps a client IP to a target for affinity. NAT can make many clients share one mapping, and target-set changes can remap clients.
- `Consistent hashing` maps keys and targets onto a ring so membership changes remap fewer keys than simple modulo mapping. It does not guarantee even key frequency or backend capacity.
- `Rendezvous hashing` scores each key against candidate targets and chooses the highest score. It aims for limited remapping and can support weights; hotspots still need separate handling.
- `Health probe interval` is how often a router checks a target. Short intervals detect failures faster but increase probe load and sensitivity to transient conditions.
- `Active health check` sends explicit probes to assess a target. It may not exercise the same path or workload as real requests.
- `Passive health check` infers health from actual traffic outcomes. It reflects real requests but can detect problems only after users are affected.
- `Slow start` gradually increases traffic to a newly healthy target so caches, pools, or resources can warm before full load.
- `Connection draining` stops new connections/work to a target while existing work completes up to a limit. Configure deadlines and behavior for clients that never finish.
- `Graceful connection shutdown` notifies or closes connections in an orderly way so clients reconnect and in-flight work has a defined outcome.
- `Session affinity` attempts to keep a client's requests on one target. It can preserve local state but reduces balance flexibility and complicates failover.
- `Retry at load balancer` sends a failed request to another target or retries it. It can duplicate non-idempotent operations and amplify overload; retries need bounded, safe semantics.
- `Cross-zone load balancing` distributes traffic across targets in multiple zones. It can improve balance but may add cross-zone cost/latency and spread impact during a local failure.
- `Fail-open versus fail-closed routing` chooses whether to route when health evidence is unavailable or all targets appear unhealthy. Fail-open may reach unhealthy service; fail-closed may reject work that could succeed.
- `Load-balancer algorithm and request duration` describes how a selection policy interacts with the time work occupies a connection/target. Round robin may fit short similar requests; long-lived work may need active-load signals and careful connection handling.

## Cross-item comparison

| Algorithm | Uses | Weakness |
|---|---|---|
| Round robin | Sequence of eligible targets | Ignores unequal work and target capacity |
| Least connections | Active connection counts | Connections may not equal request work |
| Weighted round robin | Configured target weights | Weights may become stale |
| IP hash / consistent hash / rendezvous hash | Stable mapping from key/client | Hot keys and skew remain |
| Least response time | Measured latency | Feedback can lag or oscillate |

Layer 4 versus Layer 7 is about what request information the router can use; global versus local is about routing scope. These are separate dimensions.

## Examples

If requests vary from milliseconds to minutes, round robin may look balanced while some targets remain occupied by long calls. Least connections may help if one connection represents one unit of work, but multiplexed protocols weaken that assumption. Measure active requests and latency, and drain long-lived connections explicitly during deployment.

## Common mistakes

- Assuming DNS routing changes immediately reach every client.
- Using least connections when each connection multiplexes many requests.
- Retrying every error without checking whether the first request committed.
- Marking a target healthy from a shallow process-only probe.
- Using affinity to hide local session state and then losing it during failure.
- Increasing health-probe frequency without considering probe load and flapping.

## Knowledge checks with answers

1. What is Layer 4 versus Layer 7? **Transport-level routing versus application-aware routing.**
2. Why might least connections fail to balance work? **Connection count may not correspond to request cost or duration.**
3. Are DNS changes instant? **No; resolver/client caches can retain prior answers.**
4. When should a router retry? **Only when duplicate execution is safe or the operation is idempotent and the policy is bounded.**

### Exact terms covered

- `Load balancer`
- `Layer 4 load balancing`
- `Layer 7 load balancing`
- `Reverse proxy`
- `Global load balancing`
- `Local load balancing`
- `DNS-based traffic steering`
- `Latency-based routing`
- `Geographic routing`
- `Round-robin scheduling`
- `Weighted round robin`
- `Least-connections scheduling`
- `Least-response-time scheduling`
- `Random scheduling`
- `IP-hash scheduling`
- `Consistent hashing`
- `Rendezvous hashing`
- `Health probe interval`
- `Active health check`
- `Passive health check`
- `Slow start`
- `Connection draining`
- `Graceful connection shutdown`
- `Session affinity`
- `Retry at load balancer`
- `Cross-zone load balancing`
- `Fail-open versus fail-closed routing`
- `Load-balancer algorithm and request duration`
