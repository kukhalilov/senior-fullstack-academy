# sets and membership algorithms — Problem: Happy Number

## Goals
- Detect whether repeated transformations reach a fixed point or a nontrivial cycle.
- Use a visited set for a direct proof of termination.
- Compare stored-state detection with Floyd's cycle detection.

## Problem statement
Starting from a positive integer, repeatedly replace it with the sum of the squares of its decimal digits. Return true if the sequence reaches 1; return false if it loops in a cycle that excludes 1.

## Input constraints
- `1 <= n <= 2^31 - 1`.

## Examples with expected output
- `19 -> true`: `19 -> 82 -> 68 -> 100 -> 1`.
- `2 -> false`.
- `1 -> true`.

## Clarifying assumptions
- Arithmetic uses base-10 digits.
- Once the value reaches 1, it remains 1 under the transform.
- A repeated non-1 value proves the deterministic sequence will loop forever.

## Progressive hints
1. Write a helper that sums the squares of the decimal digits.
2. Store each value before transforming it.
3. Reaching 1 is success; encountering a previously seen value is failure.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int Next(int value)
    {
        int sum = 0;
        while (value > 0)
        {
            int digit = value % 10;
            sum += digit * digit;
            value /= 10;
        }
        return sum;
    }

    static bool IsHappy(int n)
    {
        var seen = new HashSet<int>();
        while (n != 1 && seen.Add(n))
            n = Next(n);
        return n == 1;
    }

    static void Check(bool expected, int n)
    {
        bool actual = IsHappy(n);
        if (actual != expected) throw new InvalidOperationException($"Unexpected result for {n}.");
    }

    static void Main()
    {
        Check(true, 19);
        Check(false, 2);
        Check(true, 1);
        Check(true, 7);
        Check(false, 4);
        Check(false, int.MaxValue);
        Console.WriteLine("Happy Number checks passed.");
    }
}
```

## Correctness argument
`Next` computes exactly the sum of squared base-10 digits by repeatedly taking the final digit and removing it. The loop stops successfully if n becomes 1. Otherwise, `seen.Add(n)` is false exactly when n has occurred earlier. Because the transform is deterministic, repeating a value repeats the entire future sequence, so 1 will never be reached if it was not reached already. Thus returning `n == 1` matches the definition.

## Step-by-step dry run
For 19, `Next(19)=1²+9²=82`; `Next(82)=68`; `Next(68)=100`; `Next(100)=1`. The loop exits at 1 and returns true.

## Time complexity
O(d * r) where d is the number of decimal digits processed per transformation and r is the number of distinct sequence values before reaching 1 or repeating. For 32-bit positive inputs, transformed values quickly fall into a small range.

## Space complexity
O(r) for the visited set.

## Alternatives and tradeoffs
- Floyd's tortoise-and-hare detects the cycle with O(1) extra space, applying `Next` once to slow and twice to fast until they meet; then compare the meeting value with 1.
- A seen set is easier to explain because it records the repeated state directly.
- A hard-coded known unhappy cycle is less general and should not replace cycle reasoning.

## Common mistakes and gotchas
- Checking only whether the next value is 1 and looping forever for unhappy inputs.
- Forgetting that a repeated value proves a cycle only because the transformation is deterministic.
- Using string conversion for digits when arithmetic is sufficient.
- Mishandling 1 as an ordinary repeated state instead of the success condition.

## Edge-case tests
- Initial value 1.
- Known happy value 19.
- Known unhappy value 2.
- Another happy number such as 7.
- Maximum permitted positive int.

## Reflection questions
1. Why does a repeated state imply the process will never newly reach 1?
2. What state does Floyd's algorithm save memory by not storing?
3. Why does the transform quickly map large inputs to small values?

## Source
- [Happy Number](https://leetcode.com/problems/happy-number/)
