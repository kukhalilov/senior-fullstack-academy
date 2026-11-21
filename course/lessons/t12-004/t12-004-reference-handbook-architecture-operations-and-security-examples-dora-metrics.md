# architecture patterns multi-region tenancy and reliability — Reference: DORA metrics

Sources: [HLD Handbook](https://hld.handbook.academy/), [DORA software delivery performance metrics](https://dora.dev/guides/dora-metrics/), [History of DORA metrics](https://dora.dev/insights/dora-metrics-history/), [DORA 2025 report errata](https://dora.dev/research/2025/errata/), [DORA research](https://dora.dev/research/).

## Scope and version

DORA’s software delivery performance metrics are measures for understanding a delivery system and guiding improvement, not a universal scorecard for ranking individual developers. The current DORA guide describes five metrics; older materials often discuss four. Metric names and operational definitions have evolved, so use the current definition and make the measurement unit explicit. Benchmarks are context-sensitive and not targets that every service should copy.

## How this group fits the mental model

A software team needs to deliver useful changes while maintaining service stability. DORA’s current model groups three measures under **throughput** and two under **instability**. Together they help reveal how changes flow and how often delivery creates unplanned recovery or rework. They describe a delivery system around an application/service; they do not directly measure user value, architecture quality, developer well-being, or the causes of poor results.

Use metrics to ask “where is our system constrained?” Establish a service-specific baseline, inspect trends and distributions, and discuss results with the cross-functional team that builds and operates it. Then choose a bottleneck to improve and check that service outcomes, stability, and team experience remain healthy. DORA emphasizes that speed and stability need not be traded against each other, but a metric alone cannot prove a causal improvement.

## Supplied names explained

- **DORA metrics** — The current five software delivery performance metrics are:
  - **Change lead time:** elapsed time from a change being committed to version control until it is successfully deployed to production. State exactly which commit/change and production event are counted.
  - **Deployment frequency:** how often application changes are deployed, often expressed as deployments per time period or time between deployments. Define what counts as a production deployment for the service.
  - **Failed deployment recovery time:** time to recover from a deployment that fails and requires immediate intervention. This is narrower than general service MTTR; define failure detection and recovery endpoints consistently.
  - **Change fail rate:** ratio of deployments that require immediate intervention after deployment, such as rollback or hotfix, to total deployments under the chosen definition.
  - **Deployment rework rate:** ratio of unplanned deployments made because of an incident in production to total deployments under the chosen definition. It makes unplanned remedial work visible separately from deployment failures.

### Working with the metrics

1. Define the service boundary and the event taxonomy: merge/commit, successful production deployment, failed deployment, intervention, incident-driven unplanned deployment, and recovery. Document exclusions such as routine configuration or infrastructure changes.
2. Calculate by service or application before rolling up. Teams with different release constraints, risk profiles, or deployment units should not be compared without context.
3. Preserve numerator and denominator and show sample size. A single failure among two deployments and one among two hundred both produce a percentage, but imply very different certainty and operational reality.
4. Slice distributions and trend by the delivery path stage—review, build, test, approval, deployment, detection, and recovery—to locate a cause. A team-level average hides bottlenecks and outliers.
5. Pair the measures with service SLOs, customer outcomes, security/quality signals, and qualitative discussion. Faster deployment that produces no user value or creates safety issues is not an improvement.
6. Avoid incentives that reward gaming: artificially splitting deployments, redefining “failure,” delaying incident declarations, or minimizing remediation work can make the dashboard improve while the system worsens.

The older four-key model used change lead time, deployment frequency, change failure rate, and time to restore service. In the 2024 evolution, DORA’s current five-metric model separated failed deployment recovery time from broader recovery concepts and added deployment rework rate. Historical studies and dashboards using the old definitions are not directly comparable unless definitions are reconciled.

## Cross-item comparison

| Framework or signal | Main focus | Useful alongside DORA because… |
|---|---|---|
| DORA metrics | Delivery throughput and instability for an application/service | They indicate flow and operational effects of delivery |
| SPACE framework | Multidimensional developer productivity | It includes satisfaction, collaboration, and flow beyond delivery events |
| SLO/error budget | User-visible service reliability | A deployment metric does not show whether users receive a reliable service |
| Product outcome metric | User/business value | Deployment frequency does not establish value delivered |
| Flow/process metrics | Work in progress, queue time, review or test delay | They can help locate causes behind lead-time changes |

## Examples

**Baseline and improvement.** A team finds that change lead time has grown. Stage timestamps show code review queues dominate, while build and deployment remain short. The team tests a smaller pull-request policy and reviewer rotation, then watches lead time, change fail rate, deployment rework rate, user SLOs, and developer interruption/satisfaction. It does not set an individual quota for PR count.

**Interpretation.** Service A deploys many small changes and has low intervention rates; Service B releases monthly due to external certification. Comparing their raw deployment frequencies as a manager ranking ignores context. DORA can still help each service identify its own constraints and safe improvement path.

## Common mistakes

- Using outdated four-key terminology as if it were the current five-metric model.
- Treating these metrics as individual productivity measures or a universal rank for teams.
- Comparing percentages without sample size, service boundary, denominator, and operational context.
- Assuming deployment frequency alone means value, reliability, or quality improved.
- Treating change fail rate and deployment rework rate as identical; one captures deployments requiring immediate intervention, the other captures unplanned incident-driven deployments.
- Setting target numbers without a baseline or copying performance bands from old reports as universal goals.
- Encouraging teams to manipulate event definitions or optimize a metric at the expense of users and sustainable work.

## Knowledge checks with answers

1. **How many current DORA software delivery performance metrics are in the current guide?** Five: change lead time, deployment frequency, failed deployment recovery time, change fail rate, and deployment rework rate.
2. **Why retain denominator and sample size?** The same rate can represent different evidence and operational exposure depending on how many events were observed.
3. **What changed from the familiar four-key model?** The current model has five metrics, including a distinct deployment rework rate and a narrower failed-deployment recovery measure; historical definitions need reconciliation.
4. **Should deployment frequency be used to rank individual developers?** No. It is a service/delivery-system signal for improvement, not an individual productivity score.
