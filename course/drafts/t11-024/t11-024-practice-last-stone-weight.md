# binary heaps and priority queues — Problem: Last Stone Weight

## Goals
- Use repeated maximum extraction from a max-priority queue.
- Reinsert only the nonzero smash difference.
- Explain why a heap fits a changing collection.

## Problem statement
On each turn, remove the two heaviest stones x<=y. If equal, both disappear; otherwise x disappears and y becomes `y-x`. Return the final stone weight, or 0 if none remain.

## Input constraints
- `1 <= stones.Length <= 30`.
- `1 <= stones[i] <= 1,000`.

## Examples with expected output
- `[2,7,4,1,8,1] -> 1`.
- `[1] -> 1`.
- `[2,2] -> 0`.

## Clarifying assumptions
- Choose the two largest current weights after every previous smash.
- Equal stones are both destroyed; the zero difference is not reinserted.
- .NET's built-in `PriorityQueue` is a min-priority queue by default, so this solution supplies a reversed comparer.

## Progressive hints
1. Sorting after every smash is correct but repeats O(n log n) work.
2. Keep a max-priority queue and remove its root twice each turn.
3. Reinsert the positive difference only when weights differ.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int LastStoneWeight(int[] stones)
    {
        var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
        foreach (int stone in stones) maxHeap.Enqueue(stone, stone);

        while (maxHeap.Count > 1)
        {
            int heaviest = maxHeap.Dequeue();
            int second = maxHeap.Dequeue();
            if (heaviest != second)
            {
                int difference = heaviest - second;
                maxHeap.Enqueue(difference, difference);
            }
        }
        return maxHeap.Count == 0 ? 0 : maxHeap.Dequeue();
    }

    static void Check(int expected, int[] stones)
    {
        int actual = LastStoneWeight(stones);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(1, new[] { 2, 7, 4, 1, 8, 1 });
        Check(1, new[] { 1 });
        Check(0, new[] { 2, 2 });
        Check(2, new[] { 3, 7, 2 });
        Console.WriteLine("Last Stone Weight checks passed.");
    }
}
```

## Correctness argument
The heap comparator makes its root the largest current stone. Each loop removes the two largest weights as required. Equal stones are both discarded; unequal stones produce exactly one stone of their difference, which is inserted for future turns. The collection therefore matches the game state after every turn. The loop stops with zero or one item, which is precisely the requested result.

## Step-by-step dry run
For `[2,2]`, remove 2 and 2. They are equal, so insert nothing. The heap becomes empty and the answer is 0.

## Time complexity
O(n log n) worst case: at most n-1 turns, each with a constant number of O(log n) heap operations.

## Space complexity
O(n) for the heap.

## Alternatives and tradeoffs
- Sort the small array on every turn; simple but O(n² log n) in the worst case.
- A custom binary max-heap exposes the sift operations and avoids comparer setup, but adds implementation code.
- With n<=30, many approaches pass; the heap illustrates dynamic extremum selection.

## Common mistakes and gotchas

- Using the default .NET min-priority order and removing the lightest stones.
- Reinserting zero when equal stones are destroyed.
- Reusing the original sorted order after a smash without inserting the difference.
- Assuming equal priorities dequeue FIFO; order is irrelevant for equal weights here.

## Edge-case tests

- One stone.
- Two equal stones.
- Two unequal stones.
- Several stones producing repeated equal priorities.

## Reflection questions

1. Why is a heap more suitable than sorting on every turn?
2. How does the custom comparer reverse .NET's default priority direction?
3. What is the maximum number of smash turns?

## Source
- [Last Stone Weight](https://leetcode.com/problems/last-stone-weight/)
