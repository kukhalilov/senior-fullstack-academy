<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you run a bustling coffee shop. 
* **Synchronous programming** means you take one customer's order, grind the beans, brew the coffee, hand it over, and *only then* look at the next person in line. If the espresso machine takes 30 seconds to heat up, everyone stands and waits. The cashier does nothing else.
* **Asynchronous programming** means when the espresso machine is heating up, the cashier immediately takes the next customer's order or cleans the counter. When the coffee is ready, a bell rings, and the cashier finishes serving that order. Nobody is blocked waiting idly.

In software, **asynchronous programming** allows your program to start a long-running task (like downloading a file, querying a database, or calling a web API) and release the current thread to do other work while waiting. When the task finishes, the program resumes where it left off.

**Cancellation** is like a customer changing their mind while waiting for their coffee. Instead of letting the barista waste time finishing a drink nobody wants, the shop instantly stops making it and throws away the ingredients. In C#, cancellation allows you to stop a running operation early to save CPU cycles, memory, battery, and network bandwidth.

## How it works

C# manages asynchronous code primarily using the Task Asynchronous Pattern (TAP), driven by the `async` and `await` keywords, and coordinates cancellation via the `CancellationTokenSource` and `CancellationToken` types.

### 1. The `async` and `await` keywords
* When a method is marked `async`, you can use the `await` keyword inside it.
* When execution hits `await Task.Delay(1000);`, the method yields control back to its caller. The underlying operating system thread is freed up to process other requests (e.g., handling another HTTP request on a web server).
* Once the awaited task completes, execution resumes on the remainder of the method (by default, on the original synchronization context or thread pool).

### 2. Cancellation Architecture
Cancellation in .NET is **cooperative**, meaning C# cannot forcibly kill a running thread from the outside (which causes memory corruption and unstable states). Instead, the caller signals intent, and the worker code must periodically check for that signal and exit gracefully.

* **`CancellationTokenSource` (CTS):** The controller. It creates tokens and triggers the cancellation signal (by calling `Cancel()`).
* **`CancellationToken` (CT):** The listener. Passed into asynchronous methods. Code checks `token.IsCancellationRequested` or calls `token.ThrowIfCancellationRequested()`.

```
[ Caller ] ---> creates ---> [ CancellationTokenSource ]
                                     |
                                     v generates
                                [ CancellationToken ] ---> passed to ---> [ Async Method ]
```

## Examples

