<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Imagine a busy kitchen in a restaurant. 
* **Process:** The entire restaurant building. It has its own kitchen, dining room, and storage, separated from other restaurants.
* **Thread:** An individual cook working inside the kitchen. A restaurant can have one cook (single-threaded) or many cooks (multithreaded) preparing meals simultaneously.

**Concurrency** is the restaurant structure: multiple orders are in progress at the same time. Cooks switch back and forth between chopping vegetables, watching the stove, and plating food. If there is only one cook, they switch tasks so fast it *looks* like everything happens at once.

**Parallelism** is the physical execution: having multiple cooks actually working on different stoves at the exact same second, utilizing a multi-core processor.

**Synchronization** is the set of rules the cooks use so they don’t ruin the food. If two cooks try to grab the exact same bottle of olive oil at the same time, or if one cook tries to slice a tomato while another cook is moving the cutting board, chaos ensues. Synchronization tools (like locks) ensure only one cook uses a shared resource (like the cutting board or olive oil) at a time.

In C#, threads are the operating system-level or runtime-managed workers executing your code. When multiple threads access shared variables simultaneously without coordination, you get **race conditions** (data corruption) and **deadlocks** (threads stuck waiting for each other forever).

---

## How it works

### The C# Concurrency Model
Historically, C# relied heavily on raw OS threads via `System.Threading.Thread`. Today, modern C# relies on the **Task Parallel Library (TPL)** and the **ThreadPool**, which manage threads efficiently behind the scenes.

```
[ Your Code / Tasks ] 
        ↓ (queued into)
[ ThreadPool ] (Managed pool of reusable worker threads)
        ↓ (executed on)
[ CPU Cores ] (Hardware parallelism)
```

### Core Synchronization Primitives in .NET
1. **`lock` statement (Monitor):** Syntactic sugar around `System.Threading.Monitor`. It ensures exclusive access to a block of code for a single thread.
2. **`Mutex`:** A synchronization primitive that can also span across different operating system processes (inter-process synchronization). Slower than `lock`.
3. **`SemaphoreSlim` / `Semaphore`:** Limits the number of threads that can access a resource concurrently (useful for rate-limiting or connection pools).
4. **`ReaderWriterLockSlim`:** Optimizes access for scenarios where reads are frequent (many threads reading) but writes are rare (only one thread writing).
5. **`volatile` keyword:** Tells the C# compiler and CPU not to cache a variable in a register, forcing reads and writes directly to main memory.
6. **`Thread.Yield()` vs `Thread.Sleep()` vs `Task.Delay()`:** 
   * `Yield()` tells the OS to give up the current processor time slice to another thread of equal priority.
   * `Sleep()` blocks the current thread for a specified time.
   * `Delay()` is asynchronous; it frees the thread back to the ThreadPool while waiting.

### Memory Barriers and Visibility
Modern CPUs optimize code by reordering instructions and caching variables in local CPU registers or cache lines. Without synchronization primitives or `volatile`, Thread A might update a boolean flag, but Thread B running on another CPU core might never see the update. Synchronization primitives create **memory barriers** (or fences) that guarantee visibility across cores.

---

## Examples

### Example 1: The Race Condition and the `lock` Fix
When two threads increment a shared counter without protection, the operation (`counter++`) is actually three machine instructions: read, increment, write. Threads can interleave, causing lost updates.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    private static int _counter = 0;
    private static readonly object _lockObject = new object();

    static async Task Main(string[] args)
    {
        // Start 10 tasks, each incrementing the counter 1000 times
        Task[] tasks = new Task[10];
        for (int i = 0; i < 10; i++)
        {
            tasks[i] = Task.Run(() =>
            {
                for (int j = 0; j < 1000; j++)
                {
                    // UNCOMMENT TO FIX:
                    // lock (_lockObject)
                    // {
                        _counter++;
                    // }
                }
            });
        }

        await Task.WhenAll(tasks);
        
        // Expected: 10,000. Without a lock, you will frequently get a lower number.
        Console.WriteLine($"Final Counter Value: {_counter}");
    }
}
```

### Example 2: Using `SemaphoreSlim` to Throttle Concurrent Access
If you want to allow a maximum of 3 threads to access a resource (like a database connection) simultaneously:

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

class ThrottlingExample
{
    private static readonly SemaphoreSlim _semaphore = new SemaphoreSlim(3, 3);

    static async Task Main(string[] args)
    {
        Task[] tasks = new Task[10];
        for (int i = 1; i <= 10; i++)
        {
            int taskId = i;
            tasks[taskId - 1] = AccessDatabaseAsync(taskId);
        }

        await Task.WhenAll(tasks);
    }

    private static async Task AccessDatabaseAsync(int id)
    {
        Console.WriteLine($"Task {id} is waiting to enter the database.");
        
        await _semaphore.WaitAsync(); // Wait for a slot
        try
        {
            Console.WriteLine($"---> Task {id} has entered the database.");
            await Task.Delay(1000); // Simulate database work
        }
        finally
        {
            _semaphore.Release(); // Release the slot back
            Console.WriteLine($"<--- Task {id} has left the database.");
        }
    }
}
```

