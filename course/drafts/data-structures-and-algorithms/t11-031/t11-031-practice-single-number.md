# bitwise operations, masks, and subset enumeration — Problem: Single Number

## Goals

Use XOR cancellation to find the unique value and state precisely which multiplicity contract makes it correct.

## Problem statement

Given a nonempty integer array where every value occurs twice except one, return that single value in linear time and constant extra space. [Official problem statement](https://leetcode.com/problems/single-number/)

## Input constraints

- `1 <= nums.Length <= 30,000`.
- `-30,000 <= nums[i] <= 30,000`.
- Every value occurs twice except one value that occurs once.

## Examples with expected output

1. `[2,2,1]` → `1`.
2. `[4,1,2,1,2]` → `4`.
3. `[1]` → `1`.

## Clarifying assumptions

Exactly one value is a singleton; all other values occur exactly twice. XOR works for signed `int` values because it operates on their fixed-width bit patterns and the same pattern cancels itself.

## Progressive hints

1. Which operation is its own inverse?
2. Pair equal values in any order; what does each pair contribute?
3. Start the accumulator at zero and XOR every value.

## Complete C# solution

```csharp dsa-solution
using System;
static int SingleNumber(int[] nums)
{
    int answer = 0;
    foreach (int value in nums) answer ^= value;
    return answer;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(SingleNumber(new[] {2,2,1}), 1, "example 1");
Check(SingleNumber(new[] {4,1,2,1,2}), 4, "example 2");
Check(SingleNumber(new[] {1}), 1, "example 3");
Check(SingleNumber(new[] {-7,5,-7}), 5, "negative pair");
Check(SingleNumber(new[] {0,0,-3}), -3, "zero pair");
Console.WriteLine("All Single Number checks passed.");
```

## Correctness argument

XOR is associative and commutative, so the input can be regrouped into equal pairs and the singleton. Each pair contributes `x^x=0`; zero contributes nothing because `0^y=y`. The final accumulator is therefore exactly the single value. The loop processes each input once and uses one accumulator.

## Step-by-step dry run

For `[4,1,2,1,2]`: `0^4=4`; `^1=5`; `^2=7`; `^1=6`; `^2=4`. The repeated values cancel and the result is 4.

## Time complexity

`O(n)`.

## Space complexity

`O(1)` extra space.

## Edge-case tests

Assertions cover every official example, a negative repeated value, and a zero pair. XOR is over integer bit patterns, so negative values are supported under the same equality contract.

## Reflection questions

1. Why does XOR not work if another value occurs three times?
2. How would the approach change if two values occur once and all others twice?
3. Does input order affect the result?
