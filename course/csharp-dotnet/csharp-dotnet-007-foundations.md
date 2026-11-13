<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine a busy kitchen. If only one chef is cooking, everything happens in order. But if four chefs share the same kitchen, they can cook four dishes at once. This is **concurrency**—doing multiple things by overlapping their execution time. **Threads** are the individual workers (chefs) inside your program.

However, sharing a kitchen causes problems. If two chefs reach for the exact same salt shaker at the exact same time, a mess happens. In programming, when two threads try to read and write the exact same variable or memory location at the same time, it causes **data corruption** or unpredictable bugs.

**Synchronization** is the rulebook and set of tools that keeps the chefs from crashing into each other. It ensures that only one chef uses the salt shaker at a time, or that a chef waits until the broth is finished before adding noodles.

### Prerequisites & Mental Models

*   **Prerequisites:** Basic C# syntax, methods, and an understanding of sequential program execution (how code runs line by line from top to bottom).
*   **Mental Model (The Shared Whiteboard):** Imagine a group of students working on a single whiteboard in a classroom. 
    *   **Variables/Memory** are the writings on the whiteboard.
    *   **Threads** are the students.
    *   If Student A is writing an equation and Student B suddenly erases half of it to write their own, the final result is garbage. 
    *   **Synchronization** is the rule: *"Raise your hand and hold the marker cap. While you hold it, no one else can touch the whiteboard."*

---

## How it works

### Definitions
*   **Process:** An independent program running in its own isolated memory space managed by the operating system.
*   **Thread:** The smallest unit of execution within a process. Multiple threads inside a process share the same memory (heap, variables, open files), which makes communication fast, but dangerous.
*   **Concurrency:** Structuring a program to handle multiple tasks overlapping in time.
*   **Parallelism:** Actually executing multiple tasks *at the exact same microsecond* using multi-core physical computer processors (CPUs).
*   **Race Condition:** A bug where the outcome of the program changes depending on the unpredictable order in which threads are scheduled by the CPU.
*   **Critical Section:** A piece of code that accesses shared resources (like variables or files) and must *not* be run by more than one thread at a time.

### C# Mechanisms for Synchronization
In C# (.NET), we prevent race conditions by locking access to critical sections.

1.  **`lock` Statement:** The most common tool. It uses a private object instance as a "token" or "key". A thread must grab the key to enter the code block. If another thread holds the key, subsequent threads must wait outside.
2.  **`Monitor` Class:** The `lock` statement is actually shorthand for `Monitor.Enter` and `Monitor.Exit` wrapped in a `try/finally` block.
3.  **`Mutex` (Mutual Exclusion):** Similar to a `lock`, but can work across different operating system processes (inter-process synchronization).
4.  **`SemaphoreSlim`:** Allows a specific, countable number of threads to access a resource simultaneously (e.g., allowing a max of 3 threads to connect to a database at once).

---

## Examples

### Example 1: The Unsafe Counter (Race Condition)
Here, 10 threads try to increment a shared counter 1,000 times each. Because the operation (`count++`) is actually three steps under the hood (read value, add 1, write value), threads overwrite each other.

```csharp
using System;
using System.Threading;

class UnsafeCounterExample
{
    private static int count = 0;

    static void Main()
    {
        Thread[] threads = new Thread[10];

        for (int i = 0; i < 10; i++)
        {
            threads[i] = new Thread(IncrementCounter);
            threads[i].Start();
        }

        // Wait for all threads to finish
        foreach (var t in threads)
        {
            t.Join();
        }

        // Expected: 10,000. Actual: Usually much lower due to race conditions.
        Console.WriteLine($"Final Count (Unsafe): {count}");
    }

    static void IncrementCounter()
    {
        for (int i = 0; i < 1000; i++)
        {
            count++; // CRITICAL SECTION: Unsafe read-modify-write
        }
    }
}
```

### Example 2: The Safe Counter (`lock` statement)
We fix the race condition by introducing a private lock object. Only one thread can execute the increment code at a time.

