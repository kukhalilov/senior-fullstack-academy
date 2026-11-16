# test design flaky tests coverage limits and maintainability — Reference: Layered test portfolio, risk coverage, and balancing cost

# Scope and version

This reference covers the supplied test-portfolio and strategy terms. The test pyramid and trophy are planning metaphors rather than fixed numerical standards. Microsoft testing guidance emphasizes choosing appropriate test scope, keeping tests isolated, and balancing confidence with feedback speed. Sources checked 2026-11-17. [Microsoft testing overview](https://learn.microsoft.com/en-us/dotnet/core/testing/) [Unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)

# How this group fits the mental model

A test strategy is a portfolio of evidence. Different layers trade realism, speed, diagnostic clarity, and environment cost. A practical suite puts broad input variation at fast layers and includes enough realistic tests to verify framework, database, service, and user-journey boundaries. Every diagram is a conversation aid; the correct portfolio follows the system’s risks.

# Supplied names explained

- `Test pyramid` — A model suggesting a broad base of fast unit tests, fewer integration tests, and a smaller number of end-to-end tests. It encourages quick feedback and clear boundaries, but it is not a required test-count ratio.
- `Test trophy` — An alternative test-portfolio metaphor that emphasizes integration/component-level tests alongside static and end-to-end checks. It is not a universal answer either; choose layers according to application architecture and risk.
- `Unit test layer` — Tests of small behavior boundaries, commonly using controlled collaborators. They run quickly and support many input cases, but cannot prove the real infrastructure or framework configuration behaves as expected.
- `Integration test layer` — Tests that exercise collaboration across components or infrastructure boundaries. They provide more realistic evidence than isolated tests but cost more to provision and can fail from environment or data issues.
- `End-to-end test layer` — Tests that exercise a system through a broad user or external interface, often across multiple deployed components. They are valuable for critical flows but slower, more environment-sensitive, and harder to localize.
- `Contract test layer` — Tests that check a selected interface agreement between independently developed/deployed parties. They improve compatibility feedback without standing up every service together; they cover only the encoded contract.
- `Component test` — A test of a UI or service component through its public behavior while controlling selected dependencies. In frontend work it often checks rendered semantics and interaction; it does not necessarily include a deployed backend or full browser environment.
- `Smoke test` — A small, fast check that a critical service or deployment starts and performs essential operations. It detects gross failures, not deep correctness or broad edge cases.
- `Regression test` — A test that protects behavior previously broken or at risk of breaking again. It is most valuable when it captures the root behavior, not only the exact implementation that caused an incident.
- `Exploratory test` — Human investigation where learning, test design and execution happen together. It can reveal unexpected workflows and usability defects that scripted cases miss; record useful findings and convert durable expectations into repeatable tests.
- `Acceptance test` — A test or review that checks whether stated stakeholder/user acceptance conditions are met. Its scope can be automated or manual and should be traceable to acceptance criteria.
- `Risk-based testing` — Allocating test effort according to likelihood, impact, change exposure and ability to detect a defect. High-impact authorization, money, data integrity or safety flows may deserve deeper coverage than low-impact static presentation.
- `Critical user journey` — An end-to-end task whose failure materially harms users or business outcomes, such as account recovery or checkout. Protect the smallest set of steps that proves the key journey and its important failure modes.
- `Feedback latency` — The elapsed time from a change/test trigger to an actionable result. Track local fast feedback separately from CI/deployment feedback; reduce avoidable waits without removing evidence needed for high-risk changes.
- `Test maintenance cost` — Ongoing effort to update setup, fixtures, data, assertions, environments and baselines as the product evolves. Excessive coupling, shared mutable state and opaque snapshots raise this cost.
- `Environment fidelity` — How closely a test environment matches the production behavior relevant to the claim. Higher fidelity can expose provider/configuration defects but may increase setup and nondeterminism; fidelity should be targeted, not maximized blindly.
- `Defect localization` — How quickly a failing test points to the responsible component or behavior. Narrow tests generally localize better, while broad tests validate integration but may need diagnostics and component-level companions.
- `Test suite signal-to-noise ratio` — The proportion of test results that represent meaningful product or test defects rather than flakes, irrelevant output, or unstable environments. Improve isolation and failure messages instead of suppressing inconvenient failures.
- `Shift-left testing` — Moving useful checks earlier in design/development so defects are found before later, more costly stages. It does not mean every check belongs in a unit test; provider, deployment and human checks remain necessary when the risk lives there.
- `Test strategy review` — A periodic reassessment of risks, test layers, failures, runtime, maintenance and untested boundaries. Update the strategy as architecture, deployment topology and user-critical behavior change.

# Cross-item comparison

**Unit vs integration vs end-to-end:** Unit tests provide speed/localization, integration tests validate a selected real collaboration boundary, and end-to-end tests validate critical flows through a broad system path. Add contract tests for independently deployed interfaces; each layer answers a distinct question.

**Pyramid vs trophy:** The pyramid emphasizes many fast tests and few broad tests. The trophy emphasizes integration tests as a valuable middle layer in many applications. Neither specifies a universal ratio; the measured risks and feedback needs decide the portfolio.

**Smoke vs regression vs acceptance:** A smoke test checks basic operational viability; a regression test protects a known behavior; an acceptance test evaluates stakeholder conditions. One test can serve multiple purposes, but label its intended evidence clearly. No within-group comparison applies to a single item.

# Examples

### E-commerce test portfolio

Use many fast tests for pricing rules, validation and edge values; integration tests against the production database for constraints/transactions; contract tests for payment-service interactions; a few browser end-to-end tests for checkout, payment failure and order confirmation; and smoke checks after deployment. Add exploratory sessions for new checkout UX, and turn confirmed requirements/defects into focused repeatable checks.

This portfolio does not aim for a predetermined percentage per layer. It protects high-impact user journeys while keeping most feedback local and fast.

### Review a slow suite

Measure the stages that contribute to feedback latency. If most time is spent starting a browser for every calculation case, move pure calculations to a unit layer. If many tests share an unreliable database, improve isolation or use the database only where provider semantics are part of the claim. Keep a production-like test for provider-specific behavior rather than replacing all database evidence with a fake.

### Decide where a check belongs

For an authorization rule, test the decision logic quickly with many roles/resources and test the actual framework wiring at an integration boundary. A browser flow can prove an important user journey reaches the expected denial screen, but it should not be the only test for every policy combination.

# Common mistakes

- Treating a pyramid/trophy picture as a mandatory percentage of test counts.
- Testing every business rule only through slow end-to-end flows.
- Testing framework/provider behavior only through mocks.
- Optimizing test speed until the environment no longer represents the risk.
- Keeping only broad E2E tests that fail without clear localization.
- Treating smoke tests as deep regression coverage.
- Calling every exploratory session an acceptance test without traceable criteria.
- Shifting a check left to a layer that cannot observe the behavior.
- Ignoring maintenance and feedback time until developers stop trusting CI.
- Treating one clean CI run as proof of a suitable long-term strategy.

# Knowledge checks with answers

1. **Is a test pyramid a fixed ratio?** No. It is a planning heuristic; choose proportions from behavior, risk and feedback cost.
2. **Why retain integration tests if many unit tests pass?** Unit tests with doubles cannot prove real framework/provider wiring and semantics.
3. **What is a smoke test for?** Detecting gross startup/critical-operation failures quickly, not proving broad correctness.
4. **How does a contract layer differ from a full E2E layer?** It verifies a selected interface agreement between participants without requiring the full deployed system path.
5. **What should a strategy review inspect?** Risk changes, failures/flakes, coverage gaps, feedback latency, environment fidelity, localization and maintenance cost.

# Sources

- [Microsoft .NET testing overview](https://learn.microsoft.com/en-us/dotnet/core/testing/)
- [Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
