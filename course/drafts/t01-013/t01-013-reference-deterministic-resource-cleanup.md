<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# exceptions error handling and disposal — Reference: IDisposable, IAsyncDisposable, using scopes, and ownership

*This is an automatically generated draft.*

# Scope and version
This lesson covers deterministic resource cleanup in C# 15 and .NET 11. It focuses on the contracts and language features used to release non-memory resources (like file handles, network sockets, or database connections) promptly and reliably.

# How this group fits the mental model
In .NET, the Garbage Collector (GC) manages memory automatically. However, the GC does not know when to release external resources like file handles. Deterministic cleanup is the process of explicitly releasing these resources as soon as they are no longer needed. 

The mental model relies on two pillars:
1. **Contracts (`IDisposable`, `IAsyncDisposable`):** These interfaces signal that an object owns resources that require cleanup.
2. **Scopes (`using`):** These language features ensure that `Dispose` or `DisposeAsync` is called automatically when a variable goes out of scope, even if an exception occurs.

# Supplied names explained

* `IDisposable`: An interface that defines a mechanism for releasing unmanaged resources.
* `IDisposable.Dispose`: The method called to perform application-defined tasks associated with freeing, releasing, or resetting unmanaged resources.
* `IAsyncDisposable`: An interface that provides a mechanism for releasing unmanaged resources asynchronously.
* `IAsyncDisposable.DisposeAsync`: The method called to perform application-defined tasks associated with freeing, releasing, or resetting unmanaged resources asynchronously.
* `ValueTask from DisposeAsync`: The return type of `DisposeAsync`, which allows for efficient completion when the cleanup operation is synchronous.
* `using declaration`: A variable declaration that ensures the object is disposed when the scope ends (e.g., `using var reader = new StreamReader();`).
* `using statement`: A block-based syntax that ensures disposal at the end of the block.
* `using expression`: A C# feature allowing `using` within an expression, disposing the resource when the expression result is no longer needed.
* `await using declaration`: An asynchronous version of the `using` declaration for `IAsyncDisposable` objects.
* `await using statement`: An asynchronous version of the `using` block for `IAsyncDisposable` objects.
* `await using expression`: An asynchronous version of the `using` expression.
* `Multiple resources in using statement`: The ability to declare multiple variables in a single `using` statement.
* `Nested using scopes`: Placing one `using` block inside another to manage multiple lifetimes.
* `Compiler try-finally expansion of using`: The mechanism where the compiler transforms `using` into a `try-finally` block to guarantee cleanup.
* `Reverse-order disposal of multiple using resources`: The guarantee that resources are disposed in the reverse order of their declaration.
* `Dispose after exception`: The guarantee that `Dispose` is called even if an exception occurs within the `using` block.
* `Dispose after early return`: The guarantee that `Dispose` is called if a method returns early (e.g., via `return` or `break`).
* `Null resource in using`: The `using` feature safely handles `null` references without throwing an exception.
* `Dispose pattern for base and derived classes`: The standard implementation strategy for classes that own resources, ensuring proper cleanup in inheritance hierarchies.
* `Protected virtual Dispose(bool)`: A method used in the Dispose pattern to centralize cleanup logic.
* `Public Dispose method`: The implementation of `IDisposable.Dispose` that calls `Dispose(true)` and suppresses finalization.
* `Dispose(bool disposing) pattern`: A method that distinguishes between managed (disposing=true) and unmanaged (disposing=false) cleanup.
* `Dispose managed resources`: Logic inside `Dispose(true)` to clean up objects that implement `IDisposable`.
* `Release unmanaged resource`: Logic inside `Dispose(bool)` to clean up handles or native memory.
* `GC.SuppressFinalize`: A method call that tells the GC not to call the object's finalizer, as cleanup has already occurred.
* `Dispose idempotence`: The requirement that calling `Dispose` multiple times should not throw an exception.
* `ObjectDisposedException after disposal`: An exception thrown if a consumer attempts to use an object after it has been disposed.
* `Resource ownership`: The concept that the creator of a resource is responsible for its disposal.
* `Borrowed resource versus owned resource`: A distinction where "borrowed" resources should not be disposed by the consumer.
* `DisposeAsyncCore`: A common naming convention for the internal logic of `DisposeAsync`.
* `Synchronous disposal of async-capable resource`: Calling `Dispose` on an object that implements both `IDisposable` and `IAsyncDisposable`.
* `Prefer async disposal when asynchronous cleanup is required`: A guideline to use `IAsyncDisposable` for I/O-bound cleanup.
* `ConfigureAwait(false) in library DisposeAsync`: A performance practice to avoid capturing the synchronization context during cleanup.
* `Cleanup order for dependent resources`: The requirement to dispose of objects in the correct dependency order.
* `Exception thrown by Dispose`: A scenario where cleanup fails, which should be handled carefully to avoid masking original exceptions.
* `Exception thrown by DisposeAsync`: Similar to `Dispose`, but occurring in an asynchronous context.

# Cross-item comparison

| Feature | Comparison |
| :--- | :--- |
| `IDisposable` | Used for synchronous cleanup; `IAsyncDisposable` is for non-blocking cleanup. |
| `using` | `using` blocks/declarations are preferred over manual `try-finally` for readability and safety. |
| `Dispose` | `Dispose` is for deterministic cleanup; Finalizers are a non-deterministic fallback. |
| `SafeHandle` | `SafeHandle` is the recommended wrapper for unmanaged handles; avoid hand-written finalizers. |
| Managed memory | Managed memory is reclaimed by the GC; `Dispose` is for external resources. |

# Examples
```csharp
// Unverified example of using declaration
public void ProcessFile()
{
    // The file is automatically closed when 'reader' goes out of scope
    using var reader = new StreamReader("data.txt");
    Console.WriteLine(reader.ReadToEnd());
}
```

# Common mistakes
* **Forgetting to dispose:** Failing to wrap `IDisposable` objects in a `using` scope leads to resource leaks.
* **Double disposal:** While `Dispose` should be idempotent, failing to check if an object is already disposed can lead to `ObjectDisposedException`.
* **Finalizer abuse:** Implementing a finalizer when `IDisposable` is sufficient adds unnecessary pressure to the GC.
* **Masking exceptions:** If `Dispose` throws an exception, it can hide the original exception that triggered the cleanup.

# Knowledge checks with answers
1. **Question:** Why should you use `using` instead of a manual `try-finally` block?
   **Answer:** `using` is more concise and less error-prone, as the compiler handles the `try-finally` expansion automatically.
2. **Question:** What is the purpose of `GC.SuppressFinalize(this)`?
   **Answer:** It informs the GC that the object has already been cleaned up, so the finalizer does not need to run, improving performance.
3. **Question:** Can you call `Dispose` more than once on the same object?
   **Answer:** Yes, `Dispose` should be implemented to be idempotent, meaning subsequent calls should do nothing.

*Source: [Microsoft .NET Disposal Guidance](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose)*
