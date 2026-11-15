<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# hash maps and frequency tables — Reference: Cost and correctness behavior

*Automatically generated draft.*

# Scope and version
This lesson covers the fundamental performance characteristics and correctness requirements of hash-based data structures. The concepts are timeless, with specific references to .NET 11 API behaviors as of 2026-11-14.

# How this group fits the mental model
A hash map functions by using a hash function to convert a key into an index. Because multiple keys might map to the same index (a collision), the structure must maintain a "contract" for how it compares keys. The items in this group define the trade-offs between speed (efficiency) and reliability (correctness). When you use a hash map, you are betting that your keys are distributed well enough to achieve fast lookups, while ensuring your keys remain stable so the map doesn't "lose" your data.

# Supplied names explained

* `Expected constant-time lookup`: The performance goal under assumptions such as a well-distributed hash function and a controlled load factor. Hashing selects a bucket, but equality checks and collisions still contribute work; this is an expected bound, not a per-operation guarantee.
* `Worst-case linear lookup`: The performance failure mode. If many keys collide (map to the same bucket) or the hash table becomes overloaded, the structure may be forced to scan through a long list of items, resulting in $O(n)$ time complexity.
* `Amortized insertion`: The analysis that spreads occasional resize and rehash work over a sequence of insertions. With suitable growth and hash-distribution assumptions, the resize contribution is amortized constant per insertion; collisions or expensive user hash/equality code add their own costs.
* `Key equality contract`: The requirement that if two keys are considered equal, they must return the same hash code. If this contract is broken, the map cannot reliably find or retrieve the values associated with those keys.
* `Mutable-key hazard`: A correctness bug where equality-relevant key state changes after insertion. The stored entry remains in the location chosen using its earlier hash, so a later lookup can fail or the collection's behavior can otherwise violate its key assumptions.
* `Hash collision attack`: A security vulnerability where an attacker provides specifically crafted keys that all result in the same hash code. This forces the map into `Worst-case linear lookup` behavior, potentially causing a Denial of Service (DoS) by exhausting CPU resources.

# Cross-item comparison

* **Performance vs. Security**: `Expected constant-time lookup` is the standard performance goal, but `Hash collision attack` exploits the mechanism that makes that speed possible to force `Worst-case linear lookup`.
* **Correctness vs. Stability**: `Key equality contract` is a logical requirement for the map to function, while `Mutable-key hazard` is a runtime error caused by violating the stability of the keys stored within the map.
* **Efficiency**: `Amortized insertion` explains how the map maintains its speed over time, even when it must occasionally perform the heavy work of resizing.

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
