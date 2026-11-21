# two-pointer and sliding-window techniques — Problem: Minimum Window Substring

## Goals

- Track required character multiplicities, including duplicates.
- Expand until a window covers the target, then contract it while it remains valid.
- Maintain a precise missing-character count and prove the shortest answer is found.

## Problem statement

Given strings s and t, return the minimum-length substring of s that contains every character of t, including the required multiplicity of repeated characters. Return the empty string if no such substring exists. The test data guarantees a unique answer when one exists.

## Input constraints

- 1 <= s.Length, t.Length <= 100,000.
- Both strings contain uppercase and lowercase English letters.
- Matching is case-sensitive: `A` and `a` are distinct characters.
- Each occurrence in t requires a separate matching occurrence in the window.

## Examples with expected output

1. s = "ADOBECODEBANC", t = "ABC" -> "BANC".
2. s = "a", t = "a" -> "a".
3. s = "a", t = "aa" -> ""; the window must contain two copies.
4. s = "aaab", t = "aab" -> "aab"; surplus copies do not increase the required multiplicity.

## Clarifying assumptions

- Character matching is exact and case-sensitive; no normalization is requested.
- The constraint guarantees ASCII letters, so a 128-entry frequency array is safe. For arbitrary Unicode input, use a map keyed by the problem's specified character unit.
- The algorithm's window boundaries are inclusive. The returned substring length is `right - left + 1`.
- An empty t would conventionally require an empty window, but the stated constraints require nonempty t; the implementation defines empty t as returning an empty string for robustness.

## Progressive hints

1. Build the count of each required character. A set is insufficient because t may contain duplicates.
2. Maintain how many required character occurrences are still missing, counting multiplicity.
3. On entering a character, it satisfies a missing requirement only if its deficit was positive before decrementing.
4. Once missing reaches zero, the window is valid. Record it, then remove from the left until that removal makes the window invalid.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static string MinWindow(string s, string t)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));
        if (t is null) throw new ArgumentNullException(nameof(t));
        if (t.Length == 0 || s.Length < t.Length) return string.Empty;

        var deficit = new int[128];
        foreach (char c in t) deficit[c]++;

        int missing = t.Length;
        int left = 0;
        int bestStart = 0;
        int bestLength = int.MaxValue;

        for (int right = 0; right < s.Length; right++)
        {
            char entering = s[right];
            if (deficit[entering] > 0) missing--;
            deficit[entering]--;

            while (missing == 0)
            {
                int length = right - left + 1;
                if (length < bestLength)
                {
                    bestLength = length;
                    bestStart = left;
                }

                char leaving = s[left];
                deficit[leaving]++;
                if (deficit[leaving] > 0) missing++;
                left++;
            }
        }

        return bestLength == int.MaxValue
            ? string.Empty
            : s.Substring(bestStart, bestLength);
    }

    private static void AssertEqual(string actual, string expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(MinWindow("ADOBECODEBANC", "ABC"), "BANC", "Example 1");
        AssertEqual(MinWindow("a", "a"), "a", "Example 2");
        AssertEqual(MinWindow("a", "aa"), "", "Example 3");
        AssertEqual(MinWindow("aaab", "aab"), "aab", "Multiplicity and surplus");
        AssertEqual(MinWindow("ab", "b"), "b", "Window at right boundary");
        AssertEqual(MinWindow("abc", "d"), "", "Required character absent");
        Console.WriteLine("All Minimum Window Substring checks passed.");
    }
}
```

## Correctness argument

For each character c, `deficit[c]` equals the number of occurrences still needed to cover t, with negative values representing surplus occurrences in the current window. `missing` is the total number of required occurrences not yet covered. When a character enters, it reduces missing exactly when its deficit was positive; the deficit is then decremented. Thus missing is zero exactly when the window covers every target occurrence.

When missing is zero, the current window is valid. The algorithm records it and removes the leftmost character. If the updated deficit becomes positive, that removal made one required occurrence missing; the loop ends. Every valid window encountered is recorded before it becomes invalid. For a fixed right endpoint, further shrinking after invalidation cannot yield another valid window with that same endpoint. Every possible optimal window has some right endpoint and is considered when the scan reaches it, so the minimum recorded length is globally minimal. If missing never reaches zero, no window covers t and the empty string is returned.

## Step-by-step dry run

For s = `"ADOBECODEBANC"` and t = `"ABC"`, initially one A, B, and C are needed:

| action | window | missing | result |
|---|---|---:|---|
| Expand through `C` in `ADOBEC` | `ADOBEC` | 0 | Record length 6 |
| Remove `A` | `DOBEC` | 1 | Invalid; expand again |
| Expand through final `C` | `DOBECODEBANC` | 0 | Valid again |
| Remove surplus prefix characters | `BANC` | 0 | Record length 4; later removal of B makes it invalid |

The shortest recorded range is `BANC`, length 4. Surplus characters can leave without making a required count positive; a required copy cannot.

## Time complexity

O(m + n), where m = s.Length and n = t.Length. Each character of t initializes one count; each character of s enters once and leaves at most once. Constructing the returned substring copies at most O(m) characters, still within the bound.

## Space complexity

O(1) auxiliary space for the fixed 128-entry table under the stated English-letter constraint, excluding the returned substring. A general-character dictionary would use O(distinct characters in t) space.

## Alternatives and tradeoffs

- A dictionary supports arbitrary keys and generalizes naturally to Unicode-aware key types; it has O(distinct target characters) storage and expected constant-time operations.
- A frequency-array indexed by the exact alphabet is simpler and avoids hashing. Its fixed size is appropriate only because the prompt restricts characters to ASCII English letters.
- Track `formed` distinct required character kinds instead of `missing` occurrences. Increment formed when a count reaches the required count and decrement when removal drops below it. That is also correct, but the invariant must compare each required multiplicity; merely counting present character kinds is insufficient.

## Common mistakes and gotchas

- Using a set, which loses multiplicity (`t = "aa"` requires two a characters).
- Decrementing missing for every entering matching character, including surplus ones.
- Declaring the window valid when every distinct required character appears at least once but a repeated requirement is still short.
- Shrinking before recording the current valid window, which can discard the only answer.
- Confusing `A` with `a`; this matching is case-sensitive.
- Using a 128-entry table for input outside the specified ASCII domain.
- Updating the best answer on equal length when the problem has a tie rule that requires a particular occurrence. The current prompt guarantees a unique answer; strict `<` keeps the earliest found if equal answers arise in a variant.

## Edge-case tests

- Target longer than source.
- A required character absent from source.
- Duplicate target characters with insufficient source multiplicity.
- Surplus copies before and inside the minimum window.
- The best answer is a single character.
- The optimal window touches either end of the source.

## Reflection questions

1. What does a negative deficit mean for a character?
2. Why must `missing` count occurrences rather than distinct character kinds?
3. Why is every left index removed at most once even though the shrink loop is nested?
4. What changes if the alphabet is arbitrary Unicode rather than ASCII English letters?

Sources: [LeetCode: Minimum Window Substring](https://leetcode.com/problems/minimum-window-substring/), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
