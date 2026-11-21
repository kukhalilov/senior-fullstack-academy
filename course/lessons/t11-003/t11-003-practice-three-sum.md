# two-pointer and sliding-window techniques — Problem: 3Sum

## Goals

- Reduce a triplet search to a fixed value plus a sorted two-pointer pair scan.
- Skip duplicates without omitting a distinct value triplet.
- Separate time complexity, sorting-copy space, and returned-output space.

## Problem statement

Given an integer array nums, return all unique triplets `[nums[i], nums[j], nums[k]]` where the indices are pairwise distinct and the three values sum to zero. The result must not contain duplicate triplets. Result order does not matter.

## Input constraints

- 3 <= nums.Length <= 3,000.
- -100,000 <= nums[i] <= 100,000.
- Input may contain duplicate values and any sign.
- The implementation preserves the input array by sorting a copy.

## Examples with expected output

1. nums = [-1,0,1,2,-1,-4] -> [[-1,-1,2],[-1,0,1]].
2. nums = [0,1,1] -> [].
3. nums = [0,0,0] -> [[0,0,0]].
4. nums = [-2,0,1,1,2] -> [[-2,0,2],[-2,1,1]].

## Clarifying assumptions

- Triplets are considered duplicates by their values, not by which equal-valued input positions supplied them.
- Each accepted triplet uses three distinct indices; the pointer positions guarantee this.
- Sorting each output triplet internally is allowed, and the returned triplets are in nondecreasing order.
- The method does not mutate nums. A copy is used so callers can rely on their input order remaining intact.

## Progressive hints

