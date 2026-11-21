# dynamic programming states, recurrences, and tabulation — Problem: Min Cost Climbing Stairs

## Goals
- Minimize paid step costs while reaching the position just past the final stair.
- Model each position by the minimum cost paid to arrive there.
- Handle the choice of starting from step zero or one and the top boundary.

## Problem statement
For each stair i, cost[i] is paid when stepping onto that stair. After paying, move one or two positions. You may start at step 0 or step 1. Return the minimum total cost to reach position n, just past the last stair.

## Input constraints
- 2 <= cost.Length <= 1,000.
- 0 <= cost[i] <= 999.

## Examples with expected output
- [10,15,20] -> 15.
- [1,100,1,1,1,100,1,1,100,1] -> 6.
- [0,0] -> 0.

## Clarifying assumptions
- Starting at step 0 or 1 incurs that step's cost.
- Reaching the top at index n has no extra cost.
- You may jump from the last step directly to the top.

## Progressive hints
1. Let dp[i] be the minimum cost to arrive at position i after paying costs for steps entered.
2. For i>=2, arrive from i-1 or i-2.
3. The top position n is reached from n-1 or n-2; it has no stair cost.
4. Only two prior dp values are needed.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int MinCostClimbingStairs(int[] cost)
    {
        if (cost.Length < 2) throw new ArgumentException("At least two stairs are required.", nameof(cost));
        int twoBack = cost[0];
        int oneBack = cost[1];

        for (int step = 2; step < cost.Length; step++)
        {
            int current = cost[step] + Math.Min(twoBack, oneBack);
            twoBack = oneBack;
            oneBack = current;
        }
        return Math.Min(twoBack, oneBack);
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(15, MinCostClimbingStairs(new[] { 10, 15, 20 }));
        Check(6, MinCostClimbingStairs(new[] { 1, 100, 1, 1, 1, 100, 1, 1, 100, 1 }));
        Check(0, MinCostClimbingStairs(new[] { 0, 0 }));
        Check(1, MinCostClimbingStairs(new[] { 1, 2 }));
        Console.WriteLine("Min Cost Climbing Stairs checks passed.");
    }
}
```

## Correctness argument

For each stair i, let dp[i] be the minimum cost paid to arrive at i, including cost[i]. The allowed start positions give dp[0]=cost[0] and dp[1]=cost[1]. For i>=2, the last move comes from i-1 or i-2, so the optimal arrival cost is cost[i]+min(dp[i-1],dp[i-2]). The top at index n is not a paid stair; its minimum cost is min(dp[n-1],dp[n-2]). The loop stores the two preceding values and applies this recurrence, so it returns the minimum over both legal final steps.

## Step-by-step dry run

For [10,15,20], dp[0]=10 and dp[1]=15. The cost to arrive at stair 2 is 20+min(10,15)=30. The top can be reached from stair 1 at cost 15 or stair 2 at cost 30, so the answer is 15.

## Time complexity

O(n), where n is the number of stairs.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- A dp array with an explicit top state is easier to trace and generalizes to reconstructing the chosen steps.
- Forward DP can seed the two legal starting positions and relax one- and two-step moves.
- Memoized recursion follows the recurrence but uses O(n) call depth.

## Common mistakes and gotchas

- Paying a cost for the top position, which is not part of the cost array.
- Requiring the route to step on the final stair rather than allowing a two-step jump over it.
- Initializing both first states with the same stair cost.
- Returning dp[n-1] instead of the minimum cost to either last stair.

## Edge-case tests

- Two stairs: choose the cheaper allowed start and jump to top.
- Equal zero-cost stairs.
- A cheap route may skip the last stair.
- Maximum length and cost remain well within Int32.

## Reflection questions
1. Why does the top have no associated step cost?
2. Why are there two final predecessor states?
3. How would you reconstruct the exact sequence of paid stairs?

## Source
- [Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/)
