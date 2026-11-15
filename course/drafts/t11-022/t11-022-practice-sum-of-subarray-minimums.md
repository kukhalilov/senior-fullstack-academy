# monotonic stacks and monotonic queues — Problem: Sum of Subarray Minimums

## Goals
- Count how many contiguous subarrays assign each index as their minimum.
- Use asymmetric strictness to assign tied minima exactly once.
- Accumulate products and modulo safely.

## Problem statement
For every nonempty contiguous subarray of `arr`, take its minimum and sum all these minima. Return the sum modulo 1,000,000,007.

## Input constraints
- `1 <= arr.Length <= 30,000`.
- `1 <= arr[i] <= 30,000`.

## Examples with expected output
- `[3,1,2,4] -> 17`.
- `[11,81,94,43,3] -> 444`.
- `[2,2] -> 6`.

## Clarifying assumptions
- Subarrays are contiguous and nonempty.
- Equal minima must not cause a subarray to be counted more than once.
- Modulo is applied to the final mathematical sum; intermediate products use a wider integer type.

## Progressive hints
1. Assign each subarray to one occurrence of its minimum.
2. For each index i, find its previous strictly smaller boundary and next smaller-or-equal boundary.
3. The number of owned subarrays is `(i-left) * (right-i)`.
4. Pop while top height is greater than or equal to current; this makes equal minima owned by the rightmost equal occurrence.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    const long Mod = 1_000_000_007;

    static int SumSubarrayMins(int[] arr)
    {
        var stack = new Stack<int>();
        long total = 0;
        for (int i = 0; i <= arr.Length; i++)
        {
            int current = i == arr.Length ? 0 : arr[i];
            while (stack.Count > 0 && (i == arr.Length || arr[stack.Peek()] >= current))
            {
                int index = stack.Pop();
                int left = stack.Count == 0 ? -1 : stack.Peek();
                long leftChoices = index - left;
                long rightChoices = i - index;
                long contribution = (arr[index] * leftChoices % Mod) * rightChoices % Mod;
                total = (total + contribution) % Mod;
            }
            if (i < arr.Length) stack.Push(i);
        }
        return (int)total;
    }

    static void Check(int expected, int[] arr)
    {
        int actual = SumSubarrayMins(arr);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(17, new[] { 3, 1, 2, 4 });
        Check(444, new[] { 11, 81, 94, 43, 3 });
        Check(6, new[] { 2, 2 });
        Check(50, new[] { 5, 5, 5, 5 });
        Check(10, new[] { 1, 3, 2 });
        Console.WriteLine("Sum of Subarray Minimums checks passed.");
    }
}
```

## Correctness argument
For each index i, popping on `>=` gives the nearest right index with value less than or equal to `arr[i]`; after popping, the remaining top is the nearest left index with value strictly less than `arr[i]`. Therefore any subarray beginning after the left boundary and ending before the right boundary contains `arr[i]` and no value smaller than it, with equal minima assigned to the rightmost occurrence. There are `(i-left)*(right-i)` such start/end choices. Every subarray has exactly one assigned minimum occurrence under this tie rule. Summing each occurrence's value times its assigned count yields the total, and modulo preserves the requested residue.

## Step-by-step dry run
For `[2,2]`, index 0 is popped when index 1 arrives: left=-1, right=1, so it owns one singleton. Index 1 is popped at the virtual end: left=-1, right=2, so it owns two subarrays. Contributions are 2 and 4, total 6. The full range is assigned only to the rightmost equal value.

## Time complexity
O(n): each index is pushed once and popped once.

## Space complexity
O(n) for the monotonic index stack.

## Alternatives and tradeoffs
- Enumerate all subarrays and update running minimum in O(n²) time; useful for a brute-force oracle on small arrays.
- Compute left and right boundary arrays separately, making ownership easier to inspect but using additional O(n) arrays.
- A segment tree can answer range minima but is unnecessary for this aggregate and is more complex.

## Common mistakes and gotchas

- Using identical strictness on both sides and double-counting or missing ties.
- Forgetting the empty virtual boundary at index n to flush the stack.
- Using `int` for span multiplication before widening.
- Reducing modulo too late for larger adapted constraints.
- Calling the left boundary “previous smaller” without specifying strictness.

## Edge-case tests
- All values equal.
- Strictly increasing and decreasing arrays.
- Single element.
- Small brute-force comparison on random arrays.
- Values near maximum 30,000.

## Reflection questions
1. Which occurrence owns a subarray with equal minimum values under this convention?
2. What are the exact strictness relations for left and right boundaries?
3. How can brute force validate the contribution formula on small inputs?

## Source
- [Sum of Subarray Minimums](https://leetcode.com/problems/sum-of-subarray-minimums/)
