# architecture patterns multi-region tenancy and reliability — Reference: Fault injection game day

Sources: [HLD Handbook](https://hld.handbook.academy/), [AWS Well-Architected game days](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html), [AWS resilience testing tooling](https://docs.aws.amazon.com/wellarchitected/latest/framework/fnd04-bp08.html), [AWS Fault Injection Service](https://docs.aws.amazon.com/fis/latest/userguide/what-is.html), [Principles of Chaos Engineering](https://principlesofchaos.org/).

## Scope and version

A fault-injection game day combines a planned technical disturbance with an operational rehearsal. The injector might delay or fail a dependency, terminate capacity, or simulate a region impairment; the game day also tests detection, decisions, communication, recovery, and learning. Vendor products used to inject faults are optional and have provider-specific constraints.

## How this group fits the mental model

Backups, replicas, alerts, and runbooks describe intended resilience. An exercise checks whether the whole socio-technical system behaves as intended when a failure occurs. The team should know what success looks like before injecting the fault: a user-facing SLI, a recovery objective, or an invariant that must hold. A successful exercise is not “nothing happened”; it is evidence that detection, degradation, and recovery matched an explicit expectation.

Start with a non-production environment and low-risk scenarios. Advance to production only when impact is bounded, the tested path is understood, observability is adequate, and rollback/stop controls are available. Inform affected stakeholders, assign an exercise lead and observer, and make the distinction between a planned simulation and a real incident clear to responders.

## Supplied names explained

- **Fault injection game day** — A scheduled, controlled exercise that introduces a chosen fault and evaluates technical behavior and human response, then tracks findings to verified remediation.

### Build the exercise

- **Scope and hypothesis:** identify the critical journey, dependency graph, targeted failure, expected impact, and measurable pass/abort thresholds.
- **Safety:** constrain environment, region, tenant, request share, time window, and blast radius. Check change approvals and third-party/provider rules. Ensure no destructive data operation is involved unless it is a dedicated, recoverable test.
- **Roles:** name a facilitator, system operator, observer/timekeeper, incident commander or escalation owner, and decision-maker who can stop. Notify responders and business stakeholders who may interpret alerts.
- **Telemetry:** capture the user outcome and system mechanism—SLIs, latency distributions, errors, saturation, queue age, dependency health, traces/logs, and recovery time. Verify dashboards and alerts before the test.
- **Stop and rollback:** define a hard stop condition such as sustained SLO violation, unexpected data corruption, uncontrolled cross-tenant impact, or loss of control-plane access. Test the rollback mechanism beforehand.
- **Execution and debrief:** establish baseline, inject one fault at a time initially, follow the runbook, restore, and compare observations with the hypothesis. Record missed alerts, confusing ownership, unsafe commands, and recovery gaps; assign an owner and due date to each action.
- **Re-test:** close the loop by rerunning the scenario after changes. Track remediation completion and time-to-close as program measures, not only the number of game days.

## Cross-item comparison

| Activity | Main target | Typical example |
|---|---|---|
| Fault injection | Technical component behavior | Add latency or terminate one replica |
| Game day | System plus people/processes | On-call team detects, communicates, mitigates, and restores a dependency outage |
| Chaos engineering program | Ongoing hypothesis-driven resilience learning | Repeated experiments across defined failure classes and environments |
| DR exercise | Recovery objectives and data restoration | Fail over and restore within tested RTO/RPO |
| Tabletop | Decisions and communication without live disruption | Simulate a major incident using scenario cards and runbooks |

## Examples

**Queue-provider outage.** The hypothesis is that checkout still accepts orders for a bounded interval while the queue is unavailable, then drains the backlog without losing orders or overloading the database. In a test environment, the team blocks queue access, confirms alert routing, observes outbox growth and user responses, restores connectivity, then measures backlog drain and duplicate handling. If queue age or database saturation crosses the stop threshold, the exercise stops. The debrief identifies a missing alert on outbox age; the fix adds an SLI and reruns the same test.

**Production regional exercise.** A mature team scopes a controlled failover for a low-risk workload with a documented rollback. It informs stakeholders, verifies data replication lag and dependency readiness, begins with a small traffic shift, and has a decision point before expanding. The team tests not just DNS routing, but write ownership, duplicate request handling, operator access, and failback. If records could diverge, the exercise must have a reconciliation strategy before production traffic moves.

## Common mistakes

- Injecting a fault before defining what safe service behavior means or how to observe it.
- Starting with a broad production outage rather than a bounded scenario in a representative test environment.
- Leaving affected responders unaware, which makes planned alerts look like a real uncontrolled incident.
- Omitting a stop condition, rollback owner, or authority to terminate the exercise.
- Testing failover but skipping data consistency, failback, identity, secrets, and operator access.
- Debriefing without named remediation owners, due dates, and a re-test.
- Treating “no user impact” as proof of correctness when telemetry could be missing or the scenario did not exercise the actual dependency.

## Knowledge checks with answers

1. **What is the difference between fault injection and a game day?** Injection perturbs a technical component; a game day uses a scenario to exercise the technical system and the people/processes that detect and respond.
2. **What must be prepared before a live fault?** A hypothesis, bounded scope, baseline telemetry, informed roles, hard stop conditions, rollback, and recovery path.
3. **How can a game day measure learning?** Track findings to owners, fixes, closure time, and successful re-tests; do not count only the number of exercises.
4. **Why test failback as well as failover?** The primary region may still have divergent state or dependencies; returning traffic safely can be a distinct and riskier operation.
