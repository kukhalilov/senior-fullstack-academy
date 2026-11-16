# unit tests assertions fixtures mocks stubs fakes and isolation — Exercises and worked solutions

# Goals

- Design focused unit tests around behavior rather than implementation details.
- Choose positive, negative, equivalence-partition, and boundary cases deliberately.
- Select stubs, mocks, and fakes according to what the test needs to control or verify.
- Make async fixtures, clocks, randomness, and cleanup deterministic.

# Worked example

Suppose a shipping policy grants free shipping when a subtotal is at least 100. The observable contract is the returned shipping cost. A parameterized test covers 99.99, 100.00, and 100.01 to verify below, exact, and above the boundary. It uses a state-based assertion on the returned cost. It does not assert which private conditional or helper ran. If the business rule also rejects negative subtotals, that is a separate negative behavior with a clear expected exception/result.

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
    public void Shipping_cost_reflects_threshold(decimal subtotal, decimal expected)
    {
        var sut = new ShippingPolicy(100m);

        decimal actual = sut.Calculate(subtotal);

        Assert.Equal(expected, actual);
    }
}
```

# Exercises

## Exercise 1: choose behavior partitions

A password reset token is valid until its expiration timestamp. List at least four deliberate cases, including time boundaries. Which fixture seam makes these tests deterministic?

## Exercise 2: choose an assertion style

A service calculates a refund and should enqueue a receipt email only when the refund succeeds. Which outcomes should be checked with state assertions, and which interaction might be verified? Explain why verifying every internal repository call would be over-specified.

## Exercise 3: choose a double

A pricing service depends on an exchange-rate provider. For each test goal, choose a stub, fake, mock, or spy: (a) supply a fixed exchange rate; (b) verify an alert is sent once after invalid pricing data; (c) exercise multiple reads/writes against a lightweight in-memory customer store; (d) capture the exact message for inspection.

## Exercise 4: diagnose order-dependent tests

Test A changes `CultureInfo.CurrentCulture` and passes alone. Test B parses a decimal and passes alone. The full suite sometimes fails only under parallel execution. Identify likely shared state and a robust repair.

## Exercise 5: choose fixture scope

Creating a database container for each test takes 8 seconds. A team proposes one global mutable database fixture shared by every test. Compare per-test setup, a shared immutable fixture, and a shared mutable fixture. Which one is appropriate for unit tests, and which belongs in integration testing?

## Exercise 6: evaluate strict mock usage

A test configures a strict mock for every dependency and fails when a logging method is added. Does this indicate a regression? How would you redesign the test?

## Exercise 7: reproduce random failures

A property-like test generates random inputs and fails once in CI but cannot reproduce locally. What information should be logged and what controls should be added?

# Progressive hints

1. Test clearly valid, clearly expired, just before, exactly at, and just after expiration; define whether equality counts as valid.
2. Refund amount/result is state; sending the required receipt may be a meaningful interaction; incidental repository read order is usually implementation detail.
3. Stub supplies response; mock verifies required call; fake implements lightweight stateful behavior; spy records behavior for later inspection.
4. Culture is process-wide or execution-context state depending on use; restore it in `finally`/cleanup and use explicit culture in parsing behavior.
5. The fast unit suite should not start a database container; real DB semantics belong in integration tests. Shared integration resources require isolated data and cleanup.
6. Logging is usually not part of the service contract; assert returned refund and the required receipt behavior only.
7. Capture seed, generated input, framework/runtime versions, environment, and test name; allow deterministic seed replay.

# Complete solutions

## Exercise 1 solution

Cases include: token expires in the future; token expired in the past; timestamp just before expiration; exactly at expiration; just after expiration; malformed/missing timestamp if the API accepts such inputs. The rule must define whether `now == expiresAt` is valid. Inject a deterministic clock/time provider and set it to fixed instants so the tests do not sleep or race with wall-clock time.

## Exercise 2 solution

Assert the calculated refund amount/result and resulting refund state. Verify one receipt enqueue only if that enqueue is required observable behavior; verify no receipt on rejected/failed refund if absence is contractual. Repository call ordering/count is over-specified unless the contract explicitly requires it (for example, a transaction must prevent double refund). The test should not fail merely because implementation adds a cache or combines reads.

## Exercise 3 solution

(a) A stub returns the fixed exchange rate. (b) A mock can verify that the alert collaborator received exactly one required call. (c) A fake is appropriate when the test needs stateful customer reads/writes with predictable semantics. (d) A spy or capturing fake records the message for state/content assertions. A spy that records is often more useful than verifying many calls with strict mocks.

## Exercise 4 solution

Both tests mutate ambient culture and can interfere, especially if culture is process-wide or the work crosses execution contexts unexpectedly. Save the previous culture and restore it in guaranteed cleanup, including on assertion failure. Better, pass an explicit culture to parsing code or inject culture/time/configuration so the behavior does not depend on ambient mutable state. Run the tests in parallel after eliminating shared mutation; disabling parallelism only hides the design issue.

## Exercise 5 solution

For unit tests, use deterministic stubs/fakes and do not create a database container. For integration tests that require database semantics, a per-test container maximizes isolation but is slow. A shared immutable container/service can amortize startup while each test uses a unique schema/database/transaction or cleans isolated data. A shared mutable dataset where tests update the same rows is order-dependent and unsafe under parallelism. The team should measure and choose a resource lifecycle without conflating integration tests with unit tests.

## Exercise 6 solution

Usually adding logging should not break behavior, so the failure signals over-specified mock expectations. Replace broad strict interaction checks with observable output/state assertions and only verify required effects. If the test specifically validates an audit log or diagnostic event contract, assert that behavior in a focused test. Strict mocks can be useful for a narrow boundary where unexpected calls are dangerous, but are not a default for every collaborator.

## Exercise 7 solution

Log the random seed, exact generated input, test name, runtime/framework/OS, and any state that changes the behavior. Use a seeded generator and a way to replay the seed/case. Minimize irrelevant dependencies and preserve the failing case as a regression test. Avoid logging sensitive generated data into public CI logs.

# Tests and edge cases

- Exact expiration boundary: define inclusive/exclusive behavior and test equality.
- Floating-point amounts: use a representation and comparison tolerance appropriate to the contract; decimal currency may be preferable, but rounding rules still need tests.
- Async mock/stub operation: await the returned task and use async assertion forms.
- Cleanup failure: ensure cleanup does not silently hide the original test failure.
- Shared fixture: test with randomized order and parallel execution to expose hidden state.
- Mocked repository: remember it does not validate SQL, transaction isolation, provider behavior, or mappings.
- Seeded randomized run: verify the same seed reproduces the same input sequence.
- Negative path: assert harmful side effects did not happen where that absence is contractual.

# Reflection questions

- Which collaborator in your current code genuinely needs a test seam, and what behavior will the test prove?
- Which interactions are part of the public contract, and which are incidental?
- What ambient global state can make your tests flaky?
- What test should be a unit test, and what test must run against a real integration boundary?
- Can a future reader understand the expected behavior from the test name and failure message?

# Sources

[Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices) · [xUnit v3 getting started](https://xunit.net/docs/getting-started/v3/getting-started) · [Moq](https://github.com/devlooped/moq) · [NSubstitute received calls](https://nsubstitute.github.io/help/received-calls/)
