# backtracking, subsets, permutations, and combinations — Problem: Permutations

## Goals
- Generate all orderings of distinct input values.
- Model permutation construction as a path plus a used-position set.
- Explain why choice order matters here, unlike subset generation.
- Account for the cost of materializing each permutation.

## Problem statement
Given an array of distinct integers, return every possible ordering. Each input value is used exactly once in each output.

## Input constraints

For this exercise the array has 1 to 6 distinct values, each between -10 and 10.

## Examples with expected output
Input: [1,2,3]
Expected output, in any order: [[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]

Input: [0,1]
Expected output: [[0,1],[1,0]]

## Clarifying assumptions
- Values are distinct, so each input position also identifies a unique value.
- Output ordering is irrelevant.
- The input is not mutated.

## Progressive hints
1. A partial path is a prefix of one permutation.
2. At each step, any unused input position is a legal next choice.
3. Mark a position before recursion and unmark it when returning.
4. When path length equals input length, save a copy.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<int>> Permute(int[] nums)
    {
        var result = new List<IList<int>>();
        var path = new List<int>();
        var used = new bool[nums.Length];

        void Search()
        {
            if (path.Count == nums.Length)
            {
                result.Add(new List<int>(path));
                return;
            }

            for (int i = 0; i < nums.Length; i++)
            {
                if (used[i]) continue;
                used[i] = true;
                path.Add(nums[i]);
                Search();
                path.RemoveAt(path.Count - 1);
                used[i] = false;
            }
        }

        Search();
        return result;
    }

    static string Key(IEnumerable<int> values) => string.Join(",", values);

    static void Main()
    {
        var actual = Permute(new[] { 1, 2, 3 }).Select(Key).ToHashSet();
        var expected = new[]
        {
            "1,2,3", "1,3,2", "2,1,3", "2,3,1", "3,1,2", "3,2,1"
        }.ToHashSet();
        if (!actual.SetEquals(expected)) throw new Exception("Three-value permutations mismatch.");

        var pair = Permute(new[] { 0, 1 }).Select(Key).ToHashSet();
        if (!pair.SetEquals(new[] { "0,1", "1,0" })) throw new Exception("Pair permutations mismatch.");
        if (Permute(Array.Empty<int>()).Count != 1) throw new Exception("Empty input has one empty ordering.");
        Console.WriteLine("Permutations checks passed.");
    }
}
```

## Correctness argument
The path contains only positions marked used, and each recursive choice marks one previously unused position, so no permutation repeats a value and no position is used twice. When path length reaches n, all n positions have been selected and the saved path is a valid permutation. Conversely, any target permutation has a first value corresponding to one loop choice, then a second value among the remaining positions, and so on; the search explores that sequence. Thus every permutation is emitted exactly once because values are distinct.

## Step-by-step dry run
With [a,b], the first branch selects a, then b, and emits [a,b]. Backtracking removes b and unmarks its position, then the root branch selects b followed by a and emits [b,a]. Both positions are used in each emitted path.

## Time complexity
There are n! outputs, each containing n values, so materialization takes Θ(n·n!) time. The search also visits partial permutations, which is within that bound.

## Space complexity
The path, used array, and recursion stack use O(n) auxiliary space. Stored output uses Θ(n·n!) space.

## Alternatives and tradeoffs
- In-place swapping avoids a separate used array, but requires careful swap-back restoration and mutates the working array.
- An iterative next-permutation algorithm can enumerate lexicographic permutations after sorting, but it is less direct when the desired output is an unordered collection.
- For streaming consumers, yield each completed path rather than retaining the full result; the underlying enumeration cost remains factorial.

## Common mistakes and gotchas
- Forgetting to unmark a position after recursion blocks later branches.
- Appending a result path without copying it stores multiple references to the same mutable list.
- Treating permutation choices like combination choices and using an increasing start index omits valid orderings.
- An empty input has one permutation: the empty ordering, under the standard recursive definition.

## Edge-case tests
- One value produces one one-element permutation.
- Two distinct values produce two orders.
- Empty defensive input produces one empty result.
- Output count for n distinct values is n!.

## Reflection questions
1. Why does an increasing start index work for combinations but not permutations?
2. How could a bit mask replace the used array, and when would it be practical?
3. What changes when equal values are allowed?

## Source
- [Permutations](https://leetcode.com/problems/permutations/)
