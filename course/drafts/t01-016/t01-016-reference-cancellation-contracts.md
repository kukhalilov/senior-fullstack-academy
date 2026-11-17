<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# async and await Task ValueTask cancellation and continuation context — Reference: Cooperative cancellation tokens, sources, registration, and cancellation exceptions

# Scope and version
This reference lesson covers the cooperative cancellation contracts within the C# asynchronous programming model. The assigned inventory group focuses strictly on cancellation tokens, sources, registration mechanisms, and cancellation exceptions under .NET 11 GA and C# 15 stable APIs checked 2026-11-14 (see https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtoken and https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtokensource). Thread creation, memory ordering, async streams, and HTTP cancellation are excluded from this scope.

# How this group fits the mental model
In asynchronous programming, work may finish later without forcing the caller's thread to wait. When an ongoing operation needs to be aborted before completion, C# relies on cooperative cancellation rather than forced thread termination. 

The architecture relies on two main roles:
1. **The Issuer/Controller (`CancellationTokenSource`)**: Owns the lifecycle of a cancellation signal, allows triggering cancellation manually, via a timeout, or linked to other tokens.
2. **The Observer (`CancellationToken`)**: Passed down to methods and worker operations so they can periodically check if cancellation was requested.

When cancellation is triggered, observing code throws an exception (such as `OperationCanceledException` or `TaskCanceledException`) to unwind the stack cleanly.

# Supplied names explained
* `CancellationToken`
  A struct that propagates notification that cancellation has been requested. It is passed to asynchronous methods to allow cooperative cancellation.
* `CancellationToken.None`
  A static readonly property returning a default, uncancelable `CancellationToken` instance whose `CanBeCanceled` value is `false`.
* `CancellationToken.CanBeCanceled`
  A boolean property indicating whether this token is capable of ever being in a canceled state.
* `CancellationToken.IsCancellationRequested`
  A boolean property that gets a value indicating whether cancellation has been requested for this token.
* `CancellationToken.ThrowIfCancellationRequested`
  A method that checks the token state and throws an `OperationCanceledException` immediately if cancellation has been requested.
* `CancellationToken.Register(Action)`
  Registers a delegate that is called when the `CancellationToken` is canceled, returning a `CancellationTokenRegistration`. The current `ExecutionContext` is captured; the current `SynchronizationContext` is not captured by this overload.
* `CancellationToken.Register(Action<Object>,Object)`
  Registers a delegate that accepts state data, called when the `CancellationToken` is cancelled.
* `CancellationToken.Register` overloads with `useSynchronizationContext`
  Additional overloads accept a Boolean controlling synchronization-context capture and, in current .NET, callbacks that also receive the token. The callback executes immediately and synchronously when registered against an already-canceled token.
* `CancellationToken.Register(Action,bool) overload`: Controls whether the current `SynchronizationContext` is captured for the callback.
* `CancellationToken.Register(Action<Object>,Object,bool) overload`: State-carrying callback overload with explicit synchronization-context capture behavior.
* `CancellationToken.Register(Action<Object,CancellationToken>,Object) overload`: State-carrying callback that also receives the token being canceled.
* `CancellationToken.Register immediate invocation when already canceled`: Registration against an already-canceled token invokes the callback synchronously on the registering call; callback exceptions escape from `Register`.
* `CancellationToken.UnsafeRegister`
  Registers a cancellation callback without capturing the current execution context, improving performance in low-level scenarios.
* `CancellationToken.WaitHandle`
  Gets a `WaitHandle` that is signaled when the token's cancellation is requested, useful for interoperability with legacy synchronization mechanisms.
* `CancellationTokenSource`
  A class that signals cancellation to one or more `CancellationToken` instances and manages their lifecycle.
* `CancellationTokenSource.Token`
  Gets the `CancellationToken` associated with this `CancellationTokenSource`.
* `CancellationTokenSource.IsCancellationRequested`
  Gets a value indicating whether cancellation has been requested for this source.
