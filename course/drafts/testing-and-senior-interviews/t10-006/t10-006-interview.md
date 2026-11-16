# code review refactoring and legacy modernization — Interview questions and reasoning

# Core questions

1. How do you review a change when you have limited time?
2. What makes a pull request reviewable?
3. How do you distinguish a refactoring from a feature change?
4. How would you refactor a critical legacy module with little or no test coverage?
5. When would you choose incremental modernization over a rewrite?
6. What makes code-review feedback useful?
7. How do you decide whether a finding is blocking?
8. What should CI enforce, and what should remain human judgment?
9. How do you plan rollback for a migration that changes persisted data?
10. How do you keep a compatibility layer from becoming permanent?

# Concise interview answers

1. **Limited review time:** I first understand the intended behavior and change boundary, then inspect high-impact risks: authorization, data integrity, compatibility, error handling, and tests. I rely on automation for mechanical rules and tell the author when I cannot fully assess a specialized risk.
2. **Reviewability:** One coherent intent, a clear description, manageable diff, disclosed behavioral and operational risks, and evidence from relevant checks. Smallness helps but is not a substitute for semantic risk assessment.
3. **Refactoring:** A refactoring changes internal structure while intending to preserve observable behavior. Feature work intentionally changes behavior. I test and describe them distinctly, even when delivery requires a combined change.
4. **Untested legacy module:** Map critical behavior and dependencies, add characterization tests around highest-risk workflows, create a seam if needed, then make small changes with a focused safety net. I avoid a broad rewrite until outcomes, parity, and migration feasibility justify it.
5. **Incremental vs rewrite:** I prefer incremental slices when users cannot pause, behavior is poorly documented, and seams can be introduced. A rewrite may be justified if the current design blocks required outcomes and a full parity/migration plan is feasible; I compare total transition cost and risk, not just code elegance.
6. **Useful feedback:** It identifies a specific behavior, explains impact, and gives a question or possible next step. It separates requirements from personal preference and leaves room for another valid solution.
7. **Blocking:** I block when an unresolved issue creates unacceptable correctness, safety, security, compatibility, data, or agreed policy risk. I state the consequence and evidence needed to close it; local workflow defines the label.
8. **CI vs human review:** CI handles repeatable formatting, compilation, tests, static analysis and configured security checks. Humans examine intent, design tradeoffs, contextual edge cases, and whether the checks cover the actual risk.
9. **Data migration rollback:** I define compatibility stages, checkpoints and the point after which reversal is unsafe. I retain a roll-forward, reconciliation, or verified restore path where appropriate; a feature flag cannot undo irreversible writes.
10. **Compatibility cleanup:** Give the layer an owner and measurable exit criterion, instrument remaining old-path use, communicate deprecation, and remove it after supported consumers migrate and the observation period passes.

# Deep follow-up answers

## How would you handle a reviewer disagreement?

First restate the shared requirement and the concrete concern. Separate evidence from preference: a reproducible failure, compatibility rule, or maintainability cost matters more than who proposed it. Offer alternatives that meet the same constraint, consult a decision owner when the disagreement is about policy or architecture, and record accepted risk or rationale. Keep the interaction about the change. If the issue is nonblocking, say so and track it rather than holding the change over taste.

## Is behavior preservation provable through tests?

Usually not in a practical application suite. Tests sample inputs and states; static analysis and refactoring tools cover specific transformations; formal equivalence is possible in some bounded systems but is not the ordinary guarantee. I define the observable contract, build representative characterization and contract tests, inspect side effects and public boundaries, and make small changes. I call the result evidence-supported, not mathematically proven.

## What is a safe strangler migration for a stateful capability?

Start with domain and data ownership: which system is authoritative for each record, how identifiers and ordering work, and what happens under retries or partial failure. Route one capability through a seam, keep writes single-owner unless consistency is deliberately designed, and use comparison only where side effects can be suppressed. Define metrics, discrepancy thresholds, migration checkpoints, and recovery before expanding traffic. Retire old paths only when consumer use and data obligations are known.

## How do you balance review thoroughness and delivery speed?

Use risk-based depth and fast automation. Keep changes coherent, route specialized review early, and make the review request precise. Batch low-risk review work only if it does not create a queue or hide independent changes. Monitor latency and defect patterns as system signals, not individual performance scores. If review load grows, improve ownership, test automation, and change shape rather than asking reviewers to read faster.

## What does “blameless” mean after a failure?

