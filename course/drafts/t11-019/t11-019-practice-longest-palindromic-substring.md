# strings and character sequences — Problem: Longest Palindromic Substring

## Goals
- Distinguish substring from subsequence.
- Expand around both odd- and even-length palindrome centers.
- Track the best inclusive range without copying every candidate.

## Problem statement
Given a string `s`, return its longest palindromic substring. If multiple answers have the maximum length, any one is valid.

## Input constraints
- `1 <= s.Length <= 1,000`.
- `s` contains only digits and English letters; case is significant.

## Examples with expected output
- `"babad" -> "bab"` or `"aba"`.
- `"cbbd" -> "bb"`.
- `"a" -> "a"`.
- `"ac" -> "a"` or `"c"`.

## Clarifying assumptions
- A substring is contiguous; characters cannot be skipped.
- Palindrome comparison uses exact character equality; no normalization or case folding is requested.
- Any maximum-length answer is accepted.

## Progressive hints
1. Every palindrome has a center, but the center can be a character or a gap between characters.
2. Expand outward while the two characters match.
3. For each center, record the resulting range and compare its length with the best seen.
4. There are `2n-1` possible centers: n character centers and n-1 gaps.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static string LongestPalindrome(string s)
    {
        int bestStart = 0, bestLength = 1;

        void Expand(int left, int right)
        {
            while (left >= 0 && right < s.Length && s[left] == s[right])
            {
                int length = right - left + 1;
                if (length > bestLength)
                {
                    bestStart = left;
                    bestLength = length;
                }
                left--;
                right++;
            }
        }

        for (int center = 0; center < s.Length; center++)
        {
            Expand(center, center);
            Expand(center, center + 1);
        }
        return s.Substring(bestStart, bestLength);
    }

    static void Check(string expectedOne, string? expectedTwo, string input)
    {
        string actual = LongestPalindrome(input);
        if (actual != expectedOne && actual != expectedTwo)
            throw new InvalidOperationException($"Unexpected palindrome '{actual}' for '{input}'.");
    }

    static void Main()
    {
        Check("bab", "aba", "babad");
        Check("bb", null, "cbbd");
        Check("a", null, "a");
        Check("a", "c", "ac");
        Check("aaaa", null, "aaaa");
        Check("geeksskeeg", null, "forgeeksskeegfor");
        Console.WriteLine("Longest Palindromic Substring checks passed.");
    }
}
```

## Correctness argument
Every nonempty palindrome has either one central character or two equal central characters. The loop examines both center forms at every position. For each center, `Expand` continues exactly while the current symmetric endpoints are in bounds and equal, so each visited interval is a palindrome. The first failed comparison prevents any larger palindrome with that same center. Every possible palindrome is therefore considered. The method records a range only when it is longer than the previous best, so the returned substring is a maximum-length palindrome.

## Step-by-step dry run
For `"cbbd"`, the even center between indices 1 and 2 compares `b` with `b`, recording start 1 and length 2. The next outward comparison is `c` with `d`, which fails. No other center produces a longer palindrome, so the method returns `"bb"`.

## Time complexity
O(n²) worst case: there are 2n-1 centers and a center may expand O(n) positions. For all-identical input, the total expansions form a quadratic sum.

## Space complexity
O(1) auxiliary algorithmic state, excluding the returned substring allocation. The returned string occupies O(L) space for answer length L.

## Alternatives and tradeoffs
- Dynamic programming stores whether each interval is a palindrome; O(n²) time and O(n²) space, useful for teaching interval recurrence or answering many interval queries.
- Manacher's algorithm finds a longest palindrome in O(n) time but has more complex radius and transformed-index bookkeeping.
- Expand-around-center is often the clearest interview solution at the given maximum length of 1,000.

## Common mistakes and gotchas
- Checking only odd centers and missing even-length answers such as `"bb"`.
- Calling a subsequence a substring; contiguity is required.
- Updating the best range before confirming equality.
- Using `>=` on ties when any answer is valid is okay, but can cause unnecessary replacement; `>` preserves the first encountered maximum.
- Claiming O(n) time for center expansion; repeated work can be quadratic.

## Edge-case tests
- Single character.
- No repeated adjacent characters.
- Even-length palindrome.
- Entire string is a palindrome.
- Several maximum answers of equal length.

## Reflection questions
1. Why does each palindrome have exactly one of the two center shapes?
2. Why is O(n²) acceptable under the stated bound?
3. Which state makes Manacher's algorithm linear?

## Source
- [Longest Palindromic Substring](https://leetcode.com/problems/longest-palindromic-substring/)
