# greedy choices, invariants, and correctness proofs — Problem: Hand of Straights

## Goals
- Decide whether every card can be partitioned into consecutive groups of a fixed size.
- Process the smallest remaining card first and consume the forced groups.
- Use an ordered frequency map while handling duplicates and missing values.

## Problem statement
Given integer card values and groupSize, return true if all cards can be rearranged into groups of exactly groupSize consecutive values; otherwise return false.

## Input constraints

- 1 <= hand.Length <= 10,000.
- 0 <= hand[i] <= 1,000,000,000.
- 1 <= groupSize <= hand.Length.

## Examples with expected output

- hand=[1,2,3,6,2,3,4,7,8], groupSize=3 -> true.
- hand=[1,2,3,4,5], groupSize=4 -> false.
- hand=[1,1,2,2,3,3], groupSize=3 -> true.

## Clarifying assumptions

- Every card occurrence must be used exactly once.
- A group contains groupSize distinct consecutive integer values.
- Values may repeat across groups.

## Progressive hints

1. If card count is not divisible by groupSize, the answer is false.
2. Count multiplicities and process values in ascending order.
3. Any remaining copies of the smallest value must begin groups.
4. Consume the same number of each following consecutive value; fail if a value is missing or has too few copies.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static bool IsNStraightHand(int[] hand, int groupSize)
    {
        if (groupSize <= 0) throw new ArgumentOutOfRangeException(nameof(groupSize));
        if (hand.Length % groupSize != 0) return false;

        var counts = new SortedDictionary<int, int>();
        foreach (int card in hand)
            counts[card] = counts.GetValueOrDefault(card) + 1;

        int[] values = counts.Keys.ToArray();
        foreach (int start in values)
        {
            int groups = counts[start];
            if (groups == 0) continue;

            for (int offset = 0; offset < groupSize; offset++)
            {
                long neededValue = (long)start + offset;
                if (neededValue > int.MaxValue) return false;
                int value = (int)neededValue;
                if (!counts.TryGetValue(value, out int available) || available < groups)
                    return false;
                counts[value] = available - groups;
            }
        }
        return true;
    }

    static void Check(bool expected, bool actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(true, IsNStraightHand(new[] { 1, 2, 3, 6, 2, 3, 4, 7, 8 }, 3));
        Check(false, IsNStraightHand(new[] { 1, 2, 3, 4, 5 }, 4));
        Check(true, IsNStraightHand(new[] { 1, 1, 2, 2, 3, 3 }, 3));
        Check(false, IsNStraightHand(new[] { 1, 2, 4, 6 }, 2));
        Check(true, IsNStraightHand(new[] { 7, 7 }, 1));
        Console.WriteLine("Hand of Straights checks passed.");
    }
}
```

## Correctness argument

Process values in ascending order. When value x has remaining multiplicity c, every smaller value has already been fully accounted for, so no future group can use x as a later element of a group starting at a smaller value. Therefore all c copies of x must start groups. Each such group requires one copy of x+1 through x+groupSize-1, so subtracting c copies of each is forced. If any required multiplicity is missing, no valid grouping exists. If all required values exist, these groups are valid and preserve the invariant that all processed cards are assigned. After all values are processed, every card has been consumed; hence the grouping is valid. Divisibility is a necessary early check.

## Step-by-step dry run

For [1,2,3,6,2,3,4,7,8] and size 3, counts are 1:1, 2:2, 3:2, 4:1, 6:1, 7:1, 8:1. The one 1 forces [1,2,3], leaving counts 2:1 and 3:1. That remaining 2 forces [2,3,4]. Then 6 forces [6,7,8]. Every card is used.

## Time complexity

For n cards and u distinct values, building the sorted map and performing the required decrements costs O(n log u) with a balanced tree, plus O(u) to snapshot keys. Each successful group consumes exactly groupSize cards, so the total inner-loop steps are O(n).

## Space complexity

O(u) for the frequency map and ordered key snapshot, excluding input.

## Alternatives and tradeoffs

- Sort the card array and simulate groups. This uses O(n log n) time and can be simpler, but needs a careful way to mark consumed occurrences.
- A hash map plus a separately sorted list of distinct keys can also achieve O(n log u) from sorting keys.
- A queue per value is unnecessary because card occurrences have no identity beyond their count.

## Common mistakes and gotchas

- Checking only total divisibility; required consecutive values may still be absent.
- Starting groups from a larger value before accounting for smaller remaining cards.
- Decrementing just one copy when several identical smallest cards force multiple groups.
- Integer overflow in start+offset if constraints are widened; use a wider intermediate.
- Mutating a dictionary while enumerating its key collection; this solution snapshots keys first.

## Edge-case tests

- groupSize=1 always succeeds for a nonempty hand.
- Card count not divisible by group size fails immediately.
- Duplicate runs require enough copies of every successive value.
- A gap in required consecutive values fails.
- Values near the numeric limit do not wrap during addition.

## Reflection questions

1. Why must every remaining copy of the smallest card start a group?
2. Why is subtracting the same multiplicity from each consecutive value forced?
3. How would a sorted-array implementation represent consumed duplicates?

## Source

- [Hand of Straights](https://leetcode.com/problems/hand-of-straights/)
