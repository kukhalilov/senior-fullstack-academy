# sequence and string dynamic programming — Problem: Regular Expression Matching

## Goals

Implement full-string matching for the restricted dot/star grammar, distinguish regex repetition from wildcard matching, and initialize empty-text matches correctly.

## Problem statement

Given text `s` and pattern `p`, return whether the pattern matches the entire text. `.` matches any one character. `*` matches zero or more repetitions of the immediately preceding valid element. [Official problem statement](https://leetcode.com/problems/regular-expression-matching/)

## Input constraints

- `1 <= s.Length <= 20` and `1 <= p.Length <= 20`.
- `s` contains lowercase English letters.
- `p` contains lowercase English letters, `.` and `*` only.
- Every `*` has a preceding valid element; matching covers the entire string, not a substring.

## Examples with expected output

1. `s = "aa"`, `p = "a"` → `false`.
2. `s = "aa"`, `p = "a*"` → `true`.
3. `s = "ab"`, `p = ".*"` → `true`.
4. `s = "aab"`, `p = "c*a*b"` → `true` (`c*` and `a*` can be empty/repeated appropriately).
5. `s = "mississippi"`, `p = "mis*is*p*."` → `false`.

## Clarifying assumptions

This is a small regex-like grammar, not .NET regular expressions and not a full regex engine. There are no anchors or alternation because matching is already required to cover the entire text. `*` repeats only the previous element; it does not mean any arbitrary sequence. Inputs guarantee that each star is structurally valid.

## Progressive hints

1. Define `dp[i,j]` as whether text prefix length `i` matches pattern prefix length `j`.
2. A non-star pattern element consumes exactly one matching text character. For a star at `j-1`, inspect the preceding element at `j-2`.
3. For `x*`, either use zero copies (`dp[i,j-2]`) or, if the current text character matches `x`, consume one text character while keeping the pattern available (`dp[i-1,j]`).

## Complete C# solution

The table dimensions include empty prefixes. A leading pattern can match empty text only through pairs of the form `atom*`; the loop removes each such pair. The guarded `j >= 2` access is required because `*` has no standalone meaning. The problem's guarantee ensures a preceding atom exists whenever a star is encountered.

```csharp dsa-solution
using System;

static bool IsMatch(string s, string p)
{
    int m = s.Length, n = p.Length;
    bool[,] dp = new bool[m + 1, n + 1];
    dp[0, 0] = true;

    for (int j = 2; j <= n; j++)
        if (p[j - 1] == '*') dp[0, j] = dp[0, j - 2];

    for (int i = 1; i <= m; i++)
    {
        for (int j = 1; j <= n; j++)
        {
            if (p[j - 1] == '*')
            {
                bool precedingMatches = p[j - 2] == '.' || p[j - 2] == s[i - 1];
                dp[i, j] = dp[i, j - 2] ||
                           (precedingMatches && dp[i - 1, j]);
            }
            else if (p[j - 1] == '.' || p[j - 1] == s[i - 1])
            {
                dp[i, j] = dp[i - 1, j - 1];
            }
        }
    }
    return dp[m, n];
}

static void Check(bool actual, bool expected, string label)
{
    if (actual != expected)
        throw new InvalidOperationException($"Failed {label}: expected {expected}, got {actual}");
}

Check(IsMatch("aa", "a"), false, "official example 1");
Check(IsMatch("aa", "a*"), true, "official example 2");
Check(IsMatch("ab", ".*"), true, "official example 3");
Check(IsMatch("aab", "c*a*b"), true, "official example 4");
Check(IsMatch("mississippi", "mis*is*p*."), false, "official example 5");
Check(IsMatch("a", "."), true, "dot consumes exactly one");
Check(IsMatch("", "a*b*"), true, "empty text through zero repetitions");
Check(IsMatch("", "a"), false, "empty text cannot match required literal");
Console.WriteLine("All regular-expression matching checks passed.");
```

## Correctness argument

For each `(i,j)`, the table records exactly whether the first `i` text characters match the first `j` pattern characters. Empty/empty matches. Empty text can match a pattern prefix ending in `*` only by omitting that atom and star, giving the initialization from `(0,j-2)`. If the final pattern element is an ordinary literal or `.`, it must consume exactly the final text character and the preceding prefixes must match. If it is `*`, its preceding atom and star can consume zero characters, leaving pattern prefix `j-2`; or, if the atom matches the current text character, consume that text character and keep the pattern prefix unchanged so the atom can repeat. These cases are exhaustive under the grammar, so induction by prefix lengths establishes the table and its final answer.

## Step-by-step dry run

For `s="aa"`, `p="a*"`, empty text matches the pattern prefix `a*` by using zero copies. For the first `a`, the star transition can consume that character and stay at pattern prefix `a*`; for the second `a` it can do so again. Thus the full prefixes match. By contrast, the pattern `"a"` has no star transition and consumes exactly one text character, so it cannot match the full two-character string `"aa"`.

## Time complexity

`O(mn)` time for the `(m+1)(n+1)` states.

## Space complexity

`O(mn)` boolean storage. A rolling-row version can reduce value storage to `O(n)`, but the same-row `j-2` dependency and previous-row dependency require careful ordering; the full table is clearer for the small stated limits.

## Edge-case tests

The program checks all five official examples, dot's one-character behavior, empty text matched by zero repetitions, and empty text against a required literal. These cover zero and positive repetitions and full-string matching.

## Reflection questions

1. What does the `dp[i-1,j]` branch represent for `x*`?
2. Why is this not the usual wildcard-star recurrence?
3. How would allowing a malformed standalone `*` change input validation requirements?
