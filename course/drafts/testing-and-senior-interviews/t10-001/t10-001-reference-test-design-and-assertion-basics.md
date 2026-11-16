# unit tests assertions fixtures mocks stubs fakes and isolation — Reference: Behavior-focused test structure, assertion intent, and isolation

# Scope and version

This reference explains the supplied test-design terms across .NET frameworks. It uses current Microsoft testing guidance checked 2026-11-17. Framework-specific syntax is covered in the next lessons; this lesson focuses on test intent, boundary choice, and deterministic execution. [Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)

# How this group fits the mental model

A test is a repeatable experiment: establish conditions, invoke one behavior, and compare an observable result with an expectation. Clear names and controlled fixtures make it understandable to a future maintainer. Isolation ensures a result reflects the tested behavior rather than environment or execution order.

# Supplied names explained

- `Unit test` — A focused, fast test of one behavior through a chosen design boundary. A unit may involve a small collaborating object graph when that gives a more meaningful contract.
- `Test case` — One execution of a test with a particular input and expected outcome. Parameterized tests can generate multiple cases from one test definition.
- `System under test (SUT)` — The component or behavior whose contract the test evaluates. Keep the SUT boundary explicit so it is clear which behavior the assertion concerns.
- `Arrange-Act-Assert (AAA)` — A structure that sets up inputs/dependencies, invokes the behavior, then checks its observable result. It improves readability but does not require exactly three statements or code blocks.
- `Given-When-Then (GWT)` — A scenario phrasing that states context, action, and expected outcome. It maps to AAA and can make business behavior easier to discuss.
- `Test name as behavior statement` — A name describing a condition and expected behavior, such as “expired coupon is rejected.” It becomes executable documentation and helps identify failures in CI output.
- `Observable outcome` — A result a caller or system boundary can observe: return value, state, error, emitted message, or required collaborator effect. Prefer this over private implementation details.
- `State-based assertion` — A check of returned or resulting state. It is often resilient to refactoring because it focuses on behavior rather than calls.
- `Interaction-based assertion` — A check that a collaborator was called or not called with expected arguments/count. Use it when that interaction is itself required, not to mirror every internal step.
- `Positive case` — An input exercising an allowed or successful behavior. It should confirm the expected useful result, not merely that no exception occurred.
- `Negative case` — An input expected to be rejected or handled as a failure. Assert the relevant error/result and, where important, that harmful side effects did not occur.
- `Boundary case` — An input at or near a point where behavior changes, such as zero, maximum, or an inclusive threshold. Test just below, exactly at, and just above when those distinctions matter.
- `Equivalence partition` — A group of inputs expected to follow the same rule. Choose representative values from each valid/invalid partition rather than sampling arbitrary values.
- `One behavior per test` — A focus guideline: each test should have one coherent reason to fail. Several assertions can validate facets of the same outcome, but unrelated scenarios make diagnosis difficult.
- `Test smell` — A pattern suggesting unclear, brittle, or misleading test design, such as unexplained sleeps, excessive mocking, giant setup, order dependence, or assertions on private details. A smell is a prompt to inspect, not automatic proof of a defect.
- `Test diagnostic value` — How clearly a failure explains the condition, expected result, and actual result. Descriptive names and focused assertions improve diagnosis.
- `Test isolation` — Independence from other tests and uncontrolled external state. A test should pass alone and in any supported suite order.
- `Order-dependent test` — A test whose outcome changes based on prior/following tests because of leaked or shared state. Fix ownership/reset/lifecycle instead of relying on test ordering.
- `Parallel test execution` — Running independent tests concurrently to reduce time. Tests must not share mutable resources unsafely; use isolated data or explicit synchronization only when the shared behavior is the test subject.
- `Deterministic clock seam` — A dependency that lets tests control the time observed by production behavior. It avoids sleeps and makes expiry, scheduling, and time-window boundaries reproducible.
- `Random seed recording` — Capturing the seed and generated input for a randomized test so a failure can be reproduced. If the seed is not reported, randomness may make debugging impractical.

# Cross-item comparison

| Test structure | Emphasis | Example prompt |
| --- | --- | --- |
| AAA | Code organization | What setup, action, and assertion are present? |
| GWT | Scenario language | Given what state, when what action, then what result? |
| State assertion | Resulting contract | What value/state did the caller observe? |
| Interaction assertion | Required collaboration | Did a required external effect happen exactly as specified? |

Boundary analysis and equivalence partitioning complement one another: partitions identify behavior classes; boundary cases probe where class transitions occur. A test name describes the behavior and expected outcome; a test case supplies concrete data to demonstrate it.

# Examples

For a policy with threshold 100, equivalence classes could be valid subtotals below threshold and at/above threshold, plus invalid negative values. Representative cases are 99, 100, 101, and -1. A test named `Subtotal_at_threshold_qualifies_for_free_shipping` states intent. If the policy uses an injected clock for coupon expiry, set a fixed time and test just before, exactly at, and after expiry instead of sleeping.

# Common mistakes

- Naming tests after implementation details instead of observable behavior.
- Testing only a typical value and missing boundary semantics.
- Adding interaction assertions because a mock library makes them convenient.
- Treating one assertion as a test-quality rule instead of focusing on one behavior.
- Using a shared mutable static fixture and disabling parallelism without fixing the cause.
- Swallowing failure detail in a generic `Assert.True(result)` message.
- Using unseeded random input with no reproduction path.

# Knowledge checks with answers

1. When should you assert an interaction? **When the interaction itself is contractual or prevents a meaningful side effect.**
2. What are boundary cases for a threshold of 100? **Values below, exactly at, and above 100, plus relevant invalid values.**
3. Is AAA a requirement imposed by a framework? **No; it is a readability convention.**
4. What makes tests order-dependent? **Leaked/shared mutable state or assumptions created by other tests.**
5. Why record a random seed? **It lets a failing generated case be reproduced.**

# Sources

[Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices) · [Microsoft testing overview](https://learn.microsoft.com/en-us/dotnet/core/testing/)
