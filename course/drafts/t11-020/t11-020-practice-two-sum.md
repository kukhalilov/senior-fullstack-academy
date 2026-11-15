# hash maps and frequency tables — Problem: Two Sum

## Goals
- Replace pairwise search with complement lookup.
- Preserve distinct-index semantics when values repeat.
- Explain expected hash-table cost and the one-pass invariant.

## Problem statement
Given an integer array `nums` and integer `target`, return indices of two different elements whose values sum to `target`. Exactly one solution exists; return the two indices in either order.

## Input constraints
- `2 <= nums.Length <= 10,000`.
- `-1,000,000,000 <= nums[i], target <= 1,000,000,000`.
- Exactly one answer exists.

## Examples with expected output
- `[2,7,11,15]`, target 9 -> `[0,1]`.
- `[3,2,4]`, target 6 -> `[1,2]`.
- `[3,3]`, target 6 -> `[0,1]`.

## Clarifying assumptions
- Return original positions, not the values.
- The same array position cannot be used twice, though equal values at distinct positions are valid.
- Input need not be sorted and should not be reordered.

## Progressive hints
1. A direct pair scan is O(n²) and is a useful baseline.
2. For current value x, the required earlier value is target-x.
3. Store each previously seen value's index in a dictionary.
4. Check for the complement before inserting the current value, which prevents reusing the same element.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int[] TwoSum(int[] nums, int target)
    {
        var indexByValue = new Dictionary<int, int>();
        for (int i = 0; i < nums.Length; i++)
        {
            long complement = (long)target - nums[i];
            if (complement >= int.MinValue && complement <= int.MaxValue &&
                indexByValue.TryGetValue((int)complement, out int earlierIndex))
                return new[] { earlierIndex, i };

            indexByValue[nums[i]] = i;
        }
        throw new ArgumentException("The input is guaranteed to have one solution.", nameof(nums));
    }

    static void Check(int[] expected, int[] nums, int target)
    {
        int[] actual = TwoSum(nums, target);
        if (actual.Length != 2 || actual[0] == actual[1] ||
            nums[actual[0]] + (long)nums[actual[1]] != target ||
            !expected.Order().SequenceEqual(actual.Order()))
            throw new InvalidOperationException("Two Sum check failed.");
    }

    static void Main()
    {
        Check(new[] { 0, 1 }, new[] { 2, 7, 11, 15 }, 9);
        Check(new[] { 1, 2 }, new[] { 3, 2, 4 }, 6);
        Check(new[] { 0, 1 }, new[] { 3, 3 }, 6);
        Check(new[] { 0, 1 }, new[] { int.MinValue, int.MaxValue }, -1);
        Console.WriteLine("Two Sum checks passed.");
    }
}
```

## Correctness argument
Before index `i` is processed, the dictionary contains values from earlier indices and maps each to an earlier occurrence. If the required complement is present, that stored index differs from `i` and the two values sum to target, so the returned pair is valid. If no earlier complement exists, inserting the current value makes it available to later indices. Any valid pair has a later index; when that index is reached, its earlier partner is in the dictionary, so the algorithm finds a solution.

## Step-by-step dry run
For `[3,2,4]`, target 6: at index 0, complement 3 is absent, so store `3 -> 0`. At index 1, complement 4 is absent, so store `2 -> 1`. At index 2, complement 2 maps to index 1; return `[1,2]`.

## Time complexity
Expected O(n) dictionary operations; worst-case can degrade with pathological collisions. The range guard on the long complement also makes the code safe if constraints later widen.

## Space complexity
O(n) for stored values and indices.

## Alternatives and tradeoffs
- Pairwise enumeration is O(n²) time and O(1) extra space, but simpler and deterministic.
- Sort value-index pairs and use two pointers in O(n log n); it needs O(n) storage for original indices and sorting.
- A dictionary is the direct complement-lookup solution and preserves input order.

## Common mistakes and gotchas
- Inserting before checking, which can match an element with itself when `target == 2 * nums[i]`.
- Returning values instead of indices.
- Storing a set instead of a value-to-index mapping.
- Assuming uniqueness of values; the input guarantees a unique pair, not unique array values.

## Edge-case tests
- Equal values at separate positions.
- Negative values and negative target.
- Partner appears immediately before current value.
- Extreme int values under the stated bounds.

## Reflection questions
1. What does the dictionary contain at the start of iteration i?
2. Why does checking before insertion prevent index reuse?
3. Which hash-table complexity claim is expected rather than worst-case guaranteed?

## Source
- [Two Sum](https://leetcode.com/problems/two-sum/)
