# code review refactoring and legacy modernization — Reference: Dependency discovery, seams, migration steps, and rollback planning

# Scope and version

This lesson explains the assigned system-modernization vocabulary. These are strategy concepts, not guarantees of safety or a prescribed architecture. Migration planning must be adapted to data volume, uptime, consumers, regulations, and failure recovery. Database migration implementation mechanics are covered in the database track. The names below are the complete assigned group.

# How this group fits the mental model

Modernization changes a system that is already carrying business behavior. The hard part is often not writing new code but discovering the real contract, inserting a boundary, and moving one capability while old and new paths coexist. Fowler describes a gradual Strangler Fig approach as adding separate new capabilities and moving behavior over time; the transition itself has cost and requires organizational agreement. [Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html) [Fowler and Sadalage: evolutionary database design](https://martinfowler.com/articles/evodb.html)

# Supplied names explained

- `Legacy system` — A system whose current constraints, dependencies, knowledge, or cost of change make new requirements difficult. Age alone does not define it, and a newer system can become legacy in this practical sense.
- `Legacy codebase` — Existing code with accumulated behavior, constraints, and often incomplete documentation or tests. The term does not prove the code is bad; its actual properties should be investigated.
- `Knowledge silo` — Critical understanding concentrated in one person, group, document, or tool. Reduce risk by pairing, recording decisions, mapping behavior, and cross-training instead of treating an individual as the defect.
- `Dependency map` — A maintained view of callers, data flows, jobs, integrations, deployment coupling, and operational dependencies relevant to a change. Mark unknowns and confidence; a map is a working hypothesis, not proof every edge was found.
- `Critical behavior inventory` — A list of business workflows and contracts that must remain correct during modernization, including failure behavior and important data invariants. Prioritize by user impact and business risk.
- `System characterization` — Empirical discovery of how a system behaves, using tests, traces, data samples, user workflows, operational records, and stakeholder knowledge. It distinguishes observed behavior from desired behavior.
- `Module seam` — A boundary where a component can be isolated, substituted, or routed independently. A seam may be introduced through a function, module, service boundary, protocol, or data ownership change; it is valuable only if it reduces the coupling relevant to the migration.
- `Branch by abstraction` — Introduce a stable abstraction, move callers behind it, provide old and new implementations, and switch implementation in controlled steps. It supports continuous delivery but temporarily adds indirection and dual-path complexity.
- `Strangler Fig pattern` — Gradually route capabilities from an old system to a new one until the old path can be retired. Routing, identity, data consistency, observability, and retirement criteria are essential parts of the pattern, not optional details.
- `Anti-corruption layer` — A translation boundary that prevents an external or legacy model from shaping the newer domain model directly. It should translate meaningful concepts and errors; a large pass-through wrapper may not provide real protection.
- `Adapter seam` — An adapter converts one interface or protocol into another and can create an insertion point between callers and a legacy dependency. Keep it narrow and explicit about error, retry, timeout, and data semantics.
- `Incremental migration` — Moving through bounded, verifiable steps while the current system continues serving its users. It can provide earlier value and feedback but requires compatibility, sequencing, monitoring, and temporary operating cost.
- `Parallel run` — Operate old and new paths concurrently and compare or reconcile their results. Define authority and side effects first; dual writes can diverge, duplicate effects, or overload dependencies.
- `Shadow traffic` — Copy or mirror selected production requests to a candidate path for observation without using its result to serve the user. Ensure the shadow path cannot cause writes or external effects and account for privacy, load, sampling, and timing differences.
- `Data migration checkpoint` — A measured gate in a data transition, such as counts, checksums, validation failures, or sampled semantic comparisons, used before proceeding to a more irreversible step. Define thresholds and recovery action in advance.
- `Compatibility layer` — Code that temporarily supports old and new contracts or formats during transition. It must have an owner and removal criterion to avoid permanent complexity.
- `Feature flag rollout` — A controlled switch that enables behavior for selected cohorts or conditions. Flags require safe defaults, observability, access control, cleanup, and a plan for data already written under the new behavior.
- `Rollback plan` — A concrete recovery strategy that names trigger conditions, actions, data implications, ownership, and verification. If changes cannot be reversed safely, define a roll-forward or restore strategy instead of calling it rollback.
- `Deprecation path` — A communicated sequence for discouraging and eventually removing an interface or behavior, including discovery, compatibility period, migration help, and a decision about unsupported consumers.
- `Technical debt` — The future change cost caused by past shortcuts, constraints, or design choices. Debt should be described with its consequence and context; not every old or imperfect implementation has enough cost to justify repayment now.
- `Modernization hypothesis` — A testable claim that a proposed investment will improve a stated outcome, such as delivery time, availability, security posture, or operating cost. State a baseline and a way to evaluate the result.
- `Risk register` — A living list of uncertain events, likelihood, impact, mitigations, owners, and trigger signals. It supports decisions but cannot enumerate every unknown failure.
- `Reversibility` — How safely and cheaply a decision or deployment can be undone or compensated for. Schema changes, data loss, external effects, and user-visible contracts can reduce it.
- `Migration exit criterion` — A measurable condition for ending a transition stage or retiring an old path, such as all callers migrated, discrepancy below threshold, data validated, or an agreed observation period completed.

# Cross-item comparison

| Pair | Difference and decision |
| --- | --- |
| Parallel run and shadow traffic | Parallel run can compare two active systems; shadow traffic copies requests for observation and should not make the candidate authoritative. Both require side-effect and load controls. |
| Branch by abstraction and Strangler Fig | Branch by abstraction is an implementation technique for switching callers behind an interface; Strangler Fig is a broader incremental replacement strategy that may use routing or other seams. |
| Adapter seam and anti-corruption layer | An adapter translates a technical interface; an anti-corruption layer protects domain concepts from external model assumptions. One component may serve both roles, but the purposes differ. |
| Rollback plan and reversibility | A rollback plan describes recovery actions; reversibility is a property of the change. A documented plan cannot make irreversible data loss reversible. |
| Feature flag and compatibility layer | A flag controls when code path is active; a compatibility layer supports differing contracts or representations. Either can exist without the other. |
| Technical debt and modernization hypothesis | Debt describes a source of future cost; the hypothesis explains why a particular investment is expected to improve a measurable outcome. |

# Examples

### Stage an address migration

1. Inventory readers, writers, exports, reports, and downstream consumers of the old address field.
2. Add a new representation while preserving existing reads.
3. Write compatible code and backfill existing records; validate counts and semantic samples at a checkpoint.
4. Compare new and old interpretations for a bounded cohort without duplicating side effects.
5. Switch reads when validation meets its threshold; observe user outcomes and error rates.
6. Stop old writes and wait through the compatibility period; remove the old field only after every consumer is migrated and recovery is understood.

If the new representation cannot be converted back without loss, the rollback boundary is before new-format writes. Beyond it, a tested roll-forward or restore is required.

### Select a seam using a hypothesis

Hypothesis: placing the legacy shipping provider behind a narrow adapter will let the team replace it without changing order-domain code. Baseline: all provider call sites and current timeout/error behavior. Test: migrate one low-volume operation, exercise timeout and retry behavior, and compare fulfillment results. If the adapter spreads provider concepts into domain code or adds no isolation, revise the seam rather than declaring success because a new interface exists.

# Common mistakes

- Assuming the dependency map is complete because the main application compiles; scheduled jobs, reports, scripts, and external clients may be missing.
- Treating current behavior as desired behavior without a product, security, or legal decision.
- Mirroring requests that still trigger emails, payments, or state changes on the candidate path.
- Enabling dual writes without defining consistency, ordering, idempotency, and reconciliation.
- Assuming a feature flag alone provides rollback after irreversible writes.
- Leaving compatibility code without a removal owner and date/criterion.
- Setting a migration exit criterion such as “looks good” instead of a measurable condition.
- Declaring modernization successful because new technology shipped even when the intended delivery, reliability, or cost outcome did not improve.

# Knowledge checks with answers

1. **What should a dependency map say about uncertain links?** Label them as unknown or low-confidence and validate them; false certainty is more dangerous than a visible gap.
2. **What makes shadow traffic different from using the new result?** The candidate observes copied requests, but its response does not serve the user; side effects must be suppressed.
3. **Can a feature flag make a migration reversible?** It can change routing, but cannot undo incompatible data writes or external side effects by itself.
4. **Why name a migration checkpoint before deploying?** It defines evidence, thresholds, and action while there is still time to pause before a costly or irreversible transition.
5. **What should happen to a compatibility layer?** Keep it while needed for supported coexistence, then remove it when a verifiable exit criterion is met.

# Sources

- [Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Fowler and Sadalage: evolutionary database design](https://martinfowler.com/articles/evodb.html)
- [Fowler: refactoring definition](https://martinfowler.com/bliki/DefinitionOfRefactoring.html)
- [Google reviewer guide](https://google.github.io/eng-practices/review/reviewer/)
