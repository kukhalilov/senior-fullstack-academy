<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# strings and character sequences — Interview questions and reasoning

# Core questions

*   **How do C# strings represent text internally, and why does `Length` not always equal the number of user-perceived characters?**
    C# strings are immutable sequences of UTF-16 code units (`char` values). The `Length` property and integer indexing operate strictly on these 16-bit code units. A user-perceived character (a grapheme cluster, such as an emoji with skin tone modifiers or a base letter with multiple combining diacritics) or a high-range Unicode scalar value outside the Basic Multilingual Plane requires a surrogate pair (two `char` units). Consequently, `Length` counts UTF-16 code units rather than glyphs or logical code points.

*   **What is the difference between an ordinal comparison and a culture-sensitive comparison?**
    An ordinal comparison evaluates UTF-16 code units numerically without linguistic tailoring. It is culture-insensitive and appropriate for exact programmatic identifiers when that is the required policy; file-path comparison must also follow the platform's path semantics. A culture-sensitive comparison follows linguistic rules for a selected culture and is commonly appropriate for user-facing sorting. Different sequences can compare as linguistically equivalent under some comparison options; normalization is a separate policy and is not automatic.

*   **When should you choose Knuth-Morris-Pratt (KMP) over naive pattern matching, and what does the prefix function compute?**
    Naive pattern matching compares a pattern against every possible text alignment and can degrade to $O(N \times M)$ time when many partial matches mismatch late in the pattern. Knuth-Morris-Pratt guarantees $O(N + M)$ time complexity by preprocessing the pattern into a prefix function (often called the $\pi$ table or `pi` array). The prefix function stores the length of the longest proper prefix of the pattern that is also a suffix of the current prefix, allowing the algorithm to shift the pattern intelligently without re-scanning characters in the text that are already matched.

*   **How does a polynomial rolling hash work in Rabin-Karp matching, and what is its primary failure mode?**
    A polynomial rolling hash treats a string window as a polynomial over a base $B$ modulo a large prime $M$, allowing the hash of the next window to be computed in $O(1)$ time by subtracting the old high-order term, multiplying by the base, and adding the new low-order term. Its primary failure mode is a hash collision—where two distinct text substrings produce the same hash value—which can lead to false positives unless verified by a character-by-character check or mitigated with double hashing.

# Concise interview answers

*   **Explain C# string immutability in one sentence.**
    C# strings are immutable; an operation that changes their contents returns a different string value rather than modifying the existing string. Repeatedly building a growing result can copy accumulated content many times, so use a suitable builder or buffer for such workloads.

*   **What is the distinction between a Substring and a Subsequence?**
    A Substring consists of contiguous elements from the original sequence, whereas a Subsequence can omit elements as long as the relative order of the remaining elements is preserved.

*   **Why is repeated string concatenation in a loop discouraged?**
    Repeatedly appending to a growing immutable string may copy the accumulated prefix each time, yielding quadratic total copying for equal-size appends; a `StringBuilder` or another suitable buffer avoids that repeated-prefix pattern.

*   **What does the Z-function compute for a string?**
    The Z-function computes an array where each entry $Z[i]$ represents the length of the longest common prefix between the string itself and the suffix of the string starting at index $i$.

# Deep follow-up answers

*   **Interviewer:** *"If `Length` counts UTF-16 code units, how do you safely iterate over characters without splitting surrogate pairs or grapheme clusters?"*
    **Candidate:** To iterate safely over Unicode scalar values, you inspect the code units to detect surrogate pairs and decode them using a type like `System.Text.Rune`. For full user-perceived characters (grapheme clusters), you rely on higher-level text element iteration (such as `StringInfo text element` processing) because combining marks and extended graphemes span multiple code points. Stopping blindly at an arbitrary `char` index risks slicing a surrogate pair in half, resulting in invalid replacement characters or corrupted text.

*   **Interviewer:** *"How does the KMP prefix function avoid redundant comparisons during a mismatch?"*
    **Candidate:** When a mismatch occurs after $k$ successful matches, the prefix function identifies the longest shorter prefix that is also a suffix of those matched characters. The algorithm falls back through these borders without rewinding the text index. The text scan and all fallback work are amortized linear, so preprocessing and search take $O(N + M)$ time.

*   **Interviewer:** *"What are the safety and performance trade-offs of Rabin-Karp compared to exact string comparison?"*
    **Candidate:** A rolling hash updates a window fingerprint in constant arithmetic work after initialization. With suitable randomized hash parameters, collision probability can be bounded; a fixed hash has no universal exactness guarantee. If every matching fingerprint is verified by direct comparison, the result is exact, but collision-heavy/adversarial cases can make verification O(NM). Double hashing lowers risk but is still probabilistic unless candidates are checked. These hashes are not cryptographic authentication.

# Scenario questions

*   **Scenario 1:** *You are building a high-throughput log parsing pipeline in C# that extracts fixed-format transaction IDs from gigabytes of UTF-16 text. You notice excessive memory allocations in the profiler.*
    *   **Recommended approach:** Avoid creating intermediate `Substring` allocations or calling culture-sensitive methods in tight loops. Use span-based slicing (`ReadOnlySpan<char>`) or ordinal scanning methods (`AsSpan()`, `IndexOf`) to inspect memory in-place without heap allocations. Ensure that comparisons use `Ordinal` or `OrdinalIgnoreCase` to bypass heavy culture tables.

*   **Scenario 2:** *An interview question asks you to find all occurrences of a pattern in a text where both strings can be up to $1,000,000$ characters long, and naive matching times out.*
    *   **Recommended approach:** Recognize that an $O(N \times M)$ naive scan is unviable for large inputs. Propose a linear-time algorithm such as Knuth-Morris-Pratt (using a `Prefix function`) or a Z-function-based matcher, which guarantees $O(N + M)$ time complexity. Alternatively, if average-case speed with low implementation overhead is preferred and collision risks are managed, Rabin-Karp (`Polynomial rolling hash`) can be discussed, provided you mention verification on hash hits.

# Tradeoffs and alternatives

*   **Ordinal comparison vs. Culture-sensitive comparison:**
    *   *Ordinal comparison* ignores linguistic collation and is unaffected by current culture, but it will not meet language-aware sorting expectations. Do not promise identical behavior across every platform/version for operations that depend on changing Unicode data.
    *   *Culture-sensitive comparison* applies linguistic rules and may vary with culture and globalization data. Choose it when product requirements call for language-aware behavior, and specify culture/casing options where they matter.

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
