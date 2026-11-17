# two-pointer and sliding-window techniques — Problem: Longest Substring Without Repeating Characters

## Goals

- Maintain a window whose characters are all distinct.
- Use last-seen positions to jump the left boundary without moving it backward.
- Distinguish a substring from a subsequence and explain the map's role.

## Problem statement

Given a string s, return the length of the longest substring without repeating characters. A substring is contiguous. Return 0 for the empty string.

## Input constraints

- 0 <= s.Length <= 100,000.
- The input consists of English letters, digits, symbols, and spaces.
- This problem's character domain is represented by .NET `char` code units for the supplied input. For a different Unicode problem, first clarify whether “character” means UTF-16 code unit, Unicode scalar value, or grapheme cluster.

## Examples with expected output

1. s = "abcabcbb" -> 3; for example, "abc".
2. s = "bbbbb" -> 1.
3. s = "pwwkew" -> 3; "wke" is a substring, while "pwke" is only a subsequence.
4. s = "abba" -> 2; the answer may be "ab" or "ba".
5. s = "" -> 0.

## Clarifying assumptions

- Return a length only; any longest substring's length is the same.
- Two characters are duplicates when their code units are equal under the problem's stated alphabet.
- A character seen previously but outside the active window does not make the current window invalid.
- The solution uses expected O(1) dictionary operations; the input alphabet is small, so a fixed-size last-seen table is another option only if its mapping is explicitly defined.

## Progressive hints

1. Keep a contiguous window `[left, right]` and ensure it contains no repeated character.
2. When the new character was seen inside the current window, move `left` just beyond that previous occurrence.
3. A stored last-seen index can be older than `left`; never move the boundary backward. Use the maximum of its current value and `previous + 1`.
4. Update the best length after incorporating the current character; the valid window length is `right - left + 1`.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int LengthOfLongestSubstring(string s)
    {
        if (s is null) throw new ArgumentNullException(nameof(s));

        var lastSeen = new Dictionary<char, int>();
        int left = 0;
        int best = 0;

        for (int right = 0; right < s.Length; right++)
        {
            char current = s[right];
            if (lastSeen.TryGetValue(current, out int previousIndex))
                left = Math.Max(left, previousIndex + 1);

            lastSeen[current] = right;
            best = Math.Max(best, right - left + 1);
        }
        return best;
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(LengthOfLongestSubstring("abcabcbb"), 3, "Example 1");
        AssertEqual(LengthOfLongestSubstring("bbbbb"), 1, "Example 2");
        AssertEqual(LengthOfLongestSubstring("pwwkew"), 3, "Example 3");
        AssertEqual(LengthOfLongestSubstring("abba"), 2, "Repeated character behind left boundary");
        AssertEqual(LengthOfLongestSubstring(""), 0, "Empty string");
        AssertEqual(LengthOfLongestSubstring("a b"), 3, "Space is a character");
        Console.WriteLine("All Longest Substring Without Repeating Characters checks passed.");
    }
}
```

## Correctness argument

After processing index `right`, the active window `[left,right]` has no repeated character. When `s[right]` has a previous position p, if p is at least left, the prior copy is inside the old window, so moving left to p + 1 removes that copy. If p is less than left, it is already outside the window and the boundary should not change. `Math.Max(left,p+1)` expresses both cases and ensures left never retreats.

The loop considers every input position as the right endpoint of a valid window and updates the maximum length for that endpoint. Any valid substring ending at right cannot start before the latest duplicate's position plus one; otherwise it would contain that duplicate pair. Thus the current window is the longest valid substring ending at right. Taking the maximum over all right endpoints gives the global optimum. Empty input skips the loop and returns zero.

## Step-by-step dry run

For `s = "abba"`:

| right | character | previous index | left after update | active window | best |
|---:|:---:|---:|---:|---|---:|
| 0 | a | unseen | 0 | a | 1 |
| 1 | b | unseen | 0 | ab | 2 |
| 2 | b | 1 | 2 | b | 2 |
| 3 | a | 0 | max(2,1) = 2 | ba | 2 |

The last `a` occurred before the current window, so it must not send left back to 1. The answer is 2.

## Time complexity

O(n) expected, where n is the string length: each position is processed once and dictionary lookup/update is expected O(1). The left boundary jumps forward at most n total positions.

## Space complexity

O(min(n, alphabet size)) stored characters. For this stated input, the number of distinct code units is bounded by the permitted character set.

## Alternatives and tradeoffs

- A frequency window increments counts and repeatedly removes from the left while the incoming character is duplicated. It is also O(n) expected, and makes each removal explicit; last-seen indices avoid repeated one-step removals.
- If the allowed alphabet is a small, explicitly mapped set, an array of last-seen indices can replace the dictionary. Initialize entries to -1 and validate/map characters carefully. A guessed ASCII range is unsafe when the statement permits a wider set.
- Brute force can enumerate all substrings and test uniqueness, but repeated checking is quadratic or worse and is only practical as a tiny-input oracle.

## Common mistakes and gotchas

- Moving left to `previousIndex + 1` without `Math.Max`; this breaks on "abba" by moving the boundary backward.
- Updating best before fixing a duplicate, which measures an invalid window.
- Counting a subsequence instead of a substring; characters cannot be skipped.
- Forgetting that a space or punctuation symbol is an input character.
- Using a fixed-size array without defining a safe mapping for every allowed character.
- Confusing UTF-16 code units with Unicode grapheme clusters in problems whose input contract includes arbitrary human text.

## Edge-case tests

- Empty input returns zero.
- All characters equal returns one.
- All characters unique returns the full length.
- A repeated character inside the current window forces a jump.
- A repeated character before left must not move left backward (`"abba"`).
- Spaces and symbols participate like other input code units.

## Reflection questions

1. Why does the latest prior occurrence determine the earliest possible start of a valid substring ending at right?
2. Why must left be monotone even when the dictionary reports an older index?
3. How does a frequency map solution differ in its update loop?
4. When would .NET `char` no longer match the problem's definition of a character?

Sources: [LeetCode: Longest Substring Without Repeating Characters](https://leetcode.com/problems/longest-substring-without-repeating-characters/), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
