<!-- MANUALLY AUTHORED: checked against frozen problem statement, examples, constraints, and source. -->

# arrays and dynamic arrays for algorithmic problem solving — Problem: Move Zeroes

# Goals

- Preserve the relative order of non-zero values while moving every zero to the suffix.
- Use read and write indices to compact values in place.
- Distinguish minimizing auxiliary space from minimizing writes or swaps.
- Prove that swapping the leftmost pending zero with the next non-zero preserves order.

# Problem statement

Given an integer array nums, move every zero to the end while maintaining the relative order of the non-zero values. Modify the input array in place without making a copy.

# Input constraints

- 1 <= nums.Length <= 10,000
- -2^31 <= nums[i] <= 2^31 - 1
- Zero is the value 0; all negative and positive non-zero integers must retain their original order.
- Return value is omitted; the requested result is the mutated input array.

# Examples with expected output

1. [0, 1, 0, 3, 12] → [1, 3, 12, 0, 0]
2. [0] → [0]
3. [1, 2, 3] → [1, 2, 3]
4. [0, 0, -1] → [-1, 0, 0]

# Clarifying assumptions

- “Stable” means the sequence of non-zero values after the operation is exactly the same sequence as before it.
- The array length is unchanged, and all zeroes occupy the final positions.
- “In place” forbids another array proportional to the input size; a constant number of indices and a temporary swap variable are allowed.
- The follow-up asks to minimize the total operations. Swapping each later non-zero into the earliest pending zero performs exactly one swap per non-zero value that must cross a zero.

# Progressive hints

1. Maintain a read index that visits every position and a write index for the next position where a non-zero belongs.
2. When the read value is non-zero, either write it to the write position and advance the write index, or leave it untouched if both indices are equal.
3. A stable compaction solution can then fill all remaining positions with zero.
4. To minimize swaps, track the earliest zero. When a later non-zero appears, swap those positions and advance the zero index. Skipping a swap when both indices match avoids useless self-swaps.

# Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static void MoveZeroes(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));

        int firstZero = 0;
        for (int read = 0; read < nums.Length; read++)
        {
            if (nums[read] == 0)
                continue;

            if (firstZero != read)
            {
                (nums[firstZero], nums[read]) = (nums[read], nums[firstZero]);
            }

            firstZero++;
        }
    }

    private static void AssertEqual(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length)
            throw new InvalidOperationException(label + ": length mismatch.");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i] != expected[i])
                throw new InvalidOperationException(label + ": mismatch at index " + i);
    }

    public static void Main()
    {
        int[] example = { 0, 1, 0, 3, 12 };
        MoveZeroes(example);
        AssertEqual(example, new[] { 1, 3, 12, 0, 0 }, "Example 1");

        int[] one = { 0 };
        MoveZeroes(one);
        AssertEqual(one, new[] { 0 }, "Single zero");

        int[] noZeroes = { 1, 2, 3 };
        MoveZeroes(noZeroes);
        AssertEqual(noZeroes, new[] { 1, 2, 3 }, "No zeroes");

        int[] leadingZeroes = { 0, 0, -1 };
        MoveZeroes(leadingZeroes);
        AssertEqual(leadingZeroes, new[] { -1, 0, 0 }, "Leading zeroes");

        int[] alternating = { 1, 0, 2, 0, 3 };
        MoveZeroes(alternating);
        AssertEqual(alternating, new[] { 1, 2, 3, 0, 0 }, "Stability");
        Console.WriteLine("All Move Zeroes checks passed.");
    }
}
```

# Correctness argument

At the beginning of each iteration, firstZero is the earliest position that has not yet been filled by a processed non-zero; all positions before it contain the already-seen non-zero values in their original order. If nums[read] is zero, the invariant is unchanged. If it is non-zero, every position between firstZero and read - 1 must be a zero: all earlier non-zero values have already been compacted into the prefix. Swapping this non-zero into firstZero extends the compacted prefix by one while moving a zero to read. Since read indices are processed in increasing order, non-zero values enter the prefix in their original order. At the end, all non-zero values form the prefix and every remaining position is zero.

# Step-by-step dry run

Input [0, 1, 0, 3, 12]:

| read | value | action | array after action | firstZero |
|---:|---:|---|---|---:|
| 0 | 0 | skip | [0, 1, 0, 3, 12] | 0 |
| 1 | 1 | swap 0 and 1 | [1, 0, 0, 3, 12] | 1 |
| 2 | 0 | skip | [1, 0, 0, 3, 12] | 1 |
| 3 | 3 | swap 1 and 3 | [1, 3, 0, 0, 12] | 2 |
| 4 | 12 | swap 2 and 4 | [1, 3, 12, 0, 0] | 3 |

# Time complexity

O(n): each element is inspected once and each successful move uses constant work.

# Space complexity

O(1) auxiliary space: the algorithm uses two indices and a constant-size tuple temporary; it allocates no array proportional to input length.

# Alternatives and tradeoffs

- Stable write then fill: scan with read and copy each non-zero to write, then fill [write..n) with zeros. This is also O(n) time and O(1) space and is often easiest to understand. It may perform more writes because it can rewrite values already in place and then write the zero suffix.
- Swap the earliest zero with the next non-zero (solution): retains stable non-zero order and performs one nontrivial swap for each non-zero that has at least one earlier zero. It skips self-swaps.
- Allocate a second array: straightforward stable filtering but uses O(n) extra space and violates the in-place requirement.
- “Minimum operations” can mean assignments, swaps, or writes depending on the cost model. This implementation minimizes necessary nontrivial swaps, but tuple deconstruction in C# still consists of several assignments. State the operation being minimized before claiming a hardware-level minimum.

# Common mistakes and gotchas

- Using a left-to-right swap with an arbitrary non-zero can reorder values. The swap target must be the earliest pending zero.
- Swapping every element with itself creates unnecessary writes. Check firstZero != read.
- Setting positions to zero during a left-to-right scan can erase values that have not yet been read.
- A stable write-pointer solution must fill the suffix with zeroes; otherwise old duplicate non-zero values remain.
- Do not sort the array: sorting moves zeroes but changes the relative order of non-zero elements.
- The literal zero comparison is safe for the full signed integer range; there is no arithmetic that can overflow.

# Edge-case tests

- Single zero and single non-zero.
- No zeroes: array remains unchanged.
- All zeroes: array remains unchanged.
- Zeroes only at the end: no swap is needed.
- Several leading zeroes followed by negatives: order and signs are preserved.
- Alternating zero and non-zero values: final non-zero sequence remains stable.

# Reflection questions

1. What invariant does firstZero represent?
2. Why can every array position between firstZero and read - 1 be assumed zero when a non-zero is found?
3. Compare the swap method’s writes with stable compaction followed by zero fill.
4. How would the algorithm change if non-zero order did not need to be preserved?

Sources: [LeetCode: Move Zeroes](https://leetcode.com/problems/move-zeroes/).
