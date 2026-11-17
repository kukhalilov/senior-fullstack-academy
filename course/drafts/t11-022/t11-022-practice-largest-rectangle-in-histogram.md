# monotonic stacks and monotonic queues — Problem: Largest Rectangle in Histogram

## Goals
- Relate a bar's height to its nearest smaller boundaries.
- Compute a maximal width with carefully defined exclusive boundaries.
- Use a monotonic stack and safe area arithmetic.

## Problem statement
Given unit-width histogram bars with nonnegative heights, return the area of the largest rectangle contained in the histogram.

## Input constraints
- `1 <= heights.Length <= 100,000`.
- `0 <= heights[i] <= 10,000`.

## Examples with expected output
- `[2,1,5,6,2,3] -> 10`.
- `[2,4] -> 4`.
- `[2,2] -> 4`.

## Clarifying assumptions
- A rectangle covers a contiguous set of whole bars and cannot exceed any covered bar's height.
- Each bar width is exactly 1.
- Heights may be zero; use a wide type for products if adapting the constraints.

## Progressive hints
1. Fix a bar of height h as the rectangle's limiting minimum.
2. For this implementation, the surviving left boundary is strictly smaller, while the current right boundary may be smaller or equal. Equal heights are assigned to the later bar; its span can extend across earlier equal bars.
3. Width is `rightBoundary - leftBoundary - 1`.
4. Scan left to right and pop bars when the current height is less than or equal to the stack top; the current index becomes the popped bar's right boundary.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static long LargestRectangleArea(int[] heights)
    {
        int n = heights.Length;
        var stack = new Stack<int>();
        long best = 0;
        for (int i = 0; i <= n; i++)
        {
            int currentHeight = i == n ? 0 : heights[i];
            while (stack.Count > 0 && heights[stack.Peek()] >= currentHeight)
            {
                int index = stack.Pop();
                int leftBoundary = stack.Count == 0 ? -1 : stack.Peek();
                int width = i - leftBoundary - 1;
                best = Math.Max(best, (long)heights[index] * width);
            }
            if (i < n) stack.Push(i);
        }
        return best;
    }

    static void Check(long expected, int[] heights)
    {
        long actual = LargestRectangleArea(heights);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(10, new[] { 2, 1, 5, 6, 2, 3 });
        Check(4, new[] { 2, 4 });
        Check(4, new[] { 2, 2 });
        Check(9, new[] { 3, 3, 3 });
        Check(0, new[] { 0, 0 });
        Check(3, new[] { 2, 1, 2 });
        Console.WriteLine("Largest Rectangle checks passed.");
    }
}
```

## Correctness argument
When index i arrives, every popped bar has height greater than or equal to the current height. For a popped bar, i is its first right boundary with a smaller-or-equal height, not necessarily a strictly smaller one. After popping, the new stack top is strictly smaller than the popped bar and is its nearest surviving left boundary: any intervening bar that could block that boundary would still be above it on the stack. The candidate width `i-leftBoundary-1` is therefore valid. Equal-height bars can share the same maximal rectangle; popping `>=` assigns that span to the rightmost equal bar, which can extend across the earlier equal bars. Thus at least one representative evaluates the maximal area for each possible limiting height.

## Step-by-step dry run
For `[2,1,5,6,2,3]`, index 3 of height 6 is popped when height 2 arrives at index 4. Its left boundary is index 2 (height 5), so width 1 and area 6. Then height 5 at index 2 is also popped; its left boundary is index 1 (height 1), so width `4-1-1=2` and area 10.

## Time complexity
O(n): each bar index is pushed once and popped at most once.

## Space complexity
O(n) for the index stack.

## Alternatives and tradeoffs
- Compute previous and next smaller arrays separately, then evaluate each bar; also O(n) time and O(n) space, with more explicit boundaries.
- Divide and conquer around a minimum can be O(n log n) with range-minimum support or O(n²) in a bad recursive shape without it.
- A quadratic enumeration is a useful small-input oracle.

## Common mistakes and gotchas
- Using `i-leftBoundary` instead of `i-leftBoundary-1` for exclusive boundaries.
- Forgetting to flush the stack at the end.
- Keeping equal heights without a tie rule, potentially missing the full-width rectangle.
- Multiplying in int before widening.
- Treating the virtual zero at i=n as a real bar to push.

## Edge-case tests
- Strictly increasing and decreasing bars.
- Repeated equal heights.
- Zero-height bars.
- A wide rectangle bounded by lower bars.
- Two bars only.

## Reflection questions
1. Why is the stack top after a pop the nearest smaller left boundary?
2. How does the sentinel flush unresolved heights?
3. Why does each optimal rectangle appear among the evaluated spans?

## Source
- [Largest Rectangle in Histogram](https://leetcode.com/problems/largest-rectangle-in-histogram/)
