
# collections arrays list dictionary set stack queue concurrent and immutable collections — Reference: Dictionary and sorted key/value collections, comparer behavior, and lookup APIs

*Draft: Automatically generated.*

# Scope and version
This lesson covers the `Dictionary<TKey,TValue>` and sorted key/value collection APIs in .NET 11. It focuses on the mechanics of key-based storage, lookup patterns, and memory-efficient access. For official documentation, see [https://learn.microsoft.com/en-us/dotnet/standard/collections/](https://learn.microsoft.com/en-us/dotnet/standard/collections/) and [https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2).

# How this group fits the mental model
Collections are tools for managing data. A dictionary maps a unique key to a specific value, allowing for fast lookups. While `Dictionary<TKey,TValue>` provides O(1) average time complexity for lookups, `SortedDictionary<TKey,TValue>` and `SortedList<TKey,TValue>` maintain keys in a specific order, which is useful when you need to iterate over data in a sorted sequence or perform range-based queries.

# Supplied names explained

* `Dictionary<TKey,TValue>`: The primary collection for key-value pairs, using a hash table for fast access.
* `Dictionary<TKey,TValue>.Count`: Gets the number of key-value pairs contained in the dictionary.
* `Dictionary<TKey,TValue>.Capacity`: Gets or sets the total number of entries the dictionary can hold without resizing.
* `Dictionary<TKey,TValue>.Comparer`: Gets the `IEqualityComparer<TKey>` used to determine equality for keys.
* `Dictionary<TKey,TValue>.Add`: Adds the specified key and value to the dictionary. Throws if the key exists.
* `Dictionary<TKey,TValue>.TryAdd`: Attempts to add a key and value; returns false if the key already exists, avoiding exceptions.
* `Dictionary<TKey,TValue>.TryGetValue`: Gets the value associated with the specified key without throwing if the key is missing.
* `Dictionary<TKey,TValue>.ContainsKey`: Determines whether the dictionary contains a specific key.
* `Dictionary<TKey,TValue>.ContainsValue`: Determines whether the dictionary contains a specific value.
* `Dictionary<TKey,TValue>.Remove`: Removes the value with the specified key.
* `Dictionary<TKey,TValue>.Remove(key, out value)`: Removes the key and returns the associated value via an out parameter.
* `Dictionary<TKey,TValue>.Clear`: Removes all keys and values from the dictionary.
* `Dictionary<TKey,TValue>.EnsureCapacity`: Sets the capacity to a specified value to minimize reallocations.
* `Dictionary<TKey,TValue>.TrimExcess`: Sets the capacity to the actual number of elements to save memory.
* `Dictionary<TKey,TValue>.GetEnumerator`: Returns an enumerator that iterates through the dictionary. Do not depend on a particular order; mutation invalidates it, with the documented .NET Core 3+ `Remove`/`Clear` exceptions.
* `Dictionary<TKey,TValue>.Keys`: Gets a collection containing the keys in the dictionary.
* `Dictionary<TKey,TValue>.Values`: Gets a collection containing the values in the dictionary.
* `Dictionary<TKey,TValue>.AlternateLookup<TAlternateKey>`: A struct used for performing lookups with a different type than the key type.
* `Dictionary<TKey,TValue>.GetAlternateLookup<TAlternateKey>`: Returns an `AlternateLookup` instance for the dictionary.
* `Dictionary<TKey,TValue>.TryGetAlternateLookup<TAlternateKey>`: Attempts to return an alternate lookup when the comparer supports the alternate key type.
* `ConcurrentDictionary<TKey,TValue>.AlternateLookup<TAlternateKey>`: A view for operations using a compatible alternate key type, available from .NET 9 when the comparer supports `IAlternateEqualityComparer<TAlternateKey,TKey>`.
* `ConcurrentDictionary<TKey,TValue>.GetAlternateLookup<TAlternateKey>`: Returns a compatible alternate-key view or throws when unsupported.
* `ConcurrentDictionary<TKey,TValue>.TryGetAlternateLookup<TAlternateKey>`: Tries to obtain an alternate-key view without throwing when unsupported.
* `ConcurrentDictionary<TKey,TValue>.AlternateLookup<TAlternateKey>.TryGetValue`: Looks up a value with an alternate key.
* `ConcurrentDictionary<TKey,TValue>.AlternateLookup<TAlternateKey>.TryAdd`: Attempts to add using an alternate key.
* `ConcurrentDictionary<TKey,TValue>.AlternateLookup<TAlternateKey>.TryRemove`: Attempts to remove by alternate key.
* `CollectionExtensions.GetValueOrDefault<TKey,TValue>`: Returns the value for a key or a default value if the key is missing.
* `CollectionExtensions.GetValueOrDefault<TKey,TValue>(key, defaultValue)`: Returns the value for a key or a provided default value if the key is missing.
* `CollectionsMarshal.GetValueRefOrAddDefault<TKey,TValue>`: Gets a reference to a value, adding it if missing.
* `CollectionsMarshal.GetValueRefOrNullRef<TKey,TValue>`: Gets a reference to a value or a null reference if missing.
* `CollectionsMarshal.GetValueRefOrAddDefault<TKey,TValue,TAlternateKey>`: Similar to above, but supports alternate key types.
* `CollectionsMarshal.GetValueRefOrNullRef<TKey,TValue,TAlternateKey>`: Similar to above, but supports alternate key types.
* `CollectionsMarshal.AsSpan<T>`: Provides a span view over a `List<T>`'s backing elements. Do not add or remove list items while the returned span is in use [API remarks](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.collectionsmarshal.asspan).
* `CollectionsMarshal.SetCount<T>`: Sets the `Count` of a `List<T>` directly. This low-level method requires care: after increasing the count, initialize the newly exposed elements before reading them; use only when its documented preconditions are met [CollectionsMarshal API](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.collectionsmarshal).
* `CollectionsMarshal.AsBytes(BitArray)`: Provides a byte-representation of a `BitArray`.
* `SortedDictionary<TKey,TValue>`: A tree-based collection that keeps keys sorted.
* `SortedDictionary<TKey,TValue>.Comparer`: Gets the `IComparer<TKey>` used to sort the keys.
* `SortedDictionary<TKey,TValue>.Add`: Adds a key/value pair; a duplicate key throws.
* `CollectionExtensions.TryAdd<TKey,TValue>(IDictionary<TKey,TValue>)`: An extension helper that checks for an existing key and then adds to an `IDictionary`; this is not an atomic concurrent operation. Prefer a collection's own `TryAdd` method when it has one.
* `OrderedDictionary<TKey,TValue>`: A .NET 9+ generic dictionary that combines key lookup with insertion-order and indexed operations. It preserves insertion order, not sorted key order.
* `OrderedDictionary<TKey,TValue>.Count`: Gets the number of pairs.
* `OrderedDictionary<TKey,TValue>.Capacity`: Gets the number of pairs it can hold before resize.
* `OrderedDictionary<TKey,TValue>.Comparer`: Gets the key equality comparer.
* `OrderedDictionary<TKey,TValue>.Add`: Adds a unique key/value pair.
* `OrderedDictionary<TKey,TValue>.TryAdd`: Adds a pair only if its key is absent.
* `OrderedDictionary<TKey,TValue>.TryAdd(TKey,TValue,out index)`: .NET 11 overload that attempts to add the pair and reports the added or existing key's index through `out index`.
* `OrderedDictionary<TKey,TValue>.TryGetValue(TKey,out TValue,out index)`: .NET 11 overload that retrieves by key and reports its index, or -1 when absent.
* `OrderedDictionary<TKey,TValue>.TryGetValue`: Retrieves a value by key without throwing when absent.
* `OrderedDictionary<TKey,TValue>.ContainsKey`: Tests key membership.
* `OrderedDictionary<TKey,TValue>.ContainsValue`: Tests value membership.
* `OrderedDictionary<TKey,TValue>.GetAt`: Gets a key/value pair by insertion-order index.
* `OrderedDictionary<TKey,TValue>.SetAt`: Replaces the pair or value at an existing index.
* `OrderedDictionary<TKey,TValue>.Insert`: Inserts a key/value pair at an index.
* `OrderedDictionary<TKey,TValue>.Remove`: Removes a pair by key.
* `OrderedDictionary<TKey,TValue>.RemoveAt`: Removes the pair at an index.
* `OrderedDictionary<TKey,TValue>.IndexOf`: Finds a key's index.
* `OrderedDictionary<TKey,TValue>.EnsureCapacity`: Reserves capacity for a minimum number of entries.
* `OrderedDictionary<TKey,TValue>.TrimExcess`: Reduces excess internal capacity.
* `OrderedDictionary<TKey,TValue>.Keys`: Enumerates keys in insertion order.
* `OrderedDictionary<TKey,TValue>.Values`: Enumerates values in corresponding insertion order.
* `OrderedDictionary<TKey,TValue> insertion order contract`: Reordering through index APIs changes position; ordinary dictionary key order is not a substitute for this explicit contract.
* `SortedDictionary<TKey,TValue>.TryGetValue`: Retrieves a value by key without throwing when absent.
* `SortedDictionary<TKey,TValue>.Remove`: Removes a key and associated value.
* `SortedDictionary<TKey,TValue>.ContainsKey`: Checks for a key.
* `SortedDictionary<TKey,TValue>.Keys`: Enumerates keys in comparer order.
* `SortedDictionary<TKey,TValue>.Values`: Enumerates values in corresponding key order.
* `SortedList<TKey,TValue>`: A sorted array-based collection; memory-efficient but slower for insertions than `SortedDictionary`.
* `SortedList<TKey,TValue>.Capacity`: Gets or sets the capacity of the sorted list.
* `SortedList<TKey,TValue>.GetKeyAtIndex`: Gets the key at a specific index.
* `SortedList<TKey,TValue>.GetValueAtIndex`: Gets the value at a specific index.
* `SortedList<TKey,TValue>.IndexOfKey`: Returns the index of a specific key.
* `SortedList<TKey,TValue>.IndexOfValue`: Returns the index of a specific value.
* `SortedList<TKey,TValue>.RemoveAt`: Removes the element at a specific index.
* `SortedList<TKey,TValue>.TrimExcess`: Reduces excess storage when beneficial. Insertions/removals in its sorted arrays can shift entries.
* `SortedList<TKey,TValue>.Add`: Adds a pair at its comparer-sorted position; duplicate keys throw.
* `SortedList<TKey,TValue>.TryGetValue`: Looks up a value without throwing for an absent key.
* `SortedList<TKey,TValue>.Remove`: Removes a key/value pair by key.
* `SortedList<TKey,TValue>.ContainsKey`: Checks whether a key exists.
* `HashSet<T> hash code requirement`: Elements must obey consistent equality/hash-code semantics. Supply a custom `IEqualityComparer<T>` when equality differs from the type default.
* `Dictionary key equality comparer`: The logic used to determine if two keys are the same.
* `Dictionary duplicate key handling`: Dictionaries do not allow duplicate keys; `Add` throws, `TryAdd` returns false.
* `Dictionary TryGetValue versus indexer`: Indexers throw if the key is missing; `TryGetValue` returns a boolean.
* `Dictionary key mutation hazard`: If a key object's equality or hash behavior changes while stored, the dictionary does not relocate it; later lookup or removal may fail. Keep hash-relevant key state stable.
* `Dictionary versus SortedDictionary`: `Dictionary` is faster for lookups; `SortedDictionary` maintains order.
* `Dictionary versus SortedList`: `SortedList` uses less memory than `SortedDictionary` but is slower for insertions.

# Cross-item comparison
* **Dictionary vs. OrderedDictionary vs. SortedDictionary vs. SortedList**: `OrderedDictionary` supports insertion-order enumeration plus key/index operations; it does not sort keys. `Dictionary` has expected O(1) lookup under suitable hashing and makes no ordering promise. `SortedDictionary` maintains comparer order with O(log n) lookup and insertion. `SortedList` stores sorted key/value arrays, offers indexed access, and has O(n) insertion/removal away from the end because entries shift; select based on the full read/update pattern.
* **Lookup APIs**: `TryGetValue` is safer than the indexer `[]` because it avoids exceptions. `AlternateLookup` (introduced in .NET 9) allows looking up values using a different type (e.g., `ReadOnlySpan<char>` instead of `string`) to avoid unnecessary allocations.

# Examples
```csharp
var dict = new Dictionary<string, int>();
dict.TryAdd("apple", 1);

// Safe lookup
if (dict.TryGetValue("apple", out int value)) {
    Console.WriteLine(value); // Outputs: 1
}

// Using GetValueOrDefault
int count = dict.GetValueOrDefault("banana", 0); // Returns 0
```

# Common mistakes
* **Mutating Keys**: Changing state used by a key's equality or hash implementation while it is stored can make lookup/removal fail. This violates the hash collection's key invariant; it does not mean the runtime's memory is corrupted.
* **Ignoring Capacity**: For large collections, failing to set `Capacity` or `EnsureCapacity` causes multiple internal array reallocations, hurting performance.
* **Assuming Thread Safety**: `Dictionary` is not thread-safe. Use `ConcurrentDictionary` for multi-threaded scenarios.

# Knowledge checks with answers
1. **Question**: Which collection should you use if you need to keep keys sorted and perform frequent insertions?
   **Answer**: `SortedDictionary<TKey,TValue>`.
2. **Question**: Why is `TryGetValue` preferred over the indexer `dict[key]`?
   **Answer**: The indexer throws an exception if the key is missing, whereas `TryGetValue` returns `false` safely.
3. **Question**: What happens if you modify a key object while it is inside a `Dictionary`?
   **Answer**: The dictionary does not rehash or relocate the stored entry. Lookup or removal may fail because the key now compares or hashes differently; keep key equality/hash state stable while stored.