```csharp
using System;
using System.Threading;

class SafeCounterExample
{
    private static int count = 0;
    private static readonly object padlock = new object(); // The synchronization token

    static void Main()
    {
        Thread[] threads = new Thread[10];

        for (int i = 0; i < 10; i++)
        {
            threads[i] = new Thread(IncrementCounterSafe);
            threads[i].Start();
        }

        foreach (var t in threads)
        {
            t.Join();
        }

        // Expected and Actual: Exactly 10,000.
        Console.WriteLine($"Final Count (Safe): {count}");
    }

    static void IncrementCounterSafe()
    {
        for (int i = 0; i < 1000; i++)
        {
            lock (padlock)
            {
                count++; // CRITICAL SECTION: Protected by lock
            }
        }
    }
}
```

---

## Tradeoffs and comparisons

| Synchronization Tool | Scope | Performance Cost | Best Used For |
| :--- | :--- | :--- | :--- |
| **`lock` / `Monitor`** | Single Process (Managed Threads) | Very Low (Fast path uses internal optimizations) | Protecting in-memory data structures and critical sections within a single application. |
| **`Mutex`** | Cross-Process (Machine-wide) | High (Involves operating system kernel transitions) | Ensuring only *one instance* of an application runs on a machine at a time. |
| **`SemaphoreSlim`** | Single Process | Medium | Limiting concurrent access to a finite resource pool (e.g., connection limits). |
| **`Interlocked` Class** | Single Variables | Extremely Low (CPU-level atomic instructions) | Simple mathematical operations (`Interlocked.Increment(ref x)`) without heavy locks. |

*   **Tradeoff:** Synchronization prevents bugs, but it destroys concurrency if abused. If you wrap your entire program in a single `lock`, your multi-threaded application becomes strictly slower than a single-threaded one due to **lock contention** (threads waiting around doing nothing).

---

## Interview questions and answers

**1. What is the difference between concurrency and parallelism?**
*   **Answer:** Concurrency is about *structure*—dealing with lots of things at once by context-switching. Parallelism is about *execution*—doing lots of things at the exact same physical instant using multiple CPU cores. A single-core CPU can be concurrent, but only a multi-core CPU can be parallel.

**2. Why is `count++` not thread-safe?**
*   **Answer:** Even though it looks like a single line of code, `count++` is compiled into three distinct machine instructions: 1) Read the current value of `count` from memory into a CPU register. 2) Add 1 to that register. 3) Write the new value back to memory. If Thread A reads the value, gets interrupted, and Thread B reads the same old value, one of the updates gets overwritten.

**3. What is a Deadlock and how can you avoid it?**
*   **Answer:** A deadlock happens when Thread 1 holds Lock A and waits for Lock B, while Thread 2 holds Lock B and waits for Lock A. Both freeze forever. You can avoid deadlocks by establishing a strict global lock-acquisition order (always acquire locks in the same numerical or alphabetical order) or by using timeouts (`Monitor.TryEnter`).

**4. What is the purpose of the `volatile` keyword in C#?**
*   **Answer:** The `volatile` keyword tells the C# compiler and CPU that a field might be modified by multiple threads running simultaneously. It prevents the compiler from caching the variable's value inside a CPU register, forcing the thread to read the freshest value directly from main memory. (Note: It does *not* make compound operations like `count++` atomic).

---

## Exercises and solutions

### DSA Problem: Thread-Safe Bounded Queue (Producer-Consumer)

#### Problem Statement
Implement a thread-safe fixed-size queue in C# that supports two methods: `Enqueue(int item)` and `Dequeue()`. 
*   If a producer calls `Enqueue` and the queue is full, the thread must block (wait) until space becomes available.
*   If a consumer calls `Dequeue` and the queue is empty, the thread must block (wait) until an item is added.
*   Use `Monitor.Wait` and `Monitor.PulseAll` for synchronization.

