<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# collections arrays list dictionary set stack queue concurrent and immutable collections — Reference: Concurrent collections, immutable snapshots, builders, and frozen read-mostly maps

# Scope and version
This reference lesson covers the exact API inventory for concurrent collections, immutable snapshots, builders, and frozen read-mostly maps within the `.NET 11 stable collection API surface checked 2026-11-14` [https://learn.microsoft.com/en-us/dotnet/standard/collections/](https://learn.microsoft.com/en-us/dotnet/standard/collections/). 

*Note: Automatically generated draft.*

# How this group fits the mental model
In modern software design, ordinary collections (like standard lists and dictionaries) are not safe for simultaneous modification by multiple threads without external locks. Furthermore, traditional mutable data structures make it difficult to pass safe data snapshots across application boundaries without defensive copying. 

This inventory addresses advanced data management challenges:
1. **Concurrent Collections**: Provide thread-safe operations for concurrent access. Implementation strategies and guarantees differ by type and operation; method-level safety does not make a sequence of calls a transaction.
2. **Immutable Collections**: Provide structural sharing, meaning updates return a *new* version of the collection while leaving the old version intact and untouched. This eliminates unintended side effects in functional pipelines.
3. **Frozen Collections**: Designed for read-heavy scenarios (introduced in .NET 8), trading construction work and memory for lookup behavior that may suit a fixed data set. Benchmark the real workload rather than assuming a universal speed advantage.

# Supplied names explained
Every name in this assigned group is explained below in its role within the broader .NET collection architecture:

* `ConcurrentDictionary<TKey,TValue>`: A thread-safe dictionary implementation designed for multi-threaded environments where keys and values are frequently updated concurrently.
* `ConcurrentDictionary<TKey,TValue>.GetOrAdd`: Thread-safely gets the value or adds a value for a missing key. Its value factory can run more than once, outside internal locks, so it must not be treated as an exactly-once side-effect hook.
* `ConcurrentDictionary<TKey,TValue>.AddOrUpdate`: Thread-safely applies the dictionary update and returns the stored result, but its add/update delegates may run multiple times outside internal locks. The method is not atomic with respect to all other dictionary operations, so keep delegates free of non-repeatable side effects and use external synchronization for a wider invariant.
* `ConcurrentDictionary<TKey,TValue>.TryAdd`: Attempts to add a key and value to the concurrent dictionary, returning a boolean indicating success or failure.
* `ConcurrentDictionary<TKey,TValue>.TryUpdate`: Updates the value associated with a specific key to a new value only if it currently matches an expected comparison value atomically.
* `ConcurrentDictionary<TKey,TValue>.TryRemove`: Attempts to remove and return the value with the specified key from the concurrent dictionary in a thread-safe manner.
* `ConcurrentDictionary<TKey,TValue>.GetEnumerator`: Returns an enumerator that is safe to use alongside concurrent reads and writes. It is not a point-in-time snapshot; enumeration can include changes made after it began [Microsoft API remarks](https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2.getenumerator).
* `ConcurrentQueue<T>`: A thread-safe first-in, first-out (FIFO) data structure supporting multiple concurrent producers and consumers.
* `ConcurrentQueue<T>.Enqueue`: Adds an item to the tail of the concurrent queue safely across threads.
* `ConcurrentQueue<T>.TryDequeue`: Attempts to remove and return the object at the beginning of the concurrent queue.
* `ConcurrentQueue<T>.TryPeek`: Attempts to return the object at the beginning of the concurrent queue without removing it.
* `ConcurrentQueue<T>.IsEmpty`: Gets a value indicating whether the concurrent queue is empty at the moment of inspection.
* `ConcurrentStack<T>`: A thread-safe last-in, first-out (LIFO) collection.
* `ConcurrentStack<T>.Push`: Inserts an object at the top of the concurrent stack.
* `ConcurrentStack<T>.PushRange`: Inserts a batch at the top atomically according to this API's contract. Do not generalize the batch guarantee to other concurrent collection methods.
* `ConcurrentStack<T>.TryPop`: Attempts to pop and return the object at the top of the concurrent stack.
* `ConcurrentStack<T>.TryPopRange`: Attempts to pop and return multiple objects from the top of the concurrent stack into an array.
* `ConcurrentStack<T>.TryPeek`: Attempts to return an object from the top of the stack without removing it.
* `ConcurrentBag<T>`: A thread-safe collection designed for scenarios where the same thread produces and consumes data objects, storing unordered items.
* `ConcurrentBag<T>.Add`: Adds an object to the concurrent bag.
* `ConcurrentBag<T>.TryTake`: Attempts to remove and return an object from the concurrent bag.
* `ConcurrentBag<T>.TryPeek`: Attempts to return an object from the concurrent bag without removing it.
* `BlockingCollection<T>`: A bounding and blocking wrapper class that restricts capacities and blocks producer or consumer threads when queues are full or empty.
* `BlockingCollection<T>.Add`: Adds an item to the blocking collection, blocking the caller if the collection has reached its bounded capacity.
* `BlockingCollection<T>.TryAdd`: Attempts to add an item to the blocking collection within an optional time limit without waiting indefinitely.
* `BlockingCollection<T>.Take`: Removes an item from the blocking collection, blocking if the collection is currently empty.
* `BlockingCollection<T>.TryTake`: Attempts to remove an item from the collection within an optional timeout period.
* `BlockingCollection<T>.CompleteAdding`: Signals to the collection that no more items will be added, waking up waiting consumer threads.
* `BlockingCollection<T>.GetConsumingEnumerable`: Provides a blocking enumeration over items in the collection, exiting when adding is completed and the collection is empty.
* `IProducerConsumerCollection<T>`: The base interface implemented by data structures like `ConcurrentQueue<T>` and `ConcurrentStack<T>` to standardize producer-consumer interactions [https://learn.microsoft.com/en-us/dotnet/standard/collections/thread-safe/](https://learn.microsoft.com/en-us/dotnet/standard/collections/thread-safe/).
* `ImmutableArray<T>`: A high-performance, structurally sound immutable array structure backed by a contiguous block of memory.
* `ImmutableList<T>`: An immutable sequence whose update methods return a new logical value while preserving prior versions; implementations can share unchanged structure rather than copying the full collection.
* `ImmutableDictionary<TKey,TValue>`: An immutable dictionary mapping keys to values.
* `ImmutableHashSet<T>`: An immutable unordered set ensuring element uniqueness.
* `ImmutableSortedDictionary<TKey,TValue>`: An immutable dictionary that keeps its keys sorted automatically.
* `ImmutableSortedSet<T>`: An immutable set that maintains elements in sorted order.
* `ImmutableQueue<T>`: An immutable first-in, first-out data structure.
* `ImmutableStack<T>`: An immutable last-in, first-out data structure.
* `IImmutableList<T>`: Represents a collection of elements that cannot be modified directly, exposing list behaviors.
* `IImmutableDictionary<TKey,TValue>`: Represents an immutable collection of key-value pairs.
* `IImmutableSet<T>`: Represents an immutable set interface.
* `ImmutableList.CreateRange<T>`: Creates an immutable list initialized with a specified sequence of elements.
* `ImmutableDictionary.CreateRange<TKey,TValue>`: Creates an immutable dictionary containing elements copied from an existing key-value sequence.
* `ImmutableHashSet.CreateRange<T>`: Creates an immutable hash set populated from a source collection.
* `ImmutableList<T>.ToBuilder`: Creates a mutable builder from an immutable list for batch modifications before producing an immutable result.
* `ImmutableDictionary<TKey,TValue>.ToBuilder`: Generates a mutable dictionary builder from an immutable dictionary instance.
* `ImmutableHashSet<T>.ToBuilder`: Generates a mutable hash set builder from an immutable hash set.
* `ImmutableList<T>.Builder.ToImmutable`: Converts a list builder back into an optimized, read-only `ImmutableList<T>`.
* `Immutable collection Builder`: The general concept and pattern of temporary mutable structures used to construct immutable collections efficiently without per-operation copying overhead.
* `ImmutableArray<T>.Builder`: A dedicated builder class optimized for constructing `ImmutableArray<T>` instances with minimal allocation.
* `FrozenDictionary<TKey,TValue>`: A read-only dictionary type introduced in .NET 8 for data that is built before a read-heavy phase [Frozen collections API](https://learn.microsoft.com/en-us/dotnet/api/system.collections.frozen). Measure construction time, memory, and lookup behavior for the target workload.
* `FrozenSet<T>`: A read-only set type introduced in .NET 8 for data that is built before a read-heavy phase [Frozen collections API](https://learn.microsoft.com/en-us/dotnet/api/system.collections.frozen). Do not assume it is faster for every size or key distribution.
* `ToFrozenDictionary`: Extension method used to convert a standard sequence or dictionary into an optimized `FrozenDictionary<TKey,TValue>`.
* `ToFrozenSet`: Extension method used to convert a standard sequence into an optimized `FrozenSet<T>`.
* `Concurrent collection atomic operation boundary`: A guarantee specific to an API operation, not a general promise that every method is atomic with respect to every other method. For example, `GetOrAdd` and `AddOrUpdate` value factories can run multiple times, and larger multi-call invariants need synchronization.
* `Thread-safe collection enumeration consistency`: Enumeration guarantees vary by type. `ConcurrentDictionary` enumeration is safe alongside concurrent operations but is not a moment-in-time snapshot; consult the specific collection contract before relying on a particular view.
* `Concurrent collection versus external lock`: The architectural choice between utilizing specialized lock-free/fine-grained concurrent collection types versus protecting a standard generic collection with explicit locks (`lock` statement).
* `Immutable update and allocation tradeoff`: The performance balance where immutable collections protect data integrity and avoid locks, but incur memory allocation costs when updating large structures.
* `Frozen collection construction versus lookup`: The design tradeoff between up-front construction and a read-heavy lookup phase. The actual benefit depends on workload and should be measured.

# Cross-item comparison
Within this specific group of concurrent, immutable, and frozen structures, choices depend entirely on data mutability patterns and thread access requirements:
* **`ConcurrentDictionary<TKey,TValue>` vs `FrozenDictionary<TKey,TValue>`**: Use a concurrent dictionary when its supported operations must update shared mappings. Consider a frozen dictionary when mappings are established before a read-heavy phase. The latter is read-only; compare measured performance and construction/memory costs for the actual data.
* **Immutable Collections vs Builders**: Immutable updates preserve old values and can share unchanged internal structure; their costs depend on the collection and operation. A builder can be more convenient or efficient for batches, then produce a new immutable value.

# Examples

## Example 1: Using `ConcurrentDictionary` with Atomic Methods
This snippet demonstrates thread-safe initialization and updates using `ConcurrentDictionary<TKey,TValue>` and `GetOrAdd` [https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent]:

```csharp
using System;
using System.Collections.Concurrent;

class Program
{
    static void Main()
    {
        ConcurrentDictionary<string, int> cache = new();

        // Atomically get value or add if missing
        int value = cache.GetOrAdd("counter", 42);
        Console.WriteLine(value);

        // Atomically update value based on existing state
        int updated = cache.AddOrUpdate("counter", 1, (key, existingVal) => existingVal + 1);
        Console.WriteLine(updated);
    }
}
```

Expected output:
```text
42
43
```

## Example 2: Efficient Creation Using Immutable Builders
This snippet illustrates how to avoid performance overhead when building immutable structures by utilizing a builder instance:

```csharp
using System;
using System.Collections.Immutable;

class Program
{
    static void Main()
    {
        // Create a builder for performance during rapid additions
        var builder = ImmutableList.CreateBuilder<string>();
        builder.Add("Alpha");
        builder.Add("Beta");
        builder.Add("Gamma");

        // Produce final immutable instance
        ImmutableList<string> immutableList = builder.ToImmutable();

        foreach (var item in immutableList)
        {
            Console.WriteLine(item);
        }
    }
}
```

Expected output:
```text
Alpha
Beta
Gamma
```

# Common mistakes
* **Assuming a concurrent method is an exactly-once transaction**: Multi-call workflows are separate operations. `GetOrAdd` and `AddOrUpdate` factories can run repeatedly and outside locks; do not place non-repeatable side effects in them. Synchronize a larger invariant explicitly.
* **Assuming immutable updates copy everything**: Immutable updates preserve old values and can structurally share data; costs differ by collection. Consider a builder for a batch, then measure if performance matters.
* **Expecting frozen collections to be modifiable**: Attempting to add or remove items from a `FrozenDictionary<TKey,TValue>` or `FrozenSet<T>` will fail because they are strictly designed as read-only, optimized final artifacts.

# Knowledge checks with answers
1. **Question**: When should you choose `FrozenDictionary<TKey,TValue>` over `ConcurrentDictionary<TKey,TValue>`?
   * **Answer**: Consider `FrozenDictionary<TKey,TValue>` for a mapping built before a read-heavy phase, and `ConcurrentDictionary<TKey,TValue>` when supported updates and reads must occur concurrently. Frozen lookup speed is workload-dependent and should be benchmarked.
2. **Question**: Why is building an `ImmutableList<T>` with a builder preferred over calling `.Add()` repeatedly on the immutable list itself in a loop?
   * **Answer**: A builder supports a mutable batch-construction phase before producing an immutable value. Immutable updates can share unchanged structure, so the exact allocation and time tradeoff depends on the collection and operation.
3. **Question**: Does a concurrent collection method like `ConcurrentDictionary<TKey,TValue>.TryAdd` guarantee that two consecutive dependent method calls (like checking existence then adding) are thread-safe together?
   * **Answer**: No. Individual method calls are atomic, but multi-step compound workflows (e.g., "if key exists then update") require specialized atomic APIs like `AddOrUpdate` or `GetOrAdd` to prevent race conditions between threads.
