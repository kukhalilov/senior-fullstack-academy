# debugging production incidents and root cause analysis — Interview questions and reasoning

# Core questions

1. What do you do when a production incident is declared?
2. How do you assess customer impact and severity when the signals disagree?
3. How do incident command roles help a technical response?
4. How do you separate facts from hypotheses under time pressure?
5. What makes a troubleshooting experiment useful and safe?
6. Would you roll back before identifying the root cause?
7. How do you distinguish a symptom, trigger, contributing factor and causal mechanism?
8. How do you verify that an incident is recovered?
9. What should a useful incident timeline and decision log contain?
10. How do you conduct a blameless postmortem without avoiding accountability?
11. How do you prioritize postmortem actions?
12. What would you do when the same incident recurs?
13. How do you communicate with customers when the cause is unknown?
14. How do you choose between mitigation options with incomplete evidence?

# Concise interview answers

1. Confirm impact/scope, coordinate owners and communication, preserve evidence, form testable hypotheses, mitigate safely, verify recovery, and follow up with learning/actions.
2. Use the customer-facing journey and affected population alongside SLIs, support reports and telemetry. State uncertainty and apply the organization’s severity rubric, refining it as evidence changes.
3. The commander maintains shared state and priorities, the operations lead coordinates technical changes, communications lead handles updates, and a scribe captures the timeline. Names/role combinations vary by organization.
4. Label observations and timestamps as facts, explanations as hypotheses, and actions as decisions. Record what would support or refute each hypothesis.
5. It should discriminate among plausible explanations, use the relevant environment/path, minimize user risk, and have an expected result and rollback/cleanup plan.
6. Yes, if a safe reversible mitigation can reduce harm; full causal certainty is not a prerequisite. Preserve evidence and verify rollback compatibility.
7. A symptom is the observed effect; a trigger initiates the sequence; contributing factors increase likelihood/impact; a causal mechanism explains how conditions produced the outcome.
8. Check user-facing indicators and critical workflows, data integrity, dependent services and delayed work. A successful deployment or cleared alert alone is insufficient.
9. Record impact/onset estimates, observations, tests, changes, decisions, owners and recovery checks with sources and uncertainty.
10. Reconstruct local context and system conditions without indicting individuals, then assign specific improvement actions to owners with priorities, due dates and effectiveness checks.
11. Rank by impact, recurrence likelihood, risk reduction, dependencies and effort. Ensure high-risk defenses have owners and measurable completion evidence.
12. Compare the new timeline/mechanism with prior incidents, inspect whether previous actions were completed/effective, identify missed systemic factors, and broaden review if needed.
13. State verified impact, current mitigation/status, what remains unknown, any safe workaround and the next update time. Do not speculate about root cause.
14. Compare expected impact reduction, reversibility, blast radius, data risk, evidence quality and ability to validate. Prefer a safe action that limits harm while preserving options.

# Deep follow-up answers

## “How do you avoid anchoring on the last deployment?”

Treat it as one hypothesis because timing is useful evidence. Compare affected/unaffected versions or regions, inspect whether the changed code path is involved, and check alternative explanations such as dependency behavior, traffic or configuration. Choose tests that can discriminate and avoid changing several variables at once. A rollback can be an appropriate mitigation; its success increases evidence but does not automatically prove the only cause.

## “What if you do not know the severity?”

Use the local rubric and the best evidence available: affected customer journeys, population, data integrity, duration and workarounds. If plausible impact could be significant, coordinate early, label uncertainty, and reassess rather than waiting for perfect telemetry. Severity names and numeric levels are not universal.

## “How do you balance mitigation and root-cause analysis?”

Keep users safe first while collecting enough evidence to preserve learning. A reversible traffic shift/feature disablement may reduce impact and help isolate a cohort. Some actions can erase state or change timing, so record evidence and the action’s expected effect. After recovery, run controlled tests for the deeper mechanism.

## “What makes a postmortem action good?”

It targets a supported contributing factor, states an observable result, has one accountable owner, a priority and due date, and includes a verification step. “Add monitoring” is not enough; specify the user-impact signal, threshold/route and an exercise proving it reaches an actionable responder.

## “How can a blameless review still be specific?”

State what each person/system did and what information was available, without evaluating character or intent. Then examine why the workflow allowed the action, what defenses were absent, and what action changes that condition. Specific facts support learning; blame labels suppress it.

