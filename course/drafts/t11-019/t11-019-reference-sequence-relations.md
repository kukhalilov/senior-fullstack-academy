<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# strings and character sequences — Reference: String sequence relationships

*Automatically generated draft.*

# Scope and version
This lesson covers the fundamental definitions of string sequence relationships as used in algorithmic problem solving. The content is based on timeless algorithmic principles and .NET 11 string documentation, verified as of November 14, 2026.

# How this group fits the mental model
In string algorithms, we treat a string as an ordered sequence of elements. To solve problems efficiently, we must categorize how one string relates to another or how parts of a string relate to the whole. These relationships—such as whether one string is a "prefix" or a "subsequence" of another—determine which algorithmic strategy (e.g., linear scan, hashing, or dynamic programming) is appropriate for the task.

# Supplied names explained
* `Prefix`: A sequence of characters that appears at the very beginning of a string. For a string $S$ of length $n$, a prefix is any substring $S[0..i]$ where $0 \le i < n$.
* `Proper prefix`: Any prefix of a string that is not equal to the string itself. For a string of length $n$, this includes all prefixes of length $0$ to $n-1$.
* `Suffix`: A sequence of characters that appears at the very end of a string. For a string $S$ of length $n$, a suffix is any substring $S[i..n-1]$ where $0 \le i < n$.
* `Substring`: A contiguous sequence of characters within a string. If you "cut" a piece out of a string without changing the order or skipping characters, the result is a substring.
* `Subsequence`: A sequence derived from another string by deleting zero or more characters without changing the order of the remaining characters. Unlike a substring, the characters do not need to be contiguous.
* `Palindrome`: A string that reads the same forwards and backwards. It is defined by the relationship $S[i] == S[n-1-i]$ for all valid indices $i$.
* `Anagram`: A string formed by rearranging the letters of another string. Two strings are anagrams if they contain the exact same characters with the exact same frequencies.
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
* **Case Sensitivity**: When calculating `Character frequency` or checking for `Anagram` status, remember that 'A' and 'a' are distinct UTF-16 code units. Unless specified, assume these relationships are case-sensitive.

# Knowledge checks with answers
1. **Question**: Is "ace" a substring of "abcde"?
   **Answer**: No. While "ace" is a subsequence (the characters appear in order), it is not a substring because the characters are not contiguous in the original string.

2. **Question**: If a string has length $n$, how many proper prefixes does it have?
   **Answer**: It has $n$ proper prefixes (including the empty string).

3. **Question**: Can a string be an anagram of itself?
   **Answer**: Yes. By definition, a string contains the same character frequencies as itself.

*Source: [Microsoft Learn .NET character encoding](https://learn.microsoft.com/en-us/dotnet/standard/base-types/character-encoding-introduction)*
