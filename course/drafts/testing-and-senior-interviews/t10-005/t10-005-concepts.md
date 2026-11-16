# debugging production incidents and root cause analysis — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to structure an incident response around user impact, coordinate parallel work, separate facts from hypotheses, choose safe tests, mitigate before a complete root-cause explanation, verify recovery, and write a blameless evidence-based review with owned follow-up actions.

# Prerequisites

You should understand service health indicators, deployments, logs/metrics/traces, dependencies, and the difference between mitigation and a permanent code fix. A hypothesis is an explanation that can be tested against evidence. A contributing factor is a condition that helped an incident occur or grow; it need not be the sole cause.

# Core concepts

## Declare from impact; refine with evidence

An incident is an unplanned service interruption or degradation requiring coordinated response. A page or error spike is a signal, not a full impact assessment. Establish affected users, geography, feature, severity, start time, and any workaround. Severity labels and thresholds belong to local policy; Google SRE role names are one pattern, not a universal standard.

Do not wait for perfect certainty before coordinating a plausible major impact. Declaring creates a shared place to investigate and communicate; it does not mean every initial assumption is final. Reassess impact and severity as the evidence changes.

Time measures need clear definitions. Detection delay, time to acknowledge, time to mitigate, and time to restore answer different questions. Their start/stop points must be consistent; an organization’s values cannot be compared responsibly if one team measures from alert creation and another from first customer impact.

## Separate coordination from diagnosis

Incident response has concurrent work: one person needs a clear overall picture, responders need to change/inspect the system, stakeholders need updates, and a record needs to be kept. Google’s model describes an incident commander, operations lead and communications lead. A scribe and planning role can be delegated as needed. These roles reduce conflicting production changes and repeated questions; an organization may combine roles for a small incident or use a different structure.

Maintain one current incident state: impact, known facts, active hypotheses, actions, decisions, owners, and next update. The incident channel is a communication surface, not the only durable record. A concise handoff should state current impact, what changed, what is being tried, remaining risks, and who owns each task.

## Stabilize before seeking a perfect explanation

In a major outage, first limit harm and preserve options. Mitigation may be a rollback, traffic shift, disabling a feature, load shedding, or graceful degradation. The right choice depends on the system and data risk. Prefer a reversible action when evidence is incomplete; protect data integrity and avoid an intervention whose blast radius is less understood than the failure.

Mitigation and permanent correction are different. A rollback may restore service while the defect remains. A permanent fix should be developed, reviewed, tested, and released through the normal safety process. The response still needs recovery verification after the mitigation.

## Use falsifiable hypotheses and safe experiments

Start with observations: what changed, what users see, when it started, and where it occurs. List a small set of plausible explanations. A good hypothesis predicts evidence that should be present if it is true and evidence that should be absent if it is false. Choose a test that separates competing explanations, starting with a low-risk, likely, informative check.

Tests have side effects and confounders. A connection check from a laptop may not test the same network path as the application. Increasing logging can worsen latency. Changing capacity can alter contention and hide a race. Record the test, its expected result, actual result, environment and any production change. Correlation with a deployment is evidence to investigate, not causal proof by itself. [Google SRE effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)

Use logs, traces, metrics and deployment/configuration markers together. A trace can connect spans across services; a metric can show population-level change; a log can explain one request. Each is subject to sampling, missing context and clock alignment. Avoid interpreting silence in one data source as evidence that a failure did not happen.

## Verify recovery from the user’s perspective

Recovery means the important service behavior is working again for affected users, not merely that a deployment command completed or an alert cleared. Check service indicators, representative customer workflows, error rate, latency, dependency state and data integrity. Continue a watch period when delayed queues, retries, caches or downstream effects may remain.

Metrics such as time to detect, acknowledge, mitigate and restore are useful for different operational questions, but they are not universal measures of engineering quality. Pair them with impact, recurrence and learning. Optimizing a time metric alone can encourage premature closure or superficial mitigation.

## Analyze contributing conditions, not people

A postmortem should reconstruct impact, timeline, actions, evidence, contributing conditions, mitigation, recovery and follow-up. “Root cause” can imply a single deepest cause where a complex system has interacting design, deployment, detection and response conditions. Explain the causal chain and the evidence supporting it. Ask why available defenses did not prevent, detect, contain or recover from the failure.

