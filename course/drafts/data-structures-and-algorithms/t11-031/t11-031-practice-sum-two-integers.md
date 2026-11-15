# bitwise operations, masks, and subset enumeration — Problem: Sum of Two Integers

## Goals

Derive binary addition from XOR sum bits and shifted AND carry bits while handling signed C# values at a fixed width.

## Problem statement

Return `a+b` without using the `+` or `-` operators. [Official problem statement](https://leetcode.com/problems/sum-of-two-integers/)

## Input constraints

- `-1000 <= a,b <= 1000`.

## Examples with expected output

1. `a=1`, `b=2` → `3`.
2. `a=2`, `b=3` → `5`.
3. `a=-2`, `b=3` → `1`.
4. `a=-4`, `b=-5` → `-9`.

## Clarifying assumptions

The required result is the ordinary sum, and these bounds guarantee it fits a 32-bit signed integer. The implementation uses unsigned 32-bit bit patterns internally, then reinterprets the final pattern as `int`.

## Progressive hints

1. XOR adds each column without carrying.
2. AND identifies columns where both bits are one; shift this carry one position left.
3. Repeat: add the partial sum to the carry until no carry remains.

## Complete C# solution

```csharp dsa-solution
using System;
static int GetSum(int a, int b)
{
    uint sum = unchecked((uint)a);
    uint carry = unchecked((uint)b);
    while (carry != 0)
    {
        uint nextCarry = (sum & carry) << 1;
        sum ^= carry;
        carry = nextCarry;
    }
    return unchecked((int)sum);
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(GetSum(1, 2), 3, "example 1");
Check(GetSum(2, 3), 5, "example 2");
Check(GetSum(-2, 3), 1, "negative and positive");
Check(GetSum(-4, -5), -9, "two negatives");
Check(GetSum(0, 0), 0, "zeros");
Console.WriteLine("All Sum Two Integers checks passed.");
```

## Correctness argument

For each bit position, `sum ^ carry` computes addition without propagating a carry, while `(sum & carry) << 1` computes the carry into the next position. Thus one iteration replaces the operands with an equivalent partial sum and remaining carry. Repeating propagates carries until none remain, leaving the exact 32-bit sum pattern. The stated input bounds ensure its signed interpretation fits `int`.

## Step-by-step dry run

For `2 (0010)` and `3 (0011)`, XOR gives `0001`; AND then shift gives carry `0100`. Next XOR gives `0101`, while the new carry is zero. The result is 5.

## Time complexity

At most 32 carry-propagation iterations for a 32-bit word, so `O(1)` under fixed-width arithmetic.

## Space complexity

`O(1)`.

## Edge-case tests

Checks cover official examples, mixed signs, two negative values, and zeros. No overflow case is needed under the supplied bounds.

## Reflection questions

1. Why is XOR the sum-without-carry operation?
2. Why does AND followed by left shift represent carry?
3. Why use `uint` for the shifting carry state?
