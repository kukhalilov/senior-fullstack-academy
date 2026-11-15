# sets and membership algorithms — Problem: Contains Duplicate

## Goals
- Use a seen set to replace pairwise comparisons.
- Stop as soon as a repeated value is found.
- State average hash-set costs accurately.

## Problem statement
Return `true` if any integer appears at least twice in `nums`; return `false` if every element is distinct.

## Input constraints
- `1 <= nums.Length <= 100,000`.
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`.

## Examples with expected output
- `[1,2,3,1] -> true`.
- `[1,2,3,4] -> false`.
- `[1,1,1,3,3,4,3,2,4,2] -> true`.

## Clarifying assumptions
- Any repeated value is enough; return order and duplicate identity are irrelevant.
- The input is not modified.
- An empty array would be distinct by definition, though the official minimum length is one.

## Progressive hints
1. Compare each pair for an O(n²) baseline.
2. Maintain values from the processed prefix in a set.
3. If adding a value reports that it was already present, return true.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static bool ContainsDuplicate(int[] nums)
    {
        var seen = new HashSet<int>();
        foreach (int value in nums)
            if (!seen.Add(value)) return true;
        return false;
    }

    static void Check(bool expected, int[] nums)
    {
        if (ContainsDuplicate(nums) != expected)
            throw new InvalidOperationException("Contains Duplicate check failed.");
    }

    static void Main()
    {
        Check(true, new[] { 1, 2, 3, 1 });
        Check(false, new[] { 1, 2, 3, 4 });
        Check(true, new[] { 1, 1, 1, 3, 3, 4, 3, 2, 4, 2 });
        Check(true, new[] { int.MinValue, 0, int.MinValue });
        Check(false, new[] { int.MinValue, int.MaxValue });
        Console.WriteLine("Contains Duplicate checks passed.");
    }
}
```

## Correctness argument
Before processing each value, `seen` contains exactly the distinct values in the earlier array prefix. If `Add` returns false, the current value already occurs earlier, so a duplicate exists. If the loop finishes, every insertion was new and all values are distinct.

## Step-by-step dry run
For `[1,2,3,1]`, insert 1, 2, and 3 successfully. Adding the final 1 returns false because it is already present, so return true immediately.

## Time complexity
Expected O(n) set operations; worst-case behavior can be linear per operation under severe hash collisions.

## Space complexity
O(u), where u is the number of distinct values processed before returning or all distinct values on a false result.

## Alternatives and tradeoffs
- Pairwise comparison: O(n²) time and O(1) space.
- Sort a copy then compare adjacent values: O(n log n) time and O(n) extra storage if input must remain unchanged.
- Sorting in place uses less extra space but mutates input.
- A hash set supports early exit and preserves the input.

## Common mistakes and gotchas
- Checking set membership and then adding separately when `Add` already reports whether insertion was new.
- Returning false after the first unique value rather than checking the full input.
- Claiming strict worst-case O(n) for general hashing.
- Sorting a caller-owned array without considering mutation requirements.

## Edge-case tests
- Duplicate at the end.
- All values distinct.
- Duplicate appears adjacent and far apart.
- Negative and extreme integer values.

## Reflection questions
1. What does the set contain at the beginning of each iteration?
2. How does early exit affect auxiliary space?
3. When might sorting be preferable despite its O(n log n) time?

## Source
- [Contains Duplicate](https://leetcode.com/problems/contains-duplicate/)
