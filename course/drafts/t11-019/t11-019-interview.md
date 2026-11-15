<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# strings and character sequences — Interview questions and reasoning

# Core questions

*   **How do C# strings represent text internally, and why does `Length` not always equal the number of user-perceived characters?**
    C# strings are immutable sequences of UTF-16 code units (`char` values). The `Length` property and integer indexing operate strictly on these 16-bit code units. A user-perceived character (a grapheme cluster, such as an emoji with skin tone modifiers or a base letter with multiple combining diacritics) or a high-range Unicode scalar value outside the Basic Multilingual Plane requires a surrogate pair (two `char` units). Consequently, `Length` counts UTF-16 code units rather than glyphs or logical code points.

*   **What is the difference between an ordinal comparison and a culture-sensitive comparison?**
    An ordinal comparison evaluates strings byte-for-byte or code-unit-by-code-unit using numeric values. It is fast, deterministic, and ideal for programmatic identifiers, paths, and internal keys. A culture-sensitive comparison follows linguistic rules for a specific human language (such as Turkish dotless/dotted 'I' sorting or German umlaut handling), which can make identical byte sequences compare as equal or affect sorting orders based on local rules.

*   **When should you choose Knuth-Morris-Pratt (KMP) over naive pattern matching, and what does the prefix function compute?**
    Naive pattern matching compares a pattern against every possible text alignment and can degrade to $O(N \times M)$ time when many partial matches mismatch late in the pattern. Knuth-Morris-Pratt guarantees $O(N + M)$ time complexity by preprocessing the pattern into a prefix function (often called the $\pi$ table or `pi` array). The prefix function stores the length of the longest proper prefix of the pattern that is also a suffix of the current prefix, allowing the algorithm to shift the pattern intelligently without re-scanning characters in the text that are already matched.

*   **How does a polynomial rolling hash work in Rabin-Karp matching, and what is its primary failure mode?**
    A polynomial rolling hash treats a string window as a polynomial over a base $B$ modulo a large prime $M$, allowing the hash of the next window to be computed in $O(1)$ time by subtracting the old high-order term, multiplying by the base, and adding the new low-order term. Its primary failure mode is a hash collision—where two distinct text substrings produce the same hash value—which can lead to false positives unless verified by a character-by-character check or mitigated with double hashing.

# Concise interview answers

*   **Explain C# string immutability in one sentence.**
    C# strings are immutable because their character buffer cannot be modified after creation, meaning any modification operation (such as concatenation or replacement) allocates a new string object in memory.

*   **What is the distinction between a Substring and a Subsequence?**
    A Substring consists of contiguous elements from the original sequence, whereas a Subsequence can omit elements as long as the relative order of the remaining elements is preserved.

*   **Why is repeated string concatenation in a loop discouraged?**
    Because strings are immutable, each concatenation allocates a new intermediate string and copies all previous characters, turning an $O(N)$ operation into $O(N^2)$ quadratic time complexity (which can be avoided by using `System.Text.StringBuilder`).

*   **What does the Z-function compute for a string?**
    The Z-function computes an array where each entry $Z[i]$ represents the length of the longest common prefix between the string itself and the suffix of the string starting at index $i$.

# Deep follow-up answers

*   **Interviewer:** *"If `Length` counts UTF-16 code units, how do you safely iterate over characters without splitting surrogate pairs or grapheme clusters?"*
    **Candidate:** To iterate safely over Unicode scalar values, you inspect the code units to detect surrogate pairs and decode them using a type like `System.Text.Rune`. For full user-perceived characters (grapheme clusters), you rely on higher-level text element iteration (such as `StringInfo text element` processing) because combining marks and extended graphemes span multiple code points. Stopping blindly at an arbitrary `char` index risks slicing a surrogate pair in half, resulting in invalid replacement characters or corrupted text.

*   **Interviewer:** *"How does the KMP prefix function avoid redundant comparisons during a mismatch?"*
    **Candidate:** When a mismatch occurs after $k$ successful matches, the prefix function tells us the length of the longest prefix of the pattern that is also a suffix of those $k$ matched characters. Instead of resetting our text pointer back to the beginning of the match or shifting by just one position, we shift the pattern so that the known matching prefix aligns immediately with the current text position. This guarantees that no character in the text is scanned more than twice across the entire search, bounding the search time to $O(N + M)$.

*   **Interviewer:** *"What are the safety and performance trade-offs of Rabin-Karp compared to exact string comparison?"*
    **Candidate:** Rabin-Karp offers an average and best-case search time of $O(N + M)$ by reducing equality checks on long windows down to integer arithmetic via a polynomial rolling hash. However, its worst-case time is $O(N \times M)$ if malicious inputs trigger frequent hash collisions that force full character-by-character verifications. Furthermore, choosing a weak modulus or a small base increases collision probabilities, requiring careful prime selection or double hashing to maintain cryptographic or algorithmic robustness.

