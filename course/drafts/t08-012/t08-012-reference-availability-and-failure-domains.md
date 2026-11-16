# scaling availability replication sharding load balancing — Reference: Availability objectives, redundancy, health, and recovery

Sources: [Google Cloud reliability guidance](https://docs.cloud.google.com/architecture/framework/reliability), [highly available systems](https://docs.cloud.google.com/architecture/framework/reliability/build-highly-available-systems), and [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out).

## Scope and version

This provider-neutral reference covers service availability, redundancy, health, and recovery terms. It does not prescribe a cloud provider's probe fields, SKU, or disaster-recovery product.

## How this group fits the mental model

Availability is end-to-end. Redundant components help only when they can take over safely and do not share the failure that disabled the primary. Health signals control traffic and restart decisions; recovery objectives state business tolerance, and tests verify the actual process.

## Supplied names explained

- `Availability` is the fraction or probability of time a service is usable according to a defined user-facing condition. Define the measurement window and success criteria.
- `Reliability` describes the probability that a system or operation performs correctly over a period or number of operations. It includes correctness, not merely process uptime.
- `Resilience` is the ability to withstand disruption, limit impact, and restore service. It includes prevention, detection, response, and recovery.
- `Fault tolerance` is the ability to continue providing an agreed service despite specified failures. State which faults and degraded behaviors are included.
- `Redundancy` provides extra components or capacity that can serve when another component fails. It needs detection, safe promotion, and enough remaining capacity.
- `Single point of failure` is one component or dependency whose failure can stop a required service path. Hidden examples include shared DNS, credentials, network, control plane, or data dependencies.
- `Failure domain` is a set of components exposed to a common failure cause. Place redundant copies across domains relevant to the failure scenario.
- `Process failure domain` covers failures affecting a process while its host and peers may remain running, such as a crash or deadlock.
- `Host failure domain` covers one machine and its local resources. Multiple processes on that host are not independent against host loss.
- `Availability zone` is an isolated location grouping intended to reduce shared infrastructure failure within a region. Cross-zone design still depends on network, dependencies, and capacity.
- `Region failure domain` covers a broader geographic region and shared dependencies. Regional recovery adds routing, data replication, and data-location concerns.
- `N+1 redundancy` provisions one additional unit beyond normal required capacity so the target can be met after one unit fails. It does not automatically tolerate correlated failures or a traffic surge.
- `Active-active deployment` serves traffic from multiple active instances or locations. It can improve locality and capacity but requires conflict, consistency, routing, and overload decisions.
- `Active-passive deployment` keeps a standby deployment ready to take over. It can simplify write ownership but incurs standby cost, promotion delay, and failover testing.
- `Health check` is a signal used to decide whether a component can serve or should be restarted/routed around. It must measure the right condition without removing all capacity during a shared dependency problem.
- `Liveness probe` asks whether a process should be restarted because it cannot make progress. It should not fail solely because a shared dependency is temporarily unavailable.
- `Readiness probe` asks whether an instance should receive new traffic now. Broad dependency checks can remove the whole fleet, so define essential serving capability.
- `Startup probe` delays other health decisions until initialization has had enough time. It prevents slow startup from being treated as a hung process.
- `Dependency-aware readiness` includes essential dependency state in traffic eligibility. Use it only when that dependency makes requests unserviceable; partial degradation may be better than removing every instance.
- `False-positive health failure` marks a healthy or recoverable instance failed due to noisy, overly strict, or dependency-coupled checks. It can trigger needless restarts and reduce capacity.
- `Failover` moves service responsibility to a standby or alternate after failure. It may require promotion, fencing, state recovery, and traffic redirection.
- `Failback` returns service to a preferred or recovered primary after failover. Reconcile state and verify ownership so the old primary does not overwrite newer data.
- `Recovery Time Objective (RTO)` is the target duration for restoring service after disruption. Validate it with timed restoration tests, not a written aspiration.
- `Recovery Point Objective (RPO)` is the target maximum data loss measured in time. It influences replication and backup needs, but actual guarantees depend on acknowledgements and failure behavior.
- `Graceful degradation` preserves essential operations while shedding optional or expensive features during overload or partial failure. Define priorities and safe fallback results.
- `Disaster recovery test` exercises recovery from a realistic failure, including data, permissions, dependencies, routing, and user-visible validation. An untested backup is an assumption, not verified recovery.
- `Availability budget` is permitted unavailability implied by an objective over a defined period. It can guide risk decisions for releases or maintenance.
- `Redundancy versus correlated failure` distinguishes multiple copies from independent protection. Copies that share power, host, network, credentials, or control planes can fail together.

## Cross-item comparison

| Signal/objective | Answers | Does not prove |
|---|---|---|
| Liveness | Should this process restart? | That it can receive traffic |
| Readiness | Should this instance receive traffic? | That all dependencies are globally healthy |
| Startup | Has initialization completed enough for other checks? | Long-term correctness |
| RTO | How long restoration may take | How much data can be lost |
| RPO | How much data loss is acceptable | How long restoration may take |

## Examples

If a database is briefly unavailable, a liveness check that fails every application process can cause restart loops without repairing the database. A readiness check may stop new work if requests cannot succeed, while graceful degradation can keep unrelated functions available. The choice depends on which requests need that database.

## Common mistakes

- Counting instances as high availability without checking their failure domains.
- Making liveness depend on a networked database.
- Treating readiness as a binary whole-system health score.
- Defining RTO and RPO without a tested recovery path.
- Assuming N+1 capacity is enough for regional failure or a surge.
- Failing back before confirming replica state and ownership.

## Knowledge checks with answers

1. What does RTO measure? **Target restoration duration.**
2. What does RPO measure? **Target maximum recoverable data loss in time.**
3. Why separate liveness and readiness? **Restart decisions and traffic eligibility solve different problems.**
4. When is redundancy insufficient? **When units share a failure domain or cannot take over safely.**

### Exact terms covered

- `Availability`
- `Reliability`
- `Resilience`
- `Fault tolerance`
- `Redundancy`
- `Single point of failure`
- `Failure domain`
- `Process failure domain`
- `Host failure domain`
- `Availability zone`
- `Region failure domain`
- `N+1 redundancy`
- `Active-active deployment`
- `Active-passive deployment`
- `Health check`
- `Liveness probe`
- `Readiness probe`
- `Startup probe`
- `Dependency-aware readiness`
- `False-positive health failure`
- `Failover`
- `Failback`
- `Recovery Time Objective (RTO)`
- `Recovery Point Objective (RPO)`
- `Graceful degradation`
- `Disaster recovery test`
- `Availability budget`
- `Redundancy versus correlated failure`
