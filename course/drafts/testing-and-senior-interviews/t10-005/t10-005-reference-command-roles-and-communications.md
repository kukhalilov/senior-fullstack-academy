# debugging production incidents and root cause analysis — Reference: Incident command, operations, communications, and shared working record

# Scope and version

This reference explains the supplied coordination and communication terms as a model for senior incident reasoning. Google’s incident command model is an example; roles are adapted to team size and policy. This lesson does not replace t09-012’s operational response and on-call coverage. [Google SRE managing incidents](https://sre.google/sre-book/managing-incidents/) [Incident response workbook](https://sre.google/workbook/incident-response/)

# How this group fits the mental model

An incident requires concurrent work and a consistent picture of what is happening. Role clarity allows responders to focus; a shared timeline and decision record prevent the team from repeating tests or making incompatible changes. Communication should be concise and reliable, not a substitute for diagnosis.

# Supplied names explained

- `Incident command system` — A structured approach to coordinating response through explicit roles and communication. Google SRE adapted concepts from incident-command practice; organizations should use the structure that fits their policy rather than assume a universal formal hierarchy.
- `Incident Commander (IC)` — The person who maintains overall incident state, sets priorities, delegates work and coordinates response. They should avoid becoming the default technical operator for every task.
- `Operations Lead (OL)` — The technical/operational lead responsible for directing system changes and mitigation work with responders. Google’s model gives operational changes one coordinated owner to reduce conflicting modifications.
- `Communications Lead (CL)` — The person responsible for regular updates to responders and stakeholders and for answering incoming status questions. Separating this role allows the operations lead to focus on system restoration.
- `Scribe` — The person recording timestamps, observations, hypotheses, decisions, actions and owners. A scribe makes the later timeline/postmortem more reliable than reconstructing everything from memory.
- `Role delegation` — Assigning discrete responsibilities to named people. Delegation should include the desired result and a reporting path; an unowned task can be assumed to be handled by someone else.
- `Incident handoff` — Transfer of current incident state and open responsibilities to another responder or shift. Include impact, timeline, changes made, evidence, active hypotheses, risks, pending actions and explicit acceptance.
- `Command transfer` — The explicit reassignment of the commander role. Announce who now owns command and obtain acknowledgment so responders do not receive conflicting direction.
- `Shared incident timeline` — A chronological record of key impact observations, alerts, decisions, changes, tests and recovery checks. Distinguish event time from the time it was reported and note estimates.
- `Decision log` — A record of significant decisions, the evidence and assumptions used, the decision owner, and intended rollback/review condition. It helps explain why an action was reasonable at the time.
- `Hypothesis log` — A list of candidate explanations with supporting/refuting evidence, tests performed, and current confidence. It prevents an early guess from becoming an unquestioned fact.
- `Situation report` — A concise snapshot of current impact, scope, severity, actions, risks, owners and next update. It is useful for responders/stakeholders who need a quick state without reading the full timeline.
- `Internal stakeholder update` — A factual update to internal teams or leaders who need to coordinate support or decisions. Separate confirmed facts from likely explanations and state what help or decision is needed.
- `Customer-facing update` — A clear update for affected customers, describing the user-visible issue and current status without unsupported technical claims or sensitive information.
- `Update cadence` — The planned frequency/time for recurring updates. A stated cadence reduces repeated status requests; revise it if impact changes or an update is delayed.
- `Single source of incident state` — The agreed authoritative current record/channel/document where responders find status and decisions. Chat can be the channel, but a pinned or structured summary helps prevent contradictory copies.
- `Responder coordination` — Synchronizing parallel diagnosis/mitigation work so responders share observations, avoid duplicate tests, and do not make incompatible production changes.
- `Incident channel access` — Ensuring relevant responders and stakeholders can access the communication surface, while restricting sensitive information where needed. If a responder cannot join the channel, provide an approved alternate path.
- `Incident close criteria` — Conditions for ending active response, such as impact mitigated, service recovery verified, data risks understood, owners assigned for remaining work and stakeholders updated. Local policy defines the exact threshold; “the deploy succeeded” alone is insufficient.

# Cross-item comparison

**Command roles:** The `Incident Commander (IC)` coordinates overall response; the `Operations Lead (OL)` directs technical operational work; the `Communications Lead (CL)` provides updates; the `Scribe` records state. One person may fill several roles in a small event, but the responsibilities should remain clear.

**Timeline vs decision/hypothesis log:** A shared incident timeline records what happened and when. A decision log explains why a major action was chosen. A hypothesis log tracks explanations and tests. They can be one document with separate sections; the distinction helps avoid presenting a theory as an observed fact.

**Situation report vs customer update:** The situation report may include internal risks, owner names and technical detail. Customer-facing updates focus on verified customer impact, workaround and next update. No within-group comparison applies to a single item.

# Examples

### A handoff during a long incident

The outgoing commander gives the incoming commander a concise situation report, points to the shared timeline and decision/hypothesis logs, summarizes current customer impact, and names ongoing technical tests and rollback conditions. The incoming commander repeats the open priorities and explicitly accepts command. The channel is updated so all responders know who is coordinating.

### A useful hypothesis entry

“Hypothesis: connection-pool exhaustion caused checkout timeouts. Evidence: pool saturation and timeouts increased together in the affected region. Test: compare a low-traffic region and inspect connection recovery after traffic shift. Risk: avoid increasing pool size before checking database capacity. Owner: database responder.” This makes reasoning falsifiable and action ownership visible.

# Common mistakes

- Making every responder change production independently.
- Naming a commander without giving them authority to prioritize or delegate.
- Assuming everyone read the full chat history.
- Recording decisions without assumptions, owner or rollback condition.
- Mixing hypotheses into customer updates as confirmed causes.
- Transferring command without explicit acceptance.
- Using a scribe only after the incident and reconstructing timestamps from memory.
- Closing response while customer impact or data integrity remains unverified.

# Knowledge checks with answers

1. **What is the IC’s primary function?** Maintain shared incident state and coordinate priorities/delegation.
2. **Why separate Operations Lead and Communications Lead?** To let technical restoration work and stakeholder communication proceed without distracting or conflicting with one another.
3. **What should a hypothesis log distinguish?** Candidate explanation, supporting/refuting evidence, test and current confidence.
4. **What makes a command transfer complete?** The new commander explicitly accepts and the transfer is communicated to responders.
5. **Is an incident closed when a deployment finishes?** Not necessarily; verify user-facing recovery, data risks, remaining actions and stakeholder updates.

# Sources

- [Google SRE managing incidents](https://sre.google/sre-book/managing-incidents/)
- [Google incident response workbook](https://sre.google/workbook/incident-response/)
- [Example incident state document](https://sre.google/sre-book/example-postmortem/)
