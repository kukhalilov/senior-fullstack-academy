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
  Registers a delegate that is called when the `CancellationToken` is cancelled, returning a `CancellationTokenRegistration`.
* `CancellationToken.Register(Action<Object>,Object)`
  Registers a delegate that accepts state data, called when the `CancellationToken` is cancelled.
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
  Attempts to reset the state of a `CancellationTokenSource` if it has not already fired, allowing reuse under strict conditions.
* `CancellationTokenSource.Dispose()`
  Releases all resources used by the current instance of `CancellationTokenSource`.
* `CancellationTokenSource.Dispose(Boolean)`
  Releases unmanaged and optionally managed resources used by the `CancellationTokenSource`.
* `CancellationTokenRegistration.Dispose()`
  Disposes the registration, unregistering the associated callback from the token.
* `CancellationTokenRegistration.Unregister()`
  Unregisters the callback associated with the token.
* `OperationCanceledException`
  The base exception class thrown when an operation is canceled in response to a `CancellationToken`.
* `TaskCanceledException`
  A derived exception type inheriting from `OperationCanceledException`, specifically used when an awaited `Task` is canceled.
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
  The runtime rule dictating how exceptions thrown inside registered cancellation delegates are handled and aggregated.
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
* `OperationCanceledException` vs `TaskCanceledException`: Both represent canceled actions, but `TaskCanceledException` specifically wraps task-based return statuses, whereas `OperationCanceledException` is a general runtime type associated with token checks.
* `CancellationTokenSource.Cancel()` vs `CancellationTokenSource.CancelAsync()`: Synchronous cancellation immediately runs registered callbacks on the calling thread, whereas `CancelAsync` initiates cancellation asynchronously to reduce blocking on heavy callback execution (see https://learn.microsoft.com/en-us/dotnet/api/system.threading.cancellationtokensource.cancelasync).

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
3. **Question:** Which exception type is thrown by default when an awaited task observes cancellation via a token?
   **Answer:** `TaskCanceledException`, which inherits from `OperationCanceledException`.

*Mark this as an automatically generated draft.*

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
