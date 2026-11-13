<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine a busy kitchen. You (the main program) hire several chefs (threads) to cook dinner. If all chefs try to use the same stove, the same cutting board, and the same mixing bowl at the exact same time, chaos happens: ingredients get mixed up, food burns, and the kitchen might even catch fire. 

**Concurrency** is having multiple chefs in the kitchen. **Synchronization** is the set of rules and tools you give them so they take turns using shared tools safely and finish the meal correctly.

In C# and .NET, a **thread** is the smallest unit of execution that the operating system can run. **Concurrency** is when multiple tasks make progress overlap in time. **Synchronization** is how we coordinate these threads so they do not step on each other's toes. 

When two threads try to change the same piece of data at the same time, we get a **race condition**—a bug where the final result depends on the unpredictable order in which the threads run. To prevent this, we use synchronization primitives like `lock` (monitors), `SemaphoreSlim`, or thread-safe collections to ensure **mutual exclusion** (only one thread accesses the resource at a time).

---

## How it works

### The .NET Thread Pool
Creating and destroying operating system threads is expensive in terms of memory and CPU time. Instead of manually creating new threads (`new Thread(...)`), modern .NET applications rely on the **Thread Pool**. The Thread Pool maintains a cache of reusable threads to execute work items efficiently.

### Critical Sections and Mutual Exclusion
A **critical section** is a block of code that accesses a shared resource (like a global variable, a database connection, or a file) which must not be concurrently accessed by more than one thread.

*   **`lock` statement (Monitors):** In C#, the `lock` statement is syntactic sugar for `Monitor.Enter` and `Monitor.Exit`. It ensures that only one thread can enter the locked block of code at a time. Other threads block (wait) until the lock is released.
*   **`SemaphoreSlim`:** A lightweight semaphore that limits the number of threads that can simultaneously access a resource. A semaphore with a maximum count of 1 acts much like a mutex (`lock`), but it can be awaited asynchronously (`await semaphore.WaitAsync()`).

### Asynchronous vs. Synchronous Concurrency
In modern C#, synchronization often involves `async` and `await`. 
*   **Synchronous locking (`lock`):** Blocks the physical thread while waiting. This wastes Thread Pool threads if held for long operations (like I/O).
*   **Asynchronous locking (`SemaphoreSlim.WaitAsync`):** Frees the physical thread to do other work while waiting for access, resuming execution when the lock becomes available.

---

## Examples

### Example 1: The Race Condition (Unsynchronized)
This program demonstrates a race condition. Two threads increment a shared counter 1,000,000 times. Because the increment operation (`counter++`) is not atomic (it involves reading, adding, and writing back), the final count will be less than 2,000,000.

```csharp
using System;
using System.Threading;

class Program
{
    static int counter = 0;

    static void Main()
    {
        Thread t1 = new Thread(IncrementCounter);
        Thread t2 = new Thread(IncrementCounter);

        t1.Start();
        t2.Start();

        t1.Join(); // Wait for t1 to finish
        t2.Join(); // Wait for t2 to finish

        Console.WriteLine($"Expected: 2000000");
        Console.WriteLine($"Actual:   {counter}");
    }

    static void IncrementCounter()
    {
        for (int i = 0; i < 1_000_000; i++)
        {
            counter++; // Not atomic! Race condition occurs here.
        }
    }
}
```

### Example 2: Thread Synchronization using `lock`
Here we fix the race condition by introducing a private object used exclusively for locking (`lockObject`).

```csharp
using System;
using System.Threading;

class Program
{
    static int counter = 0;
    static readonly object lockObject = new object();

    static void Main()
    {
        Thread t1 = new Thread(IncrementCounterSafe);
        Thread t2 = new Thread(IncrementCounterSafe);

        t1.Start();
        t2.Start();

        t1.Join();
        t2.Join();

        Console.WriteLine($"Expected: 2000000");
        Console.WriteLine($"Actual:   {counter}");
    }

    static void IncrementCounterSafe()
    {
        for (int i = 0; i < 1_000_000; i++)
        {
            lock (lockObject)
            {
                counter++; // Thread-safe! Only one thread enters at a time.
            }
        }
    }
}
```

