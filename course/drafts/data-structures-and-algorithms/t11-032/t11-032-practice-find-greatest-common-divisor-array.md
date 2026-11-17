# integer arithmetic, primes, gcd, and modular math — Problem: Find Greatest Common Divisor of Array

## Goals

Identify the exact requested pair—the minimum and maximum array values—and apply Euclid's algorithm.

## Problem statement

Return the GCD of the smallest and largest values in `nums`. [Official problem statement](https://leetcode.com/problems/find-greatest-common-divisor-of-array/)

## Input constraints

- `2 <= nums.Length <= 1000`.
- `1 <= nums[i] <= 1000`.

## Examples with expected output

1. `[2,5,6,9,10]` → `2` (GCD of 2 and 10).
2. `[7,5,6,8,3]` → `1` (GCD of 3 and 8).
3. `[3,3]` → `3`.
4. `[6,10,15]` → `3` (GCD of min 6 and max 15; not a fold over all values, which would be 1).

## Clarifying assumptions

This problem asks for the GCD of the minimum and maximum values, not the GCD of every array element. All values are positive.

## Progressive hints

1. Find min and max in one pass.
2. For two positive values, replace `(a,b)` by `(b,a%b)`.
3. Stop when the remainder is zero.

## Complete C# solution

```csharp dsa-solution
using System;
static int FindGcd(int[] nums)
{
    int min = nums[0], max = nums[0];
    foreach (int value in nums) { min = Math.Min(min, value); max = Math.Max(max, value); }
    while (max != 0) { int remainder = min % max; min = max; max = remainder; }
    return min;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(FindGcd(new[] {2,5,6,9,10}), 2, "example 1");
Check(FindGcd(new[] {7,5,6,8,3}), 1, "example 2");
Check(FindGcd(new[] {3,3}), 3, "example 3");
Check(FindGcd(new[] {6,10,15}), 3, "minimum and maximum only");
Console.WriteLine("All array-GCD checks passed.");
```

## Correctness argument

Let `a=q*b+r`, where `r=a%b`. A number divides both `a` and `b` exactly when it divides both `b` and `r`; therefore their common divisors are identical and `gcd(a,b)=gcd(b,r)`. Each nonzero remainder is smaller than the previous divisor, so the process terminates at zero. The final nonzero value is the GCD. The first scan finds the two values required by the statement.

## Step-by-step dry run

For minimum 2 and maximum 10: `10%2=0`, so GCD is 2. For 6 and 15: `15%6=3`, then `6%3=0`, so GCD is 3.

## Time complexity

`O(n + log M)`, where `M` is the larger endpoint; the scan is linear and Euclid is logarithmic.

## Space complexity

`O(1)`.

## Edge-case tests

Checks cover all official examples and distinguish the specified min/max pair from a GCD fold over the entire array.

## Reflection questions

1. Why is this not necessarily the GCD of all array entries?
2. Why does Euclid preserve the common divisors?
3. What convention would you use if both inputs could be zero?

## Reflection answers

1. The problem explicitly selects the minimum and maximum values. Other values may change a fold over the full array but must not affect this requested pair's GCD.
2. If `a=q*b+r`, a number divides both `a,b` exactly when it divides both `b,r`; therefore the common divisors, and their greatest member, are unchanged.
3. In programming, defining `gcd(0,0)=0` is a useful convention, but the API should state it because “largest positive common divisor” does not define a unique answer for `(0,0)`.
