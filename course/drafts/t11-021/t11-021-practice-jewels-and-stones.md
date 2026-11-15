# sets and membership algorithms — Problem: Jewels and Stones

## Goals
- Use a set as a membership filter.
- Count repeated items in one collection even though the filter is a set.
- Preserve case-sensitive character identity.

## Problem statement
`jewels` lists the character types that are jewels. `stones` lists the types of stones you have, one character per stone. Return how many stones are jewels.

## Input constraints
- `1 <= jewels.Length, stones.Length <= 50`.
- Both strings contain English letters.
- Characters in `jewels` are unique.
- Matching is case-sensitive.

## Examples with expected output
- `jewels = "aA"`, `stones = "aAAbbbb" -> 3`.
- `jewels = "z"`, `stones = "ZZ" -> 0`.
- `jewels = "b"`, `stones = "bbb" -> 3`.

## Clarifying assumptions
- Each character in `stones` represents a separate stone, so duplicate stone characters count repeatedly.
- `jewels` is a set of types; each type appears at most once by constraint.
- Uppercase and lowercase letters are distinct.

## Progressive hints
1. Repeatedly searching `jewels` for each stone works but can take O(J*S).
2. Put jewel characters in a set.
3. Scan every stone and increment the answer on membership; do not deduplicate the stones.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int NumJewelsInStones(string jewels, string stones)
    {
        var jewelSet = new HashSet<char>(jewels);
        int count = 0;
        foreach (char stone in stones)
            if (jewelSet.Contains(stone)) count++;
        return count;
    }

    static void Check(int expected, string jewels, string stones)
    {
        int actual = NumJewelsInStones(jewels, stones);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(3, "aA", "aAAbbbb");
        Check(0, "z", "ZZ");
        Check(3, "b", "bbb");
        Check(1, "A", "aA");
        Console.WriteLine("Jewels and Stones checks passed.");
    }
}
```

## Correctness argument
The set contains exactly the character types listed in `jewels`. The algorithm examines each stone once and increments exactly when that stone's character is a jewel type. Since repeated stone characters are examined separately, every jewel stone contributes one count. No non-jewel contributes, so the final count is correct.

## Step-by-step dry run
For jewels `aA` and stones `aAAbbbb`, the set is `{a,A}`. The first `a` and both `A` characters are members; all four `b` characters are not. The result is 3.

## Time complexity
Expected O(J+S) for set construction and membership tests, where J and S are the respective string lengths.

## Space complexity
O(U), where U is the number of distinct jewel characters; here U <= 50.

## Alternatives and tradeoffs
- For very short jewels and stones, `jewels.Contains(stone)` is concise but performs repeated linear searches.
- A direct-address boolean table can be used for ASCII, but a set expresses the membership abstraction and generalizes to other hashable characters.
- A frequency map of stones is unnecessary because only a total count is requested.

## Common mistakes and gotchas
- Deduplicating `stones` and undercounting repeated jewel stones.
- Treating matching as case-insensitive.
- Counting distinct jewel types found instead of stone occurrences.
- Using a map when only membership is needed.

## Edge-case tests
- Upper/lowercase letters are separate.
- Every stone is a jewel.
- No stone is a jewel.
- The same jewel character occurs repeatedly in stones.

## Reflection questions
1. Why is a set suitable for jewels but not for stones?
2. What work does the set avoid compared with repeated string search?
3. How would the contract change if stones had multiplicity in a compressed representation?

## Source
- [Jewels and Stones](https://leetcode.com/problems/jewels-and-stones/)
