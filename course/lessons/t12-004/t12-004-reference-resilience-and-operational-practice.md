# architecture patterns multi-region tenancy and reliability — Reference: Resilience experiments, scaling, and operational economics

Sources: [HLD Handbook](https://hld.handbook.academy/), [Principles of Chaos Engineering](https://principlesofchaos.org/), [Netflix Chaos Monkey](https://netflix.github.io/chaosmonkey/), [AWS game days](https://docs.aws.amazon.com/wellarchitected/latest/framework/rel_testing_resiliency_game_days_resiliency.html), [Google SRE: handling overload](https://sre.google/sre-book/handling-overload/), [Google SRE: cascading failures](https://sre.google/sre-book/addressing-cascading-failures/), [Kubernetes Horizontal Pod Autoscaler](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/), [AWS predictive scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/predictive-scaling-policy-overview.html), [AWS Spot interruption behavior](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-interruptions.html), [FinOps unit economics](https://www.finops.org/framework/capabilities/unit-economics/), [FinOps rate optimization](https://www.finops.org/framework/capabilities/rate-optimization/), [The Green Grid PUE](https://www.thegreengrid.org/node/372), [Google carbon-aware scheduling guidance](https://docs.cloud.google.com/architecture/framework/sustainability/optimize-resource-usage).

## Scope and version

This reference covers the ten supplied operational practices and economic measures. Autoscaling details vary by platform and metric; Spot capacity is an AWS example of interruptible spare capacity. Chaos experiments and game days should be authorized and controlled for the target environment. PUE is a data-center facility metric, not a per-application energy guarantee. Carbon and cost measurements depend on stated boundaries and useful-work definitions.

## How this group fits the mental model

Resilience is evidence that a workload remains within its user-visible objectives during known disruptions, not the number of replicas in a diagram. Chaos experiments and game days test assumptions; autoscaling adds capacity; graceful degradation and load shedding protect the remaining capacity; unit economics and sustainability measures show the cost and environmental side of those choices.

Begin with a hypothesis and safety limits. Measure the current service state, introduce one bounded fault or load condition, observe user and dependency behavior, and stop if the blast radius exceeds the agreed boundary. Automate scaling only after identifying the bottleneck and its dependency capacity. Use interruptible or carbon-shifted capacity only for work that can safely pause, retry, or move.

## Supplied names explained

- **Chaos engineering** — A disciplined practice of testing a falsifiable hypothesis about system behavior under a realistic failure or stress. Establish the steady state, define a measurable hypothesis, choose a controlled variable, limit blast radius, monitor, and learn. It is not random production breakage; experiments require authorization, abort conditions, and a safe environment appropriate to the risk.
- **Game day** — A planned exercise in which the people, processes, and technology used during an incident are practiced under a failure scenario. A game day may include injecting faults, using a simulated tabletop scenario, or exercising recovery in a replica. Measure detection, decision, mitigation, recovery, and communication—not only whether the software stayed up.
- **Autoscaling** — Automatically adjusts instance or replica count based on configured metrics such as CPU, request concurrency, queue depth, or service-specific signals. Reactive scaling has detection, scheduling, and warm-up delay. It cannot create database capacity, fix an overloaded downstream dependency, or safely handle a hot partition by itself. Set min/max bounds, scale-down stabilization, cooldowns, and saturation alerts.
- **Predictive scaling** — Forecasts future demand from historical patterns and can provision capacity before a predicted peak. It is useful for recurring patterns with enough representative data and startup lead time. Forecasts can miss novel events or changed traffic; retain reactive controls and capacity limits, inspect the forecast, and compare forecast error with actual load. In AWS EC2 Auto Scaling, the documented policy learns from metric history and begins in forecast-only mode before actively scaling.
- **Graceful degradation** — Preserves the most important service behavior while shedding optional quality or features during stress or dependency failure. Examples include serving a cached, explicitly stale result or disabling expensive recommendations while retaining checkout. Define which behavior may be degraded, for whom, and how clients communicate that state; do not silently weaken correctness or security invariants.
- **Load shedding** — Rejects, defers, or deprioritizes work when accepting more requests would cause a queue or system to collapse. Prefer explicit admission control, bounded queues, fair priorities, deadlines, and overload responses before resource exhaustion. Retrying shed work immediately can amplify the overload; use retry guidance, backoff, and client budgets.
- **FinOps** — A collaborative operating practice for understanding technology usage and cost and making timely, value-aware decisions. It includes allocation, forecasting, optimization, unit economics, and communication between engineering, finance, product, and procurement. It is not synonymous with cost cutting; spend can rise appropriately when delivered business value rises more.
- **Spot capacity** — Provider spare compute offered at a discount but reclaimable when the provider needs it. AWS EC2 Spot can send a two-minute interruption notice when available, but workloads must be designed for interruption and should not depend on the notice as a guarantee that all work can be saved. Use for stateless, checkpointed, queued, replicated, or otherwise restartable work; maintain enough reliable capacity for critical demand.
- **Power usage effectiveness (PUE)** — Ratio of a data center’s total facility energy to its IT equipment energy over a stated period and boundary. PUE indicates facility overhead relative to IT energy. It does not measure useful application output per energy, renewable mix, emissions, water, or the efficiency of a particular cloud workload.
- **Carbon-aware scheduling** — Places deferrable workloads in a time or region expected to have lower electricity carbon intensity, when policy and service constraints permit. It can reduce electricity-related emissions only if the data, grid signal, travel/transfer overhead, deadlines, and resulting capacity effects are considered. Interactive, latency-critical, jurisdiction-bound, or real-time workflows may not be eligible.

## Cross-item comparison

| Question | Mechanism | Guardrail |
|---|---|---|
| Do failover and recovery assumptions work? | Chaos experiment or game day | Hypothesis, authorization, observability, abort and rollback plan |
| Can capacity react to demand? | Reactive autoscaling | Upstream/downstream bottlenecks, warm-up lag, bounded queue and max capacity |
| Is a daily/weekly demand peak predictable? | Predictive scaling | Forecast-only evaluation and reactive fallback for forecast error |
| How does the service protect critical work under overload? | Graceful degradation and load shedding | Preserve security/correctness and avoid retry amplification |
| Can noncritical compute be cheaper? | Spot capacity | Interruption-safe workload and fallback/on-demand capacity |
| Is technology spend buying outcomes? | FinOps and unit economics | Consistent allocation plus quality and business value metrics |
| Is facility overhead efficient? | PUE | Use same boundary/time period; pair with workload energy and carbon metrics |
| Can flexible work lower grid emissions? | Carbon-aware scheduling | Respect latency, residency, reliability, and full system boundary |

## Examples

**Queue-backed image service:** the SLO requires interactive API responses under 300 ms, while thumbnail generation may take several seconds. Put thumbnail work in a durable queue; cap queue depth and worker concurrency; autoscale workers against queue age and downstream object-store capacity. If demand exceeds the safe ceiling, apply load shedding or return an accepted-job status rather than letting unlimited work accumulate. The worker uses Spot capacity only when it checkpoints or can restart idempotently; on-demand instances maintain the critical floor.

**Game day for a region dependency:** begin with a declared hypothesis that if the search provider becomes unavailable, product pages still load with stale search-independent details and checkout remains correct. In a representative environment, block the dependency, verify alerts and circuit-breaker behavior, observe queue growth, and practice recovery and customer communication. Abort if payment or tenant isolation invariants are threatened. Record gaps as owners and tracked work, then repeat after changes.

**Evaluate cost and carbon:** compare cost per successful transaction and energy or emissions estimates for the same workload and period. If a nightly report is not urgent, shift it into a lower-carbon window only after testing the report deadline, data transfer, and region policy. PUE may contextualize provider facility efficiency, but a lower PUE does not establish that the report uses less energy or emits less carbon.

## Common mistakes

- Calling an uncontrolled outage or random deletion a chaos experiment without a hypothesis, safeguards, or measurement.
- Treating a game day as a software-only test while ignoring incident command, access, communication, recovery steps, and staff decisions.
- Increasing replicas while the database, broker, or provider is the actual bottleneck.
- Scaling down too quickly after a short traffic dip or scaling up based on a noisy metric; tune stabilization and test flapping behavior.
- Trusting a predictive forecast without a forecast-only period, actual-load comparison, or reactive fallback.
- Returning degraded data without labeling staleness or preserving authorization and safety constraints.
- Dropping work without admission feedback, then causing a retry storm from clients and queues.
- Moving critical, stateful, or non-restartable work to Spot capacity just because its hourly rate is lower.
- Reporting lower cloud spend as better unit economics while successful output or user experience worsens.
- Using PUE as a proxy for cloud workload carbon, or shifting workloads to lower-carbon regions without checking data residency and latency.

## Knowledge checks with answers

1. **What makes an experiment chaos engineering rather than random failure injection?** It tests a stated, measurable hypothesis about a real system under controlled conditions, with a bounded blast radius and stop criteria.
2. **Why may autoscaling fail to protect a service?** Scaling takes time and can worsen the actual bottleneck if a shared dependency has no headroom. Bound queues and scale against a signal that represents demand and capacity.
3. **How do graceful degradation and load shedding differ?** Degradation reduces optional work or quality while serving a useful response; load shedding refuses or defers some demand to prevent collapse. They can be combined.
4. **When is Spot capacity a good fit?** For flexible, restartable or checkpointed work that tolerates interruption, with reliable capacity reserved for critical demand.
5. **What does PUE establish?** Facility energy relative to IT equipment energy within a specified data-center boundary; it does not establish per-request efficiency or carbon impact.
6. **What should FinOps unit economics report?** A consistent cost and usage measure tied to a meaningful workload or business unit, interpreted together with delivered value and service quality.
