# backtracking, subsets, permutations, and combinations — Problem: Combination Sum II

## Goals
- Generate unique target-sum combinations when input values may repeat.
- Enforce single use by advancing past the selected position.
- Skip duplicate candidates only among sibling choices.
- Use positivity and sorting for safe pruning.

## Problem statement
Given a collection of positive integers that may contain duplicates and a positive target, return each unique combination that sums to target. Each input occurrence may be used at most once.

## Input constraints

The collection length is at most 100, each value is 1 through 50, and target is 1 through 30.

## Examples with expected output
Input: candidates [10,1,2,7,6,1,5], target 8
Expected output: [[1,1,6],[1,2,5],[1,7],[2,6]]

Input: candidates [2,5,2,1,2], target 5
Expected output: [[1,2,2],[5]]

## Clarifying assumptions
- Equal-valued occurrences are interchangeable in output.
- Each occurrence can be selected once; equal values at different indices still allow repeated values in a result.
- The input is copied before sorting.

## Progressive hints
1. Sort the candidates.
2. Recurse from i+1 after selecting index i so that occurrence cannot be reused.
3. At one depth, skip later equal values to avoid equivalent choices.
4. Since values are positive and sorted, stop when the current value exceeds remaining.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<int>> CombinationSum2(int[] candidates, int target)
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
                if (i > start && values[i] == values[i - 1]) continue;
                if (values[i] > remaining) break;

                path.Add(values[i]);
                Search(i + 1, remaining - values[i]);
                path.RemoveAt(path.Count - 1);
            }
        }

        Search(0, target);
        return result;
    }

    static string Key(IEnumerable<int> values) => string.Join(",", values);

    static void Main()
    {
        var first = CombinationSum2(new[] { 10, 1, 2, 7, 6, 1, 5 }, 8).Select(Key).ToHashSet();
        if (!first.SetEquals(new[] { "1,1,6", "1,2,5", "1,7", "2,6" }))
            throw new Exception("Example one mismatch.");
        var second = CombinationSum2(new[] { 2, 5, 2, 1, 2 }, 5).Select(Key).ToHashSet();
        if (!second.SetEquals(new[] { "1,2,2", "5" })) throw new Exception("Example two mismatch.");
        if (CombinationSum2(new[] { 1, 1, 1 }, 4).Count != 0) throw new Exception("Impossible target should be empty.");
        Console.WriteLine("Combination Sum II checks passed.");
    }
}
```

## Correctness argument
The sorted values and start index ensure the path uses strictly increasing input indices, so no occurrence is reused and values in the path are nondecreasing. Each addition reduces remaining by its positive value; a zero remainder therefore means the path sums to target. The same-depth duplicate check chooses only the first occurrence of an equal value as the next choice at that depth, preventing equivalent branches. Later equal occurrences remain available to deeper calls because the child starts at i+1. Every valid combination corresponds to one increasing sequence of indices, and its equal-value choices have a canonical left-to-right selection, so it is emitted exactly once.

## Step-by-step dry run
Sort [2,5,2,1,2] into [1,2,2,2,5]. For target 5, choose 1, then one 2 and the next 2, reaching zero. At that depth the third equal 2 is skipped as a sibling, but it can be selected deeper when another 2 has already been chosen. Backtracking, choose 5 directly. The result is [1,2,2] and [5], with no duplicate ways to select interchangeable 2 occurrences.

## Time complexity
There are O(2^n) index subsets in the worst case, and each saved combination is copied. A conservative output-sensitive bound is O(n·2^n), plus O(n log n) sorting.

## Space complexity
Auxiliary recursion and path use O(n), excluding output. The output can require O(n·2^n) values in the worst case.

## Alternatives and tradeoffs
- Grouping equal values and selecting a count from zero through each frequency avoids index-level duplicate branches and makes multiplicity explicit.
- A set can deduplicate generated combinations afterward, but still explores duplicate paths.
- Dynamic programming is more suited to reachability or counting than direct enumeration of all combinations.

## Common mistakes and gotchas
- Recursing with i instead of i+1 allows reusing one occurrence.
- Skipping duplicates with i > 0 skips valid repeated values chosen at deeper levels.
- Omitting the same-depth guard emits duplicate combinations.
- Pruning on values > remaining relies on candidates being positive and sorted.
- A solution that mutates the original candidates by sorting them violates the stated input-preservation assumption.

## Edge-case tests
- Target equals one input value: a singleton combination is included.
- Several identical values can be chosen up to their occurrence count.
- Target larger than the sum of all values produces no result.
- Duplicate-rich inputs should have no duplicate canonical output strings.

## Reflection questions
1. Why is the duplicate guard based on i > start?
2. Why must the recursive call use i+1?
3. How would a grouped-frequency recursion encode the same single-use rule?

## Source
- [Combination Sum II](https://leetcode.com/problems/combination-sum-ii/)