Blameless analysis assumes responders acted with the information, incentives and constraints available at the time. It does not mean avoiding accountability for system improvements. Hindsight bias makes a known failure seem obvious; local-rationality questions ask why each action made sense to the person then. [Google SRE postmortem culture](https://sre.google/sre-book/postmortem-culture/)

Actions need a specific outcome, owner, priority and due date. “Improve monitoring” is weak; “alert on sustained checkout error-budget burn and test the alert in a game day” is verifiable. An effectiveness check asks whether the action reduced likelihood/impact or improved detection/recovery. Recurring incidents indicate that actions may not have removed the mechanism or were not completed.

# Mechanisms and relationships

Use this interview-ready sequence:

1. **Frame:** Clarify affected users, service behavior, timeframe, severity policy, and current workaround.
2. **Coordinate:** Establish an incident lead, technical work owner, communications owner, and shared log as needed.
3. **Preserve:** Capture representative metrics/logs/traces/change markers before risky changes erase context.
4. **Hypothesize:** List plausible causes and what each predicts; separate observed facts from assumptions.
5. **Test safely:** Choose a low-risk discriminating check; record expected and actual result; change one variable where practical.
6. **Mitigate:** Reduce user harm with a reversible action when appropriate; protect data and communicate status.
7. **Verify:** Confirm recovery through user-facing indicators and critical workflows; watch for delayed effects.
8. **Learn:** Build an evidence-based timeline, identify contributing conditions, and assign prioritized actions with owners and effectiveness checks.

The sequence is a reasoning aid, not a rigid procedure. During active harm, mitigation can happen before every hypothesis is tested; evidence collection and communication continue in parallel. Escalate/adjust roles according to local policy.

# Worked examples

### Deployment correlation

Latency rises four minutes after a release. Record the timing and affected cohorts. Hypothesis: the release caused the regression. Compare the new/old version on the same dependency and load, check whether the affected code path is used, and inspect traces/logs for changed work. A safe partial rollback or traffic shift can both mitigate and provide evidence. If latency recovers, the release is strongly implicated, but further analysis may reveal an interaction with load or configuration.

### Competing dependency hypotheses

Checkout failures could result from an application error, database connection exhaustion, or a payment dependency timeout. Check where requests fail in traces and whether connection/timeout metrics align. Test from the same network identity/path as the application when safe. A ping from an engineer’s workstation may be a confounded test. Mitigate the failing dependency boundary if evidence supports it, and verify checkout behavior after recovery.

### Root cause versus contributing factor

“A developer deployed a bad change” describes an event, not a complete explanation. Ask what let the change reach production, why the behavior was not detected in pre-production, whether rollout/rollback controls were adequate, what alerted responders, and how much traffic was exposed. The resulting actions may improve tests, staged rollout, observability and recovery, each addressing a different contribution.

# Misconceptions and edge cases

- **“We need the root cause before acting.”** Mitigate user harm first when a safe action is available; preserve evidence for later causal analysis.
- **“The last deployment caused it.”** Temporal correlation is a useful hypothesis, not proof. Compare affected cohorts and predicted evidence.
- **“Blameless means nobody is accountable.”** It means analyze the system and conditions without indicting an individual; assign clear owners to system-improvement actions.
- **“There is one root cause.”** Complex incidents often have interacting triggers and contributing conditions; use a causal explanation supported by evidence.
- **“Alert cleared, so recovery is complete.”** Check user workflows, data integrity and delayed downstream effects.
- **“More logging always helps.”** Instrumentation can add load, expose sensitive data, or alter timing; use a safe, targeted approach.
- **“A rollback is the permanent fix.”** It may be a temporary mitigation; the failure mechanism can remain.
- **“Faster MTTR always means a better response.”** A fast but unsafe mitigation can corrupt data or create another outage; measure impact and quality as well.

# Knowledge checks with answers

1. **Should incident severity be universal?** No. Severity scales and declaration thresholds are organization-specific; state assumptions in an interview.
2. **What makes a hypothesis useful?** It predicts observable evidence that can be tested and distinguished from alternatives.
3. **Why preserve evidence before a mitigation?** Changes can erase logs/state or alter the conditions needed to understand the failure.
4. **What does blameless analysis examine?** The system, information, tools, incentives and constraints that shaped actions, then how to improve defenses.
5. **How do you verify recovery?** Confirm customer-facing indicators and critical workflows, plus data/dependency health and any delayed effects.

# Sources

- [Incident response workbook](https://sre.google/workbook/incident-response/)
- [Managing incidents](https://sre.google/sre-book/managing-incidents/)
- [Effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
- [Postmortem culture](https://sre.google/sre-book/postmortem-culture/)
- [Example postmortem](https://sre.google/sre-book/example-postmortem/)