# Scenario questions

## Scenario: “Latency doubled after a release. Roll back?”

First establish impact and affected cohort, preserve relevant telemetry, and check rollback safety (especially state/schema compatibility). If rollback is likely to reduce harm and can be done safely, use it as mitigation with an expected outcome and monitor it. In parallel, compare versions and investigate other plausible contributors. Verify user-facing recovery before closing.

## Scenario: “The dashboard is green, but customers still report failures.”

Do not dismiss the reports. Check whether indicators aggregate away a region/cohort, whether the user task is represented in telemetry, and whether failure occurs at a downstream/client boundary. Reproduce safely with a representative account/path, correlate a trace/log, update impact assessment and add the missing signal as a follow-up.

## Scenario: “A database failover restores traffic but duplicates orders.”

Availability has recovered but data integrity has not. Keep response/recovery work open, stop further duplication safely, reconcile affected records, verify idempotency and communicate impact. Later analyze failover consistency assumptions and recovery validation gaps; do not call the event recovered from latency alone.

## Scenario: “A postmortem says the on-call engineer made the wrong decision.”

Ask what the person knew at the time, what the runbook/interface/alerts conveyed, what constraints existed, and why the action was locally reasonable. Preserve the timeline, assess whether the action was within established policy, and focus follow-ups on better information, safeguards, practice or decision support. If misconduct is genuinely suspected, use the organization’s separate process rather than disguising it as reliability learning.

# Tradeoffs and alternatives

| Choice | Benefit | Risk/limit |
| --- | --- | --- |
| Declare early | Shared response and faster help | Can create unnecessary overhead if not scaled to actual impact |
| Roll back | Often fast/reversible way to reduce release exposure | Compatibility/data issues; may hide evidence or fail to address other causes |
| Traffic shift/failover | Reduce regional/cell impact | Destination capacity/state may differ; can spread load or create consistency risk |
| Add capacity | Relieve a proven saturation point | Can increase load on shared dependencies and mask inefficient demand |
| Disable feature/load shed | Protect critical journeys | Removes functionality and can create backlog/retry effects |
| Deep root-cause work during outage | May reveal the mechanism | Can delay mitigation and increase user harm |
| Blameless review | Encourages honest, system-level learning | Requires disciplined evidence and ownership; does not mean vague or consequence-free actions |

# Common weak answers

- “I would immediately roll back the last deploy.” It may be prudent, but first state impact, rollback safety and verification criteria.
- “The deployment caused the issue because it happened first.” Correlation is a hypothesis, not causal proof.
- “I would inspect logs until I find the bug.” Without impact framing, hypotheses and safe tests, this can delay mitigation.
- “We fixed the root cause.” Explain the evidence and contributing conditions; complex incidents may not have one cause.
- “The alert is green, so we’re done.” Verify user workflows, data and delayed effects.
- “Blameless means no one is accountable.” Assign clear owners to prevention/recovery actions while avoiding person blame.
- “We should add more alerts.” Specify the user-impact signal, actionability, owner/route and validation.
- “I’ll make the team work faster next time.” Improve tools, roles, information and safeguards rather than relying on heroics.

# Self-check rubric

Score each item from 0 to 2: 0 = missing/incorrect, 1 = partly explained, 2 = clear and evidence-based.

- Starts with user impact, scope and local severity assumptions.
- Establishes coordination and clear response ownership.
- Separates observations, hypotheses, actions and conclusions.
- Uses discriminating tests and recognizes side effects/confounders.
- Mitigates safely before complete causal certainty when needed.
- Preserves evidence and explains rollback/traffic/data risks.
- Verifies customer workflows, service indicators and data recovery.
- Describes causal/contributing conditions without hindsight blame.
- Assigns owned, prioritized actions with dates and effectiveness checks.
- Communicates verified facts, uncertainty, workaround and update timing.

**Interpretation:** 17–20 means the answer is senior-level and interview-ready; 12–16 means revisit mitigation/recovery or causal reasoning; below 12 means practice walking through a scenario in order.

# Sources

- [Google SRE incident response workbook](https://sre.google/workbook/incident-response/)
- [Managing incidents](https://sre.google/sre-book/managing-incidents/)
- [Effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
- [Postmortem culture](https://sre.google/sre-book/postmortem-culture/)
- [Postmortem practices workbook](https://sre.google/workbook/postmortem-culture/)
