<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# strings and character sequences — Reference: Comparison and matching concepts

*Automatically generated draft.*

# Scope and version
This lesson covers fundamental string comparison and matching concepts within the context of .NET 11 and timeless algorithmic principles. It focuses on the definitions and mechanics of how strings are compared and how patterns are identified within sequences. All content is based on documentation checked as of 2026-11-14.

# How this group fits the mental model
String algorithms rely on defining what constitutes an "element" and how to determine equality or proximity between sequences. In C#, strings are immutable UTF-16 sequences. Because a single user-perceived character (grapheme cluster) may consist of multiple UTF-16 code units, the method of comparison significantly alters the result. These concepts provide the building blocks for searching, sorting, and validating text data efficiently.

# Supplied names explained

* `Ordinal comparison`: Compares strings according to their UTF-16 code-unit values, without linguistic tailoring. Use it for machine-oriented identifiers when that is the intended policy; path comparison must also follow the target platform's path rules.
* `Culture-sensitive comparison`: Compares strings using linguistic rules for a selected culture. Use it when language-aware sorting or matching is part of the user-facing requirement; results can differ between cultures.
* `Case-insensitive comparison`: A comparison policy that treats certain case variants as equivalent. It can be ordinal or culture-sensitive, and the choice affects its rules.
* `Normalization`: A Unicode transformation that maps text into a selected normalization form. It can make canonically equivalent sequences compare alike when the application's equality policy requires that; .NET string comparison does not automatically normalize every string.
* `Naive pattern matching`: A brute-force approach that checks for a pattern by sliding it across the text one position at a time. It has a worst-case time complexity of O(n*m).
* `Prefix function`: A core component of the Knuth-Morris-Pratt algorithm; it computes the length of the longest proper prefix of a substring that is also a suffix of that same substring.
* `Knuth-Morris-Pratt matching`: An efficient pattern-matching algorithm that uses the prefix function to skip unnecessary comparisons, achieving O(n+m) time complexity.
* `Z-function`: An algorithm that computes an array where each element `z[i]` is the length of the longest common prefix between the string and its suffix starting at `i`.
* `Rabin-Karp matching`: A pattern-matching algorithm that uses hashing to find a pattern in a text. It calculates the hash of the pattern and compares it against the rolling hashes of substrings in the text.
* `Polynomial rolling hash`: A hashing technique used in Rabin-Karp where the hash value is updated in constant time as the window slides across the text, reducing the cost of recomputing hashes.

# Cross-item comparison
* **Comparison Methods**: `Ordinal comparison` follows code-unit values and `Culture-sensitive comparison` follows language-specific collation rules. Apply `Normalization` only when the chosen text-equivalence policy requires it; it is not a prerequisite for every comparison.
* **Matching Algorithms**: `Naive pattern matching` is simple but inefficient. `Knuth-Morris-Pratt matching` and `Rabin-Karp matching` are optimized alternatives. `Knuth-Morris-Pratt matching` relies on the `Prefix function` to avoid re-scanning, while `Rabin-Karp matching` relies on `Polynomial rolling hash` to compare blocks of text via numeric signatures. The `Z-function` provides a different structural analysis of the string, useful for identifying repeated patterns.

# Examples
```csharp
// Ordinal comparison example
string a = "apple";
string b = "Apple";
bool isEqual = string.Equals(a, b, StringComparison.Ordinal); // false

// Naive pattern matching logic (conceptual)
// For text "ABABD", pattern "ABD"
// 1. Compare "ABA" vs "ABD" (Mismatch)
// 2. Shift 1: Compare "BAB" vs "ABD" (Mismatch)
// 3. Shift 2: Compare "ABD" vs "ABD" (Match)
```

# Common mistakes
* **Assuming automatic normalization**: Two canonically equivalent strings can have different code-unit sequences. Normalize only when the application's equality policy requires canonical equivalence; ordinal comparison otherwise keeps them distinct.
* **Culture Assumptions**: Using culture-sensitive comparisons for machine-generated keys, which can lead to unexpected behavior when the system locale changes.
* **Hash Collisions**: Relying on `Polynomial rolling hash` without handling potential collisions, which can lead to false positives in pattern matching.

# Knowledge checks with answers
1. **Question**: Which comparison method is most appropriate for internal system identifiers?
   **Answer**: `Ordinal comparison`, because it is culture-invariant and provides consistent, high-performance results.
2. **Question**: What is the primary difference between `Knuth-Morris-Pratt matching` and `Naive pattern matching`?
   **Answer**: `Knuth-Morris-Pratt matching` uses a `Prefix function` to skip redundant comparisons, resulting in O(n+m) complexity, whereas `Naive pattern matching` re-scans characters, resulting in O(n*m) complexity.
3. **Question**: When might `Normalization` be needed before comparing strings?
   **Answer**: When the application's equality policy treats canonically equivalent Unicode sequences as equal. Normalize using the chosen form as part of that policy; ordinary string comparison does not do this automatically.

*Sources*:
- [Microsoft Learn: Character encoding](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction)
- [Microsoft Learn: C# Strings](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/strings/)
- [CP-Algorithms: Prefix function](https://cp-algorithms.com/string/prefix-function.html)
- [CP-Algorithms: Z-function](https://cp-algorithms.com/string/z-function.html)
