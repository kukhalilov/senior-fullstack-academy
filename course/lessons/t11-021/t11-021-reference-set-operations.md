
# sets and membership algorithms — Reference: Mathematical set operations

# Scope and version
This lesson covers the mathematical set operations available in .NET collections. It focuses on the logic of comparing and combining sets rather than the internal implementation of specific collection classes. The information is based on timeless set theory concepts and .NET 11 API references as of 2026-11-14.

# How this group fits the mental model
In programming, a **set** is a collection of distinct elements. Unlike a list, a set does not care about the order of items or how many times an item appears (multiplicity); it only cares whether an item is present. 

Mathematical set operations allow you to derive new sets from existing ones or verify relationships between them. These operations are the standard way to perform bulk comparisons, such as finding commonalities between two user lists or determining if one group of permissions is entirely contained within another.

# Supplied names explained
These operations are typically implemented as methods on collection types like `HashSet<T>` or `SortedSet<T>`.

* `Union`: Combines two sets into one, containing all unique elements found in either set.
* `Intersection`: Produces a set containing only the elements that exist in both source sets.
* `Difference`: Produces a set containing elements that are in the first set but not in the second.
* `Symmetric difference`: Produces a set containing elements that are in either of the sets, but not in both.
* `Subset`: A boolean check that returns true if every element in the first set is also contained in the second set.
* `Proper subset`: A boolean check that returns true if every element in the first set is in the second, but the second set contains at least one additional element not in the first.
* `Superset`: A boolean check that returns true if every element in the second set is also contained in the first set.
* `Set disjointness`: A boolean check that returns true if two sets have no elements in common (i.e., their intersection is empty).

# Cross-item comparison
When working with these operations, it is helpful to categorize them by their output type:

* **Set-transforming operations** (`Union`, `Intersection`, `Difference`, `Symmetric difference`): These describe the mathematical result set; the API determines whether it is materialized, lazy, or applied by mutation. LINQ `Union` returns a deferred `IEnumerable<T>` query, while `HashSet<T>.UnionWith` mutates the receiver. Use the matching `HashSet<T>` methods `IntersectWith`, `ExceptWith`, and `SymmetricExceptWith` when you want to mutate a hash set. Choose a query/operator when you need a separate result and materialize it explicitly when necessary.
* **Predicate operations** (`Subset`, `Proper subset`, `Superset`, `Set disjointness`): These return a boolean (`true` or `false`). They are used for validation or logic branching (e.g., "Do these two groups have any overlap?").

No other within-group comparisons apply.

# Examples
Suppose you have two sets: `SetA = {1, 2, 3}` and `SetB = {3, 4, 5}`.

* **Union**: `SetA` union `SetB` results in `{1, 2, 3, 4, 5}`.
* **Intersection**: `SetA` intersection `SetB` results in `{3}`.
* **Difference**: `SetA` difference `SetB` results in `{1, 2}`.
* **Symmetric difference**: `SetA` symmetric difference `SetB` results in `{1, 2, 4, 5}`.
* **Subset**: `{1, 2}` is a `Subset` of `SetA` (True).
* **Set disjointness**: `SetA` and `{6, 7}` have `Set disjointness` (True, because they share no elements).

# Common mistakes
* **Confusing Difference with Symmetric Difference**: Remember that `Difference` is directional (A minus B is not the same as B minus A), whereas `Symmetric difference` is commutative (A vs B is the same as B vs A).
* **Ignoring the "Proper" in Proper Subset**: A set is a `Subset` of itself, but it is *not* a `Proper subset` of itself. A proper subset must be strictly smaller.
* **Performance assumptions**: While these operations are highly optimized, performing them on very large sets repeatedly can be expensive. Always consider if you need to perform the operation once and store the result, or if you can use a predicate check instead.

# Knowledge checks with answers
1. **Question**: If Set A is `{1, 2}` and Set B is `{1, 2, 3}`, is Set A a `Proper subset` of Set B?
   * **Answer**: Yes. Every element of A is in B, and B contains an extra element (3).

2. **Question**: If two sets have no elements in common, what is the result of their `Intersection`?
   * **Answer**: An empty set.

3. **Question**: Which operation would you use to find all items that are unique to either set, excluding items that appear in both?
   * **Answer**: `Symmetric difference`.

*Source: [Microsoft Learn HashSet<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1), [SortedSet<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.sortedset-1), and [USACO Guide](https://usaco.guide/bronze/intro-sets).*
