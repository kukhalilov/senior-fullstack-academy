# two-pointer and sliding-window techniques — Problem: Container With Most Water

## Goals

- Derive the container-area formula from width and limiting height.
- Prove why advancing the shorter boundary is safe.
- Distinguish the greedy elimination proof from a heuristic guess.

## Problem statement

Given an array height where height[i] is the height of a vertical line at horizontal position i, choose two different lines and the x-axis to form a container. Return the maximum area it can hold. The sides stay vertical and may not be slanted.

## Input constraints

- 2 <= height.Length <= 100,000.
- 0 <= height[i] <= 10,000.
- The area for a pair at indices left and right is `(right - left) * min(height[left], height[right])`.

## Examples with expected output

1. height = [1,8,6,2,5,4,8,3,7] -> 49.
2. height = [1,1] -> 1.
3. height = [4,3,2,1,4] -> 16.
4. height = [1,2,1] -> 2.

## Clarifying assumptions

- Width is the difference between indices, not the number of positions inclusive.
- The shorter line limits the water height; extra height on the taller side cannot compensate for it.
- The input is not sorted by height. These pointers use endpoints and a greedy proof, not sorted-value elimination.
- The function returns an integer area. Under the given constraints the maximum is at most 999,990,000, which fits in a signed 32-bit integer; the implementation uses `long` while calculating to make the multiplication explicit and safe under nearby generalizations.

## Progressive hints

1. The outermost pair has the largest available width. Compute its area using the shorter line.
2. If the left line is shorter, any pair using it and a line further right has smaller width and height no greater than that same short left line.
3. Therefore no untested pair that keeps the shorter left line can improve the answer. Move the shorter side inward and evaluate the new pair.
4. If the heights are equal, either side can be advanced: keeping one of these limiting-height lines while reducing width cannot improve area.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int MaxArea(int[] height)
    {
        if (height is null) throw new ArgumentNullException(nameof(height));
        if (height.Length < 2) throw new ArgumentException("At least two lines are required.", nameof(height));

        int left = 0;
        int right = height.Length - 1;
        long best = 0;

        while (left < right)
        {
            int limitingHeight = Math.Min(height[left], height[right]);
            long area = (long)(right - left) * limitingHeight;
            best = Math.Max(best, area);

            if (height[left] <= height[right]) left++;
            else right--;
        }

        return checked((int)best);
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(MaxArea(new[] { 1, 8, 6, 2, 5, 4, 8, 3, 7 }), 49, "Example 1");
        AssertEqual(MaxArea(new[] { 1, 1 }), 1, "Example 2");
        AssertEqual(MaxArea(new[] { 4, 3, 2, 1, 4 }), 16, "Example 3");
        AssertEqual(MaxArea(new[] { 1, 2, 1 }), 2, "Example 4");
        AssertEqual(MaxArea(new[] { 0, 0, 0 }), 0, "Zero heights");
        Console.WriteLine("All Container With Most Water checks passed.");
    }
}
```

## Correctness argument

For any pair, area is width multiplied by the shorter boundary height. Assume height[left] <= height[right]. Consider any unexamined pair that still uses the current left line and an index j < right. Its width is smaller than `right - left`, while its limiting height is at most height[left], the same limiting height that bounds the current pair. Its area therefore cannot exceed the current pair's area. The current pair has already been evaluated, so no remaining optimal pair needs this left endpoint. Advance left. The symmetric argument applies when the right line is shorter. On a tie either endpoint is no longer useful with the other held fixed. Repeating this elimination leaves every potentially optimal pair evaluated before its endpoint is discarded. The maximum recorded area is therefore optimal.

## Step-by-step dry run

For `[1,8,6,2,5,4,8,3,7]`:

| left index/height | right index/height | width | area | move |
|---|---|---:|---:|---|
| 0 / 1 | 8 / 7 | 8 | 8 | left is shorter; advance left |
| 1 / 8 | 8 / 7 | 7 | 49 | right is shorter; retreat right |
| 1 / 8 | 7 / 3 | 6 | 18 | retreat right |

The scan continues inward; none exceeds 49. Each move discards an endpoint that cannot form a better container with any remaining opposite endpoint.

## Time complexity

O(n), because one pointer moves inward on every iteration until the pointers meet.

## Space complexity

O(1) auxiliary space; the input is not modified.

## Alternatives and tradeoffs

- Brute force evaluates every index pair in O(n²) time and O(1) extra space. It is useful as a small-input oracle for testing the optimized solution.
- A greedy choice based on the taller side has no corresponding elimination proof: width shrinks while the limiting side may remain unchanged. Advancing the shorter side is the justified move.
- This is not a sliding window with a validity predicate; it is a pair search whose candidate elimination follows from the area upper bound.

## Common mistakes and gotchas

- Using the taller height instead of the shorter limiting line.
- Using `right - left + 1` for width; horizontal distance is `right - left`.
- Advancing the taller side and assuming the taller line is the bottleneck.
- Forgetting to evaluate a pair before discarding one endpoint.
- Claiming the input must be sorted by height; it must remain in position order.
- Multiplying in a narrow type before widening. Cast before multiplication when bounds may exceed Int32.
- Ending at `left <= right`; a line cannot pair with itself.

## Edge-case tests

- Exactly two lines.
- All heights are zero.
- Equal endpoint heights.
- A short line at one end forces repeated movement.
- Tall lines at both ends with a narrow interior valley.

## Reflection questions

1. Which endpoint has a provably limited set of candidate pairs after evaluating the current area?
2. Why can increasing width by choosing a different pair not be done after the pointers move inward?
3. Why is this algorithm's proof different from a sorted two-sum scan?
4. How would you use brute force to cross-check a randomized small set of inputs?

Source: [LeetCode: Container With Most Water](https://leetcode.com/problems/container-with-most-water/).
