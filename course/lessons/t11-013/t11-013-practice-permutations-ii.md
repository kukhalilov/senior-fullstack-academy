# backtracking, subsets, permutations, and combinations — Problem: Permutations II

## Goals
- Enumerate distinct permutations when values repeat.
- Distinguish equal choices at the same search depth from equal values used in different positions.
- Explain the sorted-input and used-position invariant.

## Problem statement
Given an integer array that may contain duplicates, return each distinct permutation exactly once.

## Input constraints

The input length is 1 to 8 and values are between -10 and 10.

## Examples with expected output
Input: [1,1,2]
Expected output: [[1,1,2],[1,2,1],[2,1,1]]

Input: [1,2,3]
Expected output contains all six permutations.

## Clarifying assumptions
- Equal values are interchangeable; output permutations are compared by value sequence.
- The input is not mutated; a sorted copy is used.
- Result order is irrelevant.

## Progressive hints
1. Use the same used-position search as for distinct permutations.
2. Sorting groups identical values together.
3. When considering equal values, skip the later one only when its previous equal value is not already in the current path.
4. If the previous equal value is already used, choosing this copy next is necessary to form a repeated run.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<int>> PermuteUnique(int[] input)
    {
        int[] nums = (int[])input.Clone();
        Array.Sort(nums);
        var result = new List<IList<int>>();
        var path = new List<int>();
        var used = new bool[nums.Length];

        void Search()
        {
            if (path.Count == nums.Length)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = 0; i < nums.Length; i++)
            {
                if (used[i]) continue;
                if (i > 0 && nums[i] == nums[i - 1] && !used[i - 1])
                    continue;

                used[i] = true;
                path.Add(nums[i]);
                Search();
                path.RemoveAt(path.Count - 1);
                used[i] = false;
            }
        }

        Search();
        return result;
    }

    static string Key(IEnumerable<int> values) => string.Join(",", values);

    static void Main()
    {
        var actual = PermuteUnique(new[] { 1, 1, 2 }).Select(Key).ToHashSet();
        if (!actual.SetEquals(new[] { "1,1,2", "1,2,1", "2,1,1" }))
            throw new Exception("Repeated-value permutations mismatch.");

        var allDistinct = PermuteUnique(new[] { 1, 2, 3 });
        if (allDistinct.Count != 6 || allDistinct.Select(Key).Distinct().Count() != 6)
            throw new Exception("Distinct values should produce six unique orders.");

        var allEqual = PermuteUnique(new[] { 4, 4, 4 });
        if (allEqual.Count != 1 || Key(allEqual[0]) != "4,4,4")
            throw new Exception("All-equal values should produce one ordering.");
        Console.WriteLine("Permutations II checks passed.");
    }
}
```

## Correctness argument
Sorting places equal values adjacently. The used array ensures every input occurrence is selected once. For equal adjacent values, the condition skips the later occurrence while the earlier occurrence is unused; therefore, among interchangeable unused copies, the search picks a canonical left-to-right order. Once the earlier copy is used in this path, the next copy is allowed, so permutations with repeated copies remain constructible. Every distinct value sequence has a canonical assignment of its equal occurrences and is explored once.

## Step-by-step dry run
For [1a,1b,2], the root may choose 1a. It may then choose 1b, or choose 2 and later 1b, generating [1,1,2] and [1,2,1]. At the root, choosing 1b while 1a is unused is skipped. The root can choose 2, followed by 1a and 1b, generating [2,1,1]. This yields three value-distinct orders.

## Time complexity
If the value frequencies are c1 through ck, the number of unique outputs is n!/(c1!·...·ck!). Each output has n elements, so materialization takes Θ(n times the number of unique permutations). Search overhead is bounded by the permutation tree.

## Space complexity
Auxiliary path, used state, sorted copy, and recursion stack use O(n). Output storage is Θ(n times the number of unique permutations).

## Alternatives and tradeoffs
- A frequency map can choose a value while its remaining count is positive. This directly avoids duplicate positions but requires count bookkeeping.
- Generate all index permutations and deduplicate afterward is simpler to state but can explore n! duplicate-heavy leaves and retain a set.
- In-place swapping can reduce auxiliary arrays but makes duplicate skipping and restoration harder to audit.

## Common mistakes and gotchas
- Using the subset rule i > start is incorrect because permutations do not have a monotonically increasing input index.
- Skipping equal values even when the previous copy is already used removes valid repeated runs.
- Omitting sorting makes the adjacent-equality check invalid.
- Forgetting to copy the completed path makes stored answers mutable aliases.

## Edge-case tests
- All values distinct: n! results.
- All values equal: one result.
- A pair plus a singleton: three unique orders for [1,1,2].
- Negative and positive duplicates behave identically because only ordering and equality matter.

## Reflection questions
1. Why does the rule use !used[i-1]?
2. How would the frequency-map version represent the recursive state?
3. For frequencies 2 and 1, how many unique permutations exist, and why?

## Source
- [Permutations II](https://leetcode.com/problems/permutations-ii/)
