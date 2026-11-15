# integer arithmetic, primes, gcd, and modular math — Problem: Count Primes

## Goals

Use a sieve to count primes strictly below a bound, start marking at each prime's square, and avoid off-by-one errors.

## Problem statement

Given `n`, return the number of prime numbers strictly less than `n`. [Official problem statement](https://leetcode.com/problems/count-primes/)

## Input constraints

- `0 <= n <= 5 * 10^6`.

## Examples with expected output

1. `n=10` → `4` (2, 3, 5, 7).
2. `n=0` → `0`.
3. `n=1` → `0`.
4. `n=2` → `0` because the range is strictly below 2.

## Clarifying assumptions

Only values in `[0,n)` count. Zero and one are not prime. The upper-bound slot can be allocated but is never included in the count.

## Progressive hints

1. Testing each number independently repeats factor checks.
2. Mark all multiples of each discovered prime as composite.
3. Begin at `p*p`; continue while `p <= (n-1)/p` so multiplication in the loop condition cannot overflow.

## Complete C# solution

```csharp dsa-solution
using System;
static int CountPrimes(int n)
{
    if (n <= 2) return 0;
    bool[] composite = new bool[n];
    for (int p = 2; p <= (n - 1) / p; p++)
    {
        if (composite[p]) continue;
        for (int multiple = p * p; multiple < n; multiple += p)
            composite[multiple] = true;
    }
    int count = 0;
    for (int value = 2; value < n; value++) if (!composite[value]) count++;
    return count;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(CountPrimes(10), 4, "example 1");
Check(CountPrimes(0), 0, "example 2");
Check(CountPrimes(1), 0, "example 3");
Check(CountPrimes(2), 0, "strict upper bound");
Check(CountPrimes(3), 1, "prime below bound");
Check(CountPrimes(100), 25, "known small count");
Console.WriteLine("All Count Primes checks passed.");
```

## Correctness argument

Every composite integer `c<n` has a prime factor `p<=sqrt(c)<sqrt(n)`, so some sieve iteration marks it. Marking begins at `p²` because smaller multiples have a smaller prime factor and were already marked. A prime is never marked: its only positive divisors below itself are 1, and no prime's multiple-marking sequence reaches it. Thus unmarked values from 2 to `n-1` are exactly the primes counted.

## Step-by-step dry run

For `n=10`, prime 2 marks 4,6,8; prime 3 marks 9. Values 2,3,5,7 remain unmarked, so the result is 4. Since the range is strict, 10 is not considered.

## Time complexity

`O(n log log n)` time.

## Space complexity

`O(n)` booleans.

## Edge-case tests

Tests include three official examples, the strict-boundary case `n=2`, a prime bound, and a known count through 100.

## Reflection questions

1. Why is 1 excluded from the count?
2. Why can marking stop when `p*p >= n`?
3. How would you answer many interval prime-count queries after one sieve?