#### Progressive Hints
1.  **Hint 1:** Use a standard `Queue<int>` internally to store items and a maximum capacity integer.
2.  **Hint 2:** Wrap every modification or inspection of the queue inside a `lock(queueLock)` block.
3.  **Hint 3:** Use `Monitor.Wait(queueLock)` when a condition isn't met (e.g., queue is full for enqueuing). `Wait` automatically releases the lock and puts the thread to sleep until notified.
4.  **Hint 4:** Use `Monitor.PulseAll(queueLock)` after adding or removing an item to wake up any sleeping threads waiting for space or items.

#### Working C# Solution
```csharp
using System;
using System.Collections.Generic;
using System.Threading;

public class ThreadSafeQueue
{
    private readonly Queue<int> _queue = new Queue<int>();
    private readonly int _capacity;
    private readonly object _lock = new object();

    public ThreadSafeQueue(int capacity)
    {
        _capacity = capacity;
    }

    public void Enqueue(int item)
    {
        lock (_lock)
        {
            // Wait while the queue is full
            while (_queue.Count >= _capacity)
            {
                Monitor.Wait(_lock); // Releases lock and sleeps
            }

            _queue.Enqueue(item);
            Console.WriteLine($"Enqueued: {item}. Count: {_queue.Count}");

            // Wake up any waiting consumers or producers
            Monitor.PulseAll(_lock);
        }
    }

    public int Dequeue()
    {
        lock (_lock)
        {
            // Wait while the queue is empty
            while (_queue.Count == 0)
            {
                Monitor.Wait(_lock); // Releases lock and sleeps
            }

            int item = _queue.Dequeue();
            Console.WriteLine($"Dequeued: {item}. Count: {_queue.Count}");

            // Wake up any waiting producers or consumers
            Monitor.PulseAll(_lock);

            return item;
        }
    }
}
```

#### Example Usage
```csharp
class Program
{
    static void Main()
    {
        ThreadSafeQueue tsQueue = new ThreadSafeQueue(3); // Capacity of 3

        // Producer thread
        Thread producer = new Thread(() => {
            for (int i = 1; i <= 5; i++) {
                tsQueue.Enqueue(i);
                Thread.Sleep(100); // simulate work
            }
        });

        // Consumer thread
        Thread consumer = new Thread(() => {
            for (int i = 1; i <= 5; i++) {
                tsQueue.Dequeue();
                Thread.Sleep(200); // simulate slow consumption
            }
        });

        producer.Start();
        consumer.Start();

        producer.Join();
        consumer.Join();
    }
}
```

#### Edge Cases Handled
*   **Spurious Wakeups:** Using a `while` loop instead of an `if` statement when checking queue conditions ensures that if a thread wakes up randomly without a notification, it re-verifies the queue state before proceeding.
*   **Thread Starvation:** `PulseAll` ensures that all waiting threads get notified rather than just one, preventing a dead thread scenario.

#### Complexity
*   **Time Complexity:** $O(1)$ for both `Enqueue` and `Dequeue` operations (excluding waiting time).
*   **Space Complexity:** $O(N)$ where $N$ is the maximum capacity of the queue.

---

## Review questions

1. What is the primary risk of running multi-threaded code without synchronization primitives?
2. Explain the difference between `Monitor.Wait` and a standard CPU sleep (`Thread.Sleep`).
3. Why should you avoid locking on public types or `this` inside a class instance? (Hint: External code could lock on your instance and cause unintended deadlocks).
4. Under what conditions would you choose `Interlocked.Increment` over a `lock` statement?

---

## Sources and limitations

*   **Uncertainty Note:** Exact operating system scheduling behavior, thread context-switch timings, and kernel-level wait times are non-deterministic and vary wildly across Windows, Linux, and macOS environments, as well as different hardware CPU architectures.
*   **Limitations:** This lesson covers the *foundations* of threads and locks in C#. Modern .NET development heavily uses `Task` and `async/await` (Task Asynchronous Pattern), which abstracts away raw thread management, though the underlying principles of synchronization remain identical. No external online sources were cited or verified; concepts are derived from standard .NET runtime specifications.
