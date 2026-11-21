# backtracking, subsets, permutations, and combinations — Problem: Combination Sum

## Goals
- Enumerate unique combinations of positive, distinct candidates that sum to a target.
- Model reuse with a nondecreasing candidate-index sequence.
- Prune safely because all candidate values are positive.

## Problem statement
Given distinct positive integers candidates and a positive target, return all unique combinations whose values sum to target. A candidate may be chosen unlimited times. Combinations are considered the same regardless of order.

## Input constraints

For this exercise there are 1 to 30 candidates, candidate values are 2 to 40, and target is 1 to 40.

## Examples with expected output
Input: candidates [2,3,6,7], target 7
Expected output: [[2,2,3],[7]]

Input: candidates [2,3,5], target 8
Expected output: [[2,2,2,2],[2,3,3],[3,5]]

## Clarifying assumptions
- All candidates are distinct and positive.
- A candidate can be reused any number of times.
- Output combinations need not be ordered, but the search emits each in nondecreasing order.

## Progressive hints
1. Keep a remaining sum and a path.
2. Start each recursive scan at a candidate index so a combination cannot later go backward to a smaller candidate.
3. Recurse using the same index to allow reuse.
4. Since candidates are positive and sorted, stop scanning after a candidate exceeds the remaining target.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<int>> CombinationSum(int[] candidates, int target)
    {
        int[] values = (int[])candidates.Clone();
        Array.Sort(values);
        var result = new List<IList<int>>();
        var path = new List<int>();

        void Search(int start, int remaining)
        {
            if (remaining == 0)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = start; i < values.Length; i++)
            {
                if (values[i] > remaining) break;
                path.Add(values[i]);
                Search(i, remaining - values[i]);
                path.RemoveAt(path.Count - 1);
            }
        }

        Search(0, target);
        return result;
    }

    static string Key(IEnumerable<int> values) => string.Join(",", values);

    static void Main()
    {
        var first = CombinationSum(new[] { 2, 3, 6, 7 }, 7).Select(Key).ToHashSet();
        if (!first.SetEquals(new[] { "2,2,3", "7" })) throw new Exception("Example one mismatch.");
        var second = CombinationSum(new[] { 2, 3, 5 }, 8).Select(Key).ToHashSet();
        if (!second.SetEquals(new[] { "2,2,2,2", "2,3,3", "3,5" })) throw new Exception("Example two mismatch.");
        if (CombinationSum(new[] { 2 }, 1).Count != 0) throw new Exception("Unreachable target should have no results.");
        Console.WriteLine("Combination Sum checks passed.");
    }
}
```

## Correctness argument
Every recursive call maintains a path whose sum is target minus remaining. A candidate is appended only when it does not exceed remaining, and recursion subtracts exactly that value. Therefore, when remaining is zero, the path sums to target. Starting the child search at i permits candidate reuse while forbidding smaller indices later, so each multiset combination has one nondecreasing representation. The loop considers every candidate at least start and only stops when sorted positive values are too large; no later candidate could fit. Thus every valid combination is emitted once.

## Step-by-step dry run
With candidates [2,3,6,7] and target 7, choose 2 and recurse from its same index with 5 remaining. Choose 2 again, leaving 3; choose 2 again, leaving 1, where no candidate fits. Backtrack to the second 2, choose 3, reach zero, and record [2,2,3]. Back at the root, the candidate 7 reaches zero directly. Because choices never move to a smaller index, permutations such as [3,2,2] are not generated separately.

## Time complexity
The number of result combinations can be exponential in target and the smallest candidate. Each result copy costs its length. The search tree also includes partial combinations, so a useful bound is O(B^d·d) for branching factor B no greater than the candidate count and maximum depth d=floor(target/minCandidate); this is an upper bound, not a tight estimate.

## Space complexity
Auxiliary path and recursion depth are O(d), excluding output. Output storage is proportional to the total number of values across all returned combinations.

## Alternatives and tradeoffs
- Dynamic programming can count combinations or determine reachability, but reconstructing all combinations needs predecessor choices and duplicate-order control.
- A frequency-based state is unnecessary here because unlimited reuse is naturally represented by recurring at the same index.
- An explicit candidate sorting copy enables early break and leaves caller input unchanged.

## Common mistakes and gotchas
- Recursing from i+1 incorrectly restricts each candidate to one use.
- Recursing from 0 allows permutations of the same combination to appear.
- Using a loop condition that continues after a sorted candidate exceeds remaining wastes work.
- This pruning is invalid if candidates can be zero or negative; positivity is essential.
- The exact output may be large, so output cost cannot be omitted from complexity discussion.

## Edge-case tests
- A target smaller than every candidate returns no combinations.
- One candidate that divides the target produces one repeated-value combination.
- A candidate equal to target produces a singleton combination.
- Multiple valid decompositions are compared as sets of canonical sorted strings.

## Reflection questions
1. Why is the recursive start index i rather than i+1?
2. Why does sorted order make break safe?
3. What changes if each candidate can be used only once?

## Source
- [Combination Sum](https://leetcode.com/problems/combination-sum/)
