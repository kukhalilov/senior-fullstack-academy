# bitwise operations, masks, and subset enumeration — Problem: Subsets

## Goals

Map each integer mask to a unique subset and understand why output size makes exponential enumeration unavoidable.

## Problem statement

Given an array of unique integers, return every possible subset (the power set), without duplicate subsets. Output order does not matter. [Official problem statement](https://leetcode.com/problems/subsets/)

## Input constraints

- `1 <= nums.Length <= 10`.
- `-10 <= nums[i] <= 10`.
- All input values are unique.

## Examples with expected output

1. `[1,2,3]` → eight subsets: `[]`, `[1]`, `[2]`, `[1,2]`, `[3]`, `[1,3]`, `[2,3]`, `[1,2,3]` (any order).
2. `[0]` → `[]`, `[0]`.
3. `[-1,2]` → `[]`, `[-1]`, `[2]`, `[-1,2]`.

## Clarifying assumptions

Distinct values mean each subset corresponds to one membership mask. The empty subset is included. The output itself has `2^n` subsets, so exponential output is part of the contract.

## Progressive hints

1. There are two choices for each input position: absent or present.
2. An `n`-bit mask encodes those choices.
3. For each mask from zero to `(1<<n)-1`, inspect bits and copy selected values into a subset.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;
static IList<IList<int>> Subsets(int[] nums)
{
    int count = 1 << nums.Length;
    var result = new List<IList<int>>(count);
    for (int mask = 0; mask < count; mask++)
    {
        var subset = new List<int>();
        for (int i = 0; i < nums.Length; i++)
            if ((mask & (1 << i)) != 0) subset.Add(nums[i]);
        result.Add(subset);
    }
    return result;
}
static string Normalize(IEnumerable<int> values) => string.Join(",", values.OrderBy(x => x));
static void Check(bool condition, string label)
{
    if (!condition) throw new InvalidOperationException("Failed: " + label);
}
var first = Subsets(new[] {1,2,3});
Check(first.Count == 8, "example 1 count");
Check(first.Select(Normalize).Distinct().Count() == 8, "example 1 unique subsets");
Check(first.Any(x => x.Count == 0), "empty subset included");
var second = Subsets(new[] {0});
Check(second.Count == 2 && second.Any(x => x.SequenceEqual(new[] {0})), "example 2");
var third = Subsets(new[] {-1,2});
Check(third.Count == 4 && third.Any(x => x.SequenceEqual(new[] {-1,2})), "negative values");
Console.WriteLine("All Subsets checks passed.");
```

## Correctness argument

Every mask from zero through `2^n-1` has one unique pattern of `n` membership bits, and every subset has exactly one such membership pattern. For a mask, the inner loop adds precisely those elements whose bit is set, so it constructs the represented subset. Since each mask is visited once and the mask-subset mapping is bijective, every subset including empty and full is emitted exactly once.

## Step-by-step dry run

For `[a,b,c]`, mask `000` yields empty; `001` yields `{a}`; `010` yields `{b}`; `011` yields `{a,b}`; and `101` yields `{a,c}`. All eight three-bit masks are visited.

## Time complexity

`O(n2^n)` element checks and worst-case output copying. The output contains `2^n` subset lists and `n2^(n-1)` total element entries.

## Space complexity

`O(n2^n)` for the required output, plus at most `O(n)` temporary subset storage while constructing each entry.

## Edge-case tests

Tests verify the count and uniqueness for the first official example, the empty subset, the zero-valued item, and negative input values.

## Reflection questions

1. Why can't an algorithm return the complete power set in polynomial output space?
2. How would you enumerate subsets recursively without bit masks?
3. What mask width issue appears if the input size equals the integer width?
