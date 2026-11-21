# hash maps and frequency tables — Problem: Top K Frequent Elements

## Goals
- Separate frequency counting from selection.
- Use frequency buckets to meet the better-than-O(n log n) follow-up.
- Explain why output order and frequency tie handling are safe under the unique-answer guarantee.

## Problem statement
Return the `k` most frequent distinct values in an integer array, in any order. The answer is guaranteed to be unique.

## Input constraints
- `1 <= nums.Length <= 100,000`.
- `-10,000 <= nums[i] <= 10,000`.
- `k` is between 1 and the number of distinct values.
- The answer is unique.

## Examples with expected output
- `[1,1,1,2,2,3]`, `k=2` -> `[1,2]`.
- `[1]`, `k=1` -> `[1]`.
- `[1,2,1,2,1,2,3,1,3,2]`, `k=2` -> `[1,2]`.

## Clarifying assumptions
- Each value can appear at most once in the result.
- Any output order is accepted.
- The uniqueness guarantee removes ambiguity at the kth-frequency boundary.

## Progressive hints
1. Count occurrences in a map.
2. A value's frequency cannot exceed the input length n.
3. Bucket values by frequency, then scan buckets from n down to 1.
4. Stop after collecting k values; no full ordering is needed.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int[] TopKFrequent(int[] nums, int k)
    {
        var frequency = new Dictionary<int, int>();
        foreach (int value in nums)
            frequency[value] = frequency.GetValueOrDefault(value) + 1;

        var buckets = new List<int>?[nums.Length + 1];
        foreach (var pair in frequency)
        {
            buckets[pair.Value] ??= new List<int>();
            buckets[pair.Value]!.Add(pair.Key);
        }

        var result = new List<int>(k);
        for (int count = nums.Length; count >= 1 && result.Count < k; count--)
        {
            if (buckets[count] is null) continue;
            foreach (int value in buckets[count]!)
            {
                result.Add(value);
                if (result.Count == k) break;
            }
        }
        return result.ToArray();
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
        Console.WriteLine("Top K Frequent checks passed.");
    }
}
```

## Correctness argument
The dictionary counts each distinct value exactly. Every value is placed into the bucket indexed by its count. Scanning buckets in descending frequency order encounters values from greatest count to least. Collecting the first k therefore returns the k most frequent values; because the answer is unique, arbitrary ordering among equal-frequency members cannot change which values qualify.

## Step-by-step dry run
For `[1,1,1,2,2,3]`, frequencies are 1->3, 2->2, 3->1. Bucket 3 yields 1; bucket 2 yields 2. Stop at k=2.

## Time complexity
Expected O(n+u), where n is input length and u the number of distinct values: count, bucket, and scan at most n frequency levels and u values.

## Space complexity
O(n+u) in the bucket array and frequency map; the result uses O(k).

## Alternatives and tradeoffs
- A min-heap of size k uses O(u log k) selection after counting; useful when there are many distinct values and k is small, with expected O(n + u log k) total.
- Sorting all distinct values by frequency is O(u log u), simple but does not satisfy the required better-than-O(n log n) follow-up in the worst case.
- Quickselect can offer expected linear selection but needs tie handling and more delicate partition logic.

## Common mistakes and gotchas
- Returning duplicates by scanning the original array rather than distinct map entries.
- Allocating buckets only to the number of distinct values; a frequency can be as large as n.
- Sorting ascending and stopping too early.
- Ignoring ties when the contract does not promise a unique answer.

## Edge-case tests
- k equals the number of distinct values.
- One distinct value repeated n times.
- Negative values.
- Several values in the same bucket below the kth boundary.

## Reflection questions
1. Why are there at most n frequency buckets?
2. When would a size-k heap use less memory than buckets?
3. How would the interface need to change if ties at the boundary had specified ordering?

## Source
- [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/)
