<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# strings and character sequences — Reference: String sequence relationships

*Automatically generated draft.*

# Scope and version
This lesson covers the fundamental definitions of string sequence relationships as used in algorithmic problem solving. The content is based on timeless algorithmic principles and current .NET string guidance, checked on November 17, 2026.

# How this group fits the mental model
In string algorithms, we treat a string as an ordered sequence of elements. To solve problems efficiently, we must categorize how one string relates to another or how parts of a string relate to the whole. These relationships—such as whether one string is a "prefix" or a "subsequence" of another—determine which algorithmic strategy (e.g., linear scan, hashing, or dynamic programming) is appropriate for the task.

# Supplied names explained
* `Prefix`: An initial segment of a string. For a sequence $S$ of length $n$, prefixes are $S[0..k)$ for $0 \le k \le n$, including the empty sequence and the whole string. In C#, state whether positions refer to UTF-16 code units, scalar values, or grapheme text elements.
* `Proper prefix`: A prefix that is not equal to the whole string; its length $k$ satisfies $0 \le k < n$.
* `Suffix`: A final segment of $S$, written $S[k..n)$ for $0 \le k \le n$, including the empty sequence and the whole string.
* `Substring`: A contiguous interval $S[i..j)$ with $0 \le i \le j \le n$. For strings, the sequence unit must be specified.
* `Subsequence`: A sequence derived by deleting zero or more elements without changing the order of the remaining elements. Unlike a substring, its elements need not be contiguous.
* `Palindrome`: A sequence that reads the same forwards and backwards under the chosen element and equality rules. For a sequence $S$ of length $n$, this requires $S[i] = S[n-1-i]$ for every $0 \le i < n$.
* `Anagram`: A sequence formed by rearranging another sequence's elements. Two inputs are anagrams only relative to a chosen element unit, equality rule, and any case or normalization policy.
* `Character frequency`: The count of occurrences of each distinct character within a string. This is the primary metric used to determine if two strings are anagrams.

# Cross-item comparison
The primary distinction in this group is between **contiguous** and **non-contiguous** relationships:
* `Substring` vs `Subsequence`: A substring must be contiguous (e.g., "cat" is a substring of "scatter"). A subsequence does not have to be contiguous (e.g., "sar" is a subsequence of "scatter" because the letters appear in that relative order, even though they are separated).
* `Prefix` and `Suffix` are specific types of `Substring`s that are anchored to the start or end of the sequence, respectively.
* `Anagram` and `Character frequency` are related because two strings are anagrams if and only if their `Character frequency` maps are identical.

# Examples
Consider the string $S = \text{"abc"}$:
* **Prefixes**: "", "a", "ab", "abc".
* **Proper prefixes**: "", "a", "ab".
* **Suffixes**: "", "c", "bc", "abc".
* **Substrings**: "", "a", "b", "c", "ab", "bc", "abc".
* **Subsequences**: "", "a", "b", "c", "ab", "ac", "bc", "abc".
* **Palindrome**: "aba" is a palindrome; "abc" is not.
* **Anagram**: "bca" is an anagram of "abc" because both have a `Character frequency` of {a:1, b:1, c:1}.

# Common mistakes
* **Confusing Substring and Subsequence**: Remember that "substring" implies a continuous slice. If you can skip characters, it is a "subsequence."
* **Ignoring the Empty String**: In many algorithms, the empty string is considered a valid prefix, suffix, and subsequence of any string. Failing to account for the empty case often leads to "off-by-one" errors.
* **Sequence and equality rules**: When calculating `Character frequency` or checking for `Anagram` status, state whether elements are UTF-16 code units, Unicode scalar values, or grapheme text elements, and whether comparison is case-sensitive or normalized. Under ordinal code-unit comparison, 'A' and 'a' are distinct.

# Knowledge checks with answers
1. **Question**: Is "ace" a substring of "abcde"?
   **Answer**: No. While "ace" is a subsequence (the characters appear in order), it is not a substring because the characters are not contiguous in the original string.

2. **Question**: If a string has length $n$, how many proper prefixes does it have?
   **Answer**: It has $n$ proper prefixes (including the empty string).

3. **Question**: Can a string be an anagram of itself?
   **Answer**: Yes. By definition, a string contains the same character frequencies as itself.

*Source: [Microsoft Learn .NET character encoding](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction)*
