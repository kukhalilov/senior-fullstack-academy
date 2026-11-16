# unit tests assertions fixtures mocks stubs fakes and isolation — Core concepts and how they fit together

# Learning objectives

- Define a useful unit boundary and describe behavior through a public contract.
- Structure a test so its inputs, action, and expected observable outcome are clear.
- Select positive, negative, boundary, and equivalence-class cases deliberately.
- Choose between state assertions and interaction assertions based on the contract.
- Design fixtures, clocks, randomness, and cleanup for isolated repeatable tests.
- Explain why tests should tolerate any execution order and safe parallel execution.

# Prerequisites

Know basic C# methods, objects, dependencies, and exceptions. A test framework discovers and runs tests; assertions decide whether a behavior met expectations. The exact attributes differ by framework, but the design principles in this lesson apply across .NET test frameworks.

# Core concepts

## Unit boundaries are about behavior, not file count

A unit test exercises one small behavior through its public contract. The unit may be a method, object, policy, or small group of collaborators. If the test requires starting a web server or database, it has crossed into integration testing even if the test class is called `UnitTests`.

Test one behavior per test so a failure points to a meaningful contract. This does not mean one assertion per test: a coherent behavior can have several assertions about the same observable result. Avoid unrelated assertions that make it unclear which behavior failed. Tests should read like small examples, not like a transcript of the implementation.

## Arrange, act, assert is a readable structure

Arrange establishes the smallest useful inputs and fixture. Act invokes the system under test (SUT) once at the behavior boundary. Assert checks an externally meaningful result, state change, error, or required interaction. Given-When-Then describes the same shape in scenario language. Neither is a framework rule or a requirement to make three code blocks.

A test name should state condition and expected outcome, for example `Expired_coupon_is_rejected`. Naming only the method (`ApplyTest`) does not communicate behavior. Positive cases prove an allowed path; negative cases prove rejection or failure; boundary cases test the exact edge where behavior changes. Equivalence partitioning groups inputs expected to share behavior (e.g., below, at, and above a threshold), reducing random test selection.

## Assertions should observe the contract

State-based assertions examine a result or resulting state. They usually survive refactoring because they describe what callers care about. Interaction-based assertions verify calls to collaborators. Use them when the interaction is itself contractual: one email should be queued, a payment should not be charged twice, or a command must be sent to a device.

An over-specified interaction test checks incidental call order, internal helper calls, or exact implementation steps without a contract reason. Such tests break when code is refactored even though behavior is unchanged. A useful test diagnostic value means failure output identifies the input and expected/actual behavior. Avoid boolean assertions with no context when a clearer equality or collection assertion exists.

## Fixtures manage context and lifecycle

A fixture is the data, dependencies, and resources required to run a test. Per-test fixture setup gives strong isolation and simpler cleanup. A shared fixture can make expensive immutable setup faster, but mutable shared data introduces races and order dependence. Parallel execution makes hidden shared state visible sooner; disabling parallelism can be a temporary constraint, not a substitute for understanding the collision.

Cleanup and disposal must run even when assertions fail. Dispose resources in the correct scope and ensure one test cannot observe another test’s leftovers. Avoid reliance on current directory, machine timezone, environment variables, process-wide static state, external network services, or a particular test execution order.

Time and randomness require deliberate seams. Inject a clock or time provider so tests can fix “now” and move across exact boundaries. If randomness matters, use a seeded generator and record the seed on failure so the case is reproducible. Sleeping introduces scheduler and machine-speed variability; prefer advancing a controllable clock or awaiting an explicit signal.

## Test doubles have different jobs

A **stub** supplies answers to the SUT. A **mock** sets expectations and verifies interactions. A **fake** is a lightweight working implementation, such as an in-memory repository. A **spy** records calls for later inspection. A **dummy object** fills a parameter that the test does not use. These categories describe roles; libraries may combine capabilities.