### Example 1: Basic Asynchronous Method with Cancellation
This example simulates downloading a large file chunk by chunk, checking for cancellation at each step.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        // Create a cancellation token source that automatically cancels after 2 seconds
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));

        try
        {
            Console.WriteLine("Starting download...");
            await DownloadLargeFileAsync(cts.Token);
            Console.WriteLine("Download completed successfully.");
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("Download was successfully cancelled!");
        }
    }

    public static async Task DownloadLargeFileAsync(CancellationToken cancellationToken)
    {
        for (int i = 1; i <= 5; i++)
        {
            // Check if cancellation was requested before doing work
            cancellationToken.ThrowIfCancellationRequested();

            Console.WriteLine($"Downloading chunk {i}/5...");
            
            // Simulate network delay
            await Task.Delay(1000, cancellationToken); 
        }
    }
}
```

## Tradeoffs and comparisons

| Concept / Approach | Pros | Cons | Best Used For |
| :--- | :--- | :--- | :--- |
| **Synchronous Execution** | Simple to write, debug, and reason about. Low overhead. | Blocks threads, poor scalability under high concurrency, UI freezes. | CPU-bound utility functions, simple command-line scripts. |
| **Async / Await** | Highly scalable, keeps UI responsive, maximizes hardware resource utilization. | Adds cognitive overhead (state machines), debugging stack traces can be harder. | I/O-bound operations (database queries, HTTP calls, file reading). |
| **Cooperative Cancellation (`CancellationToken`)** | Safe resource cleanup, avoids thread-abort corruption, predictable. | Requires manual checks or token propagation throughout codebases. | Any long-running task where user input or timeouts might abort execution. |

### Common Pitfalls
1. **`async void`:** Never use `async void` except for top-level UI event handlers. Exceptions thrown in an `async void` method cannot be caught by a `try/catch` block in the caller and will crash the entire application. Always return `async Task`.
2. **Blocking Async Code (`.Result` or `.Wait()`):** Calling `.Result` on a Task inside a synchronous method can cause deadlocks in UI or ASP.NET contexts. Always `await` tasks instead.

## Interview questions and answers

### Q1: What is the difference between concurrency and parallelism?
* **Answer:** **Concurrency** is about *dealing with lots of things at once* (structure). It means a single CPU core context-switches between multiple tasks, making progress on each. **Parallelism** is about *doing lots of things at the same time* (execution). It requires multiple CPU cores executing separate tasks simultaneously. Asynchronous programming is a technique for *concurrency*, not necessarily parallelism.

### Q2: How does the compiler handle an `async` method under the hood?
* **Answer:** The C# compiler transforms an `async` method into a complex state machine (implementing `IAsyncStateMachine`). When you hit an `await`, the method saves its local variables and execution state, yields control back to the caller, and registers a continuation callback to resume execution when the awaited task completes.

### Q3: Why is cooperative cancellation preferred over forceful thread abortion (`Thread.Abort`) in .NET?
* **Answer:** `Thread.Abort` was deprecated and removed in modern .NET (.NET Core/.NET 5+) because it forces a thread to stop immediately wherever it is executing. This can leave shared resources (like database connections, file handles, or in-memory collections) in corrupted, half-updated states. Cooperative cancellation allows code to clean up unmanaged resources, roll back transactions, and exit safely.

### Q4: Explain what happens when a `CancellationToken` is passed into `Task.Delay(1000, cancellationToken)`.
* **Answer:** `Task.Delay` hooks into the cancellation token. If the token is cancelled before the 1000ms timer expires, `Task.Delay` immediately stops waiting and throws a `TaskCanceledException` (which inherits from `OperationCanceledException`), rather than burning CPU or waiting out the full duration.

---

## Exercises and solutions

### Coding Exercise: Timeout and Retry Pattern with Cancellation

**Problem Statement:**
Write an asynchronous C# method named `FetchWithRetryAsync` that attempts to fetch data from an unreliable simulated service up to 3 times. If any individual attempt takes longer than 500 milliseconds, it should cancel that attempt, wait 200 milliseconds, and try again. Use a master `CancellationToken` to handle overall user cancellation.

#### Complete Solution

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class RetryService
{
    public static async Task<string> FetchWithRetryAsync(CancellationToken masterToken)
    {
        int maxRetries = 3;

        for (int attempt = 1; attempt <= maxRetries; attempt++)
        {
            // Throw immediately if the master token was already cancelled
            masterToken.ThrowIfCancellationRequested();

            try
            {
                // Create a timeout token source for this specific attempt (500ms)
                using var timeoutCts = new CancellationTokenSource(500);
                
                // Combine the master token with the timeout token
                using var combinedCts = CancellationTokenSource.CreateLinkedTokenSource(masterToken, timeoutCts.Token);

                Console.WriteLine($"Attempt {attempt}: Connecting...");
                return await SimulateUnreliableNetworkCallAsync(combinedCts.Token);
            }
            catch (OperationCanceledException) when (!masterToken.IsCancellationRequested)
            {
                Console.WriteLine($"Attempt {attempt} timed out or failed.");
                if (attempt == maxRetries) throw;

                // Wait before retrying (respecting masterToken so user cancellation still works)
                await Task.Delay(200, masterToken);
            }
        }

        throw new TimeoutException("All retry attempts failed.");
    }

    private static async Task<string> SimulateUnreliableNetworkCallAsync(CancellationToken token)
    {
        // Simulate a slow operation that takes 800ms (will trigger the 500ms timeout)
        await Task.Delay(800, token); 
        return "Success Data";
    }
}
```

---

## Review questions

1. **True or False:** Marking a method with the `async` keyword automatically runs it on a background thread pool thread. *(Answer: False. An `async` method runs synchronously on the calling thread until it hits the first uncompleted `await` expression.)*
2. What exception type is typically thrown when an asynchronous operation is successfully cancelled via a `CancellationToken`? *(Answer: `OperationCanceledException` or its subclass `TaskCanceledException`.)*
3. How do you combine a user-defined cancellation token with an automatic timeout token? *(Answer: Using `CancellationTokenSource.CreateLinkedTokenSource(token1, token2)`.)*

---

## Sources and limitations
* *Constraint Check:* No external source links or web verifications are claimed or included, per instructions. 
* *Scope Limitation:* This lesson covers standard .NET Task-based Asynchronous Pattern (TAP) features available in modern .NET (Core / .NET 5+). Advanced reactive programming libraries (like Rx.NET) or legacy patterns (APM, EAP) are excluded for brevity.
