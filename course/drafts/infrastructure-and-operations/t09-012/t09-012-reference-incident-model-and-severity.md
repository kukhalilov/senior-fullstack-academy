# incident response on-call and post-incident learning — Reference: Incident declarations, impact, severity, and command roles

# Scope and version

This lesson covers incident declaration, impact, coordination roles, and lifecycle terminology. Current source snapshot: Google SRE incident-management guidance and NIST SP 800-61 Rev. 3 final (April 2025), checked 2026-11-17. Role names, severity levels, and declaration rules are organization-specific examples and policies, not universal standards. Rev. 3 supersedes NIST SP 800-61 Rev. 2, withdrawn in 2025. [Google SRE managing incidents](https://sre.google/sre-book/managing-incidents/) [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

# How this group fits the mental model

An incident model creates a shared command structure so responders can reduce impact without making conflicting changes or losing information. Severity communicates urgency and scope; roles divide coordination, technical work, operations, and communication. Lifecycle labels describe work state, not a universal prescribed sequence.

# Supplied names explained

## Event, declaration, scope, and priority

- `Production incident` — An event or condition that disrupts or credibly threatens production service, data integrity, security, or business operations. Local policy defines thresholds and whether near misses enter the same workflow.
- `Incident declaration` — The explicit decision to coordinate a response under the incident process. It can occur before root cause is known and should establish a commander, channel, and initial objective.
- `Incident severity level` — A locally defined category for urgency and impact. Use written criteria and revise the level when scope or risk changes; severity numbers are not comparable between companies without definitions.
- `Severity matrix` — A decision aid mapping dimensions such as user impact, duration, data/security risk, and criticality to local response levels. It guides consistency but cannot replace judgment in a novel situation.
- `Customer impact` — The effect on customers’ ability to use a product, complete a journey, or trust its data. Quantify affected population and experience where possible and label estimates as estimates.
- `Business impact` — Consequences to business operations, financial exposure, contractual commitments, safety, or reputation. It may differ from service metrics and should be assessed with responsible stakeholders.
- `Scope of impact` — The affected services, regions, users, functions, data, and time interval. Update it as evidence changes to avoid both understatement and speculation.
- `Incident priority` — The order in which incident work is handled relative to other work, based on impact and urgency. It is a local operational decision, not automatically the same as severity.
- `Major incident` — An incident meeting an organization’s criteria for broad or high-risk coordination. The label commonly triggers additional roles and communications, but no universal severity number defines it.
- `Security incident` — A suspected or confirmed event affecting confidentiality, integrity, or availability through security-relevant activity. Preserve evidence and involve the designated security response plan early.
- `Data integrity incident` — A situation where data may be lost, corrupted, duplicated, stale, or inconsistent. Service availability may appear normal while this harm continues.
- `Third-party dependency incident` — A production impact involving an external provider or dependency. The service owner still coordinates customer impact, mitigations, and communications while engaging the vendor.

## Roles and command mechanisms

- `Incident commander` — The coordinator accountable for shared state, objectives, delegation, priority, and escalation. They should keep strategic context and avoid becoming the bottleneck for every technical decision.
- `Incident response team` — The responders assigned to investigate, operate, communicate, and support an incident. Membership should be role-based and expanded as needed rather than inviting every observer into the work channel.
- `Incident role assignment` — Naming who performs each response responsibility, including backup or combined roles. Explicit assignment prevents assumptions that “someone else” is updating stakeholders or recording decisions.
- `Technical lead` — The person coordinating diagnosis, technical hypotheses, and solution options. They provide evidence and recommendations while production changes follow the organization’s operational controls.
- `Operations lead` — The person coordinating execution of production changes and monitoring their effects. Google SRE’s model places system modifications with the operations function to prevent conflicting changes.
- `Communications lead` — The person preparing and sending consistent responder, stakeholder, support, or customer updates. Separate this work from investigation so updates remain timely and accurate.
- `Scribe` — The person recording time, impact, decisions, hypotheses, actions, owners, and updates. A scribe reduces memory load and supports handoff and later review.
- `Incident bridge` — A shared real-time meeting or call for incident coordination. Keep a durable written record too; audio alone is difficult to search or hand off.
- `Incident channel` — A shared chat or collaboration space for incident work. Use the predefined channel, access controls, naming, and retention policy; avoid relying on the affected service to host the only coordination surface.
- `Incident timeline` — A sequence of observed events, decisions, actions, and impact changes with timestamps and sources. Distinguish event time from the time it was noticed or recorded.
- `Situation report` — A concise current summary of impact, known facts, unknowns, objectives, actions, and next update time. Mark confidence and avoid turning a hypothesis into a confirmed cause.
- `Incident objectives` — Concrete outcomes for the response, prioritized over a list of disconnected tasks. Good objectives reduce harm, protect data, and define evidence needed to proceed.
- `Incident action tracker` — A list of assigned tasks, owners, status, and dependencies. It prevents duplicate work and makes unowned important tasks visible.
- `Incident decision log` — A record of significant choices, rationale, alternatives, owner, and time. It enables handoff and reconstruction without slowing every small action.
- `Incident coordination` — The work of aligning responders, objectives, decisions, timing, and communications. Coordination should reduce contention and free technical responders to execute.
- `Incident command system (ICS)` — A formal incident-management framework with defined command and functional roles, used in emergency management contexts. Software organizations may borrow concepts, but should map authority and structure to their own policies rather than assume they have adopted ICS wholesale.
- `Incident response playbook` — A prepared response procedure for a class of incident. It should guide decisions and verification while allowing adaptation to actual conditions.
- `Incident response checklist` — A concise sequence of prompts or controls to reduce omissions under pressure. It is a memory aid, not an automatic substitute for judgment.

## Communication and handoff

- `Status page update` — A public or customer-facing update describing service impact and response status. It should be timely, accurate, appropriately scoped, and free of speculative cause claims.
- `Stakeholder notification` — A message to affected internal or external parties with relevant impact and next steps. Audience, approval, confidentiality, and timing depend on policy.
- `Incident escalation` — Increasing the response level or involving additional authority/resources when impact, uncertainty, or elapsed time warrants it. Escalation should be available without stigma.
- `Escalation policy` — Rules for when and how to involve additional responders or leadership. Maintain contact data, timeouts, fallback paths, and override authority.
- `Incident handoff` — An explicit transfer of command or responsibility that includes current impact, state, objectives, decisions, actions, risks, and acknowledgement. A shift change without acceptance is not a reliable handoff.
- `Incident closure criteria` — Locally defined evidence and approvals required to close the coordinated response. Criteria may include recovery indicators, data validation, stakeholder update, and transfer of residual work.

## Lifecycle states

- `Incident lifecycle` — The organization’s model for detection, declaration, triage, mitigation, recovery, resolution, and learning. Different models use different phases; teams can loop back as evidence changes.
- `Detection phase` — Recognizing a suspected incident from telemetry, user reports, security tools, or other signals. Detection time, source, and gaps matter to later learning.
- `Triage phase` — Determining impact, urgency, scope, and immediate objectives with available evidence. Triage is iterative and should not wait for a complete causal theory.
- `Mitigation phase` — Taking action to reduce ongoing harm or exposure, sometimes temporarily. A mitigation is not necessarily a permanent fix or proof that cause is removed.
- `Recovery phase` — Restoring expected operation and validating service and data behavior. Recovery may require a watch period and reconciliation even after traffic resumes.
- `Resolution phase` — Meeting incident closure conditions and handing remaining work to normal ownership or follow-up. Resolution is more than an alert clearing.

# Cross-item comparison

| Role | Focus | Typical output |
| --- | --- | --- |
| Incident commander | Overall state, priority, coordination | Objectives, roles, escalation, closure decision |
| Technical lead | Diagnosis and technical options | Hypotheses, evidence, proposed change |
| Operations lead | Controlled system changes | Executed change and observed result |
| Communications lead | Consistent audience updates | Approved situation updates |
| Scribe | Shared durable record | Timeline, decisions, action status |

Mitigation reduces harm; recovery restores and verifies expected operation; resolution closes the response under explicit criteria. A single action can contribute to more than one phase, and a team may revisit earlier work.

# Examples

An alert shows a database connection failure, but user impact is not yet known. The on-call declares an incident because several services are affected and coordinated changes may be needed. The commander sets “restore read access without losing committed writes” as the immediate objective. The technical lead checks connection and replication evidence; operations controls a failover; communications tells stakeholders that reads are degraded and the team is investigating. The scribe records the failover decision and expected validation. The severity is assigned using local criteria, not an assumed industry-wide numeric level.

# Common mistakes

- Waiting to declare until root cause is certain.
- Treating a severity number or ICS role name as universal.
- Having every responder independently change production.
- Letting the commander investigate deeply and lose shared state.
- Recording only clock time without the time source or observation context.
- Handing off a channel link without explicit responsibility acceptance.
- Calling an incident resolved because one monitoring alert stopped firing.
- Posting a cause or recovery claim before it is confirmed.

# Knowledge checks with answers

1. Does an incident declaration require confirmed root cause? **No; it establishes coordinated response based on impact or credible risk.**
2. Who owns cross-team objectives and overall coordination? **The incident commander.**
3. Why can a scribe be valuable? **They preserve timeline, decisions, actions, and status while technical responders focus on work.**
4. Is severity level 1 always the highest industry-wide? **No; scales are organization-specific.**
5. What must a handoff include? **Current impact/state, objectives, actions, decisions, risks, and explicit acceptance by the incoming owner.**

# Sources

[Google SRE: managing incidents](https://sre.google/sre-book/managing-incidents/) · [SRE incident management guide](https://sre.google/resources/practices-and-processes/incident-management-guide/) · [SRE incident response](https://sre.google/workbook/incident-response/) · [NIST SP 800-61 Rev. 3](https://csrc.nist.gov/pubs/sp/800/61/r3/final)
