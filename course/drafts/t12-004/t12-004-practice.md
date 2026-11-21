# architecture patterns multi-region tenancy and reliability — Exercises and worked solutions

Sources: [HLD Handbook](https://hld.handbook.academy/), [Google SRE service-level objectives](https://sre.google/sre-book/service-level-objectives/), [Google SRE handling overload](https://sre.google/sre-book/handling-overload/), [Microsoft multitenant data approaches](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/storage-data), [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [AWS disaster recovery guidance](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/disaster-recovery), [NIST Zero Trust Architecture](https://csrc.nist.gov/pubs/sp/800/207/final), [AWS Well-Architected game days](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html).

## Goals

Practice turning an unclear prompt into requirements, a simple baseline, explicit data and trust boundaries, and a tested failure plan. Work from user outcomes first; choose technical mechanisms only after explaining which requirement they satisfy. Every solution is one defensible design under stated assumptions, not a universal blueprint.

## Worked example

A multi-tenant SaaS API serves 100,000 weekly active users. Ten large enterprise tenants require regional data residency. Product asks for “high availability” and will consider a second region. Design the first release and a credible path to recovery.

**1. Clarify the outcome.** Ask which user journeys must work during a region outage, whether writes may be paused, what data is legally or contractually region-bound, how quickly recovery is required, and the acceptable loss window. Assume for this exercise: order reads and new order writes are critical; analytics and email can be delayed; resident tenant content must remain in its designated region.

**2. State provisional objectives.** Define a service SLI such as successful authorized order requests divided by valid requests, measured over a rolling window. Agree a target and error budget with product/operations; do not invent “five nines” from the phrase high availability. Set a provisional RTO of 60 minutes and RPO of 5 minutes only as scenario assumptions to validate against cost and user impact. RTO is recovery time; RPO is the maximum tolerable data-loss interval.

**3. Size only enough to choose.** If peak is 10× average, capacity and connection pools must tolerate that burst or admission control must bound it. Measure actual requests per second, order write ratio, payload, tenant skew, database IOPS, and replication lag before choosing a shard or active-active design. The top tenant may dominate despite a modest global average.

**4. Set ownership and placement.** A tenant directory maps immutable tenant ID to its data cell and region. Every API call derives tenant context from authenticated identity and server-side mapping; a caller-supplied tenant ID is not authority. Store the order write model in one home region per tenant initially. Keep derived search/analytics data separate and rebuildable. Inventory logs, backups, traces, support exports, caches, and replicas in the residency review.

**5. Choose a failure model.** Deploy across availability zones in the primary region. Replicate backups and transaction logs to a recovery region only when permitted by tenant policy. Use a tested active-passive recovery path with documented ownership transfer; do not route writes to both regions until conflict resolution and split-brain protection are proven. This is simpler than active-active and aligns with a 60-minute assumed RTO, subject to a restore/failover test.

**6. Handle uncertain writes.** The order API accepts an idempotency key scoped to tenant and operation. The database transaction records order state and an outbox event together. If the client times out, it retries with the same key or queries the stable order ID; it must not create a second charge. A consumer uses an inbox/deduplication record and payment-provider idempotency if available.

**7. Degrade intentionally.** If the analytics stream is delayed, order creation continues and analytics lag alerts fire. If the primary database is unavailable, reject or queue only operations whose product semantics explicitly allow it; never acknowledge an order as durable if the system cannot meet the contract. Observe request outcomes, tail latency, queue age, replication lag, and restore progress.

**8. Validate recovery.** Restore a tenant cohort into the recovery environment, verify tenant placement and authorization, reconcile replication lag, switch a controlled traffic slice, and test rollback/failback. Record elapsed recovery time and data loss. A diagram or successful snapshot job is not evidence that the service meets its objectives.

## Exercises

1. **Design loop:** For a photo-sharing product, write 4 functional requirements, 3 quality objectives, and 5 clarifying questions. Name one objective that conflicts with another and how you would resolve the priority.
2. **Traffic arithmetic:** A service handles 2 million requests/day, 8% writes, and a 6× peak-to-average ratio. Estimate average and peak requests/second, and write assumptions. If a write event is 1.5 KB before replication, estimate raw event bytes/day and explain why this is not a storage forecast.
3. **Tenant blast radius:** One tenant generates 40% of traffic and a burst saturates the shared database. Propose admission/quota controls and identify one fairness risk of per-tenant rate limits.
4. **Multi-region write:** A profile service must recover in 15 minutes with at most 30 seconds of data loss. Compare active-passive and active-active. State the ownership/conflict decision and a test proving the target.
5. **Event delivery:** A service commits an invoice but crashes before publishing `InvoiceIssued`. Sketch a transactional outbox consumer, duplicate handling, schema evolution, replay controls, and the metric that detects stuck publishing.
6. **Cost and value:** Compute cost per successful transaction when monthly cost is $12,000 and 3 million transactions succeed. A redesign cuts cost 20% but increases failed transactions from 0.2% to 1%. What additional measures and decision criteria do you need?
7. **Overload:** The queue depth remains low, but the oldest job is 25 minutes old. List likely causes, the time-based signal to alert on, and safe load-shedding behavior.
8. **Threat model:** A JWT validates cryptographically but contains the wrong audience. Explain why the API must reject it and name the distinct controls for user authentication, API authorization, workload identity, WAF filtering, and DDoS capacity.
9. **Fault exercise:** Plan a game day for a regional database failure: hypothesis, preconditions, blast radius, observer/commander, success and abort signals, rollback, data checks, and follow-up.

## Progressive hints

- For exercise 1, distinguish actions from qualities: “create a photo” is a functional requirement; “99.9% successful upload requests over 30 days” is a measurable quality target.
- For exercise 2, divide daily requests by 86,400; multiply by peak ratio. Writes are 160,000/day. Raw bytes ignore indexes, metadata, replicas, compression, retention, retries, and backups.
- For exercise 3, separate rate limits from storage isolation; a fair quota cannot stop a noisy neighbor if all tenants still share one saturated connection pool.
- For exercise 4, ask what writes continue during failover and who owns the authoritative copy. A 30-second RPO is a measured replication/restoration objective, not merely a configuration value.
- For exercise 5, the outbox row must commit in the same local transaction as the invoice. Publication can be at least once; deduplicate at the consumer.
- For exercise 6, compare successful outcomes and SLO/quality impact, not cost alone.
- For exercise 7, queue age captures delay even when depth is small; investigate worker availability, poison messages, partition skew, and dependency latency.
- For exercise 8, cryptographic validity only establishes integrity under a key; audience binds the token to its intended recipient.
- For exercise 9, make stop conditions and recovery safer than the injected failure.

## Complete solutions

1. **Photo sharing:** Functional requirements: upload a photo; view own feed; follow another user; delete a photo. Objectives: upload success rate/latency; feed freshness; durability/recovery target. Clarify privacy, deletion propagation, max size, expected burst, and geographic restrictions. Availability versus immediate global consistency may conflict; keep writes authoritative in one region initially and make feed projections eventually consistent if product accepts brief staleness.
2. **Arithmetic:** Average = 2,000,000 / 86,400 ≈ 23.15 requests/s. Peak estimate ≈ 138.9 requests/s. Writes = 160,000/day. Raw event bytes = 160,000 × 1,500 = 240,000,000 bytes/day (about 240 MB decimal). This excludes envelope/metadata, replication, indexes, compression, retention, retries, tombstones, and traffic shape, so it is an input estimate only.
3. **Tenant fairness:** Apply authenticated tenant-level token buckets at the API and bounded per-tenant worker/connection budgets; expose per-tenant latency and saturation. Reserve capacity for critical operations and consider dedicated cells for large tenants. A strict fixed limit may throttle a tenant’s legitimate burst or penalize small tenants with a higher ratio of shared overhead; use tiered quotas and measured capacity with an escalation path.
4. **Regions:** Active-passive can meet the target if replication lag is below 30 seconds and automated/manual recovery, routing, and dependency startup complete within 15 minutes. Active-active may reduce read latency but requires conflict semantics, write ownership, and split-brain controls. Use a single-writer home region per account or partition unless edits are safely mergeable. Prove with timed regional failover, replay/consistency checks, and failback rehearsal under realistic load.
5. **Outbox:** Write invoice and outbox record atomically. A dispatcher leases unsent rows and publishes stable event IDs, retrying transient failures. Consumers record event ID and effect in one transaction or use idempotent external calls; duplicates are expected. Add fields compatibly, version semantic breaks, and restrict replay. Alert on oldest unsent outbox age and sustained publish errors.
6. **Cost:** Baseline = $12,000 / 3,000,000 = $0.004 per successful transaction. A 20% cost reduction yields $9,600; compare the redesigned cost per *successful* transaction after failure changes, plus revenue/impact of failures, retries, latency, and support work. If request volume stays 3 million and success rate becomes 99%, successful count is 2.97 million; unit cost ≈ $0.00323, but user harm may outweigh savings. Decide against explicit product/SLO and business-value thresholds, not this ratio alone.
7. **Overload:** Alert on oldest-message age and end-to-end completion latency, not queue depth alone. Check worker lag, poison/retry loops, skewed partitions, throttled dependencies, and stale leases. Stop admitting noncritical work, apply backpressure, use bounded retries and a dead-letter investigation path, and preserve capacity for high-priority work. Avoid dropping accepted durable jobs without an explicit contract.
8. **Threat model:** Reject the token because a token intended for another resource must not be accepted here, even if its signature verifies. Authentication establishes the user identity; authorization evaluates permitted action/resource; workload identity authenticates service-to-service callers; WAF applies selected HTTP request filters; DDoS mitigation provides layered upstream/network/application capacity and overload defenses. None substitutes for the others.
9. **Game day:** Hypothesis: a regional database outage triggers recovery, preserves acknowledged writes within the RPO, and restores critical order journey within RTO. Precheck backups, replication, access, alerts, capacity, and stakeholder notice. Start in a test environment or small controlled production slice. Assign exercise lead, operator, observer, and stop authority. Measure SLI, recovery time, replication lag/data loss, and dependency health. Abort on unexpected data corruption, broad SLO breach, or loss of control. Restore traffic/state through the runbook, reconcile records, debrief with assigned fixes, and repeat the test.

## Tests and edge cases

Test duplicate and late requests; lost acknowledgements; idempotency-key reuse across tenants; out-of-order and duplicate events; exhausted quota; one noisy tenant; missing metrics; partial region failure; stale replica; failover during schema rollout; old/new binary coexistence; provider quota exhaustion; missing or corrupt backup; unauthorized tenant routing; key rotation; queue poison message; external side effect completed before local acknowledgement; and failback with writes arriving in both locations. For each, name the observable user outcome and the recovery owner.

## Reflection questions

Which assumption most strongly changes the design? Which requirement is a hard invariant and which can degrade? What is the smallest architecture that meets the agreed objectives? Where can the system acknowledge work before it is durable? What evidence would justify active-active, a separate tenant cell, a commitment purchase, or an additional service? Which part of recovery have you actually timed, and which part is only drawn on a diagram?
