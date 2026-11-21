
# C# async and await Task ValueTask cancellation and continuation context — Exercises and worked solutions

# Goals
- Master the Task-based Asynchronous Pattern (TAP) in C#, including `async` and `await`, `Task`, `Task<T>`, `ValueTask`, and `ValueTask<T>`.
- Learn cooperative cancellation using `CancellationToken` and `CancellationTokenSource`.
- Understand continuation context capture, `SynchronizationContext`, and how and when to use `ConfigureAwait(false)`.
- Develop practical troubleshooting and problem-solving skills for common asynchronous bugs such as sync-over-async deadlocks and unobserved exceptions.

# Worked example

Asynchronous programming represents work that may finish later without forcing the caller's thread to wait. `async` and `await` let code express TAP; they do not automatically create a new thread or make CPU work parallel. A `Task` represents an operation's eventual completion, failure, or cancellation.

Below is a complete, self-contained C# console program demonstrating an asynchronous operation with cooperative cancellation, proper timeout handling via `Task.WaitAsync(CancellationToken)`, and structured exception propagation.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        // Create a cancellation token source that cancels after 2 seconds or manually.
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));

        try
        {
            Console.WriteLine("Starting download operation...");
            
            // Pass the token to the simulated asynchronous operation
            string result = await DownloadDataAsync("https://example.com/api", cts.Token);
            Console.WriteLine($"Success: {result}");
        }
        catch (OperationCanceledException) when (cts.IsCancellationRequested)
        {
            Console.WriteLine("The operation was canceled or timed out.");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"An unexpected error occurred: {ex.Message}");
        }
    }

    static async Task<string> DownloadDataAsync(string url, CancellationToken cancellationToken)
    {
        // Simulate an asynchronous I/O delay, observing the token
        await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);

        // Check cancellation explicitly if needed
        cancellationToken.ThrowIfCancellationRequested();

        return $"Payload from {url}";
    }
}
```

### Explanation of the Worked Example
1. **`CancellationTokenSource`**: Manages the cancellation signal and can be configured with a timeout using `TimeSpan.FromSeconds(2)`.
2. **`await Task.Delay(...)`**: A naturally asynchronous delay that yields execution back to the caller immediately without blocking a thread. It accepts the `CancellationToken` so it aborts early if canceled.
3. **`ThrowIfCancellationRequested()`**: Immediately throws an `OperationCanceledException` carrying the token if cancellation has been requested.
4. **Exception Handling**: Catches `OperationCanceledException` cleanly to handle timeouts or user-driven cancellations without crashing the application.

# Exercises

1. **Exercise 1: Refactoring Sync-Over-Async**: Take a synchronous method that calls `Task.Run(...).Result` and refactor it into a proper asynchronous method using `async` and `await` all the way up the call chain.
2. **Exercise 2: Implementing Cooperative Cancellation**: Write an asynchronous method `ProcessItemsAsync(IEnumerable<string> items, CancellationToken cancellationToken)` that loops through items, checks `cancellationToken.ThrowIfCancellationRequested()` on each iteration, and awaits a 100ms delay per item.
3. **Exercise 3: Using `ValueTask<T>` Correctly**: Create a method that returns a `ValueTask<int>` which returns a cached result synchronously when available, or performs an asynchronous lookup via `Task<int>` when a cache miss occurs.
4. **Exercise 4: Timeout Handling with `Task.WaitAsync`**: Call an asynchronous method that takes 5 seconds to complete, but wrap the awaited call with `.WaitAsync(TimeSpan.FromSeconds(1))` to enforce a strict timeout.

# Progressive hints

- **Hints for Exercise 1**: Look for places where `.Result` or `.Wait()` are called. Replace them by adding the `async` modifier to the caller and using `await` on the inner task. Avoid mixing synchronous blocking with async code.
- **Hints for Exercise 2**: Remember that `CancellationToken` is a struct passed by value. Pass it down into any inner methods or awaits (like `Task.Delay`) that accept it.
- **Hints for Exercise 3**: `ValueTask<T>` can wrap either a synchronous result or a standard `Task<T>`. When returning a cached value, construct the `ValueTask<int>` directly with the integer value (e.g., `return new ValueTask<int>(cachedValue);`).
- **Hints for Exercise 4**: `Task.WaitAsync` is available directly on any `Task` or `Task<T>` instance starting in .NET 6. If the operation exceeds the duration, it throws a `TimeoutException` (or `OperationCanceledException` depending on overload).

# Complete solutions

### Solution 1: Refactoring Sync-Over-Async
```csharp
// Incorrect (Sync-over-async, risks deadlock and thread starvation):
// public string GetData() => GetDataAsync().Result;

