# integer arithmetic, primes, gcd, and modular math — Problem: Pow(x, n)

## Goals

Implement exponentiation by squaring, support negative exponents, and safely handle the minimum 32-bit exponent.

## Problem statement

Implement `x^n`, where `n` is an integer and can be negative. [Official problem statement](https://leetcode.com/problems/powx-n/)

## Input constraints

- `-100.0 < x < 100.0`.
- `-2^31 <= n <= 2^31-1`.
- `n` is an integer; either `x != 0` or `n > 0`.
- `-10^4 <= x^n <= 10^4`.

## Examples with expected output

1. `x=2.00000`, `n=10` → `1024.00000`.
2. `x=2.10000`, `n=3` → `9.26100`.
3. `x=2.00000`, `n=-2` → `0.25000`.
4. `x=2.0`, `n=-2147483648` → `0.0` in `double` because the exact positive result is below the smallest representable positive value.

## Clarifying assumptions

The function returns IEEE 754 `double`, so decimal values may be approximate. The judge compares according to its tolerance. The constraints exclude `x=0,n<=0`.

## Progressive hints

1. Naively multiplying `n` times is too slow for large absolute exponents.
2. If `n` is even, square `x` and halve `n`; if odd, multiply the result by `x` once.
3. Convert exponent to `long` before negating so `int.MinValue` has a representable positive magnitude.

## Complete C# solution

```csharp dsa-solution
using System;
static double MyPow(double x, int n)
{
    long exponent = n;
    if (exponent < 0) { x = 1.0 / x; exponent = -exponent; }
    double result = 1.0;
    while (exponent > 0)
    {
        if ((exponent & 1L) != 0) result *= x;
        x *= x;
        exponent >>= 1;
    }
    return result;
}
static void Check(double actual, double expected, string label)
{
    if (Math.Abs(actual - expected) > 1e-10 * Math.Max(1.0, Math.Abs(expected)))
        throw new InvalidOperationException($"{label}: expected {expected:R}, got {actual:R}");
}
Check(MyPow(2.0, 10), 1024.0, "example 1");
Check(MyPow(2.1, 3), 9.261, "example 2");
Check(MyPow(2.0, -2), 0.25, "example 3");
Check(MyPow(-2.0, 3), -8.0, "negative base odd exponent");
Check(MyPow(2.0, int.MinValue), Math.Pow(2.0, int.MinValue), "minimum exponent");
Check(MyPow(3.0, 0), 1.0, "zero exponent");
Console.WriteLine("All Pow(x,n) checks passed.");
```

## Correctness argument

For nonnegative exponent `e`, maintain `result * x^e` equal to the original target power. If `e` is odd, multiply `result` by `x` and reduce the remaining exponent by one; then square `x` while halving `e`, preserving the invariant. When `e` reaches zero, `result` is the desired power. For negative `n`, use `x^n=(1/x)^|n|`. Widening to `long` before negation safely represents `|int.MinValue|=2^31`.

## Step-by-step dry run

For `x=2,n=10`: result 1, base 2, exponent 10. Square base to 4 and halve to 5; odd step multiplies result to 4, then base squares to 16 and exponent becomes 2; square to 256 and exponent 1; odd step multiplies result to 1024. Exponent becomes zero.

## Time complexity

`O(log |n|)` multiplications.

## Space complexity

`O(1)`.

## Edge-case tests

Tests cover all official examples, negative base with odd exponent, zero exponent, and the minimum signed exponent. Floating-point comparison uses a relative/absolute tolerance rather than exact equality.

## Reflection questions

1. Why can `-n` overflow if `n` is an `int` minimum?
2. Why does exponentiation by squaring reduce the number of multiplications?
3. What happens for `x=0,n=0` under this problem contract?
