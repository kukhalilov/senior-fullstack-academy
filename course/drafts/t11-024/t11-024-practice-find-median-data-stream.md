# binary heaps and priority queues — Problem: Find Median from Data Stream

## Goals
- Represent the lower and upper halves with opposite heaps.
- Maintain both ordering and size invariants after every insertion.
- Avoid overflow when averaging the two middle values.

## Problem statement
Implement `AddNum(int num)` and `FindMedian()`. When the number of stored values is odd, return its middle value; when even, return the arithmetic mean of the two middle values. Values arrive one at a time and queries may occur between insertions.

## Input constraints
- `-100,000 <= num <= 100,000`.
- At least one value exists when `FindMedian` is called.
- At most `50,000` add and median calls.

## Examples with expected output
- `Add(1), Add(2), Find(), Add(3), Find() -> 1.5, 2.0`.
- `Add(5), Find() -> 5.0`.
- `Add(-1), Add(-2), Find() -> -1.5`.

## Clarifying assumptions
- Duplicate values are separate stream elements.
- .NET's `PriorityQueue` dequeues the lowest priority, so the lower half uses a reversed comparer to act as a max-heap.
- The median uses floating-point division. Cast before adding the two middle values so a general `int` implementation cannot overflow before division.

## Progressive hints
1. Sorting all values on every query costs O(n log n) per query.
2. Keep the lower half in a max-heap and upper half in a min-heap.
3. Maintain `lower.Count == upper.Count` or `lower.Count == upper.Count + 1`, and require every lower value to be no greater than every upper value.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

sealed class MedianFinder
{
    private readonly PriorityQueue<int, int> lower =
        new(Comparer<int>.Create((a, b) => b.CompareTo(a)));
    private readonly PriorityQueue<int, int> upper = new();

    public void AddNum(int num)
    {
        if (lower.Count == 0 || num <= lower.Peek()) lower.Enqueue(num, num);
        else upper.Enqueue(num, num);

        if (lower.Count < upper.Count)
        {
            int value = upper.Dequeue();
            lower.Enqueue(value, value);
        }
        else if (lower.Count > upper.Count + 1)
        {
            int value = lower.Dequeue();
            upper.Enqueue(value, value);
        }
    }

    public double FindMedian()
    {
        if (lower.Count == 0) throw new InvalidOperationException("No values have been added.");
        if (lower.Count > upper.Count) return lower.Peek();
        return ((double)lower.Peek() + upper.Peek()) / 2.0;
    }
}

static class Program
{
    static void Check(double expected, double actual)
    {
        if (Math.Abs(expected - actual) > 1e-9)
            throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var first = new MedianFinder();
        first.AddNum(1); first.AddNum(2); Check(1.5, first.FindMedian());
        first.AddNum(3); Check(2, first.FindMedian());

        var duplicates = new MedianFinder();
        duplicates.AddNum(2); duplicates.AddNum(2); duplicates.AddNum(2);
        Check(2, duplicates.FindMedian());

        var negatives = new MedianFinder();
        negatives.AddNum(-1); negatives.AddNum(-2); Check(-1.5, negatives.FindMedian());

        var extremes = new MedianFinder();
        extremes.AddNum(int.MinValue); extremes.AddNum(int.MaxValue);
        Check(-0.5, extremes.FindMedian());
        Console.WriteLine("Find Median from Data Stream checks passed.");
    }
}
```

## Correctness argument
The lower heap stores the smaller half and exposes its maximum; the upper heap stores the larger half and exposes its minimum. Insertion into one side followed by moving a root when sizes differ by more than one restores the size invariant. If a value was placed by comparison with the lower maximum, it cannot cross the partition in the wrong direction; moving a boundary root preserves `max(lower) <= min(upper)`. Thus an odd stream's median is the extra lower root, and an even stream's middle values are exactly the two roots.

## Step-by-step dry run
Add 1 to lower: sizes `(1,0)`. Add 2 to upper: `(1,1)`. Add 3 to upper because `3>1`, then move upper's minimum 2 to lower: `(2,1)`. The lower root is 2, the middle of three values.

## Time complexity
- `AddNum`: O(log n) due to at most one insertion and one root move.
- `FindMedian`: O(1).

## Space complexity
O(n), because all stream values are retained.

## Alternatives and tradeoffs
- A sorted list gives O(1) median access but O(n) insertion.
- Two heaps are the standard choice for online median queries.
- If only one median is needed after all input is known, selection can avoid storing two ordered halves; for arbitrary streaming queries, selection would have to repeat.

## Common mistakes and gotchas

- Using two min-heaps, which does not expose the lower half's maximum.
- Balancing counts without ensuring all lower values precede upper values.
- Moving more than one item even though a single insertion changes the size difference by at most one.
- Adding two `int` roots before converting to `double`; the addition can overflow.
- Forgetting that a median API must define behavior on an empty stream; the problem contract avoids that call, while this implementation throws explicitly.
- Assuming heap iteration produces sorted halves; only each root is useful for the median.

## Edge-case tests

- One value and repeated equal values.
- Odd and even counts.
- Negative values.
- `int.MinValue` and `int.MaxValue` to expose premature integer overflow.

## Reflection questions

1. Why does the lower heap have one extra value when the total count is odd?
2. Which exact relation between the two roots proves the partition is ordered?
3. Why does an even median need a wider intermediate type?

## Source
- [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/)
