# dynamic programming states, recurrences, and tabulation — Problem: Decode Ways

## Goals
- Count valid parses of a digit string using codes 1 through 26.
- Distinguish valid one-digit and two-digit transitions, especially around zero.
- Avoid overflow in intermediate prefix counts even when the final answer fits Int32.

## Problem statement
Digits map as 1->A through 26->Z. Return the number of ways to partition the entire digit string into valid codes. A code cannot have a leading zero; strings with no valid complete decoding return zero.

## Input constraints
- 1 <= s.Length <= 100.
- s contains only digits and may include leading zeros.
- The final number of decodings fits in a signed 32-bit integer.

## Examples with expected output
- "12" -> 2.
- "226" -> 3.
- "06" -> 0.
- "11106" -> 2.

## Clarifying assumptions
- Each decoded letter consumes one or two consecutive digits.
- Only values 1 through 26 are valid codes.
- For defensive empty input, this implementation returns one way to parse the empty sequence; official inputs are nonempty.

## Progressive hints
1. Let dp[i] count decodings of the first i characters.
2. A nonzero final digit can be decoded alone.
3. A final pair contributes only when its numeric value is 10 through 26.
4. dp[0]=1 is the empty prefix base; zero rules decide whether that base extends.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Numerics;

static class Program
{
    static int NumDecodings(string s)
    {
        if (s.Length == 0) return 1;
        foreach (char ch in s)
            if (ch < '0' || ch > '9')
                throw new ArgumentException("Input must contain only decimal digits.", nameof(s));

        BigInteger twoBack = BigInteger.One; // dp[0]
        BigInteger oneBack = s[0] == '0' ? BigInteger.Zero : BigInteger.One; // dp[1]

        for (int i = 1; i < s.Length; i++)
        {
            BigInteger current = BigInteger.Zero;
            if (s[i] != '0')
                current += oneBack;

            int pair = (s[i - 1] - '0') * 10 + (s[i] - '0');
            if (pair >= 10 && pair <= 26)
                current += twoBack;

            twoBack = oneBack;
            oneBack = current;
        }

        return checked((int)oneBack);
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2, NumDecodings("12"));
        Check(3, NumDecodings("226"));
        Check(0, NumDecodings("06"));
        Check(2, NumDecodings("11106"));
        Check(1, NumDecodings("10"));
        Check(0, NumDecodings("100"));
        Check(0, NumDecodings(new string('1', 98) + "00"));
        Check(1, NumDecodings(""));
        Console.WriteLine("Decode Ways checks passed.");
    }
}
```

## Correctness argument

Let dp[i] count valid decodings of the prefix of length i. The empty prefix has one construction, dp[0]=1. For a nonempty prefix ending at character i-1, a final one-digit code exists exactly when that digit is 1 through 9; then every decoding of the first i-1 digits extends once. A final two-digit code exists exactly when the last pair is 10 through 26; then every decoding of the first i-2 digits extends once. The final code length is uniquely one or two, so these classes are disjoint and exhaustive. Their counts are added. The rolling variables hold dp[i-2] and dp[i-1]. BigInteger prevents large intermediate prefix counts from overflowing when a later invalid suffix makes the final count zero; the stated input guarantee makes the checked conversion valid.

## Step-by-step dry run

For "11106", dp[0]=1 and dp[1]=1. The prefixes "11", "111", and "1110" have counts 2, 3, and 2. At the final 6, the single-digit transition is allowed and the pair "06" is not, so the count remains 2.

## Time complexity

O(n) recurrence steps. With BigInteger, each addition operates on at most O(n) bits in the worst case, so bit-level work is O(n²) as a conservative bound; under fixed-width arithmetic the recurrence uses O(n) additions.

## Space complexity

O(n) bits for the two rolling BigInteger counts in the worst case, plus the input string; only a constant number of DP values are retained.

## Alternatives and tradeoffs

- A full array of Int32 counts is simpler for typical accepted solutions, but should not assume every intermediate prefix count fits merely because the final answer is constrained.
- A full BigInteger table makes every prefix count inspectable but uses O(n²) bits across all entries.
- A top-down memoized recurrence has the same transitions and may be easier to generalize, with O(n) call depth.

## Common mistakes and gotchas

- Treating "06" as code 6.
- Allowing a single zero as a letter.
- Accepting pairs greater than 26.
- Setting dp[0] to zero, which prevents a valid first code from extending the empty prefix.
- Using a numeric pair without checking the leading zero condition through the 10..26 range.
- Assuming final answer bounds always bound every intermediate prefix count when invalid suffixes can reduce the final count to zero.

## Edge-case tests

- Leading zero.
- Valid pair 10 and invalid pair 30.
- Zero following a valid 1 or 2.
- Consecutive zeros.
- A long ambiguous prefix followed by an invalid suffix.

## Reflection questions
1. Why does dp[0] equal one rather than zero?
2. Why are the one- and two-digit transition classes disjoint?
3. How can an intermediate count exceed a final count?

## Source
- [Decode Ways](https://leetcode.com/problems/decode-ways/)
