# incident response on-call and post-incident learning — Exercises and worked solutions

# Goals

- Declare and coordinate an incident with clear local severity assumptions.
- Choose mitigation by user impact, reversibility, blast radius, and data risk.
- Communicate facts and uncertainty without speculative claims.
- Verify recovery with service and data evidence.
- Turn the response into owned and verifiable learning actions.

# Worked example

A deployment correlates with checkout failures rising from 0.2% to 12% in one region. Orders may be accepted by the API but not written to the order ledger. The on-call declares an incident, assigns a commander, technical lead, operations lead, communications lead, and scribe, and states the objective: stop new order loss while preserving payment/order consistency.

The technical lead checks the deployment diff, queue state, payment processor, and data reconciliation. The operations lead prepares a canary abort and rollback, first validating database compatibility and that already accepted requests will not replay as duplicate charges. The commander approves the smallest safe change and asks communications to say the team is investigating a regional checkout issue; root cause is not confirmed. After rollback, the team tests synthetic checkout, reconciles accepted payments against order records, checks queue age and service SLIs, and watches for recurrence. Once evidence satisfies closure criteria, the commander de-escalates and assigns follow-up actions with owners and verification.

# Exercises

## Exercise 1: declare and classify

An alert reports elevated latency for one route, but support reports a rise in failed purchases and the dashboard’s success ratio appears normal. Write a concise initial situation report with known facts, unknowns, one response objective, an owner/role structure, and a next update time. State which severity inputs should be checked without inventing a universal numeric level.

## Exercise 2: select mitigation

A queue consumer is producing duplicate inventory updates after a software release. Compare four possible immediate actions: pause the queue, roll back the application, disable a feature flag, or fail over the database. Select the first action you would investigate and list the evidence/preconditions required before execution.

## Exercise 3: communication under uncertainty

Draft an internal update and a customer/status-page update when the team has confirmed that checkout failures are elevated in one region but does not know the cause. Include what is known, what is being done, and when the next update will arrive.

## Exercise 4: recovery proof

The deployment rollback completes and the error alert clears. List at least five checks before declaring recovery, including one data-integrity check and one delayed-work check.

## Exercise 5: on-call escalation

The primary on-call does not acknowledge a high-impact page. Explain how the escalation schedule should behave and what system gaps must be reviewed if the secondary also cannot be reached.

## Exercise 6: post-incident review

The incident was triggered by a configuration change, but responders also had no alert on queue age, the runbook link was stale, and only one person had production access. Write a blameless contributing-factor summary and three verifiable action items.

## Exercise 7: security response

A production token may have appeared in a log that was accessible to a broad internal group. List immediate containment, evidence-preservation, and escalation steps. Identify why an exact regulator notification deadline cannot be inferred from this scenario alone.

# Progressive hints

1. Keep observed data separate from hypotheses; “latency is high” and “purchases fail” are facts, but the deployment as cause remains unconfirmed.
2. Compare the scope and reversibility of each action; queue pause may stop duplicates but creates backlog, while failover may not stop faulty application writes.
3. Avoid saying “root cause identified” or promising a resolution time without evidence.
4. Check customer-facing success, transaction integrity, queue age, backlog processing, SLIs, synthetic path, and a watch period.
5. Escalation is a timed chain with fallback contacts, but should also expose ownership, coverage, and contact-data failure.
6. Describe system conditions and information available at the time; make each action testable with owner/date.
7. Restrict access, preserve original logs and access history, revoke/rotate credentials through the approved plan, assess token scope and use, and involve security/privacy/legal owners.

# Complete solutions

## Exercise 1 solution

Example: “Checkout latency is elevated on the regional purchase route, and support reports more failed purchases; the dashboard success ratio is not currently corroborating that report. The affected request population and cause are not confirmed. Objective: determine whether orders or payments are being lost and stop additional customer harm. I am incident commander; the purchase-service owner is technical lead; on-call operations owns any production change; communications will provide a customer update; scribe records facts and decisions. We will update at 14:20.” Assess severity using affected customers, financial/data risk, duration, regional scope, workaround, and contractual/organizational criteria. Do not assign a number without the local matrix.

## Exercise 2 solution

