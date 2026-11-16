# debugging production incidents and root cause analysis — Reference: Blameless review, contributing factors, corrective actions, and recurrence prevention

# Scope and version

This reference explains the supplied post-incident learning terms. Google SRE’s postmortem guidance treats reviews as learning opportunities and emphasizes contributing causes and actionable follow-up. Incident review format and trigger thresholds are organization-specific. Sources checked 2026-11-17. [Google SRE postmortem culture](https://sre.google/sre-book/postmortem-culture/) [Postmortem workbook](https://sre.google/workbook/postmortem-culture/)

# How this group fits the mental model

An incident review is a durable learning loop. It reconstructs what users experienced, what responders knew and did at the time, how defenses performed, and which changes will reduce recurrence or impact. A review that ends with a single-person explanation or an unowned action list does not improve the system.

# Supplied names explained

- `Incident postmortem` — A written record of incident impact, timeline, actions, contributing causes, recovery and follow-up. It allows future responders and engineers to learn without relying on memory or oral retelling.
- `Blameless postmortem` — A postmortem focused on system conditions and decisions made with the information available at the time, without indicting a person or team. Blamelessness supports honest reporting; it does not remove responsibility to improve systems and processes.
- `Incident timeline` — The chronological reconstruction of detection, impact, observations, decisions, changes and recovery. Record sources and uncertainty; distinguish when an event happened from when responders learned of it.
- `Impact statement` — A concise account of who or what was affected, what users experienced, duration/scope, and relevant data or business consequences. Avoid unsupported precision and internal jargon.
- `Contributing factor` — A condition that helped trigger, amplify, prolong or hide the incident. Multiple factors can interact; none needs to be the sole cause to warrant improvement.
- `Root-cause analysis` — A structured investigation of mechanisms and conditions associated with an incident. Treat “root cause” as an explanatory model, not a guarantee that one deepest cause exists; support causal claims with evidence and include interacting factors.
- `Systems thinking` — Analyzing how components, processes, incentives, information flow, tools and operational constraints interact. It looks beyond the final human action to understand why that action seemed reasonable and what system defenses were missing.
- `Hindsight bias` — The tendency to see an outcome as predictable after it is known. Reviewers should reconstruct what responders knew at each decision point rather than judge past choices using information discovered later.
- `Local rationality` — Understanding why an action made sense to the person at the time, given available information, goals, tools, and constraints. It is a method for learning, not a claim that every action was correct.
- `Detection gap` — A weakness that delayed or prevented recognizing impact, such as missing signals, noisy alerts, blind spots or unclear ownership. The action should improve meaningful detection, not merely add more alerts.
- `Response gap` — A condition that delayed coordinated action or decision-making, such as unclear roles, missing access, incomplete handoff or ambiguous runbooks. Distinguish process gaps from individual blame.
- `Mitigation gap` — A weakness that prevented or delayed reducing user harm, such as no safe rollback, missing traffic controls or unsafe state compatibility. Mitigation work should be reviewed for side effects and reversibility.
- `Recovery gap` — A weakness in confirming complete service restoration, handling queued/delayed work, or detecting residual data effects. A successful deploy or cleared alert may leave recovery incomplete.
- `What went well` — A review section for actions/controls that reduced impact or improved response, such as quick detection, effective handoff or reliable rollback. Preserve these strengths as system capabilities rather than crediting only individual heroics.
- `What went poorly` — A section for response or system conditions that made impact worse or work harder. Phrase observations in terms of behavior and conditions so they can lead to useful changes.
- `Where we got lucky` — A prompt to identify favorable conditions that limited harm but were not reliable defenses, such as low traffic during an unsafe change. Convert luck into explicit protection where the risk warrants it.
- `Preventive action` — Work intended to reduce the likelihood of recurrence, such as eliminating an unsafe condition or adding a guardrail. It should target a contributing mechanism and have a verifiable outcome.
- `Corrective action` — Work that fixes the current defect or restores an intended system condition. It may be immediate/technical but should be distinguished from broader prevention and detection improvements.
- `Action owner` — A named accountable person for coordinating an action to completion. One owner can work with collaborators; an unowned action is easy to lose.
- `Action due date` — A target date for action completion or reassessment. Priorities and due dates should reflect risk and capacity; dates without follow-up do not ensure completion.
- `Action priority` — Relative urgency based on likelihood, impact, recurrence and cost of delay. Prioritize actions that reduce significant user risk, and avoid labeling every action as highest priority.
- `Effectiveness check` — Evidence that a completed action changed the relevant risk or response capability, such as a test, alert exercise, game day or measured outcome. “Code merged” may be insufficient if the intended control was not verified.
- `Recurring incident` — An incident with the same or related failure mechanism recurring after prior occurrence. Review previous actions and their effectiveness; recurrence may indicate the fix was incomplete, not implemented, or did not address the mechanism.
- `Postmortem publication` — Sharing the review with the audience that can benefit, under privacy/security and organizational access rules. Remove sensitive customer data and avoid unnecessarily restricting learning.
- `Postmortem review` — A structured review of the written analysis and actions for accuracy, causal reasoning, blameless language and completeness. Review should improve quality, not become a search for a culprit.
- `Learning review` — A discussion focused on how the system behaved, what participants learned, and what changes are worthwhile. It can complement the written postmortem and surface context not captured in a document.

# Cross-item comparison

**Trigger, contributor, cause:** A triggering event may start the sequence; contributing factors make the event more likely or increase impact; a causal analysis links these conditions to observed outcomes. Avoid claiming one “root” cause when evidence shows interacting factors.

**Corrective vs preventive action:** A corrective action resolves a present defect or condition. A preventive action reduces likelihood/impact of recurrence. Detection/recovery improvements may address the same incident through different defensive layers.

**Timeline vs impact statement:** The impact statement summarizes user consequences; the timeline shows how events and decisions unfolded. Both should distinguish known facts from estimates. No within-group comparison applies to a single item.

# Examples

### Blameless causal account

Weak: “The engineer forgot to check the config.” Stronger: “The deployment workflow allowed a region-specific configuration to bypass validation, and the rollout signal did not expose the resulting error increase. The engineer used the available workflow and saw no warning before promotion.” The second account identifies system defenses to improve without hiding the relevant action.

### Turn “where we got lucky” into a control

Responders rolled back before a large customer batch arrived. If a larger batch could have caused irreversible duplicate processing, consider idempotency protection, staged rollout, or a pre-deployment load/data check. The exact preventive action should match the mechanism and be verified.

### Effectiveness of a completed action

An action “add an alert” is not complete merely because the rule is deployed. Exercise it with a controlled signal, verify the right responder receives an actionable page, and ensure the alert is not triggered by harmless noise. Record that test as completion evidence.

# Common mistakes

- Treating “blameless” as removing specific actions and facts from the timeline.
- Assigning one root cause where several mechanisms contributed.
- Judging responders using information learned after the incident.
- Writing “add monitoring” without specifying the signal, owner or validation.
- Closing actions when a pull request merges without testing the intended effect.
- Publishing customer-identifying data or sensitive credentials in a broad review.
- Repeating an incident without examining previous action completion/effectiveness.
- Capturing only what went poorly and losing the controls that worked.
- Treating a lucky outcome as evidence that the system is safe.

# Knowledge checks with answers

1. **What makes a postmortem blameless?** It examines system conditions and local reasoning without indicting people, while still recording actions and assigning improvement owners.
2. **Why include “Where we got lucky”?** It reveals absent defenses whose failure did not yet cause full impact but could next time.
3. **How do you know a follow-up action is effective?** Define and collect evidence that it reduced risk or improved detection/response/recovery.
4. **What is hindsight bias?** Judging a past decision as obvious after learning the eventual outcome.
5. **What should a recurring incident trigger?** Review whether prior actions were completed and effective and whether the causal mechanism was addressed.

# Sources

- [Google SRE postmortem culture](https://sre.google/sre-book/postmortem-culture/)
- [Postmortem practices workbook](https://sre.google/workbook/postmortem-culture/)
- [Example postmortem](https://sre.google/sre-book/example-postmortem/)
- [Google SRE incident response workbook](https://sre.google/workbook/incident-response/)