The test seam is the point where a dependency can be replaced or observed. Dependency injection is one seam, but interfaces, delegates, clocks, adapters, and explicit constructor parameters can also create seams. Introduce seams around volatile or external collaborators, not every class by default. Too many doubles can create a test that repeats the production implementation’s assumptions without exercising meaningful behavior.

## Hermetic tests are repeatable by construction

A hermetic test controls its inputs and dependencies so results do not depend on network, filesystem state, time, locale, machine load, or another test. Hermeticity improves speed and reproducibility. It does not mean every test must use mocks; a small in-memory fake can be more realistic and deterministic than many interaction expectations.

Test isolation means a test passes alone, after any other test, and under the intended parallel runner. An order-dependent test usually shares mutable state, uses a non-reset singleton, assumes prior data, or leaks resources. Record random seeds, use temporary isolated directories, restore global settings, and ensure async work completes before cleanup.

# Mechanisms and relationships

For an input domain, begin with behavior partitions:

| Partition | Example for a minimum of 100 | Question |
| --- | --- | --- |
| Below boundary | 99 | Is benefit withheld? |
| Exact boundary | 100 | Is the condition inclusive? |
| Above boundary | 101 | Is benefit applied? |
| Invalid domain | Negative amount | Is input rejected or normalized? |

Then decide what to replace. If a service needs an eligibility answer, a stub can control that response. If a result must send exactly one notification, a mock/spy may verify the interaction. If repository semantics matter, an in-memory fake may be preferable to a mock, but the database behavior itself needs an integration test.

# Worked examples

```csharp
public sealed class ShippingPolicy(decimal freeThreshold)
{
    public decimal Calculate(decimal subtotal) =>
        subtotal >= freeThreshold ? 0m : 8m;
}

public class ShippingPolicyTests
{
    [Theory]
    [InlineData(99.99, 8.00)]
    [InlineData(100.00, 0.00)]
    [InlineData(100.01, 0.00)]
    public void Shipping_cost_reflects_free_threshold(decimal subtotal, decimal expected)
    {
        var sut = new ShippingPolicy(100m);

        decimal actual = sut.Calculate(subtotal);

        Assert.Equal(expected, actual);
    }
}
```

This example uses xUnit.net v3-style attributes, but the design is framework-independent. The parameterized cases cover below, exact, and above the threshold. If negative subtotals are invalid, define that as a separate behavior and add an explicit rejection test. The test observes the returned shipping cost rather than asserting private branching.

# Misconceptions and edge cases

- A unit is not necessarily one class or one method; it is a behavior boundary.
- One behavior per test does not mean exactly one assertion.
- Mocks are not inherently better than fakes; choose based on the contract under test.
- A passing test with a fake does not prove a real database or network behaves identically.
- Shared fixture reuse is not free; shared mutable state makes order and parallelism fragile.
- Disabling parallel tests can hide a race and slow the suite without solving the shared state.
- A random test is not reproducible unless its seed and generated case are captured.
- An injected clock is better than sleeps for testing time boundaries.
- Interaction verification is appropriate for required external effects, not every internal call.
- Test names and failure messages are part of maintainability and diagnostic value.

# Knowledge checks with answers

1. What should a unit test assert first? **An observable result/state that expresses the behavior contract.**
2. When is interaction verification justified? **When the interaction itself is required behavior, such as preventing duplicate payment or sending one required message.**
3. What is a stub’s main role? **Supplying controlled responses to the SUT.**
4. Why can shared fixtures cause flakiness? **Mutable shared state, lifecycle leakage, and parallel/order interactions can make results depend on other tests.**
5. How can a random failure be reproduced? **Record the seed and generated case, then rerun that exact input.**
6. What is coordinated by a deterministic clock seam? **The current time seen by the code, enabling repeatable boundary tests without waiting.**

# Sources

[Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices) · [Microsoft testing overview](https://learn.microsoft.com/en-us/dotnet/core/testing/) · [xUnit v3 getting started](https://xunit.net/docs/getting-started/v3/getting-started)
