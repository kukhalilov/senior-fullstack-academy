<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Reference: Checked context, locking, and resource disposal

# Scope and version

This reference lesson covers the checked context, locking, and resource disposal statements in C# 15 stable on .NET 11 GA ([Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)). 

Automatic draft notice: This document is an automatically generated draft.

# How this group fits the mental model

Within the broader mental model of C# statements, expressions produce values while statements perform actions. While selection and iteration statements control execution paths, this specific inventory group handles safe arithmetic boundaries, thread synchronization, and deterministic resource lifecycle management. 

- **Arithmetic bounds control** (`checked statement`, `unchecked statement`) dictates whether integer arithmetic overflow throws an exception or silently discards high-order bits.
- **Concurrency control** (`lock statement`) provides mutual exclusion for multi-threaded access to shared objects.
- **Resource management** (`using statement`, `using declaration`, `await using statement`, `await using declaration`) guarantees that synchronous and asynchronous disposable objects are cleaned up deterministically as soon as execution leaves their defining scope.

# Supplied names explained

- `checked statement`: Evaluates block-level arithmetic operations with overflow checking enabled. If an integral-type arithmetic operation produces a value outside the range of the destination type, a `System.OverflowException` is thrown.
- `unchecked statement`: Evaluates block-level arithmetic operations with overflow checking disabled. Any out-of-range integral arithmetic overflow discards any high-order bits that do not fit in the destination type, executing without throwing an exception.
- `lock statement`: Acquires a mutual-exclusion lock for a given object, executes a statement block, and ensures the lock is released when execution exits the block, preventing multiple threads from executing the critical section concurrently.
- `using statement`: Defines a resource scope using a traditional syntax block (`using (var resource = new Resource()) { ... }`). It guarantees that the resource's `Dispose()` method is invoked synchronously when execution exits the statement block, even if an exception occurs.
- `using declaration`: Declares a disposable local variable without an explicit brace-delimited block (`using var resource = new Resource();`). The resource is disposed automatically when execution leaves the enclosing scope block.
- `await using statement`: Manages asynchronously disposable resources (`IAsyncDisposable`) within a traditional block syntax (`await using (var resource = new AsyncResource()) { ... }`). It ensures that `DisposeAsync()` is awaited synchronously or asynchronously upon exiting the block scope.
- `await using declaration`: Declares an asynchronously disposable local variable (`await using var resource = new AsyncResource();`). The runtime awaits its `DisposeAsync()` method when execution leaves the enclosing scope block.

# Cross-item comparison

- `using statement` vs `using declaration`: A `using statement` uses explicit braces to restrict the resource's lifetime to a nested block, whereas a `using declaration` extends the resource's lifetime to the end of the current enclosing method scope.
- `using declaration` vs `await using declaration`: A standard `using declaration` calls the synchronous `Dispose()` method on an `IDisposable` object at scope exit, while an `await using declaration` calls and awaits the asynchronous `DisposeAsync()` method on an `IAsyncDisposable` object.
- `checked statement` vs `unchecked statement`: A `checked statement` enforces runtime overflow exceptions for integer operations inside its block, whereas an `unchecked statement` suppresses those checks, letting arithmetic overflow wrap around silently.

# Examples

The following example demonstrates a `checked statement` ensuring overflow safety, a `lock statement` securing a critical section, and a `using declaration` cleaning up a resource.

```csharp
using System;

class Program
{
    private static readonly object _lockObj = new object();

    static void Main()
    {
        // checked statement example
        checked
        {
            int max = int.MaxValue;
            try
            {
                int broken = max + 1; // Throws OverflowException
            }
            catch (OverflowException)
            {
                Console.WriteLine("Overflow caught safely.");
            }
        }

        // lock statement example
        lock (_lockObj)
        {
            Console.WriteLine("Executing inside thread-safe lock block.");
        }

        // using declaration example
        using TempResource res = new TempResource();
        Console.WriteLine("Using resource within scope.");
    }
}

class TempResource : IDisposable
{
    public void Dispose()
    {
        Console.WriteLine("Resource disposed.");
    }
}
```

Expected output:
```text
Overflow caught safely.
Executing inside thread-safe lock block.
Using resource within scope.
Resource disposed.
```

# Common mistakes

- Assuming a `using declaration` disposes of an object at the exact line it is instantiated; instead, disposal occurs at the end of the enclosing block scope.
- Passing a value type (struct) or a freshly allocated local object to a `lock statement`, which fails to provide thread safety because other threads can access their own separate allocations.
- Forgetting that arithmetic operations outside explicit `checked` or `unchecked` statements rely on compiler and project-level configuration defaults rather than guaranteed safe checks.

# Knowledge checks with answers

1. **Question:** When is `Dispose()` called on an object declared via a `using declaration`?
   **Answer:** It is called automatically when execution leaves the enclosing scope block (such as the end of the containing method or statement block).

2. **Question:** What happens when an integer addition overflows inside an `unchecked statement`?
   **Answer:** The operation executes without throwing an exception, discarding any high-order bits that do not fit in the destination type (arithmetic wrap-around).

3. **Question:** What interface must an object implement to be used with an `await using statement`?
   **Answer:** It must implement `System.IAsyncDisposable`.
