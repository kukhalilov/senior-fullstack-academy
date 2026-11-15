# strings and character sequences — Problem: Implement Substring Search

## Goals
- State the contract for first occurrence and no-match behavior.
- Derive KMP's prefix function and mismatch fallback.
- Avoid restarting the text scan after a partial match.

## Problem statement
Given strings `haystack` and `needle`, return the index of the first occurrence of `needle` in `haystack`, or `-1` if it does not occur.

## Input constraints
- `1 <= haystack.Length, needle.Length <= 10,000`.
- Both strings contain only lowercase English letters.
- The official constraints exclude an empty needle; this implementation additionally returns 0 for an empty needle as a defensive conventional behavior.

## Examples with expected output
- `haystack = "sadbutsad", needle = "sad" -> 0`.
- `haystack = "leetcode", needle = "leeto" -> -1`.
- `haystack = "aaaaa", needle = "bba" -> -1`.
- `haystack = "ababcabcabababd", needle = "ababd" -> 10`.

## Clarifying assumptions
- Return the smallest starting index, measured in C# UTF-16 code units; the lowercase ASCII constraint makes each character one unit.
- A match is exact and case-sensitive.
- If a caller supplies an empty needle outside the official constraints, return index 0.

## Progressive hints
1. Naive matching tries every valid start, but repeated prefixes can make it O(nm).
2. For each needle prefix, record its longest proper prefix that is also a suffix.
3. After a mismatch, follow that prefix length rather than resetting the matched length to zero.
4. Once the whole needle matches, its start is `textIndex - needle.Length + 1`.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int[] BuildPrefixFunction(string pattern)
    {
        int[] prefix = new int[pattern.Length];
        for (int i = 1; i < pattern.Length; i++)
        {
            int matched = prefix[i - 1];
            while (matched > 0 && pattern[i] != pattern[matched])
                matched = prefix[matched - 1];
            if (pattern[i] == pattern[matched]) matched++;
            prefix[i] = matched;
        }
        return prefix;
    }

    static int StrStr(string haystack, string needle)
    {
        if (needle.Length == 0) return 0;
        int[] prefix = BuildPrefixFunction(needle);
        int matched = 0;
        for (int i = 0; i < haystack.Length; i++)
        {
            while (matched > 0 && haystack[i] != needle[matched])
                matched = prefix[matched - 1];
            if (haystack[i] == needle[matched]) matched++;
            if (matched == needle.Length)
                return i - needle.Length + 1;
        }
        return -1;
    }

    static void Check(int expected, string haystack, string needle)
    {
        int actual = StrStr(haystack, needle);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(0, "sadbutsad", "sad");
        Check(-1, "leetcode", "leeto");
        Check(-1, "aaaaa", "bba");
        Check(10, "ababcabcabababd", "ababd");
        Check(0, "aaaaa", "aaa");
        Check(-1, "short", "longer");
        Check(0, "anything", "");
        Console.WriteLine("KMP substring search checks passed.");
    }
}
```

## Correctness argument
Before reading `haystack[i]`, `matched` is the length of the longest needle prefix that equals a suffix of the already scanned text. On mismatch, every shorter viable overlap is a border of the matched prefix; `prefix[matched-1]` gives the longest such border. Repeated fallback considers these candidates in descending order without rescanning text characters. A successful comparison extends the matched prefix by one. When `matched` reaches the needle length, the current text suffix equals the whole needle, and the computed start is an occurrence. Since scanning is left to right, this is the first occurrence. If the scan ends without a full match, no occurrence exists.

## Step-by-step dry run
For needle `"ababd"`, the prefix function is `[0,0,1,2,0]`. While scanning `"ababcabcabababd"`, KMP first matches `abab`, then mismatches at `c`; it falls back from length 4 to length 2 and continues without rewinding the text index. The final `d` completes the needle at text index 14, giving start `14-5+1=10`.

## Time complexity
O(n+m) where n is haystack length and m is needle length. Prefix construction is O(m); the text index only advances, and matched-prefix fallbacks are amortized linear.

## Space complexity
O(m) for the prefix-function array.

## Alternatives and tradeoffs
- Naive matching uses O(1) auxiliary space and is easy to prove, but worst-case O(nm), for example repeated `a` characters with a late mismatch.
- .NET `string.IndexOf` is appropriate for ordinary application code, but does not practice implementing the matching algorithm.
- Rabin-Karp can use rolling hashes for expected fast matching, but a single hash can collide; exact verification or a collision-safe design is required.
- The Z-function can also solve pattern matching by computing prefix matches over a combined sequence, but needs safe separation or a generalized sequence representation.

## Common mistakes and gotchas
- Falling back to zero after mismatch and losing reusable overlap.
- Using `prefix[matched]` instead of `prefix[matched-1]` when `matched` is a prefix length.
- Forgetting to return the earliest start immediately after a full match.
- Indexing `needle[matched]` when matched already equals its length; this implementation returns before the next iteration.
- Claiming hashing-based matching is deterministic exact without handling collisions.
- Forgetting that empty-pattern behavior is outside this specific official input contract.

## Edge-case tests
- Match at index zero.
- No match after a long shared prefix.
- Overlapping occurrences.
- Pattern longer than text.
- Defensive empty pattern.

## Reflection questions
1. What does `prefix[i]` represent?
2. Why does KMP not need to move the text index backward?
3. How would a naive oracle help test KMP on random short strings?

## Source
- [Find the Index of the First Occurrence in a String](https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/)
- [Prefix function and Knuth-Morris-Pratt](https://cp-algorithms.com/string/prefix-function.html)
