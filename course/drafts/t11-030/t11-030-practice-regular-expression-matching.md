# sequence and string dynamic programming — Problem: Regular Expression Matching

# Goals

- Build a DP state for whether a pattern prefix matches a complete input prefix.
- Derive the zero-or-more transition for `*` without treating it as an independent wildcard.
- Handle empty prefixes and prove that the pattern matches the entire string.

# Problem statement

Implement matching of a string `s` against a pattern `p` with two operators: `.` matches any one character, and `*` matches zero or more repetitions of the immediately preceding valid pattern element. The pattern must match the **entire** string, not just a substring.

# Input constraints

- `1 <= s.Length, p.Length <= 20`
- `s` contains lowercase English letters.
- `p` contains lowercase English letters, `.`, and `*`.
- Every `*` has a preceding valid element; there are no malformed leading stars.

# Examples with expected output

- `s = "aa"`, `p = "a"` → `false` because one literal does not cover two characters.
- `s = "aa"`, `p = "a*"` → `true`; `a*` consumes both `a` characters.
- `s = "ab"`, `p = ".*"` → `true`; dot matches each character and star permits repetition.
- `s = "aab"`, `p = "c*a*b"` → `true`; `c*` matches zero `c`, `a*` consumes two `a`, and `b` matches `b`.
- `s = "mississippi"`, `p = "mis*is*p*."` → `false`.

# Clarifying assumptions

- This is the problem’s small regex language, not the .NET regular-expression language. In particular, do not call `Regex.IsMatch` because its syntax and matching/search behavior differ.
- `.` matches exactly one input character; `*` applies to the preceding atom and means zero or more occurrences.
- Matching is anchored to both ends by definition.
- The validity guarantee means every star can safely look at the atom immediately before it.

# Progressive hints

1. Define `dp[i,j]` as whether the first `i` input characters match the first `j` pattern characters.
2. A literal or dot consumes one character and looks diagonally to `dp[i-1,j-1]`.
3. When `p[j-1]` is `*`, first consider zero copies by skipping the atom and star (`j-2`). If the preceding atom matches the current input character, also consider consuming one character while keeping the pattern at `j`.
4. Empty input may match patterns like `a*b*c*`; initialize the first row by skipping valid atom-star pairs.

# Complete C# solution

```csharp dsa-solution
using System;

public static class RegularExpressionMatchingSolution
{
    public static bool IsMatch(string s, string p)
    {
        int n = s.Length;
        int m = p.Length;
        var dp = new bool[n + 1, m + 1];
        dp[0, 0] = true;

        // Empty input can match zero repetitions of atom-star pairs.
        for (int j = 2; j <= m; j++)
        {
            if (p[j - 1] == '*')
            {
                dp[0, j] = dp[0, j - 2];
            }
        }

        for (int i = 1; i <= n; i++)
        {
            for (int j = 1; j <= m; j++)
            {
                char patternCharacter = p[j - 1];

                if (patternCharacter == '*')
                {
                    // The valid-pattern constraint guarantees j >= 2 here.
                    char repeatedAtom = p[j - 2];
                    bool atomMatchesCurrent =
                        repeatedAtom == '.' || repeatedAtom == s[i - 1];

                    bool useZeroOccurrences = dp[i, j - 2];
                    bool useOneOrMoreOccurrences =
                        atomMatchesCurrent && dp[i - 1, j];

                    dp[i, j] = useZeroOccurrences || useOneOrMoreOccurrences;
                }
                else
                {
                    bool currentMatches =
                        patternCharacter == '.' || patternCharacter == s[i - 1];

                    dp[i, j] = currentMatches && dp[i - 1, j - 1];
                }
            }
        }

        return dp[n, m];
    }

    public static void Main()
    {
        if (IsMatch("aa", "a") ||
            !IsMatch("aa", "a*") ||
            !IsMatch("ab", ".*") ||
            !IsMatch("aab", "c*a*b") ||
            IsMatch("mississippi", "mis*is*p*.") ||
            !IsMatch("", "a*b*") ||
            !IsMatch("a", ".") ||
            IsMatch("ab", "a"))
        {
            throw new InvalidOperationException("A regex matching check failed.");
        }
    }
}
```

# Correctness argument

For each `(i,j)`, `dp[i,j]` is true exactly when the prefix `s[0..i)` matches the complete pattern prefix `p[0..j)`.

- **Base:** `dp[0,0]` is true. A nonempty input cannot match an empty pattern, so other states in column 0 remain false. An empty input can match a pattern prefix only by skipping zero-or-more atom-star pairs; the first-row initialization applies that rule.
- **Literal or dot:** If the final pattern character is not `*`, it must consume exactly the final input character. It matches only when it is equal to that character or is `.`, and the preceding prefixes must match, which is `dp[i-1,j-1]`.
- **Star:** Let the atom before `*` be `p[j-2]`. With zero occurrences, remove the atom-star pair and use `dp[i,j-2]`. With one or more occurrences, the atom must match the current input character and the shorter input prefix must match the same pattern prefix, `dp[i-1,j]`. These cover all possible counts; if neither holds, no valid matching exists.

By induction over prefix lengths, every state has the stated meaning, so `dp[n,m]` answers whether the whole string matches the whole pattern.

# Step-by-step dry run

For `s = "aab"`, `p = "c*a*b"`, consider the decisive transitions:

1. `dp[0,0] = true`.
2. Empty input skips `c*`, so `dp[0,2] = true`; it then skips `a*`, so `dp[0,4] = true`. It cannot skip the final literal `b`.
3. At the first input `a`, the `a*` state can consume one `a` from `dp[0,4]`, making `dp[1,4] = true`.
4. At the second `a`, it stays at the same `a*` pattern prefix and consumes one more, so `dp[2,4] = true`.
5. The final `b` matches the final literal from `dp[2,4]`, yielding `dp[3,5] = true`.

The final true state demonstrates the full match; the `c*` prefix contributes zero characters.

# Time complexity

`O(n × m)`, where `n` and `m` are string and pattern lengths. Each table state takes constant time.

# Space complexity

`O(n × m)` for the table. A rolling-row form can reduce the storage, but its update order must preserve `dp[i,j-2]`, `dp[i-1,j]`, and `dp[i-1,j-1]`; the full table is clearer for proving and debugging this recurrence.

# Edge-case tests

- A literal pattern shorter than the input and a literal pattern longer than the input.
- Dot matching exactly one character.
- Star matching zero occurrences (`"aab"` with `"c*a*b"`).
- Star matching one and multiple occurrences.
- Several adjacent atom-star pairs and empty input (the constraints exclude empty input, but the method supports it).
- A star whose atom does not match the next input character.
- A pattern that matches a prefix but not the entire input.
- Pattern length 1, where a star cannot appear due to the validity guarantee.

# Reflection questions

1. Why does star’s zero-occurrence branch move `j` back by two?
2. Why does its one-or-more branch keep `j` unchanged while reducing `i`?
3. What would break if star were treated as an independent wildcard character?
4. Why is using the platform regex engine not a substitute for this DP lesson?

**Answers:** (1) `*` and its preceding atom are one pattern construct and are both skipped. (2) Another input character is consumed while the same atom-star construct can consume more. (3) It would lose the rule that star modifies exactly its previous atom and would omit the zero-versus-repetition choices. (4) The platform engine supports different syntax and may search rather than require this problem’s whole-string semantics.

# Sources

- [Assigned problem: Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/)
- [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp)
