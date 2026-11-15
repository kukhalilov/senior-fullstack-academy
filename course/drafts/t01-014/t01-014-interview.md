<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# collections arrays list dictionary set stack queue concurrent and immutable collections — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions
When preparing for an interview, you must be able to explain why you chose a specific collection over another. The core of this topic is matching the **access pattern** (how you read/write data) to the **storage shape** (how the data is organized).

*   **Why does .NET have so many collection types?** Different structures optimize for different operations. An `Array` is fast for indexed access but fixed in size; a `List<T>` is resizable but has overhead; a `Dictionary<TKey,TValue>` provides near-instant lookups but consumes more memory.
*   **What is the difference between a read-only interface and an immutable collection?** A read-only interface (like `IReadOnlyList<T>`) is just a "view" that hides write methods; the underlying data can still change if someone else holds a mutable reference. An **immutable collection** (e.g., `ImmutableList<T>`) is truly unchangeable; any "update" returns a new version of the collection.

# Concise interview answers
*   **When should you use a `List<T>` vs. an `Array`?** Use an `Array` when the size is known and fixed. Use `List<T>` when you need to add or remove items dynamically.
*   **How do you handle thread safety in collections?** Use `System.Collections.Concurrent` types (like `ConcurrentDictionary<TKey,TValue>`) for atomic operations. If you need to perform multiple operations as a single unit, use a standard collection protected by a `lock`.
*   **What is a `FrozenDictionary<TKey,TValue>`?** It is a specialized collection optimized for extremely fast read-only lookups. It is created once (usually at startup) and cannot be modified, making it ideal for static configuration data.

# Deep follow-up answers
*   **Explain the performance of `List<T>.Add`:** Adding to a `List<T>` is **amortized O(1)**. Most additions are instant, but when the internal array fills up, the list must allocate a new, larger array and copy all existing elements, which is an O(n) operation. You can mitigate this by setting the `Capacity` upfront if you know the expected size.
*   **How does `Dictionary<TKey,TValue>` handle collisions?** It uses a hashing algorithm to map keys to buckets. If two keys produce the same hash (a collision), the dictionary manages them internally. This is why it is critical that your key type implements `GetHashCode` and `Equals` correctly and consistently.
*   **Why use `CollectionsMarshal`?** These are advanced, low-level APIs that allow you to bypass standard safety checks (like bounds checking) to gain performance. They are intended for high-performance scenarios where you have already verified the safety of the operation yourself.

# Scenario questions
*   **Scenario:** You need to process a stream of tasks where the first task added must be the first one finished.
    *   **Answer:** Use `Queue<T>`. It implements FIFO (First-In, First-Out) logic.
*   **Scenario:** You have a large list of items that are rarely updated but frequently searched.
    *   **Answer:** Use `FrozenSet<T>` or `FrozenDictionary<TKey,TValue>`. They provide faster lookup performance than standard collections by trading off construction time.
*   **Scenario:** You are building a multi-threaded producer-consumer pipeline.
    *   **Answer:** Use `BlockingCollection<T>`. It provides built-in thread-safe mechanisms to add and take items, handling the waiting logic automatically.

# Tradeoffs and alternatives
*   **`List<T>` vs. `LinkedList<T>`:** `List<T>` is better for indexed access and memory locality. `LinkedList<T>` is better if you need to frequently insert or remove items from the middle of the sequence, as it does not require shifting elements.
*   **`HashSet<T>` vs. `SortedSet<T>`:** `HashSet<T>` provides O(1) average lookup time. `SortedSet<T>` provides O(log n) lookup but maintains the items in a sorted order, allowing for range queries (e.g., `GetViewBetween`).
*   **`Dictionary<TKey,TValue>` vs. `ConcurrentDictionary<TKey,TValue>`:** The concurrent version is thread-safe but has higher overhead. Only use it when multiple threads are actively modifying the collection.

# Common weak answers
*   **"I always use `List<T>` for everything."** This ignores memory efficiency and performance requirements for specific lookup or ordering patterns.
*   **"I use `lock` on every collection to make it thread-safe."** This is a performance bottleneck. Use `Concurrent` collections for atomic operations, or use `Immutable` collections to avoid locking entirely by sharing snapshots.
*   **"Read-only interfaces make my data immutable."** This is a misconception. A read-only interface is a contract, not a guarantee of immutability.

# Self-check rubric
*   **Can you explain the "why"?** Do not just name the collection; explain the performance characteristic (e.g., "O(1) lookup") that makes it the right choice.
*   **Did you mention the package?** Remember that `System.Collections.Immutable` may require a NuGet package depending on your target framework.
*   **Are you aware of the versioning?** Mentioning that `Frozen` collections were introduced in .NET 8 or that `AlternateLookup` was added in .NET 9 shows deep, up-to-date knowledge.
*   **Did you address concurrency?** Always distinguish between "thread-safe" (concurrent collections) and "thread-safe by design" (immutable collections).

*Source: [.NET API reference and official collection design](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
