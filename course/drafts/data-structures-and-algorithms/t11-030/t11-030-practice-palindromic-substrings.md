# sequence and string dynamic programming — Problem: Palindromic Substrings

Source: [Palindromic Substrings](https://leetcode.com/problems/palindromic-substrings/).

## Goals

Count palindrome occurrences by position using odd/even center expansion and explain the quadratic worst case.

## Problem statement

Given a string `s`, count all palindromic substrings. If the same text occurs at different positions, count each occurrence separately.

## Input constraints

- `1 <= s.length <= 1000`.
- `s` consists of lowercase English letters.

## Examples with expected output

- `"abc"` → `3` (`a`, `b`, `c`).
- `"aaa"` → `6` (`a` at three positions, `aa` at two, and `aaa`).

## Clarifying assumptions

Count ranges, not distinct palindrome strings. Empty string is supported by the implementation as a generalized case and has zero occurrences.

## Progressive hints

1. Every palindrome has a center, either on one character or between two characters.
2. Expand both endpoints while they are in bounds and equal.
3. Count each successful expansion before moving outward.
4. Iterate both center forms for every possible center position.

## Complete C# solution

```csharp dsa-solution
using System;

static int CountSubstrings(string s)
{
    int count = 0;
    for (int center = 0; center < s.Length; center++)
    {
        count += Expand(s, center, center);
        count += Expand(s, center, center + 1);
    }
    return count;
}

static int Expand(string s, int left, int right)
{
    int count = 0;
    while (left >= 0 && right < s.Length && s[left] == s[right])
    {
        count++;
        left--;
        right++;
    }
    return count;
}

static void Check(int expected, int actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(3, CountSubstrings("abc"));
Check(6, CountSubstrings("aaa"));
Check(0, CountSubstrings(""));
Check(1, CountSubstrings("a"));
Check(6, CountSubstrings("abba"));
Check(9, CountSubstrings("ababa"));
```

## Correctness argument

Every nonempty palindrome has exactly one center: a character for odd length or the gap between adjacent characters for even length. Starting at each center, equality of the current endpoints is necessary and sufficient to extend the already-palindromic interior by one character on each side. The loop counts exactly one occurrence for each valid expanded range and stops at the first unequal or out-of-bounds pair. Every palindromic substring is reached from its unique center, so none is omitted or counted twice.

## Step-by-step dry run

For `"aaa"`, the three odd centers contribute 1, 1, and 1. The even center between the first and second characters expands twice (`"aa"`, `"aaa"` range centered there), and the even center between the second and third also expands once. Total: 6. The middle `"aaa"` is centered on the middle character, while each length-two substring has its own gap center.

## Time complexity

`O(n²)` worst case: each of `2n` centers can expand across a linear number of characters. The count fits a 32-bit signed integer for the given maximum length (`n(n+1)/2` is 500,500 at `n=1000`).

## Space complexity

`O(1)` auxiliary space.

## Edge-case tests

Assertions cover supplied samples, empty and one-character strings, an even-length palindrome, and overlapping odd palindromes. Overlap is intentional because each position range counts separately.

## Reflection questions

- Why are there `2n` candidate centers rather than only `n`?
- Why should the count be incremented for every successful expansion?
- How would you return the longest palindrome rather than count them?
