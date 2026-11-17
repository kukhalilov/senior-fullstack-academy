<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Reference: Cost and correctness behavior

*Automatically generated draft.*

# Scope and version
This lesson covers the fundamental performance characteristics and correctness requirements of hash-based data structures. The concepts are timeless; current .NET `Dictionary<TKey,TValue>` and `Object.GetHashCode` documentation was checked 2026-11-17. Hash-table collision mitigations and details vary by implementation.

# How this group fits the mental model
A hash map computes a hash code from a key and maps that code to its storage according to the implementation. Because distinct keys may map to the same location, the structure must compare keys under a consistent equality rule. The items in this group define the trade-offs between expected speed and correctness. Keys should remain stable under equality and hashing while stored so lookups continue to follow the collection's assumptions.

# Supplied names explained

* `Expected constant-time lookup`: The performance goal under assumptions such as a well-distributed hash function and a controlled load factor. Hashing selects a bucket, but equality checks and collisions still contribute work; this is an expected bound, not a per-operation guarantee.
* `Worst-case linear lookup`: The performance failure mode. If many keys collide (map to the same bucket) or the hash table becomes overloaded, the structure may be forced to scan through a long list of items, resulting in $O(n)$ time complexity.
* `Amortized insertion`: The analysis that spreads occasional resize and rehash work over a sequence of insertions. With suitable growth and hash-distribution assumptions, the resize contribution is amortized constant per insertion; collisions or expensive user hash/equality code add their own costs.
* `Key equality contract`: The requirement that if two keys are considered equal under the map's comparer, they must produce the same hash code under that comparer. Unequal keys may have the same hash code; equality is still needed to distinguish them.
* `Mutable-key hazard`: A correctness bug where equality-relevant key state changes after insertion. The stored entry remains in the location chosen using its earlier hash, so a later lookup can fail or the collection's behavior can otherwise violate its key assumptions.
* `Hash collision attack`: A potential denial-of-service technique in which attacker-controlled inputs cause excessive collisions and CPU work in a vulnerable hash-table design. Impact and available mitigations are implementation- and key-type-dependent; do not infer that every map necessarily degrades in the same way.

# Cross-item comparison

* **Performance vs. Security**: `Expected constant-time lookup` is a performance model under assumptions. A `Hash collision attack` attempts to violate those assumptions, but actual impact depends on the runtime, comparer, and input path.
* **Correctness vs. Stability**: `Key equality contract` is a logical requirement for the map to function, while `Mutable-key hazard` is a runtime error caused by violating the stability of the keys stored within the map.
* **Efficiency**: `Amortized insertion` accounts for occasional resizing across a sequence of operations under the growth and hashing assumptions of the chosen design.

# Examples

```csharp
using System;
using System.Collections.Generic;

public static class Program
{
    public static void Main()
    {
        var map = new Dictionary<MutablePoint, string>();
        var point = new MutablePoint { X = 1, Y = 1 };
        map[point] = "Origin";
        point.X = 5; // The key's equality-relevant state changed after insertion.
        bool found = map.TryGetValue(point, out string? value); // May fail: lookup hashes the mutated key.
        Console.WriteLine($"Found after mutation: {found}");
    }
}

// A reference-type key whose equality and hash code depend on mutable state.
public sealed class MutablePoint : IEquatable<MutablePoint>
{
    public int X { get; set; }
    public int Y { get; set; }
    public bool Equals(MutablePoint? other) => other is not null && X == other.X && Y == other.Y;
    public override bool Equals(object? obj) => obj is MutablePoint other && Equals(other);
    public override int GetHashCode() => HashCode.Combine(X, Y);
}
```

# Common mistakes

1. **Using mutable objects as keys**: Changing equality-relevant state after insertion can make lookup fail because the collection stored the key using its earlier hash. Use immutable keys or remove and reinsert after a change.
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
