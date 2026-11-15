# sequence and string dynamic programming — Problem: Palindromic Substrings

## Goals

Count palindrome occurrences by position using odd and even centers, and distinguish occurrences from distinct palindrome texts.

## Problem statement

Given `s`, return the number of substrings that are palindromes. Different positions count separately even when their text is equal. [Official problem statement](https://leetcode.com/problems/palindromic-substrings/)

## Input constraints

- `1 <= s.Length <= 1000`.
- `s` contains lowercase English letters.

## Examples with expected output

1. `"abc"` → `3`.
2. `"aaa"` → `6`.
3. `"abba"` → `6`.
4. `"a"` → `1`.

## Clarifying assumptions

Count positional occurrences, not unique substring values. Each single character is a palindrome.

## Progressive hints

1. A palindrome has a character center or a gap center.
2. Expand while endpoints match, adding one occurrence per successful expansion.
3. There are `2n-1` centers total.

## Complete C# solution

```csharp dsa-solution
using System;
static int CountSubstrings(string s)
{
    int count = 0;
    for (int center = 0; center < 2 * s.Length - 1; center++)
    {
        int left = center / 2, right = left + center % 2;
        while (left >= 0 && right < s.Length && s[left] == s[right]) { count++; left--; right++; }
    }
    return count;
}
static void Check(int x, int y, string label)
{
    if (x != y) throw new InvalidOperationException($"{label}: expected {y}, got {x}");
}
Check(CountSubstrings("abc"), 3, "example 1");
Check(CountSubstrings("aaa"), 6, "example 2");
Check(CountSubstrings("abba"), 6, "even center");
Check(CountSubstrings("a"), 1, "single character");
Check(CountSubstrings("ab"), 2, "unequal neighbors");
Console.WriteLine("All palindrome-count checks passed.");
```

## Correctness argument

Every palindrome has exactly one center, either a character or an adjacent-character gap. Expanding each of the `2n-1` centers enumerates each palindrome around it until the first mismatch or boundary. Each successful expansion is one positional occurrence and is counted once. No larger palindrome about that center can exist after failure, and every palindrome has a center, so all and only occurrences are counted.

## Step-by-step dry run

For `"aaa"`, odd centers contribute 1, 3, and 1 palindromes; the two gap centers contribute one each. Total: 6. Repeated text at different positions counts multiple times.

## Time complexity

`O(n²)` worst case.

## Space complexity

`O(1)` auxiliary space.

## Edge-case tests

Checks cover both official examples, an even palindrome, a singleton, and unequal adjacent characters.

## Reflection questions

1. Why are even centers necessary?
2. Why does `"aaa"` produce six occurrences but only three distinct palindrome texts?
3. What table would an interval-DP approach store?
