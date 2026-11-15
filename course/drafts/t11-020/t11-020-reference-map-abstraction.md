<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Reference: Map abstraction and operations

*This is an automatically generated draft.*

# Scope and version
This lesson covers the fundamental operations of the `Map` abstraction as defined in timeless data-structure theory. The reference points are based on general computer science principles and the .NET 11 `Dictionary<TKey, TValue>` implementation as of 2026-11-14. This lesson excludes set operations, tree-based structures, and cryptographic hashing.

# How this group fits the mental model
A `Map` is a collection that stores data as pairs. Think of it like a physical address book: the "Key" is the person's name, and the "Value" is their phone number. You do not search by the phone number; you search by the name to retrieve the number. 

The operations listed below define how you interact with this "book." Because a map uses a hash function to jump directly to the location of a key, these operations are typically very fast (constant-time), provided the keys are distributed well.

# Supplied names explained

* `Key-value mapping`: The core relationship where a unique identifier (the key) is associated with a specific piece of data (the value).
* `Key uniqueness`: The constraint that every key in the map must be distinct. If you attempt to add a key that already exists, the map will either reject the new entry or overwrite the old one.
* `Value replacement`: The process of updating the value associated with an existing key. This is usually performed by assigning a new value to an existing key.
* `Insert or update`: A common pattern where the map checks if a key exists; if it does, it updates the value, and if it does not, it creates a new entry.
* `Lookup by key`: The primary operation of retrieving a value by providing its corresponding key.
* `Remove by key`: The operation of deleting both the key and its associated value from the map.
* `Missing-key result`: The behavior of the map when you search for a key that does not exist. Depending on the language, this might return a "null" value, a default value, or throw an error.

# Cross-item comparison

* `Lookup by key` vs `Remove by key`: Both require the key to be present to function effectively. However, `Lookup` is a read-only operation that leaves the map unchanged, while `Remove` modifies the internal structure of the map.
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

* **Mutable Keys**: Using an object as a key and then changing its internal state. If the object's hash code changes after it is inserted, the map will be unable to find it again because it will look in the wrong "bucket."
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
