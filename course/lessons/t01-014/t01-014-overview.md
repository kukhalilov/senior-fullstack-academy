
# collections arrays list dictionary set stack queue concurrent and immutable collections — Big-picture orientation and mental model

# Problem and purpose
In software development, you frequently need to store groups of related objects. While you could use a simple array, real-world applications require different behaviors: some collections need to grow dynamically, others must ensure every item is unique, and some must remain accessible by multiple threads simultaneously.

The .NET collection ecosystem provides specialized structures to solve these problems efficiently. The purpose of these collections is to balance memory usage, speed of access (lookup), and speed of modification (adding/removing items) based on your specific workload.

# Plain-language mental model
Think of a collection as a **container with rules**. 
*   An **Array** is like a fixed-size egg carton: you know exactly how many slots you have, and you access them by their position (index).
*   A **List** is like a shopping bag: you can keep adding items, and it stretches to fit them.
*   A **Dictionary** is like a real-world dictionary: you look up a "word" (key) to find its "definition" (value).
*   A **Set** is like a guest list for a private party: you only care that a person is on the list, and you ensure no one is invited twice.
*   A **Queue** is like a line at a store (First-In, First-Out), while a **Stack** is like a stack of plates (Last-In, First-Out).

# How the parts fit together
Collections in .NET are organized by their **contracts** (interfaces) and their **storage shapes**.

1.  **Interfaces:** These define *what* you can do (e.g., `IEnumerable<T>` means you can loop through it; `IList<T>` means you can access items by index). They allow you to write code that doesn't care if you are using a `List` or an `Array`.
2.  **Concrete Types:** These are the actual classes (like `List<T>` or `Dictionary<TKey,TValue>`) that implement the interfaces and provide the underlying storage logic.
3.  **Specialized Variants:**
    *   **Concurrent Collections:** Designed for multi-threaded environments where multiple tasks might try to change the data at the same time.
    *   **Immutable Collections:** Their collection structure does not change; an update returns a new value and can preserve earlier versions. Objects stored inside may still be mutable.
    *   **Frozen Collections:** Built for data prepared before a read-heavy phase. Construction and memory costs trade against workload-dependent lookup behavior.

# Concept map
*   **Storage Shape:** The internal structure (e.g., hash table, linked list, array).
*   **Access Pattern:** How you retrieve data (by index, by key, by order).
*   **Mutability:** Whether the collection can be changed after creation.
*   **Thread Safety:** Whether the collection handles concurrent access internally.
*   **Capacity:** The amount of memory reserved for the collection before it needs to resize.

# End-to-end walkthrough
Imagine you are building a system to track user scores in a game.

1.  **Choosing the shape:** You need to look up scores by a unique `Username` (string). A `Dictionary<string, int>` is the perfect choice because it provides fast lookups.
2.  **Initialization:** You create the dictionary and add a few players.
    ```csharp
    var scores = new Dictionary<string, int>();
    scores.Add("Alice", 100);
    scores.Add("Bob", 150);
    ```
3.  **Accessing:** You check if a player exists before retrieving their score to avoid errors.
    ```csharp
    if (scores.TryGetValue("Alice", out int score)) {
        Console.WriteLine($"Alice has {score} points.");
    }
    ```
4.  **Scaling:** If you realize you need to share this dictionary across multiple background threads, you would switch to a `ConcurrentDictionary<string, int>` to ensure that adding a score from one thread doesn't crash the program while another thread is reading.
5.  **Optimization:** If the game ends and scores are finalized, a `FrozenDictionary<string, int>` can suit a fixed, read-heavy workload; account for construction cost and benchmark the actual workload.

# When to use it and tradeoffs
*   **Use Arrays** when the number of items is known and fixed. They provide fixed-length contiguous indexed storage and can be compact, though memory efficiency depends on element types and usage.
*   **Use `List<T>`** for general-purpose dynamic sequences.
*   **Use `Dictionary<TKey,TValue>`** for fast lookups. **Tradeoff:** It uses more memory than a list because it stores extra data to make lookups fast.
*   **Use Concurrent Collections** when their supported operations fit concurrent access. Coordination costs depend on workload and contention; ordinary collections with an external lock may suit other patterns.
*   **Use Immutable/Frozen Collections** when snapshot semantics or read-mostly data suit the workload. Build costs and lookup performance vary by type, size, and access pattern; measure before choosing.

**Common Mistake:** Modifying a collection while looping through it (e.g., removing an item from a `List` while using `foreach`). Some enumerators (including List<T> enumerators) are invalidated by structural modifications during iteration. Behavior varies by collection; use its documented mutation pattern.

# What later lessons cover
*   **LINQ:** How to filter, sort, and transform collections using powerful query syntax.
*   **Memory Management:** How to use `Span<T>` and `Memory<T>` to work with parts of collections without creating unnecessary copies.
*   **Concurrency:** Deep dives into how `BlockingCollection<T>` and other thread-safe structures manage complex producer-consumer pipelines.

*Source: [.NET Collection Documentation](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
