# system design requirements estimation capacity and tradeoffs — Reference: Comparing architecture choices and managing uncertainty

Sources: [Azure Well-Architected Framework](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), [Well-Architected pillars](https://learn.microsoft.com/en-us/azure/well-architected/pillars), and [Google SRE: Service Level Objectives](https://sre.google/sre-book/service-level-objectives/).

## Scope and version

This lesson turns architecture tradeoffs into reviewable decisions with explicit assumptions and revision criteria.

## How this group fits the mental model

No architecture maximizes every quality simultaneously. Make the consequence visible, identify uncertain inputs, and define what evidence changes the decision.

## Supplied names explained

### Architecture tradeoff

A decision that improves one property or constraint at a cost to another. State the chosen benefit, accepted downside, and context.

### Quality-attribute conflict

Two goals compete, such as availability versus cost or strict consistency versus latency. Quantify each where possible and identify which requirement has priority for the use case.

### Cost versus availability

More redundancy, failover capacity, regions, and operational coverage can improve availability while increasing infrastructure and people cost. Select a justified target and test correlated failure assumptions.

### Performance versus cost

Lower latency or greater throughput can require more compute, caching, replication, or engineering time. Measure user impact and cost per useful operation rather than optimizing a benchmark alone.

### Reliability versus change velocity

Release controls and testing can reduce outage risk but slow delivery; rapid change can increase incident likelihood. SLO/error-budget practices and staged rollout can balance both based on evidence.

### Risk assessment

Identify threats/failures, likelihood, impact, exposure, and mitigation. Include security, operational, privacy, and business continuity risks rather than only component failure.

### Assumption register

A maintained list of uncertain inputs, source/confidence, consequences if wrong, and how/when to validate them. It makes capacity and architecture debates falsifiable.

### Sensitivity analysis

Vary important inputs to see which assumptions change the result. If doubling traffic changes the chosen design while a small payload change does not, focus validation on traffic forecasts.

### Reversible decision

A choice that can be changed at reasonable cost if evidence shifts. Prefer reversible options during uncertainty, while recognizing data formats, public APIs, and migration choices can become hard to reverse.

### Architecture Decision Record (ADR)

A concise record of context, decision, alternatives, and consequences, often including status and date. It preserves why a choice was made and what evidence should prompt review.

### Decision trigger

A measurable event or condition that causes reconsideration, such as sustained p95 above target, storage growth exceeding forecast, or cost per transaction crossing a threshold.

### Post-deployment measurement

Compare real workload, quality, cost, and failure behavior with the design assumptions. Ensure instrumentation uses the intended user-visible boundary and captures degraded modes.

### Design revision criterion

An explicit threshold or business change that warrants revisiting architecture. Without one, “we’ll optimize later” is not an actionable plan.

## Cross-item comparison

An assumption register names uncertainty; sensitivity analysis ranks it; a decision trigger links evidence to action; an ADR preserves rationale. These tools work together and can stay lightweight.

## Examples

An ADR selects one region with tested backups for a low-risk internal tool. It records recovery objectives and a trigger to revisit if users expand internationally or measured downtime exceeds the SLO. A two-region design is deferred until its cost and operational complexity are justified.

## Common mistakes

- Recording a decision without its context or consequences.
- Treating an estimate as fact and omitting confidence.
- Making “revisit later” a trigger with no threshold.
- Optimizing cost while omitting operator and incident costs.
- Failing to revisit after workload changes.

## Knowledge checks with answers

1. **What belongs in an ADR?** Context, decision, alternatives, and consequences.
2. **What is a decision trigger?** Evidence threshold that prompts review.
3. **Why do sensitivity analysis?** To find which uncertain inputs can change the decision.

### Exact terms covered

- `Architecture tradeoff`
- `Quality-attribute conflict`
- `Cost versus availability`
- `Performance versus cost`
- `Reliability versus change velocity`
- `Risk assessment`
- `Assumption register`
- `Sensitivity analysis`
- `Reversible decision`
- `Architecture Decision Record (ADR)`
- `Decision trigger`
- `Post-deployment measurement`
- `Design revision criterion`

### Exact terms covered

- `Architecture tradeoff`
- `Quality-attribute conflict`
- `Cost versus availability`
- `Performance versus cost`
- `Reliability versus change velocity`
- `Risk assessment`
- `Assumption register`
- `Sensitivity analysis`
- `Reversible decision`
- `Architecture Decision Record (ADR)`
- `Decision trigger`
- `Post-deployment measurement`
- `Design revision criterion`
