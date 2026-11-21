# incident response on-call and post-incident learning — Interview questions and reasoning

# Core questions

1. **When do you declare an incident?**
2. **How do you distinguish severity from priority?**
3. **What does an incident commander do?**
4. **How would you structure technical investigation and production changes?**
5. **Why mitigate before completing root-cause analysis?**
6. **What evidence would make you declare service recovery?**
7. **How do you choose between rollback, forward fix, and feature-flag disablement?**
8. **What is a good customer-facing incident update?**
9. **How should an on-call escalation policy work?**
10. **What makes a page actionable?**
11. **How do you run a blameless postmortem?**
12. **What makes an action item effective?**
13. **How do you protect evidence during a security incident?**
14. **How do RPO, RTO, and maximum tolerable downtime differ?**
15. **Which NIST incident response publication is current?**

# Concise interview answers

1. Declare when impact or credible risk requires coordinated response, even if cause is unknown. Use local criteria and immediately establish ownership and channel.
2. Severity describes the incident’s impact/urgency class under local criteria; priority determines the order of response work. They may be related but are not interchangeable.
3. The commander maintains shared state, sets objectives, assigns roles, coordinates decisions and updates, escalates, and closes when criteria are met. They should avoid being the only investigator.
4. Assign a technical lead to gather evidence and recommend options; have an operations lead coordinate system changes; record decisions and impact; use a commander to set objectives and prevent conflicting actions.
5. Ongoing harm is urgent, while complete causal analysis can take longer. A safe and reversible mitigation can reduce impact while investigation continues.
6. Fresh user-facing SLIs, synthetic workflows, data-integrity/reconciliation checks, queue/backlog health, dependencies, and a suitable watch period.
7. Compare likely impact, reversibility, blast radius, data/schema compatibility, current evidence, and validation. No option is universally safest.
8. State confirmed impact, current response, known workaround, and next update time. Avoid unsupported causes, promises, and sensitive details.
9. Route to a reachable primary, escalate after clear acknowledgement timeouts, include backups and alternate channels, and test the whole chain and contact data.
10. It represents urgent user/business harm and gives a responder authority, context, and a time-sensitive action. Otherwise create a ticket or notification.
11. Reconstruct evidence, identify triggering events and contributing/latent conditions, understand decisions using information available then, and define risk-ranked actions without shaming.
12. It has a concrete outcome, one owner, a realistic due date, risk priority, dependencies, and verification evidence.
13. Preserve original logs/state, provenance, timestamps, integrity, access history, and chain of custody; restrict sharing and involve the security plan’s roles before destructive cleanup.
14. RPO is intended maximum data-loss interval; RTO is target time to restore service/process; maximum tolerable downtime is the business limit beyond which impact becomes unacceptable. They inform one another but are not identical.
15. NIST SP 800-61 Rev. 3 final, published April 2025; Rev. 2 was withdrawn and superseded.

# Deep follow-up answers

## How do you coordinate a cross-team outage?

Declare the incident, create a durable coordination channel/document, name commander/technical/operations/communications/scribe roles, and state an immediate user-impact objective. Separate observations from hypotheses. Track actions with one owner and record major decisions. Use an update cadence with clear next update times. The commander manages priorities and escalations while technical leads investigate; production changes are coordinated and validated. Hand off explicitly across shifts and close only after recovery criteria pass.

## What does “mitigation first” mean, and what does it not mean?

It means prioritize stopping user harm or exposure over finding a complete causal theory. It does not mean making an unreviewed risky change. Select a bounded, reversible action, check data and dependency effects, record the decision, and verify outcomes. Continue investigation in parallel where possible.

## How do you avoid a false recovery declaration?

Do not rely on a successful deployment, green health check, or one cleared page. Check user-oriented indicators and synthetic journeys from the affected path, data integrity, queue age/backlog, dependencies, and telemetry freshness. State recovery criteria before acting and retain a watch period appropriate to the failure mode.

## What makes an incident review blameless but accountable?

Ask what information, tool design, incentives, access, workload, and safeguards shaped behavior. Assume people acted reasonably with what they knew at the time. Identify technical and organizational changes with owners and due dates, and verify completion. Use separate fair processes for individual misconduct where applicable; do not use a reliability review as public shaming.

