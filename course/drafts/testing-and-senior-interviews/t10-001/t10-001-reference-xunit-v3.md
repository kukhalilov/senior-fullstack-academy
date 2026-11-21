# unit tests assertions fixtures mocks stubs fakes and isolation — Reference: xUnit.net v3 test declarations, data, assertions, and fixtures

# Scope and version

This lesson covers only the supplied xUnit.net v3 names and common semantics. Do not copy v2 package/setup assumptions into v3; package boundaries and runner configuration differ. The current v3 documentation was checked 2026-11-17. [xUnit v3 getting started](https://xunit.net/docs/getting-started/v3/getting-started) [What's new in v3](https://xunit.net/docs/getting-started/v3/whats-new) [v3 packages](https://xunit.net/docs/nuget-packages-v3)

# How this group fits the mental model

xUnit.net identifies tests through attributes, supplies data for repeated cases, manages fixture lifecycle, and exposes assertions. A data attribute chooses test inputs; a fixture chooses resource lifetime; an assertion checks the behavioral contract. Keep those concerns separate so test intent remains visible.

# Supplied names explained

## Test declarations and data

- `xUnit.net v3` — The current major line of xUnit.net with v3-specific framework, assertion, and runner packages. Use v3 documentation and compatible runners rather than assuming the v2 package layout.
- `[Fact]` — Marks a single test with no external theory data. Use it for one behavior/example with fixed setup.
- `[Theory]` — Marks a parameterized test executed with one or more supplied data rows. Each row should represent a deliberate input case, not an arbitrary collection that obscures behavior.
- `[InlineData]` — Supplies literal argument values directly on a theory. It is convenient for small, readable input/output sets.
- `[MemberData]` — Supplies theory data from a static member, useful for structured or generated cases. Keep data names and failure output diagnosable.
- `[ClassData]` — Supplies theory cases from a class implementing the framework’s data-source contract. It can organize larger reusable datasets but should not hide the test’s important cases.
- `TheoryData<T>` — A strongly typed data container for theory inputs, including multi-parameter generic forms. It helps catch data-shape mistakes at compile time and can make data setup clearer.

## Fixtures and lifetime

- `IClassFixture<TFixture>` — Creates a fixture shared by tests in one test class. Use for expensive immutable setup; do not store per-test mutable state there without isolation/reset.
- `ICollectionFixture<TFixture>` — Shares a fixture across classes in the same test collection. This can amortize expensive setup but increases risk from shared state and collection-level serialization.
- `CollectionDefinitionAttribute` (`[CollectionDefinition]`) — Marks a class that names/configures a test collection and declares its collection fixture types by implementing `ICollectionFixture<TFixture>`. It is an attribute/class convention, not a generic `ICollectionDefinition<T>` interface. Test classes join that scope with `[Collection("name")]`.
- `AssemblyFixtureAttribute` (`[assembly: AssemblyFixture(typeof(TFixture))]`) — xUnit.net v3 feature for sharing one fixture instance across test classes in the assembly. It does not create the same collection-level parallelization boundary as collection fixtures, so the fixture must be safe for concurrent use or parallelism must be configured deliberately.
- `IAsyncLifetime` — xUnit’s async setup/cleanup lifecycle contract for test classes or fixtures. It lets asynchronous resources initialize/dispose without blocking on `.Result` or `.Wait()`.
- `IAsyncLifetime.InitializeAsync` — The asynchronous initialization hook of `IAsyncLifetime`. Allocate external or async resources here and fail setup clearly if they cannot be created.
- `IAsyncLifetime.DisposeAsync` — The asynchronous cleanup hook of `IAsyncLifetime`. Release owned resources even after test failure and avoid leaving state for later tests.
- `IAsyncDisposable` — The .NET interface for asynchronous disposal. It is appropriate for resources whose cleanup is asynchronous; xUnit can integrate async lifetimes according to its v3 contracts.

## Assertions

- `Assert.Equal` — Checks equality between expected and actual values, with overload behavior depending on types such as sequences. Prefer it to an opaque boolean check because failure output identifies the values.
- `Assert.NotEqual` — Checks that expected and actual values differ. Ensure the chosen equality semantics match the contract.
- `Assert.True` — Asserts a boolean condition is true. Use it for a genuinely boolean property and provide diagnostic context where the condition could fail ambiguously.
- `Assert.False` — Asserts a boolean condition is false. It is clearer than negating a generic expression in a custom assertion.
- `Assert.Null` — Asserts the value is null. Use only when null is the expected contract outcome, not as a proxy for “not found” without context.
- `Assert.NotNull` — Asserts a value is non-null and can communicate a precondition for subsequent assertions. Prefer direct meaningful assertions when they produce better failure detail.
- `Assert.Throws<TException>` — Asserts that the action throws the specified exception type according to the API’s exact-type semantics. Capture the returned exception to check meaningful details when required.
- `Assert.ThrowsAsync<TException>` — Async counterpart for an awaited operation that should fail. Return/await the task so exceptions are observed by the test runner.
- `Assert.Contains` — Checks that an item or substring is contained in a collection/string using an applicable overload. Make the expected collection and comparison semantics explicit.
- `Assert.Collection` — Asserts a collection has the expected sequence/size and applies assertions to each element. It is useful when ordering and complete membership are part of the contract.
- `Assert.All` — Applies an assertion to every item in a collection. It does not by itself assert a particular count or ordering.
- `Assert.Single` — Asserts a collection contains exactly one element and returns that element for further checks. It detects both empty and multiple-element outcomes.
- `Assert.Empty` — Asserts a collection or supported sequence is empty. Distinguish an empty result from null or missing data if those states have different meaning.

# Cross-item comparison

| Mechanism | Data/lifetime | Best use |
| --- | --- | --- |
| `[Fact]` | Fixed case | One example of a behavior |
| `[Theory]` + `[InlineData]` | Literal rows | Small parameterized boundary set |
| `[MemberData]` / `[ClassData]` | Externalized rows | Structured or reusable datasets |
| `IClassFixture<TFixture>` | Per class | Expensive class-local shared setup |
| `ICollectionFixture<TFixture>` | Across collection | Expensive setup intentionally shared across classes |
| `AssemblyFixtureAttribute` | Across assembly | Setup shared across all classes; fixture must account for parallel tests |

Fixture sharing and test parallelism are related: collections define isolation/serialization boundaries, but shared mutable objects still require careful state ownership. For small test inputs, inline data is easier to inspect; for complex values, typed data sources provide structure.

# Examples

```csharp
public class ShippingPolicyTests
{
    [Theory]
    [InlineData(99.99, 8.00)]
    [InlineData(100.00, 0.00)]
    public void Shipping_cost_changes_at_threshold(decimal subtotal, decimal expected)
    {
        var sut = new ShippingPolicy(100m);

        Assert.Equal(expected, sut.Calculate(subtotal));
    }
}
```

For an async resource, implement `IAsyncLifetime` or use `IAsyncDisposable` according to the fixture shape and xUnit v3 contract; avoid sync-over-async cleanup. The exact package setup depends on the selected runner and target framework.

# Common mistakes

- Mixing v2 setup instructions/packages with v3 packages.
- Sharing mutable state in a class or collection fixture and assuming each test gets a fresh instance.
- Putting too many unrelated cases into one opaque data source.
- Using `Assert.True(actual == expected)` and losing equality failure detail.
- Failing to await an async operation in `Assert.ThrowsAsync<TException>`.
- Assuming `Assert.All` checks order or collection size.
- Blocking on async fixture initialization/cleanup with `.Wait()` or `.Result`.
- Treating a shared fixture as a reason to disable all parallelism globally.

# Knowledge checks with answers

1. When is `[Fact]` preferable to `[Theory]`? **For a single fixed case without a data-driven behavior matrix.**
2. Which data form is useful for a small literal boundary set? **`[Theory]` with `[InlineData]`.**
3. What risk does `ICollectionFixture<TFixture>` add? **State can be shared across test classes, causing coupling or concurrency issues.**
4. Does `Assert.All` guarantee collection order or count? **No; use assertions suited to count/order when those are contractual.**
5. Why use `Assert.ThrowsAsync<TException>`? **It awaits the operation and asserts the expected async exception rather than allowing an unobserved task failure.**

# Sources

[xUnit v3 getting started](https://xunit.net/docs/getting-started/v3/getting-started) · [What's new in xUnit v3](https://xunit.net/docs/getting-started/v3/whats-new) · [xUnit v3 package guide](https://xunit.net/docs/nuget-packages-v3)
