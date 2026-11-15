<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# collections arrays list dictionary set stack queue concurrent and immutable collections — Reference: Complexity, ordering guarantees, capacity, equality, and safe iteration

*Draft: Automatically generated.*

# Scope and version
This lesson covers performance characteristics, ordering guarantees, and safety boundaries for .NET collections. The information is based on the .NET 11 stable collection API surface as of 2026-11-14.

# How this group fits the mental model
In .NET, a collection is a combination of a storage structure and a set of operations. Choosing the right collection requires understanding the performance cost of operations (Big O notation) and the guarantees provided by the implementation. This group of concepts helps you predict how a collection will behave under load, how it handles data equality, and how to avoid common performance pitfalls like unnecessary memory allocations or thread-safety violations.

# Supplied names explained
* `Amortized complexity of List<T>.Add`: While adding an item to a `List<T>` usually takes constant time, it occasionally triggers a resize of the internal array, which is an expensive operation. The "amortized" cost averages these expensive operations over many additions, resulting in an effective constant-time performance.
* `Linear-time List<T> insertion`: Inserting an item into the middle of a `List<T>` requires shifting all subsequent elements, making the operation proportional to the number of elements in the list.
* `Array indexed access complexity`: Accessing an element in an `Array` by its index is a constant-time operation, as the memory address is calculated directly from the index.
* `Dictionary expected lookup complexity`: A `Dictionary<TKey, TValue>` provides constant-time lookup on average, assuming a good distribution of hash codes.
* `Hash collision behavior`: When two distinct keys produce the same hash code, the dictionary must perform additional work to distinguish them, which can degrade performance from constant time toward linear time.
* `Hash code and equality consistency`: Equal values must produce equal hash codes. Keep state used by equality and hashing stable while an object is stored as a hash key; changing it can make lookup or removal fail because the item remains in a bucket chosen from its earlier hash.
* `IEqualityComparer<T>`: An interface used to define custom equality and hash code logic for types, allowing collections to compare items based on specific business rules rather than default reference or value equality.
* `Comparer<T>`: A base class that provides a default implementation of `IComparer<T>`, useful for sorting operations.
* `IComparer<T>`: An interface used to define custom ordering logic for sorting collections or performing binary searches.
* `StringComparer.Ordinal`: A culture-independent comparer that uses ordinal string rules. It is appropriate for many protocol identifiers and machine-oriented keys; choose it for semantics, and measure performance when it matters.
* `StringComparer.OrdinalIgnoreCase`: Similar to `Ordinal`, but ignores character casing during comparison.
* `Stable ordering guarantee`: A stable sort preserves the relative order of elements that compare equal. `Array.Sort` and `List<T>.Sort` are explicitly unstable, so use a stable operation such as LINQ `OrderBy` when preserving ties matters [List.Sort remarks](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.sort).
* `Dictionary enumeration order contract`: The .NET `Dictionary<TKey, TValue>` does not guarantee any specific order when iterating over its contents.
* `Set iteration order contract`: Similar to dictionaries, `HashSet<T>` does not guarantee a specific order of elements.
* `PriorityQueue equal-priority ordering`: When multiple elements have the same priority, the `PriorityQueue<TElement, TPriority>` does not guarantee which one will be dequeued first.
* `Pre-size collection capacity`: Initializing a collection with a known capacity prevents the performance overhead of multiple internal array reallocations as the collection grows.
* `Avoid repeated List<T> reallocations`: A performance practice of setting the capacity of a `List<T>` upfront when the final size is known.
* `Avoid unnecessary ToArray materialization`: Calling `.ToArray()` creates a new copy of the collection in memory; avoid this unless you specifically need a fixed-size snapshot.
* `Collection mutation during enumeration`: Mutation rules depend on the collection. For example, structural changes to a `List<T>` invalidate its enumerator and subsequent enumeration operations throw `InvalidOperationException`; check the specific collection contract.
* `Snapshot enumeration`: An enumerator over a point-in-time copy of collection contents. Do not infer that all concurrent enumerators are snapshots: `ConcurrentDictionary` explicitly documents that its enumerator is safe during concurrent updates but is not a moment-in-time snapshot [API remarks](https://learn.microsoft.com/en-us/dotnet/api/system.collections.concurrent.concurrentdictionary-2.getenumerator).
* `Collection thread-safety is not implied by read-only interface`: An interface like `IReadOnlyList<T>` only restricts the *caller's* ability to modify the collection; the underlying object may still be modified by other threads.
* `Collection versus memory-oriented span`: Collections are high-level abstractions for data management, whereas `Span<T>` provides low-level, stack-only access to contiguous memory regions for performance-critical scenarios.
* `CollectionsMarshal ref-returning access and safety boundary`: A low-level API exposing spans or references to backing storage for specific collections. It does not generally turn off CLR bounds checks. Follow each method's lifetime and mutation restrictions so the view remains valid and collection invariants are preserved [CollectionsMarshal API](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.collectionsmarshal).

# Cross-item comparison
Within this group, the concepts focus on performance and safety. For example, `Amortized complexity of List<T>.Add` and `Linear-time List<T> insertion` contrast the efficiency of appending versus inserting. Similarly, `Dictionary enumeration order contract` and `Set iteration order contract` both highlight the lack of guaranteed ordering in hash-based collections, distinguishing them from sorted alternatives.

# Examples
```csharp
// Pre-sizing a list to avoid reallocations
var list = new List<int>(1000); 

// Using a comparer for custom dictionary logic
var dict = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
```

# Common mistakes
* Assuming `IReadOnlyList<T>` makes a collection thread-safe.
* Assuming every collection has the same mutation-during-enumeration behavior; check the concrete collection's documented contract.
* Using a custom object as a dictionary key without overriding `GetHashCode` and `Equals` correctly.
* Forgetting to pre-size collections when the final count is known, leading to unnecessary memory allocations.

# Knowledge checks with answers
1. **Question:** Why is `List<T>.Add` considered "amortized" constant time?
   **Answer:** Because most additions are fast, but occasional internal array resizing makes some additions slower; the average cost remains constant.
2. **Question:** Does `IReadOnlyList<T>` guarantee that the collection will not change?
   **Answer:** No, it only prevents the code holding that interface reference from modifying it; the underlying collection can still be changed by other parts of the program.
3. **Question:** What happens if you modify a `List<T>` while iterating over it?
   **Answer:** It typically throws an exception because the iterator's state becomes invalid.

*Source: [https://learn.microsoft.com/en-us/dotnet/standard/collections/](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
