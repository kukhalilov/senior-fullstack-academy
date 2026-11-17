<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# exceptions error handling and disposal — Exercises and worked solutions

*This is an automatically generated draft.*

# Goals
*   Understand the distinction between managed memory (Garbage Collector) and deterministic resource cleanup (`IDisposable`).
*   Learn to use `try-catch-finally` and `using` statements to ensure robust error handling and resource management.
*   Master the "Dispose Pattern" and the role of `SafeHandle` in preventing resource leaks.
*   Practice identifying when to catch exceptions versus when to let them propagate.

# Worked example
Imagine a file processor that reads a configuration file. We must ensure the file handle is closed even if the file is corrupted.

```csharp
using System.IO;

public void ProcessFile(string path)
{
    // 'using' ensures the StreamReader is disposed even if an exception occurs
    using var reader = new StreamReader(path);
    
    string content = reader.ReadToEnd();
    // Logic that might throw an exception
}
```

**Step-by-step:**
1.  **Scope:** The `using` declaration guarantees `reader.Dispose()` is called when the method exits.
2.  **Disposal:** The `using` declaration is lowered to cleanup logic that runs as the method scope exits.
3.  **Propagation:** This method has no recovery policy, so an `IOException` can propagate naturally. The `using` cleanup still runs as the method exits.

# Exercises
1.  **Refactoring:** Convert a `try-finally` block that manually calls `Dispose()` into a `using` statement.
2.  **Validation:** Write a method that accepts an integer `age`. Use `ArgumentOutOfRangeException.ThrowIfNegative` to validate input.
3.  **Disposal:** Create a class that owns a `SafeHandle`. Implement `IDisposable` by disposing the handle. Explain why this wrapper normally does not need its own finalizer.
4.  **Propagation:** Write a method that catches an `IOException`, logs it, and then rethrows it using `throw;`.

# Progressive hints
*   **Exercise 1:** Remember that `using` is syntactic sugar for a `try-finally` block.
*   **Exercise 2:** Check the `ArgumentOutOfRangeException` static methods in the inventory.
*   **Exercise 3:** Dispose the owned `SafeHandle`. Since this wrapper has no finalizer, it does not call `GC.SuppressFinalize`.
*   **Exercise 4:** Ensure you are not using `throw ex;`, as that resets the `StackTrace` to the current line.

# Complete solutions
**Exercise 1:**
```csharp
// Before
var stream = new MemoryStream();
try { /* use stream */ }
finally { stream.Dispose(); }

// After
using var stream = new MemoryStream();
/* use stream */
```

**Exercise 2:**
```csharp
public void SetAge(int age)
{
    ArgumentOutOfRangeException.ThrowIfNegative(age);
}
```

**Exercise 3:**
```csharp
public class MyResource : IDisposable
{
    private readonly SafeHandle _handle; // Assume initialized and owned
    public MyResource(SafeHandle handle) =>
        _handle = handle ?? throw new ArgumentNullException(nameof(handle));

    public void Dispose() => _handle.Dispose();
}
```

# Tests and edge cases
*   **Null Resources:** `using` handles `null` gracefully (it does nothing).
*   **Double Disposal:** Idempotent disposal is a useful type-design contract, but `IDisposable` alone does not promise it. Follow each type's documented behavior.
*   **Exception in Dispose:** If `Dispose` throws, it can mask the original exception. Always ensure `Dispose` is robust.
*   **Async Disposal:** If a resource requires asynchronous cleanup (e.g., network socket), use `await using` and `IAsyncDisposable`.

# Reflection questions
1.  Why is `throw;` preferred over `throw ex;`?
2.  What is the difference between `IDisposable` and a `Finalizer`? When should you use each?
3.  Why should you avoid catching `Exception` unless you have a specific recovery policy?
4.  How does an **Exception filter** differ from a `catch` block condition? (Hint: Stack unwinding).

*Sources: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements), [.NET exception guidance](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions), [Implementing Dispose](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose).*
