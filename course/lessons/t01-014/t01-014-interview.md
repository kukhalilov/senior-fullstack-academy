
# collections arrays list dictionary set stack queue concurrent and immutable collections — Interview questions and reasoning

# Core questions
When preparing for an interview, you must be able to explain why you chose a specific collection over another. The core of this topic is matching the **access pattern** (how you read/write data) to the **storage shape** (how the data is organized).

*   **Why does .NET have so many collection types?** Different structures optimize for different operations. An `Array` is fast for indexed access but fixed in size; a `List<T>` is resizable but has overhead; a `Dictionary<TKey,TValue>` provides near-instant lookups but consumes more memory.
*   **What is the difference between a read-only interface and an immutable collection?** A read-only interface (like `IReadOnlyList<T>`) is just a "view" that hides write methods; the underlying data can still change if someone else holds a mutable reference. An **immutable collection** (e.g., `ImmutableList<T>`) does not change its collection structure; any "update" returns a new version. Mutable objects stored inside are not deeply immutable.

# Concise interview answers
*   **When should you use a `List<T>` vs. an `Array`?** Use an `Array` when the size is known and fixed. Use `List<T>` when you need to add or remove items dynamically.
*   **How do you handle thread safety in collections?** Use concurrent collection operations when their documented operation-level guarantees fit. For multi-call invariants, coordinate the full sequence with a shared lock or another synchronization design. Concurrent methods do not make arbitrary workflows transactional.
*   **What is a `FrozenDictionary<TKey,TValue>`?** It is a read-only mapping intended for data established before a read-heavy phase. Whether it improves a particular workload depends on construction cost, memory, and lookup patterns, so benchmark before choosing it.

# Deep follow-up answers
*   **Explain the performance of `List<T>.Add`:** Adding to a `List<T>` is **amortized O(1)**. Most additions are instant, but when the internal array fills up, the list must allocate a new, larger array and copy all existing elements, which is an O(n) operation. You can mitigate this by setting the `Capacity` upfront if you know the expected size.
*   **How does `Dictionary<TKey,TValue>` handle collisions?** It uses a hashing algorithm to map keys to buckets. If two keys produce the same hash (a collision), the dictionary manages them internally. This is why it is critical that your key type implements `GetHashCode` and `Equals` correctly and consistently.
*   **Why use `CollectionsMarshal`?** These APIs expose spans or references to backing storage for specific collection types. They can avoid some abstraction or copying costs, but they have strict lifetime and mutation rules; they do not generally disable CLR bounds checks. Prefer ordinary APIs unless measurement shows the low-level access is worthwhile.

# Scenario questions
*   **Scenario:** You need to process a stream of tasks where the first task added must be the first one finished.
    *   **Answer:** Use `Queue<T>`. It implements FIFO (First-In, First-Out) logic.
*   **Scenario:** You have a large set of identifiers established once and frequently test membership.
    *   **Answer:** Consider `FrozenSet<T>` and benchmark it against the alternatives. For key-to-value lookup, the mapping equivalent is `FrozenDictionary<TKey,TValue>`.
*   **Scenario:** You are building a multi-threaded producer-consumer pipeline.
    *   **Answer:** Use `BlockingCollection<T>`. It provides built-in thread-safe mechanisms to add and take items, handling the waiting logic automatically.

# Tradeoffs and alternatives
*   **`List<T>` vs. `LinkedList<T>`:** `List<T>` supports indexed access and usually has better locality. A linked list can insert or remove in O(1) when you already hold the node reference; finding that node by value remains O(n).
*   **`HashSet<T>` vs. `SortedSet<T>`:** `HashSet<T>` provides O(1) average lookup time. `SortedSet<T>` provides O(log n) lookup but maintains the items in a sorted order, allowing for range queries (e.g., `GetViewBetween`).
*   **`Dictionary<TKey,TValue>` vs. `ConcurrentDictionary<TKey,TValue>`:** The concurrent version supports documented operations across concurrent access, with synchronization costs that depend on contention and workload. Choose it when its operation guarantees fit; a shared lock can be better when a larger invariant must be atomic.

# Common weak answers
*   **"I always use `List<T>` for everything."** This ignores memory efficiency and performance requirements for specific lookup or ordering patterns.
*   **"I use `lock` on every collection to make it thread-safe."** Choose synchronization at the invariant boundary. A lock can be appropriate and is not inherently a bottleneck. Concurrent collections offer specific operations; immutable structure can help share versions, but mutable values inside them may still need synchronization.
*   **"Read-only interfaces make my data immutable."** This is a misconception. A read-only interface is a contract, not a guarantee of immutability.

# Self-check rubric
*   **Can you explain the "why"?** Do not just name the collection; explain the performance characteristic (e.g., "O(1) lookup") that makes it the right choice.
*   **Did you mention the package?** Remember that `System.Collections.Immutable` may require a NuGet package depending on your target framework.
*   **Are you aware of the versioning?** Mentioning that `Frozen` collections were introduced in .NET 8 or that `AlternateLookup` was added in .NET 9 shows deep, up-to-date knowledge.
*   **Did you address concurrency?** State which operations are protected, whether a multi-step invariant needs coordination, what enumeration guarantees apply, and whether stored values themselves are mutable.

*Source: [.NET API reference and official collection design](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
