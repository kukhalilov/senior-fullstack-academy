# architecture patterns multi-region tenancy and reliability — Reference: Chaos Monkey

Sources: [HLD Handbook](https://hld.handbook.academy/), [Netflix Chaos Monkey](https://netflix.github.io/chaosmonkey/), [Principles of Chaos Engineering](https://principlesofchaos.org/), [AWS resilience testing tooling](https://docs.aws.amazon.com/wellarchitected/latest/framework/fnd04-bp08.html).

## Scope and version

Chaos Monkey is a Netflix tool that randomly terminates selected instances to test whether services tolerate instance failure. It is one narrow fault-injection tool, not a synonym for all chaos engineering and not a complete resilience-testing platform. Its deployability and integration requirements evolve; check the current project documentation before adopting it.

## How this group fits the mental model

Production systems fail in combinations that ordinary happy-path tests may not expose. Chaos engineering starts with a steady-state hypothesis—an observable property the service should preserve—then introduces a controlled disturbance and compares observed behavior with the hypothesis. A tool such as Chaos Monkey can test the “one instance disappears” failure mode. It cannot prove the system survives every failure, and randomly killing production capacity without guardrails is not a useful experiment.

The goal is to discover unknown weaknesses safely, then fix them. Begin in a representative non-production environment. If production testing is warranted, use an explicitly bounded blast radius, informed owners, reliable observability, stop conditions, and a tested rollback/mitigation action. Treat the experiment as a change to the system, with authorization and incident communication appropriate to its impact.

## Supplied names explained

- **Chaos Monkey** — A Netflix tool that randomly terminates instances in production so services must tolerate instance failure. It tests a specific failure assumption; it does not create resilience automatically or replace broader chaos experiments and incident exercises.

### An experiment protocol

1. State a falsifiable hypothesis, such as “removing one instance from this stateless pool will not push the checkout success SLI below its guardrail.”
2. Map dependencies and select a failure that is safe and relevant. Verify redundancy, capacity headroom, health checks, load balancing, and recovery before injection.
3. Decide scope and blast radius: service, region, tenant, or percentage of instances. Avoid critical write paths or safety-sensitive actions until the process is proven.
4. Establish baseline signals and the observation window. Include user outcome, saturation, error rate, queue age, recovery time, and any critical downstream impact.
5. Define immediate abort conditions and the person/tool that can stop the experiment. Make sure removing the fault is possible even if the control plane is degraded.
6. Inject the fault, observe, stop when guardrails are crossed, and restore normal conditions.
7. Record what happened, compare with the hypothesis, assign corrective work, and rerun the same experiment to verify the fix.

The experiment should test a failure the architecture claims to handle. If the system’s designed capacity has no slack for losing one node, the test can show a real capacity gap, not a defect in the injector. Conversely, if a single instance termination takes down a critical function, investigate health checks, connection draining, replicated state, retry behavior, and dependency limits.

## Cross-item comparison

| Practice | What it perturbs or rehearses | Primary learning |
|---|---|---|
| Chaos Monkey | Random instance termination | Whether the service tolerates a lost compute instance |
| Fault injection | A selected dependency, network, latency, resource, or region fault | Whether a specific technical failure path is controlled |
| Game day | A scenario plus people, runbooks, escalation and communications | Whether the response system works end to end |
| Load/stress test | Request volume or resource pressure | Where capacity and performance limits occur |
| Disaster recovery exercise | Recovery from a broad outage or data loss | Whether RTO/RPO and restoration processes are achievable |

These overlap but are not substitutes. A game day can include a fault injector; a chaos tool can be used in a game day; neither proves backup recoverability without a restore test.

## Examples

**Stateless API pool.** The service has six instances across zones. The team predicts that termination of one instance produces a temporary connection reset but no meaningful drop in successful requests because the load balancer health-checks and drains connections. They set a low-risk window, alert the on-call team, inject termination to one canary instance, monitor success rate and queueing, and stop automatically if the SLI crosses its guardrail. The finding is a slow readiness replacement due to image pull time, so the team adds warm capacity and repeats the test.

**Unsafe experiment.** A job processor has no idempotency and writes to a payment provider before recording completion. Randomly terminating workers can create ambiguous duplicate payments. Do not run an instance-kill experiment until the side-effect protocol and reconciliation are understood; first test with a sandbox or a non-financial workload.

## Common mistakes

- Calling a tool invocation “chaos engineering” without a hypothesis, steady-state signal, guardrail, and follow-up.
- Running random production termination without confirming redundancy, blast radius, ownership, and stop/rollback mechanics.
- Treating one successful instance-kill test as proof of region, database, or dependency resilience.
- Measuring only infrastructure health while user outcomes degrade.
- Ignoring the test’s effect on downstream services or other tenants sharing the capacity.
- Failing to close findings or rerun an experiment after remediation.
- Using instance termination to test a failure mode that actually depends on lost state or external side effects.

## Knowledge checks with answers

1. **What does Chaos Monkey primarily test?** Whether a service tolerates selected compute-instance termination, within the tool’s configured scope.
2. **What is the experiment’s hypothesis?** A measurable claim about user/system behavior under the injected fault, such as maintaining an SLI within a bound.
3. **Why is an abort condition needed?** It bounds impact and gives a clear trigger to stop injection and restore conditions when observed behavior is unsafe.
4. **Does passing one chaos experiment prove resilience?** No. It only supplies evidence for the tested scenario and environment; other faults and combinations require their own validation.