It means analyze actions in the context of available information, tools, incentives, and constraints, and improve system defenses rather than searching for a person to punish. It still includes named owners, dates, priorities, and checks for whether actions worked. A separate HR or policy process may handle deliberate misconduct; incident learning should not be turned into humiliation.

# Scenario questions

## Scenario: a small authentication patch has one failing test

Do not waive the test based on the patch’s size. Identify what the test protects and whether it fails because of a real contract change, a regression, or an invalid test assumption. For authentication, verify identity and authorization outcomes at the trust boundary, including denied access and data exposure. If the behavior change is intentional, update requirements and tests with explicit compatibility review; otherwise block until the defect or test environment issue is understood.

## Scenario: production fails after a structural cleanup

Stabilize the service first. Use the deployment timeline and affected behavior to decide whether rollback is a safe mitigation; preserve relevant evidence and verify recovery from the user’s perspective. Afterward, compare the changed observable contract and missing characterization cases, including hidden callers or side effects. Avoid concluding that “refactoring caused it” without a causal path; improve the safety net and rollout process based on evidence.

## Scenario: the business demands a rewrite in four months

Clarify the desired outcome and non-negotiable scope. Map critical workflows, undocumented contracts, data and integrations; estimate parity and dual-running needs; identify what can be delivered incrementally. Present a staged plan with measurable value and risk checkpoints, including what must remain on the old system. A four-month deadline is a constraint, not evidence that replacement is feasible. If leadership chooses the rewrite, maintain explicit scope, migration, support and fallback decisions.

# Tradeoffs and alternatives

| Decision | Benefits | Costs and conditions |
| --- | --- | --- |
| Small coherent changes | Easier reasoning, faster feedback, localized rollback. | May require careful sequencing and temporary intermediate states. |
| Automated refactoring | Fast, consistent transformations supported by language tooling. | Tool scope can miss reflection, external contracts, runtime strings, or semantic assumptions. |
| Characterization tests | Capture undocumented behavior before changing structure. | Can encode unwanted behavior or create brittle snapshots unless reviewed and normalized. |
| Incremental migration | Earlier value, learning, and bounded risk. | Transitional architecture, duplicate operations, compatibility and observability costs. |
| Rewrite | Opportunity to remove structural constraints and simplify a clean boundary. | Delayed value, behavior rediscovery, parity failures, data migration and coexistence risk. |
| Strict review gates | Consistent quality floor and traceable decisions. | Queue delays, flaky-check fatigue and false confidence if scope is poor. |

# Common weak answers

- “I review every line equally.” That ignores risk and makes limited attention ineffective.
- “If all tests pass, I approve.” Tests can miss the contract, and CI says nothing about requirements the suite does not encode.
- “Refactoring cannot change behavior.” It states intent as a guarantee and ignores hidden interfaces and incomplete tests.
- “Legacy code should be rewritten.” It treats technology preference as a business case and skips behavior discovery and transition cost.
- “Be respectful in review.” Respect matters, but the answer should say how to write specific feedback, resolve disagreement, and prioritize findings.
- “Roll back if migration fails.” That is incomplete without defining data state, compatibility and the point where reversal is unsafe.
- “Add a follow-up ticket.” Without a desired outcome, owner and risk context, the ticket may never close the gap.

# Self-check rubric

Score yourself 0–2 for each dimension (0 = absent, 1 = partial, 2 = clear and specific):

- Did I state the user or system outcome before discussing code structure?
- Did I distinguish observed facts from assumptions and preferences?
- Did I prioritize by consequence, blast radius and reversibility?
- Did I explain what evidence would validate or falsify my claim?
- Did I cover compatibility, data and failure behavior where relevant?
- Did I offer a viable next step without insisting on one implementation unnecessarily?
- Did I discuss tradeoffs in both incremental migration and rewrite options?
- Did I define how recovery and completion would be verified?

A strong senior answer connects technical detail to user impact, evidence, coordination and learning. A score is a practice prompt, not a hiring prediction.

# Sources

- [Google reviewer guide](https://google.github.io/eng-practices/review/reviewer/)
- [Google author guide](https://google.github.io/eng-practices/review/developer/)
- [Fowler: definition of refactoring](https://martinfowler.com/bliki/DefinitionOfRefactoring.html)
- [Fowler: changing interfaces](https://martinfowler.com/bliki/IsChangingInterfacesRefactoring.html)
- [Fowler: Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Fowler and Sadalage: evolutionary database design](https://martinfowler.com/articles/evodb.html)
