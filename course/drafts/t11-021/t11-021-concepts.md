<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sets and membership algorithms — Core concepts and how they fit together

*This is an automatically generated draft.*

# Learning objectives
* Understand the mathematical definition of a set and its role in efficient data processing.
* Distinguish between hash-based and ordered set implementations.
* Learn how to apply set operations to compare and combine collections.
* Identify the trade-offs between different set structures for membership testing.

# Prerequisites
* Basic familiarity with collections (lists or arrays).
* Understanding of the concept of "equality" (how two items are determined to be the same).
* Awareness that searching a linear list takes time proportional to the list size, whereas sets aim to optimize this.

# Core concepts
A `Set` is a collection of `Distinct elements`. Unlike a list, a set does not care about the order of items or how many times an item is added; it performs `Duplicate elimination` automatically. 

The primary utility of a set is `Element membership` testing. If you need to check if an item exists in a large collection, a list requires a full scan (slow), while a hash set provides expected O(1) membership with suitable hashes, while a sorted set commonly uses O(log n) membership; neither is automatically faster for every workload. The `Set cardinality` refers to the total count of unique elements within the set.

When comparing two sets, `Set equality` is determined by whether both sets contain the same elements, regardless of how they were inserted. This differs from `Sequence equality`, where the order of elements must also match.

# Mechanisms and relationships
Sets are implemented using different underlying data structures, each with specific performance characteristics:

* **`Hash set` (`HashSet<T>`)**: Uses a hash table for expected O(1) membership under suitable hashing, without a worst-case guarantee. Use it when sorted iteration and range queries are unnecessary and its memory/performance tradeoff fits.
* **`Sorted set` (`SortedSet<T>`)**: Maintains elements in a sorted structure, providing `Ordered membership`. This is useful when you need to iterate through elements in order or perform range queries.
* **`Direct-address set`**: Uses an array where the index corresponds to the element value. This is extremely fast but only feasible for small, dense ranges of integers.
* **`Bit set`**: A space-efficient variation of a direct-address set where each bit represents the presence or absence of an integer.

These implementations often implement `ISet<T>` or `IReadOnlySet<T>`, which define standard interfaces for set behavior. The `Equality comparer` is the mechanism that defines how the set identifies two objects as the same; changing this allows you to define custom rules for what makes an element "distinct."

# Worked examples
Imagine you are tracking users who have visited a website.

1. **`Seen set` / `Visited set`**: As users arrive, you add their ID to a `HashSet<T>`. Because sets enforce `Distinct elements`, you don't need to check if the user is already there; the set handles it.
2. **`Deduplication`**: If you have a list with duplicates like `[A, B, A, C]`, adding them to a `HashSet<T>` results in `{A, B, C}`.
3. **`Membership filter`**: Before processing a heavy task for a user, check `set.Contains(userId)`. If true, skip the task.

**Mathematical Operations**:
* `Union`: Combines all unique elements from two sets.
* `Intersection`: Keeps only elements present in both sets.
* `Difference`: Removes elements of the second set from the first.
* `Symmetric difference`: Keeps elements in either set, but not both.
* `Subset` / `Proper subset`: Checks if one set is contained within another.
* `Superset`: Checks if a set contains all elements of another.
* `Set disjointness`: Checks if two sets share no common elements.

# Misconceptions and edge cases
* **Misconception**: "Sets are always faster." **Reality**: For very small collections, the overhead of hashing or tree balancing in `HashSet<T>` or `SortedSet<T>` can be slower than a simple linear scan of an array.
* **Edge Case**: For `HashSet<T>`, equality and hash codes must remain consistent while an item is stored; for `SortedSet<T>`, the ordering comparer also defines which elements compare as duplicates. Mutating fields used by those rules can make lookups or removal fail.
* **Trade-off**: `SortedSet<T>` provides `Ordered membership`, but insertion and lookup are generally slower (logarithmic time) compared with the expected O(1) membership of `HashSet<T>` under suitable hashing.

# Knowledge checks with answers
1. **Question**: Why would you choose a `SortedSet<T>` over a `HashSet<T>`?
   * **Answer**: When you need to retrieve elements in a specific order or perform range-based queries.
2. **Question**: What is the result of `Set disjointness` if two sets share one element?
   * **Answer**: False. Disjoint sets must have no elements in common.
3. **Question**: How does `Deduplication` affect the `Set cardinality`?
   * **Answer**: It reduces the cardinality to the count of unique elements, discarding any extra occurrences.

*Sources*:
[https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1)
[https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.sortedset-1](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.sortedset-1)
[https://usaco.guide/bronze/intro-sets](https://usaco.guide/bronze/intro-sets)
