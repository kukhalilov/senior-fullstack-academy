# unit tests assertions fixtures mocks stubs fakes and isolation — Reference: Test doubles, verification tradeoffs, and deterministic fixtures

# Scope and version

This lesson explains the supplied test-double roles and the explicitly listed Moq and NSubstitute APIs. The APIs are intentionally a bounded subset, not a catalog of either library. Official project documentation and package references checked 2026-11-17. Prefer interfaces for substitutes, verify only contractual interactions, and make fixture state deterministic. [Moq project](https://github.com/devlooped/moq) [NSubstitute creating substitutes](https://nsubstitute.github.io/help/creating-a-substitute/) [NSubstitute received calls](https://nsubstitute.github.io/help/received-calls/)

# How this group fits the mental model

A test double controls or observes a collaborator so one behavior can be exercised in isolation. A double should make the test more meaningful, not replace the entire behavior being tested. State assertions are usually less coupled; interaction verification is justified when an effect itself is part of the contract.

# Supplied names explained

## Double roles and seams

- `Test double` — A generic term for a replacement object used in a test. Its purpose may be to return data, verify calls, record behavior, or provide a lightweight implementation.
- `Stub` — A double that returns controlled answers to the SUT. Use it to arrange conditions such as “repository returns this entity”; do not verify incidental stub calls.
- `Mock` — A double configured with expectations and usually verified for interactions. It is useful when a call/side effect is part of the requirement, but overuse couples tests to implementation details.
- `Fake` — A simplified working implementation, such as an in-memory repository. It can support realistic state interactions but may not reproduce transaction, concurrency, or provider behavior.
- `Spy` — A double or wrapper that records calls for later inspection. It can capture output or call count without prescribing every implementation step.
- `Dummy object` — A placeholder value passed only to satisfy a parameter that the test does not use. Make irrelevance clear; a misleading dummy can hide behavior dependencies.
- `Test seam` — A boundary where production behavior can be replaced, controlled, or observed in tests. Prefer seams around external/volatile collaborators rather than creating interfaces for every class by habit.
- `Dependency injection seam` — A seam created by passing collaborators into a component, commonly through constructor injection. It supports substitution and explicit dependencies but is not the only seam.
- `Behavior verification` — Checking that the SUT produced the required externally meaningful outcome. It can be state-based or interaction-based depending on the contract.
- `Over-specified interaction test` — A test that verifies incidental call order/count or internal collaboration beyond what the contract requires. It often fails after harmless refactoring.

## Moq subset

- `Moq Mock<T>` — A typed Moq wrapper that creates/provides a substitute for `T` and exposes setup, behavior, and verification APIs. Prefer mocking interfaces or overridable members that Moq can intercept.
- `Moq Mock<T>.Setup` — Configures how a selected member invocation on the mock behaves, such as returning a controlled value. A setup arranges the collaborator; it does not automatically prove the SUT used it correctly.
- `Moq Mock<T>.Verify` — Checks that a configured/selected invocation occurred with matching arguments and count. Verify only required effects; argument matchers should reflect the behavior contract.
- `Moq It.IsAny<T>` — An argument matcher accepting any value of type `T` in a setup or verification expression. It is convenient but can make expectations too broad when exact values matter.
- `Moq Times.Once` — A count expectation for one matching invocation in `Verify`. It is more precise than “at least once”; use it only when exactly one call is contractual.
- `Moq MockBehavior.Strict` — Configures a mock to fail on invocations that lack a matching setup. It can reveal unexpected calls but often makes tests brittle when incidental collaboration changes; strictness is not a substitute for a useful output assertion.

## NSubstitute subset

- `NSubstitute Substitute.For<T>` — Creates a substitute for an interface or suitable class. The project recommends interface substitution; class substitution only intercepts overridable virtual members, so non-virtual code may execute for real.
- `NSubstitute Arg.Any<T>` — An argument matcher for a call being configured or checked. Use it only in supported substitute expressions (for `Returns`, `Received`, callbacks, and related APIs), not as a normal argument passed to production code.
- `NSubstitute Received()` — Checks that a matching call was received at least once. For exact counts, use the count-taking form; plain `Received()` is not “exactly once.”
- `NSubstitute DidNotReceive()` — Checks that a matching call was not received. It is appropriate when the absence of a side effect is part of the contract.
- `NSubstitute Returns` — Configures a substitute call to return a chosen value (or value derived from arguments). Configure it on the substitute expression before exercising the SUT.

## Isolation and cleanup

- `Hermetic test` — A test whose result depends on controlled inputs rather than network, current time, locale, machine state, or another test. Hermeticity improves repeatability and speed.
- `Shared mutable fixture state` — Mutable data or resources reused across test cases. It creates order, concurrency, and cleanup risks; use per-test state or immutable shared setup where possible.
- `Cleanup and disposal` — Releasing resources after test execution, including when the assertion fails. Use deterministic disposal and ensure async cleanup is awaited by the framework lifecycle.

# Cross-item comparison

| Double | Provides answers | Verifies calls | Contains working behavior |
| --- | --- | --- | --- |
| Stub | Yes | Usually no | No, only configured responses |
| Mock | Yes, if configured | Yes | No, except configured behavior |
| Fake | Yes | Usually no | Yes, simplified implementation |
| Spy | May delegate/record | Can inspect records | Possibly, if wrapping a real collaborator |
| Dummy | No meaningful behavior | No | No |

Moq and NSubstitute can both configure return values and verify interactions, but their expression syntax and default behaviors differ. NSubstitute’s `Received()` means at least one matching call; Moq uses explicit count constraints such as `Times.Once`. With either library, prefer interfaces and verify only important interactions. [Moq](https://github.com/devlooped/moq) [NSubstitute calls](https://nsubstitute.github.io/help/received-calls/)

# Examples

```csharp
var repository = Substitute.For<IOrderRepository>();
repository.FindAsync(42, Arg.Any<CancellationToken>())
    .Returns(new Order(42));

var service = new OrderService(repository);
Order? result = await service.FindAsync(42, CancellationToken.None);

Assert.NotNull(result);
Assert.Equal(42, result.Id);
await repository.Received(1)
    .FindAsync(42, Arg.Any<CancellationToken>());
```

The state assertion verifies the returned order; the interaction check is useful only if the service contract requires exactly one lookup. If implementation may cache or batch lookups without changing behavior, remove the call-count assertion. The example uses an interface substitute because class substitutes can fail to intercept non-virtual members.

# Common mistakes

- Verifying every interaction and turning tests into copies of implementation control flow.
- Using `It.IsAny<T>`/`Arg.Any<T>` for arguments whose value matters to the behavior.
- Assuming `Received()` means exactly once; it means at least one matching call.
- Using strict mocks across broad object graphs and failing on harmless calls.
- Substituting a concrete class with non-virtual methods and assuming all members are intercepted.
- Passing `Arg.Any<T>` as a real method argument instead of using it inside a substitute configuration/verification expression.
- Building a fake that silently omits semantics the SUT depends on.
- Forgetting cleanup for shared files, servers, or mutable fixture state.

# Knowledge checks with answers

1. Which double supplies a lightweight real implementation? **A fake.**
2. What does `Moq Mock<T>.Setup` do? **Arranges a mock member’s behavior for matching invocations.**
3. What does `NSubstitute Received()` require? **At least one matching call; an exact count needs an explicit count.**
4. Why prefer interfaces when using NSubstitute? **Class substitution only intercepts overridable virtual members; non-virtual code may run for real.**
5. When should a strict mock be used? **When unexpected calls are themselves meaningful and the narrow expectation will not couple the test unnecessarily.**
6. What makes a test hermetic? **Its result depends on controlled test inputs, not uncontrolled external state.**

# Sources

[Moq project](https://github.com/devlooped/moq) · [NSubstitute creating substitutes](https://nsubstitute.github.io/help/creating-a-substitute/) · [NSubstitute argument matchers](https://nsubstitute.github.io/help/argument-matchers/) · [NSubstitute received calls](https://nsubstitute.github.io/help/received-calls/) · [Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
