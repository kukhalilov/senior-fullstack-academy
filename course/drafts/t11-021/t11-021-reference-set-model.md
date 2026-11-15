<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sets and membership algorithms — Reference: Set model and membership

*This is an automatically generated draft.*

# Scope and version
This lesson covers the fundamental concepts of sets and membership algorithms as defined in the .NET 11 documentation (checked 2026-11-14). It focuses on the mathematical and structural properties of sets rather than specific class implementations.

# How this group fits the mental model
In programming, we often need to track collections of items. While lists or arrays keep items in a specific sequence, a **Set** is a collection that focuses on existence rather than position. The mental model for a set is a "membership filter": you ask, "Is this item here?" and the set answers "Yes" or "No." Because sets do not care about order or frequency, they are highly efficient for tasks like deduplication or checking if a user has already performed an action.

# Supplied names explained

* `Set`: A mathematical collection of unique items. Unlike a list, a set does not store items at specific indices. Its primary purpose is to provide a container where the existence of an item is the only property that matters.
* `Element membership`: The operation of checking whether a specific item exists within a set. In efficient set implementations, this is often a constant-time operation, meaning it takes the same amount of time regardless of how many items are in the set.
* `Distinct elements`: The core constraint of a set. Every item in a set must be unique. If you attempt to add an item that is already present, the set remains unchanged.
* `Duplicate elimination`: The process of converting a collection with repeating items into a set. This is a common way to clean data or find unique values in a list.
* `Set equality`: A comparison between two sets that returns true if they contain exactly the same elements, regardless of the order in which they were added.
* `Set cardinality`: The number of elements contained in a set. It represents the "size" of the set after all duplicates have been removed.

# Cross-item comparison

* **Set vs. Duplicate elimination**: A `Set` is the data structure itself, while `Duplicate elimination` is the process or action performed to ensure the set's `Distinct elements` property is maintained.
* **Set equality vs. Set cardinality**: `Set equality` checks if two sets are identical in content, whereas `Set cardinality` only checks the count of elements. Two sets can have the same `Set cardinality` but different contents.
* **Element membership**: This is the primary utility of the `Set`. While `Set equality` compares two sets, `Element membership` focuses on the relationship between a single item and a set.

# Examples

Imagine you have a list of user IDs: `[101, 102, 101, 103]`.

1. **Duplicate elimination**: By moving these into a `Set`, the duplicate `101` is removed. The set now contains `{101, 102, 103}`.
2. **Set cardinality**: The cardinality of this set is 3.
3. **Element membership**: If you check for `101`, the set returns "True." If you check for `999`, it returns "False."
4. **Set equality**: If you have another set `{103, 101, 102}`, it is equal to the first set because they contain the same `Distinct elements`, even though they were added in a different order.

# Common mistakes

* **Confusing order with sets**: Beginners often expect a set to remember the order in which items were added. While some implementations (like `SortedSet<T>`) might keep items in a specific order, a general `Set` does not guarantee any specific sequence.
* **Ignoring the equality comparer**: A set relies on the definition of equality for the items it stores. If your custom objects do not correctly implement equality, the set may fail to identify duplicates, leading to incorrect `Set cardinality`.
* **Overusing sets for small data**: For very small collections, the overhead of calculating hashes or maintaining tree structures for a set can be slower than simply scanning a list.

# Knowledge checks with answers

1. **Question**: If I add the number 5 to a set that already contains 5, what happens to the set's cardinality?
   * **Answer**: The cardinality remains the same because sets only contain `Distinct elements`.

2. **Question**: Does `Set equality` depend on the order in which elements were added?
   * **Answer**: No. `Set equality` is based on the content of the set, not the insertion order.

3. **Question**: Why is `Element membership` often faster in a set than in a list?
   * **Answer**: Lists require a linear scan (checking every item one by one), whereas hash-based sets use hashing to jump directly to the potential location of an item, providing faster lookup.

*Sources: [Microsoft Learn HashSet<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1), [USACO Guide Sets](https://usaco.guide/bronze/intro-sets)*
