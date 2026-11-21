# unit tests assertions fixtures mocks stubs fakes and isolation — Reference: Current MSTest, NUnit, and TUnit authoring surfaces

# Scope and version

This lesson explains only the listed authoring surfaces for MSTest v4, NUnit 4, and TUnit. Frameworks and test platforms are separate: Microsoft.Testing.Platform (MTP) and VSTest have different compatibility models. Current Microsoft documentation says not to mix VSTest-based and MTP-based .NET test projects in one solution/run configuration; TUnit is built on MTP and does not support VSTest. Checked 2026-11-17. [MSTest authoring](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests) [Platform overview](https://learn.microsoft.com/en-us/dotnet/core/testing/test-platforms-overview) [NUnit attributes](https://docs.nunit.org/articles/nunit/writing-tests/attributes.html) [TUnit attributes](https://tunit.dev/docs/comparison/attributes/)

# How this group fits the mental model

Framework attributes declare tests, provide data, control lifecycle, and expose assertions. Choose a framework based on team familiarity, supported platform/runner integrations, async/lifecycle needs, and migration cost. Do not infer that similarly named attributes behave identically across frameworks.

# Supplied names explained

## MSTest v4

- `MSTest v4` — A major version of Microsoft’s .NET testing framework. Follow the v4 package and platform guidance; framework version and runner platform are separate choices.
- `[TestClass]` — Marks an MSTest class that contains tests and optional lifecycle methods. Methods/classes must meet MSTest discovery rules.
- `[TestMethod]` — Marks an individual test method. Modern MSTest supports synchronous or asynchronous test returns under documented constraints; avoid `async void`.
- `[DataTestMethod]` — Marks a parameterized test method that runs with supplied data rows. It expresses one behavior over multiple inputs.
- `[DataRow]` — Supplies inline argument values for a data-driven MSTest case. Keep each row readable and describe non-obvious input meaning.
- `[DynamicData]` — Supplies data from a named member or provider. Use for structured cases that do not fit simple inline rows; keep the source deterministic and discoverable.
- `[TestInitialize]` — Marks per-test setup in a test class. It runs for each applicable test; setup should establish isolated state and avoid unrelated work.
- `[TestCleanup]` — Marks per-test cleanup. It should release resources even after failure and should not depend on test success.
- `[ClassInitialize]` — Marks class-level setup. Shared state created here can introduce test coupling; prefer immutable expensive resources and understand the method signature/lifecycle contract.
- `[ClassCleanup]` — Marks class-level cleanup. Current MSTest v4 uses end-of-class cleanup behavior; the removed configurable ClassCleanupLifecycle should not be relied on.
- `[DoNotParallelize]` — Prevents marked tests/classes/assemblies from running in parallel as supported by MSTest. Use only when shared resource constraints are real and document the reason; isolation is preferable.
- `TestContext` — MSTest’s test execution context for runtime information, logging, properties, and related test services. Its available capabilities depend on runner/platform and should not become hidden global state.
- `Assert.AreEqual` — Checks expected and actual values for equality. Supply arguments in the framework’s expected/actual order and use meaningful message/context for diagnostic failures.
- `Assert.ThrowsException<T>` — Asserts that an action throws the expected exception type according to MSTest’s API semantics. Use async-specific assertion forms for async operations and assert exception details only when part of the contract.

## NUnit 4

- `NUnit 4` — A major NUnit framework line with NUnit-specific attributes, assertions, and lifecycle. Match the framework with its adapter/runner and versioned documentation.
- `[TestFixture]` — Marks a class or type as a container for tests and fixture lifecycle. NUnit can infer fixtures in some cases, but explicit use makes intent clear.
- `[Test]` — Marks a test method. The method follows NUnit’s supported signatures and should check one coherent behavior.
- `[TestCase]` — Supplies a parameterized test case inline. Multiple cases execute the same method with deliberate inputs.
- `[TestCaseSource]` — Supplies cases from a source member/type. Keep generated cases stable and names/arguments diagnostic.
- `[SetUp]` — Marks per-test setup run before each test in the fixture. It should initialize only needed state and avoid hiding the scenario.
- `[TearDown]` — Marks per-test cleanup run after test execution. Release resources deterministically, including after assertion failures.
- `[OneTimeSetUp]` — Marks setup executed once for a fixture or suite scope. Shared mutable state can introduce order coupling.
- `[OneTimeTearDown]` — Marks one-time fixture/suite cleanup after contained tests. Do not assume cleanup timing beyond configured fixture lifecycle.
- `[SetUpFixture]` — Defines namespace-level setup/teardown applying to contained fixtures. Use sparingly because broad setup affects many tests and can hide dependencies.
- `[FixtureLifeCycle]` — Selects fixture instance lifecycle behavior. `InstancePerTestCase` can isolate instance state and enable more parallelism, while one shared fixture requires thread-safe state.
- `LifeCycle.InstancePerTestCase` — NUnit lifecycle option creating a fixture instance for each test case. It isolates instance fields but does not isolate static/global/external state.
- `[Parallelizable]` — Marks tests/fixtures eligible for parallel execution under NUnit’s configured parallelism. Eligibility does not guarantee a particular scheduling order.
- `Assert.That` — NUnit’s constraint-based assertion entry point. It combines an actual value with a readable constraint such as `Is.EqualTo`.
- `Assert.Multiple` — Collects multiple assertion failures in one test block so several related expectations can be reported together. Keep checks cohesive and avoid continuing after unsafe assumptions.
- `Is.EqualTo` — A constraint expressing expected equality for `Assert.That`. Use appropriate comparers/tolerance where the data contract requires them.
- `Does.Contain` — A constraint asserting a collection or string contains a value/pattern according to NUnit’s supported overloads. Make case/comparison semantics explicit when relevant.

## TUnit

- `TUnit` — A .NET test framework built on Microsoft.Testing.Platform with a code-oriented test model and attributes. Verify current platform, SDK, and IDE support when selecting it.
- `[Arguments]` — Supplies inline argument sets for a TUnit parameterized test. Use it for simple deterministic cases.
- `[MethodDataSource]` — Supplies test data from a method/member. It supports richer scenarios than inline arguments; data should remain reproducible and clearly named.
- `[ClassDataSource<TDataSource>]` — Supplies data or a data-source instance from a class. It can support shared setup, so define its lifecycle and mutability carefully.
- `[Before(Test)]` — Runs setup before each applicable TUnit test. Use it for per-test context and keep resource ownership clear.
- `[After(Test)]` — Runs cleanup after a test. It should release resources regardless of outcome and avoid masking the original failure.
- `[NotInParallel]` — Marks a test/group as not eligible for parallel execution in TUnit. Prefer isolation; use serialization only when the shared resource cannot safely be isolated.
- `TUnit TestContext` — Context information provided for a TUnit test execution, including test-specific values/services according to current framework APIs. Treat the context as runner-provided, not a global singleton.
- `Microsoft.Testing.Platform (MTP)` — A .NET test platform that executes test applications and provides extensibility/integration. It is distinct from test frameworks; TUnit is built on MTP, and current Microsoft guidance advises consistent platform choice per solution/run configuration.

# Cross-item comparison

| Behavior | MSTest v4 | NUnit 4 | TUnit | xUnit v3 |
| --- | --- | --- | --- | --- |
| Fixed test | `[TestMethod]` | `[Test]` | `[Test]` | `[Fact]` |
| Inline parameter data | `[DataTestMethod]` + `[DataRow]` | `[TestCase]` | `[Test]` + `[Arguments]` | `[Theory]` + `[InlineData]` |
| Per-test setup | `[TestInitialize]` | `[SetUp]` | `[Before(Test)]` | Constructor / async lifetime |
| Per-test cleanup | `[TestCleanup]` | `[TearDown]` | `[After(Test)]` | `IDisposable` / async lifetime |

The attributes have analogous purposes, not guaranteed identical lifecycle, discovery, or runner behavior. MTP and VSTest are execution platforms, not alternate test frameworks. MTP supports some modern execution scenarios and executable-first flows; VSTest has broader legacy integration and mixed-language adapter support. Choose one consistent platform for a solution/run configuration; do not mix project types in a single run configuration. [Platform comparison](https://learn.microsoft.com/en-us/dotnet/core/testing/test-platforms-overview)

# Examples

```csharp
[TestClass]
public class ShippingPolicyTests
{
    [DataTestMethod]
    [DataRow(99.99, 8.00)]
    [DataRow(100.00, 0.00)]
    public void Shipping_cost_reflects_threshold(decimal subtotal, decimal expected)
    {
        var sut = new ShippingPolicy(100m);
        Assert.AreEqual(expected, sut.Calculate(subtotal));
    }
}
```

This MSTest example demonstrates fixed inline values. Equivalent NUnit or TUnit syntax differs; avoid combining multiple frameworks’ attributes in one project just to make a test look familiar.

# Common mistakes

- Confusing test framework with test platform/runner.
- Assuming the same attribute implies exactly the same lifecycle across frameworks.
- Mixing MTP and VSTest projects in one solution/run configuration.
- Using `[DoNotParallelize]` or `[NotInParallel]` to hide shared-state design problems indefinitely.
- Treating class-level setup as per-test isolation.
- Using `Assert.Multiple` for unrelated behaviors with cascading invalid state.
- Copying old MSTest v3 setup while targeting MSTest v4.
- Selecting TUnit without verifying MTP and toolchain compatibility.

# Knowledge checks with answers

1. Is NUnit a test platform? **No; it is a test framework. VSTest and MTP are platforms.**
2. Which framework uses `[TestCase]` for inline cases in this lesson? **NUnit.**
3. What is TUnit built on? **Microsoft.Testing.Platform.**
4. What risk does `[ClassInitialize]` introduce? **Shared state can couple tests and cause order/parallel problems.**
5. What is current MSTest v4 cleanup guidance relevant here? **EndOfClass behavior is supported; the configurable ClassCleanupLifecycle was removed.**
6. Should MTP and VSTest test projects be mixed in a single run configuration? **No; current Microsoft guidance says that scenario is unsupported.**

# Sources

[MSTest tests](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests) · [MSTest lifecycle](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-lifecycle) · [Test platforms overview](https://learn.microsoft.com/en-us/dotnet/core/testing/test-platforms-overview) · [NUnit attributes](https://docs.nunit.org/articles/nunit/writing-tests/attributes.html) · [NUnit setup/teardown](https://docs.nunit.org/articles/nunit/writing-tests/setup-and-teardown.html) · [TUnit attribute comparison](https://tunit.dev/docs/comparison/attributes/)