1. Sort a copy. Fix one value at index i and look for two later values whose sum is its negation.
2. Use opposite pointers in the sorted suffix. If the total is too small, increase the low value; if too large, decrease the high value.
3. When a triplet is found, move both pointers and skip repeated endpoint values.
4. Also skip repeated fixed values. Consider whether a positive fixed value can begin any zero-sum triplet after sorting.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static IList<IList<int>> ThreeSum(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        var result = new List<IList<int>>();
        if (nums.Length < 3) return result;

        int[] sorted = (int[])nums.Clone();
        Array.Sort(sorted);

        for (int i = 0; i < sorted.Length - 2; i++)
        {
            if (i > 0 && sorted[i] == sorted[i - 1]) continue;
            if (sorted[i] > 0) break;

            int left = i + 1;
            int right = sorted.Length - 1;
            while (left < right)
            {
                long sum = (long)sorted[i] + sorted[left] + sorted[right];
                if (sum < 0)
                {
                    left++;
                }
                else if (sum > 0)
                {
                    right--;
                }
                else
                {
                    result.Add(new List<int> { sorted[i], sorted[left], sorted[right] });
                    int lowValue = sorted[left];
                    int highValue = sorted[right];
                    left++;
                    right--;
                    while (left < right && sorted[left] == lowValue) left++;
                    while (left < right && sorted[right] == highValue) right--;
                }
            }
        }
        return result;
    }

    private static string Key(IList<int> triple) => string.Join(",", triple);

    private static void AssertTriplets(IList<IList<int>> actual, string[] expected, string label)
    {
        var actualKeys = new List<string>();
        foreach (IList<int> triple in actual) actualKeys.Add(Key(triple));
        actualKeys.Sort(StringComparer.Ordinal);
        Array.Sort(expected, StringComparer.Ordinal);
        if (actualKeys.Count != expected.Length)
            throw new InvalidOperationException(label + " returned the wrong number of triplets.");
        for (int i = 0; i < expected.Length; i++)
            if (actualKeys[i] != expected[i])
                throw new InvalidOperationException(label + " returned incorrect triplets.");
    }

    public static void Main()
    {
        int[] first = { -1, 0, 1, 2, -1, -4 };
        int[] original = (int[])first.Clone();
        AssertTriplets(ThreeSum(first), new[] { "-1,-1,2", "-1,0,1" }, "Example 1");
        for (int i = 0; i < first.Length; i++)
            if (first[i] != original[i]) throw new InvalidOperationException("Input was mutated.");
        AssertTriplets(ThreeSum(new[] { 0, 1, 1 }), Array.Empty<string>(), "Example 2");
        AssertTriplets(ThreeSum(new[] { 0, 0, 0 }), new[] { "0,0,0" }, "Example 3");
        AssertTriplets(ThreeSum(new[] { -2, 0, 1, 1, 2 }), new[] { "-2,0,2", "-2,1,1" }, "Repeated values");
        Console.WriteLine("All 3Sum checks passed.");
    }
}
```

## Correctness argument

Sorting preserves the multiset of values and lets the scan use order. For a fixed i, if the current total is below zero, every smaller right-side value would also produce a total below zero, so left cannot be part of a solution with the current i and right; advancing left is safe. If the total is above zero, every larger left-side value would keep the total above zero, so decrementing right is safe. When the total is zero, the three distinct indices form a valid triplet.

Skipping a fixed value equal to its previous sorted neighbor avoids solving the same value-based subproblem twice. After recording a match, skipping all equal low and high endpoint values avoids emitting the same value triple again. Every distinct triplet has a smallest sorted value chosen as some fixed i and its other two values in the remaining suffix, so the scan can find it. No emitted triple is duplicated, and every emitted triple sums to zero with distinct indices; therefore the returned set is exactly the required set.

If the fixed value is positive, both remaining sorted values are at least as large, so their sum with it is positive; breaking is safe.

## Step-by-step dry run

For sorted `[-4,-1,-1,0,1,2]`, skip the second `-1` as a fixed value after the first has already been processed:

| fixed | left | right | total | action |
|---:|---:|---:|---:|---|
| -1 at index 1 | -1 | 2 | 0 | Emit `[-1,-1,2]`; move both and skip repeated -1 |
| -1 at index 1 | 0 | 1 | 0 | Emit `[-1,0,1]`; move inward |
| 0 at index 3 | 1 | 2 | 3 | Too large; move right; scan ends |

The fixed `-4` scan finds no match; the repeated fixed `-1` is skipped. The two emitted value triplets are unique.

## Time complexity

O(n²): sorting costs O(n log n); each of O(n) fixed indices performs an O(n) two-pointer scan.

## Space complexity

O(n) for the sorted copy, plus O(r) returned triplets, where r is the number of unique answers. The scan itself uses O(1) additional state. If mutation were allowed, sorting nums directly would avoid the copy, but that would change the input.

## Alternatives and tradeoffs

- For each fixed index, a hash set can search complements in expected O(n), yielding expected O(n²) time but typically O(n) temporary memory and more complex duplicate control.
- A brute-force triple loop is O(n³); for tiny arrays it is a useful independent oracle, but it does not fit the stated upper bound well.
- Generalizing to a target T changes the comparison from zero to T and must use a sufficiently wide sum type. The duplicate and sorted-elimination reasoning stays the same.

## Common mistakes and gotchas

- Skipping duplicates before a triplet match without ensuring one representative is still considered.
- Forgetting to skip repeated fixed anchors or repeated endpoints, producing duplicate triplets.
- Moving only one pointer after a match without making progress on both sides.
- Reusing the fixed index as a pointer; start left at i + 1.
- Summing three arbitrary 32-bit integers in `int` in generalized versions; widen before adding.
- Assuming the output order is prescribed. The problem allows any order, though sorting makes reasoning and tests easier.
- Sorting the input array when the method contract or caller expects it unchanged.

## Edge-case tests

- All values positive or all values negative.
- Exactly one zero-sum triplet.
- All zeroes: emit one `[0,0,0]`, regardless of their multiplicity beyond three.
- Many duplicate values with multiple possible index combinations but only one value triplet.
- A match requiring two equal values, such as `[-2,1,1]`.
- No mutation of the caller's input.

## Reflection questions

1. What ordering fact justifies moving left when the total is too small?
2. Why does skipping duplicate values preserve one valid representative of each value triplet?
3. Why is the complexity quadratic rather than cubic despite the fixed-index loop and inner scan?
4. How would you adapt the algorithm if it needed all index triples rather than unique value triples?

Source: [LeetCode: 3Sum](https://leetcode.com/problems/3sum/).
