<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# exceptions error handling and disposal — Reference: Finalizers, SafeHandle, critical finalization, and GC interaction

# Scope and version
This reference lesson covers the exact named features in the inventory group **Finalizers, SafeHandle, critical finalization, and GC interaction** under the scope of C# 15 and .NET 11 stable exception and disposal APIs (checked 2026-11-14). 
*Note: This document is an automatically generated draft.*
Authority and source reference: [Microsoft C# language reference, .NET exception guidance, API reference, and disposal guidance](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements).

# How this group fits the mental model
In .NET, automatic memory management via the garbage collector handles managed memory, but external operating-system resources require deterministic cleanup (`IDisposable` or `IAsyncDisposable`). When native handles or direct operating-system resources are owned, the disposal pattern, wrappers, and finalization interact to ensure resources are never leaked. This inventory group explains the fallback and safety mechanisms used when garbage collection, finalizers, and `SafeHandle` manage lifetimes that go beyond ordinary managed heap memory.

# Supplied names explained
* `Finalizer`: A member block in a class used to perform clean-up operations before an object is collected by the garbage collector. It is a backup safety net rather than the primary mechanism for resource release.
* `Finalize method`: The virtual method override (historically expressed as `Finalize()`) underlying object destruction, translated by the C# compiler from destructor syntax.
* `Destructor syntax`: The C# syntax using a tilde prefix (`~ClassName()`) to define a finalizer for a class type.
* `Nondeterministic finalization`: The execution characteristic of finalizers, meaning it is impossible to predict precisely when or in what order garbage collection and finalization will run.
* `Finalization queue`: An internal data structure maintained by the runtime that holds references to objects with finalizers when those objects are discovered to be unreachable during garbage collection.
* `Finalizer thread`: A dedicated background thread managed by the runtime that dequeues objects from the finalization queue and executes their finalizers.
* `Finalize suppression`: The mechanism invoked via `GC.SuppressFinalize(this)` inside `Dispose()` to inform the garbage collector that an object has already been cleaned up deterministically, skipping its finalizer queue entry.
* `SafeHandle`: An abstract, robust wrapper class (`System.Runtime.InteropServices.SafeHandle`) representing operating-system handles, designed to prevent handle-recycling security exploits and guarantee resource release.
* `CriticalFinalizerObject`: A base class (`System.Runtime.ConstrainedExecution.CriticalFinalizerObject`) whose derived finalizers are guaranteed by the runtime to run during AppDomain teardown, even under severe resource constraints.
* `SafeHandle.ReleaseHandle`: The protected abstract method on `SafeHandle` that subclasses must implement to execute the actual platform call releasing the native handle.
* `SafeHandle.IsInvalid`: A property on `SafeHandle` returning a boolean value indicating whether the current handle value is considered invalid or closed.
* `SafeHandle ownership`: The architectural principle that a `SafeHandle` instance completely owns the underlying operating system handle lifetime, removing the need for manual finalizers in consumer classes.
* `P/Invoke safe handle parameter`: The capability to pass `SafeHandle` instances directly into platform-invocation (P/Invoke) signatures, automatically handling marshaling and reference counting to prevent premature handle closure.
* `Finalizer and resurrection`: An edge-case condition where a finalizer reassigns the dying object to an accessible reference (e.g., a static field), bringing the object back to life temporarily.
* `GC.ReRegisterForFinalize`: A runtime method used to request that an object previously suppressed via `GC.SuppressFinalize` be placed back onto the finalization queue.
* `GC.KeepAlive`: A method ensuring that the garbage collector does not prematurely collect an object while critical work is still dependent on its referenced native resources.
* `Do not access other finalizable objects from finalizer`: A strict safety rule for finalizers, because finalizer execution order is non-deterministic; other finalizable objects might already have been finalized.
* `Finalizer exception policy`: The runtime policy stating that if an unhandled exception escapes a finalizer, the process is abruptly terminated to prevent corrupted state propagation.
* `Dispose pattern without owned unmanaged resource`: The standard implementation structure for `IDisposable` where a type manages only managed disposable fields and requires no finalizer.
* `Dispose pattern with SafeHandle field`: The implementation structure where a type owns a `SafeHandle`, implementing `IDisposable` with `GC.SuppressFinalize` and utilizing the `SafeHandle` to manage native cleanup safely.
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
    private bool _disposed;
    private readonly SafeFileHandle _safeHandle;

    public ResourceConsumer(SafeFileHandle safeHandle)
    {
        _safeHandle = safeHandle ?? throw new ArgumentNullException(nameof(safeHandle));
    }

    public void Dispose()
    {
        Dispose(true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (_disposed)
        {
            return;
        }

        if (disposing)
        {
            // Dispose managed state (managed objects) here if any exist.
            _safeHandle?.Dispose();
        }

        // Unmanaged safety via SafeHandle release happens automatically.
        _disposed = true;
    }

    ~ResourceConsumer()
    {
        Dispose(false);
    }
}
```

# Common mistakes
* **Relying on finalizers for prompt cleanup:** Assuming a destructor or finalizer will execute immediately when an object goes out of scope. Finalizers run nondeterministically during future garbage collections.
* **Accessing other object references inside a finalizer:** Reading or calling methods on other reference-type fields within a finalizer, which can lead to unpredictable behavior because those objects may already have been garbage collected and finalized.
* **Failing to call `GC.SuppressFinalize(this)` in `Dispose()`:** Omitting this call forces the garbage collector to route the object through the finalization queue unnecessarily, degrading GC performance.
* **Swallowing exceptions in finalizers:** Allowing exceptions to escape a finalizer, which triggers process termination under the runtime's finalizer exception policy.

# Knowledge checks with answers
1. **Question:** What is the primary deterministic cleanup method required when a class directly or indirectly owns an operating system handle via `SafeHandle`?
   * **Answer:** Implementing `IDisposable` (and calling `Dispose()` or using `using` declarations), accompanied by `GC.SuppressFinalize(this)`.
2. **Question:** Why should you avoid accessing other finalizable reference objects inside a destructor or finalizer?
   * **Answer:** Because finalizer execution order is completely non-deterministic, meaning other finalizable objects might already have been finalized and collected, leading to invalid state or runtime errors.
3. **Question:** What happens to a .NET application if an unhandled exception is thrown inside a finalizer and is not caught?
   * **Answer:** The runtime terminates the process immediately to prevent corrupted state from spreading.
