# system design requirements estimation capacity and tradeoffs — Reference: Failure behavior, recovery, and overload decisions

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [Azure reliability metrics](https://learn.microsoft.com/en-us/azure/well-architected/reliability/metrics), and [Google SRE: Service Best Practices](https://sre.google/sre-book/service-best-practices/).

## Scope and version

This lesson sets requirements for failure and overload behavior. Concrete retry, timeout, and circuit-breaker APIs are covered in the resilience topic.

## How this group fits the mental model

Define what the system sacrifices, preserves, and recovers when capacity or a dependency is unavailable. A system that has only a normal-operation design is incomplete.

## Supplied names explained

### Failure mode

A way a component or dependency can fail: crash, timeout, partial response, corruption, overload, or network partition. Enumerate realistic modes and their observable impact.

### Blast radius

The scope of users, data, or components affected by a failure. Isolation, quotas, bulkheads, and staged rollout can limit it.

### Fault isolation

Preventing one failing component or workload from exhausting resources or corrupting unrelated capabilities. Isolation boundaries must include shared pools, credentials, and network paths where relevant.

### Graceful degradation

Reduce optional capability while keeping critical behavior useful, such as disabling recommendations while preserving checkout. Define which behavior degrades and how users/operators know.

### Load shedding

Reject or drop selected work before overload causes system-wide collapse. Prioritize critical requests, return clear overload signals, and avoid shedding safety-critical work without policy approval.

### Queueing under overload

Buffer work for later processing when delays are acceptable. Bound queue size and age; unbounded queues convert overload into memory pressure and stale work. Synchronous request queues can worsen latency and pileups.

### Dynamic timeout

A timeout budget adjusted to measured latency/dependency and request context. It should fit within the end-to-end deadline and propagate cancellation. A timeout is a failure detector with uncertainty, not proof the remote operation did not complete.

### Retry amplification risk

Retries multiply offered load when a dependency is already saturated and can create cascading failure. Bound attempts, use backoff/jitter, retry only safe/transient cases, and account for all layers’ retry budgets.

### Recovery Time Objective (RTO)

Target time to restore service after disruption. Include detection, decision, failover/restore, and validation.

### Recovery Point Objective (RPO)

Target maximum acceptable data loss measured as a time interval before disruption. It informs replication, backup, and recovery design.

### Planned outage

A scheduled interruption for maintenance or migration with notice and coordination. Define impact window, rollback, and customer communication.

### Unplanned outage

Unexpected loss/degradation requiring incident response. Set detection, escalation, recovery, and communication expectations.

### Capacity during component failure

The available throughput/latency when a node, zone, or dependency is lost. Failover may concentrate load on survivors; test degraded topology rather than assuming nominal capacity.

### Overload acceptance test

An explicit test showing critical functions remain within targets or degrade safely as demand exceeds capacity. Include backpressure, rejection behavior, queue growth, dependency recovery, and operator signals.

## Cross-item comparison

Graceful degradation preserves selected functionality; load shedding rejects work to protect the system. RTO measures restoration duration; RPO measures data-loss tolerance. Queueing moves work in time but does not increase service capacity.

## Examples

During payment-provider latency, stop optional analytics calls, enforce an end-to-end deadline, and avoid retrying non-idempotent charges blindly. If capacity is exceeded, reject new low-priority searches with a retryable response rather than letting all requests accumulate indefinitely.

## Common mistakes

- Treating a timeout as proof a payment did not execute.
- Unlimited retry loops or multiple independent retry layers.
- Unbounded queues presented as resilience.
- Defining RTO but not RPO for a stateful system.
- Testing failover only when nominal traffic is low.

## Knowledge checks with answers

1. **What does queueing solve?** It decouples timing within bounded capacity; it does not create capacity.
2. **What is a timeout’s ambiguity?** Remote work may complete after the caller times out.
3. **How does load shedding help?** It rejects selected work before resource exhaustion spreads.

### Exact terms covered

- `Failure mode`
- `Blast radius`
- `Fault isolation`
- `Graceful degradation`
- `Load shedding`
- `Queueing under overload`
- `Dynamic timeout`
- `Retry amplification risk`
- `Recovery Time Objective (RTO)`
- `Recovery Point Objective (RPO)`
- `Planned outage`
- `Unplanned outage`
- `Capacity during component failure`
- `Overload acceptance test`

### Exact terms covered

- `Failure mode`
- `Blast radius`
- `Fault isolation`
- `Graceful degradation`
- `Load shedding`
- `Queueing under overload`
- `Dynamic timeout`
- `Retry amplification risk`
- `Recovery Time Objective (RTO)`
- `Recovery Point Objective (RPO)`
- `Planned outage`
- `Unplanned outage`
- `Capacity during component failure`
- `Overload acceptance test`
