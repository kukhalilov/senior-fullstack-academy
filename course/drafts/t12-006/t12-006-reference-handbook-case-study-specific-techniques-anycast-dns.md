# end-to-end system design case studies — Reference: Anycast DNS

Sources: [HLD Handbook](https://hld.handbook.academy/), [RFC 4786: Operation of Anycast Services](https://www.rfc-editor.org/rfc/rfc4786.html), [RFC 9499: DNS Terminology](https://www.rfc-editor.org/rfc/rfc9499.html), [RFC 7094: Architectural Considerations of IP Anycast](https://www.rfc-editor.org/rfc/rfc7094.html).

## Scope and version

This lesson discusses IP anycast as an operational technique for distributing DNS service addresses. Routing policy and convergence depend on the network and operator; anycast is not a DNS-record feature that guarantees a client always reaches the geographically nearest or healthiest site. RFC 4786 is an IETF Best Current Practice for operating anycast services; consult current network and DNS implementation documentation for deployment details.

## How this group fits the mental model

With unicast, an address ordinarily identifies one network destination. With anycast, the same service address or prefix is advertised from multiple nodes in separate locations; routing selects a reachable route according to topology and routing policy. This can bring a DNS service closer to users and provide routing-based failover, but “nearest” means topologically preferred by the routing system, not necessarily shortest physical distance or lowest application latency.

For an authoritative DNS provider, a resolver sends a query to an anycast service address. The network routes it to one site that must be able to answer consistently with the service’s DNS data and operational policy. Anycast distributes reachability to DNS servers; it does not replicate DNS zone contents, guarantee equal load, or replace DNS protocol redundancy and zone operations.

## Supplied names explained

- **Anycast service address:** a shared IP address/prefix made reachable through routes advertised by multiple service nodes.
- **Anycast node/site:** the service instance or coordinated group of hosts advertising that address from one location.
- **Route advertisement and withdrawal:** publishing reachability into a routing system and withdrawing it when a site should stop receiving new traffic. A route withdrawal does not instantly move every existing client; routing convergence and resolver/client retries affect recovery.
- **Unicast comparison:** directs traffic to a particular destination; DNS answers can instead return different addresses or use other traffic-management methods, but those methods have their own caching and failover behavior.
- **DNS cache/TTL:** resolvers may cache DNS answers for their TTL. Anycast selection occurs at the network layer for traffic to the chosen destination; it is distinct from changing a name’s DNS answer based on client geography.

## Cross-item comparison

| Technique | Selection mechanism | Strengths | Important limitations |
| --- | --- | --- | --- |
| IP anycast | Network routing selects among nodes advertising the same address/prefix | Can provide a stable service address, locality by network topology, and route-based failover without per-client address changes | Site load can be uneven; routes do not know whether the DNS application is healthy unless health is tied safely to advertisement; convergence and client retry behavior matter |
| DNS answer steering | DNS service returns one or more destination addresses based on policy/health/location | Application operator can choose destinations and steer new resolutions | Resolver caching and TTL mean changes are not instantaneous; the client’s resolver location may differ from the user’s location |
| Unicast load balancer | A specific endpoint or VIP forwards traffic to a pool | Can balance known backends and provide health-aware forwarding within its scope | It may still depend on a regional or global entry point and does not inherently provide worldwide routing |

These approaches can be combined. For example, DNS can return an anycast address; the network then chooses an anycast site. Each layer introduces its own health, cache, routing, and observability behavior.

## Examples

Assume DNS service address `192.0.2.53/32` is announced from sites A, B, and C. A resolver’s network path currently prefers site B, so its query reaches B. If B’s application fails but its router continues advertising the route, traffic may continue to land there and fail. Operators can couple service health to route withdrawal, but that mechanism must avoid flapping and must not withdraw reachability based on an overly narrow probe. After withdrawal, routes converge at different times and traffic shifts to whichever remaining route the network prefers; it does not necessarily distribute evenly between A and C.

Because an anycast client can be routed to different sites as paths change, DNS responses and operational state must be designed accordingly. Authoritative nodes generally need compatible zone data and safe update distribution. Long-lived stateful sessions are a poor fit when clients may move between nodes; DNS query/response exchanges are usually short, but monitoring still must identify which site served a query. RFC 4786 recommends in-band mechanisms to identify the node where practical and explains why availability observations vary by client location.

Operationally, probe from multiple external networks and regions; expose node identity in diagnostic responses/logging where appropriate; compare route announcements, query success, latency, and load by site; test route withdrawal and recovery; and verify DNS data version consistency. Avoid treating a successful BGP advertisement as proof that the DNS service is usable.

## Common mistakes

- Defining “nearest” as geographically closest instead of the route selected by topology and policy.
- Assuming anycast provides balanced load; RFC 4786 notes that load distribution can be difficult and unbalanced.
- Withdrawing routes on a single noisy health check, causing route flapping and wider instability.
- Leaving an unhealthy site’s route announced, or withdrawing a route without understanding convergence, traffic shifts, and resolver retries.
- Assuming identical IP advertisement means identical DNS data; zone distribution and consistency remain application/operator responsibilities.
- Monitoring from only one location and extrapolating global user experience from that path.
- Using anycast for long-lived stateful sessions without accounting for route changes that can direct a client to another node.
- Confusing anycast with GeoDNS or with DNS answer changes; these operate at different layers and have different caching behavior.

## Knowledge checks with answers

1. **Does anycast necessarily send a user to the physically closest site?** No. Routing selects according to network topology and policy, which may not match physical distance or application latency.
2. **If a DNS anycast site is unhealthy, will its clients instantly move to another site?** Not necessarily. Health detection, route withdrawal, routing convergence, resolver retries, and client behavior all contribute to recovery time.
3. **Does advertising the same prefix ensure all sites serve the same DNS zone data?** No. Data synchronization and rollout are separate responsibilities.
4. **How would you investigate reports that only some users cannot resolve names?** Probe from multiple networks, correlate failures with the serving site/node and route state, inspect site health and zone version, and account for resolver caching and path changes.
