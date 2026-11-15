# binary heaps and priority queues — Problem: Top K Frequent Elements

## Goals
- Count each value and retain only the k strongest frequency records.
- Use a size-k min-heap so its root is the weakest retained candidate.
- State when the unique-answer guarantee matters for ties.

## Problem statement
Return the k most frequent distinct values in `nums`, in any order. The set of k answers is guaranteed to be unique.

## Input constraints
- `1 <= nums.Length <= 100,000`.
- `-10,000 <= nums[i] <= 10,000`.
- `1 <= k <= number of distinct values`.
- The answer is unique.

## Examples with expected output
- `[1,1,1,2,2,3]`, k=2 -> `[1,2]`.
- `[1]`, k=1 -> `[1]`.
- `[1,2,1,2,1,2,3,1,3,2]`, k=2 -> `[1,2]`.

## Clarifying assumptions
- Return each value at most once.
- Output order is irrelevant.
- A tie within selected values is harmless; uniqueness guarantees no ambiguity about which values cross the kth boundary.

## Progressive hints
1. Build a frequency map in one pass.
2. Sorting all values by frequency costs O(u log u), where u is distinct count.
3. Keep a min-heap of at most k `(value,frequency)` records.
4. Replace the root only when a new frequency is strictly greater; equality at the cutoff cannot occur for a unique answer.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int[] TopKFrequent(int[] nums, int k)
    {
        var counts = new Dictionary<int, int>();
        foreach (int value in nums) counts[value] = counts.GetValueOrDefault(value) + 1;

        var heap = new PriorityQueue<(int Value, int Frequency), int>();
        foreach (var pair in counts)
        {
            if (heap.Count < k)
                heap.Enqueue((pair.Key, pair.Value), pair.Value);
            else if (pair.Value > heap.Peek().Frequency)
            {
                heap.Dequeue();
                heap.Enqueue((pair.Key, pair.Value), pair.Value);
            }
        }
        return heap.UnorderedItems.Select(item => item.Element.Value).ToArray();
    }

    static void Check(int[] expected, int[] nums, int k)
    {
        int[] actual = TopKFrequent(nums, k);
        if (!expected.Order().SequenceEqual(actual.Order()))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 1, 2 }, new[] { 1, 1, 1, 2, 2, 3 }, 2);
        Check(new[] { 1 }, new[] { 1 }, 1);
        Check(new[] { 1, 2 }, new[] { 1, 2, 1, 2, 1, 2, 3, 1, 3, 2 }, 2);
        Check(new[] { -1, 5 }, new[] { -1, -1, 5, 5, 5, 2 }, 2);
        Check(new[] { 4, 9 }, new[] { 4, 9, 4, 9, 4, 2, 3, 4, 9, 9, 2 }, 2);
        Console.WriteLine("Top K Frequent checks passed.");
    }
}
```

## Correctness argument
The map computes exact frequencies. Before the heap reaches size k, every distinct value is retained. Thereafter the heap root is the minimum frequency among the retained candidates. A new record replaces it only if its frequency is larger, preserving the invariant that the heap contains the best k values seen. After all u values, it contains the k most frequent. The uniqueness guarantee ensures a tie cannot require choosing between a selected and excluded value at the cutoff.

## Step-by-step dry run
For `[1,1,1,2,2,3]`, frequencies are 3,2,1. Insert the first two into the size-2 heap; its root has frequency 2. Frequency 1 does not replace it, so the retained values are 1 and 2.

## Time complexity
Expected O(n + u log k), where n is input length and u is distinct value count.

## Space complexity
O(u+k) for frequency counts and heap; k<=u.

## Alternatives and tradeoffs
- Frequency buckets achieve O(n+u) when maximum frequency is bounded by n and no ordering beyond top-k is needed.
- Sorting records costs O(u log u) and is simpler when a full ranking is useful.
- Quickselect can find a static kth frequency boundary in expected O(u), but the bounded heap has predictable O(u log k) behavior and naturally generalizes to a stream.

## Common mistakes and gotchas

- Using a max-heap of all values and removing u-k elements unnecessarily.
- Storing repeated input values in the heap rather than one frequency record per distinct key.
- Replacing the root on `>=` when tie membership is ambiguous and the contract does not guarantee uniqueness.
- Treating `UnorderedItems` as sorted output; this code returns any order.
- Forgetting that .NET priority queues are min-priority by default.

## Edge-case tests

- k=1.
- k equals the number of distinct values.
- Negative values.
- Several selected values have equal frequency while cutoff remains unique.

## Reflection questions

1. What does the size-k heap root represent?
2. Why does the uniqueness guarantee resolve cutoff ties?
3. When can frequency buckets beat a heap?

## Source
- [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
