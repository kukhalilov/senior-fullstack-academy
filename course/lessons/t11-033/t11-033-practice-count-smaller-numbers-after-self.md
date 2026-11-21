# Fenwick trees, segment trees, and static range queries — Problem: Count of Smaller Numbers After Self

## Goals

Use coordinate compression and a Fenwick frequency tree while scanning right to left, with strict handling of duplicate values.

## Problem statement

For each array position, count how many strictly smaller values occur to its right. [Official problem statement](https://leetcode.com/problems/count-of-smaller-numbers-after-self/)

## Input constraints

- `1 <= nums.Length <= 100,000`.
- `-10,000 <= nums[i] <= 10,000`.

## Examples with expected output

1. `[5,2,6,1]` → `[2,1,1,0]`.
2. `[-1]` → `[0]`.
3. `[-1,-1]` → `[0,0]`.
4. `[2,1,2]` → `[1,0,0]`.

## Clarifying assumptions

“Smaller” is strict, so equal values to the right are not counted. Compression assigns one rank per distinct value; query ranks strictly below the current value.

## Progressive hints

1. Scan right to left so the tree contains exactly values to the right.
2. Compress values to dense sorted ranks and store frequencies by rank.
3. Query the prefix ending before the current rank, then insert the current value.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;
static IList<int> CountSmaller(int[] nums)
{
    int[] sorted = nums.Distinct().OrderBy(x => x).ToArray();
    var rank = new Dictionary<int, int>();
    for (int i = 0; i < sorted.Length; i++) rank[sorted[i]] = i + 1;
    int[] tree = new int[sorted.Length + 1];
    void Add(int i) { for (; i < tree.Length; i += i & -i) tree[i]++; }
    int Prefix(int i) { int sum = 0; for (; i > 0; i -= i & -i) sum += tree[i]; return sum; }
    int[] answer = new int[nums.Length];
    for (int i = nums.Length - 1; i >= 0; i--)
    {
        int r = rank[nums[i]];
        answer[i] = Prefix(r - 1);
        Add(r);
    }
    return answer;
}
static void Check(int[] actual, int[] expected, string label)
{
    if (!actual.SequenceEqual(expected)) throw new InvalidOperationException("Failed: " + label);
}
Check(CountSmaller(new[] {5,2,6,1}).ToArray(), new[] {2,1,1,0}, "example 1");
Check(CountSmaller(new[] {-1}).ToArray(), new[] {0}, "example 2");
Check(CountSmaller(new[] {-1,-1}).ToArray(), new[] {0,0}, "example 3 duplicates");
Check(CountSmaller(new[] {2,1,2}).ToArray(), new[] {1,0,0}, "strict duplicate comparison");
Console.WriteLine("All count-smaller checks passed.");
```

## Correctness argument

Before processing index `i`, the Fenwick tree contains exactly the values at indices greater than `i`, grouped by their compressed rank. The prefix through rank `r-1` counts exactly those values strictly less than `nums[i]`, excluding equal values at rank `r`. Storing that count gives the required answer for `i`; inserting its rank establishes the invariant for the next position to the left. Induction over the reverse scan proves every output.

## Step-by-step dry run

For `[5,2,6,1]`, start at 1: no values are right of it, answer 0, insert 1. At 6, query ranks below 6 and count 1. At 2, only 1 is smaller, count 1. At 5, values 2 and 1 are smaller, count 2. Result: `[2,1,1,0]`.

## Time complexity

`O(n log n)` expected time, including sorting/compression and Fenwick operations.

## Space complexity

`O(n)` for ranks, tree, and result.

## Edge-case tests

Tests cover the official examples, repeated equal values, and a mixed sequence where strict rank-prefix queries matter.

## Reflection questions

1. Why scan from right to left?
2. Why query `rank-1` rather than `rank`?
3. Could merge-sort counting solve the same problem without coordinate compression?

## Reflection answers

1. Scanning right to left makes the data structure contain exactly the suffix values that are candidates for the current answer.
2. Querying through `rank-1` counts only strictly smaller values; querying through `rank` would also count equal values.
3. Yes. Merge sort can count how many right-half values move before each left-half value while preserving stable ordering, yielding `O(n log n)` time without coordinate compression.
