# integer arithmetic, primes, gcd, and modular math — Problem: Check If It Is a Good Array

## Goals

Use Bézout's identity to turn a subset-and-coefficients question into one GCD computation.

## Problem statement

Given positive integers, determine whether some subset can be multiplied by integer coefficients and summed to exactly 1. Coefficients may be negative; elements outside the chosen subset are simply unused. [Official problem statement](https://leetcode.com/problems/check-if-it-is-a-good-array/)

## Input constraints

- `1 <= nums.Length <= 100,000`.
- `1 <= nums[i] <= 10^9`.

## Examples with expected output

1. `[12,5,7,23]` → `true`; for example `5*3 + 7*(-2) = 1`.
2. `[29,6,10]` → `true`.
3. `[3,6]` → `false`.
4. `[1]` → `true`.

## Clarifying assumptions

“Multiply each selected element by an integer” permits any signed integer coefficient, including zero if considering all entries. The question is not whether a subset sums to 1 using each element once with coefficient exactly one.

## Progressive hints

1. What values can integer combinations of two numbers produce?
2. Bézout says those values are multiples of their GCD.
3. Fold GCD over the entire array; 1 is expressible exactly when that GCD is one.

## Complete C# solution

```csharp dsa-solution
using System;
static int Gcd(int a, int b)
{
    while (b != 0) { int r = a % b; a = b; b = r; }
    return a;
}
static bool IsGoodArray(int[] nums)
{
    int gcd = 0;
    foreach (int value in nums) gcd = Gcd(gcd, value);
    return gcd == 1;
}
static void Check(bool actual, bool expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(IsGoodArray(new[] {12,5,7,23}), true, "example 1");
Check(IsGoodArray(new[] {29,6,10}), true, "example 2");
Check(IsGoodArray(new[] {3,6}), false, "example 3");
Check(IsGoodArray(new[] {1}), true, "single element one");
Check(IsGoodArray(new[] {6,10,14}), false, "common divisor greater than one");
Console.WriteLine("All Good Array checks passed.");
```

## Correctness argument

For integers `a1,...,ak`, every integer linear combination is divisible by their GCD. Conversely, repeated extended Euclid expresses that GCD as an integer combination of the inputs. Thus 1 can be expressed exactly when the array GCD equals 1. Folding pairwise GCD computes the GCD of the whole array by associativity, so the predicate is both necessary and sufficient.

## Step-by-step dry run

For `[12,5,7,23]`: `gcd(0,12)=12`; `gcd(12,5)=1`; further folding keeps 1. Therefore a linear combination can equal 1. For `[3,6]`, the GCD is 3, so every combination is divisible by 3 and cannot equal 1.

## Time complexity

`O(n log M)`, where `M` is the largest value; each fold invokes Euclid.

## Space complexity

`O(1)`.

## Edge-case tests

Assertions cover all official examples, the one-element array `[1]`, and an array with common divisor 2.

## Reflection questions

1. Why does a GCD greater than one make 1 impossible?
2. Why are negative coefficients essential to the Bézout statement?
3. How could extended Euclid construct actual coefficients for the result?

## Reflection answers

1. If the GCD is greater than one, every integer combination remains divisible by that GCD, so it cannot equal 1.
2. Bézout's identity permits signed integer coefficients; restricting coefficients to nonnegative values changes the set of reachable sums and invalidates the GCD criterion.
3. Run extended Euclid while folding values, combining the previous GCD coefficients with the next input; the resulting coefficients express the final GCD as a combination of array elements.
