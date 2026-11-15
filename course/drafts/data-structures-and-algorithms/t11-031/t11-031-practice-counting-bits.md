# bitwise operations, masks, and subset enumeration — Problem: Counting Bits

## Goals

Build all population counts through `n` with a recurrence using a previously computed smaller value.

## Problem statement

Return an array `ans` of length `n+1` where `ans[i]` is the number of one bits in the binary representation of `i`. Do not use a built-in population-count function. [Official problem statement](https://leetcode.com/problems/counting-bits/)

## Input constraints

- `0 <= n <= 100,000`.
- The requested follow-up asks for `O(n)` time.

## Examples with expected output

1. `n=2` → `[0,1,1]`.
2. `n=5` → `[0,1,1,2,1,2]`.
3. `n=0` → `[0]`.

## Clarifying assumptions

Values range only from zero through `n`; the zero value has zero set bits. The output order is increasing index order.

## Progressive hints

1. Removing the lowest set bit produces a smaller number.
2. `bits[i] = bits[i & (i-1)] + 1` is one recurrence.
3. Alternatively, remove the highest power-of-two boundary using `i >> 1` and its low bit.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Linq;
static int[] CountBits(int n)
{
    int[] bits = new int[n + 1];
    for (int i = 1; i <= n; i++) bits[i] = bits[i & (i - 1)] + 1;
    return bits;
}
static void Check(int[] actual, int[] expected, string label)
{
    if (!actual.SequenceEqual(expected)) throw new InvalidOperationException("Failed: " + label);
}
Check(CountBits(2), new[] {0,1,1}, "example 1");
Check(CountBits(5), new[] {0,1,1,2,1,2}, "example 2");
Check(CountBits(0), new[] {0}, "zero");
Check(CountBits(8), new[] {0,1,1,2,1,2,2,3,1}, "power-of-two boundary");
Console.WriteLine("All Counting Bits checks passed.");
```

## Correctness argument

The base `bits[0]=0` is correct. For every positive `i`, `i & (i-1)` is a smaller nonnegative number formed by clearing one set bit. Therefore its count is exactly one less than the count of `i`. Since the loop visits increasing `i`, the smaller result is already computed, and induction proves each output entry.

## Step-by-step dry run

At `i=5` (`101`), `i&(i-1)=4` (`100`), whose count is one. Set `bits[5]=2`. For `i=8`, clearing the only set bit yields zero, so its count is one.

## Time complexity

`O(n)`.

## Space complexity

`O(n)` for the required output.

## Edge-case tests

Checks cover both official examples, `n=0`, and values around a power-of-two boundary.

## Reflection questions

1. Why does the recurrence depend only on an already computed index?
2. How does `bits[i] = bits[i/2] + (i%2)` express the same idea?
3. Why is output storage not counted as avoidable auxiliary memory here?
