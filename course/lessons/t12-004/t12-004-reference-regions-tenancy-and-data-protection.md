# architecture patterns multi-region tenancy and reliability — Reference: Regions, tenants, and privacy boundaries

Sources: [HLD Handbook](https://hld.handbook.academy/), [Azure regions and availability zones](https://learn.microsoft.com/en-us/azure/well-architected/resiliency/regions-availability-zones), [Azure disaster recovery guidance](https://learn.microsoft.com/en-us/azure/well-architected/design-guides/disaster-recovery), [AWS multi-region architecture decision guidance](https://docs.aws.amazon.com/prescriptive-guidance/latest/security-reference-architecture/multi-region-architecture.html), [Azure multitenant storage and data approaches](https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/approaches/storage-data), [Azure noisy neighbor antipattern](https://learn.microsoft.com/en-gb/azure/architecture/antipatterns/noisy-neighbor/noisy-neighbor), [GDPR Article 17](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng/), [UK ICO right to erasure and backups guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/individual-rights/right-to-erasure/), [NIST SP 800-88 Rev. 2](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-88r2.pdf).

## Scope and version

This is an architecture reference, not legal advice or a promise about any provider's SLA. RTO and RPO must be agreed for a named workload and failure scenario. Provider services, region availability, replication modes, and regulations change; validate current documentation and jurisdiction-specific obligations before deployment. Privacy examples distinguish the EU GDPR from UK GDPR guidance where relevant.

## How this group fits the mental model

Region design determines where requests and data can survive and where they may be stored. Tenant design determines which customers share infrastructure and how isolation, fair use, recovery, and deletion work. These decisions intersect: a tenant's backup may be replicated to another region, a failover may copy data across a boundary, and a shared shard may prevent restoring or deleting one customer independently.

Begin with the promised recovery behavior and the data's allowed locations. Then trace every copy: primary storage, replicas, caches, logs, search indexes, exports, analytics, backups, and third-party processors. Choose the least complex region and tenant layout that meets business, resilience, isolation, and data-protection requirements. Multi-region is not automatically safer; it adds replication, routing, split-brain, failover, residency, and cost decisions.

## Supplied names explained

- **Single-region deployment** — Application and data are served from one geographic cloud region. It can still be highly available across zones and backed up elsewhere. A regional outage requires restoration or recovery elsewhere; a single region does not by itself mean a single server or datacenter.
- **Multi-zone deployment** — Redundant components run in separate availability zones within one region. Zones are designed as separate failure domains, but services differ in how they replicate data and fail over. Zone redundancy does not protect against every region-wide event and can introduce inter-zone latency and cost.
- **Active-passive multi-region** — A primary region serves normal traffic while a secondary is prepared to take over. Variants range from backup/restore and pilot light to warm standby. The standby may have less capacity or stale data. Recovery requires detection, promotion, routing, credential and dependency readiness, validation, and eventually failback. “Passive” does not mean no cost or no data processing.
- **Active-active multi-region** — Multiple regions serve traffic at the same time. This can reduce user latency and reduce failover delay, but requires deliberate write ownership or conflict resolution, globally safe IDs, regional data placement, session behavior, and enough independent capacity. Active-active can still have a global shared dependency or correlated deployment failure.
- **Recovery Time Objective (RTO)** — Target maximum time from a specified disruption to restoring the defined service at an acceptable level. State the scope and start/stop measurement. RTO is a design objective, not the provider's recovery time or an automatic guarantee.
- **Recovery Point Objective (RPO)** — Target maximum amount of data loss expressed as time before the disruption. A 15-minute RPO means the business accepts recovery to data no more than 15 minutes behind the failure point, subject to the defined scenario. Backup frequency is only one input; replication lag, commit semantics, and restore validation matter.
- **Tenant isolation** — Controls that prevent one customer's data, identity, workloads, or operational actions from crossing into another's. Options include shared tables with tenant keys, row-level security, schema/database per tenant, dedicated account/subscription, or hybrids. Stronger physical isolation can increase cost and fleet management; shared infrastructure raises the importance of correct authorization, query scoping, monitoring, and restore tooling.
- **Noisy neighbor** — A tenant consumes disproportionate shared CPU, I/O, connection, storage, queue, or API quota and harms another tenant's latency or availability. Mitigations include per-tenant quotas, admission control, fair scheduling, workload isolation, rate limits, per-tenant telemetry, and moving high-demand tenants to dedicated capacity. A tenant identifier or queue partition alone does not provide fairness.
- **Data residency** — A requirement about where data is stored or processed. Define whether it covers primary data, replicas, backups, logs, support access, keys, telemetry, and subprocessors. A provider's regional data plane does not automatically guarantee every related copy or control plane stays in the same jurisdiction. Residency, sovereignty, and transfer rules are related but distinct concepts; ask counsel to interpret obligations.
- **Data deletion workflow** — A governed process to locate and erase eligible data, propagate deletion to copies and processors, handle legal exceptions, and record completion. It must cover active stores, replicas, caches, indexes, derived datasets, messages, exports, and backups according to retention and restore policy. Deletion from a live database is not proof all copies are erased.

## Cross-item comparison

| Requirement | Likely design direction | Key residual risk |
|---|---|---|
| Survive a zonal failure with low interruption | Multi-zone serving and data configured for zone resilience | Shared regional dependencies and application-level failures remain |
| Meet modest regional recovery targets at lower complexity | Single region plus tested backup/restore or pilot light | Restore time and data lag must be demonstrated |
| Meet stricter regional RTO/RPO | Warm standby or active-active, selected per data and workflow semantics | Higher cost, routing/failover complexity, and consistency conflict |
| Strong per-customer isolation or unique recovery | Dedicated or partitioned tenant resources | Provisioning, migration, cost, and patching at fleet scale |
| Cost-efficient high tenant density | Shared resources with enforced tenant scope and quotas | Cross-tenant leakage and noisy-neighbor risk |
| Regional processing commitments | Region-aware storage, backup, logs, support access, and subprocessors | Hidden copies, control-plane metadata, and cross-border transfers |
| Fulfill eligible erasure requests | Data inventory plus deletion propagation and backup expiry/sanitization controls | Legal exceptions, immutable media, derived data, and restore reintroduction |

Prefer a multi-zone design within one region unless the business, legal, or user-latency requirement specifically calls for more. Cloud architecture guidance notes that many workloads can meet resilience needs with multi-zone deployment and a separate-region backup or recovery strategy; multi-region adds significant data synchronization and operating work. This is a decision prompt, not a universal rule.

## Examples

**Recovery target:** a payment-status service has a business-approved RTO of 30 minutes and RPO of 5 minutes for a full regional outage. The design uses a warm standby with asynchronous replication. The team measures replication lag, keeps infrastructure and secrets deployment reproducible, runs quarterly failover and restore exercises, and validates ledger invariants before reopening writes. If lag exceeds the RPO or promotion is incomplete, it presents a controlled degraded state instead of silently accepting conflicting writes. The numbers are illustrative; the business must select targets from impact analysis.

**Shared SaaS data:** each request authenticates a user, resolves tenant membership server-side, and passes a trusted tenant context into repository queries. Database row-level security is an additional control, not the sole proof of correctness. Cache keys include tenant and authorization scope. Queue messages, exports, admin tools, and background jobs carry and verify tenant ownership. Per-tenant rate and storage limits prevent one customer from consuming shared capacity without notice.

**Erasure plus backups:** a valid request is evaluated for applicable legal grounds and exceptions. The application removes active records and derived copies, notifies processors when required, and writes an audit record that does not itself retain the erased personal data. Encrypted backups remain inaccessible for ordinary use and expire under a documented schedule; restores reapply deletion tombstones before user traffic is enabled. The ICO describes keeping backup data “beyond use” until scheduled replacement as one possible approach where immediate overwrite is not feasible under UK GDPR guidance. Confirm the applicable law and retention obligations with counsel.

## Common mistakes

- Treating zones and regions as interchangeable or assuming that a provider automatically fails the application over between regions.
- Claiming an RTO/RPO based on a diagram without timing failover, restore, data validation, and DNS/routing recovery.
- Enabling active-active writes without a conflict policy, ownership model, or protection from duplicate business effects.
- Replicating backups to a region that conflicts with residency or transfer requirements.
- Equating a database-per-tenant layout with complete isolation when identity, logs, caches, operators, or shared services still cross tenants.
- Assuming row-level security or tenant filtering in the API alone covers background jobs, exports, admin tasks, and cache lookups.
- Treating tenant isolation and noisy-neighbor controls as the same thing: one protects boundaries; the other protects fair performance.
- Promising “instant deletion everywhere” without accounting for immutable backups, retention exceptions, downstream processors, and restore workflows.
- Using cryptographic erasure as a universal substitute for deletion and sanitization policy. Key scope, key copies, backups, and media lifecycle still matter.

## Knowledge checks with answers

1. **Does multi-zone deployment meet a regional disaster-recovery target?** Not by itself. It addresses some zonal failures; a regional failure needs a separate recovery strategy and tested data/application restoration.
2. **What is the difference between RTO and RPO?** RTO bounds the target time to restore service; RPO bounds acceptable data loss, measured as time before the disruption. Both need a defined service and failure scenario.
3. **When should a system choose active-active?** When demonstrated latency, RTO, or availability requirements justify concurrent regional serving and the application can handle data ownership, conflicts, routing, and replicated dependencies.
4. **What can a shared database tenancy design use to prevent cross-customer access?** Trusted tenant identity, authorization on every path, query scoping and possibly database row-level security, independent tests, and operational controls. No single control makes the whole system safe.
5. **Does tenant partitioning eliminate noisy neighbors?** No. It can help with accounting or placement, but quotas, fair scheduling, resource controls, and per-tenant observation are still needed.
6. **What should deletion do about a backup that cannot be rewritten immediately?** Follow the applicable legal and retention rules; make the data inaccessible and beyond ordinary use if permitted, expire it on a defined schedule, and prevent it from returning to service after restore without deletion reconciliation.
