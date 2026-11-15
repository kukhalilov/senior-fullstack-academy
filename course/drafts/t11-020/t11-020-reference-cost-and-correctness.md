<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Reference: Cost and correctness behavior

*Automatically generated draft.*

# Scope and version
This lesson covers the fundamental performance characteristics and correctness requirements of hash-based data structures. The concepts are timeless, with specific references to .NET 11 API behaviors as of 2026-11-14.

# How this group fits the mental model
A hash map functions by using a hash function to convert a key into an index. Because multiple keys might map to the same index (a collision), the structure must maintain a "contract" for how it compares keys. The items in this group define the trade-offs between speed (efficiency) and reliability (correctness). When you use a hash map, you are betting that your keys are distributed well enough to achieve fast lookups, while ensuring your keys remain stable so the map doesn't "lose" your data.

# Supplied names explained

* `Expected constant-time lookup`: The performance goal of a hash map. On average, finding an item takes the same amount of time regardless of how many items are in the map, because the hash function jumps directly to the relevant bucket.
* `Worst-case linear lookup`: The performance failure mode. If many keys collide (map to the same bucket) or the hash table becomes overloaded, the structure may be forced to scan through a long list of items, resulting in $O(n)$ time complexity.
* `Amortized insertion`: The strategy of spreading the cost of expensive operations (like resizing the internal array and rehashing all keys) over many cheap insertions. While one specific insertion might be slow, the average cost over time remains low.
* `Key equality contract`: The requirement that if two keys are considered equal, they must return the same hash code. If this contract is broken, the map cannot reliably find or retrieve the values associated with those keys.
* `Mutable-key hazard`: A critical bug where a key's value is changed after it has been inserted into the map. Because the hash code of the key changes, the map can no longer find the entry at its original location, effectively "leaking" the data.
* `Hash collision attack`: A security vulnerability where an attacker provides specifically crafted keys that all result in the same hash code. This forces the map into `Worst-case linear lookup` behavior, potentially causing a Denial of Service (DoS) by exhausting CPU resources.

# Cross-item comparison

* **Performance vs. Security**: `Expected constant-time lookup` is the standard performance goal, but `Hash collision attack` exploits the mechanism that makes that speed possible to force `Worst-case linear lookup`.
* **Correctness vs. Stability**: `Key equality contract` is a logical requirement for the map to function, while `Mutable-key hazard` is a runtime error caused by violating the stability of the keys stored within the map.
* **Efficiency**: `Amortized insertion` explains how the map maintains its speed over time, even when it must occasionally perform the heavy work of resizing.

# Examples

```csharp
// Example of a Mutable-key hazard
var map = new Dictionary<Point, string>();
var p = new Point(1, 1);
map[p] = "Origin";

// Changing the key after insertion
p.X = 5; 

// This lookup will likely fail because the hash code of 'p' has changed
// and the map is looking in the wrong bucket.
bool found = map.TryGetValue(p, out string value);
```

# Common mistakes

1. **Using mutable objects as keys**: As shown above, changing a property of an object used as a key will make that entry unreachable.
2. **Ignoring the hash code**: Implementing a custom `Equals` method without overriding `GetHashCode` is a common violation of the `Key equality contract`.
3. **Assuming constant time**: In performance-critical systems, developers often forget that `Worst-case linear lookup` can occur if the hash function is poor or the table is too full.

# Knowledge checks with answers

1. **Question**: If I have a `Dictionary` and I change a property of a key object, why might I not be able to find the value again?
   * **Answer**: This is a `Mutable-key hazard`. The hash code of the object has changed, so the map is looking in the wrong bucket for the key.

2. **Question**: Is `Expected constant-time lookup` guaranteed for every single operation?
   * **Answer**: No. It is an average expectation. Under specific conditions, such as high collision rates or a `Hash collision attack`, performance can degrade to `Worst-case linear lookup`.

3. **Question**: What is the relationship between `Key equality contract` and `GetHashCode`?
   * **Answer**: The contract requires that if two objects are equal according to `Equals`, they must return the same value from `GetHashCode`.

*Source: [OpenDSA hashing materials](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/cs3/fall-2024/CS3_Public_F24/html/HashIntro.html), [Microsoft Learn Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2)*
