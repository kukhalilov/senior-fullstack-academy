# integer arithmetic, primes, gcd, and modular math — Problem: Super Pow

## Goals

Compute a huge exponent supplied as decimal digits without constructing it or assuming the modulus is prime.

## Problem statement

Compute `a^b mod 1337`, where `b` is given as an array of decimal digits. [Official problem statement](https://leetcode.com/problems/super-pow/)

## Input constraints

- `1 <= a <= 2^31-1`.
- `1 <= b.Length <= 2000`.
- `0 <= b[i] <= 9`.
- `b` has no leading zeroes.

## Examples with expected output

1. `a=2`, `b=[3]` → `8`.
2. `a=2`, `b=[1,0]` → `1024`.
3. `a=1`, `b=[4,3,3,8,5,2]` → `1`.
4. `a=2`, `b=[0]` → `1` (the exponent is zero).

## Clarifying assumptions

The modulus is fixed at 1337, which is composite. This algorithm uses repeated modular exponentiation and does not use Fermat's inverse or assume the base is coprime to the modulus. The official no-leading-zero rule means `[0]` represents zero.

## Progressive hints

1. Process decimal digits from left to right. If prefix exponent is `e`, appending digit `d` gives `10e+d`.
2. Therefore update `result = result^10 * a^d mod 1337`.
3. Use small-exponent binary exponentiation for powers 10 and each digit; reduce the base first.

## Complete C# solution

```csharp dsa-solution
using System;
static int PowMod(int value, int exponent, int mod)
{
    long result = 1, factor = value % mod;
    while (exponent > 0)
    {
        if ((exponent & 1) != 0) result = result * factor % mod;
        factor = factor * factor % mod;
        exponent >>= 1;
    }
    return (int)result;
}
static int SuperPow(int a, int[] b)
{
    const int mod = 1337;
    int result = 1, reduced = a % mod;
    foreach (int digit in b)
        result = PowMod(result, 10, mod) * PowMod(reduced, digit, mod) % mod;
    return result;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(SuperPow(2, new[] {3}), 8, "example 1");
Check(SuperPow(2, new[] {1,0}), 1024, "example 2");
Check(SuperPow(1, new[] {4,3,3,8,5,2}), 1, "example 3");
Check(SuperPow(2, new[] {0}), 1, "zero exponent");
Check(SuperPow(1337, new[] {1}), 0, "base divisible by modulus");
Console.WriteLine("All Super Pow checks passed.");
```

## Correctness argument

After processing a digit prefix representing exponent `e`, maintain `result ≡ a^e (mod 1337)`. The next digit `d` changes the exponent to `10e+d`. Therefore `a^(10e+d) = (a^e)^10 * a^d`. Raising the current residue to 10 and multiplying by the reduced base raised to `d` computes this value modulo 1337. Induction over digits proves the final residue is the requested answer. No primality or inverse property is used.

## Step-by-step dry run

For `a=2`, digits `[1,0]`: first digit gives 2. Next, exponent 10 yields `2^10 = (2^1)^10 * 2^0 = 1024`, still below 1337, so the result is 1024.

## Time complexity

`O(D log 10)` modular multiplications for `D` digits; the exponent 10 and each digit are bounded constants, so `O(D)`.

## Space complexity

`O(1)`.

## Edge-case tests

Checks cover all official examples, exponent zero, and a base divisible by the composite modulus.

## Reflection questions

1. Why can the decimal exponent not be parsed into a machine integer?
2. Why does the digit recurrence avoid Euler/Fermat exponent reduction?
3. Where is multiplication safe from overflow in this code, and why?

## Reflection answers

1. The digit array can contain up to 2,000 decimal digits, far beyond fixed-width integer ranges.
2. The recurrence computes the exponent exactly by decimal place value and uses modular exponentiation directly; Euler or Fermat reduction would require extra coprimality/modulus conditions.
3. In `PowMod`, the factor and result are residues below 1337, so their product is at most `1336*1336`, which fits in `int`; the final product of two returned residues has the same bound.
