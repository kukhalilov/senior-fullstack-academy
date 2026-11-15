# backtracking, subsets, permutations, and combinations — Problem: Palindrome Partitioning

## Goals
- Enumerate every partition whose pieces are palindromes.
- Separate the decision to end one piece from the recursive processing of the suffix.
- Compare on-demand palindrome checks with precomputed range checks.
- Include output construction in the complexity analysis.

## Problem statement
Given a lowercase string, return all ways to split it into nonempty substrings such that every substring is a palindrome.

## Input constraints

The string length is between 1 and 16.

## Examples with expected output
Input: "aab"
Expected output: [["a","a","b"],["aa","b"]]

Input: "a"
Expected output: [["a"]]

## Clarifying assumptions
- A partition preserves the input order and covers every character exactly once.
- Pieces must be nonempty.
- Result ordering is irrelevant.

## Progressive hints
1. Track the next unprocessed start index.
2. Try every possible end index and continue only if that substring is a palindrome.
3. After choosing [start,end], recurse from end+1.
4. Precompute palindrome[start,end] so each candidate check is constant time.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<string>> Partition(string text)
    {
        int n = text.Length;
        var palindrome = new bool[n, n];
        for (int left = n - 1; left >= 0; left--)
        {
            for (int right = left; right < n; right++)
            {
                palindrome[left, right] =
                    text[left] == text[right] &&
                    (right - left < 2 || palindrome[left + 1, right - 1]);
            }
        }

        var result = new List<IList<string>>();
        var path = new List<string>();

        void Search(int start)
        {
            if (start == n)
            {
                result.Add(new List<string>(path));
                return;
            }

            for (int end = start; end < n; end++)
            {
                if (!palindrome[start, end]) continue;
                path.Add(text.Substring(start, end - start + 1));
                Search(end + 1);
                path.RemoveAt(path.Count - 1);
            }
        }

        Search(0);
        return result;
    }

    static string Key(IEnumerable<string> pieces) => string.Join("|", pieces);

    static void Main()
    {
        var actual = Partition("aab").Select(Key).ToHashSet();
        if (!actual.SetEquals(new[] { "a|a|b", "aa|b" })) throw new Exception("aab partitions mismatch.");
        if (!Partition("a").Select(Key).ToHashSet().SetEquals(new[] { "a" })) throw new Exception("Single-character mismatch.");
        var allSame = Partition("aaa").Select(Key).ToHashSet();
        if (allSame.Count != 4) throw new Exception("aaa has four palindrome partitions.");
        Console.WriteLine("Palindrome partition checks passed.");
    }
}
```

## Correctness argument
The table is filled with left endpoints descending, so the inner interval [left+1,right-1] is already known. A substring is a palindrome exactly when its endpoint characters match and its interior is empty/single-character or already known to be palindromic. During search, every chosen piece is checked against this table, pieces are contiguous and nonempty, and the next call starts immediately after the chosen end. Reaching n means the path covers the whole string. Trying every end index explores every valid first piece and then every valid suffix partition, so every valid partition appears once.

## Step-by-step dry run
For "aab", from index 0, valid first pieces are "a" and "aa". Choosing "a" leaves "ab": only "a" then "b" can complete, producing ["a","a","b"]. Choosing "aa" leaves "b", producing ["aa","b"]. The substring "aab" is not a palindrome and is never selected.

## Time complexity
The table takes O(n²) time and space. The number of partitions can be exponential (at most 2^(n-1), corresponding to cuts between characters). Each result contains up to n substrings whose copied character lengths total n, so emitting all results takes O(n·2^n) in the worst case. Search overhead is bounded by explored cut patterns.

## Space complexity
The palindrome table uses O(n²). The current path and recursion use O(n), excluding output. The output stores up to O(n·2^n) characters across copied substrings.

## Alternatives and tradeoffs
- Check each candidate substring with two pointers during DFS: simpler preprocessing, but palindrome checks can cost O(n) each and increase total search work.
- Expand around centers and store palindromic intervals: useful when enumerating palindrome substrings separately, but more bookkeeping than the dynamic-programming table here.
- Store index pairs in the path and create strings only for completed partitions to reduce temporary substring allocations.

## Common mistakes and gotchas
- Using an inclusive end with a recursive start of end rather than end+1 repeats a character or fails to advance.
- Accepting the empty substring creates invalid partitions.
- Filling the table with left increasing order can read an interior interval before it is computed.
- The empty string needs an explicit contract: this implementation returns one empty partition by reaching the base case immediately; the exercise's normal input constraint excludes it.
- Describing runtime only as O(n²) ignores the potentially exponential output.

## Edge-case tests
- One character has one partition.
- A string with all equal characters has 2^(n-1) partitions.
- A string with no multi-character palindrome still has the all-single-character partition.
- Empty defensive input returns one empty partition.

## Reflection questions
1. Why does the DP table fill left endpoints in descending order?
2. Which part of the algorithm causes exponential output?
3. How could the search be changed to return only the minimum number of palindrome pieces?

## Source
- [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/)
