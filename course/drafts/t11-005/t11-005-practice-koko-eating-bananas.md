# binary search, bounds, rotated arrays, and monotone answers — Problem: Koko Eating Bananas

## Goals

- Binary-search the minimum integer speed satisfying a time limit.
- Derive a monotone feasibility test using ceiling division per pile.
- Avoid overflow and stop work as soon as a speed is known to fail.

## Problem statement

There are piles of bananas. At integer speed k, Koko chooses one pile per hour and eats up to k bananas from it; if fewer than k remain, she finishes that pile and does not eat another pile during the same hour. Return the minimum integer speed that finishes all piles within h hours.

## Input constraints

- 1 <= piles.Length <= 10,000.
- piles.Length <= h <= 1,000,000,000.
- 1 <= piles[i] <= 1,000,000,000.

## Examples with expected output

1. piles = [3,6,7,11], h = 8 -> 4.
2. piles = [30,11,23,4,20], h = 5 -> 30.
3. piles = [30,11,23,4,20], h = 6 -> 23.
4. piles = [1], h = 1 -> 1.

## Clarifying assumptions

- Each pile consumes at least one hour; there is no switching to another pile in a partially used hour.
- Speed is a positive integer.
- Minimum feasible speed lies between 1 and max(piles): at max speed every pile takes one hour, and h is at least the number of piles.
- Use long for total hours because h can be large and the candidate sum of ceilings may exceed Int32.

## Progressive hints

1. For a candidate speed v, pile p needs `ceil(p/v)` hours.
2. The total hours never increase when v increases, so feasibility changes from false to true at the minimum speed.
3. Search `[1,max(piles)]` for the first feasible speed.
4. Compute ceiling division as `1 + (p-1)/v` for positive p and v; stop once total hours exceeds h.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    private static bool CanFinish(int[] piles, int hoursAvailable, int speed)
    {
        long hours = 0;
        foreach (int pile in piles)
        {
            hours += 1L + (pile - 1L) / speed;
            if (hours > hoursAvailable) return false;
        }
        return true;
    }

    public static int MinEatingSpeed(int[] piles, int h)
    {
        if (piles is null) throw new ArgumentNullException(nameof(piles));
        if (piles.Length == 0) throw new ArgumentException("At least one pile is required.", nameof(piles));
        if (h < piles.Length) throw new ArgumentException("Each pile requires at least one hour.", nameof(h));

        int left = 1;
        int right = 0;
        foreach (int pile in piles)
        {
            if (pile <= 0) throw new ArgumentException("Pile sizes must be positive.", nameof(piles));
            right = Math.Max(right, pile);
        }

        while (left < right)
        {
            int mid = left + (right - left) / 2;
            if (CanFinish(piles, h, mid)) right = mid;
            else left = mid + 1;
        }
        return left;
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(MinEatingSpeed(new[] { 3, 6, 7, 11 }, 8), 4, "Example 1");
        AssertEqual(MinEatingSpeed(new[] { 30, 11, 23, 4, 20 }, 5), 30, "Example 2");
        AssertEqual(MinEatingSpeed(new[] { 30, 11, 23, 4, 20 }, 6), 23, "Example 3");
        AssertEqual(MinEatingSpeed(new[] { 1 }, 1), 1, "Single pile");
        Console.WriteLine("All Koko Eating Bananas checks passed.");
    }
}
```

## Correctness argument

At speed v, a pile of p positive bananas takes `ceil(p/v) = 1 + floor((p-1)/v)` hours. The helper sums these pile-hour requirements, matching the rule that she chooses only one pile each hour. If a speed is feasible, any greater speed uses no more hours, so feasibility is monotone false-to-true. Speed 1 is the minimum candidate; max pile size is feasible because it takes one hour per pile and h >= pile count. Lower-bound binary search therefore returns the first feasible speed, which is the minimum valid integer.

Early exit when accumulated hours exceed h preserves the Boolean result: later positive pile times cannot reduce the total.

## Step-by-step dry run

For piles `[3,6,7,11]`, h=8, speed 4 requires `1+2+2+3=8` hours, so it is feasible. Speed 3 requires `1+2+3+4=10`, so it fails. Binary search discards infeasible lower speeds and feasible higher speeds until 4 remains.

## Time complexity

O(n log M), where M is the largest pile; each feasibility check scans at most n piles.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Linear search from speed 1 through max pile checks O(nM) work and is too slow for large pile sizes.
- If hours were not at least pile count, no speed could complete all piles; the implementation rejects that invalid extension.
- An alternative binary-search form tracks the best feasible answer with a closed interval; the lower-bound form directly converges to the first true speed.

## Common mistakes and gotchas

- Summing `pile / speed` with integer truncation and forgetting the partial final hour.
- Using floating-point `Math.Ceiling`, which is unnecessary and may lose precision for large integers.
- Assuming she can use leftover time in an hour to start another pile.
- Using sum(piles) as the tight upper bound; max pile already gives one hour per pile and is feasible under h >= n.
- Failing to prove the feasibility predicate is monotone.
- Letting hour accumulation overflow or continuing after it already exceeds h.

## Edge-case tests

- h equals number of piles; required speed is max pile.
- h is very large; speed 1 may be feasible.
- One pile with a large size.
- Pile size exactly divisible by speed and one greater than a multiple.
- Speeds above a pile size still cost one hour, not zero.

## Reflection questions

1. Why does each pile contribute a ceiling rather than a floor?
2. Why is max(piles) a proven feasible upper bound?
3. Why can the sum of required hours early-exit once it exceeds h?
4. How does binary-search complexity include the feasibility scan?

Source: [LeetCode: Koko Eating Bananas](https://leetcode.com/problems/koko-eating-bananas/).
