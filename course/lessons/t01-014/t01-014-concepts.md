
# collections arrays list dictionary set stack queue concurrent and immutable collections — Core concepts and how they fit together

# Learning objectives
- Understand the core problem collection types solve in .NET: balancing storage shape, mutation patterns, ordering, uniqueness, and thread safety.
- Master the mental model of how arrays, resizable lists, dictionaries, sets, queues, stacks, concurrent collections, immutable data structures, and frozen lookups fit together.
- Learn when to select each collection based on access and update patterns, and how to avoid common pitfalls such as enumerator invalidation, mutation hazards, and unstable sorting.

# Prerequisites
- Basic familiarity with C# syntax, generics (`<T>`), and interfaces.
- Awareness that memory in .NET is managed, and collections wrap underlying storage buffers or node allocations to present high-level APIs.

# Core concepts
Collections in .NET package a storage shape and a set of operations [t01-014]. You should pick a collection based on your access and update pattern, ordering rules, key semantics, concurrency requirements, and lifetime of the data, rather than choosing out of habit or familiar naming [t01-014].

## The Collection Map
Before diving into individual types, consider how collections relate to one another by their structural guarantees:
- **Indexed Sequences**: `Array` provides fixed-length indexed storage; `List<T>` is a resizable indexed sequence.
- **Key-Value Mappings**: `Dictionary<TKey,TValue>` maps unique keys to values; `SortedDictionary<TKey,TValue>` and `SortedList<TKey,TValue>` maintain ordered keys.
- **Uniqueness & Sets**: `HashSet<T>` enforces uniqueness via hashing; `SortedSet<T>` keeps elements sorted and unique.
- **Work Queues & LIFO**: `Queue<T>` expresses First-In-First-Out (FIFO) access; `Stack<T>` expresses Last-In-First-Out (LIFO) access; `PriorityQueue<TElement,TPriority>` orders elements by priority.
- **Concurrency & Immutability**: `ConcurrentDictionary<TKey,TValue>` and related types support multi-threaded access. Immutable collections preserve prior versions on update [t01-014], and `FrozenDictionary<TKey,TValue>` / `FrozenSet<T>` optimize for read-heavy workloads established at startup [versionNotes].

## Interfaces and Decoupling
Interfaces such as `IEnumerable<T>`, `IReadOnlyCollection<T>`, `IList<T>`, and `IDictionary<TKey,TValue>` describe capabilities and decouple code from concrete storage choices. Note that read-only interfaces restrict operations through that reference, but they do **not** guarantee that the underlying backing data is immutable [t01-014, accuracyFacts].

# Mechanisms and relationships
To use collections effectively, you must understand how their internal mechanics govern performance and safety.

## Capacity, Reallocation, and Growth
Resizable structures like `List<T>` and `Dictionary<TKey,TValue>` back themselves with contiguous arrays or hash buckets. When you add elements beyond their current buffer, they allocate a larger backing array (often doubling capacity) and copy existing items. Pre-sizing collections using constructor capacity or `EnsureCapacity` avoids repeated allocations and copying overhead.

## Enumeration and Mutation
Most `System.Collections.Generic` collections are **fail-fast**. If you mutate a collection (adding or removing items) while iterating over it with an enumerator (`foreach`), the runtime throws an `InvalidOperationException`. 
- **Exception to the rule**: Concurrent collections (such as `ConcurrentDictionary<TKey,TValue>`) do not throw on concurrent modification, but their enumerators are not moment-in-time snapshots and may reflect changes made after enumeration starts [accuracyFacts].

## Thread Safety Realities
Most generic collections are not synchronized for concurrent mutation [t01-014]. 
- **Thread safety protects collection structure, not business transactions**: If a compound invariant spans multiple operations (e.g., check if a dictionary contains a key, then add it), you must protect those operations with an external lock.
- **Value factories**: In `ConcurrentDictionary<TKey,TValue>.GetOrAdd` or `AddOrUpdate`, value factory delegates can execute more than once and outside internal locks; therefore, factory side effects are not guaranteed to run exactly once [accuracyFacts].