* `CancellationTokenSource.Cancel()`
  Communicates a request for cancellation synchronously.
* `CancellationTokenSource.Cancel(Boolean)`
  Communicates a request for cancellation synchronously, with a boolean flag controlling exception propagation from callbacks.
* `CancellationTokenSource.CancelAsync()`
  Initiates an asynchronous cancellation request introduced in .NET 8 (see https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtokensource.cancelasync).
* `CancellationTokenSource.CancelAfter(Int32)`
  Schedules a cancellation request after a specified delay given in milliseconds.
* `CancellationTokenSource.CancelAfter(TimeSpan)`
  Schedules a cancellation request after a specified delay given as a `TimeSpan`.
* `CancellationTokenSource.CreateLinkedTokenSource(CancellationToken)`
  Creates a new `CancellationTokenSource` that will be canceled when the specified token is canceled.
* `CancellationTokenSource.CreateLinkedTokenSource(CancellationToken,CancellationToken)`
  Creates a linked token source triggered when either of two specified tokens is canceled.
* `CancellationTokenSource.CreateLinkedTokenSource(CancellationToken[])`
  Creates a linked token source triggered when any token in an array is canceled.
* `CancellationTokenSource.CreateLinkedTokenSource(ReadOnlySpan<CancellationToken>)`
  Creates a linked token source triggered when any token in a read-only span is canceled (introduced in .NET 9, see https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtokensource.createlinkedtokensource).
* `CancellationTokenSource.TryReset()`
  Returns true only when cancellation has not been requested and resets the source for an unrelated operation. It is intended for the sole owner after the prior operation has completed, no one else can cancel it, and old registrations are no longer meaningful; concurrent cancellation and reset are unsafe. Existing token references still refer to this same source and observe its later state, so reuse can surprise earlier consumers.
* `CancellationTokenSource.Dispose()`
  Releases resources used by the source. Disposal does not request cancellation and must not race with active source operations.
* `CancellationTokenSource.Dispose(Boolean)`
  Protected disposal implementation point; callers use the public `Dispose()` method rather than calling this protected overload.
* `CancellationTokenRegistration.Dispose()`
  Unregisters the callback and returns after it is no longer running; it may wait for an executing callback to finish.
* `CancellationTokenRegistration.Unregister()`
  Unregisters the callback without waiting for it to finish if it is currently executing.
* `CancellationTokenRegistration.DisposeAsync()`
  Asynchronously unregisters the callback and awaits its completion when needed.
* `CancellationTokenRegistration.Dispose waits for an executing callback`: Synchronous disposal waits until the callback is unregistered or its current invocation has finished.
* `CancellationTokenRegistration.Unregister does not wait for a running callback`: This nonblocking alternative reports whether it removed the callback without waiting for an invocation already in progress.
* `OperationCanceledException`
  The base exception class thrown when an operation is canceled in response to a `CancellationToken`.
* `TaskCanceledException`
  A derived exception type inheriting from `OperationCanceledException`, commonly used to represent cancellation of a `Task`. An awaited canceled task can surface an `OperationCanceledException`; callers should usually catch the base type.
* `OperationCanceledException.CancellationToken`
  Gets the `CancellationToken` associated with the canceled operation that triggered the exception.
* `ThrowIfCancellationRequested convention`
  An explicit code pattern where libraries check tokens at sensible processing boundaries using `ThrowIfCancellationRequested()`.
* `CancellationToken optional parameter convention`
  A design convention where asynchronous library signatures accept an optional `CancellationToken = default` parameter.
* `Cancellation token propagation across call layers`
  The practice of passing the caller's token down through intermediate method boundaries to deep I/O calls.
* `Linked caller and timeout cancellation`
  Combining multiple tokens (such as user action and timeout timers) using linked token sources.
* `Cancellation callback exception behavior`
  Synchronous `Cancel()` invokes callbacks synchronously in LIFO registration order and aggregates callback failures by default; `Cancel(true)` stops at the first failure. `CancelAsync()` requests cancellation and returns a task representing callback completion; callback failures are reported through that task. Registering against an already-canceled token invokes the callback inline, so its exception comes directly from `Register`.
