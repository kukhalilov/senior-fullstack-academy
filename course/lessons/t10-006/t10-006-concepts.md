# code review refactoring and legacy modernization — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to prepare and review a change around intent and risk, give actionable feedback, distinguish behavior-preserving refactoring from behavior change, create a safety baseline for unfamiliar code, and choose an incremental modernization path with explicit evidence and exit criteria.

# Prerequisites

You should understand source control changes, automated tests, APIs, deployments, and basic system dependencies. A contract is the observable behavior other code or users rely on. A seam is a boundary where behavior can be redirected or replaced without rewriting the whole system. A characterization test records actual behavior, including behavior that may not yet be well understood.

# Core concepts

## A review evaluates a change against its intent

Start with the problem and desired outcome. Then compare the implementation with that intent: what changed, what did not, who or what depends on it, and what evidence supports it? Review is not an attempt to prove code perfect. The reviewer should prioritize correctness, data integrity, security, compatibility, operational risk, and maintainability according to the change’s context.

Separate findings by consequence. A must-fix finding names an observable risk and explains its impact. A suggestion offers an improvement that is not required for correctness or safety. A question asks for missing context. A style preference is blocking only if a documented convention or real maintenance consequence applies. These labels are team conventions; the important distinction is whether the change may safely proceed and why. [Google’s reviewer guidance](https://google.github.io/eng-practices/review/reviewer/)

## Reviewability is created before the reviewer opens the diff

A coherent change describes one understandable intent, provides relevant context, and includes evidence proportionate to its risk. Small changes tend to be easier to inspect and revert. Splitting work should not create artificial dependencies or hide a cross-cutting behavior change. A good description states the motivation, approach, behavioral impact, known risks, verification performed, and any follow-up. The author owns readiness: run local checks, remove accidental changes, and answer review feedback with a decision.

Review latency is a system property. Long queues delay delivery and make branches drift; rushed review increases missed context. Rotate reviewers, make ownership discoverable, and reserve capacity for reviews. A service-level target can help the team notice queues but should not reward shallow approvals. If a reviewer lacks expertise in security, privacy, concurrency, accessibility, or another specialized concern, they should request the right review rather than imply expertise.

## Feedback should make the next action clear

Useful feedback identifies a location or behavior, states the impact, and suggests a path or asks a precise question. For example: “Could this branch preserve the existing authorization check? A caller with a stale role may otherwise read another tenant’s record; please add a test for that case.” Avoid vague commands such as “fix this,” personal judgments, and long comment threads that leave the final decision unclear.

The author can accept, explain why the current code is safe, propose an alternative, or move a nonblocking item into a tracked follow-up. The reviewer should acknowledge resolved concerns and update status according to local workflow. Disagreement is resolved by evidence, requirements, established conventions, or escalation to a responsible owner—not by counting comments. Approval means the reviewer has no remaining blocking concern within their role; it does not certify all possible defects are absent.

## Refactoring preserves observable behavior

Refactoring is a disciplined sequence of internal structural changes intended to preserve externally observable behavior. Fowler describes its heart as small behavior-preserving transformations. An interface change can be a refactoring only when all relevant callers are changed so the system’s behavior remains compatible; a published interface or unknown external caller changes the risk boundary. [Fowler’s refactoring definition](https://martinfowler.com/bliki/DefinitionOfRefactoring.html) [Changing interfaces](https://martinfowler.com/bliki/IsChangingInterfacesRefactoring.html)

Keep a refactoring change separate from feature work when practical. If behavior must change, state it as behavior change and test the new contract. A test suite is evidence, not a mathematical proof of behavior equivalence. Before transformations, identify critical workflows, write characterization tests, record representative outputs, or use contract/integration checks. Golden-master comparisons can capture complex output, but noisy, nondeterministic, or irrelevant fields must be normalized carefully so the snapshot protects meaningful behavior rather than freezing incidental details.

Small transformations reduce the amount of simultaneous reasoning. Typical transformations include extracting or inlining a function, renaming, moving behavior, introducing a parameter object, encapsulating a variable, replacing a magic number with a symbolic constant, splitting phases, separating queries from modifiers, extracting a class, replacing conditionals with polymorphism or guard clauses, and removing genuinely dead code. Use automated refactoring tools when their scope is understood, then inspect the diff and run relevant checks. A tool can transform syntax while failing to preserve assumptions hidden in reflection, serialized names, external callers, or runtime configuration.

## Modernization is controlled change under uncertainty

“Legacy” describes the constraints and cost of change, not necessarily age or poor quality. Begin with an outcome: lower failure rate, faster safe delivery, support for a new requirement, or removal of an unsupported dependency. Map the important data flows, callers, scheduled jobs, operators, external integrations, and business workflows. Distinguish verified dependencies from guesses and record unknowns.

Create a seam to isolate one behavior. Branch by abstraction introduces an interface or indirection that can route old and new implementations while callers migrate. An adapter translates one contract to another; an anti-corruption layer protects a newer domain model from legacy assumptions. A Strangler Fig migration routes selected capabilities through a new path and gradually retires the old implementation. These patterns incur transitional complexity; keep ownership and removal criteria explicit. [Fowler’s Strangler Fig discussion](https://martinfowler.com/bliki/StranglerFigApplication.html)

Incremental migration does not automatically mean safe rollback. A feature flag can restore routing while both paths remain compatible. A backfill checkpoint can detect bad transformations before switching reads. A parallel run or shadow traffic can compare outcomes, but duplicate writes, side effects, privacy constraints, and load can make it unsafe. Once new writes make a lossy old representation impossible to restore, rollback may mean roll forward or restore from a verified backup instead. State the boundary where recovery strategy changes.

## Automated gates and human review have different strengths

Formatting, compilation, static analysis, tests, dependency and security scans can enforce deterministic rules consistently. Gates should be fast enough for frequent feedback and have clear ownership when they fail. A green CI status proves only that configured checks passed on a particular revision and environment. It does not prove the requirements are right, that tests cover the risk, or that an external dependency is safe.

Human reviewers contribute context and judgment, but they are fallible and should not be asked to repeatedly enforce machine-checkable style. Quality gates should be proportionate: a documentation-only change may not need the same costly suite as a schema or authorization change. Trust-boundary changes deserve special scrutiny of identity, authorization, validation, data exposure, and logging.

# Mechanisms and relationships

Use this sequence for a consequential change:

1. State the desired outcome and observable contract.
2. Identify affected users, callers, data, trust boundaries, and operational dependencies.
3. Choose a coherent slice and say what behavior changes or remains stable.
4. Establish a baseline: tests, representative outputs, dependency map, metrics, or compatibility checks.
5. Make one understandable structural or behavioral step.
6. Run automated checks and inspect the actual diff, including generated files and migration scripts.
7. Ask reviewers to focus on risks and decisions; resolve each blocking concern with evidence or an explicit owner.
8. Release through a bounded rollout and verify user-facing outcomes.
9. Continue, pause, or roll back using predeclared checkpoints; remove transitional code after the exit criterion is met.

For a large legacy module, this may be an iterative cycle rather than a one-time plan. Findings from the first slice update the dependency map and risk register. The modernization hypothesis should be revisited when expected outcomes fail to appear or the transition cost exceeds its expected value.

# Worked examples

### Separate a behavior change from a refactor

An endpoint currently accepts a date string with local-time interpretation. The feature request is to require ISO dates in UTC. A simultaneous rewrite of the parser and naming cleanup makes regressions hard to attribute. First add tests that characterize current supported inputs. Then make a behavior-preserving extraction if it reduces complexity. In a separate change, implement the new contract, document compatibility impact, and test valid, invalid, timezone, and boundary cases. If release timing requires combining them, the description and tests still distinguish the structural and behavioral intent.

### Add a seam around a vendor client

Three parts of a system call a vendor SDK directly. Map the calls and differing retry/error assumptions, then define a narrow internal interface around the business operations actually needed. Keep the adapter responsible for translating the SDK’s errors and data types. Migrate one caller, compare its behavior, and continue. Avoid building a generic abstraction for every vendor capability before a use case exists. The seam is valuable when it reduces coupling and allows controlled change; otherwise it is indirection without benefit.

### Review a risky migration

A pull request switches reads to a newly populated column. Ask how backfill completeness is measured, what happens for rows that fail parsing, whether old and new application versions can overlap, whether dual-write consistency is monitored, and what the recovery action is after new-format writes occur. Each question should correspond to a specific failure mode. “Add more tests” is less useful than requesting a test for malformed historical values and a rollout check for unresolved row count.

# Misconceptions and edge cases

- **“A small diff is always safe.”** A one-line permission change can have a large blast radius. Judge semantic risk, not line count alone.
- **“A green CI means this is correct.”** CI proves configured checks passed for a revision; requirements, coverage and production context remain questions.
- **“Refactoring means no behavior can change.”** That is its intent, not a guarantee. Tests and inspection provide bounded evidence.
- **“Legacy behavior should all be preserved.”** Preserve behavior users or integrations rely on until an intentional, communicated change is made; do not enshrine accidental behavior without evaluation.
- **“Incremental migration is always reversible.”** Data conversion, external side effects, and incompatible writes can make rollback impossible. Plan recovery per checkpoint.
- **“The reviewer owns quality.”** Authors own correctness and readiness; reviewers provide an independent check, and teams own their delivery system.
- **“All comments must be accepted.”** Resolve every concern clearly; accepting a suggestion is not the only legitimate resolution.

# Knowledge checks with answers

1. **Why separate refactoring from feature work?** It makes the intent and evidence easier to reason about and narrows the cause of a regression. If combined, explicitly separate the behavior change in tests and description.
2. **What is a characterization test?** A test that records behavior the system currently exhibits, often before its full design is understood. It is useful as a baseline but may need review if the captured behavior is undesirable.
3. **When can renaming a public function be behavior-preserving?** When all relevant callers and observable contracts are migrated compatibly. Unknown external callers make that assumption unsafe.
4. **What should a blocking review comment contain?** A concrete concern, its impact, and a question or proposed action that lets the author resolve it.
5. **Why define migration exit criteria?** They prevent transitional routing and compatibility layers from becoming permanent, while making completion measurable.
6. **When is shadow traffic unsafe?** When the duplicate path causes side effects, consumes sensitive data improperly, adds unacceptable load, or cannot be isolated from production writes.

# Sources

- [Google reviewer guide](https://google.github.io/eng-practices/review/reviewer/)
- [Google author guide](https://google.github.io/eng-practices/review/developer/)
- [Fowler: refactoring definition](https://martinfowler.com/bliki/DefinitionOfRefactoring.html)
- [Fowler: changing interfaces and refactoring](https://martinfowler.com/bliki/IsChangingInterfacesRefactoring.html)
- [Fowler: evolutionary database design](https://martinfowler.com/articles/evodb.html)
- [Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
