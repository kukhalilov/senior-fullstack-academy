# mentorship communication estimation planning and leadership — Reference: Breakdown, forecasting, dependencies, incremental delivery, and risk

# Scope and version

This lesson covers planning and estimation concepts, not a required Agile framework or project-management tool. Methods such as planning poker are optional team techniques; their meaning depends on local practice. The names below are the complete assigned group.

# How this group fits the mental model

Planning coordinates people toward an outcome while exposing what is uncertain. Break work into pieces that can be verified, identify dependencies and assumptions, and update the forecast as evidence changes. Do not confuse a numeric estimate with a promised date. Microsoft’s DevOps planning article describes one organization’s planning practices and explicitly emphasizes learning and outcomes; its specific cadence is not a universal prescription. [Microsoft planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)

# Supplied names explained

- `Outcome definition` — A statement of the user, operational, or business change desired and how it will be recognized. Prefer outcomes over lists of activities.
- `Scope boundary` — What is included and excluded from an increment, release, or estimate. Name assumptions so scope does not silently expand.
- `Work breakdown` — Decomposing an outcome into tasks or deliverables that expose ownership, sequence, risk, and verification. Breakdown should reveal dependencies, not create meaningless microtasks.
- `Task dependency` — A relationship where one task needs another’s result or decision. Record external and organizational dependencies as well as technical ones.
- `Critical path` — The longest dependency-constrained chain that determines the earliest possible completion under the current plan. Parallelizing work off this chain may not move the delivery date; uncertainty in critical tasks matters disproportionately.
- `Estimate range` — A forecast interval that communicates uncertainty instead of a single false-precision value. Clarify whether it refers to effort, elapsed time, or a delivery date.
- `Confidence level` — A qualitative or quantitative description of how strongly evidence supports a forecast. State what drives the confidence and what information could change it.
- `Reference-class estimate` — A forecast informed by comparable completed work. Similarity and context matter; past duration is not automatically predictive when scope or environment differs.
- `Three-point estimate` — An estimate using optimistic, most likely, and pessimistic cases to expose uncertainty. Formula choices vary; do not present a particular probability distribution as universal unless assumptions are stated.
- `Planning poker` — A collaborative relative-estimation exercise in which team members independently select estimates and discuss large differences. It helps reveal assumptions; it does not produce objective truth or guarantee accuracy.
- `Story point` — A team-specific relative-size unit that may combine effort, complexity, and uncertainty. It is not a standard unit of time or a fair individual productivity measure.
- `Ideal time` — Focused work duration without expected interruptions or waiting. It differs from elapsed calendar time and should not be treated as a delivery forecast by itself.
- `Calendar time` — Elapsed time across work, waits, dependencies, review, release windows, and other delays. It can greatly exceed effort time.
- `Delivery forecast` — An evidence-based expectation of when a scope or outcome may be delivered, considering capacity, dependencies, and uncertainty. It should be updated rather than defended after assumptions change.
- `Commitment` — A deliberate decision to prioritize and take responsibility for a target or outcome. A commitment is not a guarantee that all uncertainty disappears; communicate risks and renegotiate when facts change.
- `Assumption register` — A list of planning assumptions, how they will be validated, and the consequence if false. It turns hidden guesses into testable items.
- `Risk buffer` — Explicit time or capacity reserved for identified uncertainty or variability. Its size and use should be explained; it is not a substitute for investigating major unknowns.
- `Unknown unknown` — A relevant factor not yet identified. It cannot be enumerated directly; reduce exposure through discovery, small steps, monitoring, and the ability to revise.
- `Spike investigation` — A bounded research task designed to answer a specific uncertainty, with a time boundary and useful output such as a prototype, decision, or estimate update. It should not become unbounded exploration.
- `Vertical slice` — A small increment that crosses relevant layers to deliver and verify a usable behavior. It can expose integration risk early, though foundational work may need earlier sequencing.
- `Incremental delivery` — Delivering useful and verifiable capabilities in steps, collecting feedback before the whole vision is finished. It requires contract and compatibility care when versions coexist.
- `Milestone` — A meaningful checkpoint or event in a plan, such as an agreed capability or decision. A milestone should describe verifiable state, not merely passage of time.
- `Acceptance criterion` — A condition a work item must satisfy to be accepted. Criteria should be observable and clarify edge behavior without prematurely prescribing implementation.
- `Definition of done` — A team-level agreement about quality and completion evidence, potentially including tests, review, documentation, deployment, and observability. It should fit the team’s product and risk context.
- `Release dependency` — A requirement involving order, compatibility, approvals, infrastructure, data, or coordination for deploying a release. It can make deployment timing differ from code completion.
- `Scope change` — A change in intended work or boundaries after planning. Make the impact on outcome, forecast, quality, and deferred work explicit.
- `Reforecast` — Updating the delivery expectation when scope, evidence, capacity, or dependencies change. It is normal planning behavior, not proof the original estimate was dishonest.
- `Capacity planning` — Estimating the work a team can take on after accounting for actual availability, support load, leave, review, operational tasks, and context switching. It is not a measure of each person’s worth.
- `Work in progress limit` — A cap on concurrent work intended to reduce context switching and expose bottlenecks. Limits should be adjusted based on flow and service needs, not applied mechanically to every type of work.

