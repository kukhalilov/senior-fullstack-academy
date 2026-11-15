<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# collections arrays list dictionary set stack queue concurrent and immutable collections — Reference: Enumeration, generic collection contracts, mutability, and choosing a shape

*This is an automatically generated draft.*

# Scope and version
This lesson covers the core interfaces and behavioral contracts for collections in .NET 11. It focuses on how to choose and interact with collection types using standard contracts. This content is based on the .NET 11 stable collection API surface (checked 2026-11-14).

# How this group fits the mental model
In .NET, a collection is a combination of a storage shape (how data is organized) and a set of operations (how you interact with it). Interfaces like `IEnumerable<T>` and `IList<T>` act as contracts. By using these interfaces, your code can remain flexible, working with any collection that satisfies the required behavior rather than being tied to a specific implementation like `List<T>` or `HashSet<T>`.

# Supplied names explained

* `IEnumerable<T>`: A common contract for generic iteration; many generic collections implement it, but generic types are not required to be collections or implement it.
* `IEnumerator<T>`: The object that maintains the current position during iteration over an `IEnumerable<T>`.
* `ICollection<T>`: Extends `IEnumerable<T>` to provide methods for adding, removing, and checking the size of a collection.
* `IReadOnlyCollection<T>`: A contract that provides access to the number of elements and iteration without allowing modification.
* `IList<T>`: Extends `ICollection<T>` to provide indexed access (by position) to elements.
* `IReadOnlyList<T>`: Combines `IReadOnlyCollection<T>` with indexed access.
* `IDictionary<TKey,TValue>`: A contract for collections that map unique keys to values.
* `IReadOnlyDictionary<TKey,TValue>`: A read-only view of a key-value mapping.
* `ISet<T>`: A contract for collections that enforce uniqueness of elements.
* `IReadOnlySet<T>`: A read-only view of a set.
* `ICollection<T>.Add`: Adds an item to the collection.
* `ICollection<T>.Remove`: Removes a specific item from the collection.
* `ICollection<T>.Contains`: Checks if an item exists in the collection.
* `ICollection<T>.CopyTo`: Copies the elements of the collection to an array.
* `ICollection<T>.Count`: Returns the number of elements currently in the collection.
* `ICollection<T>.IsReadOnly`: A property indicating whether the collection can be modified.
* `IList<T>.IndexOf`: Returns the index of a specific item in an indexed collection.
* `IList<T>.Insert`: Inserts an item at a specific index.
* `IList<T>.RemoveAt`: Removes an item at a specific index.
* `IDictionary<TKey,TValue>.Keys`: A collection containing all keys in the dictionary.
* `IDictionary<TKey,TValue>.Values`: A collection containing all values in the dictionary.
* `IDictionary<TKey,TValue>.TryGetValue`: A safe way to retrieve a value by key without throwing an exception if the key is missing.
* `KeyValuePair<TKey,TValue>`: A structure representing a single key-value pair.
* `Collection initializer`: A syntax feature to populate a collection during instantiation.
* `Collection expression target collection`: The specific collection type created when using the `[...]` syntax.
* `Collection capacity`: The number of elements a collection can hold before it must resize its internal storage.
* `Collection Count`: The current number of elements in the collection.
* `Enumerator invalidation after mutation`: The behavior where an enumerator becomes invalid if the underlying collection is modified during iteration.
* `Fail-fast enumerator behavior`: The mechanism that throws an exception if a collection is modified while being enumerated.
* `Generic versus non-generic collection`: The distinction between type-safe collections (`List<T>`) and legacy collections (`ArrayList`) that store `object`.
* `Read-only view versus immutable collection`: A read-only view is a restricted interface to a mutable object; an immutable collection cannot be changed after creation.
* `Collection selection by access pattern`: The process of choosing a collection based on whether you need indexed access, uniqueness, or specific ordering.

# Cross-item comparison
* **`ICollection<T>` vs `IReadOnlyCollection<T>`**: `ICollection<T>` allows modification (Add/Remove), while `IReadOnlyCollection<T>` only allows inspection.
* **`IList<T>` vs `IDictionary<TKey,TValue>`**: `IList<T>` uses integer indices for access; `IDictionary<TKey,TValue>` uses arbitrary keys.
* **`Read-only view` vs `Immutable collection`**: A read-only view can still change if the underlying object is modified elsewhere. An immutable collection's structure cannot be changed, but mutable elements may still require synchronization.

# Examples
```csharp
// Collection initializer
List<int> numbers = new() { 1, 2, 3 };

// Using an interface for flexibility
void PrintCount(IReadOnlyCollection<int> collection) 
    => Console.WriteLine(collection.Count);

// TryGetValue usage
Dictionary<string, int> myDictionary = new() { ["key"] = 42 };
if (myDictionary.TryGetValue("key", out var value)) {
    Console.WriteLine(value);
}
```

# Common mistakes
* **Modifying during iteration**: Structural changes invalidate some enumerators (for example, `List<T>`); behavior depends on the collection contract and implementation.
* **Confusing Read-only with Immutable**: Casting a `List<T>` to `IReadOnlyList<T>` does not make the list immutable; the original list can still be modified by other references.
* **Ignoring Capacity**: When approximate size is known, an appropriate initial capacity can reduce reallocations. Excessive preallocation wastes memory; not every collection exposes capacity.

# Knowledge checks with answers
1. **Q: Can you modify a collection through an `IReadOnlyList<T>` reference?**
   A: No, the interface does not expose methods like `Add` or `Remove`.
2. **Q: What happens if you add an item to a `List<T>` while iterating over it?**
   A: The enumerator will throw an exception due to `Fail-fast enumerator behavior`.
3. **Q: Why choose `IDictionary<TKey,TValue>` over `IList<T>`?**
   A: Choose `IDictionary` when you need to look up values by a specific key rather than by a numeric index.

*Source: [https://learn.microsoft.com/en-us/dotnet/standard/collections/](https://learn.microsoft.com/en-us/dotnet/standard/collections/)*
