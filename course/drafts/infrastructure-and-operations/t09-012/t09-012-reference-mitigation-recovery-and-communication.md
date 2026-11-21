# incident response on-call and post-incident learning — Reference: Containment, restoration, evidence, and customer communication

# Scope and version

This reference explains the supplied operational mitigation, recovery, verification, and communication practices. It follows current SRE incident-response guidance and NIST SP 800-61 Rev. 3 final, checked 2026-11-20. The safest action depends on service architecture, data state, security plan, and authority; examples are not universal commands. [SRE incident response](https://sre.google/workbook/incident-response/) [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

# How this group fits the mental model

Mitigation stops or reduces harm; recovery restores expected behavior and verifies it; resolution closes the coordinated response after criteria are met. A fast action can still be unsafe if it increases data loss, spreads compromise, or creates a larger blast radius. Choose by impact, reversibility, evidence, and validation.

# Supplied names explained

## Limit harm and protect dependencies

- `Incident containment` — Immediate measures to stop an incident from spreading or causing more damage. Security containment may preserve evidence and access logs; availability containment may deliberately disable a capability.
- `Blast-radius reduction` — Limiting the set of users, services, regions, data, or credentials affected. A smaller canary or isolated dependency can reduce ongoing harm while preserving unaffected paths.
- `Traffic shedding` — Intentionally rejecting or deferring lower-priority traffic to protect critical service capacity. Define what work may be dropped and communicate customer impact.
- `Load shedding` — Reducing work admitted to a saturated component through queues, concurrency limits, or prioritization. It differs in implementation from traffic shedding but shares the aim of avoiding overload collapse.
- `Failover` — Moving service responsibility to a standby or alternate component/region. Check replication lag, data integrity, capacity, dependencies, and split-brain risk before switching.
- `Failback` — Returning service from a failover target to the preferred or repaired system. It can be riskier than failover because state must be reconciled and traffic shifted carefully.
- `Service degradation mode` — Operating with reduced functionality to preserve a critical path. Make the degraded behavior explicit to users and check that omitted functions do not violate data invariants.
- `Read-only mode` — Disabling writes while preserving read access. It can protect data from corruption but may leave users unable to complete workflows; verify caches and downstream queues do not imply writes succeeded.
- `Queue pause` — Temporarily stopping consumption or production of queued work. Check storage growth, message expiry, ordering, idempotency, and how processing will resume.
- `Dependency isolation` — Blocking or limiting interaction with a failing or compromised dependency. A circuit breaker or network policy can contain cascading failure but may remove needed functionality.
- `Circuit breaker activation` — Preventing repeated calls to a failing dependency until recovery conditions are met. Observe open/half-open behavior and retry interactions to avoid synchronized load spikes.
- `Rate-limit mitigation` — Restricting request rates to protect a service or dependency. Choose scopes and exemptions carefully so legitimate critical traffic remains available.
- `Capacity mitigation` — Adding or reallocating compute, connections, workers, storage, or quotas to relieve a bottleneck. Verify the limiting resource and avoid scaling a saturated downstream dependency into greater failure.

## Change strategy and deployment controls

- `Configuration rollback` — Restoring a prior configuration after a problematic change. Configuration may interact with new code or data, so verify compatibility and capture the current state before reversing.
- `Application rollback` — Returning application binaries or containers to an earlier version. It is safe only if schemas, serialized data, APIs, and external side effects remain backward-compatible.
- `Database rollback` — Reversing a database schema or data change. It can be impossible or unsafe after writes/transformations; use tested restore or forward-repair strategies where appropriate.
- `Forward fix` — Deploying a new change that corrects the issue without reverting to an earlier version. It may be safer for irreversible migrations but requires a change review and validation under pressure.
- `Hotfix` — A narrowly scoped urgent code change intended to mitigate a live incident. Use normal safety controls proportionate to urgency, including peer review, staged rollout, and rollback planning where feasible.
- `Feature flag disablement` — Turning off a feature through a configured runtime flag. Validate the flag has the intended effect and preserves in-flight operations and data consistency.
- `Canary abort` — Stopping a staged rollout when canary evidence indicates risk. Ensure routing returns to the safe population and confirm no background or asynchronous changes continue.
- `Deployment freeze` — Temporarily pausing routine releases during an incident. Define authority and exceptions for coordinated emergency changes to avoid accidental lockout of needed repairs.
- `Traffic shift` — Moving requests or workloads between versions, zones, or regions. Gradual shifts provide observability but need capacity and state consistency at the destination.

## Data and recovery checks

- `Data recovery` — Restoring data to a trustworthy state after loss, corruption, or unauthorized change. Identify the recovery point and reconcile legitimate writes made since it.
- `Backup restore` — Reconstructing data or service state from backup media. Restore time, dependencies, keys, schema compatibility, and post-restore validation determine actual recovery success.
- `Point-in-time recovery` — Restoring to a specified point using supported backup/log history. Confirm that the desired point is within the retained chain and that downstream transactions can be reconciled.
- `Data reconciliation` — Comparing sources of truth or related records to find missing, duplicate, or inconsistent state. Reconciliation may require idempotent repair and an auditable record of corrections.
- `Recovery validation` — Evidence-based confirmation that service and data meet recovery criteria. Include user workflows, consistency, backlog, access/security, and error/latency indicators.
- `Service-level indicator verification` — Checking user-oriented service measurements before declaring recovery. Confirm the SLI’s data is fresh and its denominator is intact.
- `Synthetic transaction verification` — Executing a controlled end-to-end test that simulates a user operation. It checks a path from a chosen vantage point but does not prove every region, user, or data cohort is healthy.
- `Recovery watch period` — A defined period of heightened monitoring after apparent recovery. It catches delayed recurrence, queue buildup, or side effects that a single successful check misses.
- `Incident de-escalation` — Reducing severity or response staffing as impact and risk fall. It should be based on evidence, with a named owner for remaining watch and follow-up work.

## Evidence and communication

- `Incident evidence preservation` — Retaining relevant operational records and system state before actions overwrite them. Coordinate retention, access, and integrity with security/legal requirements.
- `Forensic evidence` — Data used to investigate an incident, especially security events. Preserve provenance, integrity, timestamps, and access history; do not casually edit originals.
- `Customer communication` — Updates to customers about impact, workarounds, and recovery. Use clear factual language and the organization’s approval process; avoid speculation and private details.
- `Status page incident` — A public incident record with affected components and state updates. Use consistent statuses and timestamps; do not mark resolved before validation.
- `Internal incident update` — A concise status message for staff and stakeholders. It should distinguish facts, estimates, hypotheses, objectives, owners, and next update time.
- `Regulatory notification decision` — A documented assessment of whether and when a regulator must be notified. It depends on jurisdiction, data, contracts, and counsel; technical responders should escalate promptly rather than invent a universal deadline.
- `Support team briefing` — Approved context for customer support, including affected users, known behavior, workaround, and escalation. Keep it synchronized with status-page information.
- `Incident workaround` — A temporary user or operator path that avoids the failing functionality. State limitations and risks and verify it does not create inconsistent data.
- `Known issue notice` — A documented description of a confirmed issue and its current impact or workaround. Keep it accurate as scope and recovery evolve.

# Cross-item comparison

| Option | Benefit | Principal risk to check |
| --- | --- | --- |
| Rollback | Fast return to a known version/configuration | Schema or data incompatibility; old vulnerability |
| Forward fix | Can preserve irreversible state changes | New code change under pressure; rollout risk |
| Feature disablement | Narrowly removes risky behavior | Flag may not cover all paths or in-flight work |
| Failover | Can restore service capacity | Lag, split brain, corruption replication, failback risk |
| Read-only/degraded mode | Preserves a critical subset of service | User workflow or data invariants may still be harmed |

Containment versus eradication is especially important in security incidents: containment limits spread; eradication removes the threat. Recovery restores trusted operation. Preserve evidence and follow the security response plan before cleanup. [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

# Examples

A queue-backed billing service experiences duplicate charges after a retry change. Pausing the consumer may limit further impact, but messages accumulate and customers wait. The team checks idempotency keys and transaction records before replaying. It disables the retry behavior, reconciles affected payments against the authoritative processor, and resumes a bounded queue after a canary. Recovery validation includes duplicate-charge count, oldest-message age, successful billing SLI, and a watch period. “Queue drained” alone would not prove the ledger is correct.

# Common mistakes

- Failing over before checking replication health and discovering the standby contains corruption or is too far behind.
- Rolling back an application after an incompatible schema change.
- Resuming a paused queue without proving replay is idempotent.
- Calling recovery complete after one synthetic check while a backlog remains.
- Eradicating or rebuilding a suspected compromised host before preserving needed forensic evidence.
- Posting unsupported recovery times or causes in customer communications.
- Treating a regulatory decision as an engineer’s guess rather than a designated escalation.

# Knowledge checks with answers

1. What is the difference between containment and recovery? **Containment limits further harm/spread; recovery restores and validates trustworthy operation.**
2. Why may database rollback be unsafe? **Writes, schema changes, or transformations can make a reverse operation impossible or inconsistent.**
3. What does a synthetic transaction prove? **That one tested path works from one vantage point under that test; not that every user/region is healthy.**
4. Why pause a queue carefully? **Backlog capacity, expiry, ordering, and replay correctness must be planned.**
5. Who determines legal/regulatory notification deadlines? **The designated organization/legal/privacy process under applicable requirements, not a universal technical rule.**

# Sources

[SRE incident response](https://sre.google/workbook/incident-response/) · [SRE incident management](https://sre.google/workbook/incident-management/) · [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) · [CISA incident response playbooks](https://www.cisa.gov/resources-tools/resources/incident-response-playbooks)