## How should a security incident differ from an ordinary availability incident?

It can require evidence preservation, containment before cleanup, credential/session analysis, restricted communication, and early security/privacy/legal escalation. Eradication and recovery are distinct. Notification obligations are jurisdiction-, data-, and contract-specific; do not invent one deadline. Current NIST guidance is SP 800-61 Rev. 3; CISA federal playbooks apply to their stated federal scope. [NIST Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final) [CISA scope](https://www.cisa.gov/resources-tools/resources/incident-response-playbooks)

# Scenario questions

## Scenario: error alert clears after a failover, but customers still report stale data

Keep the incident open. Check replication lag, write/read consistency, cache invalidation, queue state, and data reconciliation. Confirm the user-visible correctness SLI and communicate the remaining issue. Define whether to maintain the failover, stop writes, or reconcile under the technical and operations leads. Failover restores routing, not necessarily data correctness.

## Scenario: your team repeatedly pages the same person overnight

Investigate alert quality, service reliability, rotation capacity, escalation, coverage, and toil. Remove non-actionable pages or route them to tickets, repair missing automation and runbooks, distribute expertise, and measure load. Do not label the engineer’s response as the root problem.

## Scenario: a postmortem action is overdue for six months

Reassess risk and owner capacity, dependencies, leadership prioritization, and whether the proposed action was too broad. Split it into verifiable work if appropriate, escalate the residual risk, and check if recurrence or near misses changed priority. Do not quietly close it without evidence.

## Scenario: a vendor announces a suspected breach

Verify the vendor notice through trusted contact channels, activate internal security/third-party incident procedures, identify affected integrations and credentials/data, preserve evidence and contract communications, and assess containment options. Coordinate customer/regulator communications with designated roles. Do not assume vendor recovery means your service/data is safe.

# Tradeoffs and alternatives

Rollback is fast when compatibility permits; forward fix may be necessary after irreversible state changes; feature-flag disablement can narrow impact if coverage is complete. Failover can restore availability but may lose data or move to a compromised/lagging system. Queue pause limits processing effects but increases backlog and user delay. The decision depends on evidence, blast radius, reversibility, and validation. Combine command roles in a small incident if necessary, then split as workload and stakeholder needs increase.

# Common weak answers

- “I wait until I know the root cause.” This delays coordination and harm reduction.
- “The incident commander fixes the issue.” The commander coordinates; technical and operations roles execute assigned work.
- “Rollback is always safest.” Data/schema and external side effects can make it unsafe.
- “The alert is green, so it is resolved.” Data loss, backlog, and telemetry failures can remain.
- “Blameless means no owner.” Learning actions still require accountable owners and verification.
- “We notify regulators within 72 hours.” That may be true in some legal contexts, but no universal deadline can be inferred without jurisdiction and event facts.
- “NIST 800-61 Rev. 2 is current.” Rev. 3 superseded and withdrew it in April 2025.
- “CISA’s playbook is the required incident process for every company.” Its federal playbooks have a defined agency scope.

# Self-check rubric

Score 0 (cannot explain), 1 (partial), or 2 (clear and evidence-based):

- I can declare and classify using impact without claiming a universal scale.
- I can establish command roles, objectives, updates, and explicit handoffs.
- I compare mitigations for reversibility, blast radius, and data integrity.
- I verify recovery using user SLIs, synthetic checks, data, and backlog evidence.
- I design actionable pages and sustainable escalation/rotation paths.
- I explain blameless causal analysis and verifiable action ownership.
- I preserve security evidence and escalate jurisdiction-specific decisions appropriately.
- I know that NIST SP 800-61 Rev. 3 is current and Rev. 2 is withdrawn.

A score below 12 suggests revisiting the overview and practicing incident simulations; 12–14 indicates solid reasoning but gaps remain; 15–16 shows strong interview readiness, subject to the specific organization’s policies.

# Sources

[Google SRE managing incidents](https://sre.google/sre-book/managing-incidents/) · [SRE incident response](https://sre.google/workbook/incident-response/) · [SRE on-call](https://sre.google/workbook/on-call/) · [SRE postmortem culture](https://sre.google/sre-book/postmortem-culture/) · [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
