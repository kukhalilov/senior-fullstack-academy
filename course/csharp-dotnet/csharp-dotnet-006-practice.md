<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine you run a restaurant kitchen. If the chef has to stand completely still and stare at the oven while a cake bakes for 30 minutes, the restaurant stops. No other food gets prepared. 

In programming, **synchronous** code works like that chef: it blocks the execution thread—the worker handling the tasks—until a slow operation (like downloading a file from the internet or reading a large database) finishes. 

**Asynchronous** programming allows the worker to say, "Start downloading this file, and while I wait for the data to arrive over the network, let me go chop vegetables or serve customers." When the download finishes, the worker comes back to finish processing the file. In C#, we use the `async` and `await` keywords to write this kind of non-blocking code easily.

Sometimes, a task takes too long or the user changes their mind. This is where **cancellation** comes in. Imagine a customer orders a pizza, but 2 minutes later they call to cancel it. The kitchen needs a way to tell the chef: "Stop making that specific pizza immediately so we don't waste ingredients." In C#, we handle this using a **Cancellation Token** (`CancellationToken`). It acts as a messaging system that signals a running operation to stop early safely.

*Key Technical Terms:*
*   **Thread:** An operating system path of execution. Think of it as a single worker in the kitchen.
*   **Blocking:** Freezing a thread so it cannot do any other work until an operation completes.
*   **Non-blocking:** Freezing nothing; the thread is released to do other work while waiting.
*   **Token:** A small object passed to an operation that acts as a remote control to cancel or stop that operation.

---

## How it works

Modern C# asynchronous programming revolves around the **Task-based Asynchronous Pattern (TAP)**. 

### The `async` and `await` Keywords
When you mark a method with the `async` keyword, you enable the use of the `await` operator inside it. 
1. When the code hits an `await` statement on an incomplete asynchronous operation (like `Task.Delay` or an HTTP request), the method yields control back to its caller.
2. The current thread is released back to a pool of available threads (the Thread Pool) to handle other requests rather than sitting idle.
3. Once the awaited operation finishes, a thread (not necessarily the same one, depending on the synchronization context) picks up the remaining code after the `await` and continues execution.

### Cancellation with `CancellationToken`
Cancellation in .NET is **cooperative**. A running task cannot be forcefully killed from the outside safely because that could leave files half-written or memory corrupted. Instead, the caller signals a request to cancel, and the running code periodically checks if a cancellation has been requested.

1. **`CancellationTokenSource` (CTS):** The creator and controller of the token. It has a method called `Cancel()` which triggers the cancellation signal. It can also be configured to automatically cancel after a time delay (`new CancellationTokenSource(TimeSpan.FromSeconds(5))`).
2. **`CancellationToken`:** A lightweight struct passed into asynchronous methods. The running code checks `token.IsCancellationRequested` or calls `token.ThrowIfCancellationRequested()` to abort execution.

---

## Examples

Below is a complete, runnable console application demonstrating asynchronous execution and cooperative cancellation using `CancellationToken`.

```csharp
using System;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static async Task Main(string[] args)
    {
        Console.WriteLine("=== Asynchronous Programming & Cancellation Demo ===");

        // Create a Cancellation Token Source that cancels automatically after 3 seconds.
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(3));
        
        // Example 1: Running an async operation that supports cancellation
        try
        {
            Console.WriteLine("\nStarting background download simulation...");
            // Pass the token to our custom method
            await DownloadDataAsync(cts.Token);
            Console.WriteLine("Download completed successfully.");
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("--> Operation was successfully cancelled!");
        }

        Console.WriteLine("\nDemo finished. Press any key to exit.");
    }

    // A simulated asynchronous method that respects cancellation
    public static async Task DownloadDataAsync(CancellationToken cancellationToken)
    {
        for (int i = 1; i <= 5; i++)
        {
            // Check if cancellation was requested before doing work
            cancellationToken.ThrowIfCancellationRequested();

            Console.WriteLine($"Downloading chunk {i}/5...");
            
            // Wait for 1 second, but allow the delay to be cancelled instantly
            await Task.Delay(1000, cancellationToken);
        }
    }
}
```

**Output Explanation:**
If you run this code, it will print chunks 1 and 2. On chunk 3, the 3-second timer inside `CancellationTokenSource` triggers. The `Task.Delay` throws an `OperationCanceledException`, which is caught in `Main`, gracefully stopping the process without crashing or freezing the app.

