
# exceptions error handling and disposal — Reference: Finalizers, SafeHandle, critical finalization, and GC interaction

# Scope and version
This reference lesson covers the exact named features in the inventory group **Finalizers, SafeHandle, critical finalization, and GC interaction** under the scope of C# 15 and .NET 11 stable exception and disposal APIs (checked 2026-11-17).
Authority and source reference: [Microsoft SafeHandle API guidance](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.safehandle), [CriticalFinalizerObject API](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.constrainedexecution.criticalfinalizerobject), and [Dispose guidance](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose).

# How this group fits the mental model
In .NET, automatic memory management via the garbage collector handles managed memory, but external operating-system resources require deterministic cleanup (`IDisposable` or `IAsyncDisposable`). When native handles or direct operating-system resources are owned, the disposal pattern, wrappers, and finalization interact to ensure resources are never leaked. This inventory group explains the fallback and safety mechanisms used when garbage collection, finalizers, and `SafeHandle` manage lifetimes that go beyond ordinary managed heap memory.

# Supplied names explained
* `Finalizer`: A member block in a class used to perform clean-up operations before an object is collected by the garbage collector. It is a backup safety net rather than the primary mechanism for resource release.
* `Finalize method`: The virtual method override (historically expressed as `Finalize()`) underlying object destruction, translated by the C# compiler from destructor syntax.
* `Destructor syntax`: The C# syntax using a tilde prefix (`~ClassName()`) to define a finalizer for a class type.
* `Nondeterministic finalization`: The execution characteristic of finalizers, meaning it is impossible to predict precisely when or in what order garbage collection and finalization will run.
* `Finalization queue`: An internal data structure maintained by the runtime that holds references to objects with finalizers when those objects are discovered to be unreachable during garbage collection.
* `Finalizer thread`: A dedicated background thread managed by the runtime that dequeues objects from the finalization queue and executes their finalizers.
* `Finalize suppression`: `GC.SuppressFinalize(this)` prevents a pending finalizer from running when deterministic cleanup made it unnecessary. Call it in `Dispose` when the type actually has a finalizer; it has no useful effect for a type without one.
* `SafeHandle`: An abstract wrapper for operating-system handles. Its critical finalization and P/Invoke integration protect handle lifetime and reduce leak/recycling risks; it cannot guarantee release after abrupt process termination or hardware failure.
* `CriticalFinalizerObject`: A base class marking derived finalization as critical. The CLR gives conforming critical-finalization code an opportunity to run in certain runtime teardown/thread-abort cases, with critical finalizers ordered after ordinary finalizers for objects finalized in the same collection. This is not a guarantee after process termination or power loss; application code should normally use `SafeHandle` rather than derive from it directly.
* `SafeHandle.ReleaseHandle`: The protected abstract method on `SafeHandle` that subclasses must implement to execute the actual platform call releasing the native handle.
* `SafeHandle.IsInvalid`: A property on `SafeHandle` returning a boolean value indicating whether the current handle value is considered invalid or closed.
* `SafeHandle ownership`: The architectural principle that a `SafeHandle` instance completely owns the underlying operating system handle lifetime, removing the need for manual finalizers in consumer classes.
* `P/Invoke safe handle parameter`: The capability to pass `SafeHandle` instances directly into platform-invocation (P/Invoke) signatures, automatically handling marshaling and reference counting to prevent premature handle closure.
* `Finalizer and resurrection`: An edge-case condition where a finalizer reassigns the dying object to an accessible reference (e.g., a static field), bringing the object back to life temporarily.
* `GC.ReRegisterForFinalize`: A runtime method used to request that an object previously suppressed via `GC.SuppressFinalize` be placed back onto the finalization queue.
* `GC.KeepAlive`: A method that keeps an object reachable through the call site. It can ensure an object owning a native resource remains alive until a specified point; it does not prevent explicit disposal or make the resource thread-safe.
* `Do not access other finalizable objects from finalizer`: Do not rely on other finalizable objects being in a usable state during finalization; finalization order is not a dependable ownership protocol. This is guidance, not a blanket prohibition on every managed reference.
* `Finalizer exception policy`: On modern .NET, an unhandled exception from a finalizer is not a recoverable cleanup signal and can terminate the process. Keep finalizers minimal and non-throwing; do not assume cleanup can always run.
* `Dispose pattern without owned unmanaged resource`: A type that only owns managed disposable fields should cascade cleanup as appropriate, but normally needs no finalizer and often does not need the full `Dispose(bool)` inheritance pattern.
* `Dispose pattern with SafeHandle field`: A wrapper that owns a `SafeHandle` normally implements `IDisposable` by disposing that field. It normally needs no wrapper finalizer because the `SafeHandle` itself supplies the finalization fallback.
* `Garbage collection does not dispose arbitrary resources`: The foundational distinction that the garbage collector reclaims memory allocations on the managed heap, but has no intrinsic knowledge of database connections, file handles, or custom unmanaged resources.
* `Managed memory reclamation versus resource disposal`: The conceptual boundary separating automated runtime memory collection from explicit, developer-driven resource teardown.

