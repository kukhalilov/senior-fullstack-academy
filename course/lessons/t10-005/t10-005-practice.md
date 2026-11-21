# debugging production incidents and root cause analysis — Exercises and worked solutions

# Goals

Practice handling a production incident from first signal through recovery and learning. Focus on user impact, role clarity, falsifiable hypotheses, safe mitigation, recovery evidence, and action quality. Work through each prompt before reading its solution.

# Worked example

At 14:02 UTC, checkout success drops from 99.8% to 92% in one region. Latency rises, and database connection saturation also increases. A deployment marker appears at 13:58 UTC. The on-call engineer receives an error-budget burn alert. The payment service reports normal health.

Initial response:

1. Confirm the affected user flow, region, start estimate, duration and severity according to local policy. The deployment timing is evidence to investigate, not proof of cause.
2. Declare/coordinate the response and assign an overall incident lead, technical investigation owner, communicator and scribe as the event requires.
3. Preserve representative request traces, database metrics, logs, deployment/configuration details and decision timestamps.
4. List hypotheses: new code increased query volume; a database configuration change reduced connection capacity; a traffic shift concentrated requests in this region. State what evidence would support/refute each.
5. Choose low-risk checks that discriminate: compare old/new version cohorts, inspect query/connection patterns, and check regional traffic distribution. Avoid changing pool size and routing simultaneously.
6. If a staged rollback or traffic shift is safe, use it to reduce impact while recording its expected effect and rollback condition.
7. Verify checkout success/latency for affected users, database saturation and any delayed orders. Keep a recovery watch before closing.

After stabilization, build a timeline and describe the contributing conditions. Give each action an owner, due date, priority and effectiveness evidence. The postmortem may conclude that deployment introduced extra query work while weak regional capacity and alert delay increased the impact; cite evidence rather than presenting a guess as fact.

# Exercises

## Exercise 1: Facts, hypotheses, actions

Classify each sentence as observation, hypothesis, decision/action, or conclusion, then rewrite any unsupported claim:

1. “The error rate rose after release 42.”
2. “Release 42 caused the outage.”
3. “We disabled the new checkout flag for 20% of traffic.”
4. “The error rate fell after the flag change, so the new code is the only cause.”

## Exercise 2: Design a discriminating test

Checkout timeouts may come from database connection exhaustion or a payment-provider slowdown. Propose two safe observations/tests that distinguish the hypotheses. For each, give an expected result under both hypotheses and one confounder.

## Exercise 3: Choose mitigation

A bulk export feature is saturating CPU and causing login latency. Options are to add more application instances, disable export, or shed low-priority requests. Choose an initial action, explain its risk, state what you would verify, and identify the evidence needed before a permanent fix.

## Exercise 4: Build an incident handoff

The incident commander must leave after 40 minutes. Write the information the incoming commander needs and how the transfer becomes unambiguous. Include at least five fields.

## Exercise 5: Recovery is uncertain

After a rollback, error rate normalizes, but a queue backlog remains and some orders may have been processed twice. What checks are required before declaring full recovery? What should the status update say meanwhile?

## Exercise 6: Blameless postmortem rewrite

Rewrite this statement into an evidence-based, blameless account: “Alex forgot the rollback checklist, so the team wasted 30 minutes and customers lost orders.” State what additional evidence is needed and give two system-focused follow-up actions.

## Exercise 7: Action quality and recurrence

A previous postmortem’s action was “improve monitoring.” The same incident recurs. Explain how to evaluate the earlier action and propose a measurable replacement with one owner, priority basis, due date and effectiveness check.

# Progressive hints

1. Timing supports correlation, not exclusive causality. Separate what telemetry directly recorded from interpretation.
2. Choose checks where database and payment hypotheses predict different observations. Run them from the relevant application path and note test side effects.
3. First reduce the proven highest-risk work; adding instances might increase downstream load. Check user impact and saturation after action.
4. Handoff includes state, evidence, actions, owners, risks and decisions. The new commander must explicitly accept.
5. Service metrics can recover while data correctness and asynchronous work remain unhealthy.
6. Focus on workflow, available signals, rollout safeguards, and why the checklist did not prevent or quickly detect the issue.
7. Find the original signal/action evidence, who owned it, and whether the action was tested; replace vague language with an observable control.

# Complete solutions

## Exercise 1 solution

