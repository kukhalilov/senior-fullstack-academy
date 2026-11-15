<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

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
* `Dictionary<TKey,TValue>.GetEnumerator`: Returns an enumerator that iterates through the dictionary.
* `Dictionary<TKey,TValue>.Keys`: Gets a collection containing the keys in the dictionary.
* `Dictionary<TKey,TValue>.Values`: Gets a collection containing the values in the dictionary.
* `Dictionary<TKey,TValue>.AlternateLookup<TAlternateKey>`: A struct used for performing lookups with a different type than the key type.
* `Dictionary<TKey,TValue>.GetAlternateLookup<TAlternateKey>`: Returns an `AlternateLookup` instance for the dictionary.
* `Dictionary<TKey,TValue>.TryGetAlternateLookup<TAlternateKey>`: Attempts to return an `AlternateLookup` instance.
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
* `SortedList<TKey,TValue>`: A sorted array-based collection; memory-efficient but slower for insertions than `SortedDictionary`.
* `SortedList<TKey,TValue>.Capacity`: Gets or sets the capacity of the sorted list.
* `SortedList<TKey,TValue>.GetKeyAtIndex`: Gets the key at a specific index.
* `SortedList<TKey,TValue>.GetValueAtIndex`: Gets the value at a specific index.
* `SortedList<TKey,TValue>.IndexOfKey`: Returns the index of a specific key.
* `SortedList<TKey,TValue>.IndexOfValue`: Returns the index of a specific value.
* `SortedList<TKey,TValue>.RemoveAt`: Removes the element at a specific index.
* `SortedList<TKey,TValue>.TrimExcess`: Reduces capacity to the current count.
* `HashSet<TKey> hash code requirement`: Keys must implement `GetHashCode` and `Equals` correctly to function in hash-based collections.
* `Dictionary key equality comparer`: The logic used to determine if two keys are the same.
* `Dictionary duplicate key handling`: Dictionaries do not allow duplicate keys; `Add` throws, `TryAdd` returns false.
* `Dictionary TryGetValue versus indexer`: Indexers throw if the key is missing; `TryGetValue` returns a boolean.
* `Dictionary key mutation hazard`: If a key object's equality or hash behavior changes while stored, the dictionary does not relocate it; later lookup or removal may fail. Keep hash-relevant key state stable.
* `Dictionary versus SortedDictionary`: `Dictionary` is faster for lookups; `SortedDictionary` maintains order.
* `Dictionary versus SortedList`: `SortedList` uses less memory than `SortedDictionary` but is slower for insertions.

# Cross-item comparison
* **Dictionary vs. SortedDictionary vs. SortedList**: `Dictionary` has expected O(1) lookup under suitable hashing and makes no ordering promise. `SortedDictionary` maintains comparer order with O(log n) lookup and insertion. `SortedList` stores sorted key/value arrays, offers indexed access, and has O(n) insertion/removal away from the end because entries shift; select based on the full read/update pattern.
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