### Example 3: Asynchronous Coordination with `SemaphoreSlim`
When working with `async/await`, standard `lock` statements are not allowed because you cannot cross an `await` boundary inside a `lock`. We use `SemaphoreSlim` instead.

```csharp
using System;
using System.Threading.Tasks;

class Program
{
    static int asyncCounter = 0;
    static readonly SemaphoreSlim semaphore = new SemaphoreSlim(1, 1);

    static async Task Main()
    {
        Task task1 = IncrementAsync();
        Task task2 = IncrementAsync();

        await Task.WhenAll(task1, task2);

        Console.WriteLine($"Async Counter Final Value: {asyncCounter}");
    }

    static async Task IncrementAsync()
    {
        for (int i = 0; i < 100_000; i++)
        {
            await semaphore.WaitAsync(); // Asynchronously wait for the lock
            try
            {
                asyncCounter++;
            }
            finally
            {
                semaphore.Release(); // Always release in a finally block!
            }
        }
    }
}
```

---

## Tradeoffs and comparisons

| Synchronization Tool | Best Used For | Pros | Cons |
| :--- | :--- | :--- | :--- |
| **`lock` (Monitor)** | Synchronous code, short critical sections. | Very fast, simple syntax, automatic cleanup. | Cannot be used across `await` statements; blocks the thread while waiting. |
| **`SemaphoreSlim`** | Async/await code, controlling concurrency limits (e.g., throttling database calls). | Supports asynchronous waiting (`WaitAsync`); can allow $N$ concurrent threads. | Slightly higher overhead than `lock`; requires manual `Release()` in a `try/finally` block. |
| **`Mutex`** | Cross-process synchronization (coordinating multiple running apps). | Works across operating system boundaries. | Heavyweight; significantly slower performance than in-process locks. |
| **`Interlocked`** | Simple numeric operations (`++`, `--`, additions). | Extremely fast (lock-free, uses CPU-level instructions). | Limited to basic arithmetic and reference assignments; cannot protect complex blocks of code. |

---

## Interview questions and answers

### 1. What is a race condition, and how do you prevent it?
**Answer:** A race condition occurs when two or more threads access shared mutable data concurrently, and at least one access is a write. Because thread scheduling is unpredictable, the outcome depends on the exact timing of thread execution. We prevent race conditions using synchronization mechanisms like the C# `lock` statement, `SemaphoreSlim`, or atomic operations via the `Interlocked` class to ensure mutual exclusion.

### 2. Why can't you use a `lock` statement around an `await` expression?
**Answer:** The C# `lock` statement relies on `Monitor.Enter` and `Monitor.Exit`, which tie the lock ownership to a specific physical operating system thread. When an `async` method hits an `await`, the method may resume execution on a completely *different* thread from the Thread Pool. Because the thread that exits the code block would be different from the thread that entered it, the runtime throws a synchronization lock exception. Use `SemaphoreSlim` with `WaitAsync` instead.

### 3. What is a deadlock, and what are the four conditions required for it to occur?
**Answer:** A deadlock is a state where two or more threads are permanently blocked, each waiting for a resource that the other thread holds. 
The four Coffman conditions for deadlock are:
1. **Mutual Exclusion:** Resources cannot be shared; only one thread can use them at a time.
2. **Hold and Wait:** A thread holds one resource while waiting to acquire another.
3. **No Preemption:** A resource cannot be forcibly taken from a thread holding it.
4. **Circular Wait:** Thread A waits for Thread B, which waits for Thread A (or a longer chain).

---

## Exercises and solutions

### DSA Problem: Thread-Safe Bounded Blocking Queue
Implement a thread-safe generic queue in C# with a fixed maximum capacity (`capacity`). It must support two methods:
* `Enqueue(T item)`: Adds an item to the queue. If the queue is full, calling threads must block until space becomes available.
* `Dequeue()`: Removes and returns the oldest item. If the queue is empty, calling threads must block until an item becomes available.

