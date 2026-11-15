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
    
    try 
    {
        string content = reader.ReadToEnd();
        // Logic that might throw an exception
    }
    catch (IOException ex) when (ex.Message.Contains("locked"))
    {
        // Handle specific recovery: e.g., wait and retry
    }
    catch (Exception)
    {
        // Log and rethrow to preserve stack trace
        throw; 
    }
}
```

**Step-by-step:**
1.  **Scope:** The `using` declaration guarantees `reader.Dispose()` is called when the method exits.
2.  **Filter:** The `when` clause acts as an **Exception filter**, evaluating before the stack is unwound.
3.  **Propagation:** `throw;` (rethrow) is used instead of `throw ex;` to keep the original `Exception.StackTrace` intact.

# Exercises
1.  **Refactoring:** Convert a `try-finally` block that manually calls `Dispose()` into a `using` statement.
2.  **Validation:** Write a method that accepts an integer `age`. Use `ArgumentOutOfRangeException.ThrowIfNegative` to validate input.
3.  **Disposal:** Create a class that holds a `SafeHandle`. Implement `IDisposable` and ensure the `SafeHandle` is disposed correctly.
4.  **Propagation:** Write a method that catches an `IOException`, logs it, and then rethrows it using `throw;`.

# Progressive hints
*   **Exercise 1:** Remember that `using` is syntactic sugar for a `try-finally` block.
*   **Exercise 2:** Check the `ArgumentOutOfRangeException` static methods in the inventory.
*   **Exercise 3:** Use `GC.SuppressFinalize(this)` in your `Dispose` method to tell the Garbage Collector that cleanup is already handled.
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
    private SafeHandle _handle; // Assume initialized
    public void Dispose()
    {
        _handle?.Dispose();
        GC.SuppressFinalize(this);
    }
}
```

# Tests and edge cases
*   **Null Resources:** `using` handles `null` gracefully (it does nothing).
*   **Double Disposal:** `Dispose` must be idempotent. Calling it twice should not throw an `ObjectDisposedException`.
*   **Exception in Dispose:** If `Dispose` throws, it can mask the original exception. Always ensure `Dispose` is robust.
*   **Async Disposal:** If a resource requires asynchronous cleanup (e.g., network socket), use `await using` and `IAsyncDisposable`.

# Reflection questions
1.  Why is `throw;` preferred over `throw ex;`?
2.  What is the difference between `IDisposable` and a `Finalizer`? When should you use each?
3.  Why should you avoid catching `Exception` unless you have a specific recovery policy?
4.  How does an **Exception filter** differ from a `catch` block condition? (Hint: Stack unwinding).

*Sources: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/exception-handling-statements), [.NET exception guidance](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions), [Implementing Dispose](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose).*
