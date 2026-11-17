<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sets and membership algorithms — Reference: Set implementation choices

*Automatically generated draft.*

# Scope and version
This lesson covers the conceptual and practical implementation of sets in .NET 11. It focuses on the primary data structures used for membership testing and deduplication. This content is based on the Microsoft Learn documentation for `HashSet<T>` and `SortedSet<T>` and the USACO Guide on set introductions, verified as of 2026-11-14.

# How this group fits the mental model
A set is a collection of distinct elements. Unlike a list or array, a set does not care about the order of elements (in most implementations) and does not allow duplicates. 

The mental model for sets is **membership**: "Is this item present?" Sets are designed to answer this question much faster than a list. While a list requires you to scan every item one by one (linear time), a set uses internal structures (like hash tables or trees) to jump directly to the answer.

# Supplied names explained
* `Hash set`: A general concept where elements are stored based on a hash code. This provides very fast lookups but does not maintain any specific order of elements.
* `Sorted set`: A general concept where elements are stored in a sorted structure (usually a balanced tree). This allows for efficient range queries and keeps elements in a predictable order.
* `Direct-address set`: A specialized set implementation where each possible element maps to a unique index in an array. This is extremely fast but requires a small, known range of possible values.
* `Bit set`: A memory-efficient implementation of a direct-address set where each element is represented by a single bit (0 or 1). It is ideal for sets of integers within a fixed, small range.
* `HashSet<T>`: The concrete .NET class implementing a hash-based set. It is the default choice for general-purpose membership testing.
* `SortedSet<T>`: The concrete .NET class implementing a comparer-ordered set. It is useful when sorted iteration or range views such as `GetViewBetween` are needed; elements for which the comparer returns zero are treated as duplicates.
* `ISet<T>`: An interface that defines the standard contract for set operations, such as adding, removing, and performing mathematical set operations (union, intersection).
* `IReadOnlySet<T>`: An interface that exposes set-membership and relation checks without mutation methods. It does not make the underlying set immutable or prevent another reference from changing it.

# Cross-item comparison
* **Hash set vs. Sorted set**: `Hash set` (and `HashSet<T>`) offers faster average-case performance for adding and checking membership. `Sorted set` (and `SortedSet<T>`) is slower but provides the benefit of sorted iteration and range-based queries.
* **Direct-address set vs. Bit set**: Both are optimized for specific ranges of integers. A `Bit set` is essentially a space-optimized `Direct-address set` that uses bits instead of full integers or objects to track presence.
* **Interfaces vs. Classes**: `ISet<T>` and `IReadOnlySet<T>` are abstractions. You use these as parameter types to write flexible code that can accept either a `HashSet<T>` or a `SortedSet<T>` without knowing the underlying implementation.

# Examples
```csharp
// Using HashSet for fast membership
ISet<int> fastSet = new HashSet<int> { 1, 2, 3 };
bool exists = fastSet.Contains(2); // True, very fast

// Using SortedSet for ordered data
ISet<int> orderedSet = new SortedSet<int> { 3, 1, 2 };
// Iterating this will result in 1, 2, 3
```
*Context: These snippets assume the use of `System.Collections.Generic`.*

# Common mistakes
* **Assuming order in a Hash set**: Beginners often assume that because they added items in a specific order, they will be retrieved in that order. `HashSet<T>` makes no such guarantee.
* **Ignoring the Comparer**: When using `SortedSet<T>`, the set relies on a comparer to determine order. If you use custom objects without a proper `IComparer<T>` or `IComparable<T>` implementation, the set will fail to order elements correctly.
* **Overusing Sets**: Using a set when you actually need to store key-value pairs (which requires a Map/Dictionary) or when you need to track the frequency of items (which requires a Multiset).

# Knowledge checks with answers
1. **Question**: Which structure should you choose if you need to iterate through your items in alphabetical order?
   * **Answer**: `SortedSet<T>`.
2. **Question**: What is the primary difference between `ISet<T>` and `HashSet<T>`?
   * **Answer**: `ISet<T>` is an interface (a contract), while `HashSet<T>` is the concrete class that implements that contract.
3. **Question**: Why might you choose a `Bit set` over a `HashSet<T>`?
   * **Answer**: If you are dealing with a known, small range of integers, a a bit-oriented representation may use substantially less memory for a bounded dense integer domain; speed depends on representation and workload.

*Sources: [HashSet<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1), [SortedSet<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.sortedset-1), [USACO Guide](https://usaco.guide/bronze/intro-sets)*
