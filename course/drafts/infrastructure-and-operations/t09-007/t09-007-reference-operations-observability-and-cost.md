# cloud computing foundations and architecture — Reference: Operations, telemetry, cost allocation, and architecture review

Sources: [Azure Well-Architected pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars), [AWS Well-Architected Framework](https://docs.aws.amazon.com/wellarchitected/latest/framework/framework.html), and [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/).

## Scope and version

Architecture frameworks and provider tools evolve. Azure's workload Well-Architected Framework uses five pillars: Reliability, Security, Cost Optimization, Operational Excellence, and Performance Efficiency. AWS uses six: Operational Excellence, Security, Reliability, Performance Efficiency, Cost Optimization, and Sustainability. Checked 2026-11-20; provider calculators, price lists, budgets, and regional availability are live product information and must be checked when making a purchase or deployment decision.

## How this group fits the mental model

Operational readiness joins telemetry, ownership, response procedures, capacity, recovery, and cost. Architecture is not done at deployment: teams need to know what is running, why it is running, who pays, how it behaves under failure, and how to restore it. Cost optimization must preserve reliability and security targets.

## Supplied names explained

### Cost visibility and capacity

- **Cloud resource tagging** — Apply consistent metadata such as owner, service, environment and data class for inventory, policy and allocation; tags may be missing or mutable.
- **Cost allocation tag** — Tag/label recognized by provider billing reports to attribute spend; activate/configure it in billing tools and define shared-cost allocation rules.
- **Cloud billing account** — Provider billing relationship/invoice scope; it may differ from technical account/project/subscription boundaries.
- **Consumption-based pricing** — Charges based on measured use (requests, compute time, storage, transfer, etc.); usage can vary and cost visibility can lag.
- **Reserved capacity** — Commitment to capacity/usage for discounted rates; analyze utilization, term, region/family constraints, and unused commitment risk.
- **Savings plan** — Provider-specific spend/usage commitment for discounted compute or services; portability/coverage rules vary and commitment does not itself reserve workload capacity.
- **Spot or preemptible capacity** — Discounted unused capacity subject to interruption/reclaim; use for resumable, replicated, fault-tolerant work with checkpoint/retry.
- **Data egress charge** — Charge for data sent out of a provider region/service boundary; exact free allowances and pricing vary.
- **Cross-zone data transfer** — Charges/latency can arise when traffic/data crosses zones, depending on provider/service; verify traffic pattern before reducing resilience.
- **Cross-region data transfer** — Transfer between regions with latency, cost and potentially residency implications.
- **Cloud budget** — Spending threshold/forecast alert or policy; it may notify but not instantly stop a resource unless a separate automation is built.
- **Cost anomaly detection** — Flags unusual spend against baseline; it is retrospective/statistical and needs an owner and response path.
- **Rightsizing** — Adjust resource size/count to measured demand with headroom and performance SLO; downsize only after measuring peaks and failure scenarios.
- **Idle resource** — Provisioned resource with little/no workload value, such as unattached disk or unused public IP; safely remove only after ownership/retention checks.
- **Autoscale limit** — Min/max/step/concurrency/quotas that bound scaling. Too-low max causes saturation; too-high max can overwhelm dependencies or budget.
- **Cloud resource inventory** — Current record of resources, locations, tags, ownership and configuration; reconcile with IaC and billing to find untracked assets.
- **Quota planning** — Identify current/requested service limits per scope/region and request increases with lead time and evidence.
- **Capacity planning** — Estimate demand, growth, failure headroom, scaling delay, quotas and cost; validate with load/failover tests.

### Operational evidence and response

- **Cloud configuration history** — Provider records/config snapshots or change events; retention and coverage differ and may not include application changes.
- **Cloud activity log** — Management-plane events such as create/update/delete and role changes; not equivalent to application data-plane audit.
- **Metrics** — Numeric measurements over time (latency, errors, saturation, queue depth); define aggregation, dimensions, sampling and cardinality.
- **Logs** — Event records with timestamp/context; protect sensitive fields and plan ingestion/retention cost.
- **Distributed traces** — Correlated spans across services showing request path/latency; sampling and context propagation affect completeness.
- **Cloud monitoring service** — Provider telemetry/alerting platform; configure diagnostic sources, access, retention, region, and export.
- **Alert rule** — Condition over metrics/logs/events that notifies or triggers action; tune threshold, duration, deduplication, severity and owner to reduce noise.
- **Health check** — Probe of process/service/dependency behavior. A shallow process check is different from an end-to-end user-path SLI.
- **Operational runbook** — Step-by-step instructions for a known alert/incident, with roles, safe actions, verification, escalation and rollback.
- **Cloud resource tagging** — Also operational ownership metadata; tags are useful only when required, validated and kept current.
- **Backup restore test** — Restore an actual backup into an isolated target and verify integrity/RTO/RPO/access; backup success logs alone do not prove recoverability.
- **Disaster recovery exercise** — Practiced failover/restore/failback of people, identities, routing, data and applications against scenario-specific targets.

### Architecture quality review

- **Well-Architected Framework** — Structured review of workload decisions against quality pillars and design principles. Framework names and pillar sets are provider-specific: Azure workload guidance currently has five pillars, while AWS has six including Sustainability. A review is diagnostic, not certification that guarantees safety.
- **Operational excellence pillar** — Ability to run, observe and improve workloads through automation, clear ownership, learning and predictable operations.
- **Security pillar** — Protect identities, data, systems and assets with defense in depth, least privilege, detection and response.
- **Reliability pillar** — Workload performs intended function consistently and recovers from faults; includes resilience and tested recovery.
- **Performance efficiency pillar** — Use appropriate resources and architecture to meet requirements as demand/technology change.
- **Cost optimization pillar** — Deliver business value within cost constraints through visibility, efficient usage and ongoing review.
- **Sustainability pillar** — In AWS Well-Architected, the sixth pillar addresses environmental impact through efficient use and architectural choices. Azure includes sustainability guidance, but it is not listed as a sixth workload pillar alongside Azure's five pillars; its framework structure and terminology differ.
- **Architecture review** — Deliberate evaluation of requirements, risks, alternatives, failure scenarios, security, operational readiness and cost; record decisions and owners.

## Cross-item comparison

| Evidence/goal | Measures | Blind spot to check |
|---|---|---|
| Metrics | Trends, rates, saturation | Missing dimensions or aggregation hides cohort failures |
| Logs | Event details | Sampling, retention, sensitive values, clock skew |
| Traces | Cross-service request path | Unsampled paths and async context breaks |
| Activity/config history | Management changes | Does not necessarily include data-plane/app events |
| Budget/anomaly alert | Cost deviation | May be delayed and non-blocking |
| Backup restore exercise | Real recovery capability | One scenario does not validate every disaster |

## Examples

For a latency SLO, instrument request duration/error rate at the user boundary, traces through dependencies, and saturation metrics (CPU, connections, queue depth). Define alert routing and runbook. Add cost dimensions to service/environment tags; alert on forecast/anomalies, then inspect egress, logs, idle resources and autoscale bounds. Test a database restore and regional failover against target RTO/RPO before claiming DR readiness.

## Common mistakes

- Relying on unvalidated tags or assigning shared network/logging spend to one team arbitrarily.
- Assuming budgets stop cloud spend or anomaly detection is immediate.
- Removing redundancy to lower cost without comparing against reliability objectives.
- Alerting on every raw metric threshold without ownership, deduplication or actionable response.
- Assuming high metric/log retention is free or that a trace shows every request.
- Declaring disaster recovery ready because snapshots are configured.
- Treating a Well-Architected review as a product approval badge instead of a point-in-time assessment.

## Knowledge checks with answers

1. Does a savings plan necessarily reserve capacity? **No; it is commonly a billing commitment, while capacity reservation is a separate feature.**
2. Why test a restore? **It verifies the data, keys, permissions, procedures and recovery time work together.**
3. Does a cloud budget stop spending? **Usually it alerts; stopping requires separate policy/automation and can be risky.**
4. What does an activity log usually capture? **Management-plane operations, not every application/data-plane access.**

