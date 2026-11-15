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

**Solution:** `ConcurrentDictionary<TKey,TValue>` is the ideal choice. It provides atomic operations like `TryAdd` and `AddOrUpdate`, which prevent data corruption when multiple threads access the dictionary simultaneously.

```csharp
using System.Collections.Concurrent;

// Initialize the concurrent dictionary
var sessions = new ConcurrentDictionary<int, string>();

// Atomic update: Add or update the session
sessions.AddOrUpdate(101, "Active", (key, oldValue) => "Active");

// Thread-safe lookup
if (sessions.TryGetValue(101, out string status))
{
    Console.WriteLine($"User 101 status: {status}");
}
```

# Exercises
1. **Selection:** You have a list of 1,000,000 items that are loaded once at application startup and never changed. You need to perform millions of lookups. Which collection type should you use?
2. **Implementation:** Create a `List<string>` and add three names to it using a collection initializer. Then, use `List<T>.Sort` to alphabetize them.
3. **Concurrency:** You have a shared `Queue<int>` that multiple threads are trying to add items to. Why is `Queue<T>` insufficient here, and which class should you use instead?

# Progressive hints
* **Hint 1 (Exercise 1):** Look for a collection type designed for "read-heavy" workloads that are created infrequently. (Check the "Concurrent, immutable, and frozen" section).
* **Hint 2 (Exercise 2):** Remember that `List<T>` is a resizable indexed sequence. Use `new List<string> { "A", "B", "C" };`.
* **Hint 3 (Exercise 3):** `Queue<T>` is not thread-safe. Check the `System.Collections.Concurrent` namespace for a thread-safe FIFO (First-In-First-Out) alternative.

# Complete solutions
1. **Answer:** `FrozenDictionary<TKey,TValue>` or `FrozenSet<T>`. These are optimized for read-heavy lookup after construction.
2. **Code:**
   ```csharp
   var names = new List<string> { "Charlie", "Alice", "Bob" };
   names.Sort();
   // Result: Alice, Bob, Charlie
   ```
3. **Answer:** `Queue<T>` does not synchronize access. Use `ConcurrentQueue<T>` to allow multiple threads to enqueue items safely.

# Tests and edge cases
* **Mutation during enumeration:** If you modify a `List<T>` while iterating over it with a `foreach` loop, .NET will throw an `InvalidOperationException` due to "Fail-fast enumerator behavior."
* **Capacity:** When using `List<T>` or `Dictionary<TKey,TValue>`, if you know the number of items in advance, use the constructor that accepts `capacity` to avoid expensive reallocations.
* **Equality:** `HashSet<T>` and `Dictionary<TKey,TValue>` rely on the `GetHashCode` method. If your key type does not implement equality correctly, lookups will fail even if the key "looks" correct.

# Reflection questions
* Why is a `ReadOnlyCollection` not the same as an `ImmutableCollection`? (Hint: One is a view, the other is a structural guarantee).
* When should you choose `LinkedList<T>` over `List<T>`? (Hint: Consider the cost of inserting items in the middle of the collection).
* How does the `Collection capacity` affect the memory footprint of your application?

*Source: [https://learn.microsoft.com/en-us/dotnet/standard/collections/](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
