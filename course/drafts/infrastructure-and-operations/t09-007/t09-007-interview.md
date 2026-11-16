# cloud computing foundations and architecture — Interview questions and reasoning

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [AWS Well-Architected Framework definitions](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html), [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), and [AWS VPC basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html).

## Core questions

1. Explain IaaS, PaaS, SaaS, and FaaS using responsibility boundaries.
2. What remains the customer's responsibility in SaaS?
3. Distinguish control plane, management plane, and data plane.
4. How do cloud account, tenant, subscription, project, and resource group differ?
5. What is a landing zone and what belongs in it?
6. How do you choose a region?
7. What does availability zone independence mean, and what must you verify?
8. Define RTO and RPO and describe a test for each.
9. Compare synchronous and asynchronous replication.
10. Why are backup and replication not interchangeable?
11. Compare RBAC and ABAC.
12. How would you avoid long-lived cloud credentials in CI?
13. What is the difference between a private endpoint and authorization?
14. How do queues and pub/sub change failure handling?
15. What makes an autoscaling design safe?
16. Distinguish SLI, SLO, and SLA.
17. How do you investigate a cloud cost increase?
18. What are the tradeoffs of multi-region active-active?
19. What does a managed service transfer to the provider, and what remains yours?
20. Which cross-cloud principles are portable and which implementation details are not?

## Concise interview answers

- IaaS gives more OS/runtime responsibility; PaaS manages more host/platform work; SaaS delivers an application; FaaS executes event-triggered code. Customer responsibilities still include data/access/configuration according to service.
- A tenant/account is a provider-specific identity/admin/billing scope; subscriptions/projects/resource groups are distinct levels and must be mapped explicitly.
- Control/management plane changes resources; data plane serves workload traffic; failures/authorization may differ.
- RTO is restore time target; RPO is acceptable data-loss interval.
- Replication copies current data for continuity; backup preserves recoverable prior state, ideally independently.
- RBAC grants role permissions at scope; ABAC adds attributes/conditions and is more expressive but harder to test.
- Use short-lived OIDC federation constrained by issuer, audience, repository and environment, with narrow scope.
- Private endpoint provides a network path; it does not automatically grant IAM permission.
- Queue/pub-sub decouples components but requires idempotency, retries, ordering/dead-letter policy and observability.
- Scale with min/max, quota, warm-up, health, downstream capacity, and cost bounds.
- SLI is a measurement, SLO a target, SLA a contractual commitment.
- Cost triage by owner/service/region/usage dimension; inspect egress, logs, idle capacity, autoscale and redundancy before cutting safeguards.

## Deep follow-up answers

### Responsibility and service abstraction

Describe the layers explicitly: facility, hardware, network, hypervisor, OS, runtime, application, identity and data. Managed services move some operation to the provider but can add configuration defaults and provider APIs. The customer still decides how data is classified, who can access it, how the app handles failure, and whether recovery works.

### Availability and recovery

Start with the user-facing SLI and failure scenario. Model serial dependencies and common causes, then place independent capacity/data only where needed. RTO includes restoring the full path, not just starting compute. RPO includes replication lag and committed writes. Test restore/failover/failback and measure targets; do not infer them from region count or provider SLA.

### Identity and network security

State principal, action, resource, scope, conditions and credential lifetime. Confirm effective inherited policy/deny. Separately trace DNS, routing, firewall, private service attachment, TLS and service authorization. A private address is not an authorization control; an IAM allow is not network reachability.

### Cost and operations

Tie every resource to an owner/workload/environment and instrument cost drivers. Optimize from workload measurements while preserving SLO/security targets. Alerts and budgets can lag; they need an operator/automated response. Metrics/logs/traces complement each other and need access, retention and cardinality controls.

## Scenario questions

1. A service is available in two zones but its database is zonal. What failure remains?
2. A regional DR replica has 40 minutes of lag but the business requires a 10-minute RPO. What options and tradeoffs do you present?
3. A CI pipeline needs to deploy to production but is currently granted tenant-level administrator. How do you reduce it safely?
4. Private database DNS resolves publicly from the app subnet. How do you isolate the issue?
5. A serverless function scales rapidly and overloads a downstream API. What controls are needed?
6. The SLA was met but users saw failures across the application. How can that happen?
7. Spend is high in a multi-region design. How do you evaluate savings without violating recovery objectives?
8. A backup exists but its encryption key was deleted. What does that reveal about the recovery design?

## Tradeoffs and alternatives

| Decision | Benefit | Cost/alternative |
|---|---|---|
| PaaS over VM | Less OS maintenance | Runtime/platform constraints and provider-specific behavior |
| Multi-zone | Tolerates some zone failures | Data/traffic cost and spare capacity |
| Multi-region active-active | Low-latency global service/continuity | Data consistency, routing and operations complexity |
| Synchronous replication | Lower committed-data loss | Latency/quorum/distance limits |
| Managed key | Less key-operations burden | Less direct key lifecycle control |
| Customer-managed key | Control/audit flexibility | Key deletion/access can block recovery |
| Spot capacity | Lower price | Interruption and checkpoint/retry requirements |

## Common weak answers

- “Cloud is infinitely scalable.”
- “The provider handles security because it is managed.”
- “Two regions means disaster recovery.”
- “A private endpoint means the database is secure.”
- “The provider SLA is our availability.”
- “A backup exists, so we can recover.”
- “We need admin access so the pipeline works.”
- “We can reduce all redundancy to lower cost.”

## Self-check rubric

Score 0–2 for each: **0** gives a product slogan or unsupported guarantee; **1** names relevant services/terms but omits responsibility or failure boundaries; **2** ties decisions to measurable requirements, states what is provider-specific, names shared dependencies and tradeoffs, and includes test/verification. Strong answers distinguish business target, provider SLA, workload SLO, and demonstrated recovery.