# Scenario questions

*   **Scenario 1:** *You are building a high-throughput log parsing pipeline in C# that extracts fixed-format transaction IDs from gigabytes of UTF-16 text. You notice excessive memory allocations in the profiler.*
    *   **Recommended approach:** Avoid creating intermediate `Substring` allocations or calling culture-sensitive methods in tight loops. Use span-based slicing (`ReadOnlySpan<char>`) or ordinal scanning methods (`AsSpan()`, `IndexOf`) to inspect memory in-place without heap allocations. Ensure that comparisons use `Ordinal` or `OrdinalIgnoreCase` to bypass heavy culture tables.

*   **Scenario 2:** *An interview question asks you to find all occurrences of a pattern in a text where both strings can be up to $1,000,000$ characters long, and naive matching times out.*
    *   **Recommended approach:** Recognize that an $O(N \times M)$ naive scan is unviable for large inputs. Propose a linear-time algorithm such as Knuth-Morris-Pratt (using a `Prefix function`) or a Z-function-based matcher, which guarantees $O(N + M)$ time complexity. Alternatively, if average-case speed with low implementation overhead is preferred and collision risks are managed, Rabin-Karp (`Polynomial rolling hash`) can be discussed, provided you mention verification on hash hits.

# Tradeoffs and alternatives

*   **Ordinal comparison vs. Culture-sensitive comparison:**
    *   *Ordinal comparison* is fast, stable across machines, and immune to locale differences, but it will fail human-language sorting expectations (e.g., treating uppercase and lowercase differently or ignoring linguistic collation rules).
    *   *Culture-sensitive comparison* respects local language rules and linguistic sort orders, but it carries higher CPU overhead and can produce different results depending on the host operating system or runtime patch level.

*   **Naive pattern matching vs. Knuth-Morris-Pratt:**
    *   *Naive pattern matching* is trivial to implement and has zero memory overhead beyond the pointers, but its worst-case performance is $O(N \times M)$.
    *   *Knuth-Morris-Pratt* guarantees $O(N + M)$ worst-case time, but it requires extra memory for the `Prefix function` table and adds implementation complexity.

*   **Exact string comparison vs. Polynomial rolling hash:**
    *   *Exact string comparison* is free of false positives and collision vulnerabilities, but comparing long strings repeatedly can become expensive.
    *   *Polynomial rolling hash* allows $O(1)$ sliding window comparisons, but introduces hash collision risks and requires defensive design (such as safe primes or verification steps).

# Common weak answers

*   **Weak Answer:** *"A string’s `Length` in C# tells you exactly how many letters are in the string."*
    *   *Why it's weak:* It ignores UTF-16 encoding realities, surrogate pairs, and combining characters where a single user-perceived character occupies two `char` code units or multiple code points.
*   **Weak Answer:** *"String concatenation with `+` inside a loop is fine for small inputs, and the compiler fixes it anyway."*
    *   *Why it's weak:* It ignores the immutable nature of C# strings. While modern runtimes optimize certain static expressions, loops with dynamic concatenations create multiple intermediate garbage objects, leading to $O(N^2)$ scaling.
*   **Weak Answer:** *"Hash matching is always faster than string searching because numbers compare in one CPU cycle."*
    *   *Why it's weak:* It overlooks hash computation overhead, collision resolution costs, and the requirement for fallback verification checks.

# Self-check rubric

*   [ ] Can you explain why `Length` measures UTF-16 code units rather than glyphs or code points?
*   [ ] Do you know when to apply ordinal comparisons versus culture-sensitive comparisons?
*   [ ] Can you describe how the KMP prefix function prevents redundant text scans and achieves $O(N + M)$ time?
*   [ ] Can you state the primary failure mode of polynomial rolling hashes and how to address it?
*   [ ] Are you able to explain why string immutability makes repeated concatenation expensive without `StringBuilder` or span-based techniques?

*Source snapshot references:*
*   [Microsoft Learn: Character encoding introduction](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction)
*   [Microsoft Learn: C# fundamentals on strings](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/strings/)
*   [CP-Algorithms: Prefix function](https://cp-algorithms.com/string/prefix-function.html)
*   [CP-Algorithms: Z-function](https://cp-algorithms.com/string/z-function.html)
*   [CP-Algorithms: Rabin-Karp matching](https://cp-algorithms.com/string/rabin-karp.html)

Mark this as an automatically generated draft.
