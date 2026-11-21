# unit tests assertions fixtures mocks stubs fakes and isolation — Big-picture orientation and mental model

# Problem and purpose

Unit tests are fast, focused checks of behavior that help a team change code without repeatedly rediscovering what it is supposed to do. A unit is a design boundary, not necessarily one method or class. The key is that a test’s setup, action, and observable result remain understandable and dependable.

Good tests are executable examples of behavior. They catch regressions, help clarify edge cases, and make dependencies visible. Poor tests do the opposite: they fail for irrelevant implementation changes, depend on shared state or environment, or verify so many interactions that nobody can tell what contract they protect.

# Plain-language mental model

Imagine testing a vending machine. You insert a specific amount, select an item, and observe whether the item and correct change are returned. You do not need to assert which internal gears turned unless the gear behavior itself is the requirement. A unit test similarly supplies deliberate inputs, invokes the behavior, and checks an outcome that matters to a caller.

Test doubles are stand-ins for collaborators. A stub supplies a planned answer; a mock verifies an interaction; a fake is a lightweight working implementation; a spy records what happened; a dummy fills a parameter that is irrelevant to the test. Pick a double for the role it serves, not because a mocking library is available. Prefer checking state/result; verify calls only when the interaction is part of the contract.

# How the parts fit together

```text
behavior requirement
  └─ test case chooses meaningful input and conditions
       └─ fixture builds an isolated context
            └─ arrange dependencies and test doubles
                 └─ act once on the system under test
                      └─ assert an observable contract
                           └─ dispose/cleanup so the next test is independent
```

Arrange-Act-Assert and Given-When-Then are organizational patterns, not framework mandates. A fact/test is one check with fixed data; a theory/data test applies the same behavior to a deliberate set of inputs. Setup may be per test or shared. Shared fixtures reduce expensive setup but can create state leakage, ordering dependence, concurrency races, and hidden coupling.

Framework and platform are different layers. xUnit.net, MSTest, NUnit, and TUnit define test-writing models and discovery conventions. VSTest and Microsoft.Testing.Platform (MTP) run tests and integrate tools. Current Microsoft guidance says to choose one platform consistently within a solution/run configuration; mixing VSTest-based and MTP-based .NET test projects in one solution/run configuration is unsupported. TUnit is built on MTP and does not support VSTest. [Microsoft test-platform overview](https://learn.microsoft.com/en-us/dotnet/core/testing/test-platforms-overview) [TUnit attributes](https://tunit.dev/docs/comparison/attributes/)

# Concept map

| Decision | Preferred starting point | Risk to manage |
| --- | --- | --- |
| Test the behavior | Public observable result | Avoid coupling to private implementation |
| Vary input | Parameterized test for one rule | Avoid hiding distinct behavior in a giant data table |
| Isolate a collaborator | Appropriate stub/fake/mock | Avoid replacing so much that the test only verifies its own setup |
| Share setup | Use a fixture when setup is expensive and immutable | Prevent mutable state/order dependency |
| Handle time/randomness | Inject a deterministic seam or record a seed | Avoid sleeps and irreproducible failures |
| Run in parallel | Keep tests independent and cleanup complete | Identify process-wide state and external resources |

The test name should describe behavior and expected outcome, not merely the method name. Positive, negative, and boundary cases expose different contract edges. Equivalence partitioning groups inputs expected to behave alike, so a small deliberate suite can cover meaningful classes without listing every possible value.

# End-to-end walkthrough

Consider a discount policy that applies free shipping when an eligible cart reaches a minimum. A focused test constructs a cart just below the threshold and expects shipping to remain charged; another uses the exact boundary and expects free shipping. The test arranges the policy and its inputs, acts once by calculating the total, then asserts the observable total and a relevant decision result. A separate test covers an ineligible customer. It does not verify every private helper call because those calls are implementation details.

If eligibility comes from a collaborator, a stub can return “eligible” or “not eligible” for a specific input. A mock verification is appropriate only if the required behavior includes a side effect, such as exactly one payment authorization after the discount is accepted. The fixture is created per test or immutable and shared safely. The clock is injected rather than sleeping until a date changes. [Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)

# When to use it and tradeoffs

Use unit tests for deterministic behavior that can be exercised quickly at a narrow boundary. Use integration tests when correctness depends on real framework, database, network, serialization, or transaction behavior; those belong to the later testing topics. A unit test with a fake can prove your code’s handling of a collaborator contract, but cannot prove the real database honors that contract.

The more behavior a test covers, the more realistic the integration may be, but setup and failures can be slower and harder to localize. A mock makes a dependency response controllable but can overspecify call order. A fake is more realistic but may implement only a subset of production semantics. Choose the simplest substitute that lets the test make a meaningful assertion.

# What later lessons cover

The concepts lesson deepens test boundaries, fixture lifetime, and determinism. Reference lessons cover behavior-focused design, xUnit.net v3, MSTest v4/NUnit 4/TUnit, and test doubles with Moq/NSubstitute. Practice builds tests and diagnoses isolation failures. Interview preparation covers test strategy and framework tradeoffs. The inventory intentionally excludes every framework overload and every platform command-line option.

# Recent version changes

This curriculum snapshot, checked 2026-11-17, covers xUnit.net v3, MSTest v4, NUnit 4, and TUnit. Framework and platform versions are separate: current Microsoft documentation lists VSTest and Microsoft.Testing.Platform as platform choices, with different compatibility tradeoffs. TUnit is MTP-based and does not support VSTest. Consult the exact framework/platform package versions for project setup. [Platform comparison](https://learn.microsoft.com/en-us/dotnet/core/testing/test-platforms-overview) [xUnit v3 changes](https://xunit.net/docs/getting-started/v3/whats-new) [TUnit attributes](https://tunit.dev/docs/comparison/attributes/)
