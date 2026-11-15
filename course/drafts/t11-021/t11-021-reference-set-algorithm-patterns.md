<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sets and membership algorithms — Reference: Set patterns and tradeoffs

*This is an automatically generated draft.*

# Scope and version
This lesson covers the conceptual patterns and algorithmic roles of sets in .NET 11 development. It focuses on how sets are used to solve problems related to uniqueness and membership, rather than the implementation details of specific collection classes. This content is based on timeless set concepts and .NET 11 API documentation as of 2026-11-14.

# How this group fits the mental model
A set is a collection of distinct elements. Unlike a list or array, a set does not care about the position of an item, only whether that item exists within the collection. 

In your mental model, think of a set as a "gatekeeper." When you need to know if you have already processed an item, or if you need to ensure a collection contains no duplicates, you use a set. By using these patterns, you replace slow, repeated scans (searching through a list one by one) with efficient lookups.

# Supplied names explained

* `Seen set`: A pattern where a set is used to track items that have already been encountered during an iteration. This is commonly used to process a stream of data while ignoring duplicates.
* `Membership filter`: A pattern where a set acts as a whitelist or blacklist. You check the set to determine if an item meets a specific criteria (e.g., "is this ID in the list of allowed users?").
* `Deduplication`: The process of transforming a collection with duplicates into a set to remove redundant entries. This changes the representation of the data and may discard the original order or frequency of items.
* `Visited set`: A specific type of "Seen set" used in graph or tree traversal algorithms. It keeps track of nodes or states that have already been processed to prevent infinite loops or redundant work.
* `Expected constant-time membership`: The performance characteristic of hash-based sets (like `HashSet<T>`). It means that, on average, checking if an item exists takes the same amount of time regardless of how many items are in the set.
* `Ordered membership`: The performance characteristic of tree-based sets (like `SortedSet<T>`). It provides logarithmic time complexity for lookups, but keeps the elements in a sorted sequence, allowing for efficient range queries.
* `Equality comparer`: The logic used to determine if two objects are the same. Since sets rely on uniqueness, the `Equality comparer` is critical; if it is defined incorrectly, the set may fail to identify duplicates or incorrectly treat distinct items as the same.

# Cross-item comparison

* **`Expected constant-time membership` vs. `Ordered membership`**: Use the former when you only care about speed and existence checks. Use the latter when you need to maintain a sorted order or perform range-based operations (e.g., "find all items between 10 and 20").
* **`Seen set` vs. `Visited set`**: These are functionally similar, but `Visited set` is specifically used in the context of traversal algorithms (like searching a graph), whereas `Seen set` is a general-purpose pattern for filtering duplicates from a data stream.
* **`Deduplication` vs. `Membership filter`**: `Deduplication` is an action performed on a collection to clean it, while `Membership filter` is a runtime check performed against a set to validate individual items.

# Examples

**Example 1: Deduplication**
If you have a list of user IDs `[1, 2, 2, 3]`, adding them to a `HashSet<int>` results in `{1, 2, 3}`. The duplicate `2` is discarded.

**Example 2: Visited set in traversal**
When traversing a graph, you maintain a `Visited set`. Before moving to a neighbor node, you check if it is in the `Visited set`. If it is, you skip it to avoid cycles.

# Common mistakes

* **Ignoring the `Equality comparer`**: If you store custom objects in a set without overriding `GetHashCode` and `Equals`, the set will use reference equality. Two objects with the same data will be treated as different, breaking the "distinct values" rule.
* **Overusing `SortedSet<T>`**: Beginners often choose `SortedSet<T>` because it sounds "organized." If you do not need the items to be sorted, `HashSet<T>` is almost always faster due to its `Expected constant-time membership`.
* **Assuming order in `HashSet<T>`**: Never write code that relies on the order of elements in a `HashSet<T>`. The order is an implementation detail and can change.

# Knowledge checks with answers

1. **Question**: If you need to check if an item exists in a collection as fast as possible, which pattern should you prioritize?
   * **Answer**: `Expected constant-time membership`.

2. **Question**: Why is the `Equality comparer` important for a set?
   * **Answer**: It defines what "distinct" means. Without a correct comparer, the set cannot accurately identify duplicates.

3. **Question**: You have a list of 1,000,000 items and need to remove duplicates. What is this pattern called?
   * **Answer**: `Deduplication`.

*Source: [Microsoft Learn HashSet<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1), [Microsoft Learn SortedSet<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.sortedset-1), [USACO Guide: Intro to Sets](https://usaco.guide/bronze/intro-sets)*