#### Progressive Hints
1. **Hint 1:** You need an underlying data structure like `Queue<T>` to store items.
2. **Hint 2:** Use a synchronization object (like `lock` combined with `Monitor.Wait` and `Monitor.PulseAll`) or 2 `SemaphoreSlim` instances (one tracking available items, one tracking available spaces) to manage blocking safely.
3. **Hint 3:** Using `SemaphoreSlim` makes this extremely clean. Let `itemsSemaphore` count current items (initial 0, max capacity) and `spaceSemaphore` count empty slots (initial capacity, max capacity).

#### C# Working Solution
```csharp
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

public class BoundedBlockingQueue<T>
{
    private readonly Queue<T> _queue = new Queue<T>();
    private readonly int _capacity;
    private readonly SemaphoreSlim _itemsSemaphore;
    private readonly SemaphoreSlim _spaceSemaphore;
    private readonly object _lockObject = new object();

    public BoundedBlockingQueue(int capacity)
    {
        _capacity = capacity;
        _itemsSemaphore = new SemaphoreSlim(0, capacity);
        _spaceSemaphore = new SemaphoreSlim(capacity, capacity);
    }

    public void Enqueue(T item)
    {
        // Wait until there is free space in the queue
        _spaceSemaphore.Wait();

        lock (_lockObject)
        {
            _queue.Enqueue(item);
        }

        // Signal that a new item is available to be dequeued
        _itemsSemaphore.Release();
    }

    public T Dequeue()
    {
        // Wait until there is at least one item in the queue
        _itemsSemaphore.Wait();

        T item;
        lock (_lockObject)
        {
            item = _queue.Dequeue();
        }

        // Signal that a new space has opened up in the queue
        _spaceSemaphore.Release();

        return item;
    }
}
```

#### Example Usage
```csharp
class Program
{
    static async Task Main()
    {
        var queue = new BoundedBlockingQueue<int>(2); // Capacity of 2

        // Producer task
        Task producer = Task.Run(() =>
        {
            for (int i = 1; i <= 5; i++)
            {
                Console.WriteLine($"Enqueueing: {i}");
                queue.Enqueue(i);
            }
        });

        // Consumer task
        Task consumer = Task.Run(() =>
        {
            for (int i = 1; i <= 5; i++)
            {
                // Simulate slow consumer
                Thread.Sleep(500); 
                int item = queue.Dequeue();
                Console.WriteLine($"  Dequeued: {item}");
            }
        });

        await Task.WhenAll(producer, consumer);
    }
}
```

#### Edge Cases
* **Capacity of 1:** Works as a direct hand-off rendezvous channel.
* **Rapid concurrent producers and consumers:** Handled correctly because semaphores maintain internal thread-safe counters.

#### Complexity Analysis
* **Time Complexity:** $O(1)$ amortized for both `Enqueue` and `Dequeue` operations (excluding waiting time when blocked).
* **Space Complexity:** $O(K)$ where $K$ is the maximum capacity of the queue.

---

## Review questions

1. What is the difference between concurrency and parallelism?
2. What happens if you forget to call `Release()` on a `SemaphoreSlim` inside a `try/finally` block?
3. When should you prefer `Interlocked.Increment` over a `lock` statement?
4. How does the Thread Pool optimize thread management in .NET?

---

## Sources and limitations

* **Sources:** Concepts are based on standard Microsoft .NET documentation regarding multithreading, synchronization primitives (`Monitor`, `SemaphoreSlim`, `Interlocked`), and asynchronous programming patterns. External URLs are omitted to prevent link rot and adhere strictly to instructions against inventing links.
* **Limitations:** This lesson focuses on managed in-memory synchronization in C#. Distributed locking across multiple servers (e.g., using Redis or SQL Server locks) requires specialized external infrastructure not covered here.
