# binary heaps and priority queues — Problem: Kth Largest Element in a Stream

## Goals
- Maintain only the largest k values seen so far.
- Use a min-heap root as the kth-largest boundary.
- Handle initialization with fewer than k values.

## Problem statement
Create a data structure initialized with integer values and a positive integer `k`. Each `Add(val)` inserts one value and returns the kth-largest value among all values seen so far. The judge guarantees each call occurs after at least k total values exist.

## Input constraints
- `0 <= nums.Length <= 10,000`.
- `1 <= k <= 10,000`.
- `-10,000 <= nums[i], val <= 10,000`.
- At most `10,000` calls to `Add`.
- The stream contains at least k values by every requested answer.

## Examples with expected output
- `k=3, nums=[4,5,8,2]`, add `3,5,10,9,4` -> `4,5,5,8,8`.
- `k=4, nums=[7,7,7,7,8,3]`, add `2,10,9,9` -> `7,7,7,8`.
- `k=1, nums=[]`, add `-5,2` -> `-5,2`.

## Clarifying assumptions
- Duplicate values count as separate stream elements.
- The heap has at most k values. Before it reaches size k, it contains all seen values; afterward it contains the largest k.
- A call before k values exist has no defined answer in the original contract; this implementation throws instead of exposing an invalid `Peek`.

## Progressive hints
1. Keeping all values and sorting on each call is unnecessary.
2. A min-heap of the largest k values has the kth largest at its root.
3. Ignore a new value no larger than the root; otherwise replace the root.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

sealed class KthLargest
{
    private readonly int k;
    private readonly PriorityQueue<int, int> topK = new();

    public KthLargest(int k, int[] nums)
    {
        if (k <= 0) throw new ArgumentOutOfRangeException(nameof(k));
        this.k = k;
        foreach (int value in nums) AddToHeap(value);
    }

    private void AddToHeap(int value)
    {
        if (topK.Count < k) topK.Enqueue(value, value);
        else if (value > topK.Peek())
        {
            topK.Dequeue();
            topK.Enqueue(value, value);
        }
    }

    public int Add(int value)
    {
        AddToHeap(value);
        if (topK.Count < k)
            throw new InvalidOperationException("The stream has fewer than k values.");
        return topK.Peek();
    }
}

static class Program
{
    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var first = new KthLargest(3, new[] { 4, 5, 8, 2 });
        Check(4, first.Add(3)); Check(5, first.Add(5)); Check(5, first.Add(10));
        Check(8, first.Add(9)); Check(8, first.Add(4));

        var duplicates = new KthLargest(4, new[] { 7, 7, 7, 7, 8, 3 });
        Check(7, duplicates.Add(2)); Check(7, duplicates.Add(10));
        Check(7, duplicates.Add(9)); Check(8, duplicates.Add(9));

        var firstValue = new KthLargest(1, Array.Empty<int>());
        Check(-5, firstValue.Add(-5)); Check(2, firstValue.Add(2));
        Console.WriteLine("Kth Largest Element in a Stream checks passed.");
    }
}
```

## Correctness argument
Before the heap contains k values, every value seen is retained. Once it contains k values, its root is the smallest member of the retained set. If a new value is no greater than the root, it cannot belong to the k largest after insertion. If larger, removing the old root and inserting the new value restores the largest-k set. Thus after each insertion once at least k values exist, the root is exactly the kth largest.

## Step-by-step dry run
For k=3 and initial values `4,5,8,2`, the heap retains `{4,5,8}` and root 4. Add 3: it is below the root, so the top three stay unchanged. Add 10: remove 4 and retain `{5,8,10}`, whose root 5 is now the third largest.

## Time complexity
- Initialization: O(m log k), where m is `nums.Length`.
- Each addition: O(log k) when it changes the heap, O(1) when rejected.

## Space complexity
O(k).

## Alternatives and tradeoffs
- A balanced ordered multiset supports richer deletion and rank operations but has more machinery.
- Sorting the entire stream on every addition is simple but costs O(m log m) per query.
- Quickselect is useful for a one-time static kth query, not repeated online updates.

## Common mistakes and gotchas

- Using a max-heap of all seen values and removing until k remains on every call.
- Returning the smallest of all values rather than the smallest among the retained top k.
- Dropping duplicates, which must count as distinct stream positions.
- Assuming the constructor already contains k values; the contract only guarantees enough values by a query.
- Calling `Peek` while fewer than k values exist without defining behavior.
- Comparing with `>=` and needlessly replacing an equal boundary value; it does not change the answer but causes unnecessary heap work.

## Edge-case tests

- k=1 and initially empty data.
- Duplicates at the kth boundary.
- Values below the current root, which must be ignored.
- A new largest value that replaces the root.

## Reflection questions

1. What set of values does the heap represent after it reaches size k?
2. Why is the root kth largest rather than the largest?
3. Why can a value at or below the root be discarded permanently?

## Source
- [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/)