---

## Tradeoffs and comparisons

| Synchronization Tool | Scope | Performance Cost | Best Used For |
| :--- | :--- | :--- | :--- |
| **`lock` (Monitor)** | Intra-process (Managed) | Low (Fast path uses thin locks) | Protecting critical sections of code within an application. |
| **`SemaphoreSlim`** | Intra-process | Low-Medium | Throttling access to a limited resource pool (async-friendly). |
| **`Mutex`** | Inter-process & Intra-process | High (Kernel transitions) | Ensuring only one instance of an application runs on a machine. |
| **`ReaderWriterLockSlim`** | Intra-process | Medium | Scenarios with heavy read loads and infrequent writes. |
| **`volatile`** | Variable-level | Negligible | Simple flag indicators shared across threads without complex logic. |

### Tradeoffs Analysis
* **Granularity vs. Overhead:** Locking a large block of code reduces concurrency because other threads must wait longer. Locking tiny blocks increases overhead (CPU cycles spent acquiring/releasing locks).
* **Deadlocks:** The primary risk of synchronization. Occurs when Thread A holds Lock 1 and waits for Lock 2, while Thread B holds Lock 2 and waits for Lock 1.

---

## Interview questions and answers

### Q1: What is the difference between a process and a thread?
**Answer:** 
* A **process** is an independent execution environment managed by the operating system. It has its own private memory address space, handles, and resources. Processes are isolated from one another.
* A **thread** is the smallest unit of execution within a process. Multiple threads inside the same process share the same memory heap, file descriptors, and global variables, but each thread retains its own execution stack and CPU register state.

### Q2: What is a deadlock, and what are the four Coffman conditions required for it to occur?
**Answer:** 
A deadlock is a state where two or more threads are permanently blocked, each waiting for a resource that the other thread holds. 
The four conditions are:
1. **Mutual Exclusion:** Resources cannot be shared; only one thread can hold a resource at a time.
2. **Hold and Wait:** A thread holds at least one resource while waiting to acquire another resource held by another thread.
3. **No Preemption:** Resources cannot be forcibly taken away from a thread; they can only be released voluntarily.
4. **Circular Wait:** A closed chain of threads exists, where Thread A waits for Thread B, and Thread B waits for Thread A.

### Q3: How does the `lock` statement work under the hood in C#?
**Answer:** 
The `lock(obj)` statement is syntactically translated by the C# compiler into a call to `Monitor.Enter(obj)` wrapped in a `try...finally` block. 
```csharp
object obj = new object();
Monitor.Enter(obj);
try
{
    // Critical section
}
finally
{
    Monitor.Exit(obj);
}
```
If the lock cannot be acquired immediately, the calling thread is blocked (put to sleep by the runtime) until the lock is released.

### Q4: What is the difference between `Monitor.Enter` and `Monitor.TryEnter`?
**Answer:** 
* `Monitor.Enter` blocks the current thread indefinitely until it successfully acquires the lock.
* `Monitor.TryEnter` attempts to acquire the lock immediately (or within a specified timeout). It returns a boolean (`true` if the lock was acquired, `false` otherwise), allowing threads to avoid blocking or implement fallback behavior, which helps prevent deadlocks.

### Q5: Explain how `ReaderWriterLockSlim` works and when you should use it.
**Answer:** 
`ReaderWriterLockSlim` manages a resource that allows multiple concurrent readers *or* a single exclusive writer at any given time. 
* **Read mode:** Multiple threads can acquire the read lock simultaneously, provided no thread holds or is waiting for a write lock.
* **Write mode:** Only one thread can acquire the write lock, and all readers/writers are blocked.
* **Use case:** Caching systems or configuration dictionaries where lookups (reads) happen 99% of the time, and updates (writes) happen rarely. Using a standard `lock` would unnecessarily bottleneck all concurrent readers.

---

## Exercises and solutions

