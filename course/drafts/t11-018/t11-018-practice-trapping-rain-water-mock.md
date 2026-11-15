# timed mock interviews and spaced problem rehearsal — Problem: Trapping Rain Water

## Goals
- Clarify what limits water at each position.
- Compare prefix maxima, two pointers, and a monotonic stack.
- State and test the boundary invariant.

## Problem statement
Given nonnegative bar heights with unit width, return the total water trapped after rain.

## Input constraints
- `1 <= height.Length <= 20,000`.
- `0 <= height[i] <= 100,000`.

## Examples with expected output
- `[0,1,0,2,1,0,1,3,2,1,2,1] -> 6`.
- `[4,2,0,3,2,5] -> 9`.
- `[3,3,3] -> 0`.

## Clarifying assumptions
- Bars have unit width and integer heights; trapped volume is an integer.
- Water at index `i` is `max(0, min(maxLeft[i], maxRight[i]) - height[i])`.
- The input array is not modified.

## Progressive hints
1. For each position, the shorter of the tallest left and right boundaries controls the water level.
2. Prefix and suffix maxima give a direct O(n)-space solution.
3. With two pointers, if the left boundary is no taller than the right boundary, the left side's limiting maximum is already known; process the left position.
4. Track each side's maximum and move inward. Test equal boundaries and monotone arrays.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static long Trap(int[] height)
    {
        int left = 0, right = height.Length - 1;
        int leftMax = 0, rightMax = 0;
        long water = 0;
        while (left <= right)
        {
            if (height[left] <= height[right])
            {
                leftMax = Math.Max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            }
            else
            {
                rightMax = Math.Max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }

    static void Check(long expected, int[] input)
    {
        long actual = Trap(input);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(6, new[] { 0,1,0,2,1,0,1,3,2,1,2,1 });
        Check(9, new[] { 4,2,0,3,2,5 });
        Check(0, new[] { 3,3,3 });
        Check(0, new[] { 1,2,3,4 });
        Check(0, new[] { 4,3,2,1 });
        Check(2, new[] { 2,0,2 });
        Console.WriteLine("Trapping Rain Water checks passed.");
    }
}
```

## Correctness argument
At each iteration, `leftMax` and `rightMax` are the greatest heights seen from their respective ends. If `height[left] <= height[right]`, the current left position has a right boundary at least as tall as its left boundary; its water is therefore determined by `leftMax`. The symmetric argument applies when the right height is smaller. Each position is processed exactly once, adding its exact contribution, so the sum is correct.

## Step-by-step dry run
For `[2,0,2]`, the left height is 2 and right height is 2. Process the left: update `leftMax=2`, add 0. The center is then processed with left height 0 and a right boundary of 2: `leftMax` remains 2, add 2. The final position adds 0, total 2.

## Time complexity
O(n): each pointer moves inward at most n times.

## Space complexity
O(1) auxiliary space, excluding the input.

## Alternatives and tradeoffs
- Prefix and suffix maxima: O(n) time and O(n) auxiliary arrays; easiest to explain directly from the formula.
- Monotonic decreasing stack: O(n) time and O(n) space; computes bounded basins when a taller right bar arrives, but its width/height arithmetic is easier to get wrong.
- Two pointers: O(n) time and O(1) space; needs the boundary argument above.

## Common mistakes and gotchas
- Using `maxLeft - height` without limiting it by the right side.
- Adding negative water when a new maximum is found; updating the maximum first prevents this.
- Moving the taller pointer without proving why the opposite side controls the current contribution.
- Using `int` for total water without bounding the sum; `long` makes the accumulator robust.

## Edge-case tests
- One bar and equal bars.
- Strictly increasing and decreasing heights.
- A single basin `[2,0,2]`.
- Both official examples.

## Reflection questions
1. Why is the smaller current boundary sufficient to process one side?
2. What state would a monotonic stack store?
3. Which approach would you choose first under interview pressure and why?

## Source
- [Trapping Rain Water](https://leetcode.com/problems/trapping-rain-water/)
