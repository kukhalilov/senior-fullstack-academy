<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Core concepts and how they fit together

*Automatically generated draft.*

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
A **Map** is an abstract data structure that associates a unique **Key** with a **Value**. Unlike an array, where you access data via an integer index, a map allows you to use any object as an index, provided it can be hashed and compared for equality.

The **Hash table** is the most common implementation of a map. It uses a **Hash function** to convert a key into an integer called a **Hash code**. This code determines the index in a **Bucket array** where the value is stored. Because multiple keys might map to the same bucket, the structure must handle a **Collision**.

# Mechanisms and relationships
The efficiency of a hash table relies on the distribution of keys.
1. **Hash Function & Equality**: A good hash function distributes keys uniformly across the bucket array. **Equality comparison** is then used to verify if the key found in a bucket is the exact key requested.
2. **Collision Resolution**: When two keys result in the same hash code, the structure must resolve the conflict. **Separate chaining** stores multiple items in a linked list at one bucket, while **Open addressing** (using techniques like **Linear probing**, **Quadratic probing**, or **Double hashing**) searches for the next available slot in the array.
3. **Load Factor & Rehashing**: The **Load factor** measures how full the bucket array is. When it exceeds a threshold, the table performs **Rehashing**—creating a larger array and moving all existing items into it—to maintain performance.

# Worked examples
Consider counting the frequency of words in a list: `["apple", "banana", "apple"]`.

1. **Initialization**: Create an empty map.
2. **First "apple"**: Hash "apple" -> index 5. Bucket 5 is empty. Store `("apple", 1)`.
3. **"banana"**: Hash "banana" -> index 2. Bucket 2 is empty. Store `("banana", 1)`.
4. **Second "apple"**: Hash "apple" -> index 5. Bucket 5 contains `("apple", 1)`. Update value to 2.

This **Frequency map** pattern turns an $O(n^2)$ nested-loop search into an $O(n)$ single-pass operation.

# Misconceptions and edge cases
* **Mutable-key hazard**: If you use a mutable object as a key and change its value after insertion, its hash code changes. The map will be unable to find the key again because it will look in the wrong bucket.
* **Worst-case linear lookup**: If a hash function is poor (e.g., all keys return the same hash code), the map degrades into a linked list, turning **Expected constant-time lookup** into **Worst-case linear lookup**.
* **Hash collision attack**: Malicious actors can provide keys that intentionally collide to force a system into $O(n)$ performance, potentially causing a denial-of-service.

# Knowledge checks with answers
1. **Question**: Why is it dangerous to use a mutable object as a key in a hash map?
   * **Answer**: Because the object's hash code is calculated based on its state. If the state changes, the hash code changes, and the map will look in the wrong bucket, making the entry unreachable.
2. **Question**: What is the difference between a Map and a Set?
   * **Answer**: A Map stores key-value pairs, while a Set stores only unique keys (or elements) without associated values.
3. **Question**: What happens during rehashing?
   * **Answer**: The bucket array is resized (usually doubled), and all existing entries are re-inserted into the new array because their index positions change based on the new array size.

*Source: [OpenDSA hashing materials](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/HashIntro.html), [Microsoft Learn Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2), [USACO Guide](https://usaco.guide/bronze/intro-sets)*
