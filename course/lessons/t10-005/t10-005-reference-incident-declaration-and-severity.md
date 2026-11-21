# debugging production incidents and root cause analysis — Reference: User impact, detection, escalation, severity, and incident state

# Scope and version

This reference explains the supplied terms for recognizing impact, declaring an incident, and communicating its state. Severity scales and role names are organization-specific; the Google SRE model is one example. Full operational policy and on-call design are in t09-012. Sources checked 2026-11-17. [Google SRE incident response](https://sre.google/workbook/incident-response/) [Managing incidents](https://sre.google/sre-book/managing-incidents/)

# How this group fits the mental model

Before debating a suspected cause, establish whether users are harmed, how broadly, and whether the issue needs coordinated response. An alert provides a signal; impact assessment and local severity policy determine the response. Shared language and timestamps allow responders to compare evidence without treating a local metric as a universal standard.

# Supplied names explained

- `Production incident` — An unplanned interruption or degradation affecting a live service and requiring coordinated action. The exact declaration threshold is defined by the organization; it is not restricted to a total outage.
- `Service degradation` — A reduction in service quality such as elevated latency, elevated errors, missing functionality, or reduced capacity. Some degradation can be severe even while the service remains partly available.
- `Customer impact` — The effect on users or customers, including who is affected, what task fails, duration, severity and workaround. Use observed impact where possible; infrastructure symptoms alone do not establish customer harm.
- `Incident declaration` — The explicit decision to activate a coordinated incident response. Early declaration can reduce confusion; the response can be scaled down if later evidence shows a smaller event.
- `Incident severity` — A local classification of urgency/impact used to choose response, escalation and communication. There is no universal numeric mapping across companies.
- `Severity rubric` — The organization’s written criteria for classifying incidents, often using user impact, scope, data integrity, duration and criticality. Define it before an incident and reassess as evidence changes.
- `Incident commander (IC)` — In this inventory’s lower-case expansion, the person coordinating overall response state, priorities, assignments and decisions. The role coordinates rather than personally diagnosing every technical issue.
- `Incident channel` — The shared communication space for responders and updates. It should be accessible to the right participants and backed by a durable incident record; message history alone may not clearly identify current state.
- `On-call engineer` — The engineer designated to respond to alerts for a service during a period. The responder may begin triage, then escalate or hand off as scope grows; do not assume one person can safely perform every response role.
- `Escalation policy` — The rules for requesting additional expertise or authority when impact, uncertainty, duration or response capacity warrants it. Escalate based on defined conditions rather than waiting until one responder is overwhelmed.
- `Alert acknowledgement` — A recorded indication that someone has seen and accepted responsibility for an alert. Acknowledging does not mean the issue is understood or resolved.
- `Alert fatigue` — Reduced attention caused by frequent, low-value or unactionable alerts. It degrades response and can delay detection of important signals; review alert quality and routes rather than asking responders to “pay more attention.”
- `Incident start time` — The chosen timestamp representing when user impact or incident conditions began. It may be estimated from telemetry and should record uncertainty rather than implying false precision.
- `Detection delay` — The elapsed time between the defined incident start and detection. Meaningful comparison requires a consistent start-time rule and reliable signals.
- `Time to acknowledge` — The time from alert/incident notification to a responder accepting it, according to the local metric definition. It measures one response transition, not time to mitigate.
- `Time to mitigate` — The duration until an action reduces the incident’s harmful effect. Define what “mitigated” means—for example, impact reduced below a threshold—and do not confuse it with permanent repair.
- `Time to restore` — The elapsed time until the service is verified to have returned to the required operating state. State whether this includes data reconciliation or a recovery watch.
- `Service Level Indicator (SLI) breach` — An observed service indicator outside its objective/threshold, such as a success or latency indicator. It can indicate user impact, but the observation window and affected population matter.
- `Error budget burn alert` — An alert that an SLI is consuming the allowed error budget at a rate indicating risk to the objective. It is an urgency signal; it does not by itself identify the cause.
- `Status page update` — A customer-facing or internal status communication about current impact and progress. Keep it factual, timestamped and consistent with verified scope; update it as impact changes.
- `Stakeholder notification` — A targeted update to people who need to make decisions or support response, such as service owners, support, leadership or partner teams. Tailor detail and cadence to the audience while preserving one shared source of current state.

# Cross-item comparison

**Incident start and response times:** `Incident start time` anchors duration measures. `Detection delay` measures time until noticed; `Time to acknowledge` measures ownership pickup; `Time to mitigate` measures harm reduction; `Time to restore` measures verified service recovery. They answer different questions and need consistent definitions.

**Impact and signal:** `Customer impact` describes user consequences; an SLI breach/error-budget alert describes a measured service signal. A signal can precede confirmed impact, and user reports can expose impact that telemetry missed.

**Acknowledgement vs resolution:** `Alert acknowledgement` establishes ownership of the notification; `Incident declaration` activates coordinated response; neither indicates mitigation or recovery. No within-group comparison applies to a single item.

# Examples

### Partial regional outage

An error-budget burn alert triggers for checkout in one region. The on-call engineer acknowledges it, checks whether the alert is real, identifies the affected region and customer journey, and declares an incident under the local rubric. The commander records estimated start time and assigns investigation. Status updates state what is known and when the next update will occur. Severity can be revised if scope expands or a workaround is found.

### Avoiding false precision

If telemetry shows checkout errors began at 10:04 but a customer report arrived at 10:07, record 10:04 as an estimated start time and note the evidence. Do not report “detection delay = three minutes” unless the alert was actually detected at 10:07 and the metric definitions support that calculation.

# Common mistakes

- Treating a status page update as a technical diagnosis.
- Mapping one company’s severity number to another organization’s scale.
- Treating an alert acknowledgment as resolution.
- Measuring incident duration from alert timestamp without defining start of impact.
- Declaring no customer impact simply because aggregate metrics look normal.
- Sending unverified root-cause claims to stakeholders.
- Leaving an alert without ownership because its severity is uncertain.
- Using an error-budget alert as a causal explanation.

# Knowledge checks with answers

1. **Does an SLI alert identify the cause?** No. It identifies a measured service risk/outcome; diagnosis requires further evidence.
2. **What does acknowledgment establish?** A responder accepted the alert; it does not prove the incident is understood or mitigated.
3. **Who defines severity levels?** The organization’s local rubric and policy.
4. **Why define incident start time carefully?** It anchors duration and response metrics; an estimated timestamp should not imply more certainty than the evidence supports.
5. **What should a status update contain?** Verified impact/current state, actions or workaround when safe to share, and a next update time/cadence.

# Sources

- [Google SRE incident response workbook](https://sre.google/workbook/incident-response/)
- [Managing incidents](https://sre.google/sre-book/managing-incidents/)
- [Effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
