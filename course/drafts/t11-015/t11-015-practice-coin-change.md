# dynamic programming states, recurrences, and tabulation — Problem: Coin Change

## Goals
- Find the fewest unlimited-use coins whose values sum to an amount.
- Represent unreachable amounts without confusing them with large valid answers.
- Derive and evaluate a minimization recurrence.

## Problem statement
Given distinct positive coin denominations and a target amount, return the fewest coins needed to form that amount. Return -1 if it cannot be formed. There are unlimited coins of each denomination.

## Input constraints
- 1 <= coins.Length <= 12.
- 1 <= coins[i] <= Int32.MaxValue.
- 0 <= amount <= 10,000.

## Examples with expected output
- coins=[1,2,5], amount=11 -> 3.
- coins=[2], amount=3 -> -1.
- coins=[1], amount=0 -> 0.

## Clarifying assumptions
- Coin denominations are positive; zero or negative denominations would invalidate progress.
- Coin order does not create different answers; only the minimum count is requested.
- The input denomination array is not modified.

## Progressive hints
1. Let dp[x] be the fewest coins for amount x.
2. The final coin has some denomination c; then the prior amount is x-c.
3. Minimize dp[x-c]+1 over reachable prior states.
4. Use amount+1 as an unreachable sentinel and guard before adding.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int CoinChange(int[] coins, int amount)
    {
        if (amount < 0) throw new ArgumentOutOfRangeException(nameof(amount));
        int unreachable = amount + 1;
        var dp = new int[amount + 1];
        Array.Fill(dp, unreachable);
        dp[0] = 0;

        for (int value = 1; value <= amount; value++)
        {
            foreach (int coin in coins)
            {
                if (coin <= value && dp[value - coin] != unreachable)
                    dp[value] = Math.Min(dp[value], dp[value - coin] + 1);
            }
        }
        return dp[amount] == unreachable ? -1 : dp[amount];
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(3, CoinChange(new[] { 1, 2, 5 }, 11));
        Check(-1, CoinChange(new[] { 2 }, 3));
        Check(0, CoinChange(new[] { 1 }, 0));
        Check(4, CoinChange(new[] { 2, 5 }, 11));
        Check(-1, CoinChange(new[] { int.MaxValue }, 10));
        Console.WriteLine("Coin Change checks passed.");
    }
}
```

## Correctness argument

For each amount x, any nonempty solution has a final coin c<=x, leaving a solution for x-c. If x-c is reachable, appending c to its minimum-coin solution gives a valid candidate with dp[x-c]+1 coins. Conversely, removing the final coin from any solution for x produces one of these predecessor states, so minimizing all such candidates cannot miss a better solution. Increasing amount order ensures x-c<x and has already been computed. Since every coin is at least one, any reachable amount x uses at most x coins; amount+1 is therefore greater than every valid answer and safely marks unreachable. The guard avoids sentinel arithmetic.

## Step-by-step dry run

For coins [1,3,4] and amount 6, dp[0]=0. dp[1]=1, dp[2]=2, dp[3]=1, dp[4]=1, dp[5]=2, and dp[6]=min(dp[5]+1, dp[3]+1, dp[2]+1)=2, using 3+3. Taking the largest coin first would give 4+1+1, so the DP must compare alternatives.

## Time complexity

O(amount * k), where k is the number of denominations.

## Space complexity

O(amount) for the table.

## Alternatives and tradeoffs

- Top-down memoization explores only amounts reached from the target but uses recursion and a cache.
- Breadth-first search over amounts by number of coins finds a shortest path in an unweighted graph, but DP is simpler for the bounded amount.
- Greedy largest-denomination-first is not valid for arbitrary denominations; [1,3,4] with amount 6 is a counterexample.

## Common mistakes and gotchas

- Initializing every amount to zero, which makes unreachable states look feasible.
- Adding one to an unreachable sentinel without a guard.
- Using an algorithm that counts ordered coin sequences when only minimum coin count is requested.
- Assuming a familiar currency's greedy behavior generalizes to every denomination set.
- Allocating an array sized by a coin value; values can exceed Int32-relevant target and should simply be skipped.

## Edge-case tests

- Amount zero returns zero.
- A target divisible by the only denomination.
- Unreachable target.
- A denomination larger than the amount.
- A greedy counterexample such as [1,3,4], amount 6.

## Reflection questions
1. Why does processing amounts in increasing order satisfy dependencies?
2. Why is amount+1 a safe sentinel under positive denominations?
3. How would you reconstruct the chosen denominations?

## Source
- [Coin Change](https://leetcode.com/problems/coin-change/)
