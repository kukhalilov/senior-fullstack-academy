# sweep-line events and active intervals — Problem: Number of Flowers in Full Bloom

## Goals
- Answer many point queries against inclusive intervals offline.
- Use two sorted endpoint lists and preserve original query order.
- Handle arrivals exactly at bloom start and end.

## Problem statement
Each flower blooms on an inclusive interval `[start,end]`. For every person's arrival time, return the number of flowers in full bloom at that exact time.

## Input constraints
- `1 <= flowers.Length, people.Length <= 50,000`.
- `1 <= start <= end <= 1,000,000,000`.
- `1 <= people[i] <= 1,000,000,000`.

## Examples with expected output
- Flowers `[[1,6],[3,7],[9,12],[4,13]]`, people `[2,3,7,11]` -> `[1,2,2,2]`.
- Flowers `[[1,10],[3,3]]`, people `[3,3,2]` -> `[2,2,1]`.
- Flowers `[[5,5]]`, people `[4,5,6]` -> `[0,1,0]`.

## Clarifying assumptions
- Both interval endpoints are included.
- People are queries; repeated arrival times must receive corresponding repeated answers.
- Output order matches the original `people` array.

## Progressive hints
1. Sort flower starts and ends separately.
2. Sort people by time but store their original indices.
3. At query t, include starts `<=t` and exclude only ends `<t`.
4. The difference between those counts is the number of active flowers.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Linq;

static class Program
{
    static int[] FullBloomFlowers(int[][] flowers, int[] people)
    {
        int[] starts = flowers.Select(f => f[0]).Order().ToArray();
        int[] ends = flowers.Select(f => f[1]).Order().ToArray();
        int[] answer = new int[people.Length];
        int started = 0, endedBefore = 0;

        foreach (int index in Enumerable.Range(0, people.Length).OrderBy(i => people[i]))
        {
            int time = people[index];
            while (started < starts.Length && starts[started] <= time) started++;
            while (endedBefore < ends.Length && ends[endedBefore] < time) endedBefore++;
            answer[index] = started - endedBefore;
        }
        return answer;
    }

    static void Check(int[] expected, int[][] flowers, int[] people)
    {
        int[] actual = FullBloomFlowers(flowers, people);
        if (!expected.SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 1, 2, 2, 2 }, new[] { new[] { 1, 6 }, new[] { 3, 7 }, new[] { 9, 12 }, new[] { 4, 13 } }, new[] { 2, 3, 7, 11 });
        Check(new[] { 2, 2, 1 }, new[] { new[] { 1, 10 }, new[] { 3, 3 } }, new[] { 3, 3, 2 });
        Check(new[] { 0, 1, 0 }, new[] { new[] { 5, 5 } }, new[] { 4, 5, 6 });
        Check(new[] { 1, 1, 0 }, new[] { new[] { 1, 2 } }, new[] { 2, 1, 3 });
        Console.WriteLine("Number of Flowers in Full Bloom checks passed.");
    }
}
```

## Correctness argument
At query time t, `started` counts all flowers with start `<=t`. `endedBefore` counts flowers with end `<t`. Because each flower has `start<=end`, every flower counted as ended is also counted as started. Their difference counts exactly flowers satisfying `start<=t<=end`, which is the inclusive bloom condition. Queries are sorted only to advance the cursors; storing each answer at its original index restores the required output order.

## Step-by-step dry run
For flower `[3,3]` at person time 3, the start cursor advances because start `<=3`; the end cursor does not advance because end is not `<3`. Difference is one, so the zero-length inclusive bloom interval is counted at its single point.

## Time complexity
O(F log F + P log P) for sorting flower endpoints and query indices, plus O(F+P) cursor work.

## Space complexity
O(F+P) for sorted endpoints, query ordering, and output.

## Alternatives and tradeoffs
- Binary search each query: count starts `<=t` minus ends `<t`, O(P log F) after sorting endpoints.
- A full event sweep with a sorted merged list also works, but separate sorted endpoints make inclusive comparisons explicit.
- Online queries arriving in arbitrary order can use the binary-search approach after preprocessing.

## Common mistakes and gotchas

- Subtracting ends `<=t`, which incorrectly excludes flowers blooming through their inclusive end.
- Returning answers in sorted query order instead of original people order.
- Using `start<t` and excluding blooms that begin exactly at arrival.
- Failing to count duplicate people queries independently.
- Assuming interval endpoints are half-open because other scheduling problems use that convention.

## Edge-case tests

- Arrival exactly at start.
- Arrival exactly at inclusive end.
- Single-point flower `[t,t]`.
- Repeated query times.
- No flower active at a query.

## Reflection questions

1. Why does the answer equal starts `<=t` minus ends `<t`?
2. Why are the two endpoint comparisons asymmetric?
3. How can binary search answer queries without sorting people?

## Source
- [Number of Flowers in Full Bloom](https://leetcode.com/problems/number-of-flowers-in-full-bloom/)