---

## Tradeoffs and comparisons

| Approach | Advantages | Disadvantages | Best Used For |
| :--- | :--- | :--- | :--- |
| **Synchronous (`void`/Return type)** | Simple to write, debug, and reason about step-by-step. | Blocks threads, poor scalability, wastes system resources under high load. | CPU-bound utility scripts, simple command-line tools. |
| **Asynchronous (`async`/`await`)** | High scalability, keeps UI responsive, maximizes thread utilization. | State machine overhead, cognitive load on exception handling and context flow. | I/O-bound operations (Database queries, Web APIs, File I/O). |
| **Cooperative Cancellation (`CancellationToken`)** | Safe; prevents data corruption by letting tasks clean up resources before exiting. | Requires boilerplate code to check tokens frequently; tasks ignore it if not implemented. | Any long-running asynchronous or CPU-bound operation. |

---

## Interview questions and answers

### 1. What is the difference between a synchronous operation and an asynchronous operation?
**Answer:** A synchronous operation blocks the calling thread until the work is completely finished, meaning the thread cannot do anything else. An asynchronous operation initiates a task and yields control back to the calling thread before completion, allowing it to perform other work. When the asynchronous task completes, it resumes execution using available thread resources.

### 2. Why is cancellation in .NET cooperative rather than preemptive?
**Answer:** Preemptive cancellation (forcing a thread to stop from the outside) is dangerous because it can abruptly terminate code in the middle of writing to a database, holding a memory lock, or modifying shared state, leading to memory corruption or resource leaks. Cooperative cancellation ensures that the running task is notified of the cancellation request, allowing it to safely roll back changes, close files, and release resources before exiting.

### 3. What happens if you forget to use `await` on an async method that returns a `Task`?
**Answer:** The method will run asynchronously in the background, but the calling method will continue executing immediately without waiting for it (referred to as a "fire-and-forget" call). If an unhandled exception occurs inside that unawaited task, it will become an unobserved task exception, which in older .NET versions could crash the process, though modern .NET runtimes handle unobserved exceptions differently (often logging them rather than crashing).

---

## Exercises and solutions

### Exercise 1: Implement Timeout and Cancellation
**Problem Statement:**
Write a console method named `ProcessFileAsync(string filePath, CancellationToken token)` that simulates processing 4 chunks of a file. Each chunk takes 500 milliseconds. If the total operation takes longer than 1.2 seconds, it must be cancelled automatically using a timeout. Ensure proper exception handling catches the cancellation and prints a clean message.

#### Hints
1. Use `CancellationTokenSource` with a delay constructor parameter.
2. Inside your loop, use `token.ThrowIfCancellationRequested()` or pass the token directly into `Task.Delay`.
3. Wrap your `await` call in a `try-catch` block catching `OperationCanceledException`.

#### Complete Solution
```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class Exercise1
{
    public static async Task Run()
    {
        // Set a timeout of 1200 milliseconds (1.2 seconds)
        using var cts = new CancellationTokenSource(1200);

        try
        {
            Console.WriteLine("Processing file...");
            await ProcessFileAsync("sample.txt", cts.Token);
            Console.WriteLine("File processing completed.");
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("File processing timed out and was cancelled.");
        }
    }

    public static async Task ProcessFileAsync(string filePath, CancellationToken token)
    {
        for (int i = 1; i <= 4; i++)
        {
            // Throws OperationCanceledException if token is cancelled
            token.ThrowIfCancellationRequested();

            Console.WriteLine($"Processing chunk {i} of {filePath}...");
            
            // Simulating work that takes 500ms per chunk
            await Task.Delay(500, token);
        }
    }
}
```

---

## Review questions

1. Which keyword enables the use of the `await` operator inside a C# method?
2. True or False: Passing a `CancellationToken` to an asynchronous method automatically forces the operating system to terminate the running thread immediately when cancelled.
3. What exception is typically thrown when an async operation is successfully aborted via a `CancellationToken`?

*(Answers: 1. `async`, 2. False—cancellation is cooperative, 3. `OperationCanceledException`)*

---

## Sources and limitations
*This lesson is based on official .NET documentation guidelines regarding asynchronous programming patterns and task cancellation. Content represents standard C#/.NET Core development practices up to .NET 8. Because execution environments, thread pool configurations, and third-party libraries vary, production applications should include robust logging and resource cleanup structures (like `try-finally` or `using` statements) around cancellation handlers.*