1. **Observation**, if the metric and release timestamps are accurate. Rewrite as: “The measured error rate rose after release 42 in the affected region; we have not established cause.”
2. **Hypothesis stated as fact.** Rewrite: “Release 42 is a leading hypothesis; compare affected versions and inspect the changed request path.”
3. **Action.** Add who made the change, when, expected effect, and rollback condition to the decision log.
4. **Unsupported conclusion.** The decrease is evidence that flag state may be related, but another concurrent change, traffic shift or delayed effect could explain it. Compare cohorts and isolate variables before claiming exclusivity.

## Exercise 2 solution

For database exhaustion, inspect database connection usage and query latency from the affected application instances; saturation and failing acquisitions support it, while normal DB capacity weakens it. For payment slowdown, inspect payment-call span latency/error distribution and provider response timing; elevated payment spans with healthy database timings support it. A confounder is that queueing in the application can inflate both downstream latencies; correlate request stages and compare unaffected cohorts. Avoid running probes from a workstation with a different network path/identity.

## Exercise 3 solution

If export is noncritical and the feature can be safely disabled, disable it or shed its requests first to protect login and reduce load. The risk is interrupting active exports or leaving partial files/jobs; communicate this and ensure retries do not restart all work. Verify login latency, CPU and user-facing outcomes, then check export backlog and data consistency. Before a permanent fix, determine why export work consumed excessive CPU, whether concurrency limits/cost guards are missing, and whether the triggering workload is expected or abusive. Adding instances might amplify shared downstream demand.

## Exercise 4 solution

The handoff should state: (1) current customer impact/scope/severity and estimated start; (2) mitigation taken and measured effect; (3) active hypotheses with evidence and tests; (4) pending tasks/owners and risks/rollback conditions; (5) links to shared timeline/decision record and relevant telemetry; (6) next update time and stakeholder state. The incoming commander summarizes the state, explicitly accepts command, and the channel/timeline record the transfer time and new owner.

## Exercise 5 solution

Check queue age/throughput and safe draining, identify possibly duplicated order effects, reconcile data with an idempotent process, and verify representative checkout/order workflows plus service indicators. Keep a recovery watch until delayed work and data integrity are understood. The update should state that rollback restored the primary error/latency indicators, order reconciliation/backlog checks are ongoing, the customer impact is still being assessed, and when the next update will be issued. Do not call data recovery complete yet.

## Exercise 6 solution

Possible rewrite: “The rollout progressed while the rollback decision/checklist state was unclear. The incident record shows a 30-minute delay between recognizing the impact and completing rollback; we are validating the order-loss estimate.” Additional evidence: timeline of checklist use, deployment/rollback permissions and warnings, signals available to responders, exact affected order records, and whether a safe automated rollback existed. Actions might include (1) add a pre-release/rollout guard that blocks promotion on the relevant error signal, with an owner and test; (2) make rollback criteria and procedure visible in the deployment interface and exercise it in a game day. Do not state that one individual caused customer loss without evidence about the system conditions.

## Exercise 7 solution

Review the original postmortem to determine whether a signal was specified, an alert was deployed, an owner was assigned, and the alert was exercised. “Improve monitoring” is not verifiable. A better action could be: “Service owner adds an alert for checkout error-budget burn at the agreed threshold and validates delivery to the primary on-call in a scheduled game day.” Assign one owner; prioritize by customer impact/recurrence; set a realistic due date; effectiveness evidence is a successful controlled signal and a review of false-positive/actionability after an observation window. If recurrence still occurs, inspect whether the alert detected the problem early enough and whether mitigation was available.

# Tests and edge cases

Before closing an incident or postmortem, ask:

- Are impact, start estimate, scope, severity and uncertainty explicit?
- Are facts separated from hypotheses and conclusions?
- Was evidence preserved before system changes?
- Did each test distinguish hypotheses and account for side effects/confounders?
- Was mitigation safe, owned, measured and reversible where practical?
- Were user workflows and data integrity checked after service indicators improved?
- Are delayed queues, retries, caches and downstream effects stable?
- Did the handoff/updates preserve a shared current state?
- Are causal claims supported and not reduced to hindsight or person blame?
- Does every action have an owner, priority, due date and effectiveness evidence?

# Reflection questions

1. In your system, which customer-impact signals can disagree with infrastructure health?
2. What is a safe, discriminating hypothesis test you could run during an outage?
3. Which changes could erase evidence before it is collected?
4. How would you verify data correctness after service availability returns?
5. Which past action item lacked an owner or effectiveness check?

# Sources

- [Google SRE effective troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
- [Incident response workbook](https://sre.google/workbook/incident-response/)
- [Managing incidents](https://sre.google/sre-book/managing-incidents/)
- [Postmortem culture](https://sre.google/sre-book/postmortem-culture/)
- [Postmortem practices workbook](https://sre.google/workbook/postmortem-culture/)