# Cross-item comparison
* `SafeHandle` vs `Hand-written finalizer`: `SafeHandle` provides a safe, built-in, reliable abstraction for operating system handles with constrained execution guarantees, whereas a hand-written finalizer requires complex deterministic/nondeterministic boilerplate and introduces severe risks of leaks, leaks of lifetimes, or memory corruption.
* `Dispose` vs `Finalizer`: `Dispose` is deterministic, immediate, and caller-invoked, whereas a `Finalizer` is nondeterministic, executed asynchronously on a background thread, and used strictly as a safe fallback.
* `Managed memory reclamation versus resource disposal`: Managed memory is reclaimed automatically and lazily by the garbage collector based on heap pressure, whereas resource disposal handles external, non-memory system resources immediately and deterministically via explicit contracts.

# Examples
The following unverified code example illustrates how a class implements the disposal pattern using a standard `SafeHandle` subclass (such as `Microsoft.Win32.SafeHandles.SafeFileHandle` or a custom subclass deriving from `SafeHandle`) alongside `IDisposable`:

```csharp
using System;
using Microsoft.Win32.SafeHandles;

public class ResourceConsumer : IDisposable
{
    private readonly SafeFileHandle _safeHandle;

    public ResourceConsumer(SafeFileHandle safeHandle)
    {
        _safeHandle = safeHandle ?? throw new ArgumentNullException(nameof(safeHandle));
    }

    public void Dispose() => _safeHandle.Dispose();
}
```

# Common mistakes
* **Relying on finalizers for prompt cleanup:** Assuming a destructor or finalizer will execute immediately when an object goes out of scope. Finalizers run nondeterministically during future garbage collections.
* **Accessing other object references inside a finalizer:** Reading or calling methods on other reference-type fields within a finalizer, which can lead to unpredictable behavior because those objects may already have been garbage collected and finalized.
* **Adding a finalizer solely because a wrapper owns `SafeHandle`:** The `SafeHandle` owns and finalizes the OS handle. A wrapper that only owns a `SafeHandle` normally implements `IDisposable` and disposes the handle; it does not need its own finalizer or `SuppressFinalize` call.
* **Throwing from finalizers:** Finalizers should not throw; an unhandled finalizer exception can terminate the process. Keep finalizers minimal and delegate native-handle safety to `SafeHandle`.

# Knowledge checks with answers
1. **Question:** What is the primary deterministic cleanup method when a class owns an operating-system handle through `SafeHandle`?
   * **Answer:** Dispose the owned `SafeHandle`, commonly by implementing `IDisposable` and using the wrapper in a `using` scope. The wrapper usually has no finalizer and therefore does not need to suppress one.
2. **Question:** Why should you avoid accessing other finalizable reference objects inside a destructor or finalizer?
   * **Answer:** Do not assume other finalizable objects are still usable; ordering is limited and should not be used as an ownership protocol. Keep finalizers minimal and rely on `SafeHandle` for native handles.
3. **Question:** What happens to a .NET application if an unhandled exception is thrown inside a finalizer and is not caught?
   * **Answer:** An unhandled finalizer exception can terminate the process. Finalizer code should be minimal and designed not to throw.
