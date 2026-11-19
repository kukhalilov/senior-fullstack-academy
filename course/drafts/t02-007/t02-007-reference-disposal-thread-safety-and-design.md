# Microsoft dependency injection registrations lifetimes scopes disposal and keyed services — Reference: Ownership, sync/async cleanup, concurrency, and container boundaries

## Scope and version

This group covers container ownership and service-owned concurrency. In .NET 11 the built-in provider attempts every captured disposal in reverse capture order; multiple failures are reported as AggregateException. [DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines) [.NET 11 disposal behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)

## How this group fits the mental model

The container tracks objects it creates. Scopes/providers are cleanup owners; callers should not manually dispose resolved dependencies. Provider resolution is thread-safe, but service state is not automatically protected. Avoid throwing cleanup code where possible and inspect all aggregated failures.

## Supplied names explained

- `IDisposable service cleanup` — Container invokes synchronous cleanup for container-created instances at the owning boundary.
- `IAsyncDisposable service cleanup` — Use DisposeAsync/async scopes to await asynchronous resource release.
- `Container-owned service disposal` — The container owns disposal for objects it constructs and captures.
- `Factory result disposal ownership` — A factory's returned service is tracked and disposed by the container even when the factory obtained the object elsewhere; do not return an object with a separate owner.
- `Externally-owned instance disposal` — The code supplying an already-created instance generally remains responsible for cleanup.
- `Transient disposable capture` — Disposable transient results are retained by the resolving scope/provider so the container can dispose them later.
- `Disposable transient in root scope` — Root resolution can retain each disposable transient until application shutdown, causing unbounded growth.
- `Scoped disposable cleanup` — Disposed when its owning scope ends.
- `Singleton disposal at provider shutdown` — Container-created singleton is disposed when the root provider shuts down.
- `IServiceProvider.Dispose` — Synchronously disposes the provider and container-owned disposable service graph.
- `IServiceProvider.DisposeAsync` — Asynchronously disposes the provider graph and awaits async cleanup.
- `ServiceProvider.Dispose` — Built-in root provider synchronous cleanup; in .NET 11 it attempts every captured service after failures.
- `ServiceProvider.DisposeAsync` — Built-in root provider async cleanup; in .NET 11 it attempts every captured service after failures.
- `AsyncServiceScope.DisposeAsync` — Asynchronously disposes the services captured by that scope.
- `Synchronous disposal of async-only service throws InvalidOperationException` — Calling synchronous provider/scope disposal when a captured service implements `IAsyncDisposable` but not `IDisposable` throws; use `DisposeAsync`/`await using` so async cleanup is awaited.
- `Reverse capture-order disposal` — Cleanup runs in reverse order that disposable services were captured/resolved.
- `Multiple disposal exceptions` — In .NET 11, all captured disposables are attempted; multiple failures are combined in AggregateException.
- `AggregateException during provider disposal` — .NET 11 reports multiple disposal failures together; inspect InnerExceptions and do not assume cleanup stopped at the first.
- `Thread-safe service resolution` — Built provider/scope can resolve concurrently; this guarantee applies to resolution, not returned instances.
- `Service instance thread safety` — Implementation responsibility; shared mutable state needs synchronization or immutable design.
- `Singleton thread-safety requirement` — Singletons can serve concurrent requests; protect mutable state and review transitive dependencies.
- `Singleton shared mutable state` — Unsynchronized shared state can race across callers even though DI resolution itself is safe.
- `Transient service state isolation` — New resolution instance reduces sharing but can still be shared when captured by a longer-lived owner.
- `Scoped service cross-request isolation` — Distinct scopes receive distinct scoped instances; operations within one scope may still share concurrently.
- `Async factory registration unsupported` — Container factories are synchronous; resolve then perform asynchronous initialization/operations explicitly.
- `Async constructor unsupported` — Constructors cannot await; keep creation synchronous and expose async methods for I/O.
- `Resolve then initialize asynchronously` — Resolve dependencies synchronously, then await a separate initialization call with cancellation/error handling.
- `Build a second service provider anti-pattern` — Creates duplicate singleton objects and competing disposal ownership; build once through the host.
- `Register request data in IServiceCollection anti-pattern` — Service registrations are app composition, not a store for mutable per-user/request state.
- `Injecting many dependencies design warning` — A very large constructor may indicate too many responsibilities; split cohesive behavior rather than hiding dependencies.
- `Service registration module` — Group related registrations in an IServiceCollection extension method with an explicit, repeatable contract.
- `IServiceCollection extension method registration` — Reusable composition helper; use TryAdd variants when library registration must preserve consumer overrides.
- `Container replacement extension point` — Use IServiceProviderFactory/host integration when a required capability exceeds the built-in container.
- `Autofac service provider integration` — Third-party container integration for capabilities such as child containers or property injection; it replaces the provider through host integration.
- `Scrutor decoration (third-party library)` — Third-party extension providing scan/decoration conveniences; it is not built into the default container.
- `Service decoration not built into default container` — Wrap an implementation explicitly or add a decoration library; default registrations do not automatically decorate.
- `Disposing resolved dependency manually anti-pattern` — Container retains ownership and will dispose it; manual disposal can break later consumers and cause double cleanup.
- `Captive disposable dependency` — A long-lived owner holds a shorter-lived disposable beyond its intended cleanup boundary.
- `Singleton captures transient` — The transient is effectively retained for singleton lifetime; inspect thread safety and resource duration.
- `Scoped service in singleton background worker` — Worker should retain IServiceScopeFactory and resolve scoped services inside a bounded scope per work item.
- `IDisposable transient factory pattern` — Create short-lived disposable outside container ownership, then dispose it at the explicit operation boundary.
- `Factory-owned limited-lifetime disposable` — Factory/caller owns and disposes a separately created object when its lifetime is shorter than the DI scope.
- `Scope-controlled shared disposable` — Register as scoped when several collaborators share it for one bounded operation; let the scope dispose it.