First investigate whether pausing consumption safely stops further duplicate updates without losing accepted messages or exceeding queue retention/capacity. Verify message durability, consumer idempotency, queue age/capacity, ordering, in-flight transactions, and a bounded resume/replay plan. A feature flag may be the narrower action if it specifically disables the faulty update and preserves safe processing. Rollback requires compatibility checks; failover is unlikely to fix faulty application logic and could replicate duplicates. The correct action depends on evidence and local authority; do not apply a blanket rule.

## Exercise 3 solution

Internal: “Confirmed: checkout failures are elevated in region west since approximately 14:00; customer scope is still being measured. Cause is unknown. We are comparing recent changes with payment and order-ledger signals and have paused nonessential releases. Technical lead: service team; operations lead: on-call. Next update by 14:20, sooner if impact changes.”

Customer-facing: “We are investigating elevated checkout failures affecting some customers in the west region. Our team is working to restore reliable purchases. We will post another update by 14:20.”

These statements avoid unsupported cause and resolution-time claims. Use the company’s approved channel and tone.

## Exercise 4 solution

Check: (1) customer-facing checkout success and latency SLIs using fresh data; (2) synthetic transaction from the affected region; (3) payment/order ledger reconciliation for the affected interval; (4) queue backlog and age of oldest item, followed by bounded processing verification; (5) retry and duplicate-charge behavior; (6) error rates on dependent services; (7) deployment/version distribution and canary state; (8) a recovery watch period with no renewed failure. The alert clearing is only one signal, and could reflect missing telemetry or a traffic drop.

## Exercise 5 solution

After the configured acknowledgement timeout, page the secondary; if still unacknowledged, route to the next defined escalation contact such as service lead or incident commander, with an alternate channel. Ensure the page contains impact, service, and response path. Review wrong routing labels, stale contact details, delivery-provider outage, unclear acknowledgement semantics, understaffed coverage, fatigue, time-zone conflicts, and missing offline fallback. A schedule is not reliable until tested end to end.

## Exercise 6 solution

Blameless summary: “A configuration change increased queue-consumer concurrency. The change was valid under expected load, but queue age was not monitored, so impact was recognized only after customer reports. The runbook referenced a retired dashboard, and production access depended on one responder, delaying mitigation. The system made a risky state difficult to detect and recover from.”

Actions: (1) add a queue-age SLI/page with a test proving it fires at the approved threshold; owner=queue team, due date set by local risk review; (2) update the runbook dashboard and have a secondary on-call complete a timed rehearsal; (3) implement staged concurrency configuration with automatic validation and a canary-abort test. Each action needs owner, target date, and evidence of completion; priorities should reflect risk.

## Exercise 7 solution

Restrict the log’s access and prevent further export; preserve the original artifact, access logs, timestamps, retention metadata, and chain of custody according to the security plan. Determine token type, scope, expiry, reachable systems, and observed use; revoke/rotate it through approved procedures and check for derived tokens or persistence. Notify the security incident commander and designated privacy/legal owners. The reporting deadline depends on jurisdiction, data involved, contracts, affected people, and the organization’s legal assessment; the scenario alone does not establish a universal deadline. NIST SP 800-61 Rev. 3 is current general guidance; Rev. 2 is withdrawn. [NIST Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

# Tests and edge cases

- The rollback fixes latency but does not repair orders accepted during the failure: keep response open for reconciliation.
- The queue continues to grow while paused: verify storage and expiry limits, communicate delay, and define safe replay.
- Traffic drops to zero: an error ratio can look healthy; inspect volume and telemetry freshness.
- The alert clears because the metric exporter failed: check target/scrape and dropped-telemetry signals.
- The primary and secondary use the affected identity provider: use the documented alternate access path.
- Evidence contains personal information: restrict, classify, and preserve according to policy without broad copying.
- A proposed failover target is behind or shares the compromised credentials: verify before shifting.
- The status page says “resolved” before watch criteria pass: correct the update and restate current status.

# Reflection questions

- Which decisions should an incident commander make, and which should stay with a technical owner?
- What local policy determines severity and who may authorize a public update?
- What service data could be lost or duplicated by your most common rollback?
- Which on-call escalation step has not been tested recently?
- How will your organization verify that postmortem actions reduce risk?

# Sources

[Google SRE incident response](https://sre.google/workbook/incident-response/) · [Google SRE incident management](https://sre.google/workbook/incident-management/) · [SRE on-call](https://sre.google/workbook/on-call/) · [SRE postmortem culture](https://sre.google/workbook/postmortem-culture/) · [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
