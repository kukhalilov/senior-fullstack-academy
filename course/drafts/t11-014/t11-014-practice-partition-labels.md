# greedy choices, invariants, and correctness proofs — Problem: Partition Labels

## Goals
- Split a lowercase string into the maximum number of contiguous parts.
- Ensure each distinct letter appears in at most one part.
- Extend a part to include every last occurrence of letters already inside it.

## Problem statement
Partition the string into as many contiguous substrings as possible so that each letter appears in at most one substring. Concatenating the parts must reproduce the input. Return the length of each part.

## Input constraints

- 1 <= s.Length <= 500.
- s contains lowercase English letters a through z.

## Examples with expected output

- "ababcbacadefegdehijhklij" -> [9,7,8].
- "eccbbbbdec" -> [10].
- "a" -> [1].

## Clarifying assumptions

- The alphabet is exactly the 26 lowercase English letters.
- Parts are contiguous, nonempty, and preserve source order.
- The requested objective is to maximize number of parts.

## Progressive hints

1. Precompute the last index of each letter.
2. A part beginning at start cannot end before the last occurrence of its first character.
3. As you scan the tentative part, extend end to include the last occurrence of every character encountered.
4. A boundary is safe when the scan reaches end.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<int> PartitionLabels(string text)
    {
        var result = new List<int>();
        if (text.Length == 0) return result;

        var last = new int[26];
        for (int i = 0; i < text.Length; i++)
            last[text[i] - 'a'] = i;

        int start = 0, end = 0;
        for (int i = 0; i < text.Length; i++)
        {
            end = Math.Max(end, last[text[i] - 'a']);
            if (i == end)
            {
                result.Add(end - start + 1);
                start = i + 1;
            }
        }
        return result;
    }

    static void Check(int[] expected, IList<int> actual)
    {
        if (!expected.SequenceEqual(actual)) throw new Exception("Partition lengths differ.");
    }

    static void Main()
    {
        Check(new[] { 9, 7, 8 }, PartitionLabels("ababcbacadefegdehijhklij"));
        Check(new[] { 10 }, PartitionLabels("eccbbbbdec"));
        Check(new[] { 1 }, PartitionLabels("a"));
        Check(Array.Empty<int>(), PartitionLabels(""));
        Console.WriteLine("Partition Labels checks passed.");
    }
}
```

## Correctness argument

For a part starting at start, its endpoint must be at least the last occurrence of every character inside it; otherwise that character would appear in a later part. Initialize end to the last occurrence of the first character, then extend end whenever a scanned character has a later last occurrence. When i reaches end, every character seen in this segment has its final occurrence at or before end, so ending the part there is safe. Ending earlier would split at least one character whose last occurrence extends beyond the boundary. Taking the earliest safe endpoint leaves the largest possible suffix for additional parts and cannot reduce the maximum number of parts; repeating this argument for the remaining suffix proves optimality.

## Step-by-step dry run

For "ababcbaca", the first a ends at index 8, so the initial boundary is at least 8. Scanning b, c, and subsequent characters never extends it beyond 8. At index 8 the boundary closes, producing length 9. The next segment "defegde" closes at length 7, followed by "hijhklij" of length 8.

## Time complexity

O(n+alphabet) time: one pass for last positions and one scan of the string.

## Space complexity

O(alphabet) auxiliary space for the 26 last positions, plus O(number of partitions) output.

## Alternatives and tradeoffs

- A dictionary of last positions generalizes to arbitrary Unicode or larger alphabets, with hashing costs and character-grapheme semantics to define.
- A two-pass scan is simple and constant space for this fixed alphabet.
- A graph/SCC interpretation can explain the dependency closure, but is unnecessary for implementation.

## Common mistakes and gotchas

- Closing at the last occurrence of only the first character misses later characters with farther occurrences.
- Starting a new part immediately whenever the current character repeats breaks the global constraint.
- Using an array indexed by char without validating the lowercase alphabet can cause an out-of-range error.
- The end index is inclusive; length is end-start+1.

## Edge-case tests

- All characters equal gives one part.
- All characters unique gives one-character parts.
- A character whose final occurrence extends a tentative boundary forces the whole part to grow.
- Empty defensive input returns an empty length list.

## Reflection questions

1. Why is reaching the current boundary sufficient to close a part?
2. Why can no valid partition close this part earlier?
3. What data structure and text semantics would you use for Unicode grapheme clusters?

## Source

- [Partition Labels](https://leetcode.com/problems/partition-labels/)
