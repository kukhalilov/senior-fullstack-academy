# monotonic stacks and monotonic queues — Problem: Next Greater Element II

## Goals
- Extend next-greater search to a circular sequence.
- Bound a modulo-based scan to two passes.
- Avoid resolving an index with itself or pushing duplicate index copies.

## Problem statement
For each element in a circular integer array, return the first strictly greater value encountered while moving forward, wrapping to the beginning if necessary. Return -1 if no such value exists.

## Input constraints
- `1 <= nums.Length <= 10,000`.
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`.

## Examples with expected output
- `[1,2,1] -> [2,-1,2]`.
- `[1,2,3,4,3] -> [2,3,4,-1,4]`.
- `[5] -> [-1]`.

## Clarifying assumptions
- Search moves forward and may inspect at most the other n-1 elements; an element is not its own next greater value.
- Greater is strict; an equal value does not resolve the query.
- Return the greater value, not its index or distance.

## Progressive hints
1. A linear next-greater stack handles non-wrapping candidates.
2. Simulate a second pass with index `i % n`.
3. Push each original index only during the first pass; during both passes, use current values to resolve waiting indices.
4. A strict `>` condition prevents equal values, including an index meeting itself on a one-element array, from resolving.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int[] NextGreaterElements(int[] nums)
    {
        int n = nums.Length;
        int[] answer = Enumerable.Repeat(-1, n).ToArray();
        var waiting = new Stack<int>();
        for (int i = 0; i < 2 * n; i++)
        {
            int index = i % n;
            while (waiting.Count > 0 && nums[index] > nums[waiting.Peek()])
                answer[waiting.Pop()] = nums[index];
            if (i < n) waiting.Push(index);
        }
        return answer;
    }

    static void Check(int[] expected, int[] input)
    {
        if (!expected.SequenceEqual(NextGreaterElements(input)))
            throw new InvalidOperationException("Next Greater Element II check failed.");
    }

    static void Main()
    {
        Check(new[] { 2, -1, 2 }, new[] { 1, 2, 1 });
        Check(new[] { 2, 3, 4, -1, 4 }, new[] { 1, 2, 3, 4, 3 });
        Check(new[] { -1 }, new[] { 5 });
        Check(new[] { -1, -1, -1 }, new[] { 2, 2, 2 });
        Check(new[] { 3, -1, 3 }, new[] { 1, 3, 2 });
        Console.WriteLine("Next Greater Element II checks passed.");
    }
}
```

## Correctness argument
Every index is pushed once during the first pass. At logical position i, its value is the next value in circular traversal for each still-waiting earlier index. If it is strictly greater than a waiting index's value, it is the first such value because all intervening circular positions were already examined without resolving that index. Popping assigns its answer. The two passes examine every possible later circular position; unresolved indices have no greater value and retain -1.

## Step-by-step dry run
For `[1,2,1]`, first pass pushes 0, then 1 resolves 0 with 2, then pushes 1 and 2. The wraparound pass begins at value 1; it does not resolve 1 or 2. At value 2 on the next logical index, index 2 is popped and receives 2. Index 1 remains -1.

## Time complexity
O(n): at most 2n positions are scanned and every index is pushed once and popped at most once.

## Space complexity
O(n) for the result and stack; auxiliary stack space is O(n).

## Alternatives and tradeoffs
- Scan up to n-1 later positions for every index: O(n²), simple oracle.
- Right-to-left monotonic-stack traversal with duplicated logical range can also work; it requires carefully limiting pushes and result assignment.
- The two-pass unresolved-index form resembles the linear next-greater algorithm and is easy to prove with a waiting stack.

## Common mistakes and gotchas
- Scanning only n positions and missing wraparound candidates.
- Scanning more than 2n positions and reusing the same index as a later answer.
- Pushing during the second pass and duplicating indices.
- Popping on `>=` when the query asks for strictly greater.
- Returning -1 for an index before its circular search is complete.

## Edge-case tests
- One element.
- All equal values.
- Strictly increasing values where the last has no answer.
- A wraparound answer.
- Negative values.

## Reflection questions
1. Why are two logical passes sufficient?
2. Which indices are allowed onto the stack, and when?
3. Why does strict comparison protect the one-element case?

## Source
- [Next Greater Element II](https://leetcode.com/problems/next-greater-element-ii/)
