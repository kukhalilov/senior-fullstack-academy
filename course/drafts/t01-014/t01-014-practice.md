<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# collections arrays list dictionary set stack queue concurrent and immutable collections — Exercises and worked solutions

*This is an automatically generated draft.*

# Goals
* Understand how to select the correct collection type based on access patterns, ordering, and concurrency needs.
* Learn the distinction between mutable, immutable, and frozen collections.
* Practice choosing the right data structure for specific performance requirements.

# Worked example
Imagine you are building a system to track active user sessions. You need to:
1. Store sessions by a unique `UserId` for fast lookup.
2. Ensure the collection is thread-safe because multiple background threads will update session data.
3. Occasionally iterate over all sessions to perform maintenance.

**Solution:** `ConcurrentDictionary<TKey,TValue>` is a suitable choice when threads need concurrent key-based operations. Its individual methods have documented thread-safety guarantees; delegates passed to `GetOrAdd` and `AddOrUpdate` can run more than once, and multi-call session invariants still require coordination. Mutable session objects may need their own synchronization.

```csharp
using System;
using System.Collections.Concurrent;

// Initialize the concurrent dictionary
var sessions = new ConcurrentDictionary<int, string>();

// Thread-safe per-key update; the delegate may be invoked more than once.
sessions.AddOrUpdate(101, "Active", (key, oldValue) => "Active");

// Thread-safe lookup
if (sessions.TryGetValue(101, out string status))
{
    Console.WriteLine($"User 101 status: {status}");
}
```

# Exercises
1. **Selection:** You have 1,000,000 user IDs loaded once and never changed. You need to test membership for millions of queries. Which collection type could fit, and what should you benchmark?
2. **Implementation:** Create a `List<string>` and add three names to it using a collection initializer. Then, use `List<T>.Sort` to alphabetize them.
3. **Concurrency:** You have a shared `Queue<int>` that multiple threads are trying to add items to. Why is `Queue<T>` insufficient here, and which class should you use instead?

# Progressive hints
* **Hint 1 (Exercise 1):** Look for a collection type designed for "read-heavy" workloads that are created infrequently. (Check the "Concurrent, immutable, and frozen" section).
* **Hint 2 (Exercise 2):** Remember that `List<T>` is a resizable indexed sequence. Use `new List<string> { "A", "B", "C" };`.
* **Hint 3 (Exercise 3):** `Queue<T>` is not thread-safe. Check the `System.Collections.Concurrent` namespace for a thread-safe FIFO (First-In-First-Out) alternative.

# Complete solutions
1. **Answer:** Consider `FrozenSet<T>` for membership tests, then benchmark lookup speed, construction cost, and memory against `HashSet<T>` for the real data. Use `FrozenDictionary<TKey,TValue>` when each key maps to a value.
2. **Code:**
   ```csharp
   var names = new List<string> { "Charlie", "Alice", "Bob" };
   names.Sort();
   // Result: Alice, Bob, Charlie
   ```
3. **Answer:** `Queue<T>` does not synchronize access. Use `ConcurrentQueue<T>` to allow multiple threads to enqueue items safely.

# Tests and edge cases
* **Mutation during enumeration:** Structural mutation of a `List<T>` invalidates its enumerator; later enumerator operations throw `InvalidOperationException`. Check each collection's contract rather than assuming all collections behave alike.
* **Capacity:** When using `List<T>` or `Dictionary<TKey,TValue>`, if you know the number of items in advance, use the constructor that accepts `capacity` to avoid expensive reallocations.
* **Equality:** Hash-based collections require equality and hash codes to be consistent. Built-in types generally provide this; implement or supply a comparer when a custom type needs different equality semantics.

# Reflection questions
* Why is a read-only wrapper not the same as an immutable collection? (Hint: One is a view over backing data; the other preserves immutable collection structure.)
* When should you choose `LinkedList<T>` over `List<T>`? (Hint: Consider whether you already have a node reference; finding a node by value still takes a traversal.)
* How does the `Collection capacity` affect the memory footprint of your application?

*Source: [https://learn.microsoft.com/en-us/dotnet/standard/collections/](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
