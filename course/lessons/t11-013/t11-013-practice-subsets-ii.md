# backtracking, subsets, permutations, and combinations — Problem: Subsets II

## Goals
- Generate every distinct value-subset when the input can contain repeated values.
- Explain why sorting makes duplicate choices detectable at one search depth.
- Preserve multiple copies of a value when they represent different multiplicities in a subset.
- State output-sensitive time and space costs.

## Problem statement
Given an integer array that may contain duplicate values, return every distinct subset. The empty subset is included. The order of subsets and the order of values within each subset are not significant.

## Input constraints

Input constraints for this exercise: the array length is from 1 through 10 and values are between -10 and 10. A subset may contain a value as many times as it occurs in the input.

## Examples with expected output
Input: [1,2,2]
Expected output (ordering may differ): [[],[1],[1,2],[1,2,2],[2],[2,2]]

Input: [0]
Expected output: [[],[0]]

## Clarifying assumptions
- Equal values are indistinguishable in the result. Selecting the first 2 or the second 2 at the same decision point must not create separate copies of [2].
- Selecting both copies of 2 is valid, so duplicate skipping applies only among sibling choices, not to deeper recursive decisions.
- The input is not modified; the algorithm sorts a copy.

## Progressive hints
1. Think of each recursive call as choosing the next value that will be appended.
2. Sort first so equal values sit next to each other.
3. At one recursion depth, after choosing one representative of a value, skip its remaining equal siblings.
4. Recurse from the next index. A later depth can choose the next equal input occurrence.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<int>> SubsetsWithDup(int[] input)
    {
        int[] values = (int[])input.Clone();
        Array.Sort(values);
        var result = new List<IList<int>>();
        var path = new List<int>();

        void Search(int start)
        {
            result.Add(new List<int>(path));
            for (int i = start; i < values.Length; i++)
            {
                if (i > start && values[i] == values[i - 1])
                    continue;

                path.Add(values[i]);
                Search(i + 1);
                path.RemoveAt(path.Count - 1);
            }
        }

        Search(0);
        return result;
    }

    static string Key(IEnumerable<int> subset) =>
        string.Join(",", subset);

    static void AssertSets(int[] input, params string[] expected)
    {
        var actual = SubsetsWithDup(input).Select(Key).ToHashSet();
        var wanted = expected.ToHashSet();
        if (!actual.SetEquals(wanted))
            throw new Exception($"Mismatch for [{string.Join(",", input)}]: {string.Join(" | ", actual)}");
    }

    static void Main()
    {
        AssertSets(new[] { 1, 2, 2 }, "", "1", "1,2", "1,2,2", "2", "2,2");
        AssertSets(new[] { 0 }, "", "0");
        AssertSets(new[] { -1, -1 }, "", "-1", "-1,-1");
        AssertSets(Array.Empty<int>(), "");
        Console.WriteLine("Subsets II checks passed.");
    }
}
```

## Correctness argument
Every recursive call records the current path, so each reachable subset is emitted. The loop considers each eligible next value. Sorting places duplicates together, and the sibling check chooses only the first occurrence of a value at that depth; this removes duplicate branches that would produce the same value sequence. The recursive call starts at i+1, so later copies remain available at deeper levels. Therefore every valid multiplicity from zero through the input count is represented once, and no value-subset is duplicated.

## Step-by-step dry run
For [1,2,2], the root records []. It chooses 1 and records [1]. At the next depth it chooses the first 2, recording [1,2], and then the remaining 2 at a deeper level, recording [1,2,2]. Returning to the root, the first 2 records [2] and permits [2,2]. The root skips the second 2 because it is an equal sibling choice. Thus the duplicate path is suppressed without losing the two-copy subset.

## Time complexity
There are 2^n index-subsets before duplicate branches are suppressed. Copying each emitted path costs up to O(n), giving O(n·2^n) time as a worst-case bound. Sorting costs O(n log n).

## Space complexity
The recursion and current path use O(n) auxiliary space, excluding output. The output can contain up to 2^n subsets and O(n·2^n) stored values.

## Alternatives and tradeoffs
- A frequency-count approach groups equal values and chooses a count from zero to each group's frequency. It makes multiplicity explicit but needs grouped values and nested generation.
- A set of serialized subsets can remove duplicates after generating all index-subsets, but wastes time and memory and needs a safe canonical representation.
- Sorting the cloned input gives simple sibling detection and deterministic value order while preserving the caller's array.

## Common mistakes and gotchas
- Using i > 0 instead of i > start skips valid copies at deeper levels.
- Skipping every equal value globally prevents subsets containing repeated copies.
- Failing to sort makes equal siblings non-adjacent.
- Reusing the mutable path as an output element causes every result to change during backtracking.
- Sorting the caller's array directly violates the stated non-mutation assumption.

## Edge-case tests
- Empty defensive input returns one empty subset.
- One value returns the empty subset and the singleton.
- Two equal values return exactly three subsets, representing multiplicities zero, one, and two.
- Negative repeated values are handled because the algorithm uses equality and ordering only.

## Reflection questions
1. Why does the duplicate guard compare with i-1 instead of searching all earlier values?
2. What changes if the result must preserve original input order?
3. How would frequency grouping alter the recursion state?

## Source
- [Subsets II](https://leetcode.com/problems/subsets-ii/)
