<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# strings and character sequences — Core concepts and how they fit together

# Learning objectives
* Understand the distinction between memory-level representations (UTF-16) and user-perceived characters.
* Identify the fundamental relationships between string sequences (prefixes, suffixes, substrings, and subsequences).
* Recognize the trade-offs between naive and optimized string matching algorithms.
* Learn to identify common pitfalls in string processing, such as immutability costs and Unicode-aware iteration.

# Prerequisites
* Basic familiarity with arrays and linear data structures.
* Understanding of Big O notation for time and space complexity.
* Knowledge of basic loop constructs and conditional logic in C#.

# Core concepts
String algorithms treat text as an ordered sequence of elements. In C#, a `string` is an immutable sequence of `UTF-16 code unit` values. Because strings are immutable, any modification creates a new string in memory, which can lead to performance issues if done repeatedly (e.g., inside a loop).

A critical distinction exists between how computers store text and how humans perceive it:
* `UTF-16 code unit`: The fundamental unit of storage in a C# `char`.
* `Unicode scalar value`: A value representing a character, which may require one or two `UTF-16 code unit` values (a `Surrogate pair`).
* `Grapheme cluster`: A user-perceived character (e.g., an 'e' with an accent mark) that may consist of multiple code points.

When comparing strings, you must choose between `Ordinal comparison` (comparing raw numeric values) and `Culture-sensitive comparison` (respecting linguistic rules).

# Mechanisms and relationships
String problems are often solved by identifying specific relationships within the sequence:
* **Prefix/Suffix**: A `Prefix` is a sequence starting at the beginning; a `Suffix` ends at the end. A `Proper prefix` is a prefix that is not the entire string.
* **Substring vs. Subsequence**: A `Substring` is a contiguous block of characters. A `Subsequence` is derived by deleting zero or more characters without changing the order of the remaining elements.
* **Matching Algorithms**:
    * `Naive pattern matching`: Compares the pattern at every possible position.
    * `Knuth-Morris-Pratt matching`: Uses a `Prefix function` to skip unnecessary comparisons by remembering information about previously matched characters.
    * `Z-function`: Computes the length of the longest common prefix between the string and its suffixes.
    * `Rabin-Karp matching`: Uses a `Polynomial rolling hash` to compare strings in constant time after an initial preprocessing step, though it carries a risk of `Hash collision`.

Source: [https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction)

# Worked examples
To find if a pattern exists in a text, we often use a sliding window approach.

**Example: Naive Matching**
```csharp
bool Contains(string text, string pattern) {
    if (string.IsNullOrEmpty(pattern)) return true;
    for (int i = 0; i <= text.Length - pattern.Length; i++) {
        int j = 0;
        while (j < pattern.Length && text[i + j] == pattern[j]) {
            j++;
        }
        if (j == pattern.Length) return true;
    }
    return false;
}
```
*Step-by-step*:
1. The loop iterates through the `text` until the remaining length is shorter than the `pattern`.
2. For each position `i`, it checks if the `Substring` starting at `i` matches the `pattern`.
3. If `j` reaches the length of the pattern, a match is found.

Source: [https://cp-algorithms.com/string/string-hashing.html](https://cp-algorithms.com/string/string-hashing.html)

# Misconceptions and edge cases
* **Indexing**: `string.Length` and indexers return the count of `UTF-16 code unit` values. If a string contains emojis or complex characters, the index will not point to the start of a `Grapheme cluster`. Use `System.Text.Rune` or `StringInfo text element` for correct iteration.
* **Immutability**: Avoid `string += "a"` in loops. This creates a new string object every iteration, resulting in $O(N^2)$ complexity. Use `StringBuilder` for modifications.
* **Hash Collisions**: When using `Polynomial rolling hash`, always verify matches with an `Exact string comparison` to handle potential collisions.

# Knowledge checks with answers
1. **Question**: Why is `string.Length` sometimes misleading?
   **Answer**: It counts `UTF-16 code unit` values, not user-perceived characters. A single `Grapheme cluster` might consist of multiple code units.

2. **Question**: What is the primary difference between a `Substring` and a `Subsequence`?
   **Answer**: A `Substring` must be contiguous (adjacent in memory), while a `Subsequence` maintains relative order but does not need to be contiguous.

3. **Question**: Why is `Knuth-Morris-Pratt matching` generally faster than `Naive pattern matching`?
   **Answer**: It uses a `Prefix function` to avoid re-scanning characters that have already been matched, reducing the number of unnecessary comparisons.

*This is an automatically generated draft.*
