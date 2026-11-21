# greedy choices, invariants, and correctness proofs — Problem: Jump Game

## Goals
- Decide whether the last array index is reachable from index zero.
- Maintain the farthest index reachable from the scanned prefix.
- Prove that positions behind the frontier are dominated by the reachability summary.

## Problem statement
You start at index 0. Each nonnegative array value gives the maximum forward jump length from that position. Return true if some sequence of jumps reaches the last index, otherwise false.

## Input constraints

- 1 <= nums.Length <= 10,000.
- 0 <= nums[i] <= 100,000.

## Examples with expected output

- [2,3,1,1,4] -> true.
- [3,2,1,0,4] -> false.
- [0] -> true.

## Clarifying assumptions

- A jump may be any integer distance from 1 through nums[i]; reaching the current index needs no additional jump.
- The start and destination are both index zero when the array has one element.
- Return reachability only; the path or minimum jump count is not requested.

## Progressive hints

1. A position is useful only if some already reachable position can jump to it.
2. Track the farthest reachable endpoint.
3. If the scan reaches an index beyond that endpoint, no path reaches the destination.
4. Clamp addition to the final index if generalizing to values that might overflow.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static bool CanJump(int[] nums)
    {
        if (nums.Length == 0) return false;
        int last = nums.Length - 1;
        int farthest = 0;

        for (int i = 0; i <= farthest && i < nums.Length; i++)
        {
            farthest = Math.Max(farthest, i + nums[i]);
            if (farthest >= last) return true;
        }
        return last == 0;
    }

    static void Check(bool expected, bool actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(true, CanJump(new[] { 2, 3, 1, 1, 4 }));
        Check(false, CanJump(new[] { 3, 2, 1, 0, 4 }));
        Check(true, CanJump(new[] { 0 }));
        Check(true, CanJump(new[] { 1, 0 }));
        Check(false, CanJump(new[] { 0, 1 }));
        Check(false, CanJump(Array.Empty<int>()));
        Console.WriteLine("Jump Game checks passed.");
    }
}
```

## Correctness argument

At the beginning of each iteration, every index at or before farthest has been shown reachable, and no scanned reachable index can extend beyond the current farthest. If i is within this prefix, any jump from i extends the reachable prefix to i+nums[i]; taking the maximum preserves the invariant. If i exceeds farthest, no reachable position can reach i, so later indices are unreachable too. The algorithm returns true once the frontier reaches the destination. If scanning stops before then, the destination is outside the reachable prefix and false is correct. The one-element case is already at its destination.

## Step-by-step dry run

For [3,2,1,0,4], start with farthest=0. Index 0 extends the frontier to 3. Indices 1, 2, and 3 are within the reachable prefix, but their jumps do not extend it past 3. The loop ends before index 4, so the destination cannot be reached.

## Time complexity

O(n) time, scanning each reachable index at most once.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- A Boolean DP array marks reachable positions, costing O(n²) time in a direct transition implementation and O(n) space.
- BFS over indices can produce minimum jump count, but is unnecessary for a yes/no question; a range-frontier BFS can also be linear.
- Backward greedy can track the leftmost index that reaches the current goal; it is also O(n) time and O(1) space but expresses a different invariant.

## Common mistakes and gotchas

- Updating reachability from an index that is itself unreachable.
- Stopping when farthest equals the current index even though it may still be the last index.
- Returning false for [0], whose start is already the destination.
- Confusing this problem with minimum-jumps; the same frontier alone does not directly return a path.

## Edge-case tests

- Single position.
- A zero at the start with additional positions.
- A reachable frontier followed by zeros.
- A jump that reaches exactly the last index.
- Empty defensive input returns false although it is outside the stated constraints.

## Reflection questions

1. What exactly does farthest summarize?
2. Why are all indices between the current scan index and farthest reachable?
3. What extra state would a minimum-jump solution need?

## Source

- [Jump Game](https://leetcode.com/problems/jump-game/)