// Correct (Async all the way):
public async Task<string> GetDataAsync()
{
    return await FetchFromDatabaseAsync();
}
```

### Solution 2: Implementing Cooperative Cancellation
```csharp
public async Task ProcessItemsAsync(IEnumerable<string> items, CancellationToken cancellationToken)
{
    foreach (var item in items)
    {
        // Throws OperationCanceledException if token is canceled
        cancellationToken.ThrowIfCancellationRequested();

        Console.WriteLine($"Processing {item}");
        await Task.Delay(100, cancellationToken);
    }
}
```

### Solution 3: Using `ValueTask<T>` Correctly
```csharp
private readonly Dictionary<string, int> _cache = new();

public ValueTask<int> GetCachedOrComputedValueAsync(string key)
{
    if (_cache.TryGetValue(key, out var cached))
    {
        // Return synchronous result without allocating a Task object
        return new ValueTask<int>(cached);
    }

    return new ValueTask<int>(ComputeValueAsync(key));
}

private async Task<int> ComputeValueAsync(string key)
{
    await Task.Delay(50); // Simulate async I/O
    int computed = 42;
    _cache[key] = computed;
    return computed;
}
```

### Solution 4: Timeout Handling with `Task.WaitAsync`
```csharp
public async Task RunWithTimeoutAsync()
{
    try
    {
        Task longRunningTask = Task.Delay(TimeSpan.FromSeconds(5));
        
        // Wait for max 1 second
        await longRunningTask.WaitAsync(TimeSpan.FromSeconds(1));
    }
    catch (TimeoutException)
    {
        Console.WriteLine("The operation timed out.");
    }
}
```

# Tests and edge cases

- **Edge Case 1: Unobserved Task Exceptions**: If a `Task` fails and its exception is never observed via `await` or checking `.Exception`, it can trigger unobserved exception behaviors in older runtimes or require careful handling. Always `await` started tasks or observe their exceptions.
- **Edge Case 2: `async void` Methods**: Avoid `async void` methods except for top-level event handlers. An `async void` method cannot be awaited, and exceptions are not captured in a returned `Task`; they are posted through the synchronization context active when the method starts and may be unhandled by the host.
- **Edge Case 3: Single-Consumption Rule of `ValueTask`**: Consumption and conversion constraints depend on the `ValueTask` backing source. Follow its API contract; for source-backed values, repeated or concurrent consumption may be invalid. Do not generalize this to all `ValueTask` instances.
- **Edge Case 4: SynchronizationContext Deadlocks**: Awaiting a task without `ConfigureAwait(false)` in a single-threaded environment (such as legacy Windows Forms or WPF UI threads) while synchronously blocking (`.Result`) can deadlock when the awaited operation needs to resume on that blocked context. This is a common failure mode, not an unconditional outcome for every await.

# Reflection questions

1. Why does making a method `async` not automatically run its CPU-bound loops on a background thread?
2. What is the key operational difference between catching `Exception` versus catching `OperationCanceledException` when dealing with canceled tasks?
3. When should you choose `ValueTask<T>` over `Task<T>`, and what are the strict usage constraints you must follow?
4. How does `ConfigureAwait(false)` change how continuations are scheduled, and when can it be appropriate for library code?

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