# Worked examples
The following complete C# snippet demonstrates selecting the right collection for specific tasks, pre-sizing capacity, and handling lookups safely.

```csharp
using System;
using System.Collections.Generic;

class Program
{
    static void Main()
    {
        // 1. Resizable List with pre-allocated capacity
        List<string> tasks = new(capacity: 10);
        tasks.Add("Design database schema");
        tasks.Add("Implement collection layer");
        tasks.Insert(1, "Review security requirements");

        Console.WriteLine($"Task count: {tasks.Count}, Capacity: {tasks.Capacity}");

        // 2. Dictionary for O(1) expected lookup
        Dictionary<string, int> errorCodes = new(StringComparer.OrdinalIgnoreCase)
        {
            ["NotFound"] = 404,
            ["Unauthorized"] = 401
        };

        // Safe retrieval using TryGetValue instead of risking KeyNotFoundException
        if (errorCodes.TryGetValue("unauthorized", out int code))
        {
            Console.WriteLine($"Error code for Unauthorized: {code}");
        }

        // 3. HashSet for uniqueness and set operations
        HashSet<string> allowedRoles = ["Admin", "Manager"];
        HashSet<string> userRoles = ["Manager", "Guest"];

        // Intersect modifies userRoles in place to keep only common elements
        userRoles.IntersectWith(allowedRoles);
        Console.WriteLine($"User has allowed role count: {userRoles.Count}");
    }
}
```

Expected output:
```text
Task count: 3, Capacity: 10
Error code for Unauthorized: 401
User has allowed role count: 1
```

# Misconceptions and edge cases
- **Misconception**: "Read-only interfaces mean the collection cannot change."
  * **Reality**: `IReadOnlyList<T>` or `IReadOnlyCollection<T>` only restricts what *your* code can do through that reference. The owner of the underlying `List<T>` can still mutate it freely [accuracyFacts].
- **Misconception**: "Sorted sorts preserve relative order for equal elements."
  * **Reality**: `List<T>.Sort` and `Array.Sort` are **unstable** sorts [accuracyFacts]. Elements that compare as equal may have their relative order changed.
- **Edge Case (Key Mutation)**: Hash-based collections (`HashSet<T>`, `Dictionary<TKey,TValue>`) rely on stable hash codes and equality. If you modify an object's state *after* using it as a dictionary key or set element in a way that alters its hash code or equality comparison, lookups and removals will fail silently or throw off collection invariants [accuracyFacts].
- **Edge Case (.NET 9 Alternate Lookups)**: Newer .NET editions (`Dictionary<TKey,TValue>` and `HashSet<T>`) support alternate-key lookups for compatible types (e.g., searching a `Dictionary<string, T>` using a `ReadOnlySpan<char>` without allocating a temporary string), provided your target framework supports it [versionNotes].

# Knowledge checks with answers
1. **Question**: Why should you pre-allocate capacity on a `List<T>` or `Dictionary<TKey,TValue>` when you know the approximate final item count?
   - **Answer**: Pre-allocating capacity avoids the performance penalty and memory allocation churn caused by repeated internal array reallocations and element copying as the collection grows.

2. **Question**: You iterate over a standard `List<T>` using a `foreach` loop and call `List<T>.Remove()` inside the loop body. What happens and why?
   - **Answer**: The runtime throws an `InvalidOperationException`. Standard generic collections use fail-fast enumerators that detect structural mutations during iteration to prevent undefined behavior.

3. **Question**: True or false: `ConcurrentDictionary<TKey,TValue>` makes the objects stored inside its values thread-safe automatically.
   - **Answer**: False. Thread safety protects the dictionary's internal structural operations (like safe concurrent adds and removals); it does not automatically synchronize or make the stored object instances themselves thread-safe [accuracyFacts].

4. **Question**: When should you consider using `FrozenDictionary<TKey,TValue>` or `FrozenSet<T>` introduced in .NET 8?
   - **Answer**: You should use them for collections whose contents are established infrequently (e.g., at startup or configuration load time) and read frequently, as they optimize read lookup performance at the cost of upfront construction work [versionNotes, accuracyFacts].

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/standard/collections/)