## Cross-item comparison

The container owns and tracks services constructed from implementation types and results returned by registration factories; an object supplied through an instance-registration overload remains externally owned. A factory result is treated as container-owned even if the factory returns an object it obtained elsewhere, so avoid returning an object with another owner. Sync scope disposal invokes synchronous cleanup; async scope disposal awaits async cleanup. Singleton and root instances survive to provider shutdown. Resolution safety is not object safety. Since .NET 11, failures do not stop remaining disposal attempts; a single failure is rethrown and multiple failures aggregate.

Prefer async disposal when any captured service requires it. The built-in provider cannot synchronously dispose an async-only service; attempting sync disposal throws rather than silently skipping its asynchronous cleanup.

## Examples

An async scope owns cleanup for its resolved graph:
```csharp
await using (var scope = provider.CreateAsyncScope())
{
    var worker = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
    await worker.ExecuteAsync(cancellationToken);
}
```
Do not separately dispose `worker` if the container created and owns it. If several dependencies throw during scope disposal on .NET 11, the container still attempts all of them and reports multiple failures through `AggregateException`. [.NET 11 disposal behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)

## Common mistakes

Do not manually dispose a container-owned dependency. Do not assume a transient disposable is immediately released. Do not assume singleton registration synchronizes service state. Handle both a single cleanup exception and `AggregateException` on .NET 11; all captured resources are attempted, so cleanup should be idempotent and failures logged with their inner details.

## Knowledge checks with answers

1. **Who disposes a container-created scoped service?** Its scope.  2. **Does thread-safe resolution make a singleton safe?** No.  3. **Why use async scope disposal?** To await `IAsyncDisposable` dependencies.  4. **What happens after a disposal throws on .NET 11?** Remaining captured services are still attempted.  5. **How are multiple disposal failures reported?** As `AggregateException`.

## Sources

[DI guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/guidelines)
[.NET 11 disposal behavior](https://learn.microsoft.com/en-us/dotnet/core/compatibility/extensions/11/dependency-injection-disposal-exceptions)
