# knapsack, subset-sum, and resource-allocation DP — Problem: Last Stone Weight II

## Goals
- Reframe repeated smash operations as assigning each stone to one of two signed groups.
- Find a reachable subset sum closest to half the total.
- Explain why the minimum remaining weight equals a partition difference.

## Problem statement

Each turn choose stones with weights `x <= y`: equal stones both disappear; otherwise x disappears and y becomes `y-x`. Return the smallest possible final stone weight, or 0 if none remain.

## Input constraints
- `1 <= stones.Length <= 30`.
- `1 <= stones[i] <= 100`.

## Examples with expected output
- `[2,7,4,1,8,1] -> 1`.
- `[31,26,33,21,40] -> 5`.
- `[2,2] -> 0`.

## Clarifying assumptions

The final value is the absolute difference between the total weight assigned a positive sign and the total assigned a negative sign. Let total S and one group's sum be x; the difference is `|S-2x|`. Because x and S-x are symmetric, it suffices to find the largest reachable x at most floor(S/2). The maximum total is 3000.

## Progressive hints
1. Choose a subset for one side; all remaining stones form the other side.
2. The resulting difference is `S-2*x` if x is at most S/2.
3. Compute reachable subset sums up to S/2 with 0/1 descending updates and select the largest reachable sum.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static int LastStoneWeightII(int[] stones)
    {
        int total = 0;
        foreach (int stone in stones) total += stone;
        int half = total / 2;
        var reachable = new bool[half + 1];
        reachable[0] = true;
        foreach (int stone in stones)
            for (int sum = half; sum >= stone; sum--)
                reachable[sum] |= reachable[sum - stone];

        for (int best = half; best >= 0; best--)
            if (reachable[best]) return total - 2 * best;
        throw new InvalidOperationException("The empty subset must always be reachable.");
    }

    static void Check(int expected, int[] stones)
    {
        int actual = LastStoneWeightII(stones);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(1, new[] { 2, 7, 4, 1, 8, 1 });
        Check(5, new[] { 31, 26, 33, 21, 40 });
        Check(0, new[] { 2, 2 });
        Check(1, new[] { 1 });
        Console.WriteLine("Last Stone Weight II checks passed.");
    }
}
```

## Correctness argument

For any fixed order of the stones, repeatedly smashing the current remaining stone with the next one can produce the absolute value of a signed sum of all stones seen so far. Inductively, if the current value is `|A|`, smashing it with weight `w` yields `||A|-w|`; this is the absolute value of either `A-w` or `A+w` after choosing the sign of the new stone and, if needed, flipping every earlier sign (which does not change the absolute value). Conversely, every smash sequence expands to a signed sum: each smash subtracts one operand from the other, so the original stones in the two operands receive opposite signs. Therefore the minimum achievable remainder equals the minimum absolute signed sum, or equivalently the minimum partition difference.

For a partition whose one side has sum x and total is S, that difference is `|S-2x|`. The smaller of x and S-x is at most S/2 and has the same difference, so it suffices to find the largest reachable subset sum x no greater than half. The descending Boolean DP computes exactly those 0/1 subset sums, using each stone once. Maximizing x up to half minimizes `S-2x`, yielding the minimum possible final weight.

## Step-by-step dry run

For `[2,7,4,1,8,1]`, S=23 and half=11. Reachable sums include 11 (for example 7+4) and no greater sum is considered. The best difference is `23-2*11=1`.

## Time complexity

`O(nS)`, where n is stone count and S is total weight, bounded by 90,000 state updates.

## Space complexity

`O(S)` Boolean values up to `floor(S/2)`.

## Edge-case tests
- Both official examples are asserted.
- Equal stones can cancel to zero.
- A single stone remains its own weight.
- The empty subset is always reachable, so a result exists.

## Reflection questions
1. Why is the closest reachable subset sum to half optimal?
2. Why is the DP target floor(S/2) rather than S?
3. How does the mathematical interpretation avoid simulating every possible smash order?

Source: [LeetCode: Last Stone Weight II](https://leetcode.com/problems/last-stone-weight-ii/).
