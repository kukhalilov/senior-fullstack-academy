# backtracking, subsets, permutations, and combinations — Problem: Subsets

## Goals

- Enumerate the power set using include/exclude decisions.
- Include the empty subset and the full subset.
- Analyze work against the number and size of outputs.

## Problem statement

Given distinct integers, return every subset. Result order may be arbitrary.

## Input constraints

- 1 <= nums.Length <= 10.
- -10 <= nums[i] <= 10.
- All values are unique.

## Examples with expected output

1. [1,2,3] -> [[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]].
2. [0] -> [[],[0]].

## Clarifying assumptions

- Output subsets may appear in any order.
- The input is not mutated.
- Empty input would produce one empty subset as a generalization.

## Progressive hints

1. At each index decide whether to include its value.
2. When all indices are considered, copy the current path into the result.
3. Undo each inclusion after returning.
4. There are 2^n distinct subsets.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static IList<IList<int>> Subsets(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        var result = new List<IList<int>>();
        var path = new List<int>();
        Search(0);
        return result;

        void Search(int index)
        {
            if (index == nums.Length)
            {
                result.Add(new List<int>(path));
                return;
            }
            Search(index + 1);
            path.Add(nums[index]);
            Search(index + 1);
            path.RemoveAt(path.Count - 1);
        }
    }

    private static string Canon(IList<int> values)
    {
        var copy = new List<int>(values);
        copy.Sort();
        return string.Join(",", copy);
    }

    private static void EqualSets(IList<IList<int>> actual, string[] expected, string label)
    {
        var got = new HashSet<string>();
        foreach (IList<int> subset in actual) got.Add(Canon(subset));
        if (got.Count != actual.Count || !got.SetEquals(expected))
            throw new InvalidOperationException(label + " failed: " + string.Join("|", got));
    }

    public static void Main()
    {
        EqualSets(Subsets(new[] { 1, 2, 3 }), new[] { "", "1", "2", "3", "1,2", "1,3", "2,3", "1,2,3" }, "Example 1");
        EqualSets(Subsets(new[] { 0 }), new[] { "", "0" }, "Example 2");
        EqualSets(Subsets(Array.Empty<int>()), new[] { "" }, "empty generalization");
        Console.WriteLine("All Subsets checks passed.");
    }
}
```

## Correctness argument

At index i, every subset either excludes nums[i] or includes it. Search explores both disjoint choices, and the path contains exactly the included values from prior positions. At index n, all positions have been decided, so copying path records one subset. Every subset has one unique sequence of include/exclude decisions, so none are omitted or duplicated. The empty path records the empty subset; including every value records the full set.

## Step-by-step dry run

For [1,2], decide index 0 then index 1. The four decision sequences produce [], [2], [1], and [1,2], exactly 2^2 subsets.

## Time complexity

O(n*2^n) including copying each subset; there are 2^n outputs with average size n/2.

## Space complexity

O(n) recursion and path, excluding O(n*2^n) returned output.

## Alternatives and tradeoffs

- Iteratively duplicate the existing subset list for each value; same output cost without recursion.
- Bitmasks enumerate subsets in O(2^n) control time but still require output storage and are limited by bit width.

## Common mistakes and gotchas

- Forgetting to copy path when adding; later mutations would change stored results.
- Omitting the empty subset.
- Failing to undo the included value.
- Claiming O(2^n) total time while each subset copy costs O(n).

## Edge-case tests

- One value.
- Negative values.
- Empty generalization.
- Verify result count equals 2^n.

## Reflection questions

1. Why are include and exclude branches disjoint?
2. Why copy the current path?
3. How many subsets exist for n positions?
4. What portion of runtime comes from output construction?

Source: [LeetCode: Subsets](https://leetcode.com/problems/subsets/).
