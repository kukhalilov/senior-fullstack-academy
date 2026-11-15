# strings and character sequences — Problem: First Unique Character in a String

## Goals
- Use a fixed frequency table when the alphabet is explicitly bounded.
- Separate counting from finding the earliest qualifying position.
- Return the required index or sentinel.

## Problem statement
Given a string `s`, return the index of its first character that appears exactly once. Return `-1` if no such character exists.

## Input constraints
- `1 <= s.Length <= 100,000`.
- `s` contains only lowercase English letters `a` through `z`.

## Examples with expected output
- `"leetcode" -> 0`.
- `"loveleetcode" -> 2`.
- `"aabb" -> -1`.
- `"z" -> 0`.

## Clarifying assumptions
- “First” means the smallest original string index, not alphabetic order.
- Frequency is counted over the entire input before selecting the first unique character.
- The constraints allow indexing a 26-entry table by `c - 'a'`; this is not a general Unicode solution.

## Progressive hints
1. A one-pass search cannot know whether a character repeats later unless it stores more information.
2. Count each letter in a fixed array.
3. Scan the input again from index zero and return the first index whose count is one.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int FirstUniqChar(string s)
    {
        int[] frequency = new int[26];
        foreach (char c in s) frequency[c - 'a']++;

        for (int i = 0; i < s.Length; i++)
            if (frequency[s[i] - 'a'] == 1)
                return i;
        return -1;
    }

    static void Check(int expected, string input)
    {
        int actual = FirstUniqChar(input);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(0, "leetcode");
        Check(2, "loveleetcode");
        Check(-1, "aabb");
        Check(0, "z");
        Check(4, "aabbcde");
        Check(-1, "abcabc");
        Console.WriteLine("First Unique Character checks passed.");
    }
}
```

## Correctness argument
After the first pass, `frequency[c-'a']` equals the number of occurrences of each allowed character in the whole input. The second pass visits indices in increasing order and returns exactly when the current character's total count is one. Thus the returned index is the smallest index containing a unique character. If no such count occurs, the scan ends and `-1` is returned.

## Step-by-step dry run
For `"loveleetcode"`, the frequency of `l` is 2, so index 0 is skipped. `o` also appears twice, so index 1 is skipped. `v` appears once, so the method returns index 2.

## Time complexity
O(n + 26), conventionally O(n), for one counting pass and one search pass.

## Space complexity
O(1) auxiliary space: the table has 26 entries independent of input length.

## Alternatives and tradeoffs
- A dictionary supports a larger or unconstrained alphabet but adds hashing and storage proportional to distinct characters.
- Store each character's count and first index in one pass, then select the smallest index with count one; this also uses O(26) state here but makes the first-position logic more complex.
- Sorting characters loses original position order unless positions are retained, so it is unnecessary.

## Common mistakes and gotchas
- Returning the first character whose running count is currently one before reading the rest of the input.
- Iterating through alphabet order instead of scanning original indices.
- Assuming the fixed lowercase alphabet when adapting to arbitrary Unicode text.
- Returning the character instead of its index.

## Edge-case tests
- Every character repeats.
- The first character is unique.
- The first unique character appears after several repeated characters.
- One-character input.

## Reflection questions
1. Why are two passes a natural design here?
2. How would you preserve first-index semantics with a dictionary?
3. What needs to change for a Unicode scalar-value contract?

## Source
- [First Unique Character in a String](https://leetcode.com/problems/first-unique-character-in-a-string/)
