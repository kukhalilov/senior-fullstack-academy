# architecture interviews tradeoffs requirements and constraints — Reference: Decision rationale, bottleneck iteration, and common design prompts

## Scope and version

This lesson focuses on communicating design decisions. See [Microsoft technical interview guidance](https://careers.microsoft.com/v2/global/en/hiring-tips/technical-interviewing.html), [Azure Well-Architected](https://learn.microsoft.com/en-us/azure/well-architected/what-is-well-architected-framework), and the [Google Cloud architecture framework](https://docs.cloud.google.com/architecture/framework).

## How this group fits the mental model

An interview is not a monologue or a contest to mention the most technologies. Make each decision legible: requirement, options, chosen baseline, cost, failure mode, and evidence that would trigger a change.

## Supplied names explained

- **Architecture tradeoff** — A choice that improves one property while costing another; tie it to the requirement that matters.
- **Decision record** — Short record of context, decision, alternatives, and consequences so later changes remain understandable.
- **Alternative design** — Plausible option considered and the condition under which it would be better.
- **Bottleneck analysis** — Find the constrained resource using load, latency, saturation, errors, and trace evidence before changing architecture.
- **Single-region baseline** — Initial deployment in one region with deliberate zone-level resilience; a simpler comparator for multi-region designs.
- **Multi-region cost tradeoff** — Higher availability/latency reach may cost replication complexity, data residency work, conflict handling, and operations.
- **Managed service tradeoff** — Provider handles some operations while the team accepts service limits, cost, portability, and provider-specific behavior.
- **Build-versus-buy decision** — Compare strategic differentiation, delivery time, operating burden, customization, security, and total cost.
- **Operational complexity** — Ongoing burden of deployment, monitoring, upgrades, incidents, data repair, and staffing.
- **Security threat boundary** — Actor/resource boundary used to reason about authentication, authorization, trust, and abuse.
- **Observability signal** — Logs, metrics, traces, and events used to understand behavior; define what questions each can answer.
- **Failure-mode walkthrough** — Follow a concrete component failure through detection, user impact, mitigation, recovery, and data integrity.
- **Assumption revision** — Update the design when new evidence invalidates a provisional value.
- **Constraint change** — New limit such as tenfold traffic, strict residency, or offline operation that forces re-evaluation.
- **Design pivot** — Focused architecture change in response to a changed requirement; preserve unaffected decisions.
- **Clarifying discussion** — Back-and-forth that narrows scope and corrects assumptions during the interview.
- **Collaborative problem solving** — Explain reasoning and invite feedback rather than defending a hidden design.
- **Time-boxed design** — Reserve time for discovery, baseline, deep dive, reliability, and summary.
- **URL shortener design prompt** — Address key generation, redirects, uniqueness, abuse, analytics, and read-heavy workload.
- **Chat service design prompt** — Address connection/session handling, message persistence/order scope, delivery/read state, and offline users.
- **Social feed design prompt** — Compare pull, push, or hybrid fan-out under freshness and celebrity-account constraints.
- **File storage and sharing design prompt** — Separate blob storage from metadata and authorization; cover upload, sharing, scanning, and deletion.
- **Rate limiter design prompt** — Clarify key, window/token semantics, distributed state, burst policy, and fail-open/closed behavior.
- **Notification service design prompt** — Cover preferences, channel providers, retries, deduplication, delivery state, and opt-out.
- **Metrics ingestion design prompt** — Cover write volume, batching, time-series partitioning, retention, aggregation, and cardinality limits.
- **Search autocomplete design prompt** — Trace keystrokes to ranked suggestions; cover stale requests, authorization, indexes, keyboard interaction, and cost.
- **Ride-hailing dispatch design prompt** — Clarify location freshness, matching latency, geographic partitioning, fairness, and safety.
- **Design summary** — Restate requirements, architecture, critical tradeoffs, failure behavior, and next validation step.
- **Open questions** — Explicit uncertainties or risks that require product, operations, or measurement input.

## Cross-item comparison

The single-region baseline is a useful comparison point; it is not automatically adequate. Managed services reduce some operating work but still require limits, quota, and failure planning. A decision record documents why a design was chosen; an observability signal tells whether the decision works in practice. Case prompts are different surfaces of the same method: clarify, estimate, sketch, trace, stress, compare, summarize.

## Examples

### Making a design pivot

Suppose you propose a single-region feed with cached reads. The interviewer adds a requirement that users in two countries must continue writing during a regional network partition. State that the consistency and availability requirements changed. Ask whether conflicting writes are acceptable, whether the data has residency constraints, and what recovery objective applies. Compare active-active writes with single-writer failover. Explain conflict resolution, duplicate events, and operational cost before changing only the affected data path.

## Common mistakes

- Name-dropping technologies without relating them to a bottleneck or requirement.
- Presenting a single design as the only correct answer.
- Saying “we can scale it” without naming the constrained resource or next step.
- Failing to invite interviewer correction or to summarize within the time budget.
- Adding multi-region, microservices, or event sourcing before explaining the baseline.

## Knowledge checks with answers

1. **How should you compare alternatives?** Use the same requirements and state benefits, costs, failure modes, and conditions that would change the choice.
2. **What does a useful design summary include?** User goals, main components and flows, key guarantees, largest risks, and validation plan.
3. **When should a new constraint trigger a pivot?** When it invalidates a guarantee or bottleneck assumption; preserve decisions that remain valid.