### DSA Problem: Thread-Safe Bounded Blocking Queue
**Problem Statement:**  
Implement a thread-safe, generic bounded blocking queue in C# named `SafeBlockingQueue<T>`. It must support two methods:
1. `Enqueue(T item)`: Adds an item to the queue. If the queue has reached its maximum capacity, the calling thread must block until space becomes available.
2. `Dequeue()`: Removes and returns the item from the front of the queue. If the queue is empty, the calling thread must block until an item becomes available.

#### Progressive Hints
* **Hint 1:** Use a standard collection like `Queue<T>` internally to hold the elements, but protect all operations with a synchronization mechanism.
* **Hint 2:** To make threads sleep and wake up efficiently without burning CPU cycles (spin-waiting), use `Monitor.Wait` and `Monitor.PulseAll` (or C#'s `lock` combined with conditional waiting, or `SemaphoreSlim`).
* **Hint 3:** Remember that `Monitor.Wait` releases the lock while waiting and re-acquires it automatically upon waking up. Always wrap checks in a `while` loop to guard against spurious wakeups.

#### Working C# Solution

```csharp
using System;
using System.Collections.Generic;
using System.Threading;

public class SafeBlockingQueue<T>
{
    private readonly Queue<T> _queue = new Queue<T>();
    private readonly int _capacity;
    private readonly object _lockObject = new object();

    public SafeBlockingQueue(int capacity)
    {
        if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
        _capacity = capacity;
    }

    public void Enqueue(T item)
    {
        lock (_lockObject)
        {
            // Wait while the queue is full (use a while loop to handle spurious wakeups)
            while (_queue.Count >= _capacity)
            {
                Monitor.Wait(_lockObject);
            }

            _queue.Enqueue(item);

            // Notify waiting consumer threads that an item is available
            Monitor.PulseAll(_lockObject);
        }
    }

    public T Dequeue()
    {
        lock (_lockObject)
        {
            // Wait while the queue is empty
            while (_queue.Count == 0)
            {
                Monitor.Wait(_lockObject);
            }

            T item = _queue.Dequeue();

            // Notify waiting producer threads that space is available
            Monitor.PulseAll(_lockObject);

            return item;
        }
    }

    public int Count
    {
        get
        {
            lock (_lockObject)
            {
                return _queue.Count;
            }
        }
    }
}
```

#### Example Usage
```csharp
class Program
{
    static async Task Main(string[] args)
    {
        var queue = new SafeBlockingQueue<int>(capacity: 5);

        // Producer Task
        var producer = Task.Run(() =>
        {
            for (int i = 1; i <= 10; i++)
            {
                queue.Enqueue(i);
                Console.WriteLine($"Produced: {i}");
                Thread.Sleep(100);
            }
        });

        // Consumer Task
        var consumer = Task.Run(() =>
        {
            for (int i = 1; i <= 10; i++)
            {
                int item = queue.Dequeue();
                Console.WriteLine($"Consumed: {item}");
                Thread.Sleep(200);
            }
        });

        await Task.WhenAll(producer, consumer);
    }
}
```

#### Edge Cases Handled
* **Capacity of 1:** Handled correctly; producers block immediately after 1 item until consumed.
* **Spurious Wakeups:** Handled by evaluating `while (_queue.Count == 0)` instead of `if`.
* **Thread Interleaving:** Complete mutual exclusion ensured via `lock (_lockObject)`.

#### Complexity Analysis
* **Time Complexity:** 
  * `Enqueue`: $O(1)$ amortized (queue insertion).
  * `Dequeue`: $O(1)$ (queue removal).
* **Space Complexity:** $O(N)$ where $N$ is the maximum capacity of the queue.

---

## Review questions

1. What is the difference between `Monitor.Pulse` and `Monitor.PulseAll`? When should you use `PulseAll`?
2. Why is a `while` loop recommended instead of an `if` statement when waiting on a condition variable (`Monitor.Wait` or async equivalent)?
3. What is thread starvation, and how does it differ from a deadlock?
4. Can you use an ordinary `string` literal as a locking object in C# (`lock("myLock")`)? Why or why not?
5. How does the async/await pattern differ from multithreading in terms of thread usage?

---

## Sources and limitations

* **Sources:** Based on standard Microsoft .NET documentation, multi-threading architectural principles, and operating system synchronization theory.
* **Limitations:** Code examples are simplified for educational clarity and do not account for specialized performance tuning (such as custom spin-wait counters or high-throughput lock-free ring buffers). External library behaviors or platform-specific runtime behaviors (such as Mono vs. .NET Core/.NET 8) are not exhaustively covered.
