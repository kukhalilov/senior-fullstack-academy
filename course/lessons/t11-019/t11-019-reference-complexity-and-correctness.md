
# strings and character sequences — Reference: String algorithm risks and costs

# Scope and version
This lesson covers the performance and correctness risks associated with string algorithms in C#. It is based on current .NET string and Unicode documentation checked on 2026-11-17. It focuses on algorithmic costs and logical pitfalls rather than a version-specific API catalog.

# How this group fits the mental model
In C#, strings are immutable sequences of UTF-16 code units. Because they cannot be changed once created, many common operations—like building a string through repeated concatenation or slicing—incur hidden memory and performance costs. Furthermore, because strings are sequences of code units rather than "user-perceived characters," algorithms must account for Unicode complexity to remain correct. This group of items identifies the "danger zones" where naive implementations often fail in terms of efficiency or logical correctness.

# Supplied names explained

* `String immutability`: The property that a `string` object cannot be modified after creation. Any "change" to a string actually creates a new string object in memory, leaving the original unchanged.
* `Repeated concatenation cost`: The performance penalty incurred when repeatedly appending similarly sized pieces in a loop. Because strings are immutable, each result contains the accumulated text; building a length-$n$ string this way can copy a total of $O(n^2)$ characters. Other piece sizes have costs based on the sum of intermediate result lengths.
* `Substring allocation`: `Substring` returns a string value for the requested range rather than modifying the source. A nontrivial extracted range generally requires result storage; avoid repeated slicing in hot loops when a span or index range can serve the need.
* `Hash collision`: A scenario where two different strings produce the same hash value. A single fixed hash is not an exact equality proof. Directly verify matching windows for exact results; randomized/double hashing can reduce collision probability but remains probabilistic without verification.
* `Empty pattern`: A common edge case in string searching algorithms. An empty pattern is technically present at every position in a string; failing to handle this explicitly can lead to infinite loops or off-by-one errors.
* `Repeated characters`: A structural property of strings that can degrade the performance of naive pattern-matching algorithms to $O(n \times m)$. Advanced algorithms (like KMP) use this property to skip unnecessary comparisons.
* `Unicode-aware iteration`: The practice of choosing an iteration unit deliberately: UTF-16 code units, `Rune` scalar values, or `StringInfo` text elements for grapheme-aware processing. A `Rune` avoids splitting a valid surrogate pair, but combining sequences can still contain multiple scalars.

# Cross-item comparison

The items in this group represent two distinct categories of string algorithm challenges:

1.  **Performance/Memory Costs**: `String immutability`, `Repeated concatenation cost`, and `Substring allocation` are related to the overhead of managing memory for immutable objects.
2.  **Correctness/Logic Risks**: `Hash collision`, `Empty pattern`, `Repeated characters`, and `Unicode-aware iteration` are related to the logical validity of the algorithm's output.

While performance items focus on the *cost* of the data structure, correctness items focus on the *interpretation* of the data sequence.

# Examples

**Performance Trap (Repeated Concatenation):**
```csharp
// Inefficient: Creates a new string object in every iteration
string result = "";
for (int i = 0; i < 1000; i++) {
    result += "a"; 
}
```
*Result:* This performs $O(n^2)$ work. For high-performance scenarios, use `System.Text.StringBuilder`.

**Correctness Trap (Unicode-aware iteration):**
```csharp
string text = "a\u0301"; // 'a' + combining acute accent
// Iterating by index treats this as two units (Length 2)
// Rune iteration sees two scalar values; StringInfo text-element
// enumeration treats the sequence as one grapheme text element.
```
*Result:* `Length` is 2 UTF-16 code units here. There are also two Unicode scalar values, but one grapheme text element; the count depends on the unit the algorithm needs.

# Common mistakes

* **Ignoring Immutability:** Assuming that string operations are "in-place" and therefore memory-efficient.
* **Assuming 1 Code Unit = 1 Character:** Writing algorithms that index into strings without considering that a single user-perceived character may consist of multiple UTF-16 code units.
* **Neglecting Edge Cases:** Forgetting to test the `Empty pattern` case, which often causes index-out-of-range exceptions or infinite loops in search logic.
* **Over-relying on Hashes:** Using a hash for string equality without a fallback check, which ignores the risk of `Hash collision`.

# Knowledge checks with answers

1. **Why can `Repeated concatenation cost` occur in C#?**
   *Answer:* Strings are immutable, so each step that grows a result may create a new string and copy the accumulated prefix. For repeated equal-size appends, total copied content grows quadratically; a builder or suitable buffer avoids repeatedly copying the entire prefix.

2. **What is the primary risk of using a simple hash for string matching?**
   *Answer:* `Hash collision`. Two different strings might produce the same hash, leading the algorithm to report a match where none exists unless a secondary content check is performed.

3. **Why is `Unicode-aware iteration` necessary?**
   *Answer:* Because C# strings are sequences of UTF-16 code units. Many characters (like emojis or accented letters) are represented by multiple code units; iterating by code unit splits these characters, leading to incorrect logical processing.

*Source: [Microsoft Learn .NET character encoding](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction)*
