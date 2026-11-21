# timed mock interviews and spaced problem rehearsal — Problem: Combination Sum III

## Goals
- Generate each increasing combination exactly once.
- Prune branches using both remaining count and achievable sum bounds.
- Explain why no deduplication set is needed.

## Problem statement
Choose exactly `k` distinct numbers from 1 through 9 whose sum is `n`. Return all valid combinations. Each combination is listed in increasing order; result order is unrestricted.

## Input constraints
- `2 <= k <= 9`.
- `1 <= n <= 60`.
- Every selected value is used at most once.

## Examples with expected output
- `k=3, n=7 -> [[1,2,4]]`.
- `k=3, n=9 -> [[1,2,6],[1,3,5],[2,3,4]]` in any order.
- `k=4, n=1 -> []`.

## Clarifying assumptions
- Combinations are sets of distinct values; permutations are not separate answers.
- Values come only from 1 through 9.
- Returning an empty result is correct when the constraints make a combination impossible.

## Progressive hints
1. Use depth-first search to decide whether to append the next candidate.
2. Pass a `start` value and recurse with `candidate + 1`; this enforces increasing order and uniqueness.
3. Stop if too few candidates remain to fill the combination.
4. Before recursion, compare the remaining target to the smallest and largest sums possible with the remaining slots.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<int>> CombinationSum3(int k, int n)
    {
        var result = new List<IList<int>>();
        var path = new List<int>();

        void Search(int start, int remainingCount, int remainingSum)
        {
            if (remainingCount == 0)
            {
                if (remainingSum == 0) result.Add(path.ToArray());
                return;
            }

            if (10 - start < remainingCount) return;

            int minimumPossible = remainingCount * (2 * start + remainingCount - 1) / 2;
            int maximumPossible = remainingCount * (19 - remainingCount) / 2;
            if (remainingSum < minimumPossible || remainingSum > maximumPossible) return;

            int last = 9 - remainingCount + 1;
            for (int candidate = start; candidate <= last; candidate++)
            {
                if (candidate > remainingSum) break;
                path.Add(candidate);
                Search(candidate + 1, remainingCount - 1, remainingSum - candidate);
                path.RemoveAt(path.Count - 1);
            }
        }

        Search(1, k, n);
        return result;
    }

    static string Normalize(IEnumerable<IList<int>> values) =>
        string.Join("|", values.Select(x => string.Join(',', x)).OrderBy(x => x, StringComparer.Ordinal));

    static void Check(string expected, int k, int n)
    {
        string actual = Normalize(CombinationSum3(k, n));
        if (!StringComparer.Ordinal.Equals(expected, actual))
            throw new InvalidOperationException($"Expected '{expected}', got '{actual}'.");
    }

    static void Main()
    {
        Check("1,2,4", 3, 7);
        Check("1,2,6|1,3,5|2,3,4", 3, 9);
        Check("", 4, 1);
        Check("1,2,3,4,5,6,7,8,9", 9, 45);
        Check("", 2, 18);
        Check("1,9|2,8|3,7|4,6", 2, 10);
        Console.WriteLine("Combination Sum III checks passed.");
    }
}
```

## Correctness argument
Each recursive choice is at least `start`; the next call begins at `candidate+1`, so selected values are strictly increasing and no value can repeat. Every valid combination has one increasing order and each of its next values lies in the loop's range, so DFS reaches it exactly once. When no slots remain, the path is emitted exactly when its sum equals the target. The lower and upper sum bounds are the sums of the smallest and largest possible `remainingCount` candidates from the available suffix; pruning outside those bounds cannot discard a valid solution.

## Step-by-step dry run
For `k=3,n=7`, choose 1, leaving two slots and sum 6. Choose 2, leaving one slot and sum 4. Candidate 3 leaves 1 and cannot complete; candidate 4 reaches zero with zero slots, so `[1,2,4]` is emitted. Backtracking explores other increasing choices without permuting the same set.

## Time complexity
O(V * k) including copying each emitted combination, where V is the number of explored search nodes; pruning reduces V but worst-case enumeration remains combinatorial and is bounded here by subsets of nine values.

## Space complexity
O(k) recursion/path space, excluding the output; output size is proportional to the number of combinations times k.

## Alternatives and tradeoffs
- Enumerate all 2^9 subsets and filter by size/sum: very simple and bounded, but does not demonstrate incremental pruning.
- Dynamic programming can determine whether sums are achievable, but reconstructing all distinct combinations needs extra bookkeeping and is unnecessary for this tiny fixed candidate set.
- Backtracking is direct and permits count/sum pruning.

## Common mistakes and gotchas
- Reusing the same candidate by recursing with `candidate` instead of `candidate+1`.
- Producing permutations of the same combination.
- Emitting a path when the target sum is reached but too many slots remain.
- Using an incorrect maximum-sum formula; the largest `r` values available are 10-r through 9, whose sum is `r*(19-r)/2`.
- Failing to backtrack after each branch.

## Edge-case tests
- No feasible sum below the minimum.
- Minimum combination for k=9 (sum 45).
- Largest sum for k=2 (17); 18 is impossible.
- A combination including both 1 and 9.
- Multiple answers for the same k and n.

## Reflection questions
1. Why does increasing candidate order remove the need for a deduplication set?
2. Derive the minimum and maximum possible remaining sums.
3. Why must sum equality and remaining count both be satisfied at a leaf?

## Source
- [Combination Sum III](https://leetcode.com/problems/combination-sum-iii/)
