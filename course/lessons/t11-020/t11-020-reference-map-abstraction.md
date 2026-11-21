
# hash maps and frequency tables — Reference: Map abstraction and operations

# Scope and version
This lesson covers the fundamental operations of the `Map` abstraction as defined in timeless data-structure theory. .NET examples refer to the current `Dictionary<TKey, TValue>` API documentation checked 2026-11-17; implementation details are not generalized to every map. This lesson excludes set operations, tree-based structures, and cryptographic hashing.

# How this group fits the mental model
A `Map` is a collection that stores data as pairs and identifies each key under its equality rule. Think of it like a physical address book: the "Key" is the person's name, and the "Value" is their phone number. You search by the name to retrieve the number.

The operations listed below define how you interact with this "book." A hash-based map uses a hash function to narrow where it searches. Its expected performance depends on hash distribution, collisions, and key hashing/equality costs; the abstract Map interface itself does not require hashing.

# Supplied names explained

* `Key-value mapping`: The core relationship where a unique identifier (the key) is associated with a specific piece of data (the value).
* `Key uniqueness`: The constraint that keys must be unique under the map's equality rule. If you attempt to add an equivalent key, the API may reject it or replace the value, depending on the operation and implementation.
* `Value replacement`: The process of updating the value associated with an existing key. This is usually performed by assigning a new value to an existing key.
* `Insert or update`: A common pattern where the map checks if a key exists; if it does, it updates the value, and if it does not, it creates a new entry.
* `Lookup by key`: The primary operation of retrieving a value by providing its corresponding key. APIs may return a presence flag, an optional value, a default, or an exception on a miss.
* `Remove by key`: The operation of deleting a matching key and associated value when present. Many APIs report whether an entry was removed; absence need not be an error.
* `Missing-key result`: The behavior of the map when you search for a key that does not exist. It depends on the API. In .NET `Dictionary<TKey,TValue>`, the indexer getter throws `KeyNotFoundException`, while `TryGetValue` returns `false` and sets its output to the default value.

# Cross-item comparison

* `Lookup by key` vs `Remove by key`: Both can be called with a present or absent key. `Lookup` leaves membership unchanged, while `Remove` changes membership when the key exists.
* `Value replacement` vs `Insert or update`: `Value replacement` implies the key is already known to exist, whereas `Insert or update` is a conditional operation that handles both the presence and absence of a key in one logical step.

# Examples

**Scenario: Counting word frequencies**
To count how many times words appear in a list, you use a map where the word is the `Key` and the count is the `Value`.

1. **Lookup by key**: Check if the word is already in the map.
2. **Missing-key result**: If the word is not found, treat the count as 0.
3. **Insert or update**: Increment the count and store it back in the map.

```csharp
// Conceptual snippet for frequency counting
var counts = new Dictionary<string, int>();
string word = "apple";

// Insert or update logic
if (counts.ContainsKey(word)) {
    counts[word] = counts[word] + 1; // Value replacement
} else {
    counts[word] = 1; // Initial insertion
}
```

# Common mistakes

* **Mutable Keys**: Changing fields used by equality or hashing after insertion can make lookup/removal fail or violate the map's key assumptions. Keep such key state stable.
* **Ignoring Missing-key results**: Assuming a key always exists. Always check if a key is present before accessing it to avoid runtime errors (like `KeyNotFoundException`).
* **Over-reliance on performance**: Assuming all operations are always constant-time. If many keys have the same hash code (a collision), performance can degrade to linear time.

# Knowledge checks with answers

1. **Question**: If you add a key that already exists in the map, what happens to the old value?
   **Answer**: It is typically overwritten by the new value (Value replacement).

2. **Question**: Why is `Key uniqueness` important for a map?
   **Answer**: It ensures that a single lookup by key always returns a deterministic, unambiguous result.

3. **Question**: What is the difference between `Lookup by key` and `Remove by key`?
   **Answer**: `Lookup` retrieves data without changing the map; `Remove` deletes the entry, changing the map's size and structure.

*Sources: [OpenDSA Hashing](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/HashIntro.html), [Microsoft Dictionary Reference](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2), [USACO Guide](https://usaco.guide/bronze/intro-sets)*