* `Cancellation callbacks execute synchronously in LIFO order for Cancel`: Later-registered callbacks run before earlier registrations during synchronous `Cancel()`.
* `CancellationTokenSource.Dispose(Boolean) protected override surface`: This protected disposal hook is for derived implementations; ordinary consumers call public `Dispose()`.
* `Cancellation is cooperative rather than forced termination`
  The fundamental design principle that tokens only request cancellation; running code must inspect them and exit gracefully.
* `Cancellation versus timeout result distinction`
  The conceptual separation between an operation aborting due to user cancellation versus expiring via a timeout threshold.
* `Cancellation during cleanup`
  Handling resource deallocation and state rollback safely when an operation aborts mid-stream.
* `CancellationTokenSource ownership and disposal`
  The rule that whoever instantiates a `CancellationTokenSource` is responsible for invoking its `.Dispose()` method when finished.

# Cross-item comparison
Within this assigned group, items fall into distinct functional pairs and groups:
* `CancellationToken` vs `CancellationTokenSource`: The token is an immutable, read-only observer struct distributed to workers, while the source is the mutable controller object that creates the token and invokes cancellation.
* `OperationCanceledException` vs `TaskCanceledException`: `TaskCanceledException` derives from `OperationCanceledException`. Cancellation may surface as either type, so catch `OperationCanceledException` unless code specifically needs the subtype.
* `CancellationTokenSource.Cancel()` vs `CancellationTokenSource.CancelAsync()`: Synchronous cancellation immediately runs registered callbacks on the calling thread, whereas `CancelAsync` sets the cancellation-requested state and returns a task representing completion of registered callbacks; callbacks are scheduled asynchronously, and callback failures are reported by the returned task (see https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtokensource.cancelasync).

# Examples

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

// Snippet showing cooperative cancellation setup, linking, and observation
public class CancellationExample
{
    public static async Task RunWorkAsync()
    {
        using var cts = new CancellationTokenSource();
        cts.CancelAfter(TimeSpan.FromSeconds(2));

        CancellationToken token = cts.Token;

        try
        {
            await Task.Delay(5000, token);
        }
        catch (OperationCanceledException ex) when (ex.CancellationToken == token)
        {
            Console.WriteLine("Operation was canceled cooperatively.");
        }
    }
}
```

Expected output (when run and canceled via timeout):
```text
Operation was canceled cooperatively.
```

# Common mistakes
* Forgetting to call `Dispose()` on `CancellationTokenSource` instances, leading to timer or synchronization handle leaks.
* Assuming that passing a `CancellationToken` instantly kills a running CPU-bound loop or thread without explicit checks or helper method support (`ThrowIfCancellationRequested`).
* Confusing `Task.WaitAsync` cancellation parameters: canceling a wait operation aborts the *wait*, not necessarily the underlying background task (accuracy fact backed by guidance at https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.waitasync).
* Catching generic `Exception` instead of `OperationCanceledException`, which accidentally intercepts cancellation signals and prevents proper stack unwinding.

# Knowledge checks with answers
1. **Question:** Does a `CancellationToken` forcibly terminate a running loop or thread automatically when triggered?
   **Answer:** No. Cancellation is cooperative rather than forced termination. The running code must periodically check `IsCancellationRequested` or call `ThrowIfCancellationRequested`.
2. **Question:** What is the difference between `CancellationToken` and `CancellationTokenSource` ownership?
   **Answer:** `CancellationTokenSource` owns the control mechanism to trigger cancellation and must be disposed. `CancellationToken` is a lightweight, read-only struct handed out to consumer methods.
3. **Question:** Which exception base type should general async code catch for cancellation?
   **Answer:** Usually handle `OperationCanceledException`, the base cancellation exception. Some canceled tasks surface the derived `TaskCanceledException`; the exact subtype is not a safe contract to assume for every API.

*Mark this as an automatically generated draft.*

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