# Cross-item comparison

| Pair | Difference |
| --- | --- |
| Estimate, forecast, commitment | Estimate describes work/uncertainty; forecast describes expected delivery under current evidence; commitment is a prioritization and ownership decision. |
| Ideal time and calendar time | Focused effort versus elapsed duration including waits, coordination, and interruptions. |
| Story point and hour | Team-relative sizing convention versus time duration; there is no universal conversion. |
| Milestone and acceptance criterion | Milestone marks a meaningful checkpoint; acceptance criterion states what a work item must do to pass. |
| Vertical slice and layer task | A vertical slice verifies behavior through layers; a layer task may be necessary infrastructure but does not alone prove end-to-end value. |
| Risk buffer and spike | Buffer reserves capacity for variability; spike buys information about a defined uncertainty. |

# Examples

### Forecast with an assumption and spike

“The migration forecast is three to six weeks at low-to-medium confidence. It assumes the vendor export includes stable identifiers. A two-day spike will verify identifiers and import limits. If identifiers are not stable, we need reconciliation work and the range changes. The release target is a separate commitment decision after the spike.”

### Critical path

Task A (schema contract) precedes B (backfill tool), which precedes D (read switch). In parallel, task C (dashboard) can finish before B but does not shorten A→B→D. If D requires a partner approval that takes five days, the external approval is on or near the critical path and should be tracked as a release dependency.

# Common mistakes

- Reporting one date without scope, assumptions, confidence, or dependency risks.
- Treating story points as universal hours or comparing individual velocity.
- Filling capacity to 100% planned work and leaving no space for review, incidents, or learning.
- Calling an investigation a spike without a question, timebox, or decision output.
- Reporting percentage complete when remaining integration work is unknown.
- Treating a milestone as done because a date passed rather than verifying its outcome.
- Adding scope without reforecasting or explicitly deferring other work.
- Using risk buffer to conceal a known unresolved dependency.
- Optimizing tasks not on the critical path while ignoring the actual delivery constraint.

# Knowledge checks with answers

1. **What is a critical path?** The dependency-constrained chain that determines the earliest completion under the current plan; parallel work off it may not change the date.
2. **How does a spike differ from a buffer?** A spike investigates a named uncertainty; a buffer reserves capacity for variability that remains.
3. **What is the role of a reference class?** Use comparable completed work to inform a forecast, while checking that scope and conditions are genuinely similar.
4. **Does reforecasting mean the team failed?** No. It updates expectations when evidence, scope, or capacity changes.
5. **Why use a vertical slice?** It validates an end-to-end behavior early and can expose integration risks before large amounts of work accumulate.
6. **Can acceptance criteria define every implementation detail?** They should define observable acceptance conditions; implementation details belong in design when necessary.

# Sources

- [Microsoft Learn: planning with DevOps](https://learn.microsoft.com/en-us/devops/plan/how-microsoft-plans-devops)
- [Microsoft: formalize development practices](https://learn.microsoft.com/en-us/power-platform/well-architected/operational-excellence/formalize-development-practices)
- [Google documentation best practices](https://google.github.io/styleguide/docguide/best_practices.html)
