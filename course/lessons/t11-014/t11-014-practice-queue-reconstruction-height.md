# greedy choices, invariants, and correctness proofs — Problem: Queue Reconstruction by Height

## Goals
- Reconstruct a queue from each person's height and count of preceding people at least as tall.
- Place taller people before shorter people so later insertions cannot change their counts.
- Explain the equal-height tie order and the placement invariant.

## Problem statement
Each person is [h,k], where h is height and k is the number of people before them whose height is at least h. Reorder the input so every person has exactly the stated count.

## Input constraints

- 1 <= people.Length <= 2,000.
- 0 <= h <= 1,000,000.
- 0 <= k < people.Length.
- The input is guaranteed to admit a reconstruction.

## Examples with expected output

- [[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]] -> [[5,0],[7,0],[5,2],[6,1],[4,4],[7,1]].
- [[6,0],[5,0],[4,0],[3,2],[2,2],[1,4]] -> [[4,0],[5,0],[2,2],[3,2],[1,4],[6,0]].

## Clarifying assumptions

- k counts preceding people with height greater than or equal to this person's height.
- The returned queue is an array in front-to-back order.
- Input pairs are cloned before sorting.

## Progressive hints

1. Place taller people first; shorter people added later do not count toward a taller person's k.
2. For a person [h,k], insert them at index k among already placed people.
3. Sort equal heights by increasing k so their mutual order is consistent.
4. Verify the final queue by recounting all preceding people at least as tall.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int[][] ReconstructQueue(int[][] people)
    {
        int[][] ordered = people.Select(person => (int[])person.Clone()).ToArray();
        Array.Sort(ordered, (a, b) =>
        {
            int byHeight = b[0].CompareTo(a[0]);
            return byHeight != 0 ? byHeight : a[1].CompareTo(b[1]);
        });

        var queue = new List<int[]>(people.Length);
        foreach (int[] person in ordered)
        {
            if (person[1] < 0 || person[1] > queue.Count)
                throw new ArgumentException("Input constraints are inconsistent.", nameof(people));
            queue.Insert(person[1], new[] { person[0], person[1] });
        }
        return queue.ToArray();
    }

    static bool IsValid(int[][] queue)
    {
        for (int i = 0; i < queue.Length; i++)
        {
            int count = 0;
            for (int j = 0; j < i; j++)
                if (queue[j][0] >= queue[i][0]) count++;
            if (count != queue[i][1]) return false;
        }
        return true;
    }

    static void Check(bool condition, string message)
    {
        if (!condition) throw new Exception(message);
    }

    static void Main()
    {
        int[][] first =
        {
            new[] { 7, 0 }, new[] { 4, 4 }, new[] { 7, 1 },
            new[] { 5, 0 }, new[] { 6, 1 }, new[] { 5, 2 }
        };
        int[][] result = ReconstructQueue(first);
        Check(IsValid(result), "First sample violates a k count.");
        Check(result.Length == 6, "First sample lost people.");
        string actualFirst = string.Join(";", result.Select(person => $"{person[0]},{person[1]}"));
        Check(actualFirst == "5,0;7,0;5,2;6,1;4,4;7,1", "First sample order mismatch.");

        int[][] second =
        {
            new[] { 6, 0 }, new[] { 5, 0 }, new[] { 4, 0 },
            new[] { 3, 2 }, new[] { 2, 2 }, new[] { 1, 4 }
        };
        Check(IsValid(ReconstructQueue(second)), "Second sample violates a k count.");
        Check(IsValid(ReconstructQueue(new[] { new[] { 5, 0 }, new[] { 5, 1 } })), "Equal-height ordering failed.");
        Console.WriteLine("Queue Reconstruction checks passed.");
    }
}
```

## Correctness argument

Process people in nonincreasing height order. When inserting [h,k], all people already placed are at least h tall. Inserting at index k therefore places exactly k already-placed people before them, all counted by the definition. People inserted later are shorter and cannot increase this person's count. For equal heights, sorting by increasing k ensures people with smaller required counts are placed first and later equal-height people follow them; valid input cannot contain incompatible equal-height ordering. By induction, every inserted person has the specified count, and after all insertions the queue satisfies every constraint.

## Step-by-step dry run

For the first example, order by descending height and ascending k: [7,0], [7,1], [6,1], [5,0], [5,2], [4,4]. Insert at each k: [7,0]; then [7,0],[7,1]; then [7,0],[6,1],[7,1]; the shorter people are inserted at positions 0, 2, and 4, producing a valid final queue. Later shorter insertions may shift taller people but do not count as taller in their k conditions.

## Time complexity

Sorting costs O(n log n). List insertion shifts up to O(n) references per person, so total is O(n²), suitable for n<=2,000.

## Space complexity

O(n) for cloned input rows and the output list.

## Alternatives and tradeoffs

- A Fenwick tree of empty positions can place people from shortest to tallest at the (k+1)th available slot in O(n log n). It is faster asymptotically but requires order-statistic selection and careful handling of equal heights.
- An order-statistic balanced tree supports the same rank insertion idea.
- The list insertion method is easier to audit under the supplied limit and makes the taller-first invariant visible.

## Common mistakes and gotchas

- Sorting by height ascending for the insertion-at-k method.
- Sorting equal heights by decreasing k, which can invalidate the number of preceding equal-height people.
- Inserting at k+1 instead of zero-based index k.
- Claiming later shorter people affect a taller person's count; they do not meet the >= height predicate.
- Using a list for much larger n without accounting for O(n²) shifts.

## Edge-case tests

- One person [h,0].
- Equal-height people with increasing k values.
- All people have distinct heights.
- Insert at front (k=0) and at the current end.
- Validate every resulting k by direct recounting.

## Reflection questions

1. Why do later shorter insertions not affect a taller person's k?
2. Why must equal heights be ordered by increasing k?
3. How does a Fenwick tree find the kth empty slot?

## Source

- [Queue Reconstruction by Height](https://leetcode.com/problems/queue-reconstruction-by-height/)
