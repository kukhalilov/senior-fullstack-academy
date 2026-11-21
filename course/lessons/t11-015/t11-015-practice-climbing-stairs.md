# dynamic programming states, recurrences, and tabulation — Problem: Climbing Stairs

## Goals
- Count ways to reach step n when each move advances one or two steps.
- Define a prefix state and derive its recurrence by the final move.
- Compare memoization, tabulation, and rolling storage.

## Problem statement
There are n steps. From a position you may climb either one or two steps. Return the number of distinct move sequences that reach the top.

## Input constraints
- 1 <= n <= 45.

## Examples with expected output
- n=2 -> 2.
- n=3 -> 3.
- n=1 -> 1.

## Clarifying assumptions
- The order of moves matters: 1+2 and 2+1 are different sequences.
- You must land exactly on the top; overshooting is not allowed.
- A defensive n=0 input has one empty sequence, although it is outside the stated constraints.

## Progressive hints
1. Let ways[i] count move sequences that reach step i.
2. A sequence reaching i ends with a one-step move from i-1 or two-step move from i-2.
3. The two classes are disjoint, so add their counts.
4. Only the previous two values are needed.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int ClimbStairs(int n)
    {
        if (n < 0) throw new ArgumentOutOfRangeException(nameof(n));
        if (n == 0) return 1;
        int twoBack = 1;
        int oneBack = 1;
        for (int step = 2; step <= n; step++)
        {
            int current = oneBack + twoBack;
            twoBack = oneBack;
            oneBack = current;
        }
        return oneBack;
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2, ClimbStairs(2));
        Check(3, ClimbStairs(3));
        Check(1, ClimbStairs(1));
        Check(1, ClimbStairs(0));
        Check(1836311903, ClimbStairs(45));
        Console.WriteLine("Climbing Stairs checks passed.");
    }
}
```

## Correctness argument

Let ways[i] be the number of valid sequences reaching step i. There is one sequence reaching step 0 without moving and one sequence reaching step 1 using a single one-step move. For i>=2, every sequence reaching i has a unique final move: either a one-step move from i-1 or a two-step move from i-2. Removing that final move gives a sequence counted by the corresponding previous state, and the two classes cannot overlap because their final moves differ. Therefore ways[i]=ways[i-1]+ways[i-2]. The loop evaluates this recurrence in increasing order and returns ways[n].

## Step-by-step dry run

For n=4, initialize ways[0]=1 and ways[1]=1. Then ways[2]=2, ways[3]=3, and ways[4]=5. The five sequences are 1+1+1+1, 1+1+2, 1+2+1, 2+1+1, and 2+2.

## Time complexity

O(n) additions.

## Space complexity

O(1) auxiliary space with rolling values. A full table uses O(n).

## Alternatives and tradeoffs

- Top-down memoization directly follows ways[n]=ways[n-1]+ways[n-2], but has O(n) recursion depth and cache storage.
- Matrix exponentiation computes the recurrence in O(log n) arithmetic operations for extremely large n, but is unnecessary for n<=45.
- Naive recursion repeats subproblems and takes exponential time.

## Common mistakes and gotchas

- Setting ways[0]=0 instead of one; the empty sequence is the base construction.
- Counting paths that overshoot the top.
- Forgetting that move order distinguishes sequences.
- Using a 32-bit integer outside the given bound without checking overflow.

## Edge-case tests

- n=1 has one way.
- n=2 has two ways.
- n=0 defensively returns one empty sequence.
- n=45 remains within signed 32-bit range.

## Reflection questions

1. Why are final-move categories disjoint?
2. Why does the empty sequence count as one way at step zero?
3. What would change if allowed moves were 1, 2, or 3 steps?

## Source
- [Climbing Stairs](https://leetcode.com/problems/climbing-stairs/)
