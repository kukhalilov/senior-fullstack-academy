# architecture patterns multi-region tenancy and reliability — Reference: Predictive autoscaling

Sources: [HLD Handbook](https://hld.handbook.academy/), [AWS predictive scaling overview](https://docs.aws.amazon.com/autoscaling/ec2/userguide/predictive-scaling-policy-overview.html), [AWS predictive scaling how it works](https://docs.aws.amazon.com/autoscaling/application/userguide/aas-predictive-scaling-how-it-works.html), [AWS evaluate predictive scaling](https://docs.aws.amazon.com/autoscaling/ec2/userguide/predictive-scaling-graphs.html), [Google Cloud autoscaling concepts](https://cloud.google.com/compute/docs/autoscaler).

## Scope and version

Predictive autoscaling forecasts upcoming demand from historical or externally provided patterns and adds capacity before a reactive threshold is crossed. The AWS pages illustrate one product implementation; forecast windows, training requirements, resource support, scale-in behavior, and configuration differ by provider. Verify current product constraints before relying on a specific feature.

## How this group fits the mental model

Reactive autoscaling observes current demand, then starts a feedback loop. If capacity takes several minutes to provision and warm, a short spike may arrive before the new capacity can serve requests. Predictive scaling tries to move part of that work earlier by using a recurring schedule or a forecast. It is most useful when demand has learnable patterns and provisioning delay is material.

A forecast is a probability-informed estimate, not a guarantee. The practical design is usually a baseline capacity plus proactive capacity where the forecast is useful, with reactive scaling to absorb forecast error. Define what the signal means (requests, queue depth, CPU, or a workload-specific measure), ensure history reflects current behavior, and validate predictions in forecast-only/shadow mode before allowing capacity changes.

## Supplied names explained

- **Predictive autoscaling** — Capacity control that uses forecasts or known schedules to add resources ahead of expected demand. It can reduce cold-start and scale-out delay, but may overprovision when predictions are high or leave a deficit when patterns change.

### Design and validation workflow

1. **Measure the lag.** Estimate time from scaling decision through quota checks, provisioning, boot, deployment, cache warming, and readiness. Compare it with the time between demand increase and SLO breach.
2. **Select a useful signal.** Prefer a metric with a demonstrated relationship to capacity needs. CPU may be too late if it rises after the request backlog; request rate, queue age, or a business calendar may lead demand.
3. **Establish representative history.** Exclude or annotate incidents, one-off launches, outages, and major product changes. Forecasts trained on stale topology or a different service version can mislead.
4. **Inspect forecast errors.** Track under-forecast and over-forecast separately, by season and important event. A forecast-only mode allows comparison against actual demand without triggering a resource change.
5. **Set guardrails.** Cap cost, preserve minimum capacity, respect downstream concurrency, and combine proactive actions with reactive control. Choose the lead/buffer time empirically; too little misses the ramp, too much pays for idle resources.
6. **Define fallback.** If forecast data is missing, stale, or anomalous, reactive scaling and operational alerting should remain available. Treat a sudden new workload as a regime change requiring retraining or a schedule override.

Some managed implementations scale out proactively but leave scale-in to another policy; others expose different modes. Do not assume a single product’s exact forecast horizon or downscale behavior applies generally.

## Cross-item comparison

| Strategy | What it uses | Good fit | Failure mode to plan for |
|---|---|---|---|
| Reactive threshold | Current utilization or queue/request metric | Unpredictable demand where scaling lag is acceptable | Capacity arrives after the spike begins |
| Scheduled scaling | Known calendar or business schedule | Predictable daily/weekly or launch schedule | Schedule no longer matches real demand |
| Predictive forecast | Historical/learned patterns | Repeating demand with a material provisioning delay | Model error, stale history, novel event, overspend |
| Baseline plus reactive and predictive | Warm minimum, forecast lead, reactive correction | Important service where both response time and cost matter | More control loops and policies to observe and reconcile |

## Examples

**Daily reporting traffic.** A dashboard API sees a predictable weekday surge after 09:00, while database replicas need eight minutes to become useful. First run a forecast in observation mode and compare predicted versus actual request rate and queue age across multiple weeks. If errors are acceptable, raise capacity ahead of the usual ramp with a cost cap, then retain reactive scaling for a larger-than-usual spike. Alert if demand changes shape or if the forecast misses the SLO-relevant backlog threshold.

**One-time promotion.** A new marketing campaign has no representative historical pattern. A forecast trained on ordinary weekdays cannot infer this event reliably. Use a tested scheduled/manual capacity reservation for the launch, keep reactive scaling enabled, and monitor origin/dependency capacity. Afterward, classify this event separately rather than blindly teaching the model that every day has launch-level demand.

## Common mistakes

- Treating a forecast as a capacity guarantee or assuming machine learning can predict unprecedented events.
- Turning on forecast-driven scaling before checking the signal, training window, forecast error, and behavior under missing data.
- Scaling too early or too high and paying for idle capacity; scaling too late to beat provisioning time.
- Using a metric correlated with demand but not with useful capacity, such as CPU when the real limiter is database connections.
- Removing reactive scaling after adding predictive control, leaving no protection for forecast error.
- Scaling one tier without checking whether the database, third-party quota, caches, or network can support the additional load.
- Assuming all cloud products use the same forecast horizon and scale-in policy.

## Knowledge checks with answers

1. **When does predictive scaling add value over reactive scaling?** When demand patterns can be forecast with useful accuracy and capacity startup time is long enough that waiting for the reactive signal risks an SLO breach.
2. **Why start with forecast-only observation?** It reveals errors and drift before predictions create real cost or capacity actions.
3. **How should a system handle a novel campaign spike?** Use explicit launch planning or a schedule/capacity override plus reactive safeguards; ordinary historical forecasts may not cover it.
4. **What should remain after predictive scaling is enabled?** Cost and maximum-capacity guardrails, dependency protection, reactive correction where appropriate, forecast monitoring, and a fallback for stale/missing predictions.
