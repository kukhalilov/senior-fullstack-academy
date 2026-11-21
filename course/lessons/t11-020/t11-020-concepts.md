
# hash maps and frequency tables — Core concepts and how they fit together

# Learning objectives
* Understand the conceptual role of a map as a key-value store.
* Explain the mechanics of hash functions, buckets, and collision resolution.
* Identify common algorithmic patterns (frequency maps, complement lookup) that leverage hash tables.
* Recognize the performance trade-offs between expected constant-time operations and worst-case scenarios.
* Understand the importance of the key equality contract and the dangers of mutable keys.

# Prerequisites
* Basic understanding of arrays (indexed storage).
* Familiarity with Big O notation (specifically constant time $O(1)$ and linear time $O(n)$).
* Understanding of basic equality concepts in programming.

# Core concepts
A **Map** is an abstract data structure that associates a key with a value and treats keys as unique according to the map's equality rule. Unlike an array, where you access data via an integer index, a map lets you look up values using keys from the key domain supported by that map. A hash-table implementation additionally needs a hash function consistent with key equality.

The **Hash table** is one common implementation of a map. It uses a **Hash function** to convert a key into an integer called a **Hash code**. The implementation then maps that code to a location or probe sequence in its storage; the hash code is not itself the bucket index. Because distinct keys can map to the same location, the structure must handle a **Collision**.

# Mechanisms and relationships
The efficiency of a hash table relies on the distribution of keys.
1. **Hash Function & Equality**: A hash function should distribute keys well for expected inputs. Equality comparison decides whether a candidate entry matches the requested key. Equal keys must have equal hash codes; unequal keys may still collide.
2. **Collision Resolution**: When keys map to the same location, a hash table must resolve the conflict. Textbook strategies include **separate chaining** (entries associated with a bucket, using some secondary organization) and **open addressing** (probing for another table slot), including **linear probing**, **quadratic probing**, and **double hashing**. These are alternative designs, not a description of every runtime dictionary implementation.
3. **Capacity & Rehashing**: Some table designs track load factor, the ratio of entries to buckets. Growth policies and thresholds vary by implementation. When storage grows, entries must be placed according to the new capacity; the exact growth factor is not universal.

# Worked examples
Consider counting the frequency of words in a list: `["apple", "banana", "apple"]`.

1. **Initialization**: Create an empty map.
2. **First "apple"**: Hash "apple" -> index 5. Bucket 5 is empty. Store `("apple", 1)`.
3. **"banana"**: Hash "banana" -> index 2. Bucket 2 is empty. Store `("banana", 1)`.
4. **Second "apple"**: Hash "apple" -> index 5. Bucket 5 contains `("apple", 1)`. Update value to 2.

This **Frequency map** pattern can turn repeated scanning into one pass of expected $O(n)$ map operations, assuming bounded-cost hashing and equality with suitable distribution. It uses additional space.

# Misconceptions and edge cases
* **Mutable-key hazard**: If equality-relevant key state changes after insertion, later lookup or removal may fail because the map searches according to the changed key while the entry was placed using its earlier hash. The entry is not necessarily permanently lost.
* **Worst-case linear lookup**: If many keys collide, a hash table may need work proportional to the number of stored keys. Exact behavior depends on its collision strategy and implementation.
* **Hash collision attack**: Attacker-controlled collisions can increase CPU work substantially in vulnerable designs. Do not assume every runtime degrades identically; risk depends on key types, mitigations, and exposure.

# Knowledge checks with answers
1. **Question**: Why is it dangerous to use a mutable object as a key in a hash map?
   * **Answer**: If the changed state participates in equality or hashing, lookup/removal may no longer locate the entry using the new hash. Keep key identity fields stable while stored.
2. **Question**: What is the difference between a Map and a Set?
   * **Answer**: A Map stores key-value pairs, while a Set stores only unique keys (or elements) without associated values.
3. **Question**: What happens during rehashing?
   * **Answer**: In designs that resize, the table allocates storage under its capacity policy and redistributes entries to locations appropriate for the new capacity. The growth factor is implementation-specific.

*Source: [OpenDSA hashing materials](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/HashIntro.html), [Microsoft Learn Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2), [USACO Guide](https://usaco.guide/bronze/intro-sets)*
