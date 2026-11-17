# integer arithmetic, primes, gcd, and modular math — Problem: Factorial Trailing Zeroes

## Goals

Count factors of five in `n!` without constructing the factorial.

## Problem statement

Return the number of trailing zeroes in the decimal representation of `n!`. [Official problem statement](https://leetcode.com/problems/factorial-trailing-zeroes/)

## Input constraints

- `0 <= n <= 10^4`.

## Examples with expected output

1. `n=3` → `0`.
2. `n=5` → `1`.
3. `n=0` → `0`.
4. `n=25` → `6`.

## Clarifying assumptions

A trailing decimal zero requires one factor of 10, or one factor each of 2 and 5. Factorials contain at least as many factors of 2 as 5, so count only fives.

## Progressive hints

1. How many multiples of 5 are at most `n`?
2. Multiples of 25 contribute an extra factor of 5; multiples of 125 contribute another.
3. Repeatedly divide `n` by 5 and add each quotient.

## Complete C# solution

```csharp dsa-solution
using System;
static int TrailingZeroes(int n)
{
    int count = 0;
    while (n > 0) { n /= 5; count += n; }
    return count;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(TrailingZeroes(3), 0, "example 1");
Check(TrailingZeroes(5), 1, "example 2");
Check(TrailingZeroes(0), 0, "example 3");
Check(TrailingZeroes(25), 6, "multiple powers of five");
Check(TrailingZeroes(100), 24, "larger input");
Console.WriteLine("All factorial-zero checks passed.");
```

## Correctness argument

Each factor 10 in `n!` requires one factor 5 and one factor 2. There are more factors of 2 than 5, so the number of zeroes equals the total exponent of 5 in the factorial. Multiples of 5 contribute at least one five, multiples of 25 one additional five, multiples of 125 another, and so on. The repeated divisions sum exactly these counts.

## Step-by-step dry run

For `n=25`, quotients are 5, 1, then 0. Their sum is 6: five multiples contribute the first factor and 25 contributes one extra.

## Time complexity

`O(log_5 n)` divisions.

## Space complexity

`O(1)`.

## Edge-case tests

Tests cover all official examples, including zero, plus 25 where an extra factor of five appears, and 100.

## Reflection questions

1. Why do we not count factors of two?
2. Why is `n/5` alone insufficient for `n=25`?
3. How would the idea change for trailing zeroes in another base?

## Reflection answers

1. Every trailing zero consumes one factor 2 and one factor 5, and `n!` contains more factors of 2 than of 5.
2. `n/5` counts one factor of 5 for each multiple of 5, but multiples of 25 contribute a second factor, which requires the additional `n/25` term.
3. Factor the base into primes. The number of trailing zeroes is the minimum, over its prime factors, of the available exponent in `n!` divided by that prime's exponent in the base.
