# cloud computing foundations and architecture — Exercises and worked solutions

Sources: [Azure application architecture fundamentals](https://learn.microsoft.com/en-us/azure/architecture/guide/), [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/), [AWS Well-Architected Framework definitions](https://docs.aws.amazon.com/wellarchitected/latest/framework/definitions.html), [AWS VPC basics](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-subnet-basics.html), and [AWS subnet route tables](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-route-tables.html).

## Goals

Practice translating business requirements into cloud boundaries, resilience targets, identity/network design, operations evidence, and cost controls. These scenarios are provider-neutral; confirm exact Azure/AWS product behavior in their provider lessons before implementing.

## Worked example

Requirement: “We need a highly available service.” Ask what users measure, which failure is in scope, the required SLO, RTO/RPO, and allowed cost. A two-zone application with a single-zone database is not end-to-end zone resilient. A multi-region app with one global identity or DNS dependency may still have a shared failure. Draw the request and recovery paths, then test the claimed failure scenario.

## Exercises

### Exercise 1: Choose a service model

A team needs a custom OS kernel module, persistent local storage, and a legacy app that requires host-level tuning. Another team needs a standard web API with no host-level needs. Recommend candidate service models for each, state the operational tradeoff, and list what customer responsibilities remain.

### Exercise 2: Define recovery targets

A payment API can tolerate up to ten minutes of transaction data loss and two hours to restore full service. Specify RPO/RTO, propose backup/replication/failover tests, and identify why an hourly asynchronous replica alone may not meet the requirement.

### Exercise 3: Avoid overbroad cloud permissions

A CI pipeline deploys one staging API and updates its secret reference. An engineer suggests granting organization-wide administrator because role assignment failed. Describe a least-privilege design and the evidence to collect.

### Exercise 4: Private endpoint is not reachable

The database has a private endpoint and the app's identity has a database role, but connection attempts time out. Give a layered diagnostic plan and identify what each check proves.

### Exercise 5: Choose multi-zone or multi-region

A customer portal has strict in-region data residency, global users, a 30-minute RTO, and a two-minute RPO. Compare multi-zone same-region and multi-region approaches. State unresolved legal/service questions before recommending a design.

### Exercise 6: Queue-based worker duplicates work

After scaling workers, customers receive duplicate notifications. Explain likely delivery semantics and design idempotency, concurrency controls, retries, poison-message handling, and observability.

### Exercise 7: The cloud bill doubles

Compute spend is flat but data-transfer and logging charges rise sharply. Build an investigation plan using tags, billing dimensions, route/region topology, log volumes, and cost ownership. Avoid immediately removing redundancy.

### Exercise 8: IaC drift in production

An operator manually opens a database firewall rule during an incident. The next infrastructure deployment may reset it. Explain how to capture, review, and reconcile the emergency change without silently keeping a public exposure.

### Exercise 9: An SLO appears healthy while users complain

The API's average latency is low, but users in one region experience severe delays. Identify measurement gaps and propose SLI/alert/tracing changes.

### Exercise 10: Backup exists, restore fails

A restore job cannot decrypt the backup because its customer-managed key was deleted. Explain which architectural controls would have prevented this and what recovery options to investigate.

## Progressive hints

1. Select abstraction by the need for host control, not simply by “modern cloud” preference.
2. RPO is loss tolerance; RTO is restoration time. Include data, identity, routing and people in the test.
3. Scope principal, actions, target resources, environment and credential lifetime separately.
4. Check DNS, route, network rules, private connectivity, TLS and authorization in order.
5. Residency and provider service/replication support can limit topology; verify current terms.
6. At-least-once delivery requires idempotent consumers; retries can amplify overload.
7. Find which service/region/owner generates transfer/log volume before changing architecture.
8. Treat the emergency rule as temporary, observable state with an expiry/reconciliation ticket.
9. Segment by region/route/status/percentile; average values can hide tail and cohort problems.
10. Key lifecycle and recovery are part of backup design, not a separate afterthought.

## Complete solutions

### Solution 1

The custom kernel module and host tuning generally point toward IaaS/VM or a specialized dedicated host because the team needs OS control; it inherits OS patching, runtime, backup and availability work. The standard API may fit PaaS or a container service, trading host control for managed platform operations. Both teams remain responsible for application identity, data classification, configuration, vulnerability response, access, and verifying recovery. Confirm storage semantics: VM local disks may be ephemeral, and persistent local requirements can constrain migration/failover.

### Solution 2

RPO is at most ten minutes; RTO is at most two hours. Hourly replication has a possible lag larger than RPO and asynchronous replication can lag unpredictably. Combine a replication cadence/consistency design that meets the data objective with independent backups and point-in-time recovery. Test loss of a zone/region, corrupt/delete event, credential outage, and full restore; measure from incident declaration to validated service, including DNS/routing, permissions and data reconciliation.

### Solution 3

Use a dedicated workload identity federated from the CI provider where possible, constrained by issuer/audience/repository/environment/branch. Grant only staging deployment actions on the app resource and access to the specific secret reference; separate role-assignment creation into an approved bootstrap process if the pipeline does not need it. Inspect the exact authorization error, requested action and scope, effective deny/inheritance, and audit log. Do not expand to organization-wide admin to solve a scoped permission failure.

### Solution 4

Confirm the app resolves the database name to the private address from its own network/namespace; then inspect subnet route/peering, endpoint connection approval, security groups/network rules, database firewall, DNS zone association/forwarding, and TLS/server identity. Finally verify database IAM/credentials and connection settings. A timeout suggests a network path problem but can also be silent filtering; an authorization error after handshake narrows it to identity/database policy. Record source, destination, port and time for every probe.

### Solution 5

Multi-zone same-region can meet zone-failure continuity while maintaining data within a region, but does not meet a regional disaster RTO by itself. Multi-region can improve regional recovery but may replicate data outside legal boundary or require an approved in-country second region; asynchronous replication may violate two-minute RPO under congestion. Verify residency rules, service availability, replication location, RPO behavior, region pairs, global routing, and capacity. Propose a primary same-region zone-redundant service plus compliant recovery option only after legal/security and provider semantics are confirmed.

### Solution 6

Assume at-least-once delivery until the selected broker contract proves otherwise. Give each notification a stable business idempotency key and persist processing state transactionally with the action/outbox. Bound concurrency, use exponential backoff with jitter, distinguish transient/permanent errors, cap attempts, and route poison messages to a dead-letter queue with replay controls. Monitor queue age/depth, duplicate rate, retry count and consumer saturation. Do not acknowledge before durable completion unless another recovery mechanism exists.

### Solution 7

Group billing by service, region, tag/owner, and transfer/log SKU. Compare before/after traffic, cross-zone/region paths, CDN/cache hit ratio, duplicate logs/traces, retention, sampling, and private/public routing. Identify destination and workload value before optimization. Consider compression/caching/placement and retention adjustments while keeping required security audit and redundancy; estimate cost and test impact before rollout.

### Solution 8

Record exact rule, author, time, rationale, duration, incident and affected resource. Use the smallest source/protocol/destination scope and expiry. Capture the change in version control/IaC after review, add alert/owner and remove the temporary exception once incident ends. Run a plan/diff to understand whether IaC will revert it; reconcile desired state explicitly and verify effective rules/activity history. Preserve the incident path without making a temporary public exposure permanent.

### Solution 9

Average latency hides p95/p99 and regional cohorts. Define SLI at the user/request edge by region, operation and success status; instrument end-to-end traces, dependency timings, DNS/TLS/connect time, and traffic route. Alert on error-budget burn and tail latency over appropriate windows, not only host health. Validate that synthetic checks use the affected network path and that low sample volume does not hide an outage.

### Solution 10

Protect key lifecycle against accidental deletion: separation of duties, soft delete/recovery window, purge protection/retention where available, replicated key access, monitoring, and documented key recovery. Keep backup/key dependencies in a separately protected boundary. Investigate provider recovery window, replica/HSM backup, alternate copies and legal/security constraints. A backup without its decrypting key is not recoverable; revise restore tests to include key loss.

## Tests and edge cases

Test identity federation from untrusted branches, a parent-scope inherited grant, missing private DNS, overlapping CIDRs, a zone outage with database failover, an RTO under cold-start conditions, asynchronous replica lag above target, duplicate queue delivery, exhausted quota, log volume spike, backup restore with rotated keys, and emergency IaC drift reconciliation. Use test accounts and nonproduction data.

## Reflection questions

- Which requirement could not be proven from the provider's SLA alone?
- What shared dependencies remain across the proposed failure domains?
- Which policy/identity grants can create unintended access inheritance?
- Which data-transfer flows dominate cost and why do they cross a boundary?
- How would you demonstrate the chosen RTO/RPO to an auditor or business owner?

