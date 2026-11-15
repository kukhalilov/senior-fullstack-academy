# timed mock interviews and spaced problem rehearsal — Problem: Jump Game II

## Goals
- Interpret each value as a maximum forward jump length.
- Derive the greedy reachable-layer invariant.
- Contrast the linear frontier method with dynamic programming.

## Problem statement
Given a nonempty array of nonnegative integers, start at index 0 and return the minimum number of jumps needed to reach the last index. Each value limits how far forward that index can jump. The input guarantees the last index is reachable.

## Input constraints
- `1 <= nums.Length <= 10,000`.
- `0 <= nums[i] <= 1,000`.
- The destination is always reachable.

## Examples with expected output
- `[2,3,1,1,4] -> 2`.
- `[2,3,0,1,4] -> 2`.
- `[0] -> 0`.

## Clarifying assumptions
- A jump can land on any index from the current index through `i + nums[i]`, capped at the final index.
- The array length is at least one; a one-element input already reaches its destination.
- Reachability is guaranteed, so unreachable behavior is outside the required contract.

## Progressive hints
1. A DP baseline stores the minimum jumps needed to reach each index.
2. Greedy can process all positions reachable with the current number of jumps as one layer.
3. While scanning the layer, compute the farthest endpoint reachable with one additional jump.
4. When the scan reaches the current layer's end, commit one jump and use the next frontier.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int Jump(int[] nums)
    {
        if (nums.Length <= 1) return 0;
        int jumps = 0;
        int currentEnd = 0;
        int farthest = 0;
        for (int i = 0; i < nums.Length - 1; i++)
        {
            farthest = Math.Max(farthest, i + nums[i]);
            if (i == currentEnd)
            {
                jumps++;
                currentEnd = farthest;
                if (currentEnd >= nums.Length - 1) break;
            }
        }
        return jumps;
    }

    static void Check(int expected, int[] nums)
    {
        int actual = Jump(nums);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2, new[] { 2, 3, 1, 1, 4 });
        Check(2, new[] { 2, 3, 0, 1, 4 });
        Check(0, new[] { 0 });
        Check(1, new[] { 1, 0 });
        Check(3, new[] { 1, 1, 1, 1 });
        Check(1, new[] { 5, 0, 0, 0, 0, 0 });
        Console.WriteLine("Jump Game II checks passed.");
    }
}
```

## Correctness argument
At the start of a layer, `currentEnd` is the farthest index reachable with `jumps` jumps, and every index through it has been considered reachable within that jump count by the construction of prior layers. Scanning those indices computes `farthest`, the maximum endpoint reachable with one more jump. When the scan reaches `currentEnd`, all choices from the current layer have been examined, so extending to `farthest` is the next complete reachable layer. The earliest layer reaching the final index therefore gives the minimum jump count. The reachability guarantee ensures each frontier advances until the destination.

## Step-by-step dry run
For `[2,3,1,1,4]`, the first layer ends at 0. At index 0, `farthest=2`; commit jump 1, so the next layer ends at 2. Scanning indices 1 and 2 extends `farthest` to 4. At index 2, commit jump 2 and reach the destination.

## Time complexity
O(n), each index before the destination is scanned once.

## Space complexity
O(1) auxiliary space.

## Alternatives and tradeoffs
- DP computes `dp[j] = min(dp[j], dp[i] + 1)` for each reachable `j`; simple to derive but O(n²) time.
- A BFS over indices explains the graph interpretation but can still examine O(n²) edges.
- Greedy compresses each BFS layer into a contiguous reachable interval, which is the key proof obligation.

## Common mistakes and gotchas
- Incrementing the jump count whenever a farther endpoint is found instead of only at the layer boundary.
- Scanning beyond the current layer and accidentally using more than one jump without counting it.
- Returning 1 for a single-element array.
- Assuming an index is reachable without the problem's guarantee when adapting this code to another contract.
- Failing to show why all indices in a layer can be considered, rather than only its endpoint.

## Edge-case tests
- Single element.
- One jump directly to the end.
- Minimum jumps despite a zero inside the array.
- A chain of one-step jumps.
- Several choices with different farthest endpoints.

## Reflection questions
1. How does the loop represent BFS layers without a queue?
2. Why is it safe to commit the jump only at `currentEnd`?
3. How must the code change if reachability is not guaranteed?

## Source
- [Jump Game II](https://leetcode.com/problems/jump-game-ii/)
