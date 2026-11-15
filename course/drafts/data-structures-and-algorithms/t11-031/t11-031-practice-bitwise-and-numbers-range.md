# bitwise operations, masks, and subset enumeration — Problem: Bitwise AND of Numbers Range

## Goals

Find the common most-significant prefix shared by every number in an inclusive range.

## Problem statement

Return the bitwise AND of every integer from `left` through `right`, inclusive. [Official problem statement](https://leetcode.com/problems/bitwise-and-numbers-range/)

## Input constraints

- `0 <= left <= right <= 2^31-1`.

## Examples with expected output

1. `left=5`, `right=7` → `4`.
2. `left=0`, `right=0` → `0`.
3. `left=1`, `right=2147483647` → `0`.
4. `left=12`, `right=15` → `12`.

## Clarifying assumptions

The interval is inclusive and contains only nonnegative signed integers. Any bit position that changes from zero to one or one to zero across the range will AND to zero.

## Progressive hints

1. Which leading bit prefix can remain one in every value?
2. Right-shift both endpoints until they are equal, counting shifts.
3. Shift the shared prefix back into position; shifted-off suffix bits are zero in the AND.

## Complete C# solution

```csharp dsa-solution
using System;
static int RangeBitwiseAnd(int left, int right)
{
    int shifts = 0;
    while (left < right)
    {
        left >>= 1;
        right >>= 1;
        shifts++;
    }
    return left << shifts;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(RangeBitwiseAnd(5, 7), 4, "example 1");
Check(RangeBitwiseAnd(0, 0), 0, "example 2");
Check(RangeBitwiseAnd(1, int.MaxValue), 0, "example 3");
Check(RangeBitwiseAnd(12, 15), 12, "shared prefix");
Check(RangeBitwiseAnd(8, 9), 8, "adjacent values");
Console.WriteLine("All range-AND checks passed.");
```

## Correctness argument

As long as endpoints differ, the inclusive interval crosses a boundary at the current low bit, so that bit is zero in at least one member and therefore zero in the AND. Shifting both endpoints right removes this suffix position while preserving the common higher prefix. When they become equal, all remaining prefix bits are common to every integer in the range. Shifting that prefix back restores its original positions and leaves discarded suffix positions zero, exactly matching the range AND.

## Step-by-step dry run

For 5 (`101`) through 7 (`111`): shift once to 2 (`10`) through 3 (`11`); shift again to 1 through 1. The common prefix is 1; shifting it back twice yields `100` = 4.

## Time complexity

`O(w)` where `w<=31` for the nonnegative signed-int range.

## Space complexity

`O(1)`.

## Edge-case tests

Assertions cover all official examples, a shared prefix, and adjacent values. `left==right` performs zero shifts and returns that value.

## Reflection questions

1. Why must a changing bit disappear from the AND?
2. Why does `left==right` terminate the loop?
3. Could you find the same result by clearing differing low bits from `right`?
