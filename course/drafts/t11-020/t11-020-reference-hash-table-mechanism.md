<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Reference: Hash-table mechanism

# Scope and version

This reference lesson covers the mechanics of hash tables under the scope of timeless data-structure concepts and .NET 11 API reference checks performed on 2026-11-14. 

Source citation: [Microsoft Learn Dictionary<TKey,TValue> Reference](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2)

# How this group fits the mental model

Before examining individual API names or structural features, it helps to understand the problem hash maps solve. When storing collections of items where you need to look up a value by a key, simple lists or arrays require linear scanning, which takes time proportional to the number of items. A hash map associates each key with a value and supports lookup by key in expected constant time.

To achieve this, the system uses a bucket array to store entries. The fundamental process works as follows:
1. A **hash function** computes an integer **hash code** from the given key.
2. The system maps this hash code to an index within the **bucket array**.
3. Because multiple different keys can produce the same array index, a **collision** occurs, requiring a resolution strategy such as **separate chaining** or **open addressing**.
4. Once the correct bucket or position is found, **equality comparison** determines if the stored key matches the query key.
5. As items are added, the **load factor** increases. When it exceeds a threshold, the table undergoes **rehashing** into a larger bucket array to maintain performance.

# Supplied names explained

* `Hash function`
  Purpose and behavior: An algorithm that transforms a key of arbitrary or primitive type into a fixed-size integer value. A good hash function distributes keys uniformly across the available index space to minimize collisions.

* `Hash code`
  Purpose and behavior: The integer result returned by a hash function for a specific key. It acts as the initial numeric proxy used to locate where a value should reside in the underlying data structure.

* `Equality comparison`
  Purpose and behavior: The definitive check used to determine whether two keys are equal. Even if two keys produce the same hash code (a collision), the equality comparison ensures that the correct key-value pair is retrieved or updated.

* `Collision`
  Purpose and behavior: An event where two distinct keys produce the same bucket index or hash-derived location. Because the table cannot store two different keys in the exact same slot without a strategy, hash structures must handle collisions explicitly.

* `Separate chaining`
  Purpose and behavior: A collision resolution technique where each bucket in the bucket array points to a secondary data structure (such as a linked list or tree) containing all entries that hashed to that same bucket index.

* `Open addressing`
  Purpose and behavior: A collision resolution technique where all entries are stored directly within the bucket array itself. When a collision occurs, the table probes for the next available open slot according to a specified sequence.

* `Linear probing`
  Purpose and behavior: An open-addressing collision resolution method that checks subsequent sequential slots (index + 1, index + 2, and so on) wrapped around the array when a collision occurs.

* `Quadratic probing`
  Purpose and header: An open-addressing collision resolution method that checks slots at intervals defined by a quadratic function (such as index + $1^2$, index + $2^2$, index + $3^2$) to reduce clustering patterns common in linear probing.

* `Double hashing`
  Purpose and behavior: An open-addressing collision resolution method that computes a second hash function to determine the step size for probing alternative slots, yielding a more uniform distribution of probes during collisions.

* `Load factor`
  Purpose and behavior: A metric calculated as the ratio of stored entries to the total number of buckets in the bucket array. A higher load factor increases collision frequency, degrading lookup performance toward linear time.

* `Rehashing`
  Purpose and behavior: The process of allocating a larger bucket array—typically double the previous capacity—and re-inserting all existing keys into their new computed bucket positions when the load factor exceeds a defined threshold.

* `Bucket array`
  Purpose and behavior: The primary underlying contiguous memory array where hash table entries or references to separate chains are stored, indexed directly by transformed hash codes.

# Cross-item comparison

Within this assigned inventory group, items can be contrasted by their structural roles:
* **Hash function** vs. **Hash code**: The hash function is the transformation procedure, whereas the hash code is the resulting integer value produced by that procedure.
* **Separate chaining** vs. **Open addressing**: Separate chaining handles collisions by building secondary lists off the main bucket array, while open addressing stores all entries strictly inside the bucket array by probing for alternate empty slots.
* **Linear probing**, **Quadratic probing**, and **Double hashing**: These are three distinct probe sequence strategies used within open addressing to locate the next available slot after a collision.

# Examples

The following C# snippet demonstrates how hash maps rely on hash codes, equality comparisons, and internal resizing (rehashing) behind a standard dictionary interface.

```csharp
// Snippet demonstrating a hash map (Dictionary) in operation.
// Context: Requires 'using System.Collections.Generic;'

var frequencyTable = new Dictionary<string, int>();

string[] words = { "apple", "banana", "apple", "cherry", "banana", "apple" };

foreach (var word in words)
{
    if (frequencyTable.ContainsKey(word))
    {
        frequencyTable[word]++;
    }
    else
    {
        frequencyTable[word] = 1;
    }
}

// Expected output concept:
// "apple": 3
// "banana": 2
// "cherry": 1
```

# Common mistakes

* **Mutating keys after insertion**: Changing the fields of an object that acts as a dictionary key alters its hash code or equality outcome, making the entry permanently lost or unretrievable within the bucket array.
* **Inconsistent hash code and equality**: Implementing a custom type where two instances are considered equal via `Equality comparison` but produce different `Hash code` values violates fundamental hash contract rules and causes lookup failures.
* **Ignoring load factor impacts**: Assuming that hash maps operate in constant time under all conditions without accounting for degenerate hash distributions that cause excessive collisions and worst-case linear performance.

# Knowledge checks with answers

1. **Question:** What is the primary purpose of a load factor in a hash table?
   **Answer:** The load factor measures how full the bucket array is (ratio of entries to buckets). It determines when the table must trigger rehashing to expand its capacity and preserve expected constant-time performance.

2. **Question:** How do separate chaining and open addressing differ in handling collisions?
   **Answer:** Separate chaining stores colliding entries in secondary data structures attached to each bucket, whereas open addressing stores every entry directly in the bucket array by probing for another empty slot.

3. **Question:** Why might a hash table lookup degrade from expected constant time to worst-case linear time?
   **Answer:** If a poor hash function causes many keys to hash to the same bucket (or collision resolution probes degenerate into long sequential searches), operations require scanning proportional to the number of items.
