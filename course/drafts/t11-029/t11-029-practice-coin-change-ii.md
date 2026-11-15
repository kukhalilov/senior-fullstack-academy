# knapsack, subset-sum, and resource-allocation DP — Problem: Coin Change II

## Goals
- Count unordered coin combinations with unlimited use of each denomination.
- Use coin-outer and amount-ascending loops to encode the correct semantics.
- Handle amount zero as one empty combination.

## Problem statement

Given distinct positive coin denominations and an amount, return the number of combinations that make that amount. An unlimited number of each denomination may be used. Different orders of the same multiset are one combination. The result fits a signed 32-bit integer.

## Input constraints
- `1 <= coins.Length <= 300`.
- `1 <= coins[i] <= 5000`; all coin values are unique.
- `0 <= amount <= 5000`.

## Examples with expected output
- `amount=5, coins=[1,2,5] -> 4`.
- `amount=3, coins=[2] -> 0`.
- `amount=10, coins=[10] -> 1`.
- `amount=0, coins=[1,2] -> 1` (choose no coins).

## Clarifying assumptions

Coin order does not create a new combination: `[1,2]` and `[2,1]` are the same denomination multiset. Each coin can be reused any number of times. Coin values are distinct, so duplicate denomination handling is unnecessary.

## Progressive hints
1. Let `ways[a]` count combinations for amount a using denominations processed so far.
2. Initialize `ways[0]=1`, the one empty combination.
3. Process each coin outside, and scan amounts upward so the same coin may be used again without counting different orders separately.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Numerics;

static class Program
{
    static int Change(int amount, int[] coins)
    {
        var ways = new BigInteger[amount + 1];
        ways[0] = BigInteger.One;
        foreach (int coin in coins)
            for (int current = coin; current <= amount; current++)
                ways[current] += ways[current - coin];
        return checked((int)ways[amount]);
    }

    static void Check(int expected, int amount, int[] coins)
    {
        int actual = Change(amount, coins);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(4, 5, new[] { 1, 2, 5 });
        Check(0, 3, new[] { 2 });
        Check(1, 10, new[] { 10 });
        Check(1, 0, new[] { 1, 2 });
        Check(0, 7, new[] { 3, 5 });
        Check(0, 999, new[] { 2, 4, 6, 8, 10 });
        Console.WriteLine("Coin Change II checks passed.");
    }
}
```

## Correctness argument

After processing the first i coin types, `ways[a]` counts combinations of those types totaling a. Initially only amount zero has one way: use no coins. When processing coin c, each combination for amount a-c can add one c and become a combination for a; scanning amounts upward permits using c multiple times. Because each coin type is processed in one fixed outer-loop position, the same multiset is generated in denomination order only and is not counted again in another permutation. Induction over coins proves the state and the final answer.

## Step-by-step dry run

For amount 5 and coins `[1,2,5]`, start `ways[0]=1`. Coin 1 fills every positive amount with one combination of all ones. Coin 2 adds combinations containing one or more 2s to amounts 2..5. Coin 5 adds the single combination `[5]` at amount 5. The total at 5 is 4: `[1,1,1,1,1]`, `[1,1,1,2]`, `[1,2,2]`, and `[5]`.

## Time complexity

`O(C*A)` DP transitions for C coin types and amount A; with `BigInteger` counters, addition cost also depends on the number of bits in the intermediate counts.

## Space complexity

`O(A)` DP entries using arbitrary-precision counters; the returned value is checked into the required 32-bit type. This keeps unreachable intermediate amounts exact even when their counts exceed machine integers.

## Edge-case tests
- All three official examples are asserted.
- Amount zero has exactly one combination.
- An amount not divisible/reachable from available denominations returns zero.
- Ascending order allows repeated coins, while coin-outer order avoids permutation duplicates.

## Reflection questions
1. What would target-outer, coin-inner loops count instead?
2. Why does the empty combination make `ways[0]` equal one rather than zero?
3. Why are amount updates ascending for unlimited coins?

Source: [LeetCode: Coin Change II](https://leetcode.com/problems/coin-change-ii/).
