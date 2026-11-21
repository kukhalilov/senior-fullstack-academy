# incident response on-call and post-incident learning — Reference: On-call rotations, escalation, runbooks, alert quality, and toil

# Scope and version

This reference covers on-call operations and alert response patterns from the SRE Workbook, with local policy assumptions checked 2026-11-20. There is no universal severity scale, page threshold, staffing ratio, or rotation design. Organizations must align practices with service risk, labor requirements, support hours, and team sustainability. [Google SRE on-call](https://sre.google/workbook/on-call/) [Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/)

# How this group fits the mental model

On-call is the human link from detection to action. An alerting system should route a signal to someone with authority, context, and a safe next step. A reliable rotation has accessible runbooks, tested access, backup coverage, clear handoff, and enough staffing to recover from repeated pages. Automation can reduce repetitive work, but only if it fails safely and exposes its actions.

# Supplied names explained

## Coverage and handoffs

- `On-call engineer` — The engineer assigned to respond to urgent service signals during a coverage period. They need current ownership, escalation support, access, and realistic workload.
- `Primary on-call` — The first responder for pages in a rotation. Primary coverage should include a clear acknowledgement path and workload limits.
- `Secondary on-call` — Backup responder who can assist or take over if the primary is unavailable or overloaded. Escalation rules should say when to engage them.
- `On-call rotation` — A schedule assigning responders to coverage windows. Design it for predictable handoff, adequate rest, and fair distribution rather than just calendar completion.
- `Follow-the-sun rotation` — Coverage distributed across time zones so local teams respond during their day. It depends on overlap, clear written context, and explicit ownership transfer.
- `On-call handoff` — Transfer of current alerts, incidents, changes, risks, and contacts between shifts. Require acknowledgement and ensure the outgoing owner remains responsible until acceptance if policy requires.
- `Escalation schedule` — Ordered contacts or teams engaged after an alert is unacknowledged or unresolved. Test fallback contacts and account for holidays, time zones, and unavailable communication systems.

## Alert classes and delivery behavior

- `Paging policy` — Rules defining which conditions wake a responder and how routing/escalation works. Pages should correspond to urgent user or business impact and an action.
- `Page` — An interrupt requiring prompt response, usually for urgent actionable impact. A page should include service, condition, time window, owner, and response guidance.
- `Ticket alert` — A signal routed into tracked work that can be handled during normal hours. It should have priority and due expectations without waking someone unnecessarily.
- `Notification` — An informational message about system state or work. A notification is not inherently a page and should be routed to a channel suited to its urgency.
- `Alert acknowledgement` — Confirmation that a responder received the alert. It does not indicate diagnosis, mitigation, or resolution.
- `Alert timeout` — The time before an unacknowledged alert moves to a backup or escalates. Set it to balance response urgency with realistic acknowledgement conditions.
- `Escalation delay` — The planned interval before involving another level or team. Delays accumulate into user-impact duration, so test the whole chain rather than each stage in isolation.
- `Alert routing` — Matching alert labels and policy to a team or destination. Stable ownership labels and an tested fallback route prevent orphaned pages.
- `Deduplicated page` — A page where repeated alert events are consolidated into a single incident notification. Deduplication depends on stable identity keys; changing labels can create duplicate pages.

## Signal quality and responder experience

- `Actionable alert` — An alert for which a recipient can take a useful, time-sensitive action. It states impact, scope, owner, and a next step or runbook.
- `Non-actionable alert` — An alert that does not justify immediate recipient action. Route it to a dashboard, ticket, or informational channel, or remove it after verifying it has no operational purpose.
- `Page fatigue` — Reduced responsiveness caused by frequent or low-value pages. It is a signal to improve thresholds, ownership, service reliability, or staffing rather than to blame responders.
- `Alert threshold` — A condition value or ratio that triggers an alert. Select it based on an SLO or meaningful risk, with tested windows and missing-data behavior.
- `Symptom-based page` — A page triggered by a user-visible problem, such as elevated failure rate or latency. It prioritizes real impact even when the underlying cause is unknown.
- `Cause-based page` — A page triggered by a suspected mechanism such as high CPU. Use only if the condition warrants immediate action; otherwise surface it as diagnostic context.
- `Recovery time objective (RTO)` — The target maximum time to restore a service or process after disruption, as defined by the organization. It is a planning objective, not a guarantee that a particular response will meet it.

## Runbooks, access, and readiness

- `Runbook` — A procedure explaining how to diagnose or operate a service for a known condition. Keep steps versioned, safe, specific, and tested by someone other than the author.
- `Runbook automation` — A scripted or workflow-based execution of runbook steps. It should expose preconditions, permissions, expected effects, errors, and stop/rollback behavior.
- `Emergency access` — Temporary privileged access used during an urgent operational or security event. Scope it narrowly, log its use, review afterward, and ensure normal access remains sufficient for routine tasks.
- `Break-glass account` — A controlled emergency identity used when ordinary authentication or access paths fail. Store and rotate credentials safely, monitor usage, and test recovery procedures.
- `On-call readiness` — The state in which responders have required knowledge, access, tools, contacts, and time to respond. Validate readiness before a rotation begins rather than during the first page.
- `On-call load` — The volume and disruption of operational work assigned to the rotation. Measure pages, time, after-hours interruptions, and recovery burden to identify unsustainable design.
- `After-hours page` — A page delivered outside a person’s normal working hours. Track its frequency and impact to improve alert quality, staffing, and service reliability.
- `Service ownership` — Clear responsibility for operating, changing, and improving a service. Ownership includes an accountable team and backup route, not just a name in a catalog.
- `Service catalog entry` — A structured record of service purpose, owner, dependencies, runbooks, criticality, and operational links. Keep it current enough to route incidents and understand blast radius.

## Toil and automation

- `Operational toil` — Repetitive, manual operational work that scales with service growth and provides limited lasting value. Not all operational work is toil; one-off engineering, planning, and judgment-heavy response may be valuable.
- `Toil measurement` — Recording operational work volume, frequency, time, and interruption. The measure helps prioritize automation and does not by itself define whether work is wasteful.
- `Toil reduction` — Removing or reducing repeated manual tasks through service design, automation, or process improvement. Confirm that the toil has not simply shifted to another team or created hidden failure risk.
- `Automated remediation` — An automated action that detects and mitigates a known condition. Constrain triggers, permissions, rate, blast radius, and retries; monitor outcomes and provide a safe disable path.
- `Human approval gate` — A requirement for a person to authorize an automated or high-impact action. It can protect against irreversible mistakes, but response time and reviewer availability must be considered.
- `Rollback plan` — A prepared method to reverse or contain a change. Validate compatibility, data changes, dependencies, and required access; some migrations cannot simply be undone.
- `Feature flag kill switch` — A remotely controlled flag that disables a feature. It should be tested under production-like conditions, accessible during an incident, and safe for in-flight work and data consistency.
- `Game day` — A planned exercise in which teams practice operational scenarios. Define scope, safety guardrails, observers, stop criteria, and follow-up actions.
- `Chaos experiment` — A controlled injection of failure to test resilience hypotheses. It requires bounded blast radius, steady-state measures, abort controls, and explicit authorization.
- `Operational readiness review` — A pre-launch assessment of service ownership, monitoring, runbooks, security, capacity, recovery, and on-call readiness. It should result in owners and decisions, not a checklist with no accountability.

# Cross-item comparison

| Signal | Urgency | Expected response |
| --- | --- | --- |
| Page | Immediate | Wake responder; perform action or escalate |
| Ticket alert | Planned/normal hours | Investigate and track to a due date |
| Notification | Informational | Review through normal channel; usually no immediate action |

Symptom-based pages prioritize impact; cause-based pages can be useful when the mechanism itself is dangerous and actionable. Runbook automation performs known steps; automated remediation makes a system decision and changes state, so it needs stronger guardrails. A game day rehearses response; a chaos experiment injects a controlled fault, though the terms can overlap in practice.

# Examples

A service page states: “Checkout good-event ratio below objective for 10m; affected region=west; owner=payments-on-call; runbook=link; check current incident channel; next escalation after 5m.” If unacknowledged, the system pages secondary and then the service lead. Separately, a CPU warning creates a ticket unless elevated CPU is already causing user-visible SLO burn. A runbook automation can restart a stateless worker only when queue age is bounded, the worker is not processing a non-idempotent operation, and the restart rate limit permits it. Otherwise it asks a human to approve.

# Common mistakes

- Paging for every warning because routing to a dashboard was never designed.
- Treating acknowledgement as resolution.
- Leaving alerts without a clear service owner or escalation fallback.
- Using escalation timers that are longer than the service’s tolerated impact.
- Designing one-person rotations without backup, recovery time, or realistic load measurement.
- Automating an action that is safe only under assumptions the script does not check.
- Giving a break-glass account permanent broad access and never reviewing its use.
- Running a chaos experiment without abort criteria or a bounded target.
- Measuring toil only as a percentage while ignoring interruption, recurrence, and transferred work.

# Knowledge checks with answers

1. What makes an alert a page? **Its urgency and need for immediate human action, not just its severity label.**
2. Does acknowledgement prove recovery? **No; it only proves receipt.**
3. Why include a secondary on-call? **To provide backup, escalation, or relief when the primary is unavailable or overloaded.**
4. What guardrails should automated remediation have? **Verified preconditions, least privilege, rate/blast limits, observable outcomes, stop/rollback, and a fallback.**
5. What does a game day validate? **People, processes, tools, ownership, and response readiness in a planned scenario.**

# Sources

[Google SRE on-call](https://sre.google/workbook/on-call/) · [SRE alerting on SLOs](https://sre.google/workbook/alerting-on-slos/) · [Incident response](https://sre.google/workbook/incident-response/) · [SRE incident management guide](https://sre.google/resources/practices-and-processes/incident-management-guide/)
