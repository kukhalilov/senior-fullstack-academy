# sequence and string dynamic programming — Problem: Regular Expression Matching

Source: [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/).

## Goals

Implement full-string matching for a constrained pattern grammar, derive the zero-or-more star transition, and initialize patterns that match empty text.

## Problem statement

Given a string `s` and pattern `p`, return whether the pattern matches the entire string. The pattern supports `.` to match any one character and `*` to match zero or more repetitions of the preceding valid element.

## Input constraints

- `1 <= s.length, p.length <= 20`.
- `s` contains lowercase English letters.
- `p` contains lowercase English letters, `.` and `*`.
- Every `*` has a preceding valid element.

## Examples with expected output

- `s="aa"`, `p="a"` → `false`.
- `s="aa"`, `p="a*"` → `true`.
- `s="ab"`, `p=".*"` → `true`.
- `s="aab"`, `p="c*a*b"` → `true`.
- `s="mississippi"`, `p="mis*is*p*."` → `false`.

## Clarifying assumptions

The match must consume the whole input, not merely find a matching substring. This is the problem’s limited grammar, not a complete .NET regular-expression implementation. Empty text and empty pattern are handled as generalized cases.

## Progressive hints

1. Define `dp[i,j]` as whether the first `i` text characters match the first `j` pattern characters.
2. A normal character or dot consumes exactly one matching text character.
3. For `x*`, first consider zero repetitions by skipping both pattern characters.
4. If the star’s preceding element matches the current text character, it may consume that character and stay at the same pattern prefix.
5. Initialize empty text against repeated `x*` pairs.

## Complete C# solution

```csharp dsa-solution
using System;

static bool IsMatch(string text, string pattern)
{
    int m = text.Length, n = pattern.Length;
    bool[,] dp = new bool[m + 1, n + 1];
    dp[0, 0] = true;

    for (int j = 2; j <= n; j++)
        if (pattern[j - 1] == '*')
            dp[0, j] = dp[0, j - 2];

    for (int i = 1; i <= m; i++)
    {
        for (int j = 1; j <= n; j++)
        {
            char token = pattern[j - 1];
            if (token == '*')
            {
                char repeated = pattern[j - 2];
                bool matchesCurrent = repeated == '.' || repeated == text[i - 1];
                dp[i, j] = dp[i, j - 2] || (matchesCurrent && dp[i - 1, j]);
            }
            else
            {
                bool matchesCurrent = token == '.' || token == text[i - 1];
                dp[i, j] = matchesCurrent && dp[i - 1, j - 1];
            }
        }
    }
    return dp[m, n];
}

static void Check(bool expected, bool actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(false, IsMatch("aa", "a"));
Check(true, IsMatch("aa", "a*"));
Check(true, IsMatch("ab", ".*"));
Check(true, IsMatch("aab", "c*a*b"));
Check(false, IsMatch("mississippi", "mis*is*p*."));
Check(true, IsMatch("", "a*b*"));
Check(false, IsMatch("", "a"));
Check(true, IsMatch("", ""));
Check(true, IsMatch("ab", ".b"));
Check(false, IsMatch("abc", "ab"));
```

## Correctness argument

For a non-star token, a match requires the final text character to equal the token or the token to be dot, and the preceding prefixes must match. For `x*`, a valid match either uses zero `x` characters, reducing the pattern by `x*`, or uses at least one: the current text character must match `x` (or dot), and the preceding text prefix must match the same pattern prefix so more repetitions remain possible. These cases are exhaustive and independent. The empty-text initialization repeatedly removes a trailing `x*` pair, exactly the constructs that can match zero characters. Induction over text/pattern prefix lengths proves the table; `dp[m,n]` enforces a full match.

## Step-by-step dry run

For text `"aa"`, pattern `"a*"`, the empty text matches `a*` by using zero repetitions. For the first `a`, the star state is true because `a` matches and the prior text prefix also matches `a*`. For the second `a`, the same consume-one-and-stay transition applies. The final state is true. The pattern `"a"` alone cannot consume both characters, so its final state is false.

## Time complexity

`O(mn)` for `m` text characters and `n` pattern characters.

## Space complexity

`O(mn)` for the Boolean prefix-pair table.

## Edge-case tests

Assertions cover all five supplied examples, patterns that can match empty text, empty generalized inputs, dot matching, and a pattern shorter than the full text.

## Reflection questions

- Why does regex star skip two pattern positions for zero repetitions?
- Why does the one-or-more branch stay at the same pattern column?
- How would the transitions differ for glob wildcard matching?
