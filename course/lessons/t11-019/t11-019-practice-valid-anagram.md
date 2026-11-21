<!-- MANUALLY AUTHORED: checked against frozen problem statement, examples, constraints, and source. -->

# strings and character sequences — Problem: Valid Anagram

# Goals

- Model an anagram as equality of character multisets rather than equality of sets.
- Count multiplicity differences with a fixed-size frequency table.
- Use a length check and early mismatch detection to avoid unnecessary work.
- Recognize why the lowercase-English constraint permits an array instead of a dictionary.

# Problem statement

Given two strings s and t, return true if t is an anagram of s, and false otherwise. An anagram uses every character the same number of times; order may differ.

# Input constraints

- 1 <= s.Length, t.Length <= 50,000
- s and t consist only of lowercase English letters a through z.
- C# string Length equals the number of these ASCII characters for this input.

# Examples with expected output

1. s = "anagram", t = "nagaram" → true.
2. s = "rat", t = "car" → false.
3. s = "aacc", t = "ccac" → false; equal sets are not enough because multiplicities differ.

# Clarifying assumptions

- Character order does not matter, but the count of each character must match exactly.
- The official constraint is lowercase English letters only. No case folding, punctuation removal, culture-specific comparison, Unicode normalization, or grapheme handling is requested.
- Strings are immutable in C#; this algorithm only reads them.

# Progressive hints

1. Anagrams must have equal lengths.
2. Count each letter in s and subtract each letter in t.
3. All 26 counts must return to zero exactly when the multisets match.
4. Because the alphabet is fixed, an int[26] table gives constant auxiliary space with respect to input length.

# Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static bool IsAnagram(string s, string t)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));
        if (t is null) throw new ArgumentNullException(nameof(t));
        if (s.Length != t.Length) return false;

        var counts = new int[26];
        for (int i = 0; i < s.Length; i++)
        {
            counts[s[i] - 'a']++;
            counts[t[i] - 'a']--;
        }

        for (int i = 0; i < counts.Length; i++)
            if (counts[i] != 0)
                return false;

        return true;
    }

    public static void Main()
    {
        if (!IsAnagram("anagram", "nagaram"))
            throw new InvalidOperationException("Example 1 failed.");
        if (IsAnagram("rat", "car"))
            throw new InvalidOperationException("Example 2 failed.");
        if (IsAnagram("aacc", "ccac"))
            throw new InvalidOperationException("Multiplicity case failed.");
        if (!IsAnagram("a", "a"))
            throw new InvalidOperationException("Single-character case failed.");
        Console.WriteLine("All Valid Anagram checks passed.");
    }
}
```

# Correctness argument

For each letter c, the table stores count(c in s) - count(c in t). The forward scan increments this difference for each occurrence in s and decrements it for each occurrence in t. The final table is all zero exactly when every letter has the same multiplicity in both strings, which is the definition of an anagram for this alphabet. The equal-length early return is valid because anagrams necessarily contain the same number of characters.

# Step-by-step dry run

For s = "anagram" and t = "nagaram":

1. Lengths are both 7, so continue.
2. For each index, increment the s letter’s bucket and decrement the t letter’s bucket.
3. Each occurrence count is balanced by the corresponding occurrence in the other string.
4. Every bucket is zero, so return true.

For s = "aacc" and t = "ccac", the final a and c buckets are nonzero: the strings contain different multiplicities, so return false.

# Time complexity

O(n + 26) = O(n): scan both strings together and check the fixed alphabet table.

# Space complexity

O(1) auxiliary space: the table always has 26 counters, regardless of input length.

# Alternatives and tradeoffs

- Sort both strings and compare: O(n log n) time and storage for sorted copies because C# strings are immutable; straightforward but slower.
- Use a dictionary of character counts: supports a larger or sparse alphabet, but adds hashing and more state.
- For this fixed lowercase alphabet, a 26-entry array is simpler and has predictable operations.
- To extend to arbitrary Unicode, define normalization and comparison semantics first, then count the chosen units (for example Rune scalar values or grapheme clusters) using an appropriate map; UTF-16 char counts alone may split surrogate pairs.

# Common mistakes and gotchas

- Checking only that both strings contain the same distinct letters ignores multiplicity.
- Forgetting the length check does not necessarily break the table method but wastes work and obscures an immediate impossibility.
- Do not subtract character codes without the lowercase-English constraint; characters outside a-z would index outside the array.
- Do not apply lowercasing or culture-sensitive comparisons unless the problem specification requires them.
- UTF-16 code units are not always Unicode scalar values or user-perceived characters. The fixed ASCII alphabet avoids that ambiguity here.

# Edge-case tests

- Equal one-character strings.
- Same letters in a different order.
- Equal distinct-letter sets but different counts.
- Unequal lengths.
- Repeated occurrences concentrated in one letter.

# Reflection questions

1. Why does a frequency table distinguish anagrams from strings with merely equal character sets?
2. Why is a 26-element array valid only under the lowercase English constraint?
3. How would you adapt the algorithm if case were ignored?
4. What must be specified before supporting arbitrary Unicode text?

Sources: [LeetCode: Valid Anagram](https://leetcode.com/problems/valid-anagram/).
