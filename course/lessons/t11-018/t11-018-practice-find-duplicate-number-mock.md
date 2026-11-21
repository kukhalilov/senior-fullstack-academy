# timed mock interviews and spaced problem rehearsal — Problem: Find the Duplicate Number

## Goals
- Use the value range to model the array as a functional graph.
- Apply Floyd cycle detection without modifying the input or using extra storage.
- Compare the cycle method with value-domain binary search.

## Problem statement
An array contains `n + 1` integers, each from 1 through n, and exactly one distinct value appears more than once. Return that repeated value without modifying the array, using O(1) extra space.

## Input constraints
- Array length is from 2 through 100,000.
- Every value is between 1 and n inclusive.
- Exactly one distinct value repeats; it may appear more than twice.
- Do not modify the input; O(1) auxiliary space is required.

## Examples with expected output
- `[1,3,4,2,2] -> 2`.
- `[3,1,3,4,2] -> 3`.
- `[2,2,2,2,2] -> 2`.

## Clarifying assumptions
- There is one repeated value, but its multiplicity is not necessarily exactly two.
- Array indices are valid nodes `0..n`; values point only to indices `1..n`.
- The returned value is the repeated number, not an index or cycle length.

## Progressive hints
1. A hash set finds a duplicate easily but violates the space bound; sorting changes the array.
2. Treat index `i` as pointing to index `nums[i]`; every node reached has one outgoing edge.
3. The repeated value creates multiple incoming paths that merge into a cycle.
4. Floyd's meeting point is not generally the duplicate itself. Reset one pointer to the start and advance both one step to find the cycle entrance.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int FindDuplicate(int[] nums)
    {
        int slow = nums[0];
        int fast = nums[nums[0]];
        while (slow != fast)
        {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }

        slow = 0;
        while (slow != fast)
        {
            slow = nums[slow];
            fast = nums[fast];
        }
        return slow;
    }

    static void Check(int expected, int[] nums)
    {
        int actual = FindDuplicate(nums);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2, new[] { 1, 3, 4, 2, 2 });
        Check(3, new[] { 3, 1, 3, 4, 2 });
        Check(2, new[] { 2, 2, 2, 2, 2 });
        Check(1, new[] { 1, 1 });
        Check(4, new[] { 4, 3, 1, 4, 2 });
        Console.WriteLine("Find the Duplicate Number checks passed.");
    }
}
```

## Correctness argument
Define `f(i)=nums[i]`. Since every value is a valid index in `1..n`, following `f` from index 0 eventually enters a cycle. The repeated value is the entry node of that cycle: two array positions point to the same value, merging paths into the functional graph. Floyd's first phase finds a meeting inside the cycle. If the distance from the start to cycle entry is μ and the meeting offset in the cycle is k, resetting one pointer to index 0 and advancing both one edge makes them meet after μ steps at the entry. That entry index equals the duplicated value by the array's one-duplicate structure.

## Step-by-step dry run
For `[1,3,4,2,2]`, the function edges from 0 are `0->1->3->2->4->2`, so the cycle is `2->4->2`. Floyd's pointers meet within that cycle. Resetting one to 0 and advancing both one edge at a time meets at 2, the cycle entrance and duplicate.

## Time complexity
O(n) time: both pointer phases traverse at most a linear number of links.

## Space complexity
O(1) auxiliary space.

## Alternatives and tradeoffs
- Binary search over values 1..n: for midpoint `x`, count entries `<=x`; more than x implies the duplicate is in the lower half. O(n log n) time and O(1) space, without mutation.
- Hash set: expected O(n) time but O(n) extra space.
- Sorting: O(n log n), but mutates input unless a copy is made; copying violates O(1) space.
- Floyd's approach relies on the precise range and single-duplicate contract; it is not a general duplicate detector.

## Common mistakes and gotchas
- Returning the first meeting point instead of finding the cycle entrance.
- Using `fast = nums[nums[fast]]` with an invalid initial fast index; this initialization is valid because values lie in `1..n` and length is `n+1`.
- Assuming the duplicate occurs exactly twice.
- Using a set or sorting despite the space/mutation requirements.
- Forgetting that array values serve as next indices in a graph, not as ordered numeric distances.

## Edge-case tests
- Duplicate appears more than twice.
- Smallest length `[1,1]`.
- Duplicate is 1 or n.
- Different input order with same repeated value.

## Reflection questions
1. Why does the value range make every transition a valid index?
2. Why is the cycle entry the duplicated value?
3. How does binary-search counting use the pigeonhole principle?

## Source
- [Find the Duplicate Number](https://leetcode.com/problems/find-the-duplicate-number/)
