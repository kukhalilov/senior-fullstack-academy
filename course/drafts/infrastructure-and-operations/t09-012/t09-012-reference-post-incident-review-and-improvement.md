# incident response on-call and post-incident learning — Reference: Blameless review, causal analysis, action quality, and learning loops

# Scope and version

This lesson covers post-incident analysis and organizational learning using Google SRE’s current published book and workbook guidance, checked 2026-11-20. Blamelessness does not mean avoiding responsibility for improving systems; it means explaining behavior through context and system conditions rather than personal blame. [Google SRE postmortem culture](https://sre.google/sre-book/postmortem-culture/) [SRE Workbook postmortem culture](https://sre.google/workbook/postmortem-culture/)

# How this group fits the mental model

Restoring service ends immediate harm but does not automatically prevent recurrence. A post-incident review turns evidence into an explanation and prioritized actions. Its quality depends on a trustworthy timeline, broad contributing-factor analysis, psychological safety, and follow-through. The goal is a more resilient system, not a satisfying single-cause story.

# Supplied names explained

## Review process and causal language

- `Post-incident review` — A structured review of impact, response, contributing conditions, and improvements after an incident. Define triggers and expected timing in advance so reviews are consistent.
- `Postmortem` — A written incident record describing impact, timeline, response, causes or contributing factors, and follow-up actions. It should be reviewed, shared with the appropriate audience, and revisited for action completion.
- `Blameless postmortem` — A review that assumes participants acted with good intent and available information, then investigates conditions that shaped decisions. It avoids shaming while still identifying system changes and accountable owners.
- `Incident retrospective` — A facilitated reflection on how the incident and response unfolded. It can capture team process and emotional load alongside the technical record.
- `Incident review facilitator` — A person who guides the review, invites multiple perspectives, maintains a constructive environment, and ensures conclusions and actions are explicit. The facilitator need not be the incident commander or author of the fix.
- `Incident timeline reconstruction` — Rebuilding events and decisions from telemetry, deployment records, communications, and participant accounts. Preserve source and confidence; do not confuse event occurrence with when the team learned of it.
- `Contributing factor` — A condition that combined with other conditions to enable impact or complicate response. Multiple factors often matter; treating one as the whole cause hides defenses and context.
- `Triggering event` — The event that immediately preceded or initiated an incident sequence. It may explain when the failure began, but rarely explains why the system allowed impact.
- `Latent condition` — A pre-existing property of the system or organization that remained hidden until combined with a trigger. Examples include unsafe defaults, missing tests, unclear ownership, or weak detection.
- `Defense in depth` — Multiple independent controls that reduce likelihood or impact when one control fails. The review should identify which layers worked, failed, or were absent.
- `Root cause limitation` — Recognition that a single “root cause” statement can oversimplify interacting conditions in complex systems. Use it as a useful summary only when it does not erase important causal pathways.
- `Causal graph` — A representation of events and conditions with causal relationships. It can show parallel contributing paths and missing defenses more clearly than a single linear narrative.
- `Five whys` — An iterative questioning technique that asks why a condition occurred to surface deeper system factors. It is a prompt, not a proof method; stop before unsupported speculation or person-blaming.
- `Fault tree analysis` — A structured method that decomposes how combinations of failures can lead to an undesired event. It is useful for prospective risk analysis and can organize incident evidence, but depends on a sufficiently scoped system model.
- `Change analysis` — Examination of recent changes and their relationship to incident behavior. Temporal correlation is a lead, not proof; include configuration, dependencies, data, and operational changes.
- `Impact analysis` — Estimation of affected users, transactions, duration, data, and business consequences. Include uncertainty and update as records are reconciled.
- `Detection gap` — A delay or failure in recognizing the incident when it was detectable. Analyze signal coverage, thresholds, routing, data freshness, and human interpretation.
- `Mitigation gap` — A delay or difficulty in limiting harm after detection. Consider authority, tooling, runbook quality, safe rollback, and coordination.
- `Recovery gap` — A weakness or delay in restoring and validating normal service/data. Examine backups, failover, reconciliation, capacity, and recovery rehearsal.
- `What went well` — A prompt to preserve effective controls, decisions, and teamwork. Keep specific evidence so successful practices can be repeated.
- `What made response harder` — A prompt to identify friction such as missing access, noisy alerts, unclear ownership, stale documentation, or unavailable dependencies.

## Follow-up actions and learning

- `Action item` — A defined piece of work arising from review, with an outcome that can be verified. Avoid vague tasks such as “be careful” or “improve monitoring.”
- `Corrective action` — Work that repairs an identified defect or condition. It may reduce the direct failure mechanism but should be evaluated for new risks.
- `Preventive action` — Work intended to reduce the likelihood or impact of a future event, often through safer design, detection, or recovery capability. No action can guarantee that all incidents are prevented.
- `Action item owner` — The person accountable for driving an action to completion. Contributors can differ, but one owner keeps status from becoming ambiguous.
- `Action item due date` — A target date used to prioritize and review completion. It should reflect risk, dependencies, and capacity rather than serve as decorative metadata.
- `Action item verification` — Evidence that the action works as intended, such as a test, alert exercise, restore rehearsal, or production measure. Closing a ticket without evidence is weak verification.
- `Risk-ranked follow-up` — Prioritizing actions by expected risk reduction, urgency, and effort. Consider likelihood, impact, exploitability, recurrence, and dependencies rather than choosing only the easiest task.
- `Repeat incident` — A later incident with similar contributing conditions or failure mode. Recurrence signals that earlier actions may be incomplete, ineffective, or deprioritized.
- `Incident trend analysis` — Aggregating incidents to detect recurring services, triggers, impact patterns, or response gaps. Normalize by service usage and capture near misses to avoid misleading raw counts.
- `Near miss` — A failure or hazardous condition that did not produce full expected harm due to chance or a defense. Review it when it exposes a meaningful weakness, not only after damage occurs.
- `Learning review` — A facilitated effort to understand what happened and improve the system. It can include successful adaptations and unexpected consequences, not just failures.
- `Psychological safety` — A team climate where people can raise uncertainty and mistakes without humiliation or retaliation. It enables evidence sharing; it does not eliminate professional expectations or action ownership.
- `Game day follow-up` — Actions and observations captured after a readiness exercise. Assign owners and verification so rehearsals change readiness rather than end as entertainment.
- `Operational review` — A recurring review of service reliability, incidents, toil, readiness, and follow-up progress. It connects incident learning to ongoing priorities.
- `Postmortem sharing` — Distributing incident learning to appropriate teams while protecting private, security-sensitive, or legally restricted details. Sharing enables systemic fixes beyond the original service.
- `Error budget policy` — A pre-agreed response to SLO budget consumption, such as reducing risk from releases or investing in reliability. It connects incidents to service priorities without turning the budget into a punishment metric.
- `Reliability investment decision` — A choice to allocate time or resources to controls, capacity, tests, or architecture based on risk and user impact. Include evidence and tradeoffs so the choice can be revisited.
- `Incident recurrence control` — A change or control intended to detect, prevent, contain, or recover from a recurring incident pattern. Validate that it addresses contributing conditions, not only the symptom.

# Cross-item comparison

| Term | Question answered | Typical mistake |
| --- | --- | --- |
| Triggering event | What immediately preceded the incident? | Calling it the complete explanation |
| Contributing factor | What condition helped cause or worsen impact? | Looking for a single culprit |
| Latent condition | What weakness existed before the trigger? | Ignoring organizational/system context |
| Corrective action | What condition will be repaired? | Choosing only a local patch |
| Preventive action | What will reduce future likelihood or impact? | Claiming prevention guarantees no recurrence |

Blameless review and fault assignment are different approaches. Learning focuses on how the system shaped choices and what controls to improve. It can still establish ownership, security accountability, and required personnel processes through separate, fair channels. [Postmortem culture](https://sre.google/sre-book/postmortem-culture/)

# Examples

A service incident begins after an unreviewed configuration change causes a worker pool to stop processing. “The change caused the outage” is a triggering explanation but not enough. The review also finds no alert on oldest-queue age, a dashboard that showed only worker process health, a runbook that required unavailable production access, and no canary for configuration. Actions include a queue-age alert with a tested page route, staged config validation, an access rehearsal, and an owner/date for each. Verification demonstrates the queue alert fires in a test and the runbook works for the secondary on-call.

# Common mistakes

- Writing “human error” as the final cause without asking what information, interface, policy, training, and defenses shaped action.
- Treating Five Whys as a way to force every incident into one linear chain.
- Listing actions with no owners, due dates, prioritization, or verification.
- Rewarding postmortem publication while ignoring action completion.
- Sharing an incident report with sensitive customer identifiers or forensic data unnecessarily.
- Measuring recurrence as a raw number without considering service volume or detection improvements.
- Calling a review blameless while using it to publicly shame an individual.
- Calling a near miss irrelevant because no customer noticed.

# Knowledge checks with answers

1. What is a triggering event? **The immediate event that starts the incident sequence; it is not necessarily the deeper explanation.**
2. Why identify latent conditions? **They explain why the system allowed a trigger to cause harm or made response harder.**
3. What makes an action item reviewable? **Specific outcome, owner, due date, risk priority, and evidence-based verification.**
4. Does blamelessness eliminate accountability? **No; it avoids shaming and improves system learning while retaining clear ownership for improvements.**
5. What should be done with repeat incidents? **Revisit prior actions, incentives, technical/systemic conditions, and whether the controls actually reduced risk.**

# Sources

[Google SRE postmortem culture](https://sre.google/sre-book/postmortem-culture/) · [SRE Workbook postmortems](https://sre.google/workbook/postmortem-culture/) · [Incident investigation](https://sre.google/workbook/incident-investigation/)
